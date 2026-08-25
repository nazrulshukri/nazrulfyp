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
const pdfMod = require("../src/components/pdfgenerator");
const admin = require("firebase-admin");
const generatePDF = pdfMod.generatePDF || pdfMod.default || pdfMod;
const getStream = require('get-stream');
const { buildPaymentEmail, buildPaymentEmailText } = require('./templates/paymentEmail');
// const { default: HotelPaymentMethod } = require('../src/components/hotelpaymentmethod');


const app = express();
app.use(express.json());
app.use(cors());


const loadImageAsBytes = async (imageUrl) => {
  const response = await fetch(imageUrl);
  return await response.arrayBuffer();
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
    

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

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error(`MongoDB connection failed: ${err.message}`));
} else {
  console.warn('MongoDB not configured. Add MONGODB_URI to backend/.env.');
}

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

const getFirebaseCredential = () => {
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

// Signup route
app.post('/signup', requireMongoConnection, async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    await createUserFolder(newUser._id);

    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Signin route
app.post('/signin', requireMongoConnection, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, message: 'Sign-in successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
  const {
    bookingId,
    paymentMethod,
    amount,
    email, // Ensure email is received
    outboundFlight,
    returnFlight,
    passengerDetails,
    selectedSeats,
    selectedInsurance,
  } = req.body;

  try {
    if (!bookingId || !email || !paymentMethod || amount == null) {
      return res.status(400).send({
        success: false,
        message: 'Missing required fields: bookingId, email, paymentMethod, amount.',
      });
    }

    // ✅ Generate PDF
    const ticketData = { bookingId, paymentMethod, amount, outboundFlight, returnFlight, passengerDetails, selectedSeats, selectedInsurance };
    const pdfBuffer = await generatePDF(ticketData);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF generation failed. Buffer is empty.");
    }

    // ✅ Read Malaysia Airlines logo image
    const imagePath = path.join(__dirname, '../src/img/assets/Booking1.png');
    if (!fs.existsSync(imagePath)) {
      throw new Error('Error: Image file not found at ' + imagePath);
    }
    const imageBuffer = fs.readFileSync(imagePath);

    const emailData = { bookingId, paymentMethod, amount, outboundFlight, returnFlight, passengerDetails, selectedSeats, selectedInsurance };
    const emailContent = buildPaymentEmail(emailData);
    const emailText = buildPaymentEmailText(emailData);

    // ✅ Email options with **PDF & Image attachment**
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `BookingFlex payment confirmed - ${bookingId}`,
      html: emailContent,
      text: emailText,
      attachments: [
        {
          filename: `Bookingflex_${bookingId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
        {
          filename: 'BookingFlexLogo.png',
          content: imageBuffer,
          contentType: "image/png",
          cid: 'malaysiaLogo', // ✅ Embeds image in email
        },
      ],
    };

    // ✅ Send email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);

    res.send({
      success: true,
      message: 'Payment processed and email sent successfully.',
    });
  } catch (error) {
    console.error('Error processing payment or sending email:', error);
    res.status(500).send({
      success: false,
      message: 'Failed to process payment or send email.',
    });
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

// Forgot password route
app.post('/forgotpassword', requireMongoConnection, async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send('User not found.');

    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();

    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `To reset your password, click the link: ${resetLink}`,
    };

    await transporter.sendMail(mailOptions);
    res.send({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    res.status(500).send('Error sending email. Please try again.');
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
      from: process.env.EMAIL_USER,
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
  const { trainId, origin, destination, departureTime, totalPrice, paymentMethod, cardDetails } = req.body;

  const newPayment = new paymentmethodtrain({
    trainId,
    origin,
    destination,
    departureTime,
    totalPrice,
    paymentMethod,
    cardNumber: cardDetails.cardNumber,
    expiryDate: cardDetails.expiryDate,
    cvv: cardDetails.cvv,
    paymentStatus: 'Success', // Simulating payment success
    
  });

  try {
    const savedPayment = await newPayment.save();
    res.status(201).json(savedPayment);
  } catch (err) {
    res.status(400).json({ message: 'Error processing payment', error: err });
  }
});

app.post("/auth/firebase", requireMongoConnection, async (req, res) => {
  console.log("🔥 /auth/firebase endpoint called");

  try {
    if (!firebaseAdminReady) {
      return res.status(503).json({
        message: "Firebase Admin is not configured on the server.",
      });
    }

    const { idToken } = req.body;

    if (!idToken) {
      console.log("❌ No ID token received");
      return res.status(400).json({ message: "Missing ID token" });
    }

    console.log("🔍 Verifying Firebase token...");

    const decoded = await admin.auth().verifyIdToken(idToken);
    console.log("✅ Firebase token verified:", decoded.email);

    const email = decoded.email;

    // find or create user in Mongo
    let user = await User.findOne({ email });

    if (!user) {
      console.log("🆕 Creating new Mongo user for:", email);
      user = await User.create({ email, password: "FIREBASE" });
    } else {
      console.log("👤 Existing Mongo user:", email);
    }

    // issue your JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

    console.log("🎟️ JWT issued for:", email);

    res.json({ token });

  } catch (err) {
    console.error("❌ Firebase authentication error:", err.message);
    res.status(401).json({ message: "Invalid Firebase token" });
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
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing server or run with PORT=5010 node server.js.`);
    process.exit(1);
  }

  console.error('Server startup error:', err);
  process.exit(1);
});

