import { API_BASE } from "../lib/apiConfig";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, BedDouble, CalendarDays, Users, Mail, ShieldCheck, MapPin } from "lucide-react";
import PaymentPanel, { ProcessingOverlay } from "./PaymentPanel";
import { BookingSteps } from "./flightresults";
import { formatMoney } from "../lib/bookingStorage";
import { formatDay } from "../lib/travelMeta";
import "./hotelpaymentmethod.css";

const HOTEL_STEPS = ["Search", "Stay", "Guest details", "Payment"];
const HOTEL_PAYMENT_DRAFT_KEY = "hotelPaymentDraft";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const HotelPaymentMethod = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(-1);
  const booking = location.state || safeParse(sessionStorage.getItem(HOTEL_PAYMENT_DRAFT_KEY), {});
  const { hotelName, hotellocation, checkInDate, checkOutDate, price, people, userData = {}, roomType } = booking;

  if (!hotelName) {
    return (
      <section className="bf-empty">
        <BedDouble size={36} />
        <h1>Your stay checkout has expired.</h1>
        <p>Choose your hotel again to continue.</p>
        <Link className="bf-primary" to="/hotel">
          Browse hotels <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const email = userData.email;
  const nights = Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / 86400000) || 1);

  async function pay({ label, detail }) {
    setStep(0);
    // No card or bank details are sent to the server.
    const paymentData = {
      hotelName,
      location: hotellocation,
      totalPrice: price,
      checkInDate,
      checkOutDate,
      people,
      roomType,
      userData,
      paymentMethod: label,
      paymentDetail: detail,
      status: "Completed",
      paidAt: new Date().toISOString(),
    };
    await Promise.all([
      wait(1000),
      fetch(`${API_BASE}/hotelpaymentmethod`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      }).catch(() => null),
    ]);
    setStep(1);
    await wait(700);
    setStep(2);
    let emailStatus = "sent";
    try {
      const res = await fetch(`${API_BASE}/send-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "hotel", email, booking: paymentData }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) emailStatus = "failed";
    } catch (e) {
      emailStatus = "failed";
    }
    const done = { ...paymentData, emailStatus };
    sessionStorage.setItem(HOTEL_PAYMENT_DRAFT_KEY, JSON.stringify(done));
    setStep(3);
    await wait(500);
    navigate("/hotelpaymentdone", { state: { paymentData: done } });
  }

  return (
    <div className="bf26-page bf26-checkout">
      <div className="bf26-results-top">
        <button type="button" className="bf-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back to guest details
        </button>
        <BookingSteps current="Payment" steps={HOTEL_STEPS} />
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
              <p>Your voucher is issued as soon as payment is confirmed.</p>
            </div>
          </div>
          <PaymentPanel amountLabel={formatMoney(price)} defaultEmail={email} onPay={pay} disabled={step >= 0} />
        </section>
        <aside className="bf26-summary">
          <div className="bf26-summary-card">
            <span className="bf26-kicker">Your stay</span>
            <h3 className="bf26-summary-hotel">{hotelName}</h3>
            <p className="bf26-hotel-loc">
              <MapPin size={13} /> {hotellocation}
            </p>
            <div className="bf26-stay-dates">
              <div>
                <small>Check-in</small>
                <strong>{formatDay(checkInDate)}</strong>
              </div>
              <div>
                <small>Check-out</small>
                <strong>{formatDay(checkOutDate)}</strong>
              </div>
            </div>
            <div className="bf26-summary-rows">
              <p>
                <span>
                  <BedDouble size={13} /> {roomType || "Room"}
                </span>
              </p>
              <p>
                <span>
                  <CalendarDays size={13} /> {nights} night{nights === 1 ? "" : "s"} · <Users size={13} /> {people} guest
                  {Number(people) === 1 ? "" : "s"}
                </span>
              </p>
            </div>
            <div className="bf26-summary-total">
              <span>Total to pay</span>
              <strong>{formatMoney(price)}</strong>
            </div>
            {email && (
              <p className="bf26-email-note">
                <Mail size={15} />
                <span>
                  Your voucher will be emailed to <strong>{email}</strong>
                </span>
              </p>
            )}
          </div>
        </aside>
      </div>
      {step >= 0 && (
        <ProcessingOverlay
          title="Confirming your stay"
          steps={["Authorising payment", "Reserving your room", `Emailing your voucher to ${email}`]}
          current={step}
        />
      )}
    </div>
  );
};

export default HotelPaymentMethod;
