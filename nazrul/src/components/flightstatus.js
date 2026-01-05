import React, { useState } from 'react';
import './flightstatus.css';
import axios from 'axios';
import { FaPlaneDeparture,FaPlaneArrival,FaPlane, FaSearch,FaBuilding,FaSignal,FaClock,FaMapMarkerAlt,FaTachometerAlt} from 'react-icons/fa';

function FlightStatus() {
  const [flightId, setFlightId] = useState('');
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrackFlight = async () => {
    setLoading(true);
    setError(null);
    setFlightData(null); 
    try {
      const response = await axios.get('https://api.aviationstack.com/v1/flights', {
        params: {
          access_key: '9287f2a8724133b001f230ca478b6c9c',
          flight_iata: flightId,
        },
      });

      const flight = response.data?.data?.[0];

      if (!flight) {
        setError('Flight not found. Please check the ID and try again.');
      } else {
        setFlightData(flight);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch flight data. Please try again later.');
    }

    setLoading(false);
  };

  return (
    <div className="flight-container">
      <h1 className="title"><FaPlane /> Flight Tracker</h1>
<div className="input-wrapper">
  <input
    type="text"
    placeholder="Enter Flight ID (e.g., AA100)"
    value={flightId}
    onChange={(e) => setFlightId(e.target.value)}
  />
  <FaSearch className="input-icon" />
</div>

<button onClick={handleTrackFlight} className="input-btn">
  Track
</button>



      {loading && <p className="loading-text">Your flight search will show shortly...</p>}

      {error && (
        <div className="error-overlay">
          <div className="error-popup">
            <strong>⚠️ Error:</strong> {error}
            <button onClick={() => setError(null)} className="close-button">✖</button>
          </div>
        </div>
      )}

     {flightData && (
  <div className="flight-card">
    <h2 className="flight-title"><FaPlane /> Flight Details</h2>

    {/* Flight route line */}
    <div className="flight-route">
      <div className="flight-airport">
        <FaPlaneDeparture className="icon" />
        <span className="airport-name">{flightData.departure.airport}</span>
        <span className="airport-time">{new Date(flightData.departure.scheduled).toLocaleTimeString()}</span>
        <span className="airport-terminal">Terminal: {flightData.departure.terminal || 'N/A'}</span>
      </div>

      <div className="flight-line">
        <FaPlane className="plane-icon" />
      </div>

      <div className="flight-airport">
        <FaPlaneArrival className="icon" />
        <span className="airport-name">{flightData.arrival.airport}</span>
        <span className="airport-time">{new Date(flightData.arrival.scheduled).toLocaleTimeString()}</span>
        <span className="airport-terminal">Terminal: {flightData.arrival.terminal || 'N/A'}</span>
      </div>
    </div>

    {/* Flight info list */}
    <div className="flight-info-list">
      <div className="flight-info-item">
        <FaPlane /> {flightData.flight.iata}
      </div>
      <div className="flight-info-item">
        <FaBuilding /> {flightData.airline.name}
      </div>
      <div className="flight-info-item">
        <FaSignal /> Status: {flightData.flight_status}
      </div>
      <div className="flight-info-item">
        <FaClock /> Delay: {flightData.departure.delay ? `${flightData.departure.delay} min` : '0'}
      </div>
      {flightData.live && (
        <div className="flight-info-item">
          <FaMapMarkerAlt /> Lat: {flightData.live.latitude}, Lon: {flightData.live.longitude}
        </div>
      )}
      {flightData.live && (
        <div className="flight-info-item">
          <FaTachometerAlt /> Speed: {flightData.live.speed_horizontal ? flightData.live.speed_horizontal.toFixed(1) : '0'} km/h
        </div>
      )}
    </div>
  </div>
)}
    </div>
  );
}

export default FlightStatus;
