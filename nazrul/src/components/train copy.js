import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import { mockTrainData } from '../mockdata/train'; // Import the mock data
import RouteSummary from '../components/routesummary';
import TransportStep from '../components/transport'; // Ensure TransportStep can accept 'price' as a prop
import Map from '../components/mapstrain';
import InteractiveButtons from '../components/interactivebuttons';
import './train.css';

const TrainPage = () => {
  const location = useLocation(); // Always call useLocation at the top
  console.log('Location state:', location.state); // For debugging
  
  // Destructure bookingData from location.state
  const { bookingData } = location.state || {};

  // Always call useState before any conditional code
  const [data, setData] = useState(mockTrainData); // Initialize state here

  // If bookingData is not found, handle gracefully after hooks
  if (!bookingData) {
    return <p>No train data available.</p>;
  }

  // Extract values from bookingData
  const { startDate, returnDate, location: origin, location1: destination, people } = bookingData;

  if (!data) return <p>Loading...</p>; // Show loading while data is being fetched

  const travelTime = "3 hr 5 min";
  const arrivalTime = "10:37";

  // Calculate the total price based on the number of people for each route
  const totalPriceForRoutes = data.route.map(route => {
    const price = parseInt(route.price, 10) || 0; // Ensure price is a valid number
    const totalPrice = price * people; // Calculate total price for each route
    console.log(`Route: ${route.Line}, Price: ${price}, Total Price: ${totalPrice}`); // Debugging line
    return {
      ...route,
      totalPrice
    };
  });

  return (
    <div className="train-page">
      <h2>Train Details</h2>
      <div className="search-bar">
  {/* From and To inputs */}
  <div className="input-group">
    <div className="location-input">
      <label htmlFor="from">
        <span className="icon">🚆</span> <strong>From:</strong>
      </label>
      <input
        id="from"
        type="text"
        value={origin}
        className="input-box"
        readOnly
      />
    </div>

    <div className="location-input">
      <label htmlFor="to">
        <span className="icon">🛤️</span> <strong>To:</strong>
      </label>
      <input
        id="to"
        type="text"
        value={destination}
        className="input-box"
        readOnly
      />
    </div>
  </div>

  {/* Date of Departure, Return Date, and People inputs */}
  <div className="input-group">
    <div className="location-input">
      <label htmlFor="departure-date">
        <span className="icon">📅</span> <strong>Date of Departure:</strong>
      </label>
      <input
        id="departure-date"
        type="text"
        value={startDate}
        className="input-box"
        readOnly
      />
    </div>

    <div className="location-input">
      <label htmlFor="return-date">
        <span className="icon">📅</span> <strong>Return Date:</strong>
      </label>
      <input
        id="return-date"
        type="text"
        value={returnDate}
        className="input-box"
        readOnly
      />
    </div>

    <div className="location-input">
      <label htmlFor="people-count">
        <span className="icon">👤</span> <strong>People:</strong>
      </label>
      <input
        id="people-count"
        type="text"
        value={`${people} ${people === 1 ? 'person' : 'people'}`}
        className="input-box"
        readOnly
      />
    </div>
  </div>
</div>

      <RouteSummary travelTime={travelTime} arrivalTime={arrivalTime} />

      {/* Render the route steps using data.route */}
      {data.route.map((step, index) => {
         console.log(step); // Add this to verify the data structure
        // Calculate total price per route
        const price = parseInt(step.price, 10) || 0; // Ensure price is treated as a number
        const totalPrice = price * people; // Calculate total price
        console.log(`Rendering route: ${step.Line}, Price: ${price}, Total Price: ${totalPrice}`); // Debugging line
        return (
          <TransportStep
            key={index}
            LineID={step.LineID}  // LineID for icon or identifier
            details={step.Line} // Display line name
            time={step.Status}  // Display line status
            remark={step.Remark} // Display remark
            price={price}  // Display price per person
            totalPrice={totalPrice} // Display total price for this route
            departureTime={step.departureTime} // Pass departure time
            arrivalTime={step.arrivalTime} // Pass arrival time
            travelTime={step.travelTime} // Pass travel time
          />
        );
      })}

      {/* Add the map component with mapCoords from data */}
      <Map route={data.route.mapCoords} />

      {/* Add interactive buttons */}
      <InteractiveButtons />
    </div>
  );
};

export default TrainPage;
