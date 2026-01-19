import React, { useState } from 'react';
import './transport.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrain } from '@fortawesome/free-solid-svg-icons';
import gatewayIcon from "../img/assets/train/gate.png"; // Update the path to your image
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import axios from 'axios';

const TransportStep = ({
  Image,
  LineID,
  details,
  remark,
  price,
  totalPrice,
  departureTime,
  arrivalTime,
  origin,
  destination,
  startDate,
  returnDate,
}) => {
  const [showTimeline, setShowTimeline] = useState(false); // State to toggle timeline visibility
 
  const navigate = useNavigate(); // Use navigate hook for navigation

  const toggleTimeline = () => {
    setShowTimeline(!showTimeline); // Toggle the timeline
  };

  const handleSelect = async () => {
    // Save the selected train data to MongoDB
    const selectedTrainData = {
      LineID,
      details,
      price,
      totalPrice,
      departureTime,
      arrivalTime,
      origin,
      destination,
      startDate,
      returnDate,
    };

    try {
      await axios.post('http://localhost:5001/selectTrain', { selectedTrain: selectedTrainData });
      setSelectedTrain(selectedTrainData);
      // Navigate to the next page
      navigate('/fillform', { state: { selectedTrain: selectedTrainData } });
    } catch (error) {
      console.error('Error saving train selection:', error);
    }
  };

  return (
    <div className="transport-step">
      <div className="details">
        <div className="details-header">
          <img src={Image} alt="line-image" className="details-header-image" />
          <strong>
            <i className="fa fa-train"></i> {details} {/* Train icon for details */}
          </strong>
        </div>
        <div className="horizontal-layout">
          <span>
            <img src={gatewayIcon} alt="Gateway Icon" style={{ width: "24px", height: "24px" }} /> {LineID}
          </span>
          <span>
            <i className="fa fa-sticky-note"></i> {remark || 'No remark available'} {/* Note icon for remark */}
          </span>
          <p>
            <i className="fa fa-clock"></i> Departure: {departureTime} {/* Clock icon for departure time */}
          </p>
        </div>
      </div>
      {/* Time and Price Section */}
      <div className="time-details">
        <p>
          <i className="fa fa-money-bill-wave"></i> Price:  MYR {price}
        </p>
        <p>
          <i className="fa fa-credit-card"></i> Total: MYR {totalPrice}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn view-details" onClick={toggleTimeline}>
          {showTimeline ? 'Hide Details' : 'View Details'}
        </button>
        <button className="btn select" onClick={handleSelect}>Select</button>
      </div>

      {/* Timeline */}
      {showTimeline && (
        <div className="timeline100">
          <h4 className="timeline-title100">Route Timeline</h4>
          <div className="timeline-container100">
            {/* Departure */}
            <div className="timeline-item100">
              <div className="timeline-dot100">
                <FontAwesomeIcon icon={faTrain} className="timeline-icon100" />
              </div>
              <div className="timeline-content100">
                <h5 className="timeline-heading100">Departure</h5>
                <p><strong>Time:</strong> {departureTime}</p>
                <p><strong>From:</strong> {origin}</p>
                <p><strong>Date:</strong> {startDate}</p>
              </div>
            </div>

            {/* Arrival */}
            <div className="timeline-item100">
              <div className="timeline-dot100">
                <FontAwesomeIcon icon={faTrain} className="timeline-icon100" />
              </div>
              <div className="timeline-content100">
                <h5 className="timeline-heading100">Arrival</h5>
                <p><strong>Time:</strong> {arrivalTime}</p>
                <p><strong>To:</strong> {destination}</p>
                <p><strong>Return Date:</strong> {returnDate}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportStep;

