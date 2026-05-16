const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require("fs");
const path = require("path");

// Function to load an image as a Uint8Array
function loadLocalImageBytes(relativePathFromThisFile) {
  const absPath = path.join(__dirname, relativePathFromThisFile);
  return fs.readFileSync(absPath); // Buffer (works with pdf-lib embedPng)
}

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
  const logoBytes = loadLocalImageBytes("../img/assets/BOOKING (4).png");
const seatIconBytes = loadLocalImageBytes("../img/assets/pdf/seat.png");
const boardingIconBytes = loadLocalImageBytes("../img/assets/pdf/boarding.png");

  // Embed images in the PDF
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const seatIconImage = await pdfDoc.embedPng(seatIconBytes);
  const boardingIconImage = await pdfDoc.embedPng(boardingIconBytes);

  // Draw Airline Logo
  page.drawImage(logoImage, {
    x: 50,
    y: 730,
    width: 80,
    height: 70,
  });
  page.drawText('BOARDING PASS', { x: 400, y: 750, size: 20, font: helveticaBold, color: rgb(0, 0, 0.8) });
  page.drawText('e-Ticket', { x: 400, y: 730, size: 20, font: helveticaBold, color: rgb(0, 0, 0.8) });
  // Passenger Information
  page.drawText(`${passengerDetails.firstName} ${passengerDetails.lastName}`, { x: 50, y: 720, size: 16, font: helveticaBold });
  page.drawText("You're ready to fly", { x: 50, y: 700, size: 12, font: helvetica });

  // Create a container for Flight Information
 // Flight Information Rectangle
// Draw Rectangle for Flight Information
// Load images for flight information icons
const flightIconBytes = loadLocalImageBytes("../img/assets/Ticket/Flighnumber.png");
const fromIconBytes = loadLocalImageBytes("../img/assets/Ticket/1093885-200.png");
const toIconBytes = loadLocalImageBytes("../img/assets/Ticket/366-3667927_flight-arrival-airport-airplane-flight-arrival-icon-png.png");
const dateIconBytes = loadLocalImageBytes("../img/assets/Ticket/png-clipart-computer-icons-calendar-date-others-miscellaneous-calendar-thumbnail.png");
const BagdropBytes = loadLocalImageBytes("../img/assets/Ticket/belt_4268056.png");
const walkingdead = loadLocalImageBytes("../img/assets/Ticket/walkingscene.png");
const securityguard = loadLocalImageBytes("../img/assets/Ticket/images.png");
const luggage = loadLocalImageBytes("../img/assets/Ticket/travel_15303637.png");
const suitcase = loadLocalImageBytes("../img/assets/Ticket/813779.png");
const gate = loadLocalImageBytes("../img/assets/pdf/gate (1).png");
const Airlinename = loadLocalImageBytes("../img/assets/Ticket/BOOKING (7).png");
const timeflight = loadLocalImageBytes("../img/assets/Ticket/BOOKING (6).png");
const Malaysiaarilineslogo = loadLocalImageBytes("../img/assets/Malaysiaarilineslogo.png");

// Embed images in the PDF
const flightIcon = await pdfDoc.embedPng(flightIconBytes);
const fromIcon = await pdfDoc.embedPng(fromIconBytes);
const toIcon = await pdfDoc.embedPng(toIconBytes);
const dateIcon = await pdfDoc.embedPng(dateIconBytes);
const Bagdrop = await pdfDoc.embedPng(BagdropBytes);
const walkingscene = await pdfDoc.embedPng(walkingdead);
const luggage1 = await pdfDoc.embedPng(luggage);
const ggimage = await pdfDoc.embedPng(securityguard);
const suitcase1 = await pdfDoc.embedPng(suitcase);
const gate1 = await pdfDoc.embedPng(gate);
const Airlinename1 = await pdfDoc.embedPng(Airlinename);
const timeflight1 = await pdfDoc.embedPng(timeflight);
const malaysiaLogo = await pdfDoc.embedPng(Malaysiaarilineslogo);
 // Create a container for Flight Information
 // Flight Information Rectangle
// Draw Rectangle for Flight Information
// Assuming `outboundFlight` is already defined and contains the relevant data

// Extract and format the departure and arrival times
const departureTime = new Date(outboundFlight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
const arrivalTime = new Date(outboundFlight.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
const flightDate = new Date(outboundFlight.departure).toLocaleDateString(); // Assuming the flight date is the same as the departure date
const flightDate1 = new Date(outboundFlight.arrival).toLocaleDateString(); // Assuming the flight date is the same as the departure date

// Create a container for Flight Information
// Flight Information Rectangle
// Create a container for Flight Information
page.drawRectangle({
  x: 50,
  y: 530,
  width: 500,
  height: 150,
  borderColor: rgb(0, 0, 1), // Blue border
  borderWidth: 2,
  color: rgb(1, 1, 1), // No fill color
});

// Flight Information Title
page.drawText('FLIGHT INFORMATION', { x: 180, y: 660, size: 14, font: helveticaBold, color: rgb(0, 0, 0) });

const imageX = 450;
const imageY = 580;
const imageSize = 60;
const centerX = imageX + imageSize / 2;
const centerY = imageY + imageSize / 2;
const radius = imageSize / 2;

// Draw the circular blue border only (no fill)
page.drawCircle({
  x: centerX,
  y: centerY,
  size: radius,
  borderWidth: 2,
  borderColor: rgb(0, 0, 1), // Blue color for border
  color: rgb(1, 1, 1, 0), // Transparent fill (no color inside)
});

// Draw the image (center it within the circular frame)
page.drawImage(malaysiaLogo, {
  x: imageX + 10, // Offset to center within the frame
  y: imageY + 10,
  width: imageSize - 20,
  height: imageSize - 20,
  clip: true, // If supported, this will crop the image to fit within the circle
});

// Draw a circular frame around the image to give the illusion of a circle




// Flight Information in a Vertical Layout with Icons
const flightInfoY = 620; // Starting Y position for flight info
const flightInfoX = 80; // X position for labels
const flightValueX = 150; // X position for values
const iconOffsetX = 20; // Horizontal offset for icons


//ariline
page.drawImage(Airlinename1, { x: flightInfoX - iconOffsetX, y: 640, width: 15, height: 15 });
page.drawText('Airline Name :', { x: 80, y: 640, size: 12, font: helveticaBold });
page.drawText(outboundFlight.airline.toString(), { x: 180, y: 640, size: 12, font: helvetica });

// Flight No
page.drawImage(flightIcon, { x: flightInfoX - iconOffsetX, y: flightInfoY - 5, width: 15, height: 15 });
page.drawText('Flight No:', { x: flightInfoX, y: flightInfoY, size: 12, font: helveticaBold });
page.drawText(outboundFlight.flightNumber.toString(), { x: 180, y: flightInfoY, size: 12, font: helvetica });

// From
page.drawImage(fromIcon, { x: flightInfoX - iconOffsetX, y: flightInfoY - 25, width: 15, height: 15 });
page.drawText('From:', { x: flightInfoX, y: flightInfoY - 20, size: 12, font: helveticaBold });
page.drawText(`${outboundFlight.origin} (${outboundFlight.originCode || 'N/A'})`, { x: flightValueX, y: flightInfoY - 20, size: 12, font: helvetica });

// To
page.drawImage(toIcon, { x: flightInfoX - iconOffsetX, y: flightInfoY - 45, width: 15, height: 15 });
page.drawText('To:', { x: flightInfoX, y: flightInfoY - 40, size: 12, font: helveticaBold });
page.drawText(`${outboundFlight.destination} (${outboundFlight.destinationCode || 'N/A'})`, { x: flightValueX, y: flightInfoY - 40, size: 12, font: helvetica });

// Combined Departure and Arrival Times with Flight Date
// page.drawImage(timeflight1, { x: flightInfoX - iconOffsetX, y: flightInfoY - 45, width: 15, height: 15 });
// page.drawImage(timeflight1, { x: flightInfoX - iconOffsetX, y: flightInfoY - 45, width: 15, height: 15 });
const iconOffsetX2 = 20; // Adjust the X offset if needed
const iconOffsetY = 5;  // Adjust the Y offset to align with text if needed

// Draw Departure Time icon and text
page.drawImage(timeflight1, { x: flightInfoX - iconOffsetX2, y: flightInfoY - 65, width: 15, height: 15 }); // Adjust Y and size as needed
page.drawText(`Departure Time: ${departureTime}, Departure Date: ${flightDate}`, {
  x: flightInfoX,
  y: flightInfoY - 60, // Adjust the Y position to match the icon
  size: 12,
  font: helvetica
});

// Draw Arrival Time icon and text
page.drawImage(timeflight1, { x: flightInfoX - iconOffsetX2, y: flightInfoY - 85, width: 15, height: 15 }); // Adjust Y and size as needed
page.drawText(`Arrival Time: ${arrivalTime}, Arrival Date: ${flightDate1}`, {
  x: flightInfoX,
  y: flightInfoY - 80, // Adjust the Y position to match the icon
  size: 12,
  font: helvetica
});



  // Seat
  page.drawImage(seatIconImage, {
    x: 50,
    y: 470,
    width: 20,
    height: 20,
  });
  page.drawText('Seat:', { x: 70, y: 475, size: 12, font: helveticaBold });
  page.drawText(selectedSeats[0].toString(), { x: 100, y: 475, size: 12, font: helvetica });

  page.drawImage(gate1, {
    x: 120,
    y: 470,
    width: 20,
    height: 20,
  });
   page.drawText('Gate:', { x: 145, y: 475, size: 12, font: helveticaBold });
   page.drawText('A', { x: 180, y: 475, size: 12, font: helvetica });

   page.drawText('Zone:', { x: 200 , y: 475, size: 12, font: helveticaBold });
   page.drawText('GRP4', { x: 235, y: 475, size: 12, font: helvetica });
  page.drawText('Class:', { x: 280, y: 475, size: 12, font: helveticaBold });
   page.drawText('Y', { x: 320, y: 475, size: 12, font: helvetica });
  // page.drawText('Gate:', { x: 90, y: 475, size: 12, font: helveticaBold });
  // page.drawText(selectedSeats[0].toString(), { x: 150, y: 475, size: 12, font: helvetica });

  page.drawText('Details', { x: 60, y: 510, size: 12, font: helveticaBold });
  page.drawText('------------------------------------------------------------------------------------------------------------------', { x: 60, y: 500, size: 12, font: helveticaBold });

  // Boarding Time
  page.drawImage(boardingIconImage, {
    x: 340,
    y: 470,
    width: 20,
    height: 20,
  });
  page.drawText('Boarding Time:', { x: 365, y: 475, size: 12, font: helveticaBold });
  page.drawText('08:35', { x: 460, y: 475, size: 12, font: helvetica });

  // Important Notice Box
  page.drawRectangle({
    x: 50,
    y: 400,
    width: 500,
    height: 50,
    borderColor: rgb(1, 0, 0),
    borderWidth: 1,
    color: rgb(1, 0.9, 0.9),
  });
  page.drawText('Your passport and/or visa(s) must be checked at the airport', { x: 60, y: 430, size: 12, font: helveticaBold, color: rgb(1, 0, 0) });
  page.drawText("Please bring your documents for verification. Please see a Malaysia Airlines representative.", { x: 60, y: 420, size: 10, font: helvetica });

  page.drawText('Next Steps', { x: 60, y: 380, size: 12, font: helveticaBold });
  page.drawText('------------------------------------------------------------------------------------------------------------------', { x: 60, y: 370, size: 12, font: helveticaBold });

  // Baggage, Security, and Boarding Times
  page.drawImage(Bagdrop, { x: 50, y: 350, width: 15, height: 15 });
  page.drawText('Bag Drop', { x: 70, y: 350, size: 10, font: helveticaBold });
  page.drawText('Opens: 05:00', { x: 120, y: 350, size: 10, font: helvetica });

  page.drawImage(walkingscene, { x: 270, y: 350, width: 15, height: 15 });
  page.drawText('Boarding', { x: 300, y: 355, size: 10, font: helveticaBold });
  page.drawText('Please report to the boarding gate no later than 06:30.', { x: 300, y: 340, size: 10, font: helvetica });

  page.drawImage(ggimage, { x: 50, y: 330, width: 15, height: 15 });
  page.drawText('Security', { x: 80, y: 330, size: 10, font: helveticaBold });
  page.drawText('Allow enough to get through ', { x: 120, y: 330, size: 10, font: helvetica });
  page.drawText('departure (security) so you  ', { x: 120, y: 320, size: 10, font: helvetica });
  page.drawText('can arrive at your gate on time  ', { x: 120, y: 310, size: 10, font: helvetica });
  // page.drawText('------------------------------------------------------------------------------------------------------------------', { x: 60, y: 280, size: 12, font: helveticaBold });

  // page.drawText('Boarding', { x: 400, y: 370, size: 10, font: helveticaBold });
  // page.drawText('At: 08:35', { x: 440, y: 300, size: 10, font: helvetica });

  // Baggage Allowance Section

  page.drawImage(luggage1, { x: 50, y: 290, width: 15, height: 15 });
  page.drawText('Luggage:', { x: 70, y: 290, size: 10, font: helveticaBold });
  page.drawText('1 item (max 32kg)', { x: 130, y: 290, size: 10, font: helvetica });

  page.drawImage(suitcase1, { x: 270, y: 310, width: 15, height: 15 });
   page.drawText('Carry on dimension:', { x: 300, y: 320, size: 10, font: helveticaBold });
  // First line
  page.drawText('Height x Width x Length= 56cm', { x: 300, y: 310, size: 10, font: helvetica });

  // Second line, move down by adjusting the y-coordinate
  page.drawText('x 23cm x 36cm Weight 7kg', { x: 300, y: 300, size: 10, font: helvetica });

  page.drawText('TRAVEL INFORMATION', { x: 50, y: 250, size: 10, font: helvetica });
  page.drawText('------------------------------------------------------------------------------------------------------------------', { x: 50, y: 240, size: 12, font: helveticaBold });

  page.drawText('Security requirements', { x: 50, y: 230, size: 10, font: helvetica });
  page.drawText('1. Ensure that your baggage is in your possession at all times.', { x: 50, y: 220, size: 10, font: helvetica });
  page.drawText('2. You must be aware of the contents in your baggage', { x: 50, y: 210, size: 10, font: helvetica });
  page.drawText('3. You need to be aware of the classified goods not permitted in your baggage', { x: 50, y: 200, size: 10, font: helvetica });
  page.drawText('Important Notice', { x: 50, y: 190, size: 10, font: helvetica });
  page.drawText('1.  Ensure that you have valid travel documents with you', { x: 50, y: 180, size: 10, font: helvetica });
  page.drawText('2. For travel within Malaysia, ensure you have with you, a valid passport, MyKad or birth certificate.', { x: 50, y: 170, size: 10, font: helvetica });
  page.drawText('3. This boarding pass is subject to checks by airport authorities.', { x: 50, y: 160, size: 10, font: helvetica });
  page.drawText('4. Health and Safety Regulations stipulate that the weight of each check-in baggage should not exceed 32kg.', { x: 50, y: 150, size: 10, font: helvetica });
  page.drawText('5. Your baggage allowance entitlement is stated in your e-ticket', { x: 50, y: 140, size: 10, font: helvetica });
  page.drawText('6. For operational, safety or security reasons, we may change your seat even after you have boarded the aircraft.', { x: 50, y: 130, size: 10, font: helvetica });
  page.drawText('7. MASwings passengers travelling on Twin Otter services are required to present themselves at the check-in', { x: 50, y: 120, size: 10, font: helvetica });
  page.drawText('counter for boarding requirements at the check-in counter for boarding requirements', { x: 60, y: 110, size: 10, font: helvetica });
  // Fake Barcode Placeholder

  
  page.drawRectangle({
    x: 400,
    y: 50,
    width: 150,
    height: 30,
    color: rgb(0, 0, 0),
  });

  // Download Link for the PDF
  const pdfBytes = await pdfDoc.save();
  // const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  // const url = URL.createObjectURL(blob);
  // const a = document.createElement('a');
  // a.href = url;
  // a.download = `Bookingflex_${bookingId}.pdf`;
  // document.body.appendChild(a);
  // a.click();
  // document.body.removeChild(a);
  return Buffer.from(pdfBytes); // Return the PDF as a buffer
};

module.exports = generatePDF;


