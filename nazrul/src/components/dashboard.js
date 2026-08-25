import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Plane,
  Settings,
  TicketCheck,
  WalletCards,
} from "lucide-react";
import {
  formatFlightDate,
  formatMoney,
  getBookingHistory,
  getCurrentUserEmail,
  getDaysUntil,
  getProfile,
} from "../lib/bookingStorage";
import "./dashboard.css";

const getAirportCode = (value, code) => {
  if (code) return String(code).toUpperCase();
  const raw = String(value || "").replace(/[^a-z]/gi, "").toUpperCase();
  return (raw.slice(0, 3) || "---").padEnd(3, "-");
};

const getCountdownText = (days) => {
  if (days === null) return { value: "TBC", label: "date pending", className: "" };
  if (days < 0) return { value: "Done", label: "completed", className: "past" };
  if (days === 0) return { value: "Today", label: "departing", className: "today" };
  if (days === 1) return { value: "1", label: "day left", className: "" };
  return { value: String(days), label: "days left", className: "" };
};

const sortByDeparture = (a, b) => {
  const aTime = new Date(a.outboundFlight?.departure || 0).getTime();
  const bTime = new Date(b.outboundFlight?.departure || 0).getTime();
  return aTime - bTime;
};

const FlightCard = ({ booking }) => {
  const outbound = booking.outboundFlight || {};
  const returnFlight = booking.returnFlight || null;
  const days = getDaysUntil(outbound.departure);
  const countdown = getCountdownText(days);
  const seats = booking.selectedSeats?.length ? booking.selectedSeats.join(", ") : "-";

  return (
    <article className="flight-card-pro">
      <div className="flight-card-head">
        <div className="flight-card-title">
          <span className="flight-icon-box"><Plane size={20} /></span>
          <div>
            <h3>{outbound.airline || "Flight booking"}</h3>
            <p>{booking.bookingId || "-"} · {outbound.flightNumber || "-"}</p>
          </div>
        </div>
        <div className={`countdown-pill ${countdown.className}`}>
          {countdown.value}
          <small>{countdown.label}</small>
        </div>
      </div>

      <div className="flight-route-pro">
        <div className="route-point">
          <strong>{getAirportCode(outbound.origin, outbound.originCode)}</strong>
          <span>{outbound.origin || "-"}</span>
          <span>{formatFlightDate(outbound.departure)}</span>
        </div>
        <div className="route-line" aria-hidden="true">
          <Plane size={18} />
        </div>
        <div className="route-point">
          <strong>{getAirportCode(outbound.destination, outbound.destinationCode)}</strong>
          <span>{outbound.destination || "-"}</span>
          <span>{formatFlightDate(outbound.arrival)}</span>
        </div>
      </div>

      {returnFlight?.flightNumber && (
        <div className="flight-route-pro" style={{ marginTop: 10 }}>
          <div className="route-point">
            <strong>{getAirportCode(returnFlight.origin, returnFlight.originCode)}</strong>
            <span>{returnFlight.origin || "-"}</span>
            <span>{formatFlightDate(returnFlight.departure)}</span>
          </div>
          <div className="route-line" aria-hidden="true">
            <ArrowRight size={18} />
          </div>
          <div className="route-point">
            <strong>{getAirportCode(returnFlight.destination, returnFlight.destinationCode)}</strong>
            <span>{returnFlight.destination || "-"}</span>
            <span>{formatFlightDate(returnFlight.arrival)}</span>
          </div>
        </div>
      )}

      <div className="flight-meta-row">
        <div className="flight-meta">
          <span>Departure date</span>
          <strong>{formatFlightDate(outbound.departure)}</strong>
        </div>
        <div className="flight-meta">
          <span>Seats</span>
          <strong>{seats}</strong>
        </div>
        <div className="flight-meta">
          <span>Paid</span>
          <strong>{formatMoney(booking.amount)}</strong>
        </div>
        <div className="flight-meta">
          <span>Status</span>
          <strong>{booking.status || "Confirmed"}</strong>
        </div>
      </div>
    </article>
  );
};

const AuthRequired = () => (
  <div className="account-page auth-required">
    <div className="empty-state">
      <TicketCheck size={38} />
      <h2>Sign in to view your dashboard</h2>
      <p>Your dashboard shows confirmed flights, countdown dates, profile details, and booking activity.</p>
      <Link className="account-button primary" to="/signin">Go to login</Link>
    </div>
  </div>
);

const Dashboard = () => {
  const email = getCurrentUserEmail();
  const bookings = useMemo(() => getBookingHistory(email).slice().sort(sortByDeparture), [email]);
  const profile = useMemo(() => getProfile(email), [email]);
  const upcoming = bookings.filter((booking) => {
    const days = getDaysUntil(booking.outboundFlight?.departure);
    return days === null || days >= 0;
  });
  const nextTrip = upcoming[0] || bookings[0];
  const nextDays = getDaysUntil(nextTrip?.outboundFlight?.departure);
  const totalSpent = bookings.reduce((sum, booking) => sum + (Number(booking.amount) || 0), 0);

  if (!email) return <AuthRequired />;

  return (
    <div className="account-page">
      <div className="account-shell">
        <div className="account-topbar">
          <div>
            <p className="account-kicker"><BadgeCheck size={16} /> BookingFlex account</p>
            <h1 className="account-title">Flight Dashboard</h1>
            <p className="account-subtitle">
              Welcome back{profile.fullName ? `, ${profile.fullName}` : ""}. Track your confirmed flights, departure dates, and travel readiness in one place.
            </p>
          </div>
          <div className="account-actions">
            <Link className="account-button" to="/profile"><TicketCheck size={17} /> Profile</Link>
            <Link className="account-button primary" to="/profile-maintenance"><Settings size={17} /> Maintain Profile</Link>
          </div>
        </div>

        <section className="dashboard-grid">
          <div className="metric-card">
            <div className="metric-head">Upcoming <Plane size={18} /></div>
            <div className="metric-value">{upcoming.length}</div>
            <p className="metric-note">confirmed flight bookings</p>
          </div>
          <div className="metric-card">
            <div className="metric-head">Next Flight <Clock3 size={18} /></div>
            <div className="metric-value">{nextDays === null ? "TBC" : Math.max(nextDays, 0)}</div>
            <p className="metric-note">{nextDays === 1 ? "day remaining" : "days remaining"}</p>
          </div>
          <div className="metric-card">
            <div className="metric-head">Travel Date <CalendarDays size={18} /></div>
            <div className="metric-value" style={{ fontSize: "1.15rem" }}>{formatFlightDate(nextTrip?.outboundFlight?.departure)}</div>
            <p className="metric-note">next departure</p>
          </div>
          <div className="metric-card">
            <div className="metric-head">Total Paid <WalletCards size={18} /></div>
            <div className="metric-value" style={{ fontSize: "1.35rem" }}>{formatMoney(totalSpent)}</div>
            <p className="metric-note">saved payment history</p>
          </div>
        </section>

        <div className="dashboard-main">
          <section className="account-panel">
            <div className="panel-heading">
              <div>
                <h2>Your flights</h2>
                <p>Flights paid through BookingFlex appear here automatically.</p>
              </div>
              <Link className="account-button" to="/flight-results">Book Flight</Link>
            </div>

            {bookings.length ? (
              <div className="flight-list-pro">
                {bookings.map((booking) => (
                  <FlightCard key={booking.bookingId} booking={booking} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Plane size={36} />
                <h3>No paid flights yet</h3>
                <p>After you complete payment, your flight will appear here with the departure date and countdown.</p>
                <Link className="account-button primary" to="/">Search flights</Link>
              </div>
            )}
          </section>

          <aside className="next-trip-panel">
            <section className="account-panel">
              <div className="panel-heading">
                <div>
                  <h2>Next trip</h2>
                  <p>{nextTrip?.outboundFlight?.flightNumber || "No flight selected"}</p>
                </div>
              </div>
              <div className="next-trip-date">
                <span>Departure countdown</span>
                <strong>{nextDays === null ? "TBC" : Math.max(nextDays, 0)}</strong>
                <p>{nextDays === 1 ? "day left" : "days left"} · {formatFlightDate(nextTrip?.outboundFlight?.departure)}</p>
              </div>
            </section>

            <section className="account-panel">
              <div className="panel-heading">
                <div>
                  <h2>Travel profile</h2>
                  <p>{email}</p>
                </div>
              </div>
              <div className="profile-detail-list">
                <div className="profile-detail">
                  <span className="field-icon"><Settings size={18} /></span>
                  <div>
                    <span>Cabin preference</span>
                    <strong>{profile.cabinPreference || "Economy"}</strong>
                  </div>
                </div>
                <div className="profile-detail">
                  <span className="field-icon"><CalendarDays size={18} /></span>
                  <div>
                    <span>Preferred airport</span>
                    <strong>{profile.preferredAirport || "Not set"}</strong>
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
