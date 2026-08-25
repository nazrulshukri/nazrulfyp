import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getBookingHistory } from "../lib/bookingStorage";
import "./services.css";

const normalise = (value) => String(value || "").trim().toLowerCase();

function CheckIn() {
  const [bookingReference, setBookingReference] = useState("");
  const [lastName, setLastName] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const reference = normalise(bookingReference);
    const surname = normalise(lastName);

    if (!reference || !surname) {
      setResult(null);
      setMessage("Enter both your booking reference and passenger surname.");
      return;
    }

    const match = getBookingHistory().find((booking) => (
      normalise(booking.bookingId) === reference
      && normalise(booking.passengerDetails?.lastName) === surname
    ));

    if (!match) {
      setResult(null);
      setMessage("We could not match those details. Check your confirmation email and try again.");
      return;
    }

    setMessage("");
    setResult(match);
  };

  return (
    <div className="checkin-page">
      <section className="checkin-hero" aria-labelledby="checkin-title">
        <div className="checkin-intro">
          <span className="checkin-kicker">Online check-in</span>
          <h1 id="checkin-title">Get ready to fly in a few simple steps.</h1>
          <p>
            Find your Booking Flex trip, review the passenger details, and see your
            travel readiness before you head to the airport.
          </p>
          <div className="checkin-window-note">
            <span aria-hidden="true">◷</span>
            <div>
              <strong>Check-in availability</strong>
              <p>Most airlines open online check-in 24–48 hours before departure.</p>
            </div>
          </div>
        </div>

        <div className="checkin-card">
          <div className="checkin-card-heading">
            <span>Find your trip</span>
            <h2>Booking details</h2>
            <p>Use the same surname shown on your travel document.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="booking-reference">Booking reference</label>
            <input
              id="booking-reference"
              name="bookingReference"
              type="text"
              value={bookingReference}
              onChange={(event) => setBookingReference(event.target.value)}
              placeholder="e.g. TEMP-1234567890"
              autoComplete="off"
            />

            <label htmlFor="passenger-last-name">Passenger surname</label>
            <input
              id="passenger-last-name"
              name="lastName"
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              placeholder="As shown on your passport"
              autoComplete="family-name"
            />

            {message && <p className="checkin-message checkin-message-error" role="alert">{message}</p>}

            {result && (
              <div className="checkin-result" role="status">
                <span className="checkin-result-icon" aria-hidden="true">✓</span>
                <div>
                  <strong>Booking found</strong>
                  <p>{result.bookingId} · {result.passengerDetails?.firstName} {result.passengerDetails?.lastName}</p>
                </div>
              </div>
            )}

            <button type="submit">Find my booking <span aria-hidden="true">→</span></button>
          </form>

          <p className="checkin-help">
            Can’t find your reference? <Link to="/dashboard">Open your travel dashboard</Link>
          </p>
        </div>
      </section>

      <section className="checkin-steps" aria-labelledby="checkin-steps-title">
        <div className="checkin-section-heading">
          <span className="checkin-kicker">Before you begin</span>
          <h2 id="checkin-steps-title">Have these details ready</h2>
        </div>
        <div className="checkin-step-grid">
          <article>
            <span>01</span>
            <h3>Your booking reference</h3>
            <p>Find it in your Booking Flex confirmation email or travel dashboard.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Travel documents</h3>
            <p>Keep each passenger’s passport or identity document within reach.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Seat and baggage choices</h3>
            <p>Review any airline options before completing check-in.</p>
          </article>
        </div>
      </section>

      <section className="checkin-support" aria-label="Check-in support">
        <div>
          <span className="checkin-support-icon" aria-hidden="true">i</span>
          <div>
            <h2>Checking in with a partner airline?</h2>
            <p>Your airline may ask you to finish securely on its own website.</p>
          </div>
        </div>
        <Link to="/flightstatus">Check flight status</Link>
      </section>
    </div>
  );
}

export default CheckIn;
