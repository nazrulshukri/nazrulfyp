import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

// ✅ Update these paths to match your project structure
import FlightDetails from "./flightdetails";
import Modal from "./modal";
import Loading from "./loading";

import "./payment.css";

const Payment = ({ user }) => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    selectedOutboundFlight,
    selectedReturnFlight,
    returnPrice: returnPriceFromState,

    outboundFlight: outboundFlightOld,
    returnFlight: returnFlightOld,
    price: priceOld,

    passengerDetails,
    selectedInsurance,
    selectedSeats = [],
  } = state || {};

  // ✅ Final variables used by this component
  const outboundFlight = outboundFlightOld || selectedOutboundFlight;
  const returnFlight = returnFlightOld || selectedReturnFlight;

  // price fallback
  const price = returnPriceFromState ?? priceOld ?? 0;

  // ✅ State
  const [insurancePrice, setInsurancePrice] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [returnPrice] = useState(Number(price) || 0);
  const [loading, setLoading] = useState(true);

  const totalSeatPrice = (selectedSeats?.length || 0) * 20;

  useEffect(() => {
    // Simulate loading
    const t = setTimeout(() => setLoading(false), 2000);

    if (selectedInsurance?.price != null) {
      setInsurancePrice(Number(selectedInsurance.price) || 0);
    } else {
      setInsurancePrice(0);
    }

    return () => clearTimeout(t);
  }, [selectedInsurance]);

  if (loading) {
    return <Loading />;
  }

  if (!outboundFlight) {
    return <div>No outbound flight selected. Please go back and choose a flight.</div>;
  }

  const getTotalCostForFlight = (p) => Number(p) || 0;

  const outboundPrice = getTotalCostForFlight(outboundFlight.price);

  const totalAmount = {
    flightPrice: outboundPrice + returnPrice,
    taxes: 50.0,
    serviceCharges: totalSeatPrice + insurancePrice,
    total: outboundPrice + returnPrice + 50.0 + totalSeatPrice + insurancePrice,
  };

  const handleBooking = async () => {
    if (!passengerDetails || !passengerDetails.email) {
      setShowModal(true);
      return;
    }

    const bookingData = {
      outboundFlight,
      returnFlight,
      passengerDetails,
      selectedSeats,
      selectedInsurance,
      returnPrice,
      totalAmount: {
        flightPrice: totalAmount.flightPrice,
        taxes: totalAmount.taxes,
        serviceCharges: totalAmount.serviceCharges,
        total: totalAmount.total,
      },
      userId: passengerDetails.email,
    };

    try {
      const response = await axios.post("http://localhost:5001/process-payment", bookingData);

      if (response.data?.success) {
        // optional reset
        setInsurancePrice(0);

        navigate("/paymentmethod", {
          state: {
            bookingId: response.data.bookingId,
            totalAmount: bookingData.totalAmount.total,
            outboundFlight,
            returnFlight,
            passengerDetails,
            selectedSeats,
            selectedInsurance,
          },
        });
      } else {
        alert("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <div className="payment-container1">
      <div className="details-summary">
        <div className="flight-details-section">
          <h2>Flight Details</h2>
          <FlightDetails
            outboundFlight={outboundFlight}
            returnFlight={returnFlight}
            returnPrice={returnPrice}
          />
        </div>

        <div className="fare-summary-section">
          <h2 className="fare-summary-title">Fare Summary</h2>

          <div className="flight-summary-container">
            <div className="flight-summary-card">
              <h3 className="flight-summary-heading">Departure Flight Summary</h3>
              <p className="flight-price">Price: MYR {outboundPrice.toFixed(2)}</p>
            </div>

            <div className="flight-summary-card">
              <h3 className="flight-summary-heading">Return Flight Summary</h3>
              <p className="flight-price">Price: MYR {returnPrice.toFixed(2)}</p>
            </div>
          </div>

          {selectedSeats?.length > 0 && (
            <div className="selected-seats">
              <h3 className="selected-seats-title">Selected Seats:</h3>
              <p className="selected-seats-list">{selectedSeats.join(", ")}</p>
            </div>
          )}

          <div className="fare-details">
            <div className="fare-detail">
              <span className="fare-label">
                <i className="fas fa-ticket-alt"></i> Base fare:
              </span>
              <span className="fare-amount">MYR {(outboundPrice + returnPrice).toFixed(2)}</span>
            </div>

            <div className="fare-detail">
              <span className="fare-label">
                <i className="fas fa-percent"></i> Taxes & surcharges:
              </span>
              <span className="fare-amount">MYR {totalAmount.taxes.toFixed(2)}</span>
            </div>

            <div className="fare-detail">
              <span className="fare-label">
                <i className="fas fa-plus-circle"></i> Insurance:
              </span>
              <span className="fare-amount">MYR {insurancePrice.toFixed(2)}</span>
            </div>

            <div className="fare-detail">
              <span className="fare-label">
                <i className="fas fa-chair"></i> Seat Selection:
              </span>
              <span className="fare-amount">MYR {totalSeatPrice.toFixed(2)}</span>
            </div>

            <div className="fare-detail total">
              <span className="fare-label">
                <i className="fas fa-receipt"></i> Total:
              </span>
              <span className="fare-amount">MYR {totalAmount.total.toFixed(2)}</span>
            </div>
          </div>

          <button className="continue-btn" onClick={handleBooking}>
            Book Now
          </button>
        </div>
      </div>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Incomplete Information"
        message="Please complete all passenger details before booking."
      />
    </div>
  );
};

export default Payment;
