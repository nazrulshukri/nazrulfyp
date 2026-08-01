// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const generatePDF = require("../src/components/pdfgenerator");
const { buildPaymentEmail, buildPaymentEmailText } = require("./templates/paymentEmail");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ transporter (create once)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email transporter error:", error);
  } else {
    console.log("✅ Email transporter ready:", success);
  }
});

// ✅ submit-payment route
app.post("/submit-payment", async (req, res) => {
  const {
    bookingId,
    paymentMethod,
    amount,
    email,
    outboundFlight,
    returnFlight,
    passengerDetails,
    selectedSeats,
    selectedInsurance,
  } = req.body;

  try {
    // ✅ basic validation
    if (!bookingId || !email || !paymentMethod || amount == null) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: bookingId, email, paymentMethod, amount",
      });
    }

    // ✅ Generate PDF Buffer (Node-safe)
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

    const pdfBuffer = await generatePDF(ticketData);
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error("PDF generation failed. Empty buffer.");
    }

    // ✅ Email embedded logo image path (backend assets!)
    const emailLogoPath = path.join(__dirname, "assets", "Booking1.png");
    if (!fs.existsSync(emailLogoPath)) {
      throw new Error("Email logo missing: " + emailLogoPath);
    }
    const imageBuffer = fs.readFileSync(emailLogoPath);

    const emailData = { bookingId, paymentMethod, amount, outboundFlight, returnFlight, passengerDetails, selectedSeats, selectedInsurance };
    const emailContent = buildPaymentEmail(emailData);
    const emailText = buildPaymentEmailText(emailData);

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
          filename: "Booking1.png",
          content: imageBuffer,
          contentType: "image/png",
          cid: "malaysiaLogo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Payment processed and email sent successfully.",
    });
  } catch (error) {
    console.error("❌ submit-payment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message, // ✅ show real error so you can fix quickly
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
