// server/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const { generatePDF } = require("./pdfgenerator.node");

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

    // ✅ Safe fields for email HTML
    const safeLastName = passengerDetails?.lastName || "Customer";
    const safeSeats = Array.isArray(selectedSeats) ? selectedSeats.join(", ") : "-";
    const safeInsurance = selectedInsurance?.name || "No Insurance";

    const emailContent = `
      <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; box-shadow: 0px 4px 8px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; border-bottom: 2px solid #004C97; padding-bottom: 15px; margin-bottom: 15px;">
          <img src="cid:malaysiaLogo" style="width: 120px; height:auto; margin-right: 15px;" />
          <h1 style="color: #004C97; font-size: 22px; margin: 0;">Payment Confirmation</h1>
        </div>

        <p style="font-size: 16px;">Dear <strong>${safeLastName}</strong>,</p>
        <p style="font-size: 14px;">Thank you for your payment. Your booking details are as follows:</p>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="margin: 5px 0;"><strong>📄 Booking ID:</strong> ${bookingId}</p>
          <p style="margin: 5px 0;"><strong>💳 Payment Method:</strong> ${paymentMethod}</p>
          <p style="margin: 5px 0;"><strong>💰 Amount Paid:</strong> MYR ${amount}</p>
        </div>

        <h2 style="color: #004C97; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 5px;">✈️ Flight Details</h2>

        <p><strong>🛫 From:</strong> ${outboundFlight?.origin || "-"}</p>
        <p><strong>🛬 To:</strong> ${outboundFlight?.destination || "-"}</p>
        <p><strong>🎫 Departure Flight:</strong> ${outboundFlight?.flightNumber || "-"} (${outboundFlight?.departure || "-"} to ${outboundFlight?.arrival || "-"})</p>
        <p><strong>🔁 Return Flight:</strong> ${returnFlight?.flightNumber || "-"} (${returnFlight?.departure || "-"} to ${returnFlight?.arrival || "-"})</p>
        <p><strong>💺 Selected Seats:</strong> ${safeSeats}</p>
        <p><strong>🛡️ Insurance:</strong> ${safeInsurance}</p>

        <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd;">
          <p style="font-size: 14px;">If you have any questions, feel free to contact us:</p>
          <p style="font-size: 14px; margin: 5px 0;"><strong>📞 Telephone:</strong> (+60)011-6100-7484 (Malaysia)</p>
          <p style="font-size: 14px; margin: 5px 0;"><strong>📧 Email Us:</strong> Bookingflex@flex.com.my</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Payment Confirmation and Ticket",
      html: emailContent,
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