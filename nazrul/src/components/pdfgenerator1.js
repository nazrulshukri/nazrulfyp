// src/components/pdfgenerator.js
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

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

  // Create a QR code
  const qrCodeUrl = `Booking ID: ${bookingId}`; // You can change this to whatever you want the QR code to represent
  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);

  // Create a ticket element dynamically
  const ticketElement = document.createElement('div');
  ticketElement.style.padding = '20px';
  ticketElement.style.fontFamily = 'Arial, sans-serif';
  ticketElement.style.background = '#fff';
  ticketElement.style.borderRadius = '8px';
  ticketElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';

  ticketElement.innerHTML = `
    <h2>Your Flight Ticket</h2>
    <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 100px; height: 100px; margin-bottom: 10px;"/>
    <p><strong>Passenger Name:</strong> ${passengerDetails.firstName} ${passengerDetails.lastName}</p>
    <p><strong>Email:</strong> ${passengerDetails.email}</p>
    <p><strong>Booking ID:</strong> ${bookingId}</p>
    <p><strong>Payment Method:</strong> ${paymentMethod}</p>
    <p><strong>Amount:</strong> $${amount}</p>
    <p><strong>Status:</strong> Confirmed</p>
    <p><strong>Selected Seats:</strong> ${selectedSeats.join(', ')}</p>
    <p><strong>Insurance:</strong> ${selectedInsurance ? 'Yes' : 'No'}</p>
    <h3>Departure Flight</h3>
    <p><strong>From:</strong> ${outboundFlight.origin}</p>
    <p><strong>To:</strong> ${outboundFlight.destination}</p>
    <p><strong>Date:</strong> ${new Date(outboundFlight.departure).toLocaleDateString()}</p>
    <p><strong>Time:</strong> ${new Date(outboundFlight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    <h3>Return Flight</h3>
    <p><strong>From:</strong> ${returnFlight.origin}</p>
    <p><strong>To:</strong> ${returnFlight.destination}</p>
    <p><strong>Date:</strong> ${new Date(returnFlight.departure).toLocaleDateString()}</p>
    <p><strong>Time:</strong> ${new Date(returnFlight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
  `;

  document.body.appendChild(ticketElement); // Append the element to the body

  // Use html2canvas to capture the ticket element
  const canvas = await html2canvas(ticketElement);
  const imgData = canvas.toDataURL('image/png');

  // Create a PDF from the image
  const pdf = new jsPDF();
  pdf.addImage(imgData, 'PNG', 10, 10);
  
  // Add the QR code to the PDF
  pdf.addImage(qrCodeDataUrl, 'PNG', 150, 10, 40, 40); // Adjust positioning and size as needed

  pdf.save(`Flight_Ticket_${bookingId}.pdf`);

  // Clean up the DOM
  document.body.removeChild(ticketElement);
};

export default generatePDF;
