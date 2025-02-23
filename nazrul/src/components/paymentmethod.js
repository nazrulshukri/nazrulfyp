import axios from 'axios';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './paymentmethod.css';

// Importing specific icons for each field
import paypalIcon from '../img/assets/seat/Paypal_2014_logo.png';
import cardIcon from '../img/assets/seat/Mastercard-logo.svg.png';
import fpxIcon from '../img/assets/seat/images.png';
import applePayIcon from '../img/assets/seat/Apple_Pay-Logo.wine.png';
import emailIcon from '../img/assets/seat/email-icon--clipart-best-22.png'; // Replace with actual path
import cvvIcon from '../img/assets/seat/4117733.png'; // Replace with actual path
import expiryIcon from '../img/assets/seat/2068755-200.png'; // Replace with actual path
import accountIcon from '../img/assets/seat/user-icon-trendy-flat-style-600nw-1697898655.webp'; // Replace with actual path
import bankIcon from '../img/assets/seat/bank-vector-icon-isolated-on-transparent-background-bank-logo-concept-P28454.jpg'; // Replace with actual path

const PaymentMethodPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, totalAmount, outboundFlight, returnFlight, passengerDetails, selectedSeats, selectedInsurance } = location.state;
  const [paymentType, setPaymentType] = useState('paypal');
  const [paypalDetails, setPaypalDetails] = useState({ email: '' });
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });
  const [fpxDetails, setFpxDetails] = useState({ accountNumber: '', bankName: '' });
  const [applePayDetails, setApplePayDetails] = useState({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' });

  console.log('Received Booking Data:', {
    bookingId,
    totalAmount,
    outboundFlight,
    returnFlight,
    passengerDetails,
    selectedSeats,
    selectedInsurance,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    switch (paymentType) {
      case 'paypal':
        setPaypalDetails({ ...paypalDetails, [name]: value });
        break;
      case 'card':
        setCardDetails({ ...cardDetails, [name]: value });
        break;
      case 'fpx':
        setFpxDetails({ ...fpxDetails, [name]: value });
        break;
      case 'applePay':
        setApplePayDetails({ ...applePayDetails, [name]: value });
        break;
      default:
        break;
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    const paymentData = {
        bookingId,
        paymentMethod: paymentType,
        amount: totalAmount,
        status: 'Confirmed',
        paymentDetails: paymentType === 'paypal' ? paypalDetails :
                        paymentType === 'card' ? cardDetails :
                        paymentType === 'fpx' ? fpxDetails :
                        applePayDetails,

        // Ensure that email is taken from passengerDetails
        email: passengerDetails.email, // Add this line
        outboundFlight,
        returnFlight,
        passengerDetails,
        selectedSeats,
        selectedInsurance,
    };

    console.log("Payment Data:", JSON.stringify(paymentData, null, 2));
    
    try {
        // Send payment data to the backend
        const response = await axios.post('http://localhost:5000/submit-payment', paymentData);

        if (response.data.success) {
            console.log('Payment saved successfully:', response.data);
            navigate('/ticketpage', { state: paymentData });
        } else {
            console.error('Payment submission failed:', response.data.message);
            alert('Failed to save payment. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting payment:', error);
        alert('Error processing payment. Please try again.');
    }
};

  return (
    <div className="payment-page1">
      <div className="payment-sidebar1">
        <h2>Select Payment Method</h2>
        <div
          className={`payment-option1 ${paymentType === 'paypal' ? 'active' : ''}`}
          onClick={() => setPaymentType('paypal')}
        >
          <label>
            <img src={paypalIcon} alt="PayPal Icon" className="payment-icon" />
            PayPal
          </label>
        </div>
        <div
          className={`payment-option1 ${paymentType === 'card' ? 'active' : ''}`}
          onClick={() => setPaymentType('card')}
        >
          <label>
            <img src={cardIcon} alt="Card Icon" className="payment-icon" />
            Credit/Debit Card
          </label>
        </div>
        <div
          className={`payment-option1 ${paymentType === 'fpx' ? 'active' : ''}`}
          onClick={() => setPaymentType('fpx')}
        >
          <label>
            <img src={fpxIcon} alt="FPX Icon" className="payment-icon" />
            FPX (Bank Transfer)
          </label>
        </div>
        <div
          className={`payment-option1 ${paymentType === 'applePay' ? 'active' : ''}`}
          onClick={() => setPaymentType('applePay')}
        >
          <label>
            <img src={applePayIcon} alt="Apple Pay Icon" className="payment-icon" />
            Apple Pay
          </label>
        </div>
      </div>

      

      <div className="payment-content1">
        <form className="payment-method-form1" onSubmit={handlePaymentSubmit}>
          {paymentType === 'paypal' && (
            <div className="form-group1">
              <label>PayPal Email</label>
              <div className="input-icon-wrapper78">
                <img className="input-icon1" src={emailIcon} alt="Email icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your PayPal email"
                  value={paypalDetails.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          )}
          {paymentType === 'card' && (
            <>
              <div className="form-group1">
                <label>Card Number</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={cardIcon} alt="Card icon" />
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group1">
                <label>Card Holder Name</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={cardIcon} alt="Card icon" />
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="Card Holder Name"
                    value={cardDetails.cardHolder}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group1">
                <label>Expiry Date (MM/YY)</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={expiryIcon} alt="Expiry icon" />
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group1">
                <label>CVV</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={cvvIcon} alt="CVV icon" />
                  <input
                    type="text"
                    name="cvv"
                    placeholder="CVV"
                    value={cardDetails.cvv}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </>
          )}
          {paymentType === 'fpx' && (
            <>
              <div className="form-group1">
                <label>Account Number</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={accountIcon} alt="Account icon" />
                  <input
                    type="text"
                    name="accountNumber"
                    placeholder="Account Number"
                    value={fpxDetails.accountNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group1">
                <label>Bank Name</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={bankIcon} alt="Bank icon" />
                  <input
                    type="text"
                    name="bankName"
                    placeholder="Bank Name"
                    value={fpxDetails.bankName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </>
          )}
          {paymentType === 'applePay' && (
            <>
              <div className="form-group1">
                <label>Card Number</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={applePayIcon} alt="Apple Pay icon" />
                  <input
                    type="text"
                    name="cardNumber"
                    placeholder="Card Number"
                    value={applePayDetails.cardNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group1">
                <label>Card Holder Name</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={applePayIcon} alt="Apple Pay icon" />
                  <input
                    type="text"
                    name="cardHolder"
                    placeholder="Card Holder Name"
                    value={applePayDetails.cardHolder}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group1">
                <label>Expiry Date (MM/YY)</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={expiryIcon} alt="Expiry icon" />
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={applePayDetails.expiryDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group1">
                <label>CVV</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={cvvIcon} alt="CVV icon" />
                  <input
                    type="text"
                    name="cvv"
                    placeholder="CVV"
                    value={applePayDetails.cvv}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </>
          )}
          <button className="payment-button" type="submit">Proceed to Pay</button>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodPage;
