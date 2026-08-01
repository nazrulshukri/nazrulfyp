import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Mail,
  MapPin,
  Plane,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  formatFlightDate,
  getBookingHistory,
  getCurrentUserEmail,
  getDaysUntil,
  getProfile,
} from "../lib/bookingStorage";
import "./dashboard.css";

const getInitials = (profile, email) => {
  const source = profile.fullName || email || "User";
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
};

const Profile = () => {
  const email = getCurrentUserEmail();
  const profile = useMemo(() => getProfile(email), [email]);
  const bookings = useMemo(() => getBookingHistory(email), [email]);
  const nextTrip = bookings
    .filter((booking) => {
      const days = getDaysUntil(booking.outboundFlight?.departure);
      return days === null || days >= 0;
    })
    .sort((a, b) => new Date(a.outboundFlight?.departure || 0) - new Date(b.outboundFlight?.departure || 0))[0];

  if (!email) {
    return (
      <div className="account-page auth-required">
        <div className="empty-state">
          <UserRound size={38} />
          <h2>Profile requires login</h2>
          <p>Sign in to view your BookingFlex profile and travel history.</p>
          <Link className="account-button primary" to="/signin">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-shell">
        <div className="account-topbar">
          <div>
            <p className="account-kicker"><UserRound size={16} /> Traveller profile</p>
            <h1 className="account-title">Profile</h1>
            <p className="account-subtitle">Your saved BookingFlex identity, travel preferences, and next-flight snapshot.</p>
          </div>
          <div className="account-actions">
            <Link className="account-button" to="/dashboard"><Plane size={17} /> Dashboard</Link>
            <Link className="account-button primary" to="/profile-maintenance"><Settings size={17} /> Edit Profile</Link>
          </div>
        </div>

        <div className="profile-grid">
          <section className="profile-card">
            <div className="profile-avatar">{getInitials(profile, email)}</div>
            <h2 className="profile-name">{profile.fullName || email.split("@")[0]}</h2>
            <p className="profile-email">{email}</p>

            <div className="profile-detail-list">
              <div className="profile-detail">
                <span className="field-icon"><Mail size={18} /></span>
                <div>
                  <span>Email</span>
                  <strong>{email}</strong>
                </div>
              </div>
              <div className="profile-detail">
                <span className="field-icon"><ShieldCheck size={18} /></span>
                <div>
                  <span>Passport</span>
                  <strong>{profile.passportNumber || "Not added"}</strong>
                </div>
              </div>
              <div className="profile-detail">
                <span className="field-icon"><MapPin size={18} /></span>
                <div>
                  <span>Preferred airport</span>
                  <strong>{profile.preferredAirport || "Not set"}</strong>
                </div>
              </div>
            </div>
          </section>

          <section className="account-panel">
            <div className="panel-heading">
              <div>
                <h2>Account overview</h2>
                <p>Profile information is stored locally on this device for your FYP demo flow.</p>
              </div>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
              <div className="metric-card">
                <div className="metric-head">Flights <Plane size={18} /></div>
                <div className="metric-value">{bookings.length}</div>
                <p className="metric-note">paid bookings</p>
              </div>
              <div className="metric-card">
                <div className="metric-head">Next <CalendarDays size={18} /></div>
                <div className="metric-value" style={{ fontSize: "1.15rem" }}>{formatFlightDate(nextTrip?.outboundFlight?.departure)}</div>
                <p className="metric-note">departure date</p>
              </div>
              <div className="metric-card">
                <div className="metric-head">Cabin <Settings size={18} /></div>
                <div className="metric-value" style={{ fontSize: "1.35rem" }}>{profile.cabinPreference || "Economy"}</div>
                <p className="metric-note">preference</p>
              </div>
            </div>

            <div className="profile-detail-list">
              <div className="profile-detail">
                <span className="field-icon"><UserRound size={18} /></span>
                <div>
                  <span>Full name</span>
                  <strong>{profile.fullName || "Not added"}</strong>
                </div>
              </div>
              <div className="profile-detail">
                <span className="field-icon"><ShieldCheck size={18} /></span>
                <div>
                  <span>Nationality</span>
                  <strong>{profile.nationality || "Not added"}</strong>
                </div>
              </div>
              <div className="profile-detail">
                <span className="field-icon"><Mail size={18} /></span>
                <div>
                  <span>Notifications</span>
                  <strong>{profile.notifications ? "Enabled" : "Disabled"}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
