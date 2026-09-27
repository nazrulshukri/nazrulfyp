import { API_BASE } from "../lib/apiConfig";
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ArrowRight, Lock, BedDouble, Plane } from "lucide-react";

import FlightDetails from "./flightdetails";
import { BookingSteps } from "./flightresults";
import { formatMoney } from "../lib/bookingStorage";
import Modal from "./modal";

import "./payment.css";
import { flightTotals } from "../lib/flightPricing";

const Payment = ({ user }) => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    selectedOutboundFlight,
    selectedReturnFlight,


    outboundFlight: outboundFlightOld,
    returnFlight: returnFlightOld,


    passengerDetails: passengerDetailsFromState,
    selectedInsurance: selectedInsuranceFromState,
    selectedSeats: selectedSeatsFromState = [],
  } = state || {};

  const outboundFlight = outboundFlightOld || selectedOutboundFlight;
  const returnFlight = returnFlightOld || selectedReturnFlight;

  const people = Number(state?.people || state?.totalPeople) || 1;
  const totals = flightTotals(outboundFlight, returnFlight, people, selectedSeatsFromState.length, selectedInsuranceFromState?.price);

  const [passengerDetails, setPassengerDetails] = useState(passengerDetailsFromState || {});
  const [selectedInsurance, setSelectedInsurance] = useState(selectedInsuranceFromState || null);
  const [selectedSeats, setSelectedSeats] = useState(selectedSeatsFromState || []);
  const [showModal, setShowModal] = useState(false);
  const returnPrice = totals.returning;

  const insurancePrice = Number(selectedInsurance?.price) || 0;
  const totalSeatPrice = (selectedSeats?.length || 0) * 20;

  if (!outboundFlight) {
    return (
      <section className="bf-empty">
        <Plane size={36} />
        <h1>No flight selected yet.</h1>
        <p>Choose your flights first, then come back to add traveller details.</p>
        <Link className="bf-primary" to="/">
          Search flights <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const outboundPrice = totals.outbound;

  const totalAmount = {
    flightPrice: outboundPrice + returnPrice,
    taxes: 50.0,
    serviceCharges: totalSeatPrice + insurancePrice,
    total:
      outboundPrice +
      returnPrice +
      50.0 +
      totalSeatPrice +
      insurancePrice,
  };

  // ✅ FIXED BOOKING FUNCTION
  const handleBooking = async () => {
    if (!passengerDetails?.firstName?.trim() || !passengerDetails?.lastName?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passengerDetails?.email || "") || !passengerDetails?.phone?.trim()) {
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
      totalAmount,
      userId: passengerDetails.email,
      people,
    };

    let bookingId = "TEMP-" + Date.now();

    try {
      const response = await axios.post(
        `${API_BASE}/process-payment`,
        bookingData,
        { timeout: 10000 }
      );

      if (response.data?.success) {
        bookingId = response.data.bookingId || bookingId;
      }
    } catch (error) {
      console.error("Backend error:", error);
    }

    navigate("/paymentmethod", {
      state: {
        bookingId,
        people,
        totalAmount: totalAmount.total,
        outboundFlight,
        returnFlight,
        passengerDetails,
        selectedSeats,
        selectedInsurance,
        returnPrice,
      },
    });
  };

  const legs = [
    ["Outbound flight", outboundPrice],
    ...(returnFlight ? [["Return flight", returnPrice]] : []),
  ];

  return (
    <div className="bf26-page bf26-checkout">
      <div className="bf26-results-top">
        <button type="button" className="bf-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back to flights
        </button>
        <BookingSteps
          current="Traveller details"
          tripType={returnFlight ? "return" : "oneway"}
        />
      </div>

      <header className="bf26-checkout-head">
        <span className="bf26-kicker">Almost there</span>
        <h1>Review and add traveller details</h1>
      </header>

      <div className="bf26-checkout-layout">
        <FlightDetails
          outboundFlight={outboundFlight}
          returnFlight={returnFlight}
          returnPrice={returnPrice}
          initialPassengerDetails={passengerDetails}
          initialSelectedSeats={selectedSeats}
          initialSelectedInsurance={selectedInsurance}
          onPassengerDetailsChange={setPassengerDetails}
          onSelectedSeatsChange={setSelectedSeats}
          onSelectedInsuranceChange={setSelectedInsurance}
          people={people}
        />

        <aside className="bf26-summary">
          <div className="bf26-summary-card">
            <span className="bf26-kicker">
              Price summary · {people} {people === 1 ? "traveller" : "travellers"}
            </span>
            <div className="bf26-summary-rows">
              {legs.map(([label, amount]) => (
                <p key={label}>
                  <span>{label}</span>
                  <strong>{formatMoney(amount)}</strong>
                </p>
              ))}
              <p>
                <span>Taxes & fees</span>
                <strong>{formatMoney(totalAmount.taxes)}</strong>
              </p>
              <p>
                <span>
                  Seats{selectedSeats?.length ? ` (${selectedSeats.join(", ")})` : ""}
                </span>
                <strong>{formatMoney(totalSeatPrice)}</strong>
              </p>
              <p>
                <span>{selectedInsurance?.name ? `Protection · ${selectedInsurance.name}` : "Travel protection"}</span>
                <strong>{formatMoney(insurancePrice)}</strong>
              </p>
            </div>
            <div className="bf26-summary-total">
              <span>Total to pay</span>
              <strong>{formatMoney(totalAmount.total)}</strong>
            </div>
            <button type="button" className="bf26-primary bf26-cta" onClick={handleBooking}>
              Continue to payment <ArrowRight size={17} />
            </button>
            <p className="bf26-note">
              <Lock size={14} /> Sample booking. No real payment is taken on this
              page.
            </p>
          </div>
          {state?.vacation?.city && (
            <Link to="/hotel" className="bf26-summary-extra">
              <BedDouble size={18} />
              <span>
                <strong>Add a stay in {state.vacation.city}</strong>
                <small>Complete your vacation package</small>
              </span>
              <ArrowRight size={16} />
            </Link>
          )}
        </aside>
      </div>

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        title="Incomplete Information"
        message="Please add the lead traveller’s first and last name, a valid email and a phone number."
      />
    </div>
  );
};

export default Payment;
