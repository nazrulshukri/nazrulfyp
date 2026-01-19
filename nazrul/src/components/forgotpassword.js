import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './forgtopassword.css'; // External CSS for custom styling
import forgotPasswordImage from '../img/assets/Booking1.png'; // Importing image file

const ForgotPassword = () => {
  const [email, setEmail] = useState(''); // State for storing email value

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with email:', email); // Debugging line
    try {
      const response = await axios.post('http://localhost:5001/forgotpassword', { email });
      toast.success(response.data.message, {
        position: "top-center", // Corrected position as string
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('Error sending email. Please try again.', {
        position: "top-center", // Corrected position as string
        autoClose: 3000,
      });
    }
  };

  const handleEmailChange = (e) => {
    console.log('Email being typed:', e.target.value); // Debugging line
    setEmail(e.target.value); // Update email value on change
  };

  return (
    <div className="forgot-password-container">
      <div className="form-card">
        {/* Adding Image */}
        <div className="image-container">
          <img
            src={forgotPasswordImage}
            alt="Forgot Password"
            className="forgot-password-image"
          />
        </div>
        <h3>Forgot Password</h3>
        <p className="subtitle">
          Enter your email address, and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit}>
  <div className="form-group">
    <input
      type="email"
      className="form-control"
      placeholder="Enter your email"
      value={email}
      onChange={handleEmailChange}
      required
    />
  </div>
  <button type="submit" className="btn1 btn-primary">
    Send Reset Link
  </button>

 
</form>
      </div>
      {/* ToastContainer for notifications */}
      <ToastContainer />
    </div>
  );
};

export default ForgotPassword;

