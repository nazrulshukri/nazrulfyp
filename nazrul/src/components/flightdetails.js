import React, { useEffect, useState } from "react";
import {
  Plane,
  User,
  Mail,
  ShieldCheck,
  ShieldPlus,
  Shield,
  ShieldOff,
  Armchair,
  ChevronDown,
  DoorOpen,
  Check,
} from "lucide-react";
import { AirlineBadge } from "./flightresults";
import PhoneField, { isValidPhone } from "./PhoneField";
import { airportMeta, formatDay, minutesToLabel } from "../lib/travelMeta";
import "./flightdetails.css";

const time = (value) =>
  new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

function LegCard({ label, flight }) {
  const from = airportMeta(flight.origin);
  const to = airportMeta(flight.destination);
  const mins = Math.round(
    (new Date(flight.arrival) - new Date(flight.departure)) / 60000,
  );
  const nextDay = flight.arrival.slice(0, 10) !== flight.departure.slice(0, 10);
  return (
    <article className="bf26-leg">
      <header>
        <span className="bf26-leg-label">{label}</span>
        <span>{formatDay(flight.departure, { year: "numeric" })}</span>
      </header>
      <div className="bf26-leg-body">
        <div className="bf26-flight-airline">
          <AirlineBadge name={flight.airline} size={40} />
          <span>
            <strong>{flight.airline}</strong>
            <small>{flight.flightNumber || "—"} · Economy</small>
          </span>
        </div>
        <div className="bf26-flight-times">
          <div>
            <strong>{time(flight.departure)}</strong>
            <span>{from.code}</span>
          </div>
          <div className="bf26-flight-path">
            <small>{minutesToLabel(mins)}</small>
            <span aria-hidden="true">
              <i />
              {flight.nonStop === false && <b />}
              <Plane size={14} />
            </span>
            <small className={flight.nonStop !== false ? "is-direct" : ""}>
              {flight.nonStop === false ? "1 stop" : "Direct"}
            </small>
          </div>
          <div>
            <strong>
              {time(flight.arrival)}
              {nextDay && <sup>+1</sup>}
            </strong>
            <span>{to.code}</span>
          </div>
        </div>
      </div>
      <footer>
        <span>{flight.origin}</span>
        <span>→</span>
        <span>{flight.destination}</span>
      </footer>
    </article>
  );
}

function FlightDetails({ outboundFlight, returnFlight }) {
  if (!outboundFlight) return <p>No flight details available.</p>;
  return (
    <div className="bf26-legs">
      <LegCard label="Outbound" flight={outboundFlight} />
      {returnFlight && <LegCard label="Return" flight={returnFlight} />}
    </div>
  );
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Field({ id, label, icon: Icon, error, ...props }) {
  return (
    <label className={`bf26-input ${error ? "has-error" : ""}`} htmlFor={id}>
      <span>{label}</span>
      <div>
        <Icon size={17} aria-hidden="true" />
        <input id={id} aria-invalid={!!error} {...props} />
      </div>
      {error && <small role="alert">{error}</small>}
    </label>
  );
}

const PassengerForm = ({ setPassengerDetails, initialPassengerDetails = {} }) => {
  const [values, setValues] = useState({
    firstName: initialPassengerDetails.firstName || "",
    lastName: initialPassengerDetails.lastName || "",
    email: initialPassengerDetails.email || "",
    phone: initialPassengerDetails.phone || "",
  });
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setPassengerDetails(values);
  }, [values, setPassengerDetails]);

  const errors = {
    firstName: !values.firstName.trim() && "Enter a first name",
    lastName: !values.lastName.trim() && "Enter a last name",
    email: !emailPattern.test(values.email) && "Enter a valid email address",
    phone: !isValidPhone(values.phone) && "Enter a valid mobile number",
  };
  const bind = (key) => ({
    value: values[key],
    onChange: (e) => setValues((v) => ({ ...v, [key]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [key]: true })),
    error: touched[key] ? errors[key] : "",
  });

  return (
    <div className="bf26-form-grid">
      <Field
        id="passenger-first"
        label="First name"
        icon={User}
        placeholder="As shown on passport"
        autoComplete="given-name"
        {...bind("firstName")}
      />
      <Field
        id="passenger-last"
        label="Last name"
        icon={User}
        placeholder="As shown on passport"
        autoComplete="family-name"
        {...bind("lastName")}
      />
      <Field
        id="passenger-email"
        label="Email"
        icon={Mail}
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        {...bind("email")}
      />
      <PhoneField
        id="passenger-phone"
        value={values.phone}
        onChange={(phone) => setValues((v) => ({ ...v, phone }))}
        onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
        error={touched.phone ? errors.phone : ""}
      />
      <p className="bf26-note bf26-form-note">
        We’ll send your e-ticket and trip updates to this email.
      </p>
    </div>
  );
};

const OCCUPIED = ["2B", "4E", "6A", "8F", "10C", "12D", "3C", "9A", "11F"];
const ROWS = Array.from({ length: 14 }, (_, i) => i + 1);

const SeatSelection = ({ setSelectedSeats, initialSelectedSeats = [], maxSeats = 9 }) => {
  const [selected, setSelected] = useState(initialSelectedSeats);
  const [open, setOpen] = useState(initialSelectedSeats.length > 0);

  useEffect(() => {
    setSelectedSeats(selected);
  }, [selected, setSelectedSeats]);

  function toggle(seat) {
    if (OCCUPIED.includes(seat)) return;
    if (selected.includes(seat)) setSelected(selected.filter((s) => s !== seat));
    else if (selected.length < maxSeats) setSelected([...selected, seat]);
  }

  const seat = (row, letter) => {
    const id = `${row}${letter}`;
    const taken = OCCUPIED.includes(id);
    const mine = selected.includes(id);
    const full = !mine && selected.length >= maxSeats;
    return (
      <button
        key={id}
        type="button"
        className={`bf26-seat ${mine ? "is-selected" : ""} ${taken ? "is-taken" : ""}`}
        onClick={() => toggle(id)}
        disabled={taken || full}
        aria-pressed={mine}
        aria-label={`Seat ${id}${taken ? ", occupied" : ""}`}
      >
        {mine ? <Check size={14} /> : letter}
      </button>
    );
  };

  return (
    <div className="bf26-seats">
      <button
        type="button"
        className="bf26-seats-toggle"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Armchair size={20} />
        <span>
          <strong>
            {selected.length
              ? `${selected.length} of ${maxSeats} seat${maxSeats > 1 ? "s" : ""} chosen`
              : "Choose your seats"}
          </strong>
          <small>MYR 20 per seat · or get one assigned free at check-in</small>
        </span>
        {selected.length > 0 && (
          <em>{selected.join(", ")}</em>
        )}
        <ChevronDown size={18} className="bf26-chev" />
      </button>

      {open && (
        <div className="bf26-cabin-wrap">
          <div className="bf26-seat-legend">
            <span>
              <i className="is-free" /> Available
            </span>
            <span>
              <i className="is-selected" /> Selected
            </span>
            <span>
              <i className="is-taken" /> Occupied
            </span>
          </div>
          <div className="bf26-cabin">
            <div className="bf26-cabin-nose">
              <Plane size={18} /> Front of aircraft
            </div>
            <div className="bf26-cabin-grid">
              {ROWS.map((row) => (
                <React.Fragment key={row}>
                  {(row === 1 || row === 8) && (
                    <div className="bf26-cabin-exit">
                      <span>
                        <DoorOpen size={13} /> Exit
                      </span>
                      <span>
                        Exit <DoorOpen size={13} />
                      </span>
                    </div>
                  )}
                  {["A", "B", "C"].map((l) => seat(row, l))}
                  <span className="bf26-cabin-row">{row}</span>
                  {["D", "E", "F"].map((l) => seat(row, l))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const insuranceOptions = [
  {
    id: 4,
    name: "No protection",
    description: "Travel without cover.",
    price: 0,
    icon: ShieldOff,
  },
  {
    id: 1,
    name: "Basic",
    description: "Trip cancellation and lost luggage.",
    price: 20,
    icon: Shield,
  },
  {
    id: 2,
    name: "Standard",
    description: "Adds medical and emergency assistance.",
    price: 50,
    icon: ShieldCheck,
    badge: "Popular",
  },
  {
    id: 3,
    name: "Premium",
    description: "Full cover incl. interruption and delay.",
    price: 80,
    icon: ShieldPlus,
  },
];

const InsuranceSelection = ({ setSelectedInsurance, initialSelectedInsurance = null }) => {
  const [chosen, setChosen] = useState(initialSelectedInsurance);
  return (
    <div className="bf26-protect" role="radiogroup" aria-label="Travel protection">
      {insuranceOptions.map((option) => {
        const Icon = option.icon;
        const active = chosen?.id === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={active ? "is-active" : ""}
            onClick={() => {
              const value = {
                id: option.id,
                name: option.name,
                description: option.description,
                price: option.price,
              };
              setChosen(value);
              setSelectedInsurance(value);
            }}
          >
            {option.badge && <em>{option.badge}</em>}
            <Icon size={22} />
            <strong>{option.name}</strong>
            <small>{option.description}</small>
            <span>{option.price ? `MYR ${option.price}` : "Free"}</span>
          </button>
        );
      })}
    </div>
  );
};

const FlightDetailsPage = ({
  outboundFlight,
  returnFlight,
  initialPassengerDetails = {},
  initialSelectedSeats = [],
  initialSelectedInsurance = null,
  onPassengerDetailsChange,
  onSelectedSeatsChange,
  onSelectedInsuranceChange,
  people = 1,
}) => {
  const noop = () => {};
  return (
    <div className="bf26-checkout-sections">
      <section className="bf26-panel">
        <div className="bf26-panel-head">
          <span className="bf26-step-no">1</span>
          <div>
            <h2>Your trip</h2>
            <p>Check the flights and times before you continue.</p>
          </div>
        </div>
        <FlightDetails outboundFlight={outboundFlight} returnFlight={returnFlight} />
      </section>

      <section className="bf26-panel">
        <div className="bf26-panel-head">
          <span className="bf26-step-no">2</span>
          <div>
            <h2>Lead traveller</h2>
            <p>
              Booking for {people} {people === 1 ? "traveller" : "travellers"}.
              Names must match travel documents.
            </p>
          </div>
        </div>
        <PassengerForm
          setPassengerDetails={onPassengerDetailsChange || noop}
          initialPassengerDetails={initialPassengerDetails}
        />
      </section>

      <section className="bf26-panel">
        <div className="bf26-panel-head">
          <span className="bf26-step-no">3</span>
          <div>
            <h2>Seats</h2>
            <p>Sit together, or pick the window. Up to {people} seat{people > 1 ? "s" : ""}.</p>
          </div>
        </div>
        <SeatSelection
          setSelectedSeats={onSelectedSeatsChange || noop}
          initialSelectedSeats={initialSelectedSeats}
          maxSeats={people}
        />
      </section>

      <section className="bf26-panel">
        <div className="bf26-panel-head">
          <span className="bf26-step-no">4</span>
          <div>
            <h2>Travel protection</h2>
            <p>Cover for the unexpected. You can skip this.</p>
          </div>
        </div>
        <InsuranceSelection
          setSelectedInsurance={onSelectedInsuranceChange || noop}
          initialSelectedInsurance={initialSelectedInsurance}
        />
      </section>
    </div>
  );
};

export default FlightDetailsPage;
