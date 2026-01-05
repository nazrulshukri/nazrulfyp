import React from 'react';

const FlightSelection = ({ outboundFlights, returnFlights, onOutboundFlightSelect, onReturnFlightSelect }) => {
  const handleOutboundSelect = (flight) => {
    onOutboundFlightSelect(flight);
  };

  const handleReturnSelect = (flight) => {
    onReturnFlightSelect(flight);
  };

  return (
    <div>
      <h2>Select Outbound Flight</h2>
      <ul>
        {outboundFlights.map((flight) => (
          <li key={flight.id} onClick={() => handleOutboundSelect(flight)}>
            {flight.flightNumber}
          </li>
        ))}
      </ul>

      <h2>Select Return Flight</h2>
      <ul>
        {returnFlights.map((flight) => (
          <li key={flight.id} onClick={() => handleReturnSelect(flight)}>
            {flight.flightNumber}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FlightSelection;
