// src/components/HotelsByCoordinates.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { fetchHotelsByCoordinates } from './api'; // Import the centralized API function

function HotelsByCoordinates() {
  const location = useLocation();
  const { bookingData } = location.state || {};
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHotels = async () => {
      if (bookingData) {
        try {
          const results = await fetchHotelsByCoordinates(bookingData);
          setHotels(results);
        } catch (error) {
          setError('Error fetching hotels.');
          console.error('Error:', error);
        }
      }
    };

    fetchHotels();
  }, [bookingData]);

  return (
    <div>
      <h1>Hotels</h1>
      {error && <p>{error}</p>}
      <ul>
        {hotels.map(hotel => (
          <li key={hotel.id}>{hotel.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default HotelsByCoordinates;
