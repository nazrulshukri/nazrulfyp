import React from 'react';
import './faresummary.css'; // Use Fare Summary styling here

const FlightSummary = ({ totalAmount, onContinue }) => {
  return (
    <div className="fare-summary">
      <h2>Fare Summary</h2>
      <div className="price-details">
        <div>
          <p>Base fare:</p>
          <p><span>MYR {totalAmount.flightPrice.toFixed(2)}</span></p>
        </div>
        <div>
          <p>Taxes, fees & surcharges:</p>
          <p><span>MYR {totalAmount.taxes.toFixed(2)}</span></p>
        </div>
        <div>
          <p>Add-ons:</p>
          <p><span>MYR {totalAmount.serviceCharges.toFixed(2)}</span></p>
        </div>
      </div>
      <div className="total">
        <p>Total amount:</p>
        <p><span>MYR {totalAmount.total.toFixed(2)}</span></p>
      </div>
      <button className="continue-btn" onClick={onContinue}>Continue</button>
    </div>
  );
};

export default FlightSummary;
