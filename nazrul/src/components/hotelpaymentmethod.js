import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './hotelpaymentmethod.css';
import visa from '../img/assets/seat/images.png';
import mastercard from '../img/assets/seat/Mastercard-logo.svg.png';
import americanexpress from '../img/assets/seat/png-transparent-american-express-icon.png';
import paypal from '../img/assets/paymentmethod/PayPal_Logo2014.png';
import jcb from '../img/assets/paymentmethod/images (6).png';
import applePay from '../img/assets/paymentmethod/png-transparent-apple-pay-mobile-payment-apple-wallet-apple-text-service-rectangle-thumbnail.png';
import klarna from '../img/assets/paymentmethod/images (7).png';
import googlePay from '../img/assets/seat/images (1).png';
import alipay from '../img/assets/seat/alipay-icon-2048x1313-ayy5gifr.png';
import affirm from '../img/assets/paymentmethod/Affirm-Emblem.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCreditCard, faMessage } from '@fortawesome/free-solid-svg-icons';
import { faPaypal } from '@fortawesome/free-brands-svg-icons';
import { faHotel, faMapMarkerAlt, faCalendarAlt, faUser, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

const HotelPaymentMethod = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hotelName, hotellocation, price, checkInDate, checkOutDate, people, userData } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    paypalEmail: '',
  });

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValidCardNumber = (number) => /^[0-9]{16}$/.test(number);
  const isValidExpiryDate = (date) => {
    const [month, year] = date.split('/').map((num) => parseInt(num, 10));
    const now = new Date();
    if (!month || !year || month < 1 || month > 12) return false;
    const expiry = new Date(`20${year}`, month - 1);
    return expiry > now;
  };
  const isValidCVV = (cvv) => /^[0-9]{3,4}$/.test(cvv);

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method.');
      return;
    }

    if (paymentMethod === 'card') {
      const { cardNumber, expiryDate, cvv } = formData;

      if (!isValidCardNumber(cardNumber)) {
        toast.error('Please enter a valid 16-digit card number.');
        return;
      }
      if (!isValidExpiryDate(expiryDate)) {
        toast.error('Please enter a valid expiry date in MM/YY format.');
        return;
      }
      if (!isValidCVV(cvv)) {
        toast.error('Please enter a valid 3 or 4 digit CVV.');
        return;
      }
    } else if (paymentMethod === 'paypal') {
      const { paypalEmail } = formData;
  
      // Check if PayPal email is empty
      if (!paypalEmail) {
        toast.error('Please provide your PayPal email.');
        return;
      }
  
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(paypalEmail)) {
        toast.error('Please enter a valid email address.');
        return;
      }
    }

    

    const paymentData = {
      hotelName,
      location: hotellocation,
      totalPrice: price,
      checkInDate,
      checkOutDate,
      people,
      userData,
      paymentMethod,
      formData,
      status: 'Completed',
    };

    try {
      const response = await fetch('http://localhost:5001/hotelpaymentmethod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        toast.success('Payment completed successfully!');
        navigate('/hotelpaymentdone', { state: { paymentData } });
      } else {
        toast.error('Failed to save payment data.');
      }
    } catch (error) {
      toast.error('Error processing payment.');
    }
  };

  return (
    <div className="payment-container17">
      <ToastContainer /> {/* Toast Container for notifications */}
      <div className="payment-method-section67">
        <h2>Select Your Payment Method</h2>
        <div className="payment-options">
          <label className="payment-option">
            <input type="radio" name="payment" value="card" onChange={handlePaymentMethodChange} />
            <span>Credit/Debit Card</span>
            <img src={visa} alt="Visa" className="payment-icon" />
            <img src={mastercard} alt="Mastercard" className="payment-icon" />
            <img src={americanexpress} alt="American Express" className="payment-icon" />
            <img src={jcb} alt="JCB Payment" className="payment-icon" />
          </label>
          <label className="payment-option">
            <input type="radio" name="payment" value="paypal" onChange={handlePaymentMethodChange} />
            <span>Email</span>
            <img src={paypal} alt="Paypal" className="payment-icon" />
            <img src={applePay} alt="Apple Pay" className="payment-icon" />
            <img src={googlePay} alt="Google Pay" className="payment-icon" />
            <img src={klarna} alt="klarna" className="payment-icon" />
            <img src={affirm} alt="affrim" className="payment-icon" />
          </label>
        </div>

        {paymentMethod === 'card' && (
          <div className="payment-form17">
            <h3>Card Details</h3>
            <div className="input-container17">
              <FontAwesomeIcon icon={faCreditCard} className="input-icon76" />
              <input type="text" name="cardNumber" placeholder="Card Number" onChange={handleInputChange} maxLength="16" />
            </div>
            <div className="input-container17">
              <FontAwesomeIcon icon={faUser} className="input-icon76" />
              <input type="text" name="Name" placeholder="Cardholder Name" onChange={handleInputChange} />
            </div>
            <div className="input-container17">
              <FontAwesomeIcon icon={faCalendarAlt} className="input-icon76" />
              <input type="text" name="expiryDate" placeholder="Expiry Date (MM/YY)" onChange={handleInputChange} />
            </div>
            <div className="input-container17">
              <FontAwesomeIcon icon={faCreditCard} className="input-icon76" />
              <input type="text" name="cvv" placeholder="CVV" onChange={handleInputChange} maxLength="4" />
            </div>
          </div>
        )}

        {paymentMethod === 'paypal' && (
          <div className="payment-form17">
            <h3>PayPal Email</h3>
            <div className="input-container17">
              <FontAwesomeIcon icon={faEnvelope} className="input-icon76" />
              <input type="email" name="paypalEmail" placeholder="PayPal Email" onChange={handleInputChange} />
            </div>
          </div>
        )}
        <button className="pay-button" onClick={handlePayment}>Complete Payment</button>
      </div>

      <div className="order-summary-section">
        <h3>Order Summary</h3>
        <div className="order-summary-detail">
          <div>
            <FontAwesomeIcon icon={faHotel} className="order-summary-icon" />
            <span>Hotel:</span>
          </div>
          <span>{hotelName || "N/A"}</span>
        </div>
        <div className="order-summary-detail">
          <div>
            <FontAwesomeIcon icon={faMapMarkerAlt} className="order-summary-icon" />
            <span>Location:</span>
          </div>
          <span>{hotellocation || "N/A"}</span>
        </div>
        <div className="order-summary-detail">
          <div>
            <FontAwesomeIcon icon={faCalendarAlt} className="order-summary-icon" />
            <span>Check-in:</span>
          </div>
          <span>{checkInDate || "N/A"}</span>
        </div>
        <div className="order-summary-detail">
          <div>
            <FontAwesomeIcon icon={faCalendarAlt} className="order-summary-icon" />
            <span>Check-out:</span>
          </div>
          <span>{checkOutDate || "N/A"}</span>
        </div>
        <div className="order-summary-detail">
          <div>
            <FontAwesomeIcon icon={faUser} className="order-summary-icon" />
            <span>People:</span>
          </div>
          <span>{people || "N/A"}</span>
        </div>
        <div className="order-summary-detail">
          <div>
            <FontAwesomeIcon icon={faDollarSign} className="order-summary-icon" />
            <span>Total Price:</span>
          </div>
          <span>MYR{price || "N/A"}</span>
        </div>
      </div>
    </div>
  );
};

export default HotelPaymentMethod;