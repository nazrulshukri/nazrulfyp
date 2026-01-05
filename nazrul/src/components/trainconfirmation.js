import React from 'react';
import { useLocation } from 'react-router-dom';
import { Button, Typography, Box, Grid, CircularProgress } from '@mui/material';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './trainconfirmation.css';

const TrainConfirmation = () => {
  const { bookingDetails } = useLocation().state || {}; // Get booking details passed from the payment page

  if (!bookingDetails) {
    return <CircularProgress />;
  }

  const paymentStatusClass = bookingDetails.paymentStatus === 'Success' ? 'success' : 'failed';

  return (
    <div className="confirmation-container">
      <Typography variant="h3" className="confirmation-header">
        Payment Confirmation
      </Typography>

      {/* Booking Summary */}
      <Box className="confirmation-summary">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6"><strong>Train Route:</strong> {bookingDetails.origin} → {bookingDetails.destination}</Typography>
            <Typography variant="h6"><strong>Departure:</strong> {bookingDetails.departureTime}</Typography>
            <Typography variant="h6"><strong>Total Price:</strong> MYR {bookingDetails.totalPrice}</Typography>
          </Grid>

          {/* Payment Status */}
          <Grid item xs={12} md={6} className="payment-status-container">
            <Typography variant="h6" className={`payment-status ${paymentStatusClass}`}>
              <span className="status-icon">
                {bookingDetails.paymentStatus === 'Success' ? (
                  <FaCheckCircle className="status-icon success-icon" />
                ) : (
                  <FaTimesCircle className="status-icon failed-icon" />
                )}
              </span>
              {bookingDetails.paymentStatus}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Action Button */}
      <div className="confirmation-button-container">
        <Button
          variant="contained"
          color="primary"
          className="confirmation-button"
          onClick={() => window.location.href = '/home'}
          size="large"
        >
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default TrainConfirmation;
