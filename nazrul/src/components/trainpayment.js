import { API_BASE } from "../lib/apiConfig";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, TrainFront, Users, Mail, ShieldCheck, Repeat } from "lucide-react";
import PaymentPanel, { ProcessingOverlay } from "./PaymentPanel";
import { BookingSteps } from "./flightresults";
import { formatMoney } from "../lib/bookingStorage";
import { formatDay } from "../lib/travelMeta";
import { stationCode } from "../lib/trainNetwork";
import "./trainpayment.css";

const TRAIN_STEPS = ["Search", "Train", "Traveller details", "Payment"];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const TrainPaymentMethod = () => {
  const navigate = useNavigate();
  const { bookingDetails } = useLocation().state || {};
  const [step, setStep] = useState(-1);

  if (!bookingDetails) {
    return (
      <section className="bf-empty">
        <TrainFront size={36} />
        <h1>Your train checkout has expired.</h1>
        <p>Choose your train again to continue.</p>
        <Link className="bf-primary" to="/train">
          Back to trains <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const b = bookingDetails;
  const email = b.email;

  async function pay({ label, detail }) {
    setStep(0);
    // Only non-sensitive fields are sent; card details stay in the browser.
    const record = {
      trainId: b.trainId || b.LineID,
      origin: b.origin,
      destination: b.destination,
      departureTime: b.departureTime,
      totalPrice: b.totalPrice,
      paymentMethod: label,
    };
    await Promise.all([
      wait(1000),
      fetch(`${API_BASE}/trainsubmit-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      }).catch(() => null),
    ]);
    setStep(1);
    await wait(700);
    setStep(2);

    const ticket = {
      ...b,
      paymentMethod: label,
      paymentDetail: detail,
      paymentStatus: "Success",
      paidAt: new Date().toISOString(),
    };
    let emailStatus = "sent";
    try {
      const res = await fetch(`${API_BASE}/send-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "train", email, booking: ticket }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) emailStatus = "failed";
    } catch (e) {
      emailStatus = "failed";
    }
    const done = { ...ticket, emailStatus };
    sessionStorage.setItem("lastTrainTicket", JSON.stringify(done));
    setStep(3);
    await wait(500);
    navigate("/trainconfirmation", { state: { bookingDetails: done } });
  }

  return (
    <div className="bf26-page bf26-checkout">
      <div className="bf26-results-top">
        <button type="button" className="bf-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back to passenger details
        </button>
        <BookingSteps current="Payment" steps={TRAIN_STEPS} />
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
              <p>Your e-ticket is issued the moment payment is confirmed.</p>
            </div>
          </div>
          <PaymentPanel
            amountLabel={formatMoney(b.totalPrice)}
            defaultEmail={email}
            onPay={pay}
            disabled={step >= 0}
          />
        </section>
        <aside className="bf26-summary">
          <div className="bf26-summary-card">
            <span className="bf26-kicker">Your train</span>
            <div className="bf26-mini-leg">
              <span className="bf26-rail-badge" style={{ "--line": "#1d4a3f", width: 36, height: 36 }}>
                <TrainFront size={17} />
              </span>
              <span>
                <small>
                  {b.trainDetails} · {formatDay(b.startDate)}
                </small>
                <strong>
                  {stationCode(b.origin)} {b.departureTime} <ArrowRight size={13} /> {stationCode(b.destination)} {b.arrivalTime}
                </strong>
                <small>{b.LineID}</small>
              </span>
            </div>
            <div className="bf26-summary-rows">
              <p>
                <span>
                  <Users size={13} /> {b.people || 1} passenger{Number(b.people) > 1 ? "s" : ""} · {b.name}
                </span>
              </p>
              {b.returnDate && (
                <p>
                  <span>
                    <Repeat size={13} /> Return {formatDay(b.returnDate)}
                  </span>
                </p>
              )}
            </div>
            <div className="bf26-summary-total">
              <span>Total to pay</span>
              <strong>{formatMoney(b.totalPrice)}</strong>
            </div>
            {email && (
              <p className="bf26-email-note">
                <Mail size={15} />
                <span>
                  Your e-ticket will be emailed to <strong>{email}</strong>
                </span>
              </p>
            )}
          </div>
        </aside>
      </div>
      {step >= 0 && (
        <ProcessingOverlay
          title="Confirming your train"
          steps={["Authorising payment", "Issuing your e-ticket", `Emailing your ticket to ${email}`]}
          current={step}
        />
      )}
    </div>
  );
};

export default TrainPaymentMethod;
