require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const { generatePDF } = require('../src/components/pdfgenerator');
console.log(typeof generatePDF); // Should print 'function'
const getStream = require('get-stream');
const { default: HotelPaymentMethod } = require('../src/components/hotelpaymentmethod');


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
mongoose.connect('mongodb+srv://muhdnazrul:Nazrul_123@cluster0.e7c4d.mongodb.net/Bookingflight?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log(err));

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

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
    zip: { type: String, required: true },
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
    zip: { type: String, required: true },
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
app.post('/signup', async (req, res) => {
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
app.post('/signin', async (req, res) => {
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

    // Remove the check for existing hotel in the database

    // Create a new hotel booking entry
    const newHotelBooking = new Hotel({
      id,
      hotelName,
      checkInDate,
      checkOutDate,
      price,
      location,
    });

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
    paymentDetails,
    email, // Ensure email is received in the request
    outboundFlight,
    returnFlight,
    passengerDetails,
    selectedSeats,
    selectedInsurance,
  } = req.body;

  try {
    // Prepare data for PDF
    const ticketData = {
      bookingId,
      paymentMethod,
      amount,
      outboundFlight,
      returnFlight,
      passengerDetails,
      selectedSeats,
      selectedInsurance,
    };

    // 🔥 Generate PDF using generatePDF function
    const pdfBuffer = await generatePDF(ticketData);
if (!pdfBuffer || pdfBuffer.length === 0) {
  throw new Error("PDF generation failed. Buffer is empty.");
}

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Set in .env file
        pass: process.env.EMAIL_PASS, // Set in .env file
      },
    });

    // Email content
    const emailContent = `
      <h1>Payment Confirmation</h1>
      <p>Dear ${passengerDetails.lastName},</p>
      <p>Thank you for your payment.</p>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p><strong>Amount Paid:</strong> MYR${amount}</p>
      <h2>Flight Details</h2>
      <p><strong>Departure Flight:</strong> ${outboundFlight.flightNumber} (${outboundFlight.departure} to ${outboundFlight.arrival})</p>
      <p><strong>Return Flight:</strong> ${returnFlight.flightNumber} (${returnFlight.departure} to ${returnFlight.arrival})</p>
      <p><strong>Selected Seats:</strong> ${selectedSeats.join(', ')}</p>
      <p><strong>Insurance:</strong> ${selectedInsurance.name}</p>
      <p>If you have any questions, feel free to contact us.</p>
      <p>Telephone: (+60)011-6100-7484 (Malaysia)</p>
      <p>Email Us: Bookingflex@flex.com.my</p>
    `;

    // Email options with PDF attachment
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Payment Confirmation and Ticket',
      html: emailContent,
      attachments: [
        {
          content: Buffer.from(pdfBuffer), // ✅ Ensures correct format
          contentType: "application/pdf",
        },
      ],
    };

    // 📧 Send email
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

  try {
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

  try {
    // Create a new document from the HotelPayment model
    const newPayment = new HotelPayment({
      hotelName,
      hotellocation: location, // Use `location` instead of `hotellocation`
      checkInDate,
      checkOutDate,
      price: totalPrice,
      people,
      userData,
      paymentMethod,
      status, // This could be 'Completed' or any status you provide
    });

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
  const newBooking = new Booking({ startDate, returnDate, location, location1, people, bookingType });
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
    if (!outboundFlight || !returnFlight || !passengerDetails || !totalAmount) {
      throw new Error('Missing required fields in request body');
    }

    // Find the user by email to get their ObjectId
    const user = await User.findOne({ email: passengerDetails.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new booking
    const newBooking = new Booking({
      startDate: outboundFlight.departure,
      returnDate: returnFlight.arrival,
      location: outboundFlight.origin,
      location1: returnFlight.destination,
      people: passengerDetails ? 1 : 0,
      bookingType: 'Flight',
    });
    const savedBooking = await newBooking.save();

    // Create payment record using the appropriate data from the request
    const payment = new Payment({
      userId: user._id, // Now using the ObjectId of the user
      bookingId: savedBooking._id,
      amount: totalAmount.total,
      paymentMethod: 'Pending', // Set a default method
      paymentDetails: {
        selectedSeats, // Can be an empty array if no seats are selected
        insurance: selectedInsurance || false, // Include selected insurance
        outboundFlight,
        returnFlight,
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
app.post('/forgotpassword', async (req, res) => {
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

  const newFlightResult = new FlightResults({
    id,
    airline,
    flightNumber,
    departure,
    arrival,
    price,
    origin,
    destination,
    nonStop,
  });

  try {
    const savedFlightResult = await newFlightResult.save();
    res.status(201).json(savedFlightResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/flightreturn', async (req, res) => {
  const { id, airline, flightNumber, departure, arrival, price, origin, destination, nonStop } = req.body;

  const newFlightreturn = new Flightreturn({
    id,
    airline,
    flightNumber,
    departure,
    arrival,
    price,
    origin,
    destination,
    nonStop,
  });

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



// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
