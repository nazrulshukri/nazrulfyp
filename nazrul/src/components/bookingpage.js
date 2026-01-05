import React from 'react';
import { useLocation } from 'react-router-dom';

const Payment = () => {
  const location = useLocation();
  const { outboundFlight, returnFlight, selectedSeats, passengerDetails } = location.state;

  return (
    <div>
      <h1>Payment Summary</h1>
      <h2>Outbound Flight: {outboundFlight?.flightNumber}</h2>
      <h2>Return Flight: {returnFlight?.flightNumber}</h2>
      <h2>Selected Seats: {selectedSeats.join(', ') || 'None'}</h2>
      <h3>Passenger Details</h3>
      <p>Name: {passengerDetails.name}</p>
      <p>Type: {passengerDetails.type}</p>
      <p>Nationality: {passengerDetails.nationality}</p>
      <p>Date of Birth: {passengerDetails.dob}</p>
      {/* Render other payment details as needed */}
    </div>
  );
};

export default Payment;
