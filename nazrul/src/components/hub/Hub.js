import React, { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Briefcase, Lock, MapPin, MessageCircle, Newspaper, PiggyBank, Plane, UserRound, Users } from "lucide-react";
import Avatar from "./Avatar";
import FeedTab from "./FeedTab";
import ProfileTab from "./ProfileTab";
import FriendsTab from "./FriendsTab";
import TripsTab from "./TripsTab";
import MessagesTab from "./MessagesTab";
import { CallProvider } from "./CallManager";
import { mapi } from "../../lib/messaging";
import Dashboard from "../dashboard";
import { COVERS, api } from "../../lib/social";
import "./Hub.css";

const TABS = [
  ["feed", "Feed", Newspaper],
  ["profile", "Profile", UserRound],
  ["messages", "Messages", MessageCircle],
  ["friends", "Friends", Users],
  ["trips", "Trips & savings", PiggyBank],
  ["bookings", "Bookings", Plane],
];

const PENDING_INVITE = "bookingflexPendingInvite";

/** The signed-in traveller's home: profile, posts, friends, trip savings and bookings. */
export default function Hub() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([id]) => id === params.get("tab")) ? params.get("tab") : "feed";
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [unread, setUnread] = useState(0);
  const signedIn = (() => {
    try {
      return Boolean(localStorage.getItem("token"));
    } catch {
      return false;
    }
  })();

  const load = useCallback(async () => {
    try {
      setMe(await api("/me"));
      setError(null);
    } catch (e) {
      setError(e);
    }
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    (async () => {
      // Finish an invite that was opened before signing in.
      let token = null;
      try {
        token = sessionStorage.getItem(PENDING_INVITE);
      } catch {
        /* ignore */
      }
      if (token) {
        try {
          const r = await api(`/invites/${token}/accept`, { method: "POST" });
          setNotice(`You're now friends with ${r.friend?.name || "your inviter"}.`);
        } catch (e) {
          setNotice(e.message);
        }
        try {
          sessionStorage.removeItem(PENDING_INVITE);
        } catch {
          /* ignore */
        }
      }
      load();
    })();
  }, [signedIn, load]);

  // Unread messages badge, refreshed every 20 seconds.
  useEffect(() => {
    if (!signedIn) return undefined;
    const check = () => mapi("/unread").then((r) => setUnread(r.unread)).catch(() => {});
    check();
    const id = setInterval(() => !document.hidden && check(), 20000);
    return () => clearInterval(id);
  }, [signedIn]);

  if (!signedIn || (error && error.status === 401)) {
    return (
      <div className="hub-page">
        <div className="hub-gate">
          <span>
            <Lock size={26} />
          </span>
          <h1>Your travel space</h1>
          <p>Sign in to see your profile, friends, posts, trip savings and bookings.</p>
          <div className="hub-gate-actions">
            <Link className="hub-btn" to="/signin">
              Sign in
            </Link>
            <Link className="hub-btn hub-btn-ghost" to="/signup">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const p = me?.profile;
  const c = me?.counts;
  const go = (id) => setParams(id === "feed" ? {} : { tab: id });

  return (
    <CallProvider>
    <div className="hub-page">
      <header className="hub-hero" style={{ background: COVERS[p?.cover] || COVERS.forest }}>
        <div className="hub-hero-inner">
          <Avatar avatar={p?.avatar} name={p?.name} size={112} ring />
          <div className="hub-hero-text">
            <h1>{p ? p.name : "Loading…"}</h1>
            {p && (
              <p className="hub-hero-meta">
                {p.profession && (
                  <span>
                    <Briefcase size={14} /> {p.profession}
                  </span>
                )}
                {p.location && (
                  <span>
                    <MapPin size={14} /> {p.location}
                  </span>
                )}
                {p.mood?.emoji && (
                  <span className="hub-mood">
                    {p.mood.emoji} {p.mood.text || "Feeling good"}
                  </span>
                )}
              </p>
            )}
            {p?.bio && <p className="hub-hero-bio">{p.bio}</p>}
          </div>
          {c && (
            <dl className="hub-stats">
              <button type="button" onClick={() => go("friends")}>
                <dt>Friends</dt>
                <dd>{c.friends}</dd>
              </button>
              <button type="button" onClick={() => go("feed")}>
                <dt>Posts</dt>
                <dd>{c.posts}</dd>
              </button>
              <button type="button" onClick={() => go("trips")}>
                <dt>Trip plans</dt>
                <dd>{c.trips}</dd>
              </button>
            </dl>
          )}
        </div>
      </header>

      <nav className="hub-tabs" aria-label="Your space">
        {TABS.map(([id, label, Icon]) => (
          <button key={id} type="button" className={tab === id ? "is-on" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => go(id)}>
            <Icon size={16} /> {label}
            {id === "friends" && c?.incoming > 0 && <b className="hub-badge">{c.incoming}</b>}
            {id === "messages" && unread > 0 && <b className="hub-badge">{unread}</b>}
          </button>
        ))}
      </nav>

      {notice && (
        <p className="hub-notice" role="status">
          {notice}
        </p>
      )}
      {error && error.status !== 401 && <p className="hub-error">{error.message}</p>}

      <main className="hub-main">
        {tab === "feed" && <FeedTab me={p} onChange={load} />}
        {tab === "profile" && p && <ProfileTab profile={p} onSaved={(np) => setMe((m) => ({ ...m, profile: np }))} />}
        {tab === "messages" && <MessagesTab onUnreadChange={setUnread} />}
        {tab === "friends" && <FriendsTab onChange={load} />}
        {tab === "trips" && <TripsTab onChange={load} />}
        {tab === "bookings" && (
          <div className="hub-bookings">
            <Dashboard />
          </div>
        )}
      </main>
    </div>
    </CallProvider>
  );
}

export { PENDING_INVITE };
