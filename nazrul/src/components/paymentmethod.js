import axios from "axios";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./paymentmethod.css";

import paypalIcon from "../img/assets/seat/Paypal_2014_logo.png";
import cardIcon from "../img/assets/seat/Mastercard-logo.svg.png";
import fpxIcon from "../img/assets/seat/images.png";
import applePayIcon from "../img/assets/seat/Apple_Pay-Logo.wine.png";
import emailIcon from "../img/assets/seat/email-icon--clipart-best-22.png";
import cvvIcon from "../img/assets/seat/4117733.png";
import expiryIcon from "../img/assets/seat/2068755-200.png";
import accountIcon from "../img/assets/seat/user-icon-trendy-flat-style-600nw-1697898655.webp";
import bankIcon from "../img/assets/seat/bank-vector-icon-isolated-on-transparent-background-bank-logo-concept-P28454.jpg";

const PaymentMethodPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ HOOKS FIRST (always called)
  const [paymentType, setPaymentType] = useState("paypal");
  const [paypalDetails, setPaypalDetails] = useState({ email: "" });
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });
  const [fpxDetails, setFpxDetails] = useState({ accountNumber: "", bankName: "" });
  const [applePayDetails, setApplePayDetails] = useState({
    cardNumber: "",
    cardHolder: "",
    expiryDate: "",
    cvv: "",
  });

  // ✅ SAFE STATE READ (after hooks is fine)
  const {
    bookingId,
    totalAmount,
    outboundFlight,
    returnFlight,
    passengerDetails,
    selectedSeats = [],
    selectedInsurance,
  } = location.state || {};

  // ✅ GUARD AFTER HOOKS
  if (!location.state) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Payment Method</h2>
        <p>
          No booking data found. This can happen if you refreshed the page or opened it directly.
        </p>
        <button onClick={() => navigate("/payment")}>Back to Payment</button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (paymentType === "paypal") setPaypalDetails((p) => ({ ...p, [name]: value }));
    if (paymentType === "card") setCardDetails((p) => ({ ...p, [name]: value }));
    if (paymentType === "fpx") setFpxDetails((p) => ({ ...p, [name]: value }));
    if (paymentType === "applePay") setApplePayDetails((p) => ({ ...p, [name]: value }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    const paymentData = {
      bookingId,
      paymentMethod: paymentType,
      amount: totalAmount,
      status: "Confirmed",
      paymentDetails:
        paymentType === "paypal"
          ? paypalDetails
          : paymentType === "card"
          ? cardDetails
          : paymentType === "fpx"
          ? fpxDetails
          : applePayDetails,

      email: passengerDetails?.email,
      outboundFlight,
      returnFlight,
      passengerDetails,
      selectedSeats,
      selectedInsurance,
    };

    try {
      const response = await axios.post("http://localhost:5001/submit-payment", paymentData);

      if (response.data.success) {
        navigate("/ticketpage", { state: paymentData });
      } else {
        alert("Failed to save payment. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting payment:", {
    message: error.message,
    status: error?.response?.status,
    data: error?.response?.data,
  }); alert(
    error?.response?.data?.message ||
    JSON.stringify(error?.response?.data) ||
    "Error processing payment. Please try again."
  );
}};

  return (
    <div className="payment-page1">
      <div className="payment-sidebar1">
        <div className="booking-details-container">
          <h2>Booking Details</h2>
          <p><strong>Email:</strong> {passengerDetails?.email || "-"}</p>
          <p><strong>Booking ID:</strong> {bookingId || "-"}</p>
          <p><strong>Departure Flight:</strong> {outboundFlight?.flightNumber || "-"}</p>
          <p><strong>Departure Price: MYR</strong> {outboundFlight?.price ?? 0}</p>
          <p><strong>Return Flight:</strong> {returnFlight?.flightNumber || "-"}</p>
          <p><strong>Return Price: MYR</strong> {returnFlight?.price ?? 0}</p>
          <p><strong>Selected Seats:</strong> {selectedSeats.length ? selectedSeats.join(", ") : "-"}</p>
          <p><strong>Insurance:</strong> {selectedInsurance ? `${selectedInsurance.name} (MYR ${selectedInsurance.price})` : "No Insurance"}</p>
          <p><strong>Your amount : RM</strong> {totalAmount ?? 0}</p>
        </div>

        <h2>Select Payment Method</h2>

        <div className={`payment-option1 ${paymentType === "paypal" ? "active" : ""}`} onClick={() => setPaymentType("paypal")}>
          <label><img src={paypalIcon} alt="PayPal Icon" className="payment-icon" /> PayPal</label>
        </div>

        <div className={`payment-option1 ${paymentType === "card" ? "active" : ""}`} onClick={() => setPaymentType("card")}>
          <label><img src={cardIcon} alt="Card Icon" className="payment-icon" /> Credit/Debit Card</label>
        </div>

        <div className={`payment-option1 ${paymentType === "fpx" ? "active" : ""}`} onClick={() => setPaymentType("fpx")}>
          <label><img src={fpxIcon} alt="FPX Icon" className="payment-icon" /> FPX (Bank Transfer)</label>
        </div>

        <div className={`payment-option1 ${paymentType === "applePay" ? "active" : ""}`} onClick={() => setPaymentType("applePay")}>
          <label><img src={applePayIcon} alt="Apple Pay Icon" className="payment-icon" /> Apple Pay</label>
        </div>
      </div>

      <div className="payment-content1">
        <form className="payment-method-form1" onSubmit={handlePaymentSubmit}>
          {paymentType === "paypal" && (
            <div className="form-group1">
              <label>PayPal Email</label>
              <div className="input-icon-wrapper78">
                <img className="input-icon1" src={emailIcon} alt="Email icon" />
                <input type="email" name="email" placeholder="Enter your PayPal email" value={paypalDetails.email} onChange={handleInputChange} required />
              </div>
            </div>
          )}

          {paymentType === "card" && (
            <>
              <div className="form-group1">
                <label>Card Number</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={cardIcon} alt="Card icon" />
                  <input type="text" name="cardNumber" placeholder="Card Number" value={cardDetails.cardNumber} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group1">
                <label>Card Holder Name</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={cardIcon} alt="Card icon" />
                  <input type="text" name="cardHolder" placeholder="Card Holder Name" value={cardDetails.cardHolder} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group1">
                <label>Expiry Date (MM/YY)</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={expiryIcon} alt="Expiry icon" />
                  <input type="text" name="expiryDate" placeholder="MM/YY" value={cardDetails.expiryDate} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group1">
                <label>CVV</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={cvvIcon} alt="CVV icon" />
                  <input type="text" name="cvv" placeholder="CVV" value={cardDetails.cvv} onChange={handleInputChange} required />
                </div>
              </div>
            </>
          )}

          {paymentType === "fpx" && (
            <>
              <div className="form-group1">
                <label>Account Number</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={accountIcon} alt="Account icon" />
                  <input type="text" name="accountNumber" placeholder="Account Number" value={fpxDetails.accountNumber} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group1">
                <label>Bank Name</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={bankIcon} alt="Bank icon" />
                  <input type="text" name="bankName" placeholder="Bank Name" value={fpxDetails.bankName} onChange={handleInputChange} required />
                </div>
              </div>
            </>
          )}

          {paymentType === "applePay" && (
            <>
              <div className="form-group1">
                <label>Card Number</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={applePayIcon} alt="Apple Pay icon" />
                  <input type="text" name="cardNumber" placeholder="Card Number" value={applePayDetails.cardNumber} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group1">
                <label>Card Holder Name</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={applePayIcon} alt="Apple Pay icon" />
                  <input type="text" name="cardHolder" placeholder="Card Holder Name" value={applePayDetails.cardHolder} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group1">
                <label>Expiry Date (MM/YY)</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={expiryIcon} alt="Expiry icon" />
                  <input type="text" name="expiryDate" placeholder="MM/YY" value={applePayDetails.expiryDate} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group1">
                <label>CVV</label>
                <div className="input-icon-wrapper78">
                  <img className="input-icon1" src={cvvIcon} alt="CVV icon" />
                  <input type="text" name="cvv" placeholder="CVV" value={applePayDetails.cvv} onChange={handleInputChange} required />
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