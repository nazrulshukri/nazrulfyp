import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateMockReturnFlights1 } from '../mockdata/returnlondon';
import malaysiaLogo from '../img/assets/Malaysiaarilineslogo.png';
import britishAirwaysLogo from '../img/assets/britishairways.jpg';
import emiratesLogo from '../img/assets/Emirates_logo.png';
import emiratesLogo2 from '../img/assets/flightlogo/Air-France-Logo-2016-present.jpg';
import emiratesLogo3 from '../img/assets/flightlogo/China_Southern_Airlines-Logo.wine.png';
import emiratesLogo4 from '../img/assets/flightlogo/Etihad-airways-logo.svg.png';
import emiratesLogo5 from '../img/assets/flightlogo/KLM-Logo.png';
import emiratesLogo6 from '../img/assets/flightlogo/Logo_of_Saudia.svg.png';
import emiratesLogo7 from '../img/assets/flightlogo/Qatar_Airways-Logo.wine.png';
import emiratesLogo8 from '../img/assets/flightlogo/Thai_Airways-Logo.wine.png';
import emiratesLogo9 from '../img/assets/flightlogo/Turkish_Airlines-Logo.wine.png';
import emiratesLogo10 from '../img/assets/flightlogo/a40c6398aff3ec635987aaf4acc89d31.png';
import emiratesLogo11 from '../img/assets/flightlogo/air-india-2.png';
import emiratesLogo12 from '../img/assets/flightlogo/biman-bangladesh-airlines2895.jpg';
import emiratesLogo13 from '../img/assets/flightlogo/d9b0566be426fb2a5edb292e1231a974.jpg';
import emiratesLogo14 from '../img/assets/flightlogo/images (1).png';
import emiratesLogo15 from '../img/assets/flightlogo/images (2).png';
import emiratesLogo18 from '../img/assets/flightlogo/images.png';
import { FaSuitcase } from 'react-icons/fa';
import { FaPlaneDeparture, FaPlaneArrival, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import './return.css';

const airlineLogos = {
  'Malaysia Airlines': malaysiaLogo,
  'British Airways': britishAirwaysLogo,
  'Emirates': emiratesLogo,
  'Air France Airline': emiratesLogo2,
  'China southern Airlines': emiratesLogo3,
  'Etihad': emiratesLogo4,
  'KLM Royal Dutch Airlines': emiratesLogo5,
  'Saudia Airlines': emiratesLogo6,
  'Qatar': emiratesLogo7,
  'Thai Airways': emiratesLogo8,
  'Turkish Airlines': emiratesLogo9,
  'Kuwait Airways': emiratesLogo10,
  'Air India': emiratesLogo11,
  'Biman Bangladesh Airlines': emiratesLogo12,
  'Singapore Airlines': emiratesLogo13,
  'Oman Air': emiratesLogo14,
  'Finnair': emiratesLogo15,
  'Korean Airline': emiratesLogo18,

 
};

const Return = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedOutboundFlight, locationInput, destinationInput, startDate, returnDate, people } = location.state || {};

  const [filterAirline, setFilterAirline] = useState('All');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [returnFlights, setReturnFlights] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [filterDuration, setFilterDuration] = useState('');
  const [filterDepartureTime, setFilterDepartureTime] = useState('');
  const [formLocationInput, setFormLocationInput] = useState(locationInput || '');
  const [formDestinationInput, setFormDestinationInput] = useState(destinationInput || '');
  const [formStartDate, setFormStartDate] = useState(startDate || '');
  const [formReturnDate, setFormReturnDate] = useState(returnDate || '');
  const [formPeople, setFormPeople] = useState(people || 1);
  

  useEffect(() => {
    if (selectedOutboundFlight && formReturnDate) {
      const origin = selectedOutboundFlight.destination;
      const destination = selectedOutboundFlight.origin;
      
      const flights = generateMockReturnFlights1(formReturnDate, formReturnDate, origin, destination);
      setReturnFlights(flights);
    }
  }, [selectedOutboundFlight, formReturnDate]);

  if (!selectedOutboundFlight) {
    return <div>No outbound flight selected.</div>;
  }

  const filteredFlights = returnFlights.filter(flight => {
    const matchesAirline = filterAirline === 'All' || flight.airline.includes(filterAirline);
    const matchesPrice = filterMaxPrice === '' || flight.price <= filterMaxPrice;
    const matchesDuration = filterDuration === '' || flight.duration <= filterDuration;
    const matchesDepartureTime = filterDepartureTime === '' || flight.departure >= filterDepartureTime;

    return matchesAirline && matchesPrice && matchesDuration && matchesDepartureTime;
  });

  // const handleNextPage = (flight) => {
  //   navigate('/payment', {
  //     state: { outboundFlight: selectedOutboundFlight, returnFlight: flight },
  //   });
  // };
  const calculateTotalPrice = (price) => {
    return price * formPeople;  // Multiply flight price by number of people
  };

  // const handleNextPage = (flight) => {
  //   const totalPrice = getTotalCostForFlight(selectedOutboundFlight.price); // Get the total price for the outbound flight
  //   navigate('/payment', {
  //     state: { 
  //       outboundFlight: selectedOutboundFlight, 
  //       returnFlight: flight,
  //       totalPrice, // Pass the total price to the payment page
  //     },
  //   });
  // };
  

  const handleNextPage = async (flight) => {
    try {
      // Send flight data to the backend for inserting into MongoDB
      const response = await fetch('http://localhost:5000/flightreturn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: flight.id,
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          departure: flight.departure,
          arrival: flight.arrival,
          price: calculateTotalPrice(flight.price),
          origin: flight.origin,
          destination: flight.destination,
          nonStop: flight.nonStop,
        }),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Flight data saved successfully:', result);
     
        // Navigate to the payment page with flight details
        navigate('/payment', {
          state: { outboundFlight: selectedOutboundFlight, returnFlight: flight , price : calculateTotalPrice(flight.price)},
        });
      } else {
        console.error('Failed to save flight data');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleShowPopup = (flight) => {
    setSelectedFlight(flight);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="return-container">
      <h2 className="return-title">Available Return Flights</h2>
      <div className="return-content">
        <div className="filters1">
          <h2>Filter Your Flight:</h2>
          <div className="filter-section">
            <label>
              Airline:
              <select
                value={filterAirline}
                onChange={(e) => setFilterAirline(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Malaysia Airlines">Malaysia Airlines</option>
                <option value="British Airways">British Airways</option>
                <option value="Emirates">Emirates</option>
                <option value="Singapore Airlines">Singapore Airlines</option>
                <option value="Saudia Airlines">Saudia Airlines</option>
                <option value="Qatar">Emirates</option>
                <option value="Etihad">Etihad</option>
                <option value="Turkish Airlines">Turkish Airlines</option>
                <option value="Air India">Air India</option>
                <option value="Korean Airline">Korean Airline</option>
                <option value="Thai Airways">Thai Airways</option>
                <option value="Oman Air">Oman Air</option>
                <option value="Biman Bangladesh Airlines">Biman Bangladesh Airlines</option>
                <option value="China southern Airlines">China southern Airlines</option>
                <option value="KLM Royal Dutch Airlines">KLM Royal Dutch Airlines</option>
                <option value="Air France Airline">Air France Airline</option>
                <option value="Kuwait Airways">Kuwait Airways</option>
              </select>
            </label>
            <label>
              Max Duration (hours):
              <input
                type="number"
                value={filterDuration}
                onChange={(e) => setFilterDuration(e.target.value)}
                placeholder="Enter max duration"
              />
            </label>
            <label>
              Departure After:
              <input
                type="time"
                value={filterDepartureTime}
                onChange={(e) => setFilterDepartureTime(e.target.value)}
              />
            </label>
            <label>
              Max Price:
              <input
                type="number"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
                placeholder="Enter max price"
              />
            </label>
          </div>
        </div>
        
        
        
        <div className="flight-results">
        <form className="booking-form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-inline">
          
          <label className="form-label">
            <FaPlaneDeparture  style={{ color: '#8db6e2' }} className="form-icon" /> From:
            <input
              type="text"
              value={formLocationInput}
              onChange={(e) => setFormLocationInput(e.target.value)}
              className="form-input"
            />
          </label>
          
          <label className="form-label">
            <FaPlaneArrival  style={{ color: '#8db6e2' }}  className="form-icon" /> To:
            <input
              type="text"
              value={formDestinationInput}
              onChange={(e) => setFormDestinationInput(e.target.value)}
              className="form-input"
            />
          </label>

          <label className="form-label">
            <FaCalendarAlt  style={{ color: '#8db6e2' }}  className="form-icon" /> Start Date:
            <input
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
              className="form-input"
            />
          </label>

          <label className="form-label">
            <FaCalendarAlt style={{ color: '#8db6e2' }}   className="form-icon" /> Return Date:
            <input
              type="date"
              value={formReturnDate}
              onChange={(e) => setFormReturnDate(e.target.value)}
              className="form-input"
            />
          </label>

          <label className="form-label">
            <FaUsers style={{ color: '#8db6e2' }}  className="form-icon" /> Number of People:
            <input
              type="number"
              value={formPeople}
              onChange={(e) => setFormPeople(e.target.value)}
              min="1"
              className="form-input"
            />
          </label>

        </div>
      </form>
    
          {filteredFlights.length > 0 ? (
            <ul className="flight-list">
              {filteredFlights.map(flight => (
                <li key={flight.id} className="flight-item">
                  <div className="flight-header">
                    <img
                      src={airlineLogos[flight.airline] || emiratesLogo}
                      alt={`${flight.airline} logo`}
                      className="airline-logo"
                    />
                    <h3>{flight.airline}</h3>
                    <h5>{flight.flightNumber}</h5>
                  </div>
                  <div className="flight-details">
                    <div className="flight-times">
                      <div className="departure">
                        <p className="time">{flight.departure}</p>
                        <p className="airport">{flight.destination}</p>
                      </div>
                      <div className="duration">
                        <p>-----------------------------------------------</p>
                        <p>{flight.duration}</p>
                      </div>
                      <div className="arrival">
                        <p className="time">{flight.arrival}</p>
                        <p className="airport">{flight.origin}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flight-pricing">
                    <div className="pricing">
                      <h3> MYR {calculateTotalPrice(flight.price)}</h3>
                    </div>
                    <div className="button-container">
                      <button onClick={() => handleShowPopup(flight)} className="details-button">
                        Show Details
                      </button>
                      <button onClick={() => handleNextPage(flight)} className="payment-button">
                        Proceed to Payment
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No return flights available.</p>
          )}
        </div>
      </div>

      {showPopup && selectedFlight && (
  <div className="popup">
    <div className="popup-content">
      <span className="close" onClick={handleClosePopup}>
        <i className="fas fa-times"></i>
      </span>
      <h3>Flight Details</h3>
      
      {/* Flight Timeline */}
      <div className="timeline">
        <div className="timeline-step">
          <i className="fas fa-plane-departure"></i>
          <div>
            <p><strong>Departure:</strong> {selectedFlight.departure}</p>
            <p>Location: {selectedFlight.origin}</p>
          </div>
        </div>
        <div className="timeline-connector"></div>
        <div className="timeline-step">
          <i className="fas fa-plane-arrival"></i>
          <div>
            <p><strong>Arrival:</strong> {selectedFlight.arrival}</p>
            <p>Location: {selectedFlight.destination}</p>
          </div>
        </div>
      </div>

      {/* Complimentary Baggage Allowance */}
      <div className="baggage-allowance">
        <h4><FaSuitcase /> Complimentary Baggage Allowance</h4>
        <p><strong>Carry-on baggage:</strong> 20 kg</p>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Return;
