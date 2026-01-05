import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { mockTrainData } from "../mockdata/train";
import RouteSummary from "../components/routesummary";
import TransportStep from "../components/transport";
import Map from "../components/mapstrain";
import InteractiveButtons from "../components/interactivebuttons";
import "./train.css";

const TrainPage = () => {
  const location = useLocation();

  // Always call hooks unconditionally
  const [data] = useState(mockTrainData);

  const { bookingData } = location.state || {};

  if (!bookingData) {
    return <p>No train data available.</p>;
  }

  const { startDate, returnDate, location: origin, location1: destination, people } = bookingData;

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toISOString().split("T")[0];
  };

  // Pass all routes to Map component
  const trainRoutes = data.route || [];




  return (
    <div className="train-page">
      <h2>Train Details</h2>
      {/* Search bar */}
      <div className="search-bar">
        <div className="input-group">
          <div className="location-input">
            <label htmlFor="from">
              <span className="icon">🚆</span> <strong>From:</strong>
            </label>
            <input id="from" type="text" value={origin} className="input-box" readOnly />
          </div>
          <div className="location-input">
            <label htmlFor="to">
              <span className="icon">🛤️</span> <strong>To:</strong>
            </label>
            <input id="to" type="text" value={destination} className="input-box" readOnly />
          </div>
        </div>

        <div className="input-group">
          <div className="location-input">
            <label htmlFor="departure-date">
              <span className="icon">📅</span> <strong>Date of Departure:</strong>
            </label>
            <input
              id="departure-date"
              type="text"
              value={formatDate(startDate)}
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
              value={formatDate(returnDate)}
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
              value={`${people} ${people === 1 ? "person" : "people"}`}
              className="input-box"
              readOnly
            />
          </div>
        </div>
        <button className="search-btn">Search</button>
      </div>

      {/* Map Component */}
      <Map trainRoutes={trainRoutes} />

      <h2>Train list</h2>

      {/* Transport Steps */}
      {data.route.map((step, index) => (
        <TransportStep
          key={index}
          Image={step.Image}
          LineID={step.LineID}
          details={step.Line}
          time={step.Status}
          remark={step.Remark}
          price={parseInt(step.price, 10) || 0}
          totalPrice={parseInt(step.price, 10) * people || 0}
          departureTime={step.departureTime}
          arrivalTime={step.arrivalTime}
          travelTime={step.travelTime}
          origin={origin}
          destination={destination}
          startDate={formatDate(startDate)}
          returnDate={formatDate(returnDate)}
        />
      ))}
    </div>
  );
};

export default TrainPage;
