import { API_BASE } from "../lib/apiConfig";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  TrainFront,
  User,
  Mail,
  MapPin,
  Lock,
  Repeat,
  CalendarDays,
} from "lucide-react";
import { BookingSteps } from "./flightresults";
import PhoneField, { isValidPhone } from "./PhoneField";
import { formatMoney } from "../lib/bookingStorage";
import { formatDay } from "../lib/travelMeta";
import { stationCode, stationLabel } from "../lib/trainNetwork";
import "./fillform.css";

const TRAIN_STEPS = ["Search", "Train", "Traveller details", "Payment"];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FormPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedTrain } = location.state || {};
  const [formData, setFormData] = useState({
    name: "",
    telephone: "",
    email: "",
    address: "",
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!selectedTrain) {
    return (
      <section className="bf-empty">
        <TrainFront size={36} />
        <h1>No train selected yet.</h1>
        <p>Choose a train first, then add passenger details.</p>
        <Link className="bf-primary" to="/train">
          Back to trains <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const {
    LineID,
    details,
    price,
    totalPrice,
    departureTime,
    arrivalTime,
    travelTime,
    origin,
    destination,
    startDate,
    returnDate,
    people = 1,
  } = selectedTrain;

  const errors = {
    name: !formData.name.trim() && "Enter the lead passenger’s full name",
    telephone: !isValidPhone(formData.telephone) && "Enter a valid mobile number",
    email: !emailPattern.test(formData.email) && "Enter a valid email address",
    address: !formData.address.trim() && "Enter a contact address",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (hasErrors) {
      setTouched({ name: true, telephone: true, email: true, address: true });
      return;
    }
    setSubmitting(true);
    const payload = {
      ...formData,
      trainDetails: details,
      departureTime,
      arrivalTime,
      travelTime,
      startDate,
      returnDate,
      people,
      price,
      totalPrice,
      LineID,
      trainId: LineID,
      origin,
      destination,
    };
    let booking = { ...payload, _id: `TRAIN-${Date.now()}` };
    try {
      const response = await axios.post(`${API_BASE}/bookTrain`, payload, {
        timeout: 8000,
      });
      if (response.status === 200 && response.data?.booking) {
        booking = { ...booking, ...response.data.booking, ...payload };
      }
    } catch (error) {
      // Backend is optional for the prototype; continue with a local reference.
      console.warn("Train booking service unavailable, continuing locally.", error);
    }
    navigate("/trainpayment", { state: { bookingDetails: booking } });
  };

  const bind = (key) => ({
    name: key,
    value: formData[key],
    onChange: (e) => setFormData({ ...formData, [key]: e.target.value }),
    onBlur: () => setTouched((t) => ({ ...t, [key]: true })),
    "aria-invalid": !!(touched[key] && errors[key]),
  });
  const err = (key) =>
    touched[key] && errors[key] ? <small role="alert">{errors[key]}</small> : null;

  return (
    <div className="bf26-page bf26-checkout">
      <div className="bf26-results-top">
        <button type="button" className="bf-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back to trains
        </button>
        <BookingSteps current="Traveller details" steps={TRAIN_STEPS} />
      </div>

      <header className="bf26-checkout-head">
        <span className="bf26-kicker">Almost there</span>
        <h1>Who’s travelling?</h1>
      </header>

      <form className="bf26-checkout-layout" onSubmit={handleSubmit} noValidate>
        <div className="bf26-checkout-sections">
          <section className="bf26-panel">
            <div className="bf26-panel-head">
              <span className="bf26-step-no">1</span>
              <div>
                <h2>Your train</h2>
                <p>Check the service and times before you continue.</p>
              </div>
            </div>
            <article className="bf26-leg">
              <header>
                <span className="bf26-leg-label">
                  {returnDate ? "Return journey" : "One way"}
                </span>
                <span>{formatDay(startDate, { year: "numeric" })}</span>
              </header>
              <div className="bf26-leg-body">
                <div className="bf26-flight-airline">
                  <span className="bf26-rail-badge" style={{ "--line": "#1d4a3f" }}>
                    <TrainFront size={20} />
                  </span>
                  <span>
                    <strong>{details}</strong>
                    <small>{LineID} · Standard class</small>
                  </span>
                </div>
                <div className="bf26-flight-times">
                  <div>
                    <strong>{departureTime}</strong>
                    <span>{stationCode(origin)}</span>
                  </div>
                  <div className="bf26-flight-path">
                    <small>{travelTime || "—"}</small>
                    <span aria-hidden="true">
                      <i />
                      <TrainFront size={14} />
                    </span>
                    <small>{stationLabel(origin)} → {stationLabel(destination)}</small>
                  </div>
                  <div>
                    <strong>{arrivalTime}</strong>
                    <span>{stationCode(destination)}</span>
                  </div>
                </div>
              </div>
              {returnDate && (
                <footer>
                  <Repeat size={14} />
                  <span>Return on {formatDay(returnDate, { year: "numeric" })}</span>
                </footer>
              )}
            </article>
          </section>

          <section className="bf26-panel">
            <div className="bf26-panel-head">
              <span className="bf26-step-no">2</span>
              <div>
                <h2>Lead passenger</h2>
                <p>
                  Booking for {people} {people === 1 ? "passenger" : "passengers"}. Tickets
                  are sent to this email.
                </p>
              </div>
            </div>
            <div className="bf26-form-grid">
              <label className={`bf26-input ${err("name") ? "has-error" : ""}`}>
                <span>Full name</span>
                <div>
                  <User size={17} />
                  <input placeholder="As shown on IC or passport" autoComplete="name" {...bind("name")} />
                </div>
                {err("name")}
              </label>
<PhoneField
                id="train-phone"
                value={formData.telephone}
                onChange={(telephone) => setFormData((f) => ({ ...f, telephone }))}
                onBlur={() => setTouched((t) => ({ ...t, telephone: true }))}
                error={touched.telephone ? errors.telephone : ""}
              />
              <label className={`bf26-input ${err("email") ? "has-error" : ""}`}>
                <span>Email</span>
                <div>
                  <Mail size={17} />
                  <input type="email" placeholder="you@example.com" autoComplete="email" {...bind("email")} />
                </div>
                {err("email")}
              </label>
              <label className={`bf26-input ${err("address") ? "has-error" : ""}`}>
                <span>Address</span>
                <div>
                  <MapPin size={17} />
                  <input placeholder="Street, city, postcode" autoComplete="street-address" {...bind("address")} />
                </div>
                {err("address")}
              </label>
            </div>
          </section>
        </div>

        <aside className="bf26-summary">
          <div className="bf26-summary-card">
            <span className="bf26-kicker">
              Price summary · {people} {people === 1 ? "passenger" : "passengers"}
            </span>
            <div className="bf26-summary-rows">
              <p>
                <span>Fare per passenger</span>
                <strong>{formatMoney(price)}</strong>
              </p>
              <p>
                <span>Passengers</span>
                <strong>× {people}</strong>
              </p>
              {returnDate && (
                <p>
                  <span>
                    <CalendarDays size={13} /> Return journey
                  </span>
                  <strong>× 2</strong>
                </p>
              )}
            </div>
            <div className="bf26-summary-total">
              <span>Total to pay</span>
              <strong>{formatMoney(totalPrice)}</strong>
            </div>
            <button type="submit" className="bf26-primary bf26-cta" disabled={submitting}>
              {submitting ? "Saving…" : "Continue to payment"} <ArrowRight size={17} />
            </button>
            <p className="bf26-note">
              <Lock size={14} /> Sample booking. No real payment is taken on this page.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default FormPage;
