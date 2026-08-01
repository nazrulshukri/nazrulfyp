import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Plane, Save, UserRound } from "lucide-react";
import { getCurrentUserEmail, getProfile, saveProfile } from "../lib/bookingStorage";
import "./dashboard.css";

const ProfileMaintenance = () => {
  const email = getCurrentUserEmail();
  const savedProfile = useMemo(() => getProfile(email), [email]);
  const [profile, setProfile] = useState(savedProfile);
  const [saved, setSaved] = useState(false);

  const updateField = (field, value) => {
    setSaved(false);
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextProfile = saveProfile(email, profile);
    setProfile(nextProfile);
    setSaved(true);
  };

  if (!email) {
    return (
      <div className="account-page auth-required">
        <div className="empty-state">
          <UserRound size={38} />
          <h2>Sign in to maintain your profile</h2>
          <p>Your traveller profile is linked to your logged-in email.</p>
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
            <p className="account-kicker"><BadgeCheck size={16} /> Account control</p>
            <h1 className="account-title">Profile Maintenance</h1>
            <p className="account-subtitle">Keep traveller details ready for faster booking, ticket generation, and airport documentation.</p>
          </div>
          <div className="account-actions">
            <Link className="account-button" to="/dashboard"><Plane size={17} /> Dashboard</Link>
            <Link className="account-button" to="/profile"><UserRound size={17} /> Profile</Link>
          </div>
        </div>

        <section className="account-panel">
          <div className="panel-heading">
            <div>
              <h2>Traveller details</h2>
              <p>{email}</p>
            </div>
          </div>

          <form className="maintenance-form" onSubmit={handleSubmit}>
            <div className="maintenance-field">
              <label>Full name</label>
              <input
                type="text"
                value={profile.fullName || ""}
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder="Muhammad Nazrul"
              />
            </div>

            <div className="maintenance-field">
              <label>Phone number</label>
              <input
                type="tel"
                value={profile.phone || ""}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+60"
              />
            </div>

            <div className="maintenance-field">
              <label>Nationality</label>
              <input
                type="text"
                value={profile.nationality || ""}
                onChange={(event) => updateField("nationality", event.target.value)}
                placeholder="Malaysia"
              />
            </div>

            <div className="maintenance-field">
              <label>Passport number</label>
              <input
                type="text"
                value={profile.passportNumber || ""}
                onChange={(event) => updateField("passportNumber", event.target.value)}
                placeholder="A12345678"
              />
            </div>

            <div className="maintenance-field">
              <label>Preferred airport</label>
              <input
                type="text"
                value={profile.preferredAirport || ""}
                onChange={(event) => updateField("preferredAirport", event.target.value)}
                placeholder="Kuala Lumpur International Airport"
              />
            </div>

            <div className="maintenance-field">
              <label>Cabin preference</label>
              <select
                value={profile.cabinPreference || "Economy"}
                onChange={(event) => updateField("cabinPreference", event.target.value)}
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>
            </div>

            <label className="maintenance-toggle">
              <span>
                <strong>Booking and flight notifications</strong>
                <span style={{ display: "block", color: "#64748b", marginTop: 4 }}>
                  Receive dashboard reminders for upcoming departures.
                </span>
              </span>
              <input
                type="checkbox"
                checked={Boolean(profile.notifications)}
                onChange={(event) => updateField("notifications", event.target.checked)}
              />
            </label>

            {saved && <div className="form-success">Profile updated successfully.</div>}

            <div className="maintenance-field full">
              <button className="account-button primary" type="submit">
                <Save size={17} /> Save Profile
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfileMaintenance;
