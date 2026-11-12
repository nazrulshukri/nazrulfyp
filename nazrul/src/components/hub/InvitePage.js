import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Loader2, Users } from "lucide-react";
import Avatar from "./Avatar";
import { api } from "../../lib/social";
import { API_BASE } from "../../lib/apiConfig";
import { PENDING_INVITE } from "./Hub";
import "./Hub.css";

/** Landing page for /invite/:token links. */
export default function InvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [from, setFrom] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const signedIn = (() => {
    try {
      return Boolean(localStorage.getItem("token"));
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    fetch(`${API_BASE}/social/invites/${encodeURIComponent(token)}`)
      .then(async (r) => {
        const b = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(b.message || "This invite link isn't valid.");
        setFrom(b.from);
      })
      .catch((e) => setError(e.message));
  }, [token]);

  // Remember the invite so it's accepted right after signing in or up.
  const remember = () => {
    try {
      sessionStorage.setItem(PENDING_INVITE, token);
    } catch {
      /* ignore */
    }
  };

  async function accept() {
    setBusy(true);
    try {
      await api(`/invites/${encodeURIComponent(token)}/accept`, { method: "POST" });
      navigate("/dashboard?tab=friends");
    } catch (e) {
      if (e.status === 401) {
        remember();
        navigate("/signin");
      } else setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="hub-page">
      <div className="hub-gate hub-invite">
        {error && (
          <>
            <span>
              <Users size={26} />
            </span>
            <h1>Invite not found</h1>
            <p>{error}</p>
            <Link className="hub-btn" to="/">
              Go to BookingFlex
            </Link>
          </>
        )}
        {!error && !from && <Loader2 className="hub-spin" />}
        {from && (
          <>
            <Avatar avatar={from.avatar} name={from.name} size={96} ring />
            <h1>{from.name} invited you</h1>
            <p>
              {from.profession ? `${from.profession} · ` : ""}Plan trips together, share moments and save up for your next adventure on BookingFlex.
            </p>
            {signedIn ? (
              <button type="button" className="hub-btn" disabled={busy} onClick={accept}>
                {busy ? <Loader2 size={16} className="hub-spin" /> : <Check size={16} />} Accept and become friends
              </button>
            ) : (
              <div className="hub-gate-actions">
                <Link className="hub-btn" to="/signup" onClick={remember}>
                  Join BookingFlex
                </Link>
                <Link className="hub-btn hub-btn-ghost" to="/signin" onClick={remember}>
                  I have an account
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
