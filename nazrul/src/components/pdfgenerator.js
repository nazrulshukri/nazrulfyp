import malaysiaLogo from '../img/assets/Malaysiaarilineslogo.png';
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const QRCode = require('qrcode');

const generatePDF = async (ticketData) => {
  const { passengerDetails, outboundFlight } = ticketData;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([648, 320]);

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  

  // ✅ Draw Logo
  page.drawImage(malaysiaLogo, { x: 40, y: 210, width: 80, height: 50 });

  // ✅ Add headings
  page.drawText('BOARDING PASS', { x: 250, y: 240, size: 18, font: helveticaBold });

  // ✅ Passenger Details
  page.drawText(`Passenger: ${passengerDetails.firstName} ${passengerDetails.lastName}`, { x: 40, y: 160, size: 12, font: helvetica });
  page.drawText(`Flight No: ${outboundFlight.flightNumber}`, { x: 40, y: 140, size: 12, font: helvetica });
  page.drawText(`From: ${outboundFlight.origin} ---- To: ${outboundFlight.destination}`, { x: 40, y: 120, size: 12, font: helvetica });
  page.drawText(`Date: 08 March 2025  Time: 02:00 AM`, { x: 40, y: 100, size: 12, font: helvetica });
  page.drawText(`Seat: A8,A9,B6  Gate: B3`, { x: 40, y: 80, size: 12, font: helvetica });

  // ✅ Generate and Embed QR Code
  const qrCodeData = `Name: ${passengerDetails.firstName} ${passengerDetails.lastName} | Flight: ${outboundFlight.flightNumber} | Seat: ${outboundFlight.seat}`;
  const qrImageBuffer = await QRCode.toBuffer(qrCodeData, { errorCorrectionLevel: 'H' });
  const qrImage = await pdfDoc.embedPng(qrImageBuffer);

  // Draw QR Code
  page.drawImage(qrImage, { x: 450, y: 30, width: 80, height: 80 });

  // ✅ Save and Return PDF
  return await pdfDoc.save();
};

module.exports = { generatePDF };





