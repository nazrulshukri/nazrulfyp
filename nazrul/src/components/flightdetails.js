import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './flightdetails.css';
import arrowDownIcon from '../img/assets/arrowdown2.png';
import arrowUpIcon from '../img/assets/arrowup.png';
import { FaDoorOpen, FaPlaneDeparture, FaRestroom, FaShieldAlt } from "react-icons/fa";
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
            <p><strong>Flight Number:</strong> {outboundFlight?.flightNumber || "-"}</p>
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

const PassengerForm = ({ setPassengerDetails, initialPassengerDetails = {} }) => {
  const [firstName, setFirstName] = useState(initialPassengerDetails.firstName || '');
  const [lastName, setLastName] = useState(initialPassengerDetails.lastName || '');
  const [email, setEmail] = useState(initialPassengerDetails.email || '');
  const [phone, setPhone] = useState(initialPassengerDetails.phone || '');
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


const SeatSelection = ({ setTotalPrice, setSelectedSeats, initialSelectedSeats = [] }) => {
  const [selectedSeats, setSelectedSeatsState] = useState(initialSelectedSeats);
  const [showSeats, setShowSeats] = useState(false);
  const occupiedSeats = ['2B', '4E', '6A', '8F', '10C', '12D'];

  const toggleSeats = () => {
    setShowSeats((prev) => !prev);
  };

  const seatRows = Array.from({ length: 14 }, (_, index) => {
    const rowNumber = index + 1;
    return ['A', 'B', 'C', 'D', 'E', 'F'].map((letter) => `${rowNumber}${letter}`);
  });

  const handleSeatClick = (seat) => {
    if (occupiedSeats.includes(seat)) return;

    const seatPrice = 20;
    if (selectedSeats.includes(seat)) {
      setSelectedSeatsState(selectedSeats.filter((s) => s !== seat));
      setTotalPrice((prev) => prev - seatPrice);
    } else {
      setSelectedSeatsState([...selectedSeats, seat]);
      setTotalPrice((prev) => prev + seatPrice);
    }
  };

  useEffect(() => {
    setSelectedSeats(selectedSeats);
  }, [selectedSeats, setSelectedSeats]);

  return (
    <div className="seat-booking-container">
      <button 
        className="seat-booking-toggle" 
        onClick={toggleSeats} 
        aria-label="Toggle Seat Selection"
      >
        <span>
          <FaPlaneDeparture className="seat-toggle-icon" />
          Select Your Seats
        </span>
        <img
          className="toggle-arrow"
          src={showSeats ? arrowUpIcon : arrowDownIcon}
          alt={showSeats ? "Collapse" : "Expand"}
        />
      </button>

      {showSeats && (
        <div className="aircraft-seat-shell">
          <div className="seat-map-header">
            <div>
              <span className="seat-map-eyebrow">Cabin seat map</span>
              <h3>Economy cabin</h3>
            </div>
            <div className="selected-seat-counter">
              {selectedSeats.length} selected
            </div>
          </div>

          <div className="seat-legend">
            <span><i className="legend-dot available"></i>Available</span>
            <span><i className="legend-dot selected"></i>Selected</span>
            <span><i className="legend-dot occupied"></i>Occupied</span>
          </div>

          <div className="aircraft-cabin">
            <div className="aircraft-nose">
              <FaPlaneDeparture />
              <span>Front</span>
            </div>

            <div className="cabin-exit-row">
              <span><FaDoorOpen /> Exit</span>
              <span><FaDoorOpen /> Exit</span>
            </div>

            <div className="seat-letter-row">
              <span>A</span>
              <span>B</span>
              <span>C</span>
              <span className="aisle-word">Aisle</span>
              <span>D</span>
              <span>E</span>
              <span>F</span>
            </div>

            <div className="seat-grid-container">
              {seatRows.map((row, rowIndex) => (
                <React.Fragment key={row[0]}>
                  {row.slice(0, 3).map((seat) => {
                    const isSelected = selectedSeats.includes(seat);
                    const isOccupied = occupiedSeats.includes(seat);

                    return (
                      <button
                        key={seat}
                        className={`seat ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isOccupied}
                        aria-label={`Seat ${seat}${isOccupied ? ' occupied' : ''}`}
                        style={{ animationDelay: `${rowIndex * 35}ms` }}
                      >
                        <span className="seat-back"></span>
                        <span className="seat-label">{seat}</span>
                      </button>
                    );
                  })}

                  <div className="aisle-label">{rowIndex + 1}</div>

                  {row.slice(3).map((seat) => {
                    const isSelected = selectedSeats.includes(seat);
                    const isOccupied = occupiedSeats.includes(seat);

                    return (
                      <button
                        key={seat}
                        className={`seat ${isSelected ? 'selected' : ''} ${isOccupied ? 'occupied' : ''}`}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isOccupied}
                        aria-label={`Seat ${seat}${isOccupied ? ' occupied' : ''}`}
                        style={{ animationDelay: `${rowIndex * 35}ms` }}
                      >
                        <span className="seat-back"></span>
                        <span className="seat-label">{seat}</span>
                      </button>
                    );
                  })}

                  {rowIndex === 6 && (
                    <div className="cabin-service-row">
                      <span><FaRestroom /> Restroom</span>
                      <span><FaDoorOpen /> Mid exit</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {selectedSeats.length > 0 && (
            <div className="selected-seat-summary">
              <span>Selected seats</span>
              <div>
                {selectedSeats.map((seat) => (
                  <strong key={seat}>{seat}</strong>
                ))}
              </div>
            </div>
          )}
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

const InsuranceSelection = ({ setTotalPrice, setSelectedInsurance, initialSelectedInsurance = null }) => {
  const [selectedInsurance, setInsurance] = useState(initialSelectedInsurance);

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

const FlightDetailsPage = ({
  outboundFlight,
  returnFlight,
  returnPrice,
  initialPassengerDetails = {},
  initialSelectedSeats = [],
  initialSelectedInsurance = null,
  onPassengerDetailsChange,
  onSelectedSeatsChange,
  onSelectedInsuranceChange,
  showBookingButton = true,
}) => {
  const [passengerDetails, setPassengerDetails] = useState(initialPassengerDetails);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState(initialSelectedSeats);
  const [selectedInsurance, setSelectedInsurance] = useState(initialSelectedInsurance);

  

  console.log("Received returnPrice in FlightDetailsPage:", returnPrice); // Debugging

  const navigate = useNavigate();

  useEffect(() => {
    onPassengerDetailsChange?.(passengerDetails);
  }, [passengerDetails, onPassengerDetailsChange]);

  useEffect(() => {
    onSelectedSeatsChange?.(selectedSeats);
  }, [selectedSeats, onSelectedSeatsChange]);

  useEffect(() => {
    onSelectedInsuranceChange?.(selectedInsurance);
  }, [selectedInsurance, onSelectedInsuranceChange]);

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
      <PassengerForm
        setPassengerDetails={setPassengerDetails}
        initialPassengerDetails={initialPassengerDetails}
      />
      <SeatSelection
        setTotalPrice={setTotalPrice}
        setSelectedSeats={setSelectedSeats}
        initialSelectedSeats={initialSelectedSeats}
      />
      <InsuranceSelection
        setTotalPrice={setTotalPrice}
        setSelectedInsurance={setSelectedInsurance}
        initialSelectedInsurance={initialSelectedInsurance}
      />
      {showBookingButton && (
        <>
          <button className="booking-button" onClick={handleBooking}>Book Flight</button>
          <div className="total-price">Total Price: MYR {totalPrice.toFixed(2)}</div>
        </>
      )}
    </div>
  );
};


export default FlightDetailsPage;
