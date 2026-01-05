import React, { useState } from 'react';
import './SeatBooking.css';

const SeatBooking = ({ onSeatsSelected }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const seats = [
    ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
    ['B1', 'B2', 'B3', 'B4', 'B5', 'B6'],
    ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'],
    // Add more seat rows if needed
  ];

  const toggleSeatSelection = (seat) => {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
    // Pass the selected seats back to the parent component
    onSeatsSelected(selectedSeats);
  };

  return (
    <div className="seat-booking">
      <h2>Select a Seat</h2>
      <div className="seat-grid">
        {seats.map((row, rowIndex) => (
          <div key={rowIndex} className="seat-row">
            {row.map((seat) => (
              <div
                key={seat}
                className={`seat ${selectedSeats.includes(seat) ? 'selected' : 'available'}`}
                onClick={() => toggleSeatSelection(seat)}
              >
                {seat}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="seat-summary">
        <h4>Selected Seats: {selectedSeats.join(', ') || 'None'}</h4>
      </div>
    </div>
  );
};

export default SeatBooking;
