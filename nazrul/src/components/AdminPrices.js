import React, { useEffect, useMemo, useRef, useState } from "react";
import { BedDouble, Plane, TrainFront } from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { authHeaders } from "../lib/adminAccess";
import { formatPrice } from "../lib/currency";
import { airportByCode, fitFlightsToRoute } from "../lib/airports";
import { generateMockFlights } from "../mockdata/flights";
import { generateMockHotels } from "../mockdata/Hotel";
import { planJourneys } from "../lib/trainNetwork";

const KIND = {
  flight: { label: "Flights", icon: Plane },
  train: { label: "Trains", icon: TrainFront },
  hotel: { label: "Hotels", icon: BedDouble },
};
const FLIGHT_ROUTES = ["SIN", "BKK", "DPS", "BKI", "HND", "ICN", "DXB", "LHR", "CDG", "SYD", "JFK"];
const TRAIN_ROUTES = [
  ["KL Sentral", "KLIA"],
  ["KL Sentral", "Ipoh"],
  ["KL Sentral", "Butterworth"],
  ["KL Sentral", "Padang Besar"],
];

const isoDay = (offset) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};
const money = (v) => formatPrice(v, { whole: true });
const hm = (min) => `${Math.floor(min / 60)}h ${String(Math.round(min % 60)).padStart(2, "0")}m`;

/** What BookingFlex quotes today, from the same engines the booking pages use. */
function useQuotes() {
  return useMemo(() => {
    const kul = airportByCode("KUL");
    const date = isoDay(14);
    const flights = FLIGHT_ROUTES.map((code) => {
      const to = airportByCode(code);
      const list = fitFlightsToRoute(generateMockFlights(date, "", kul.value, to.value), kul.value, to.value);
      const prices = list.map((f) => f.price);
      const mins = list.map((f) => (new Date(`${f.arrival}Z`) - new Date(`${f.departure}Z`)) / 60000);
      return {
        item: `KUL → ${code}`,
        sub: to.city,
        min: Math.min(...prices),
        max: Math.max(...prices),
        note: `${list.length} flights · from ${hm(Math.min(...mins))}`,
      };
    });
    const trains = TRAIN_ROUTES.map(([from, to]) => {
      const { journeys } = planJourneys(from, to);
      const fares = (journeys || []).map((j) => Number(j.fare)).filter((n) => Number.isFinite(n) && n > 0);
      return fares.length
        ? { item: `${from} → ${to}`, sub: "KTM / ERL", min: Math.min(...fares), max: Math.max(...fares), note: `${fares.length} departures` }
        : null;
    }).filter(Boolean);
    const hotels = generateMockHotels(isoDay(14), isoDay(15), "London", 1).map((h) => ({
      item: h.hotelName,
      sub: `${h.starRating}★ · ${h.roomType}`,
      min: h.pricePerNight,
      max: h.oldPrice,
      note: "per night · usual price shown as the top of the range",
    }));
    return { date, flight: flights, train: trains, hotel: hotels };
  }, []);
}

/** Range bars: lowest to highest price for each row, on one shared scale. */
function RangeRows({ rows }) {
  const max = Math.max(1, ...rows.map((r) => r.max));
  return (
    <ul className="ad-range">
      {rows.map((r) => (
        <li key={r.item} title={`${r.item}: ${money(r.min)} – ${money(r.max)}`}>
          <span className="ad-range-name">
            {r.item}
            <small>{r.sub}</small>
          </span>
          <span className="ad-range-track">
            <span className="ad-range-bar" style={{ left: `${(r.min / max) * 100}%`, width: `${Math.max(1.5, ((r.max - r.min) / max) * 100)}%` }} />
          </span>
          <span className="ad-range-val">
            {money(r.min)}
            {r.max > r.min && <small> – {money(r.max)}</small>}
          </span>
          <span className="ad-range-note ad-muted">{r.note}</span>
        </li>
      ))}
    </ul>
  );
}

/** Every price paid over time; one dot per payment, coloured by type. */
function History({ points }) {
  const [hover, setHover] = useState(null);
  const [W, setW] = useState(720);
  const wrap = useRef(null);
  useEffect(() => {
    const el = wrap.current;
    if (!el || !("ResizeObserver" in window)) return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  if (!points.length) return <p className="ad-muted">No prices recorded yet.</p>;
  const H = 220;
  const pad = { l: 64, r: 16, t: 12, b: 26 };
  const times = points.map((p) => new Date(p.at).getTime());
  const t0 = Math.min(...times);
  const t1 = Math.max(...times, t0 + 86400000);
  const top = Math.max(100, ...points.map((p) => p.price));
  const x = (t) => pad.l + ((t - t0) / (t1 - t0)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - v / top) * (H - pad.t - pad.b);
  const fmt = (t) => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const h = hover != null ? points[hover] : null;
  return (
    <div className="ad-chart" ref={wrap} onMouseLeave={() => setHover(null)}>
      <div className="ad-legend">
        {Object.entries(KIND).map(([k, v]) => (
          <span key={k}>
            <i style={{ background: `var(--ad-${k})` }} /> {v.label}
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Prices paid over time">
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line className="ad-grid" x1={pad.l} x2={W - pad.r} y1={y(f * top)} y2={y(f * top)} />
            <text className="ad-axis" x={pad.l - 8} y={y(f * top) + 4} textAnchor="end">
              {money(f * top)}
            </text>
          </g>
        ))}
        <text className="ad-axis" x={pad.l} y={H - 6}>
          {fmt(t0)}
        </text>
        <text className="ad-axis" x={W - pad.r} y={H - 6} textAnchor="end">
          {fmt(t1)}
        </text>
        {points.map((p, i) => (
          <circle
            key={i}
            className={`ad-pt ${hover === i ? "is-hot" : ""}`}
            cx={x(new Date(p.at).getTime())}
            cy={y(p.price)}
            r={hover === i ? 7 : 5}
            style={{ fill: `var(--ad-${p.kind})` }}
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>
      {h && (
        <div className="ad-tip" style={{ left: `${(x(new Date(h.at).getTime()) / W) * 100}%` }}>
          <small>
            {KIND[h.kind].label.slice(0, -1)} · {fmt(new Date(h.at).getTime())}
          </small>
          <strong>{formatPrice(h.price)}</strong>
          <span>{h.item}</span>
        </div>
      )}
    </div>
  );
}

export default function AdminPrices() {
  const [paid, setPaid] = useState(null);
  const [error, setError] = useState(null);
  const [kind, setKind] = useState("flight");
  const quotes = useQuotes();

  useEffect(() => {
    fetch(`${API_BASE}/admin/db/prices`, { headers: authHeaders() })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(body.message || "Could not load prices.");
        setPaid(body);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="ad-prices">
      <section className="ad-card">
        <div className="ad-card-head">
          <h2>Prices BookingFlex quotes today</h2>
          <small>For travel on {new Date(`${quotes.date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · sample fares</small>
        </div>
        <div className="ad-tabs ad-tabs-sm" role="tablist" aria-label="Price type">
          {Object.entries(KIND).map(([k, v]) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} className={kind === k ? "is-on" : ""} onClick={() => setKind(k)}>
              <v.icon size={14} /> {v.label}
            </button>
          ))}
        </div>
        <RangeRows rows={quotes[kind]} />
      </section>

      <section className="ad-card ad-card-wide">
        <div className="ad-card-head">
          <h2>Prices people paid, over time</h2>
          <small>From bookings, payments and picks in the database</small>
        </div>
        {error && <p className="ad-error">{error}</p>}
        {!paid && !error && <p className="ad-muted">Loading…</p>}
        {paid && <History points={paid.history} />}
      </section>

      {paid && paid.items.length > 0 && (
        <section className="ad-card ad-card-wide">
          <div className="ad-card-head">
            <h2>Paid prices by route and stay</h2>
          </div>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Route / stay</th>
                  <th className="ad-num">Times</th>
                  <th className="ad-num">Lowest</th>
                  <th className="ad-num">Average</th>
                  <th className="ad-num">Highest</th>
                  <th className="ad-num">Last paid</th>
                  <th>From</th>
                </tr>
              </thead>
              <tbody>
                {paid.items.map((r) => {
                  const K = KIND[r.kind];
                  return (
                    <tr key={`${r.kind}|${r.item}`}>
                      <td>
                        <span className="ad-kind">
                          <i style={{ background: `var(--ad-${r.kind})` }} />
                          <K.icon size={14} /> {K.label.slice(0, -1)}
                        </span>
                      </td>
                      <td>{r.item}</td>
                      <td className="ad-num">{r.count}</td>
                      <td className="ad-num">{money(r.min)}</td>
                      <td className="ad-num">{money(r.avg)}</td>
                      <td className="ad-num">{money(r.max)}</td>
                      <td className="ad-num">
                        {money(r.lastPrice)}
                        <small className="ad-muted"> · {new Date(r.last).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</small>
                      </td>
                      <td className="ad-muted">{r.sources.join(", ")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
