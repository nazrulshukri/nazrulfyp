import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ConfirmationDialog from './confirmationdialog';
import bookingflexlogo from '../img/assets/Booking1.png'; // Import your logo image
import { FaCheckCircle, FaUser, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import './hotelpaymentdone.css';

const HotelPaymentDone = () => {
  const location = useLocation();
  const { paymentData } = location.state || {};

  // State to control ConfirmationDialog visibility
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Show dialog on component mount
  useEffect(() => {
    setIsDialogOpen(true);
  }, []);

  // Function to close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="payment-success909">
      {isDialogOpen && <ConfirmationDialog onClose={handleCloseDialog} />}
      <div className="header-container909">
        <img src={bookingflexlogo} alt="BookingFlex Logo" className="logo-circle" />
        <h2>Booking Successful!</h2>
      </div>
      <FaCheckCircle style={{ fontSize: '50px', color: '#2ecc71' }} />
      <p>Your booking has been confirmed and payment completed successfully.</p>

      <div className="booking-summary909">
        <h3>Booking Details</h3>
        <p><FaUser /> <strong>Hotel:</strong> {paymentData?.hotelName || "N/A"}</p>
        <p><strong>Location:</strong> {paymentData?.location || "N/A"}</p>
        <p><FaMoneyBillWave /> <strong>Total Price:</strong> MYR {paymentData?.totalPrice || "N/A"}</p>
        <p><FaCalendarAlt /> <strong>Stay Duration:</strong> {paymentData?.checkInDate || "N/A"} to {paymentData?.checkOutDate || "N/A"}</p>
        <p><strong>Number of Guests:</strong> {paymentData?.people || "N/A"}</p>
        <p><strong>User:</strong> {paymentData?.userData?.firstName || "N/A"} {paymentData?.userData?.lastName || ""}</p>
        <p><strong>Email:</strong> {paymentData?.userData?.email || "N/A"}</p>
        <p><strong>Payment Method:</strong> {paymentData?.paymentMethod || "N/A"}</p>
        <p><strong>Status:</strong> {paymentData?.status || "N/A"}</p>
      </div>
    </div>
  );
};

export default HotelPaymentDone;
