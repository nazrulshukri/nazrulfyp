import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import './trainpayment.css';

const TrainPaymentMethod = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingDetails } = location.state || {}; // Get booking details passed from the previous page

  const [paymentMethod, setPaymentMethod] = useState('creditCard'); // Default payment method
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [paymentStatus, setPaymentStatus] = useState(null); // Holds payment status message

  // If no booking details are available, show an error
  if (!bookingDetails) {
    return <p>No booking data available.</p>;
  }

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      // Send payment details to the backend
      const paymentData = {
        trainId: bookingDetails.trainId,
        origin: bookingDetails.origin,
        destination: bookingDetails.destination,
        departureTime: bookingDetails.departureTime,
        totalPrice: bookingDetails.totalPrice,
        paymentMethod: paymentMethod,
        cardDetails: cardDetails,
      };
  
      const response = await fetch('http://localhost:5000/trainsubmit-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
  
      if (response.ok) {
        // Simulate a successful payment
        const data = await response.json();
        setPaymentStatus('Payment Successful!');
        
        // Navigate to the confirmation page and pass booking details
        setTimeout(() => {
          navigate('/trainConfirmation', {
            state: { bookingDetails: data }, // Send saved payment details to confirmation page
          });
        }, 2000); // Simulate delay for payment processing
      } else {
        setPaymentStatus('Payment Failed! Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('Payment Failed! Please try again.');
    }
  };
  

  // Handle input changes for card details
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value,
    });
  };

  return (
    <div className="payment-container900">
      {/* Payment Header */}
      <Typography variant="h4" className="payment-header900" gutterBottom>
       <i className="fas fa-train"></i> Complete Your Payment
      </Typography>

      {/* Train Booking Summary */}
<div className="booking-summary900">
  <Typography variant="h6" className="summary-header">
    Booking Summary
  </Typography>
  <Typography variant="body1">
    <strong>Train Route:</strong> {bookingDetails.origin} → {bookingDetails.destination}
  </Typography>
  <Typography variant="body1">
    <strong>Departure:</strong> {bookingDetails.departureTime}
  </Typography>
  <Typography variant="body1">
    <strong>Total Price:</strong> <span className="price-highlight">MYR {bookingDetails.totalPrice}</span>
  </Typography>
</div>

{/* Payment Method Selection */}
<div className="payment-method900">
  <FormControl fullWidth>
    <InputLabel id="payment-method-label900">Payment Method</InputLabel>
    <Select
      labelId="payment-method-label900"
      value={paymentMethod}
      onChange={(e) => setPaymentMethod(e.target.value)}
      className="select-input"
    >
      <MenuItem value="creditCard900">
        <i className="fas fa-credit-card"></i> Credit Card
      </MenuItem>
      <MenuItem value="paypal">
        <i className="fab fa-paypal"></i> PayPal
      </MenuItem>
    </Select>
  </FormControl>
</div>

{/* Credit Card Payment Form */}
{paymentMethod === 'creditCard900' && (
  <form onSubmit={handleSubmit} className="payment-form900">
    <TextField
      label="Card Number"
      variant="outlined"
      fullWidth
      name="cardNumber"
      value={cardDetails.cardNumber}
      onChange={handleCardChange}
      required
      className="form-field"
      placeholder="1234 5678 9012 3456"
    />
    <Box className="card-details">
      <TextField
        label="Expiry Date (MM/YY)"
        variant="outlined"
        fullWidth
        name="expiryDate"
        value={cardDetails.expiryDate}
        onChange={handleCardChange}
        required
        className="form-field"
        placeholder="MM/YY"
      />
      <TextField
        label="CVV"
        variant="outlined"
        fullWidth
        name="cvv"
        value={cardDetails.cvv}
        onChange={handleCardChange}
        required
        className="form-field"
        placeholder="123"
      />
    </Box>
    <Button
      type="submit"
      variant="contained"
      color="primary"
      fullWidth
      className="submit-button"
    >
      Pay MYR {bookingDetails.totalPrice}
    </Button>
  </form>
)}

{/* PayPal Payment Option */}
{paymentMethod === 'paypal' && (
  <div className="paypal-option">
    <Typography variant="body1">
      You will be redirected to PayPal to complete your payment.
    </Typography>
    <Button
      variant="contained"
      color="secondary"
      fullWidth
      className="paypal-button"
    >
      Pay with PayPal
    </Button>
  </div>
)}

{/* Display Payment Status */}
{paymentStatus && (
  <Typography
    variant="h6"
    color={paymentStatus === 'Payment Successful!' ? 'green' : 'red'}
    className="payment-status"
  >
    {paymentStatus}
  </Typography>
)}
    </div>
  );
};

export default TrainPaymentMethod;
