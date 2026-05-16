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
  const [isMethodOpen, setIsMethodOpen] = useState(false);
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

  const bankOptions = [
    "Maybank",
    "CIMB Bank",
    "Bank Islam",
    "RHB Bank",
    "Public Bank",
    "Hong Leong Bank",
    "AmBank",
    "HSBC Bank",
    "OCBC Bank",
    "Standard Chartered",
    "UOB Bank",
    "Affin Bank",
    "Bank Rakyat",
    "BSN",
  ];

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

  const paymentMethods = [
    {
      id: "paypal",
      label: "PayPal",
      subtitle: "Fast wallet checkout",
      icon: paypalIcon,
    },
    {
      id: "card",
      label: "Credit/Debit Card",
      subtitle: "Visa, Mastercard and debit cards",
      icon: cardIcon,
    },
    {
      id: "fpx",
      label: "FPX Bank Transfer",
      subtitle: "Malaysia online banking",
      icon: fpxIcon,
    },
    {
      id: "applePay",
      label: "Apple Pay",
      subtitle: "Device wallet payment",
      icon: applePayIcon,
    },
  ];

  const selectedMethod = paymentMethods.find((method) => method.id === paymentType) || paymentMethods[0];

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
          <span className="payment-kicker">Final step</span>
          <h2>Booking Details</h2>
          <div className="booking-detail-list">
            <p><strong>Email</strong> <span>{passengerDetails?.email || "-"}</span></p>
            <p><strong>Booking ID</strong> <span>{bookingId || "-"}</span></p>
            <p><strong>Departure</strong> <span>{outboundFlight?.flightNumber || "-"}</span></p>
            <p><strong>Departure Price</strong> <span>MYR {outboundFlight?.price ?? 0}</span></p>
            <p><strong>Return</strong> <span>{returnFlight?.flightNumber || "-"}</span></p>
            <p><strong>Return Price</strong> <span>MYR {returnFlight?.price ?? 0}</span></p>
            <p><strong>Seats</strong> <span>{selectedSeats.length ? selectedSeats.join(", ") : "-"}</span></p>
            <p><strong>Insurance</strong> <span>{selectedInsurance ? `${selectedInsurance.name} (MYR ${selectedInsurance.price})` : "No Insurance"}</span></p>
          </div>
          <div className="booking-total-pill">
            <span>Total due</span>
            <strong>MYR {Number(totalAmount || 0).toFixed(2)}</strong>
          </div>
        </div>

        <h2 className="payment-method-title">Select Payment Method</h2>

        <div className={`payment-method-dropdown ${isMethodOpen ? "open" : ""}`}>
          <button
            type="button"
            className="payment-method-trigger"
            onClick={() => setIsMethodOpen((open) => !open)}
            aria-expanded={isMethodOpen}
            aria-haspopup="listbox"
          >
            <span className="method-trigger-main">
              <img src={selectedMethod.icon} alt="" className="payment-icon" />
              <span>
                <strong>{selectedMethod.label}</strong>
                <small>{selectedMethod.subtitle}</small>
              </span>
            </span>
            <span className="method-chevron">⌄</span>
          </button>
        </div>
      </div>

      <div className="payment-content1">
        <form className="payment-method-form1" onSubmit={handlePaymentSubmit}>
          <div className="payment-form-header">
            <span className="payment-kicker">Secure payment</span>
            <h1>{paymentType === "paypal" ? "Pay with PayPal" : paymentType === "card" ? "Pay by Card" : paymentType === "fpx" ? "Pay with FPX" : "Pay with Apple Pay"}</h1>
            <p>Complete your booking with encrypted checkout details.</p>
          </div>

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
                  <select className="bank-select" name="bankName" value={fpxDetails.bankName} onChange={handleInputChange} required>
                    <option value="">Choose your bank</option>
                    {bankOptions.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
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

      {isMethodOpen && (
        <div className="payment-method-popup" role="presentation">
          <button
            type="button"
            className="payment-method-backdrop"
            aria-label="Close payment method selector"
            onClick={() => setIsMethodOpen(false)}
          />
          <div className="payment-method-menu" role="listbox" aria-label="Payment method options">
            <button
              type="button"
              className="method-popup-close"
              aria-label="Close payment method selector"
              onClick={() => setIsMethodOpen(false)}
            >
              ×
            </button>

            <div className="method-popup-header">
              <span className="payment-kicker">Payment selector</span>
              <h3>Choose how you want to pay</h3>
              <p>Pick a secure method. Your form will change instantly.</p>
            </div>

            <div className="method-popup-grid">
              {paymentMethods.map((method, index) => (
                <button
                  key={method.id}
                  type="button"
                  role="option"
                  aria-selected={paymentType === method.id}
                  className={`payment-method-item ${paymentType === method.id ? "active" : ""}`}
                  onClick={() => {
                    setPaymentType(method.id);
                    setIsMethodOpen(false);
                  }}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <span className="method-card-shine" />
                  <img src={method.icon} alt="" className="payment-icon" />
                  <span>
                    <strong>{method.label}</strong>
                    <small>{method.subtitle}</small>
                  </span>
                  <i>{paymentType === method.id ? "Selected" : "Choose"}</i>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodPage;
