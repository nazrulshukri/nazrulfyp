import { API_BASE } from "../lib/apiConfig";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  User,
  Mail,
  Globe2,
  MapPin,
  Clock,
  MessageSquare,
  Lock,
  Moon,
  Users,
  ShieldCheck,
} from "lucide-react";
import { BookingSteps } from "./flightresults";
import PhoneField, { isValidPhone } from "./PhoneField";
import { formatDay } from "../lib/travelMeta";
import "./hotelform.css";

const HOTEL_STEPS = ["Search", "Stay", "Guest details", "Payment"];
const HOTEL_DRAFT_KEY = "hotelBookingDraft";
const HOTEL_PAYMENT_DRAFT_KEY = "hotelPaymentDraft";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const formatMYR = (value) => `MYR ${Math.round(Number(value || 0)).toLocaleString("en-MY")}`;

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
};

const FIELDS = [
  ["firstName", "First name", User, { autoComplete: "given-name", placeholder: "As on your ID" }, true],
  ["lastName", "Last name", User, { autoComplete: "family-name", placeholder: "As on your ID" }, true],
  ["email", "Email", Mail, { type: "email", autoComplete: "email", placeholder: "you@example.com" }, true],
  ["country", "Country / region", Globe2, { autoComplete: "country-name", placeholder: "Malaysia" }, true],
  ["city", "City", MapPin, { autoComplete: "address-level2", placeholder: "Kuala Lumpur" }, false],
  ["address", "Address", MapPin, { autoComplete: "street-address", placeholder: "Street address" }, false],
  ["zip", "Postcode", MapPin, { autoComplete: "postal-code", placeholder: "50000" }, false],
];

const HotelForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingState = location.state || safeParse(sessionStorage.getItem(HOTEL_DRAFT_KEY), {});
  const { selectedHotel, totalPrice, startDate, returnDate, people } = bookingState;
  const [values, setValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: "",
    zip: "",
    arrivalTime: "",
    specialRequests: "",
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!selectedHotel) {
    return (
      <section className="bf-empty">
        <BedDouble size={36} />
        <h1>No stay selected yet.</h1>
        <p>Choose a hotel again to continue your booking.</p>
        <Link className="bf-primary" to="/hotel">
          Browse hotels <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const errors = {
    firstName: !values.firstName.trim() && "Enter a first name",
    lastName: !values.lastName.trim() && "Enter a last name",
    email: !emailPattern.test(values.email) && "Enter a valid email address",
    phone: !isValidPhone(values.phone) && "Enter a valid mobile number",
    country: !values.country.trim() && "Enter your country or region",
  };
  const nights = Math.max(
    1,
    Math.round((new Date(returnDate) - new Date(startDate)) / 86400000) || 1,
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (Object.values(errors).some(Boolean)) {
      setTouched(Object.fromEntries(Object.keys(errors).map((k) => [k, true])));
      return;
    }
    setSubmitting(true);
    const bookingData = {
      hotelName: selectedHotel.hotelName,
      hotellocation: selectedHotel.location,
      checkInDate: startDate,
      checkOutDate: returnDate,
      price: totalPrice,
      people,
      roomType: selectedHotel.roomType,
      userData: { ...values },
    };
    sessionStorage.setItem(
      HOTEL_DRAFT_KEY,
      JSON.stringify({ selectedHotel, totalPrice, startDate, returnDate, people }),
    );
    sessionStorage.setItem(HOTEL_PAYMENT_DRAFT_KEY, JSON.stringify(bookingData));
    try {
      const response = await fetch(`${API_BASE}/hotelform`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) console.warn("Hotel booking was not saved, continuing to payment.");
    } catch (error) {
      console.warn("Hotel booking save failed, continuing to payment:", error);
    }
    navigate("/hotelpaymentmethod", { state: bookingData });
  };

  const bind = (key) => ({
    id: `guest-${key}`,
    name: key,
    value: values[key],
    onChange: (e) => setValues((v) => ({ ...v, [key]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [key]: true })),
  });

  return (
    <div className="bf26-page bf26-checkout">
      <div className="bf26-results-top">
        <button type="button" className="bf-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} /> Back to stay
        </button>
        <BookingSteps current="Guest details" steps={HOTEL_STEPS} />
      </div>

      <header className="bf26-checkout-head">
        <span className="bf26-kicker">Almost there</span>
        <h1>Who’s checking in?</h1>
      </header>

      <form className="bf26-checkout-layout" onSubmit={handleSubmit} noValidate>
        <div className="bf26-checkout-sections">
          <section className="bf26-panel">
            <div className="bf26-panel-head">
              <span className="bf26-step-no">1</span>
              <div>
                <h2>Lead guest</h2>
                <p>We’ll send your confirmation to this email.</p>
              </div>
            </div>
            <div className="bf26-form-grid">
              {FIELDS.slice(0, 3).map(([key, label, Icon, props, required]) => {
                const error = touched[key] && errors[key];
                return (
                  <label
                    key={key}
                    className={`bf26-input ${error ? "has-error" : ""}`}
                    htmlFor={`guest-${key}`}
                  >
                    <span>
                      {label}
                      {!required && <em className="bf26-optional"> · optional</em>}
                    </span>
                    <div>
                      <Icon size={17} />
                      <input {...props} {...bind(key)} aria-invalid={!!error} />
                    </div>
                    {error && <small role="alert">{error}</small>}
                  </label>
                );
              })}
              <PhoneField
                id="guest-phone"
                value={values.phone}
                onChange={(phone) => setValues((v) => ({ ...v, phone }))}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                error={touched.phone ? errors.phone : ""}
              />
              {FIELDS.slice(3).map(([key, label, Icon, props, required]) => {
                const error = touched[key] && errors[key];
                return (
                  <label
                    key={key}
                    className={`bf26-input ${error ? "has-error" : ""}`}
                    htmlFor={`guest-${key}`}
                  >
                    <span>
                      {label}
                      {!required && <em className="bf26-optional"> · optional</em>}
                    </span>
                    <div>
                      <Icon size={17} />
                      <input {...props} {...bind(key)} aria-invalid={!!error} />
                    </div>
                    {error && <small role="alert">{error}</small>}
                  </label>
                );
              })}
            </div>
          </section>

          <section className="bf26-panel">
            <div className="bf26-panel-head">
              <span className="bf26-step-no">2</span>
              <div>
                <h2>Arrival & requests</h2>
                <p>Let the property know how to prepare. Requests aren’t guaranteed.</p>
              </div>
            </div>
            <div className="bf26-form-grid">
              <label className="bf26-input" htmlFor="guest-arrivalTime">
                <span>Estimated arrival</span>
                <div>
                  <Clock size={17} />
                  <select className="bf26-bare-select" {...bind("arrivalTime")}>
                    <option value="">I don’t know yet</option>
                    {["15:00 – 16:00", "16:00 – 18:00", "18:00 – 20:00", "20:00 – 22:00", "After 22:00"].map(
                      (slot) => (
                        <option key={slot}>{slot}</option>
                      ),
                    )}
                  </select>
                </div>
              </label>
              <label className="bf26-input bf26-span-2" htmlFor="guest-specialRequests">
                <span>
                  Special requests <em className="bf26-optional"> · optional</em>
                </span>
                <div className="bf26-textarea">
                  <MessageSquare size={17} />
                  <textarea
                    rows={3}
                    placeholder="e.g. high floor, quiet room, late check-in"
                    {...bind("specialRequests")}
                  />
                </div>
              </label>
            </div>
          </section>
        </div>

        <aside className="bf26-summary">
          <div className="bf26-summary-card">
            {selectedHotel.images?.[0] && (
              <img className="bf26-summary-img" src={selectedHotel.images[0]} alt="" />
            )}
            <div>
              <span className="bf26-hotel-brand">
                {selectedHotel.brand} · {"★".repeat(selectedHotel.starRating || 0)}
              </span>
              <h3 className="bf26-summary-hotel">{selectedHotel.hotelName}</h3>
              <p className="bf26-hotel-loc">
                <MapPin size={13} /> {selectedHotel.location}
                {selectedHotel.rating && (
                  <>
                    {" "}
                    · <strong className="bf26-mini-score">{selectedHotel.rating}</strong>
                  </>
                )}
              </p>
            </div>
            <div className="bf26-stay-dates">
              <div>
                <small>Check-in</small>
                <strong>{formatDay(startDate)}</strong>
                <small>from 15:00</small>
              </div>
              <div>
                <small>Check-out</small>
                <strong>{formatDay(returnDate)}</strong>
                <small>until 11:00</small>
              </div>
            </div>
            <div className="bf26-summary-rows">
              <p>
                <span>
                  <BedDouble size={13} /> {selectedHotel.roomType}
                </span>
              </p>
              <p>
                <span>
                  <Moon size={13} /> {nights} night{nights === 1 ? "" : "s"} · <Users size={13} />{" "}
                  {people} guest{Number(people) === 1 ? "" : "s"}
                </span>
              </p>
            </div>
            <div className="bf26-summary-total">
              <span>Total</span>
              <strong>{formatMYR(totalPrice)}</strong>
            </div>
            <button type="submit" className="bf26-primary bf26-cta" disabled={submitting}>
              {submitting ? "Saving…" : "Continue to payment"} <ArrowRight size={17} />
            </button>
            <p className="bf26-note">
              <ShieldCheck size={14} /> Free cancellation on most rooms until 3 days before check-in.
            </p>
            <p className="bf26-note">
              <Lock size={14} /> Sample booking. No real payment is taken on this page.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default HotelForm;
