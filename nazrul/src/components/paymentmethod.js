import { API_BASE } from "../lib/apiConfig";
import axios from "axios";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail, Users, Armchair, ShieldCheck, Plane } from "lucide-react";
import PaymentPanel, { ProcessingOverlay } from "./PaymentPanel";
import { AirlineBadge, BookingSteps } from "./flightresults";
import { saveBookingForUser, formatMoney } from "../lib/bookingStorage";
import { airportMeta, formatDay } from "../lib/travelMeta";
import "./paymentmethod.css";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const time = (value) =>
  new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function Leg({ label, flight }) {
  if (!flight) return null;
  const from = airportMeta(flight.origin);
  const to = airportMeta(flight.destination);
  return (
    <div className="bf26-mini-leg">
      <AirlineBadge name={flight.airline} size={36} />
      <span>
        <small>
          {label} · {formatDay(flight.departure)}
        </small>
        <strong>
          {from.code} {time(flight.departure)} <ArrowRight size={13} /> {to.code} {time(flight.arrival)}
        </strong>
        <small>
          {flight.airline} · {flight.flightNumber}
        </small>
      </span>
    </div>
  );
}

const PaymentMethodPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(-1);

  const {
    bookingId,
    totalAmount,
    outboundFlight,
    returnFlight,
    passengerDetails,
    selectedSeats = [],
    selectedInsurance,
    people = 1,
  } = location.state || {};

  if (!location.state) {
    return (
      <section className="bf-empty">
        <Plane size={36} />
        <h1>Your checkout has expired.</h1>
        <p>This can happen after a refresh. Choose your flights again to continue.</p>
        <Link className="bf-primary" to="/">
          Search flights <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const email = passengerDetails?.email;
  const steps = ["Authorising payment", "Issuing your e-ticket", `Emailing your ticket to ${email}`];

  async function pay({ method, label, detail }) {
    setStep(0);
    await wait(1100);
    setStep(1);
    await wait(700);
    setStep(2);

    const paidAt = new Date().toISOString();
    const paymentData = {
      bookingId,
      paymentMethod: label,
      paymentDetail: detail,
      amount: totalAmount,
      status: "Confirmed",
      // Never send or persist raw card, CVV or bank details.
      paymentDetails: { method },
      email,
      outboundFlight,
      returnFlight,
      passengerDetails,
      selectedSeats,
      selectedInsurance,
      people,
      paidAt,
    };

    let emailStatus = "sent";
    try {
      const response = await axios.post(`${API_BASE}/submit-payment`, paymentData, { timeout: 25000 });
      if (!response.data?.success) emailStatus = "failed";
    } catch (error) {
      console.warn("Ticket email could not be sent:", error?.response?.data || error.message);
      emailStatus = "failed";
    }

    const userEmail = email || localStorage.getItem("userEmail");
    if (userEmail) saveBookingForUser(userEmail, { ...paymentData, emailStatus });

    // "email" at the top level of route state is read by the header as a sign-in,
    // so the ticket keeps the address under "sentTo" instead.
    const { email: sentTo, ...rest } = paymentData;
    const ticket = { ...rest, sentTo, emailStatus };
    sessionStorage.setItem("lastFlightTicket", JSON.stringify(ticket));
    setStep(3);
    await wait(500);
    navigate("/ticketpage", { state: ticket });
  }

  const seatsTotal = selectedSeats.length * 20;
  const insurance = Number(selectedInsurance?.price) || 0;

  return (
    <div className="bf26-page bf26-checkout">
      <div className="bf26-results-top">
        <button type="button" className="bf-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back to traveller details
        </button>
        <BookingSteps current="Payment" tripType={returnFlight ? "return" : "oneway"} />
      </div>

      <header className="bf26-checkout-head">
        <span className="bf26-kicker">Final step</span>
        <h1>Secure payment</h1>
      </header>

      <div className="bf26-checkout-layout">
        <section className="bf26-panel">
          <div className="bf26-panel-head">
            <span className="bf26-step-no">
              <ShieldCheck size={17} />
            </span>
            <div>
              <h2>How would you like to pay?</h2>
              <p>Choose a method. Your e-ticket is issued as soon as payment is confirmed.</p>
            </div>
          </div>
          <PaymentPanel
            amountLabel={formatMoney(totalAmount)}
            defaultEmail={email}
            onPay={pay}
            disabled={step >= 0}
          />
        </section>

        <aside className="bf26-summary">
          <div className="bf26-summary-card">
            <span className="bf26-kicker">Your trip</span>
            <Leg label="Outbound" flight={outboundFlight} />
            <Leg label="Return" flight={returnFlight} />
            <div className="bf26-summary-rows">
              <p>
                <span>
                  <Users size={13} /> {people} {people === 1 ? "traveller" : "travellers"} ·{" "}
                  {passengerDetails?.firstName} {passengerDetails?.lastName}
                </span>
              </p>
              <p>
                <span>
                  <Armchair size={13} /> Seats {selectedSeats.length ? `(${selectedSeats.join(", ")})` : ""}
                </span>
                <strong>{formatMoney(seatsTotal)}</strong>
              </p>
              <p>
                <span>
                  <ShieldCheck size={13} /> {selectedInsurance?.name ? `${selectedInsurance.name} protection` : "No protection"}
                </span>
                <strong>{formatMoney(insurance)}</strong>
              </p>
              <p>
                <span>Booking reference</span>
                <strong className="bf26-mono">{bookingId}</strong>
              </p>
            </div>
            <div className="bf26-summary-total">
              <span>Total to pay</span>
              <strong>{formatMoney(totalAmount)}</strong>
            </div>
            <p className="bf26-email-note">
              <Mail size={15} />
              <span>
                Your e-ticket and boarding passes will be emailed to <strong>{email}</strong>
              </span>
            </p>
          </div>
        </aside>
      </div>

      {step >= 0 && <ProcessingOverlay steps={steps} current={step} />}
    </div>
  );
};

export default PaymentMethodPage;
