import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { generateMockFlights } from "../mockdata/flights";
import "./flightresults.css";

import malaysiaLogo from "../img/assets/images.png";
import britishAirwaysLogo from "../img/assets/britishairways.jpg";
import emiratesLogo from "../img/assets/Emirates_logo.png";
import emiratesLogo1 from "../img/assets/flightlogo/Cathay_Pacific-Logo.wine.png";
import emiratesLogo2 from "../img/assets/flightlogo/d9b0566be426fb2a5edb292e1231a974.jpg";
import emiratesLogo3 from "../img/assets/flightlogo/Etihad-airways-logo.svg.png";
import emiratesLogo4 from "../img/assets/flightlogo/images (4).png";
import emiratesLogo5 from "../img/assets/flightlogo/Logo_of_Saudia.svg.png";
import emiratesLogo6 from "../img/assets/flightlogo/Qatar_Airways-Logo.wine.png";
import emiratesLogo7 from "../img/assets/flightlogo/Turkish_Airlines-Logo.wine.png";

import { FaSuitcase } from "react-icons/fa";

const airlineLogos = {
  "Malaysia Airlines": malaysiaLogo,
  "British Airways": britishAirwaysLogo,
  Emirates: emiratesLogo,
  "Cathay Pacific": emiratesLogo1,
  "Singapore Airlines": emiratesLogo2,
  Etihad: emiratesLogo3,
  "All Nippon Airways": emiratesLogo4,
  "Saudia Airlines": emiratesLogo5,
  "Qatar Airways": emiratesLogo6,
  "Turkish Airlines": emiratesLogo7,
};

function FlightResults() {
  const navigate = useNavigate();

  // ✅ get router state safely
  const { state } = useLocation();
  const { flightParams } = state || {};
  const [infoOpenId, setInfoOpenId] = useState(null);
  // ✅ tripType: "return" | "oneway"
  const tripType = flightParams?.tripType || "return";

  const [flights, setFlights] = useState([]);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [selectedFlightId, setSelectedFlightId] = useState(null);

  const [people, setPeople] = useState(Number(flightParams?.people || 1));
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState(flightParams?.departureDate || "");
  const [returnDate, setReturnDate] = useState(flightParams?.returnDate || "");
  const [locationInput, setLocationInput] = useState(flightParams?.origin || "");
  const [destinationInput, setDestinationInput] = useState(flightParams?.destination || "");

  const fmtTime = (iso) => {
  if (!iso) return "";

  const d = new Date(iso);

  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};
  const [filters, setFilters] = useState({
    nonStop: false,
    layovers: "any",
    journeyDuration: 59,
    layoverDuration: 25,
    cabinClass: "Economy",
    airline: "All",
  });


  const toggleInfo = (id) => {
  setInfoOpenId((prev) => (prev === id ? null : id));
};

  // ✅ guard when user refreshes / no navigation state
  useEffect(() => {
    if (!flightParams) {
      setError("No flight search data. Please search again.");
    }
  }, [flightParams]);

  // ✅ generate flights
  useEffect(() => {
    if (!flightParams) return;

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
      setError("");
    } catch (err) {
      setError("Error fetching flight data.");
      console.error("Error:", err);
    }
  }, [flightParams, startDate, returnDate, locationInput, destinationInput, people]);

  // ✅ apply filters
  useEffect(() => {
    let filtered = flights;

    if (filters.nonStop) {
      filtered = filtered.filter((flight) => flight.nonStop);
    }

    if (filters.layovers === "none") {
      filtered = filtered.filter((flight) => !flight.layovers || flight.layovers === 0);
    }

    if (filters.airline !== "All") {
      filtered = filtered.filter((flight) => flight.airline === filters.airline);
    }

    setFilteredFlights(filtered);
  }, [flights, filters]);

  const getTotalCostForFlight = (pricePerPerson) => {
    return (pricePerPerson * people).toFixed(2);
  };

  const handleFilterChange = (e) => {
    const { name, value, type } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "radio" ? value : value,
    }));
  };

  const handleSelectFlight = (id) => setSelectedFlightId(id);
  const handleCloseDetails = () => setSelectedFlightId(null);
  
  // ✅ select outbound flight -> return OR payment (oneway)
  const handleSubmitFlight = async (id) => {
    const selectedFlight = flights.find((f) => f.id === id);
    if (!selectedFlight) return;

    const totalPrice = getTotalCostForFlight(selectedFlight.price);

    if (tripType === "return") {
      navigate("/return", {
        state: {
          selectedOutboundFlight: selectedFlight,
          outboundPrice: totalPrice,
          locationInput,
          destinationInput,
          startDate,
          returnDate,
          people,
          tripType: "return",
        },
      });
    } else {
      // ✅ ONEWAY => skip return page
      navigate("/payment", {
        state: {
          // pass both keys (your Payment page uses both styles)
          selectedOutboundFlight: selectedFlight,
          outboundFlight: selectedFlight,

          selectedReturnFlight: null,
          returnFlight: null,

          outboundPrice: totalPrice,
          price: totalPrice,

          locationInput,
          destinationInput,
          startDate,
          people,
          tripType: "oneway",
        },
      });
    }

    // ✅ still save outbound to backend (doesn't block navigation)
    try {
      await fetch("http://localhost:5001/flightresults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedFlight.id,
          airline: selectedFlight.airline,
          flightNumber: selectedFlight.flightNumber,
          departure: selectedFlight.departure,
          arrival: selectedFlight.arrival,
          price: totalPrice,
          origin: selectedFlight.origin,
          destination: selectedFlight.destination,
          nonStop: selectedFlight.nonStop,
        }),
      });
    } catch (err) {
      console.warn("Backend save failed (ignored):", err);
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
                checked={filters.layovers === "any"}
                onChange={handleFilterChange}
              />
              Any
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="layovers"
                value="none"
                checked={filters.layovers === "none"}
                onChange={handleFilterChange}
              />
              Non-stop
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="layovers"
                value="1"
                checked={filters.layovers === "1"}
                onChange={handleFilterChange}
              />
              Up to 1 stop
            </label>

            <label className="radio-label">
              <input
                type="radio"
                name="layovers"
                value="2"
                checked={filters.layovers === "2"}
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
            <select name="cabinClass" value={filters.cabinClass} onChange={handleFilterChange}>
              <option value="Economy">Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>
          </label>
        </div>

        <div className="filter-section">
          <label>
            Airline:
            <select name="airline" value={filters.airline} onChange={handleFilterChange}>
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

        <button className="filter-button" onClick={() => {}}>
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

            {/* ✅ hide return date for oneway */}
            {tripType !== "oneway" && (
              <label>
                <i className="fas fa-calendar-alt"></i> Return Date:
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="form-input"
                />
              </label>
            )}

            <label>
              <i className="fas fa-users"></i> Number of People:
              <input
                type="number"
                value={people}
                onChange={(e) => setPeople(Number(e.target.value))}
                min="1"
                className="form-input"
              />
            </label>
          </div>
        </form>

        {filteredFlights.length > 0 ? (
          <ul className="flight-list">
            {filteredFlights.map((flight) => (
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
                      <p className="time">{fmtTime(flight.departure)}</p>
                      <p className="airport">{flight.origin}</p>
                    </div>
                   <div className="duration">
  <span className="route-line left"></span>
  <span className="route-plane">✈</span>
  <span className="route-line right"></span>
</div>
                    <div className="arrival">
                      <p className="time">{fmtTime(flight.arrival)}</p>
                      <p className="airport">{flight.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="flight-price">
                  <div className="pricefont">
                    <h4>{getTotalCostForFlight(flight.price)} MYR</h4>
                  </div>

                  <div className="button-container">
                    <button
                      type="button"
                      onClick={() => handleSelectFlight(flight.id)}
                      className="flight-details-button"
                    >
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSubmitFlight(flight.id)}
                      className="flight-select-button"
                    >
                      Select Flight
                    </button>
                  </div>
                </div>

{selectedFlightId === flight.id && (
  <div className="flight-detailsSheet">
    {/* Timeline column INSIDE the sheet */}
    <div className="fd-leftRail">
      <span className="fd-dot" />
      <span className="fd-rail" />
      <span className="fd-dot" />
    </div>

    <div className="fd-body">
      {/* Header row */}
     <div className="fd-head">
  <div className="fd-headLeft">
    <span className="fd-airline">{flight.airline}</span>
    <span className="fd-flightNo">{flight.flightNumber}</span>
  </div>
</div>

      {/* Departure block */}
      <div className="fd-stop">
        <div className="fd-row">
          <div className="fd-time">{fmtTime(flight.departure)}</div>
          <div className="fd-code">{flight.origin}</div>
          <div className="fd-place">{flight.originFull || "Kuala Lumpur International Airport"}</div>
        </div>

<div className="fd-meta">
  <span className="fd-chip">⏱ {flight.duration}</span>
  <span className="fd-chip">🍱 Meal</span>
  <span className="fd-chip">📶 Wi-Fi</span>
  <span className="fd-chip">🔌 Power</span>

  <button
    type="button"
    className="fd-infoBtn"
    onClick={() => toggleInfo(flight.id)}
  >
    {infoOpenId === flight.id ? "Hide info" : "Show info"}
  </button>
</div>

        {/* Expandable info (like screenshot #2) */}
        <div className={`fd-expand ${infoOpenId === flight.id ? "open" : ""}`}>
          <div className="fd-expandInner">
            <div className="fd-infoRow">✈️ <span>A350 (widebody)</span></div>
            <div className="fd-infoRow">💺 <span>3-3-3 seat layout</span></div>
            <div className="fd-infoRow">📏 <span>79 cm seat pitch</span></div>
            <div className="fd-dash" />
            <div className="fd-infoRow">🍱 <span>Meal provided</span></div>
            <div className="fd-infoRow">📺 <span>Seatback on-demand & live TV</span></div>
            <div className="fd-infoRow">📶 <span>Basic web browsing (fee)</span></div>
            <div className="fd-infoRow">🔌 <span>Power & USB outlets</span></div>
          </div>
        </div>
      </div>

      {/* Separation like timeline break */}
      {!flight.nonStop && (
        <div className="fd-layover">
          <span className="fd-layoverTime">4h 40</span>
          <span className="fd-layoverText">Connect in airport</span>
          <span className="fd-layoverTag">Long wait</span>
        </div>
      )}

      {/* Arrival block */}
      <div className="fd-stop">
        <div className="fd-row">
          <div className="fd-time">{fmtTime(flight.arrival)}</div>
          <div className="fd-code">{flight.destination}</div>
          <div className="fd-place">{flight.destFull || "London Heathrow Airport"}</div>
        </div>
      </div>

      {/* Baggage */}
      <div className="fd-baggage">
        <div className="fd-bagTitle">Complimentary Baggage Allowance</div>
        <div className="fd-bagRow">
          <FaSuitcase />
          <span>Carry-on baggage: 20 kg</span>
        </div>
      </div>

      <button className="fd-closeBtn" onClick={handleCloseDetails} type="button">
        Close
      </button>
    </div>
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