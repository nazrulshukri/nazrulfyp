import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Stepper, Step, StepLabel } from '@mui/material'; // Import MUI components
import trainImage from '../img/assets/train/images (10).png'; // Import your train image
import './fillform.css';
import axios from 'axios'; // To make API requests

const FormPage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Used for navigation
  const { selectedTrain } = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    telephone: '',
    email: '',
    address: '',
  });

  if (!selectedTrain) {
    return <p>No train data available.</p>;
  }

  const steps = ['Select Train', 'Fill Details', 'Confirm Booking']; // Define steps for the stepper

  const {
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
  } = selectedTrain;

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Send form data to MongoDB via API
      const response = await axios.post('http://localhost:5000/bookTrain', {
        ...formData,
        trainDetails: details,
        departureTime,
        price,
        totalPrice,
        LineID,
        origin,
        destination,
      });

      if (response.status === 200) {
        // Redirect to TrainPaymentMethod page after successful booking
        navigate('/trainpayment', {
          state: { bookingDetails: response.data.booking },
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="main-container578">
      {/* Stepper Component */}
      <div className="stepper-container578">
        <Stepper activeStep={1} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </div>

      {/* Container for Train Details and Train Booking Form */}
      <div className="form-container578">
        {/* Train Details Container */}
        <div className="train-details-container578">
          <img src={trainImage} alt="Train" className="train-image" />
          <div className="train-details578">
            <h3>Train Details</h3>
            <p><strong>Route:</strong> {origin} → {destination}</p>
            <p><strong>Departure:</strong> {departureTime}</p>
            <p><strong>Arrival:</strong> {arrivalTime}</p>
            <p><strong>Start Date:</strong> {startDate}</p>
            <p><strong>Return Date:</strong> {returnDate || 'N/A'}</p>
            <p><strong>Price:</strong> MYR {totalPrice}</p>
          </div>
        </div>

        {/* Train Booking Form Container */}
        <div className="booking-form-container578">
          <h2 className="form-header578">Train Booking Form</h2>
          <form onSubmit={handleSubmit} className="form">
            <div className="form-group578">
              <label>Train Details:</label>
              <input type="text" value={details} readOnly className="form-control" />
            </div>
            <div className="form-group578">
              <label>Departure Time:</label>
              <input type="text" value={departureTime} readOnly className="form-control" />
            </div>
            <div className="form-group578">
              <label>Price:</label>
              <input type="text" value={`MYR ${totalPrice}`} readOnly className="form-control" />
            </div>
            <div className="form-group578">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Telephone:</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>
            <button type="submit" className="submit-button">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormPage;
