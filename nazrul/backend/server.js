const crypto = require('crypto');
const path = require('path');
require('dotenv').config();
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const bwipjs = require('bwip-js');
//  const { generatePDF } = require('../src/components/pdfgenerator');
// // const { generatePDF } = require("./pdfgenerator");
// console.log("generatePDF type:", typeof generatePDF); // should be 'function'
// console.log(typeof generatePDF); // Should print 'function'
// firebase-admin is optional (only needed for Google/Facebook sign-in).
let admin = null;
try {
  admin = require("firebase-admin");
} catch (error) {
  console.warn('firebase-admin is not installed; social sign-in is disabled.');
}
const { buildPaymentEmail, buildPaymentEmailText } = require('./templates/paymentEmail');
const { buildTicketEmail, buildTicketPdf } = require('./ticketKit');
const chatRouter = require('./chat');
const liveRouter = require('./live');
const ratesRouter = require('./rates');
const { ordersRouter, adminRouter } = require('./orders');
const adminDbRouter = require('./admindb');
const { socialRouter, socialPublicRouter } = require('./social');
const { messagingRouter, messagingPublicRouter } = require('./messaging');
const { newsRouter } = require('./news');
// const { default: HotelPaymentMethod } = require('../src/components/hotelpaymentmethod');


const app = express();
// Social dashboard accepts photos (resized in the browser), so it gets a
// larger body limit than the rest of the API.
// CORS first: the browser's preflight check must get permission before any
// route (including the signed-in /social routes) answers.
app.use(cors());

// Last line of defence: log a stray async error instead of letting it stop
// the whole server (which would break sign-in for everyone).
process.on('unhandledRejection', (error) => console.error('Unhandled error:', error));
// Every route waits for the database first (Vercel cold starts can receive a
// request before the connection is ready).
app.use(async (req, res, next) => {
  try {
    await ensureDb();
  } catch {
    /* routes report the database state themselves */
  }
  next();
});
app.use('/social', express.json({ limit: '2mb' }), socialPublicRouter, socialRouter);
app.use(express.json());

// AI travel assistant (streams replies; see chat.js).
app.use('/chat', chatRouter);
// Live trains, flights and flight status for the Track page (see live.js).
app.use('/live', liveRouter);
// Exchange rates and visitor country for the currency picker (see rates.js).
app.use('/rates', ratesRouter);
// Bookings for My trips and the admin dashboard (see orders.js).
app.use('/orders', ordersRouter);
// Chat and voice/video call signalling between friends (see messaging.js).
app.use('/messages', messagingPublicRouter, messagingRouter);
// News, vouchers and live travel headlines (see news.js).
app.use('/news', newsRouter);
app.use('/admin/db', adminDbRouter);
app.use('/admin', adminRouter);


const loadImageAsBytes = async (imageUrl) => {
  const response = await fetch(imageUrl);
  return await response.arrayBuffer();
};

// Email. EMAIL_USER / EMAIL_PASS log in to the mail account that sends.
// EMAIL_HOST / EMAIL_PORT pick any SMTP provider (Gmail, Outlook, Zoho,
// Brevo, your own domain…); without them Gmail is used.
// EMAIL_FROM sets what travellers see, e.g. "BookingFlex <tickets@yourdomain.com>",
// and EMAIL_REPLY_TO where their replies go.
// Set EMAIL_DRY_RUN=true to build emails without sending them (useful for testing).
const smtpPort = Number(process.env.EMAIL_PORT) || 587;
const transporter = process.env.EMAIL_DRY_RUN === 'true'
  ? nodemailer.createTransport({ jsonTransport: true })
  : nodemailer.createTransport(
    process.env.EMAIL_HOST
      ? {
        host: process.env.EMAIL_HOST,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      }
      : { service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } },
  );
const MAIL_FROM = process.env.EMAIL_FROM || `BookingFlex <${process.env.EMAIL_USER}>`;
const MAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || undefined;

// Lets other routers (e.g. friend invites in social.js) send email.
app.locals.sendMail = (options) => transporter.sendMail({ from: MAIL_FROM, replyTo: MAIL_REPLY_TO, ...options });

// Debugging
transporter.verify((error, success) => {
  if (error) {
    console.log('Error with transporter:', error);
  } else {
    console.log('Transporter is ready to send emails:', success);
  }
});



// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI
  || process.env.MONGO_URI
  || process.env.MONGO_URL
  || process.env.DATABASE_URL;

// One shared connection attempt at a time; if it fails or the connection
// drops, the next request tries again (instead of staying broken until the
// server restarts). Atlas free clusters can take a few seconds to answer.
let mongoPending = null;
function ensureDb(timeoutMs = 8000) {
  if (!MONGODB_URI) return Promise.resolve(false);
  const state = mongoose.connection.readyState; // 0 off, 1 on, 2 connecting, 3 closing
  if (state === 1) return Promise.resolve(true);
  if (!mongoPending) {
    mongoPending = (state === 2
      ? mongoose.connection.asPromise()
      : mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: timeoutMs, maxPoolSize: 10 }))
      .then(() => console.log('Connected to MongoDB'))
      .catch((err) => console.error(`MongoDB connection failed: ${err.message}`))
      .finally(() => {
        mongoPending = null;
      });
  }
  return Promise.race([mongoPending, new Promise((r) => setTimeout(r, timeoutMs))]).then(
    () => mongoose.connection.readyState === 1,
  );
}
ensureDb();
if (!MONGODB_URI) console.warn('MongoDB not configured. Add MONGODB_URI to backend/.env.');

const isMongoReady = () => mongoose.connection.readyState === 1;

const requireMongoConnection = (req, res, next) => {
  if (isMongoReady()) {
    return next();
  }

  return res.status(503).json({
    message: MONGODB_URI
      ? 'MongoDB is not connected yet. Please try again after the backend logs "Connected to MongoDB".'
      : 'MongoDB is not configured. Add MONGODB_URI to backend/.env.',
  });
};

const sendPersistenceSkipped = (res, resourceName, data) => {
  res.status(202).json({
    saved: false,
    message: `${resourceName} was not saved because MongoDB is not connected. Add MONGODB_URI to backend/.env to persist data.`,
    data,
  });
};

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set; using an insecure default. Add JWT_SECRET to backend/.env and Vercel.');
}
const SESSION_TTL = '7d';

const getFirebaseCredential = () => {
  if (!admin) return null;
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : path.join(__dirname, "serviceAccountKey.json");

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    return admin.credential.cert(serviceAccount);
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.applicationDefault();
  }

  return null;
};

const initializeFirebaseAdmin = () => {
  const credential = getFirebaseCredential();

  if (!credential) {
    console.warn(
      "Firebase Admin not configured. Add backend/serviceAccountKey.json or set FIREBASE_SERVICE_ACCOUNT_PATH / FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY."
    );
    return false;
  }

  if (!admin.apps.length) {
    admin.initializeApp({ credential });
  }

  return true;
};

const firebaseAdminReady = initializeFirebaseAdmin();

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: { type: String },
  resetTokenExpiration: { type: Date },
});

const User = mongoose.model('User', UserSchema);

// Booking Schema
const BookingSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  returnDate: { type: Date, required: true },
  location: { type: String, required: true },
  location1: { type: String, required: true },
  people: { type: Number, required: true },
  bookingType: { type: String, required: true },
});

const Booking = mongoose.model('Booking', BookingSchema);

// Payment Schema
const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, required: true },
  paymentMethod: { type: String, required: true },
  paymentDetails: {
    type: Object,
    required: true,
    // You can define more structure if needed
  },
  insurance: { type: Boolean, default: false }, // Field to indicate if insurance was selected
  selectedSeats: { type: [String], default: [] } // Array to hold selected seat identifiers
});

const Payment = mongoose.model('Payment', paymentSchema);

// Inquiry Schema
const InquirySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
});

const Inquiry = mongoose.model('Inquiry', InquirySchema);

// FlightResults Schema
const FlightResultsSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  airline: { type: String, required: true },
  flightNumber: { type: String, required: true },
  departure: { type: Date, required: true },
  arrival: { type: Date, required: true },
  price: { type: Number, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  nonStop: { type: Boolean, required: true },
});

const FlightResults = mongoose.model('FlightResults', FlightResultsSchema);

const Flightreturnschema = new mongoose.Schema({
  id: { type: Number, required: true },
  airline: { type: String, required: true },
  flightNumber: { type: String, required: true },
  departure: { type: Date, required: true },
  arrival: { type: Date, required: true },
  price: { type: Number, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  nonStop: { type: Boolean, required: true },
});

const Flightreturn = mongoose.model('flightreturn', Flightreturnschema);


// Hotel Schema
const hotelSchema = new mongoose.Schema({
  id: { type: String, required: true },
  hotelName: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  price: { type: Number, required: true },
  location: { type: String, required: true },
});

// Create a model from the schema
const Hotel = mongoose.model('Hotel', hotelSchema);



// Hotelform
const Hotelformschema = new mongoose.Schema({
  hotelName: { type: String, required: true },
  hotellocation: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  price: { type: Number, required: true },
  people: { type: Number, required: true },
  userData: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, default: '' },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    specialRequests: { type: String },
    arrivalTime: { type: String },
  },
});

// Create a model from the schema
const Hotelform = mongoose.model('Hotelform', Hotelformschema);


const hotelpaymentmethodSchema = new mongoose.Schema({
  hotelName: { type: String, required: true },
  hotellocation: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  price: { type: Number, required: true },
  people: { type: Number, required: true },
  userData: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, default: '' },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    specialRequests: { type: String },
    arrivalTime: { type: String },
  },
  paymentMethod: { type: String, required: true },  // Added field for payment method
  status: { type: String, default: 'Pending' }, // Default value 'Pending', can be updated to 'Completed'
});

// Create a model from the schema
const HotelPayment = mongoose.model('HotelPayment', hotelpaymentmethodSchema);


const Paymentmenu = new mongoose.Schema({
  amount: { type: Number, required: true },
  email: { type: String, required: true }, // Using email as identifier
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true }, // Reference to the Booking model
  paymentMethod: { type: String, required: true }, // e.g., 'paypal', 'card', 'fpx'
  status: { type: String, required: true }, // e.g., 'Confirmed'
  paymentDetails: {
    type: Object,
    required: true,
    default: {}, // Default to an empty object for additional payment details
  },
  insurance: { type: Boolean, default: false }, // Indicates if insurance was selected
  selectedSeats: { type: [String], default: [] }, // Array to store selected seat numbers

  // New fields for flight details
  outboundFlight: {
    airline: { type: String, required: true },
    arrival: { type: Date, required: true },
    departure: { type: Date, required: true },
    destination: { type: String, required: true },
    flightNumber: { type: String, required: true },
    id: { type: Number, required: true }, // Ensure this is correctly typed
    nonStop: { type: Boolean, required: true },
    origin: { type: String, required: true },
    price: { type: Number, required: true },
  },
  
  returnFlight: {
    airline: { type: String, required: true },
    arrival: { type: Date, required: true },
    departure: { type: Date, required: true },
    destination: { type: String, required: true },
    flightNumber: { type: String, required: true },
    id: { type: Number, required: true },
    nonStop: { type: Boolean, required: true },
    origin: { type: String, required: true },
    price: { type: Number, required: true },
  },
  
  passengerDetails: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
});
const Payment1 = mongoose.model('Payment1', Paymentmenu);

const paymenthorizontal = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Booking' },
  paymentMethod: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true }, // e.g., 'Confirmed'
  paymentDetails: { type: Object, default: {} }, // For extra details like card info
  insurance: { type: Boolean, default: false },
  selectedSeats: { type: [String], default: [] },
  outboundFlight: { type: Object, default: {} },
  returnFlight: { type: Object, default: {} },
  passengerDetails: { type: Object, default: {} },
});

const Paymentez = mongoose.model('Paymentez', paymenthorizontal);

const trainpaymentschema = new mongoose.Schema({
  trainId: String,
  origin: String,
  destination: String,
  departureTime: String,
  totalPrice: Number,
  paymentMethod: String,
  cardNumber: String,
  expiryDate: String,
  cvv: String,
  paymentStatus: { type: String, default: 'Pending' },
  
});

const paymentmethodtrain = mongoose.model('PaymentTrain', trainpaymentschema);
module.exports = Payment;





// Function to create a user folder
const createUserFolder = async (userId) => {
  const userFolderPath = path.join(__dirname, 'users', userId.toString());
  if (!fs.existsSync(userFolderPath)) {
    try {
      fs.mkdirSync(userFolderPath, { recursive: true });
      console.log(`Folder created at ${userFolderPath}`);
    } catch (error) {
      console.error(`Error creating folder: ${error.message}`);
    }
  } else {
    console.log(`Folder already exists at ${userFolderPath}`);
  }
};

// ---------- Accounts ----------
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Older accounts may have been saved with capital letters, so match case-insensitively.
const findUserByEmail = (email) =>
  User.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, 'i') });
const publicUser = (user) => ({ email: user.email, name: user.name || '' });
const issueSession = (user) => ({
  token: jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: SESSION_TTL }),
  user: publicUser(user),
});

// Sign in with a one-time code sent by email. Works with any provider
// (Gmail, Yahoo, Outlook/Hotmail, iCloud…) and also lets accounts created by
// a booking, which have no password, get in by proving they own the email.
const NO_PASSWORD = ['FIREBASE', 'EXTERNAL_PAYMENT_USER', 'EMAIL_CODE'];
const LoginCodeSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, index: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });
LoginCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // MongoDB deletes expired codes
const LoginCode = mongoose.models.LoginCode || mongoose.model('LoginCode', LoginCodeSchema);
const hashCode = (email, code) => crypto.createHash('sha256').update(`${email}:${code}:${JWT_SECRET}`).digest('hex');

app.post('/auth/email-code', requireMongoConnection, async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  try {
    const recent = await LoginCode.find({ email, createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) } }).sort({ createdAt: -1 }).lean();
    if (recent[0] && Date.now() - new Date(recent[0].createdAt).getTime() < 45 * 1000) {
      return res.status(429).json({ message: 'We just sent a code. Please wait a moment before asking for another.' });
    }
    if (recent.length >= 5) return res.status(429).json({ message: 'Too many codes requested. Try again in an hour.' });

    const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
    await LoginCode.create({ email, codeHash: hashCode(email, code), expiresAt: new Date(Date.now() + 10 * 60 * 1000) });
    await transporter.sendMail({
      from: MAIL_FROM,
      replyTo: MAIL_REPLY_TO,
      to: email,
      subject: `${code} is your BookingFlex sign-in code`,
      text: `Your BookingFlex sign-in code is ${code}. It expires in 10 minutes. If you didn't ask for it, you can ignore this email.`,
      html: `<p>Your BookingFlex sign-in code is</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>It expires in 10 minutes. If you didn't ask for it, you can ignore this email.</p>`,
    });
    res.json({ sent: true, message: `We sent a 6-digit code to ${email}.` });
  } catch (err) {
    console.error('Email code error:', err.message);
    res.status(502).json({ message: "We couldn't send the code right now. Please try again." });
  }
});

app.post('/auth/email-code/verify', requireMongoConnection, async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const code = String(req.body.code || '').replace(/\D/g, '');
  const name = String(req.body.name || '').trim().slice(0, 80);
  if (!EMAIL_RE.test(email) || code.length !== 6) return res.status(400).json({ message: 'Enter the 6-digit code from the email.' });
  try {
    const entry = await LoginCode.findOne({ email, expiresAt: { $gt: new Date() } }).sort({ createdAt: -1 });
    if (!entry) return res.status(400).json({ message: 'That code has expired. Ask for a new one.' });
    if (entry.attempts >= 5) return res.status(429).json({ message: 'Too many wrong tries. Ask for a new code.' });
    const expected = Buffer.from(entry.codeHash, 'hex');
    const given = Buffer.from(hashCode(email, code), 'hex');
    if (!crypto.timingSafeEqual(expected, given)) {
      entry.attempts += 1;
      await entry.save();
      return res.status(400).json({ message: "That code isn't right. Check the email and try again." });
    }
    await LoginCode.deleteMany({ email });
    let user = await findUserByEmail(email);
    if (!user) {
      user = await User.create({ email, name, password: 'EMAIL_CODE' });
      await createUserFolder(user._id);
    } else if (name && !user.name) {
      user.name = name;
      await user.save();
    }
    res.json({ message: 'Signed in.', ...issueSession(user) });
  } catch (err) {
    console.error('Email code verify error:', err.message);
    res.status(500).json({ message: 'Could not sign you in. Please try again.' });
  }
});

app.post('/signup', requireMongoConnection, async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  const name = String(req.body.name || '').trim().slice(0, 80);
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      const placeholder = NO_PASSWORD.includes(existing.password) && existing.password !== 'FIREBASE';
      return res.status(409).json({
        message: placeholder
          ? 'This email already has a BookingFlex account without a password. Use "Email me a sign-in code" to get in.'
          : 'An account with this email already exists. Try signing in.',
      });
    }
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    await createUserFolder(user._id);
    res.status(201).json({ message: 'Account created.', ...issueSession(user) });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Could not create your account. Please try again.' });
  }
});

app.post('/signin', requireMongoConnection, async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  if (!email || !password) return res.status(400).json({ message: 'Enter your email and password.' });
  try {
    const user = await findUserByEmail(email);
    const noPassword = user && NO_PASSWORD.includes(user.password);
    const valid = user && !noPassword && (await bcrypt.compare(password, user.password));
    if (!valid) {
      const hint =
        user && user.password === 'FIREBASE'
          ? ' This account was made with Google: use "Continue with Google", or "Forgot password?" to add a password.'
          : noPassword
            ? ' This account has no password yet: use "Email me a sign-in code", or "Forgot password?" to add one.'
            : '';
      return res.status(401).json({ message: `Incorrect email or password.${hint}` });
    }
    res.json({ message: 'Signed in.', ...issueSession(user) });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ message: 'Could not sign you in. Please try again.' });
  }
});

// Where password-reset links point. Never taken from request headers, which
// an attacker could forge to send someone a reset link to their own site.
const appUrl = () =>
  process.env.APP_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

// POST route to save hotel booking data to MongoDB
app.post('/save-hotel', async (req, res) => {
  console.log('Received hotel data:', req.body);  // Log the incoming request data
  try {
    const { id, hotelName, checkInDate, checkOutDate, price, location } = req.body;
    const hotelData = { id, hotelName, checkInDate, checkOutDate, price, location };

    if (!isMongoReady()) {
      return sendPersistenceSkipped(res, 'Hotel selection', hotelData);
    }

    // Remove the check for existing hotel in the database

    // Create a new hotel booking entry
    const newHotelBooking = new Hotel(hotelData);

    // Log the data being saved
    console.log('Saving new hotel booking to MongoDB:', newHotelBooking);

    // Save the hotel booking to the database
    const savedBooking = await newHotelBooking.save();
    
    // Log successful saving
    console.log('Hotel booking saved successfully:', savedBooking);
    
    // Send the saved booking as the response
    res.status(201).json(savedBooking);  
  } catch (err) {
    // Log any errors that occur
    console.error('Error saving hotel to database:', err);
    res.status(500).json({ error: err.message });
  }
});



app.post('/submit-payment', async (req, res) => {
  const { bookingId, paymentMethod, amount, email } = req.body;

  try {
    if (!bookingId || !email || !paymentMethod || amount == null) {
      return res.status(400).send({
        success: false,
        message: 'Missing required fields: bookingId, email, paymentMethod, amount.',
      });
    }

    // Boarding-pass style email with the PDF e-ticket attached.
    const mail = await buildTicketEmail('flight', req.body);
    await transporter.sendMail({
      from: MAIL_FROM,
      replyTo: MAIL_REPLY_TO,
      to: email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: mail.attachments,
    });
    console.log('Flight e-ticket emailed to:', email);

    res.send({
      success: true,
      reference: mail.reference,
      message: 'Payment processed and e-ticket emailed.',
    });
  } catch (error) {
    console.error('Error processing payment or sending email:', error);
    res.status(500).send({
      success: false,
      message: 'Payment recorded, but the e-ticket email could not be sent.',
    });
  }
});

// Send (or re-send) a ticket email for any booking type.
app.post('/send-ticket', async (req, res) => {
  const { kind = 'flight', email, booking } = req.body || {};
  if (!['flight', 'train', 'hotel'].includes(kind) || !email || !booking) {
    return res.status(400).json({ success: false, message: 'kind, email and booking are required.' });
  }
  try {
    const mail = await buildTicketEmail(kind, booking);
    await transporter.sendMail({
      from: MAIL_FROM,
      replyTo: MAIL_REPLY_TO,
      to: email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: mail.attachments,
    });
    console.log(`${kind} ticket emailed to:`, email);
    res.json({ success: true, reference: mail.reference });
  } catch (error) {
    console.error('Error sending ticket email:', error);
    res.status(500).json({ success: false, message: 'The ticket email could not be sent.' });
  }
});

// Download the ticket PDF for any booking type.
app.post('/ticket-pdf', async (req, res) => {
  const { kind = 'flight', booking } = req.body || {};
  if (!['flight', 'train', 'hotel'].includes(kind) || !booking) {
    return res.status(400).json({ message: 'kind and booking are required.' });
  }
  try {
    const pdf = await buildTicketPdf(kind, booking);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="BookingFlex-ticket.pdf"');
    res.send(pdf);
  } catch (error) {
    console.error('Error building ticket PDF:', error);
    res.status(500).json({ message: 'Could not build the ticket PDF.' });
  }
});


app.post('/hotelform', async (req, res) => {
  const {
    hotelName, checkInDate, checkOutDate, price, hotellocation, people, userData
  } = req.body;
  const hotelFormData = { hotelName, checkInDate, checkOutDate, price, hotellocation, people, userData };

  try {
    if (!isMongoReady()) {
      return sendPersistenceSkipped(res, 'Hotel details', hotelFormData);
    }

    // Create a new hotel booking document
    const newHotelBooking = new Hotelform({
      hotelName,
      checkInDate,
      checkOutDate,
      price,
      hotellocation,
      people,
      userData: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        address: userData.address,
        city: userData.city,
        zip: userData.zip,
        country: userData.country,
        phone: userData.phone,
        specialRequests: userData.specialRequests,
        arrivalTime: userData.arrivalTime,
      },
    });
    // Save the booking data to the database
    const savedBooking = await newHotelBooking.save();
    
    // Respond with the saved booking
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Error saving hotel booking:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/hotelpaymentmethod', async (req, res) => {
  const {
    hotelName,
    location,
    totalPrice,
    checkInDate,
    checkOutDate,
    people,
    userData,
    paymentMethod,
    status,
  } = req.body;
  const hotelPaymentData = {
    hotelName,
    hotellocation: location,
    checkInDate,
    checkOutDate,
    price: totalPrice,
    people,
    userData,
    paymentMethod,
    status,
  };

  try {
    if (!isMongoReady()) {
      return sendPersistenceSkipped(res, 'Hotel payment', hotelPaymentData);
    }

    // Create a new document from the HotelPayment model
    const newPayment = new HotelPayment(hotelPaymentData);

    // Save the document to MongoDB
    await newPayment.save();

    // Respond with success
    res.status(200).json({ message: 'Payment data saved successfully' });
  } catch (error) {
    console.error('Error saving payment:', error);
    res.status(500).json({ message: 'Failed to save payment data' });
  }
});



app.post('/paymentnew', async (req, res) => { // Ensure lowercase endpoint to match frontend
  const {
    bookingId,
    paymentMethod,
    amount,
    status,
    paymentDetails,
    insurance,
    selectedSeats,
    outboundFlight,
    returnFlight,
    passengerDetails,
  } = req.body;

  console.log("Received payment data:", req.body); // For debugging

  try {
    const newPayment = new Paymentez({
      bookingId,
      paymentMethod,
      amount,
      status,
      email,
      paymentDetails,
      insurance,
      selectedSeats,
      outboundFlight,
      returnFlight,
      passengerDetails,
    });

    const savedPayment = await newPayment.save();
    res.status(201).json({ success: true, message: 'Payment saved successfully', paymentId: savedPayment._id });
  } catch (error) {
    console.error('Error saving payment:', error); // Log error for debugging
    res.status(500).json({ success: false, message: 'Failed to save payment', error: error.message });
  }
});

// Train schema
const trainSchema = new mongoose.Schema({
  LineID: String,
  details: String,
  price: Number,
  totalPrice: Number,
  departureTime: String,
  arrivalTime: String,
  origin: String,
  destination: String,
  startDate: String,
  returnDate: String,
});

// Train model
const Train = mongoose.model('Train', trainSchema);


const trainBookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  telephone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  trainDetails: { type: String },
  departureTime: { type: String },
  origin: { type: String },
  destination: { type: String },
  price: { type: Number },
  totalPrice: { type: Number },
  trainId: { type: mongoose.Schema.Types.ObjectId },
});

const TrainBooking = mongoose.model('TrainBooking', trainBookingSchema);


// Booking route
app.post('/bookings', async (req, res) => {
  const { startDate, returnDate, location, location1, people, bookingType } = req.body;
  const bookingData = { startDate, returnDate, location, location1, people, bookingType };

  if (!isMongoReady()) {
    return sendPersistenceSkipped(res, 'Booking', bookingData);
  }

  const newBooking = new Booking(bookingData);

  try {
    const savedBooking = await newBooking.save();
    res.status(201).json(savedBooking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inquiry submission route
app.post('/inquiries', async (req, res) => {
  const { name, email, phone, message } = req.body;
  const newInquiry = new Inquiry({ name, email, phone, message });

  try {
    const savedInquiry = await newInquiry.save();
    res.status(201).json(savedInquiry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/process-payment', async (req, res) => {
  const { outboundFlight, returnFlight, passengerDetails, selectedSeats, totalAmount, selectedInsurance } = req.body;

  try {
    if (!outboundFlight || !passengerDetails || !totalAmount) {
      throw new Error('Missing required fields in request body');
    }

    if (!isMongoReady()) {
      return res.status(202).json({
        success: true,
        saved: false,
        bookingId: `TEMP-${Date.now()}`,
        message: 'Booking can continue. MongoDB is not connected, so this pre-payment record was not saved.',
      });
    }

    // Find the user by email to get their ObjectId
    let user = await User.findOne({ email: passengerDetails.email });
    if (!user) {
      user = await User.create({
        email: passengerDetails.email,
        password: 'EXTERNAL_PAYMENT_USER',
      });
    }

    const returnLeg = returnFlight && Object.keys(returnFlight).length ? returnFlight : null;
    const totalValue = typeof totalAmount === 'object' ? totalAmount.total : totalAmount;

    // Create a new booking
    const newBooking = new Booking({
      startDate: outboundFlight.departure,
      returnDate: returnLeg?.arrival || outboundFlight.arrival || outboundFlight.departure,
      location: outboundFlight.origin,
      location1: returnLeg?.destination || outboundFlight.destination,
      people: passengerDetails ? 1 : 0,
      bookingType: 'Flight',
    });
    const savedBooking = await newBooking.save();

    // Create payment record using the appropriate data from the request
    const payment = new Payment({
      userId: user._id, // Now using the ObjectId of the user
      bookingId: savedBooking._id,
      amount: totalValue,
      paymentMethod: 'Pending', // Set a default method
      paymentDetails: {
        selectedSeats, // Can be an empty array if no seats are selected
        insurance: selectedInsurance || false, // Include selected insurance
        outboundFlight,
        returnFlight: returnLeg,
        totalAmount,
      },
      status: 'pending', // Set status to pending until payment is processed
    });
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully!',
      bookingId: savedBooking._id, // Return booking ID to frontend
    });
  } catch (error) {
    console.error('Payment processing error:', error.message);
    res.status(500).json({ success: false, message: 'Payment failed.', error: error.message });
  }
});



// // 🚀 PDF Generator Function (if not in pdfgenerator1.js)
// const generatePDF = (payment) => {
//   return new Promise((resolve, reject) => {
//     const doc = new PDFDocument();
//     let buffers = [];

//     doc.on('data', buffers.push.bind(buffers));
//     doc.on('end', () => {
//       const pdfData = Buffer.concat(buffers);
//       resolve(pdfData);
//     });

//     // PDF Content
//     doc.fontSize(16).text(`Ticket for Booking ID: ${payment.bookingId}`);
//     doc.text(`Passenger: ${payment.passengerDetails.firstName} ${payment.passengerDetails.lastName}`);
//     doc.text(`Amount Paid: MYR${payment.amount}`);
//     doc.text(`Payment Method: ${payment.paymentMethod}`);
//     doc.text(`Departure Flight: ${payment.outboundFlight.flightNumber} (${payment.outboundFlight.departure} to ${payment.outboundFlight.arrival})`);
//     doc.text(`Return Flight: ${payment.returnFlight.flightNumber} (${payment.returnFlight.departure} to ${payment.returnFlight.arrival})`);
//     doc.text(`Selected Seats: ${payment.selectedSeats.join(', ')}`);
//     doc.text(`Insurance: ${payment.selectedInsurance.name}`);
//     doc.end();
//   });
// };

// // ✅ Correct Export
// module.exports = { generatePDF };

// Forgot password: always answers the same way so it doesn't reveal which emails have accounts.
app.post(['/forgotpassword', '/forgot-password'], requireMongoConnection, async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const reply = { message: 'If an account exists for that email, we’ve sent a link to reset your password.' };
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  try {
    const user = await findUserByEmail(email);
    // Accounts made with Google, by a booking or by a sign-in code have no
    // password yet; the reset email lets them add one (they still prove they
    // own the email by opening the link).
    if (!user) return res.json(reply);

    const resetToken = jwt.sign({ userId: user._id, purpose: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();

    const resetLink = `${appUrl()}/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: MAIL_FROM,
      replyTo: MAIL_REPLY_TO,
      to: user.email,
      subject: 'Reset your BookingFlex password',
      text: `Hi${user.name ? ` ${user.name}` : ''},\n\nUse this link to choose a new password (valid for 1 hour):\n${resetLink}\n\nIf you didn't ask for this, you can ignore this email.`,
      html: `<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#133634">
        <p style="font-size:22px;font-weight:800;margin:0 0 18px">booking<span style="color:#7aa33a;font-weight:400">flex.</span></p>
        <h1 style="font-size:22px;margin:0 0 10px">Reset your password</h1>
        <p style="font-size:15px;line-height:1.6;color:#2b4c47">Hi${user.name ? ` ${user.name}` : ''}, tap the button below to choose a new password. The link works for 1 hour.</p>
        <p style="margin:24px 0"><a href="${resetLink}" style="background:#1d4a3f;color:#d9ef7d;padding:13px 22px;border-radius:12px;text-decoration:none;font-weight:700">Choose a new password</a></p>
        <p style="font-size:13px;color:#6b7f7a">If you didn't ask for this, you can ignore this email.</p></div>`,
    });
    res.json(reply);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Could not send the reset email. Please try again.' });
  }
});

app.post('/reset-password', requireMongoConnection, async (req, res) => {
  const { token } = req.body;
  const password = String(req.body.password || '');
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });
  try {
    const payload = jwt.verify(String(token || ''), JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user || user.resetToken !== token || !user.resetTokenExpiration || user.resetTokenExpiration < Date.now()) {
      throw new Error('stale');
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.json({ message: 'Password updated.', ...issueSession(user) });
  } catch (error) {
    res.status(400).json({ message: 'This reset link is invalid or has expired. Request a new one.' });
  }
});

// Flight ticket sending route
app.post('/send-flight-ticket', async (req, res) => {
  const { email, ticketDetails } = req.body;

  try {
    // Validate ticket details
    if (!email || !ticketDetails) {
      return res.status(400).send('Invalid email or ticket details.');
    }

    // Create email content with flight ticket details
    const mailOptions = {
      from: MAIL_FROM,
      replyTo: MAIL_REPLY_TO,
      to: email,
      subject: 'Your Flight Ticket',
      text: `Thank you for booking with us! Here are your flight ticket details:

Flight: ${ticketDetails.flightNumber}
Passenger Name: ${ticketDetails.passengerName}
Date: ${ticketDetails.date}
Time: ${ticketDetails.time}
Seat: ${ticketDetails.seat}
Price: ${ticketDetails.price}

Safe travels!
      `,
      // Optional: Attach a ticket file (e.g., PDF)
      attachments: ticketDetails.pdfPath
        ? [
            {
              filename: 'ticket.pdf',
              path: ticketDetails.pdfPath, // Path to the PDF file
            },
          ]
        : [],
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    res.send({ message: 'Flight ticket sent successfully.' });
  } catch (error) {
    console.error('Error sending flight ticket email:', error);
    res.status(500).send('Error sending flight ticket email. Please try again.');
  }
});



  

// FlightResults route
// Endpoint to save flight results
// FlightResults route
app.post('/flightresults', async (req, res) => {
  const { id, airline, flightNumber, departure, arrival, price, origin, destination, nonStop } = req.body;
  const flightResultData = {
    id,
    airline,
    flightNumber,
    departure,
    arrival,
    price,
    origin,
    destination,
    nonStop,
  };

  if (!isMongoReady()) {
    return sendPersistenceSkipped(res, 'Flight result', flightResultData);
  }

  const newFlightResult = new FlightResults(flightResultData);

  try {
    const savedFlightResult = await newFlightResult.save();
    res.status(201).json(savedFlightResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/flightreturn', async (req, res) => {
  const { id, airline, flightNumber, departure, arrival, price, origin, destination, nonStop } = req.body;
  const flightReturnData = {
    id,
    airline,
    flightNumber,
    departure,
    arrival,
    price,
    origin,
    destination,
    nonStop,
  };

  if (!isMongoReady()) {
    return sendPersistenceSkipped(res, 'Return flight', flightReturnData);
  }

  const newFlightreturn = new Flightreturn(flightReturnData);

  try {
    const savedFlightResult = await newFlightreturn.save();
    res.status(201).json(savedFlightResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to save selected train details
app.post('/selectTrain', async (req, res) => {
  try {
    const { selectedTrain } = req.body;
    const newTrain = new Train(selectedTrain);
    await newTrain.save();
    res.status(200).send('Train selected successfully');
  } catch (err) {
    res.status(500).send('Error saving train');
  }
});


app.post('/bookTrain', async (req, res) => {
  try {
    const { name, telephone, email, address, trainDetails, departureTime, origin,destination, price, totalPrice, trainId } = req.body;

    // Create new train booking
    const newBooking = new TrainBooking({
      name,
      telephone,
      email,
      address,
      trainDetails,
      departureTime,
      origin,
      destination,
      price,
      totalPrice,
      trainId
    });

    await newBooking.save();

    res.status(200).send({ message: 'Booking successful!', booking: newBooking });
  } catch (error) {
    res.status(500).send({ message: 'Error storing booking', error });
  }
});


app.post('/trainsubmit-payment', async (req, res) => {
  const { trainId, origin, destination, departureTime, totalPrice, paymentMethod } = req.body;
  // Card numbers and CVVs are never stored.
  const record = {
    trainId,
    origin,
    destination,
    departureTime,
    totalPrice,
    paymentMethod,
    paymentStatus: 'Success',
  };

  try {
    if (!isMongoReady()) {
      return res.status(202).json({ ...record, saved: false });
    }
    const savedPayment = await new paymentmethodtrain(record).save();
    res.status(201).json(savedPayment);
  } catch (err) {
    console.error('Error saving train payment:', err);
    res.status(400).json({ message: 'Error processing payment' });
  }
});

// Google / Facebook sign-in through Firebase. Uses Firebase Admin when it is
// configured, otherwise checks the ID token's signature against Google's
// published keys (the method Firebase documents for third-party servers).
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID;
const GOOGLE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
let googleCerts = { keys: null, expires: 0 };

async function verifyFirebaseIdToken(idToken) {
  if (firebaseAdminReady) return admin.auth().verifyIdToken(idToken);
  if (!FIREBASE_PROJECT_ID) throw new Error('Firebase project id is not configured');
  if (!googleCerts.keys || Date.now() > googleCerts.expires) {
    const response = await fetch(GOOGLE_CERTS_URL);
    const maxAge = Number((/max-age=(\d+)/.exec(response.headers.get('cache-control') || '') || [])[1] || 3600);
    googleCerts = { keys: await response.json(), expires: Date.now() + maxAge * 1000 };
  }
  const decodedHeader = jwt.decode(idToken, { complete: true });
  const cert = decodedHeader && googleCerts.keys[decodedHeader.header.kid];
  if (!cert) throw new Error('Unknown signing key');
  const payload = jwt.verify(idToken, cert, {
    algorithms: ['RS256'],
    audience: FIREBASE_PROJECT_ID,
    issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
  });
  if (!payload.sub) throw new Error('Token has no subject');
  return payload;
}

app.post('/auth/firebase', requireMongoConnection, async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'Missing ID token' });
  try {
    const decoded = await verifyFirebaseIdToken(idToken);
    const email = normalizeEmail(decoded.email);
    if (!email) return res.status(400).json({ message: 'Your Google account has no email address.' });
    let user = await findUserByEmail(email);
    if (!user) user = await User.create({ email, name: decoded.name || '', password: 'FIREBASE' });
    else if (!user.name && decoded.name) {
      user.name = decoded.name;
      await user.save();
    }
    res.json(issueSession(user));
  } catch (err) {
    console.error('Firebase authentication error:', err.message);
    res.status(401).json({ message: 'Google sign-in could not be verified. Please try again.' });
  }
});

app.get('/generate-barcode', async (req, res) => {
  try {
    const { text } = req.query; // Get bookingId from query parameter

    if (!text) {
      return res.status(400).send("Missing text parameter for barcode.");
    }

    // ✅ Generate barcode using `bwip-js`
    bwipjs.toBuffer(
      {
        bcid: 'code128', // Barcode type
        text: text, // Booking ID
        scale: 3, 
        height: 10, 
        includetext: true, 
        textxalign: 'center',
      },
      (err, pngBuffer) => {
        if (err) {
          console.error("Barcode generation error:", err);
          return res.status(500).send("Failed to generate barcode.");
        }

        // ✅ Send barcode as an image
        res.setHeader('Content-Type', 'image/png');
        res.send(pngBuffer);
      }
    );
  } catch (error) {
    console.error("Error generating barcode:", error);
    res.status(500).send("Server error.");
  }
});

// Node.js Express

app.get('/api/suggest', (req, res) => {
  const { q } = req.query;
  const suggestions = [
    q,
    `flights to ${q}`,
    `cheap ${q} flights`,
    `${q} travel deals`,
  ];
  res.json({ suggestions });
});
// Start the server
const PORT = process.env.PORT || 5001;

// Run a normal server locally (`node server.js`); on Vercel the app is
// imported by api/index.js and served as a serverless function instead.
if (require.main === module) {
  const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the existing server or run with PORT=5010 node server.js.`);
      process.exit(1);
    }

    console.error('Server startup error:', err);
    process.exit(1);
  });
}

module.exports = app;

