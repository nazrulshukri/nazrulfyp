import React from 'react';

const FlightSummary = ({ outboundFlight, returnFlight }) => {
  const outboundPrice = outboundFlight?.price || 0; // Default to 0 if undefined
  const returnPrice = returnFlight?.price || 0; // Default to 0 if undefined

  return (
    <div>
      <h3>Outbound Flight Summary</h3>
      <p>Price: MYR {outboundPrice.toFixed(2)}</p>
      
      <h3>Return Flight Summary</h3>
      <p>Price: MYR {returnPrice.toFixed(2)}</p>
    </div>
  );
};

export default FlightSummary;
