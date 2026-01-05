import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateMockFlights } from '../mockdata/flights';
import './flightresults.css';
import malaysiaLogo from '../img/assets/images.png';
import britishAirwaysLogo from '../img/assets/britishairways.jpg';
import emiratesLogo from '../img/assets/Emirates_logo.png';
import emiratesLogo1 from '../img/assets/flightlogo/Cathay_Pacific-Logo.wine.png';
import emiratesLogo2 from '../img/assets/flightlogo/d9b0566be426fb2a5edb292e1231a974.jpg';
import emiratesLogo3 from '../img/assets/flightlogo/Etihad-airways-logo.svg.png';
import emiratesLogo4 from '../img/assets/flightlogo/images (4).png';
import emiratesLogo5 from '../img/assets/flightlogo/Logo_of_Saudia.svg.png';
import emiratesLogo6 from '../img/assets/flightlogo/Qatar_Airways-Logo.wine.png';
import emiratesLogo7 from '../img/assets/flightlogo/Turkish_Airlines-Logo.wine.png';
import transparentFlightImage from '../img/assets/flightdetails.jpg';
import destination from '../img/assets/destination1.jpg';
import luggage from '../img/assets/bagasi.png';
import { FaPlaneDeparture, FaPlaneArrival, FaSuitcase } from 'react-icons/fa';

const airlineLogos = {
  'Malaysia Airlines': malaysiaLogo,
  'British Airways': britishAirwaysLogo,
  'Emirates': emiratesLogo,
  'Cathay Pacific': emiratesLogo1,
  'Singapore Airlines': emiratesLogo2,
  'Etihad': emiratesLogo3,
  'All Nippon Airways': emiratesLogo4,
  'Saudia Airlines': emiratesLogo5,
  'Qatar Airways': emiratesLogo6,
  'Turkish Airlines': emiratesLogo7,
};

function FlightResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { flightParams } = location.state || {};
  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [people, setPeople] = useState(flightParams?.people || 1);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(flightParams?.departureDate || '');
  const [returnDate, setReturnDate] = useState(flightParams?.returnDate || '');
  const [locationInput, setLocationInput] = useState(flightParams?.origin || '');
  const [destinationInput, setDestinationInput] = useState(flightParams?.destination || '');
  const [selectedFlightId, setSelectedFlightId] = useState(null);

  const [filters, setFilters] = useState({
    nonStop: false,
    layovers: 'any',
    journeyDuration: 59,
    layoverDuration: 25,
    cabinClass: 'Economy',
    airline: 'All',
  });

  useEffect(() => {
    if (flightParams) {
      try {
        const generatedFlights = generateMockFlights(
          startDate,
          returnDate,
          locationInput,
          destinationInput,
          people
        );
        setFlights(generatedFlights);
        setFilteredFlights(generatedFlights);
      } catch (error) {
        setError('Error fetching flight data.');
        console.error('Error:', error);
      }
    }
  }, [flightParams, startDate, returnDate, locationInput, destinationInput, people]);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = flights;

      if (filters.nonStop) {
        filtered = filtered.filter(flight => flight.nonStop);
      }

      if (filters.layovers === 'none') {
        filtered = filtered.filter(flight => !flight.layovers || flight.layovers === 0);
      }

      if (filters.airline !== 'All') {
        filtered = filtered.filter(flight => flight.airline === filters.airline);
      }

      setFilteredFlights(filtered);
    };

    applyFilters();
  }, [flights, filters]);

  const getTotalCostForFlight = (pricePerPerson) => {
    return (pricePerPerson * people).toFixed(2);
  };

  const handleFilterChange = (e) => {
    const { name, value, type } = e.target;

    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === 'radio' ? value : value,
    }));
  };

  const handleSelectFlight = (id) => {
    setSelectedFlightId(id);
  };

  const handleCloseDetails = () => {
    setSelectedFlightId(null);
  };

 

  // const handleSubmitFlight = async (id) => {
  //   // Find the selected flight from the already generated flight list
  //   const selectedFlight = flights.find(flight => flight.id === id);
  
  //   if (selectedFlight && returnDate) {
  //     const totalPrice = getTotalCostForFlight(selectedFlight.price);
  
  //     // Prepare the flight data to send to MongoDB, using the selected flight data
  //     const flightData = {
  //       id: selectedFlight.id,
  //       airline: selectedFlight.airline,
  //       flightNumber: selectedFlight.flightNumber,
  //       departure: selectedFlight.departure,
  //       arrival: selectedFlight.arrival,
  //       price: totalPrice, // use the calculated total price for the selected flight
  //       origin: selectedFlight.origin,
  //       destination: selectedFlight.destination,
  //       nonStop: selectedFlight.nonStop,
  //     };
  
  //     // Send flight data to your backend API
  //     try {
  //       const response = await fetch('http://localhost:5000/flightresults', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify(flightData),
  //       });
  
  //       if (response.ok) {
  //         const data = await response.json();
  //         console.log('Flight data saved:', data);
  //         // Navigate to the return page after successful save
  //         navigate('/return', {
  //           state: {
  //             selectedOutboundFlight: selectedFlight,
  //             outboundPrice: totalPrice,
  //             locationInput, // Pass the location input
  //             destinationInput, // Pass the destination input
  //             startDate, // Pass the start date
  //             returnDate,        // Return date
  //             people // Pass the number of people
  //           },
  //         });
  //       } else {
  //         console.error('Failed to save flight data:', response.statusText);
  //       }
  //     } catch (error) {
  //       console.error('Error saving flight data:', error);
  //     }
  //   }
  // };

  const handleSubmitFlight = async (id) => {
    const selectedFlight = flights.find(flight => flight.id === id);
  
    if (selectedFlight && returnDate) {
      const totalPrice = getTotalCostForFlight(selectedFlight.price);
  
      const flightData = {
        id: selectedFlight.id,
        airline: selectedFlight.airline,
        flightNumber: selectedFlight.flightNumber,
        departure: selectedFlight.departure,
        arrival: selectedFlight.arrival,
        price: totalPrice,
        origin: selectedFlight.origin,
        destination: selectedFlight.destination,
        nonStop: selectedFlight.nonStop,
      };
  
      try {
        const response = await fetch('http://localhost:5001/flightresults', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(flightData),
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Flight data saved:', data);
  
          // Log details before navigation
          console.log('Navigating to return page with data:', {
            selectedOutboundFlight: selectedFlight,
            outboundPrice: totalPrice,
            locationInput,
            destinationInput,
            startDate,
            returnDate,
            people,
          });
  
          // Pass the totalPrice to the return page as well
          navigate('/return', {
            state: {
              selectedOutboundFlight: selectedFlight,
              outboundPrice: totalPrice, // Pass the outbound price
              locationInput,
              destinationInput,
              startDate,
              returnDate,
              people,
            },
          });
        } else {
          console.error('Failed to save flight data:', response.statusText);
        }
      } catch (error) {
        console.error('Error saving flight data:', error);
      }
    }
  };
  
  
  
  


  
  return (
    <div className="flight-results-container">
      <div className="filters">
      <p className="filter-text">Filter Your Flight:</p>
      <div className="filter-section">
  <h6>Number of layovers:</h6>
  <div className="filterlayovers">
    <label className="radio-label">
      <input
        type="radio"
        name="layovers"
        value="any"
        checked={filters.layovers === 'any'}
        onChange={handleFilterChange}
      />
      Any
    </label>
    <label className="radio-label">
      <input
        type="radio"
        name="layovers"
        value="none"
        checked={filters.layovers === 'none'}
        onChange={handleFilterChange}
      />
      Non-stop
    </label>
    <label className="radio-label">
      <input
        type="radio"
        name="layovers"
        value="1"
        checked={filters.layovers === '1'}
        onChange={handleFilterChange}
      />
      Up to 1 stop
    </label>
    <label className="radio-label">
      <input
        type="radio"
        name="layovers"
        value="2"
        checked={filters.layovers === '2'}
        onChange={handleFilterChange}
      />
      Up to 2 stops
    </label>
  </div>
</div>


        <div className="filter-section">
          <label>
            Journey Duration (min):
            <input
              type="range"
              name="journeyDuration"
              min="0"
              max="120"
              value={filters.journeyDuration}
              onChange={handleFilterChange}
            />
            {filters.journeyDuration} hours
          </label>
        </div>

        <div className="filter-section">
          <label>
            Layover Duration (min):
            <input
              type="range"
              name="layoverDuration"
              min="0"
              max="60"
              value={filters.layoverDuration}
              onChange={handleFilterChange}
            />
            {filters.layoverDuration} hours
          </label>
        </div>

        <div className="filter-section">
          <label>
            Cabin Class:
            <select
              name="cabinClass"
              value={filters.cabinClass}
              onChange={handleFilterChange}
            >
              <option value="Economy">Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>
          </label>
        </div>

        <div className="filter-section">
          <label>
            Airline:
            <select
              name="airline"
              value={filters.airline}
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              <option value="Malaysia Airlines">Malaysia Airlines</option>
              <option value="British Airways">British Airways</option>
              <option value="Emirates">Emirates</option>
              <option value="Cathay Pacific">Cathay Pacific</option>
              <option value="Singapore Airlines">Singapore Airline</option>
              <option value="Qatar Airways">Qatar Airways</option>
              <option value="Turkish Airlines">Turkish Airlines</option>
              <option value="Saudia Airlines">Saudi Airline</option>
              <option value="Etihad">Etihad Airline</option>
              
              <option value="All Nippon Airways">All Nippon Airways</option>
            </select>
          </label>
        </div>

        <button className="filter-button" onClick={() => {/* Apply Filters */}}>
          Apply Filters
        </button>
      </div>

      <div className="flight-results-content">
  <h1 className="flight-results-title">Flight Results</h1>
  {error && <p className="error">{error}</p>}
  <form className="booking-form" onSubmit={(e) => e.preventDefault()}>
    <div className="form-inline">
      <label>
        <i className="fas fa-plane-departure"></i> From:
        <input
          type="text"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          className="form-input"
          placeholder="Enter origin"
        />
      </label>
      <label>
        <i className="fas fa-plane-arrival"></i> To:
        <input
          type="text"
          value={destinationInput}
          onChange={(e) => setDestinationInput(e.target.value)}
          className="form-input"
          placeholder="Enter destination"
        />
      </label>
      <label>
        <i className="fas fa-calendar-alt"></i> Start Date:
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="form-input"
        />
      </label>
      <label>
        <i className="fas fa-calendar-alt"></i> Return Date:
        <input
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          className="form-input"
        />
      </label>
      <label>
        <i className="fas fa-users"></i> Number of People:
        <input
          type="number"
          value={people}
          onChange={(e) => setPeople(e.target.value)}
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
                      <p className="airport">{flight.origin}</p>
                    </div>
                    <div className="duration">
                      <p>---------------------------------------</p>
                      <p>{flight.duration}</p>
                    </div>
                    <div className="arrival">
                      <p className="time">{flight.arrival}</p>
                      <p className="airport">{flight.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="flight-price">
                <div className="pricefont">
                  <h4> {getTotalCostForFlight(flight.price)} MYR</h4>
                  </div>
                 < div className="button-container"> {/* Add this div for flex layout if not present */}
                  <button
                  onClick={() => handleSelectFlight(flight.id)}
                className="flight-details-button"
                 >
                 View Details
                  </button>
                  <button
                  onClick={() => handleSubmitFlight(flight.id)}
                  className="flight-select-button">
                  Select Flight
                  </button>
                  </div>
                  </div>
                  {selectedFlightId === flight.id && (
 <div className="flight-timeline90">
 {/* Line Container */}
 <div className="timeline-line-container90"></div>

 {/* Departure Section */}
 <div className="timeline-item90">
   <div className="timeline-time90">
     <h4>Boarding</h4>
     <p>{flight.departure}</p>
   </div>
   <div className="timeline-icon90">
     <FaPlaneDeparture />
   </div>
   <div className="timeline-content90">
     <img
       src={airlineLogos[flight.airline]}
       alt={`${flight.airline} Logo`}
       className="airline-logo"
     />
     <h4>{flight.airline}</h4>
     <p>Flight {flight.flightNumber}</p>
     <p>{flight.origin}</p>
   </div>
 </div>

 {/* Arrival Section */}
 <div className="timeline-item90">
   <div className="timeline-time90">
     <h4>Arrival</h4>
     <p>{flight.arrival}</p>
   </div>
   <div className="timeline-icon90">
     <FaPlaneArrival />
   </div>
   <div className="timeline-content90">
   <img
       src={airlineLogos[flight.airline]}
       alt={`${flight.airline} Logo`}
       className="airline-logo"
     />
     <h4>{flight.airline}</h4>
     <p>Flight {flight.flightNumber}</p>
     <p>{flight.destination}</p>
   </div>
 </div>

    {/* Baggage Info */}
    <div className="baggage-info">
      <h4>Complimentary Baggage Allowance</h4>
      <p>The price you're paying includes the following for each person:</p>
      <div className="baggage-details">
        <FaSuitcase />
        <p>Carry-on baggage:   20 kg</p>
      </div>
    </div>

    {/* Close Button */}
    <button className="close-details" onClick={handleCloseDetails}>
      Close
    </button>
  </div>
)}

              </li>
            ))}
          </ul>
        ) : (
          <p>No flights available for your search criteria.</p>
        )}
      </div>
    </div>
  );
}

export default FlightResults;
