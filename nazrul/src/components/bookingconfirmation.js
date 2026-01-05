// src/components/bookingconfirmation.js
import React from 'react';
import { useLocation } from 'react-router-dom';

function BookingConfirmation() {
  const location = useLocation();
  const bookingData = location.state?.bookingData;

  return (
    <div className="confirmation-wrapper">
      <h1>Booking Confirmation</h1>
      {bookingData ? (
        <div>
          <p>Booking ID: {bookingData._id}</p>
          <p>Start Date: {bookingData.startDate}</p>
          <p>Return Date: {bookingData.returnDate}</p>
          <p>From: {bookingData.location}</p>
          <p>To: {bookingData.location1}</p>
          <p>Number of People: {bookingData.people}</p>
          <p>Booking Type: {bookingData.bookingType}</p>
          {/* Add more details as needed */}
        </div>
      ) : (
        <p>No booking details available.</p>
      )}
    </div>
  );
}

export default BookingConfirmation;
