import React, { useEffect ,useState} from 'react';
import { useLocation } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { generatePDF1 } from './pdfgenerator1';
import generatePDF from './pdfgenerator'; 
import bookingflex from '../img/assets/Booking1.png';
import './ticketpage.css';
import ConfirmationDialog from './confirmationdialog';
import emiratesLogo from "../img/assets/Malaysiaarilineslogo.png"; // Update with actual path
import emiratesLogo1 from "../img/assets/flightlogo/Emirates_logo.svg.png"; // Update with actual path
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import BoardingGate from '../img/assets/pdf/boarding-gate.png';
import Gatedeparture from '../img/assets/pdf/gate (1).png';

const TicketPage = () => {
  const location = useLocation();
  const { state } = location || {};

  const [isDialogOpen, setIsDialogOpen] = useState(true); // Controls dialog visibility


  const handleCloseDialog = () => {
    setIsDialogOpen(false);  // Close dialog when user clicks OK
  };

  useEffect(() => {
    console.log("Received state in TicketPage:", state);
  }, [state]);

  const {
    bookingId,
    paymentMethod,
    amount,
    outboundFlight = {},
    returnFlight = {},
    passengerDetails = {},
    selectedSeats = [],
    selectedInsurance = false,
  } = state || {};

  const airlineLogos = {
    Emirates: emiratesLogo,
    Emirates1 : emiratesLogo1
    // Add more airline logos if needed
  };

  if (!state) {
    return <div>No booking information available.</div>;
  }

  const handleDownload = () => {
    generatePDF1({ bookingId, paymentMethod, amount, outboundFlight, returnFlight, passengerDetails, selectedSeats, selectedInsurance });
  };

  return (
    <div className="ticket-page">
       {isDialogOpen && (
        <ConfirmationDialog
          onClose={handleCloseDialog}
          title="Booking Confirmed"
          message="Congratulations! Your flight ticket has been confirmed. You can view and download the ticket details below."
        />
      )}
      <div className="ticket-container90" id="ticket">
        <div className="ticket-header90">
          <img src={bookingflex} alt="Booking Logo" className="airline-logo90" />
          <h2>Your Flight Ticket</h2>
        </div>
        <div className="status-container">
  <div className="status-text">
    <FontAwesomeIcon icon={faCheckCircle} className="status-icon" />
    <p><strong>Status:</strong> Confirmed</p>
  </div>
  <p className="congratulations-message">Congratulations! Your flight has been approved.</p>
</div>
        
<div className="flight-list5">
  {/* Departure Flight */}
  <div className="flight-card">
    <h3 className="section-title">Departure Flight</h3>
    <div className="flight-header-modern">
      <div className="logo-container">
        <img
          src={airlineLogos[outboundFlight.airline] || emiratesLogo}
          alt={`${outboundFlight.airline} logo`}
          className="airline-logo-modern"
        />
      </div>
      <div className="airline-details-modern">
        <h4 className="airline-name-modern">{outboundFlight.airline}</h4>
        <p className="flight-number-modern">{outboundFlight.flightNumber}</p>
      </div>
    </div>
    <div className="flight-details">
      <div className="time-block">
        <p className="time">{outboundFlight.departure}</p>
        <p className="airport">{outboundFlight.origin}</p>
      </div>
      <div className="duration-block">
        <span className="duration-line"></span>
        <p className="duration">{outboundFlight.duration}</p>
      </div>
      <div className="time-block">
        <p className="time">{outboundFlight.arrival}</p>
        <p className="airport">{outboundFlight.destination}</p>
      </div>
    </div>
  </div>

  {/* Return Flight */}
  <div className="flight-card">
    <h3 className="section-title">Return Flight</h3>
    <div className="flight-header-modern">
      <div className="logo-container">
        <img
          src={emiratesLogo1}
          alt={`${returnFlight.airline} logo`}
          className="airline-logo-modern"
        />
      </div>
      <div className="airline-details-modern">
        <h4 className="airline-name-modern">{returnFlight.airline}</h4>
        <p className="flight-number-modern">{returnFlight.flightNumber}</p>
      </div>
    </div>
    <div className="flight-details">
      <div className="time-block">
        <p className="time">{returnFlight.departure}</p>
        <p className="airport">{returnFlight.origin}</p>
      </div>
      <div className="duration-block">
        <span className="duration-line"></span>
        <p className="duration">{returnFlight.duration}</p>
      </div>
      <div className="time-block">
        <p className="time">{returnFlight.arrival}</p>
        <p className="airport">{returnFlight.destination}</p>
      </div>
    </div>
  </div>
</div>



        <div className="ticket-details-container">
  <h3>Ticket Details</h3>
  <div className="ticket-details">
    <div className="detail-item">
      <i className="fas fa-user passenger-icon"></i>
      <p><strong>Passenger Name:</strong> {passengerDetails.lastName} / {passengerDetails.firstName} </p>
    </div>
    <div className="detail-item">
      <i className="fas fa-envelope email-icon"></i>
      <p><strong>Email:</strong> {passengerDetails.email}</p>
    </div>
    <div className="detail-item">
      <i className="fas fa-id-card booking-icon"></i>
      <p><strong>Booking ID:</strong> #{bookingId}</p>
    </div>
    <div className="detail-item">
      <i className="fab fa-cc-paypal"></i>
      <p><strong>Payment Method:</strong> {paymentMethod}</p>
    </div>
    <div className="detail-item">
      <i className="fas fa-dollar-sign amount-icon"></i>
      <p><strong>Amount:</strong> MYR{amount}</p>
    </div>
    <div className="detail-item">
      <i className="fas fa-chair seat-icon"></i>
      <p><strong>Selected Seats:</strong> {selectedSeats.join(', ')}</p>
    </div>
    <div className="detail-item">
      <i className="fas fa-shield-alt insurance-icon"></i>
      <p><strong>Insurance:</strong> {selectedInsurance ? 'Yes' : 'No'}</p>
    </div>
    <div className="detail-item">
    <img src={BoardingGate} alt="Boarding Gate" className="icon boarding-gate-icon" />
      <p>
        <strong>Check-in Counter:</strong> <strong>No. 5</strong>
      </p>
  </div>
    <div className="detail-item">
    <img src={Gatedeparture} alt="Gate Departure" className="icon gate-departure-icon" />
      <p>
        <strong>Gate:</strong> A5
      </p>
    </div>
    <div className="detail-item">
      <i className="fas fa-passport passport-icon"></i> {/* Passport icon */}
      <p>
        <strong>Passport Check:</strong> <strong>Checked</strong>
      </p>
    </div>
  </div>
</div>



        <div className="ticket-footer">
          <div className="qr-code-container">
            <h3>QR Code</h3>
            <QRCodeCanvas value={bookingId} size={128} />
            <p>Scan for details</p>
          </div>
          <div className="download-container">
            <h3>Download Ticket</h3>
            <button onClick={handleDownload} className="download-link">
              <i className="fas fa-download"></i> Download PDF
            </button>
          </div>
        </div>

        <div className="additional-container">
          <h3>Additional Information</h3>
          <p>Please Be arrive before 30 Minutes </p>
        </div>
      </div>
    </div>  
  );
};

export default TicketPage;