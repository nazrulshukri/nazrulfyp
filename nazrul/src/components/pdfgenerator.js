const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

const generatePDF = async (ticketData) => {
  const {
    bookingId,
    paymentMethod,
    amount,
    outboundFlight,
    returnFlight,
    passengerDetails,
    selectedSeats,
    selectedInsurance,
  } = ticketData;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  // Load fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Load images
  const logoBytes = fs.readFileSync(__dirname + '/../img/assets/BOOKING (4).png');
  const seatIconBytes = fs.readFileSync(__dirname + '/../img/assets/pdf/seat.png');
  const boardingIconBytes = fs.readFileSync(__dirname + '/../img/assets/pdf/boarding.png');

  // Embed images in the PDF
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const seatIconImage = await pdfDoc.embedPng(seatIconBytes);
  const boardingIconImage = await pdfDoc.embedPng(boardingIconBytes);

  // Draw Airline Logo
  page.drawImage(logoImage, { x: 50, y: 730, width: 80, height: 70 });
  page.drawText('BOARDING PASS', { x: 400, y: 750, size: 20, font: helveticaBold, color: rgb(0, 0, 0.8) });
  page.drawText('e-Ticket', { x: 400, y: 730, size: 20, font: helveticaBold, color: rgb(0, 0, 0.8) });
  
  // Passenger Information
  page.drawText(`${passengerDetails.firstName} ${passengerDetails.lastName}`, { x: 50, y: 720, size: 16, font: helveticaBold });
  page.drawText("You're ready to fly", { x: 50, y: 700, size: 12, font: helvetica });

  // Flight Information
  const departureTime = new Date(outboundFlight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const arrivalTime = new Date(outboundFlight.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  const flightDate = new Date(outboundFlight.departure).toLocaleDateString();
  const flightDate1 = new Date(outboundFlight.arrival).toLocaleDateString();

  page.drawRectangle({ x: 50, y: 530, width: 500, height: 150, borderColor: rgb(0, 0, 1), borderWidth: 2, color: rgb(1, 1, 1) });
  page.drawText('FLIGHT INFORMATION', { x: 180, y: 660, size: 14, font: helveticaBold, color: rgb(0, 0, 0) });

  page.drawText(`Flight No: ${outboundFlight.flightNumber}`, { x: 80, y: 640, size: 12, font: helveticaBold });
  page.drawText(`From: ${outboundFlight.origin} (${outboundFlight.originCode || 'N/A'})`, { x: 80, y: 620, size: 12, font: helveticaBold });
  page.drawText(`To: ${outboundFlight.destination} (${outboundFlight.destinationCode || 'N/A'})`, { x: 80, y: 600, size: 12, font: helveticaBold });
  page.drawText(`Departure: ${departureTime}, ${flightDate}`, { x: 80, y: 580, size: 12, font: helveticaBold });
  page.drawText(`Arrival: ${arrivalTime}, ${flightDate1}`, { x: 80, y: 560, size: 12, font: helveticaBold });

  // Seat Information
  page.drawImage(seatIconImage, { x: 50, y: 470, width: 20, height: 20 });
  page.drawText('Seat:', { x: 70, y: 475, size: 12, font: helveticaBold });
  page.drawText(selectedSeats[0].toString(), { x: 100, y: 475, size: 12, font: helvetica });

  // Boarding Time
  page.drawImage(boardingIconImage, { x: 340, y: 470, width: 20, height: 20 });
  page.drawText('Boarding Time:', { x: 365, y: 475, size: 12, font: helveticaBold });
  page.drawText('08:35', { x: 460, y: 475, size: 12, font: helvetica });

  // Important Notice Box
  page.drawRectangle({ x: 50, y: 400, width: 500, height: 50, borderColor: rgb(1, 0, 0), borderWidth: 1, color: rgb(1, 0.9, 0.9) });
  page.drawText('Your passport and/or visa(s) must be checked at the airport', { x: 60, y: 430, size: 12, font: helveticaBold, color: rgb(1, 0, 0) });
  page.drawText("Please bring your documents for verification. Please see a Malaysia Airlines representative.", { x: 60, y: 420, size: 10, font: helvetica });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  console.log("PDF generated successfully, size:", pdfBytes.length); // Debugging
  // fs.writeFileSync('boarding_pass.pdf', pdfBytes);
  return pdfBytes;
};

module.exports = { generatePDF };