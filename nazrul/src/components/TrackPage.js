import React, { useCallback, useEffect, useMemo, useState } from "react";
import { dateLocale, t } from "../lib/i18n";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Plane,
  TrainFront,
  BedDouble,
  Ticket,
  Search,
  RefreshCw,
  Radio,
  Clock,
  ArrowRight,
  MapPin,
  Gauge,
  Mountain,
  LogIn,
  CircleCheck,
  Loader2,
} from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { getBookingHistory, formatMoney } from "../lib/bookingStorage";
import { getSession } from "../lib/auth";
import { pnrFor } from "../lib/ticketMeta";
import { airportMeta } from "../lib/travelMeta";
import { stationCode, stationLabel } from "../lib/trainNetwork";
import { AirlineBadge } from "./flightresults";

const TABS = [
  ["bookings", "My bookings", Ticket],
  ["trains", "Live trains", TrainFront],
  ["flights", "Live flights", Plane],
];
const MALAYSIA = [4.2, 108.5];
const SERVICE_COLORS = {
  "KTM ETS": "#1c3f94",
  "KTM Komuter": "#0d8a8a",
  "Shuttle Timur": "#b5892b",
  "KTM Intercity": "#7b2d8e",
  KTM: "#1d4a3f",
};

/* ---------------------------------------------------------------- helpers */

// Reads a JSON reply, turning "the server sent a web page" (an old backend
// without these routes, or a host that doesn't run the API) into a clear message.
async function getJson(url) {
  let res;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("Can't reach the server. Check your connection, or start the backend if you're running locally.");
  }
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(
      res.status === 404 || /<html|<!doctype/i.test(text)
        ? "The live data service isn't available on this server yet. If you're running locally, restart the backend (node server.js)."
        : "The live data service sent an unexpected reply. Please try again shortly.",
    );
  }
  if (!res.ok) throw new Error(body.message || "Live data is unavailable right now.");
  return body;
}

function useLive(path, intervalMs) {
  const [state, setState] = useState({ data: null, error: "", loading: true });
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const body = await getJson(`${API_BASE}${path}`);
      setState({ data: body, error: "", loading: false });
    } catch (error) {
      setState((s) => ({
        ...s,
        loading: false,
        error: error.message,
      }));
    }
  }, [path]);
  useEffect(() => {
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);
  return { ...state, reload: load };
}

function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

const ago = (ts, now) => {
  if (!ts) return "—";
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  return `${Math.round(s / 60)} min ago`;
};

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 9, { duration: 0.8 });
  }, [map, target]);
  return null;
}

function LiveBar({ live, label, source, refreshEvery }) {
  const now = useNow();
  return (
    <div className="bf26-live-bar">
      <span className={`bf26-live-dot ${live.error ? "is-off" : ""}`}>
        <Radio size={14} /> {live.error ? "Offline" : "Live"}
      </span>
      <span>{label}</span>
      <small>
        Updated {ago(live.data?.fetchedAt, now)} · refreshes every {refreshEvery} · {source}
      </small>
      <button type="button" className="bf26-ghost" onClick={live.reload} disabled={live.loading}>
        <RefreshCw size={14} className={live.loading ? "bf26-spin" : ""} /> {t("Refresh")}
      </button>
    </div>
  );
}

/* ---------------------------------------------------------- my bookings */

const validDates = (item) =>
  item && !Number.isNaN(item.start.getTime()) && !Number.isNaN(item.end.getTime()) ? item : null;

// Skip anything unreadable so one bad saved booking can't break the page.
function normalize(b) {
  try {
    return validDates(toTrackItem(b));
  } catch {
    return null;
  }
}

function toTrackItem(b) {
  if (!b) return null;
  const kind = b.kind || (b.outboundFlight ? "flight" : b.hotelName ? "hotel" : b.trainDetails ? "train" : null);
  if (kind === "flight" && b.outboundFlight) {
    const out = b.outboundFlight;
    const from = airportMeta(out.origin);
    const to = airportMeta(out.destination);
    const end = (b.returnFlight && b.returnFlight.arrival) || out.arrival;
    return {
      kind,
      ref: pnrFor(b.bookingId),
      icon: Plane,
      title: `${from.code} → ${to.code}`,
      subtitle: `${out.airline} ${out.flightNumber}${b.returnFlight?.flightNumber ? " · return trip" : " · one way"}`,
      start: new Date(out.departure),
      end: new Date(end),
      steps: [
        ["Booked", b.paidAt ? new Date(b.paidAt) : null],
        ["Check-in opens", new Date(new Date(out.departure).getTime() - 86400000)],
        ["Departure", new Date(out.departure)],
        ["Trip complete", new Date(end)],
      ],
      amount: b.amount,
      airline: out.airline,
      // The header treats a top-level "email" in route state as a sign-in.
      open: (navigate) => {
        const { email, ...rest } = b;
        navigate("/ticketpage", { state: { ...rest, sentTo: rest.sentTo || email } });
      },
    };
  }
  if (kind === "train") {
    const start = new Date(`${b.startDate}T${String(b.departureTime || "00:00").replace(".", ":")}:00`);
    const end = b.returnDate ? new Date(`${b.returnDate}T23:59:00`) : new Date(`${b.startDate}T${String(b.arrivalTime || "23:59").replace(".", ":")}:00`);
    return {
      kind,
      ref: pnrFor(String(b._id || b.bookingId || b.trainId || "")),
      icon: TrainFront,
      title: `${stationCode(b.origin)} → ${stationCode(b.destination)}`,
      subtitle: `${b.trainDetails || "Train"} · ${stationLabel(b.origin)} to ${stationLabel(b.destination)}`,
      start,
      end,
      steps: [
        ["Booked", b.paidAt ? new Date(b.paidAt) : null],
        ["Platform gate closes", new Date(start.getTime() - 600000)],
        ["Departure", start],
        ["Trip complete", end],
      ],
      amount: b.totalPrice,
      open: (navigate) => navigate("/trainconfirmation", { state: { bookingDetails: b } }),
    };
  }
  if (kind === "hotel") {
    const start = new Date(`${b.checkInDate}T15:00:00`);
    const end = new Date(`${b.checkOutDate}T11:00:00`);
    return {
      kind,
      ref: pnrFor(`${b.hotelName}${b.checkInDate}${(b.userData && b.userData.email) || ""}`),
      icon: BedDouble,
      title: b.hotelName,
      subtitle: `${b.location || ""} · ${b.roomType || "Room"}`,
      start,
      end,
      steps: [
        ["Booked", b.paidAt ? new Date(b.paidAt) : null],
        ["Check-in", start],
        ["Check-out", end],
      ],
      amount: b.totalPrice,
      open: (navigate) => navigate("/hotelpaymentdone", { state: { paymentData: b } }),
    };
  }
  return null;
}

function allDeviceBookings() {
  try {
    const all = JSON.parse(localStorage.getItem("bookingflexBookings:v1")) || {};
    return Object.values(all).flat();
  } catch {
    return [];
  }
}

const countdown = (ms) => {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  if (d > 0) return `${d} day${d === 1 ? "" : "s"} ${h}h`;
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
};

function BookingCard({ item, now }) {
  const navigate = useNavigate();
  const Icon = item.icon;
  const status =
    now > item.end.getTime()
      ? ["Completed", "is-done"]
      : now >= item.start.getTime()
        ? [item.kind === "hotel" ? "Staying now" : "Travelling now", "is-now"]
        : item.kind === "flight" && now >= item.start.getTime() - 86400000
          ? ["Check-in open", "is-soon"]
          : ["Upcoming", "is-up"];
  const reached = item.steps.filter(([, at]) => !at || at.getTime() <= now).length;
  return (
    <article className={`bf26-track-card ${status[1]}`}>
      <header>
        <span className="bf26-track-icon">{item.kind === "flight" ? <AirlineBadge name={item.airline} size={40} /> : <Icon size={20} />}</span>
        <span className="bf26-track-title">
          <strong>{item.title}</strong>
          <small>{item.subtitle}</small>
        </span>
        <span className={`bf26-track-status ${status[1]}`}>{status[0]}</span>
      </header>
      <div className="bf26-track-meta">
        <span>
          <small>{t("Reference")}</small>
          <b className="bf26-mono-lg">{item.ref}</b>
        </span>
        <span>
          <small>{item.kind === "hotel" ? "Check-in" : "Departs"}</small>
          <b>
            {item.start.toLocaleDateString(dateLocale(), { weekday: "short", day: "numeric", month: "short" })} ·{" "}
            {item.start.toLocaleTimeString(dateLocale(), { hour: "2-digit", minute: "2-digit" })}
          </b>
        </span>
        <span>
          <small>{now < item.start.getTime() ? "Starts in" : "Paid"}</small>
          <b>{now < item.start.getTime() ? countdown(item.start.getTime() - now) : formatMoney(item.amount)}</b>
        </span>
      </div>
      <ol className="bf26-track-steps" style={{ "--done": Math.max(0, reached - 1) / Math.max(1, item.steps.length - 1) }}>
        {item.steps.map(([label, at], i) => (
          <li key={label} className={i < reached ? "is-done" : ""}>
            <i>{i < reached ? <CircleCheck size={14} /> : null}</i>
            <span>{label}</span>
            <small>
              {at
                ? `${at.toLocaleDateString(dateLocale(), { day: "numeric", month: "short" })} ${at.toLocaleTimeString(dateLocale(), { hour: "2-digit", minute: "2-digit" })}`
                : ""}
            </small>
          </li>
        ))}
      </ol>
      <button type="button" className="bf26-ghost" onClick={() => item.open(navigate)}>
        <Ticket size={15} /> View {item.kind === "hotel" ? "voucher" : "ticket"} <ArrowRight size={14} />
      </button>
    </article>
  );
}

function BookingsTab() {
  const now = useNow(30000);
  const session = getSession();
  const sessionEmail = session?.email;
  const [query, setQuery] = useState("");
  const [found, setFound] = useState(undefined);
  const mine = useMemo(
    () =>
      (sessionEmail ? getBookingHistory(sessionEmail) : [])
        .map(normalize)
        .filter(Boolean)
        .sort((a, b) => {
          const aDone = now > a.end.getTime();
          const bDone = now > b.end.getTime();
          return aDone - bDone || (aDone ? b.start - a.start : a.start - b.start);
        }),
    [sessionEmail, now],
  );

  function lookup(e) {
    e.preventDefault();
    const ref = query.trim().toUpperCase();
    if (!ref) return;
    setFound(allDeviceBookings().map(normalize).find((b) => b && b.ref === ref) || null);
  }

  return (
    <div className="bf26-track-bookings">
      <form className="bf26-track-lookup" onSubmit={lookup}>
        <label htmlFor="track-ref">{t("Track a booking by reference")}</label>
        <div>
          <Search size={17} />
          <input
            id="track-ref"
            placeholder="e.g. 6HYREV"
            maxLength={8}
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
          />
          <button type="submit" className="bf26-primary">
            {t("Track")}
          </button>
        </div>
        <small>{t("The 6-letter reference is on your ticket, voucher and confirmation email.")}</small>
      </form>
      {found !== undefined &&
        (found ? (
          <BookingCard item={found} now={now} />
        ) : (
          <p className="bf26-auth-alert">No booking with that reference on this device. Check the reference, or sign in with the account you booked with.</p>
        ))}

      <div className="bf26-section-title">
        <h2>{t("Your trips")}</h2>
        <span>{session ? `${mine.length} booking${mine.length === 1 ? "" : "s"}` : ""}</span>
      </div>
      {!session ? (
        <div className="bf26-empty-card">
          <LogIn size={26} />
          <h2>{t("Sign in to see all your bookings")}</h2>
          <p>Flights, trains and hotels you book while signed in appear here with live status.</p>
          <Link to="/signin" state={{ from: "/track" }} className="bf26-primary">
            {t("Sign in")}
          </Link>
        </div>
      ) : mine.length === 0 ? (
        <div className="bf26-empty-card">
          <Ticket size={26} />
          <h2>{t("No bookings yet")}</h2>
          <p>{t("Book a flight, train or hotel and you'll be able to track it here.")}</p>
          <Link to="/" className="bf26-primary">
            {t("Find a trip")}
          </Link>
        </div>
      ) : (
        <div className="bf26-track-list">
          {mine.map((item) => (
            <BookingCard key={`${item.kind}-${item.ref}`} item={item} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ live trains */

function TrainsTab() {
  const live = useLive("/live/trains", 30000);
  const [focus, setFocus] = useState(null);
  const trains = live.data?.trains || [];
  const services = [...new Set(trains.map((train) => train.service))];
  return (
    <div className="bf26-track-live">
      <LiveBar live={live} label={`${trains.length} KTM trains running now`} source="data.gov.my" refreshEvery="30s" />
      {live.error && <p className="bf26-auth-alert">{live.error}</p>}
      <div className="bf26-track-grid">
        <div className="bf26-map-card bf26-track-map">
          <div className="bf26-map">
            <MapContainer center={[4.0, 101.6]} zoom={6} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              <FlyTo target={focus} />
              {trains.map((train) => (
                <CircleMarker
                  key={train.id}
                  center={[train.lat, train.lng]}
                  radius={8}
                  pathOptions={{ color: "#fff", weight: 2.5, fillColor: SERVICE_COLORS[train.service] || "#1d4a3f", fillOpacity: 1 }}
                >
                  <Tooltip>
                    <strong>{train.label}</strong> · {train.service}
                    <br />
                    {train.speedKmh != null ? `${train.speedKmh} km/h` : "Speed unknown"}
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
          <div className="bf26-track-legend">
            {services.map((s) => (
              <span key={s}>
                <i style={{ background: SERVICE_COLORS[s] || "#1d4a3f" }} /> {s}
              </span>
            ))}
          </div>
        </div>
        <ul className="bf26-track-feed">
          {live.loading && !trains.length && (
            <li className="bf26-track-empty">
              <Loader2 size={18} className="bf26-spin" /> {t("Loading live trains…")}
            </li>
          )}
          {!live.loading && !trains.length && !live.error && (
            <li className="bf26-track-empty">No trains are reporting right now (late at night, for example).</li>
          )}
          {trains.map((train) => (
            <li key={train.id}>
              <button type="button" onClick={() => setFocus([train.lat, train.lng])}>
                <span className="bf26-rail-badge" style={{ "--line": SERVICE_COLORS[train.service] || "#1d4a3f", width: 38, height: 38 }}>
                  <TrainFront size={17} />
                </span>
                <span>
                  <strong>{train.label}</strong>
                  <small>
                    {train.service} · {train.description}
                  </small>
                </span>
                <span className="bf26-track-num">
                  <Gauge size={13} /> {train.speedKmh ?? "—"} km/h
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <p className="bf26-note">
        Positions come from KTM Berhad's real-time feed published on data.gov.my. Trains appear when their onboard
        tracker is reporting.
      </p>
    </div>
  );
}

/* ----------------------------------------------------------- live flights */

const planeIcon = (heading, highlight) =>
  L.divIcon({
    className: "bf26-plane-pin",
    html: `<span style="transform: rotate(${heading}deg)" class="${highlight ? "is-hl" : ""}"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/></svg></span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const hhmm = (iso) => (iso ? new Date(iso).toLocaleTimeString(dateLocale(), { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC" : "—");

function FlightStatusCard({ r }) {
  return (
    <article className="bf26-track-card">
      <header>
        <span className="bf26-track-icon">
          <AirlineBadge name={r.airline || ""} size={40} />
        </span>
        <span className="bf26-track-title">
          <strong>
            {r.flight} · {r.departure.iata} → {r.arrival.iata}
          </strong>
          <small>
            {r.airline} · {r.date}
          </small>
        </span>
        <span className={`bf26-track-status is-${r.rawStatus}`}>{r.status}</span>
      </header>
      <div className="bf26-fs-legs">
        {[
          ["Departure", r.departure],
          ["Arrival", r.arrival],
        ].map(([label, leg]) => (
          <div key={label}>
            <small>{label}</small>
            <strong>{leg.iata}</strong>
            <span>{leg.airport}</span>
            <dl>
              <dt>{t("Scheduled")}</dt>
              <dd>{hhmm(leg.scheduled)}</dd>
              <dt>{leg.actual ? "Actual" : "Estimated"}</dt>
              <dd>{hhmm(leg.actual || leg.estimated)}</dd>
              <dt>Terminal / gate</dt>
              <dd>
                {leg.terminal || "—"} / {leg.gate || "—"}
              </dd>
              {leg.baggage && (
                <>
                  <dt>Baggage belt</dt>
                  <dd>{leg.baggage}</dd>
                </>
              )}
            </dl>
            {leg.delay ? <em className="bf26-fs-delay">Delayed {leg.delay} min</em> : null}
          </div>
        ))}
      </div>
    </article>
  );
}

function FlightsTab() {
  const live = useLive("/live/flights", 120000);
  const [focus, setFocus] = useState(null);
  const [number, setNumber] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", data: null });
  const flights = live.data?.flights || [];
  const query = number.replace(/\s+/g, "").toUpperCase();

  async function check(e) {
    e.preventDefault();
    if (!query) return;
    setStatus({ loading: true, error: "", data: null });
    try {
      const body = await getJson(`${API_BASE}/live/flight-status?flight=${encodeURIComponent(query)}`);
      setStatus({ loading: false, error: "", data: body });
      const onMap = flights.find((f) => f.callsign && f.callsign.endsWith(query.replace(/^\D+/, "")) && f.callsign.length > 3);
      if (body.results[0]?.live) setFocus([body.results[0].live.lat, body.results[0].live.lng]);
      else if (onMap) setFocus([onMap.lat, onMap.lng]);
    } catch (error) {
      setStatus({ loading: false, error: error.message || "Flight status is unavailable.", data: null });
    }
  }

  return (
    <div className="bf26-track-live">
      <form className="bf26-track-lookup" onSubmit={check}>
        <label htmlFor="track-flight">{t("Flight status by number")}</label>
        <div>
          <Plane size={17} />
          <input id="track-flight" placeholder="e.g. MH1 or AK6100" value={number} onChange={(e) => setNumber(e.target.value.toUpperCase())} maxLength={8} />
          <button type="submit" className="bf26-primary" disabled={status.loading}>
            {status.loading ? <Loader2 size={16} className="bf26-spin" /> : "Check"}
          </button>
        </div>
        <small>Real schedule, gate and delay information from AviationStack.</small>
      </form>
      {status.error && <p className="bf26-auth-alert">{status.error}</p>}
      {status.data && status.data.results.length === 0 && (
        <p className="bf26-auth-alert">No flight {status.data.flight} found for today. Check the number and try again.</p>
      )}
      {status.data &&
        (status.data.results.some((r) => r.flight === status.data.flight)
          ? status.data.results.filter((r) => r.flight === status.data.flight)
          : status.data.results
        )
          .slice(0, 3)
          .map((r, i) => <FlightStatusCard key={`${r.flight}-${r.date}-${i}`} r={r} />)}

      <LiveBar live={live} label={`${flights.length} aircraft over Malaysia`} source={live.data?.source || "OpenSky Network"} refreshEvery="2 min" />
      {live.error && <p className="bf26-auth-alert">{live.error}</p>}
      <div className="bf26-track-grid">
        <div className="bf26-map-card bf26-track-map">
          <div className="bf26-map">
            <MapContainer center={MALAYSIA} zoom={5} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              <FlyTo target={focus} />
              {flights.map((f) => (
                <Marker key={f.icao24} position={[f.lat, f.lng]} icon={planeIcon(f.heading, query && f.callsign.includes(query.replace(/^\D+/, "")))}>
                  <Tooltip>
                    <strong>{f.callsign || f.icao24}</strong> · {f.country}
                    <br />
                    {f.altitudeM != null ? `${f.altitudeM.toLocaleString()} m` : ""} {f.speedKmh != null ? `· ${f.speedKmh} km/h` : ""}
                  </Tooltip>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
        <ul className="bf26-track-feed">
          {live.loading && !flights.length && (
            <li className="bf26-track-empty">
              <Loader2 size={18} className="bf26-spin" /> {t("Loading live flights…")}
            </li>
          )}
          {flights
            .slice()
            .sort((a, b) => (b.altitudeM || 0) - (a.altitudeM || 0))
            .slice(0, 60)
            .map((f) => (
              <li key={f.icao24}>
                <button type="button" onClick={() => setFocus([f.lat, f.lng])}>
                  <span className="bf26-plane-chip" style={{ transform: `rotate(${f.heading}deg)` }}>
                    <Plane size={16} />
                  </span>
                  <span>
                    <strong>{f.callsign || f.icao24.toUpperCase()}</strong>
                    <small>
                      <MapPin size={11} /> {f.country}
                    </small>
                  </span>
                  <span className="bf26-track-num">
                    <Mountain size={13} /> {f.altitudeM != null ? `${(f.altitudeM / 1000).toFixed(1)} km` : "—"}
                    <br />
                    <Clock size={13} /> {f.speedKmh ?? "—"} km/h
                  </span>
                </button>
              </li>
            ))}
        </ul>
      </div>
      <p className="bf26-note">Aircraft positions from {live.data?.source || "the OpenSky Network"} (free, updated every couple of minutes).</p>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

export default function TrackPage({ defaultTab = "bookings" }) {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([id]) => id === params.get("tab")) ? params.get("tab") : defaultTab;
  return (
    <section className="bf26-results bf26-track">
      <header className="bf26-route bf26-track-hero">
        <div className="bf26-route-main">
          <span className="bf26-kicker">
            <Radio size={14} /> {t("Live tracking")}
          </span>
          <h1 className="bf26-hotel-city">{t("Track your trip")}</h1>
          <p className="bf26-track-sub">{t("Your bookings, KTM trains and flights over Malaysia, as they happen.")}</p>
        </div>
      </header>
      <nav className="bf26-stay-tabs bf26-track-tabs" aria-label="Tracker">
        {TABS.map(([id, label, Icon]) => (
          <button key={id} type="button" className={tab === id ? "is-active" : ""} onClick={() => setParams({ tab: id }, { replace: true })}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </nav>
      {tab === "bookings" && <BookingsTab />}
      {tab === "trains" && <TrainsTab />}
      {tab === "flights" && <FlightsTab />}
    </section>
  );
}
