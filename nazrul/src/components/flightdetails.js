import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './flightdetails.css';
import exitImage from '../img/assets/exit.jpg';
import arrowDownIcon from '../img/assets/arrowdown2.png';
import arrowUpIcon from '../img/assets/arrowup.png';
import toiletimage from '../img/assets/seat/toilet.png'
import { FaShieldAlt } from "react-icons/fa"; // Import insurance icon
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

const FlightDetails = ({ outboundFlight, returnFlight,returnPrice }) => {
  if (!outboundFlight || !returnFlight) {
    return <div>No flight details available.</div>;
  }

  

  

  return (
    <div className="flight-details-container">
      <div className="flight-summary">
        <h3 className="summary-heading">Departure Flight Summary</h3>
        <div className="flight-info">
          <div className="route">
            <div className="location">
              <strong>{outboundFlight.origin}</strong>
              <p className="date">{new Date(outboundFlight.departure).toLocaleString()}</p>
            </div>
            <div className="arrow">➔</div>
            <div className="location">
              <strong>{outboundFlight.destination}</strong>
              <p className="date">{new Date(outboundFlight.arrival).toLocaleString()}</p>
            </div>
          </div>
          <div className="details23">
            <p><strong>Airline:</strong> {outboundFlight.airline}</p>
            <p><strong>Flight Number:</strong> {outboundFlight.flightNumber}</p>
          </div>
        </div>
      </div>
  
      <div className="flight-summary">
        <h3 className="summary-heading">Return Flight Summary</h3>
        <div className="flight-info">
          <div className="route">
            <div className="location">
              <strong>{returnFlight.origin}</strong>
              <p className="date">{new Date(returnFlight.departure).toLocaleString()}</p>
            </div>
            <div className="arrow">➔</div>
            <div className="location">
              <strong>{returnFlight.destination}</strong>
              <p className="date">{new Date(returnFlight.arrival).toLocaleString()}</p>
            </div>
          </div>
          <div className="details23">
            <p><strong>Airline:</strong> {returnFlight.airline}</p>
            <p><strong>Flight Number:</strong> {returnFlight.flightNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PassengerForm = ({ setPassengerDetails }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const validate = () => {
    let isValid = true;
    const newErrors = {};

    // First Name Validation
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    }

    // Last Name Validation
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    }

    // Email Validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailPattern.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone Validation (onBlur)
    const phonePattern = /^01[0-46-9]-?\d{7,8}$/; // Malaysian format
    if (phone && !phonePattern.test(phone)) {
      newErrors.phone = 'Please enter a valid Malaysian phone number';
      isValid = false;
    }

    setErrors(newErrors);
    setShowErrorPopup(!isValid); // Show error popup if validation fails
    return isValid;
  };

  const handleInputChange = (e, setter) => {
    setter(e.target.value);
  };

  const handlePhoneBlur = () => {
    validate(); // Validate phone number when it loses focus
  };

  useEffect(() => {
    setPassengerDetails({ firstName, lastName, email, phone });
  }, [firstName, lastName, email, phone, setPassengerDetails]);

  // Close the error popup when the user clicks outside or when the popup is closed
  const closePopup = () => {
    setShowErrorPopup(false);
  };

  return (
    <div className="passenger-form-container1">
      <h2>Passenger Details</h2>
      <form>
        <div className="form-row8">
          <FontAwesomeIcon icon={faUser} className="form-icon3" />
          <label>First Name:</label>
          <input
            placeholder="Muhammad"
            type="text"
            value={firstName}
            onChange={(e) => handleInputChange(e, setFirstName)}
            required
          />
        </div>

        <div className="form-row8">
          <FontAwesomeIcon icon={faUser} className="form-icon3" />
          <label>Last Name:</label>
          <input
            placeholder="Nazrul"
            type="text"
            value={lastName}
            onChange={(e) => handleInputChange(e, setLastName)}
            required
          />
        </div>

        <div className="form-row2">
          <FontAwesomeIcon icon={faEnvelope} className="form-icon3" />
          <label>Email:</label>
          <input
            placeholder="example@gmail.com"
            type="email"
            value={email}
            onChange={(e) => handleInputChange(e, setEmail)}
            required
          />
        </div>

        <div className="form-row2">
          <FontAwesomeIcon icon={faPhone} className="form-icon3" />
          <label>Phone:</label>
          <input
            placeholder="01161007484"
            type="tel"
            value={phone}
            onChange={(e) => handleInputChange(e, setPhone)}
            onBlur={handlePhoneBlur} // Trigger validation on blur
            required
          />
        </div>
      </form>

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="error-popup" onClick={closePopup}>
          <div className="error-popup-content" onClick={(e) => e.stopPropagation()}>
            <h3>Form Validation Errors</h3>
            <ul>
              {Object.keys(errors).map(
                (key) =>
                  errors[key] && <li key={key}>{errors[key]}</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};


const SeatSelection = ({ setTotalPrice, setSelectedSeats }) => {
  const [selectedSeats, setSelectedSeatsState] = useState([]);
  const [showSeats, setShowSeats] = useState(false);

  const toggleSeats = () => {
    setShowSeats((prev) => !prev);
  };

  // Seat rows including additional seats below the toilet
  const seatRows = [
    { seats: [1, 2, 3, 4, 5, 'blank', 6, 7, 8, 9, 10, 'blank', 11, 12, 13, 14, 15], aisle: 'A' },
    { seats: [16, 17, 18, 19, 20, 'blank', 21, 22, 23, 24, 25, 'blank', 26, 27, 28, 29, 30], aisle: 'B' },
    { seats: [31, 32, 33, 34, 35, 'blank', 36, 37, 38, 39, 40, 'blank', 41, 42, 43, 44, 45], aisle: 'C' },
    { seats: [46, 47, 48, 49, 50, 'blank', 51, 52, 53, 54, 55, 'blank', 56, 57, 58, 59, 60], aisle: 'D' },
    // Separator row for the toilet
    { seats: ['toilet'], aisle: null },
    // New seats below the toilet
    { seats: [61, 62, 63, 64, 65, 'blank', 66, 67, 68, 69, 70, 'blank', 71, 72, 73, 74, 75], aisle: 'E' },
    { seats: [76, 77, 78, 79, 80, 'blank', 81, 82, 83, 84, 85, 'blank', 86, 87, 88, 89, 90], aisle: 'F' },
  ];

  const handleSeatClick = (seat) => {
    if (seat === 'blank' || seat === 'toilet') return; // Ignore aisle spaces and toilet

    const seatPrice = 20; // Define price per seat
    if (selectedSeats.includes(seat)) {
      // Deselect seat
      setSelectedSeatsState(selectedSeats.filter((s) => s !== seat));
      setTotalPrice((prev) => prev - seatPrice);
    } else {
      // Select seat
      setSelectedSeatsState([...selectedSeats, seat]);
      setTotalPrice((prev) => prev + seatPrice);
    }
  };

  useEffect(() => {
    setSelectedSeats(selectedSeats);
  }, [selectedSeats, setSelectedSeats]);

  return (
    <div className="seat-booking-container">
      {/* Button to toggle seat selection grid */}
      <button 
        className="seat-booking-toggle" 
        onClick={toggleSeats} 
        aria-label="Toggle Seat Selection"
      >
        Select Your Seats
        <img
          className="toggle-arrow"
          src={showSeats ? arrowUpIcon : arrowDownIcon}
          alt={showSeats ? "Collapse" : "Expand"}
        />
      </button>

      {/* Seat grid becomes visible when showSeats is true */}
      {showSeats && (
        <div className={`seat-grid-container ${showSeats ? 'visible' : 'hidden'}`}>
          <div className="exit-row">
            {/* Exit indicators */}
            <div className="exit-label">
              <img src={exitImage} alt="Exit Left" />
            </div>
            <div className="exit-label right">
              <img src={exitImage} alt="Exit Right" />
            </div>
          </div>

          {/* Render seat rows */}
          {seatRows.map((row, rowIndex) => (
  <div key={rowIndex} className="seat-row">
    {row.seats.map((seat, seatIndex) => {
      if (seat === 'toilet') {
        // Render the toilet image instead of a button
        return (
          <div key={seatIndex} className="toilet-icon">
            <img src={toiletimage} alt="Toilet" />
          </div>
        );
      }

      return (
        <button
          key={seatIndex}
          className={`seat ${
            seat === 'blank'
              ? 'aisle'
              : selectedSeats.includes(seat)
              ? 'selected'
              : ''
          }`}
          onClick={() => handleSeatClick(seat)}
          disabled={seat === 'blank'}
          aria-label={`Seat ${seat !== 'blank' ? seat : 'Aisle'}`}
        >
          {seat !== 'blank' ? seat : ''}
        </button>
      );
    })}
    {row.aisle && <div className="aisle-label">{row.aisle}</div>}
  </div>
))}

        
        </div>
      )}
    </div>
  );
};

const insuranceOptions = [
  { id: 1, name: 'Basic Coverage', description: 'Covers trip cancellation and lost luggage.', price: 20 },
  { id: 2, name: 'Standard Coverage', description: 'Includes medical and emergency assistance.', price: 50 },
  { id: 3, name: 'Premium Coverage', description: 'Full coverage including trip interruption and delay.', price: 80 },
  { id: 4, name: 'No insurance', description: '', price: 0 },
];

const InsuranceSelection = ({ setTotalPrice, setSelectedInsurance }) => {
  const [selectedInsurance, setInsurance] = useState(null);

  const handleInsuranceChange = (insurance) => {
    setInsurance(insurance);
    setSelectedInsurance(insurance);
    setTotalPrice((prev) => prev - (selectedInsurance?.price || 0) + insurance.price);
  };

  return (
    <div className="insurance-container">
    <h3>Insurance Options</h3>
    {insuranceOptions.map((insurance) => (
        <div
            key={insurance.id}
            className={`insurance-option ${selectedInsurance?.id === insurance.id ? 'selected' : ''}`}
            onClick={() => handleInsuranceChange(insurance)}
        >
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <FaShieldAlt className="insurance-icon" /> {/* Add Icon */}
                <div>
                    <h4>{insurance.name}</h4>
                    <p>{insurance.description}</p>
                </div>
            </div>
            <p><strong>Price:</strong> MYR{insurance.price}</p>
        </div>
    ))}
</div>
);
};

const FlightDetailsPage = ({ outboundFlight, returnFlight, returnPrice }) => {
  const [passengerDetails, setPassengerDetails] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedInsurance, setSelectedInsurance] = useState(null);

  

  console.log("Received returnPrice in FlightDetailsPage:", returnPrice); // Debugging

  const navigate = useNavigate();

  const handleBooking = () => {
    const bookingData = {
      outboundFlight,
      returnFlight,
      passengerDetails,
      returnPrice, // Make sure returnPrice here is not reset
      selectedSeats,
      selectedInsurance,
      totalPrice,
    };
    
    // Navigate to payment page and pass bookingData through state
    navigate('/payment', { state: bookingData });
  };

  return (
    <div className="flight-details-page">
      <FlightDetails 
        outboundFlight={outboundFlight} 
        returnFlight={returnFlight} 
        returnPrice={returnPrice} // Pass returnPrice to FlightDetails
      />
      <PassengerForm setPassengerDetails={setPassengerDetails} />
      <SeatSelection setTotalPrice={setTotalPrice} setSelectedSeats={setSelectedSeats} />
      <InsuranceSelection setTotalPrice={setTotalPrice} setSelectedInsurance={setSelectedInsurance} />
      <button className="booking-button" onClick={handleBooking}>Book Flight</button>
      <div className="total-price">Total Price: MYR {totalPrice.toFixed(2)}</div>
    </div>
  );
};


export default FlightDetailsPage;
