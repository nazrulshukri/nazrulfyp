import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  BedDouble,
  CalendarRange,
  CircleDollarSign,
  Lock,
  Plane,
  ReceiptText,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserPlus,
  TrainFront,
  Users,
  XCircle,
} from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { formatPrice } from "../lib/currency";
import { authHeaders, useAdminRole } from "../lib/adminAccess";
import AdminDatabase from "./AdminDatabase";
import AdminPrices from "./AdminPrices";
import AdminStructure from "./AdminStructure";
import AdminArchitecture from "./AdminArchitecture";
import AdminNews from "./AdminNews";
import "./AdminDashboard.css";

const RANGES = [
  [7, "7 days"],
  [30, "30 days"],
  [90, "90 days"],
  [365, "1 year"],
];
const KINDS = {
  flight: { label: "Flights", icon: Plane },
  hotel: { label: "Hotels", icon: BedDouble },
  train: { label: "Trains", icon: TrainFront },
};

function useSummary(days) {
  const [state, setState] = useState({ loading: true, error: null, status: 0, data: null });
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    let token = null;
    try {
      token = localStorage.getItem("token");
    } catch {
      /* ignore */
    }
    if (!token) return setState({ loading: false, error: "signin", status: 401, data: null });
    try {
      const res = await fetch(`${API_BASE}/admin/summary?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return setState({ loading: false, error: body.message || "Could not load the dashboard.", status: res.status, data: null });
      setState({ loading: false, error: null, status: 200, data: body });
    } catch {
      setState({ loading: false, error: "Can't reach the server. Is the backend running?", status: 0, data: null });
    }
  }, [days]);
  useEffect(() => {
    load();
  }, [load]);
  return [state, load];
}

const shortDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/* Revenue over time: one series, so the title names it and there's no legend. */
function RevenueChart({ daily }) {
  const [hover, setHover] = useState(null);
  const [W, setW] = useState(720);
  const wrap = useRef(null);
  const H = 240;
  // Draw at the real width so labels stay 11px instead of scaling with the page.
  useEffect(() => {
    const el = wrap.current;
    if (!el || !("ResizeObserver" in window)) return undefined;
    const ro = new ResizeObserver(([entry]) => setW(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pad = { l: 56, r: 16, t: 16, b: 28 };
  // At least RM 100 on the axis so an empty chart still has sensible labels.
  const max = Math.max(100, ...daily.map((d) => d.revenue));
  const nice = (() => {
    const step = 10 ** Math.floor(Math.log10(max));
    return Math.ceil(max / step) * step;
  })();
  const x = (i) => pad.l + (i * (W - pad.l - pad.r)) / Math.max(1, daily.length - 1);
  const y = (v) => pad.t + (1 - v / nice) * (H - pad.t - pad.b);
  const line = daily.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.revenue).toFixed(1)}`).join("");
  const area = `${line}L${x(daily.length - 1)},${y(0)}L${x(0)},${y(0)}Z`;
  const ticks = [0, 0.5, 1].map((t) => t * nice);
  const every = Math.ceil(daily.length / Math.max(3, Math.floor(W / 110)));

  function onMove(e) {
    const rect = wrap.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (daily.length - 1));
    setHover(Math.max(0, Math.min(daily.length - 1, i)));
  }

  const h = hover != null ? daily[hover] : null;
  return (
    <div className="ad-chart" ref={wrap} onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label="Revenue per day">
        {ticks.map((t) => (
          <g key={t}>
            <line className="ad-grid" x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} />
            <text className="ad-axis" x={pad.l - 8} y={y(t) + 4} textAnchor="end">
              {formatPrice(t, { whole: true })}
            </text>
          </g>
        ))}
        {daily.map((d, i) =>
          (i % every === 0 && x(daily.length - 1) - x(i) >= 84) || i === daily.length - 1 ? (
            <text
              key={d.date}
              className="ad-axis"
              x={x(i)}
              y={H - 8}
              textAnchor={i === 0 ? "start" : i === daily.length - 1 ? "end" : "middle"}
            >
              {shortDate(d.date)}
            </text>
          ) : null,
        )}
        <path className="ad-area" d={area} />
        <path className="ad-line" d={line} />
        {h && (
          <g>
            <line className="ad-cross" x1={x(hover)} x2={x(hover)} y1={pad.t} y2={y(0)} />
            <circle className="ad-dot" cx={x(hover)} cy={y(h.revenue)} r="5" />
          </g>
        )}
      </svg>
      {h && (
        <div className="ad-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <small>{shortDate(h.date)}</small>
          <strong>{formatPrice(h.revenue)}</strong>
          <span>
            {h.orders} booking{h.orders === 1 ? "" : "s"}
          </span>
        </div>
      )}
    </div>
  );
}

/* Horizontal bars with the value written beside each bar. */
function Bars({ rows, value, label, colorFor, format }) {
  const max = Math.max(1, ...rows.map(value));
  return (
    <ul className="ad-bars">
      {rows.map((r) => (
        <li key={label(r)} title={`${label(r)}: ${format(r)}`}>
          <span className="ad-bar-name">{label(r)}</span>
          <span className="ad-bar-track">
            <span
              className="ad-bar-fill"
              style={{ width: `${Math.max(2, (value(r) / max) * 100)}%`, background: colorFor ? colorFor(r) : undefined }}
            />
          </span>
          <span className="ad-bar-value">{format(r)}</span>
        </li>
      ))}
    </ul>
  );
}

function Gate({ icon: Icon, title, children }) {
  return (
    <div className="ad-gate">
      <span>
        <Icon size={26} />
      </span>
      <h1>{title}</h1>
      {children}
    </div>
  );
}

/* Super admins add and remove admins here. */
function TeamAccess() {
  const [rows, setRows] = useState(null);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/admins`, { headers: authHeaders() });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Could not load admins.");
      setRows(body.admins);
    } catch (error) {
      setMsg({ error: true, text: error.message });
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  async function change(method, path, body) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_BASE}/admin/admins${path}`, {
        method,
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "That didn't work.");
      setMsg({ text: method === "POST" ? `${body.email} can now open the dashboard.` : `${decodeURIComponent(path.slice(1))} no longer has access.` });
      if (method === "POST") setEmail("");
      await load();
    } catch (error) {
      setMsg({ error: true, text: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="ad-card ad-card-wide ad-team">
      <div className="ad-card-head">
        <h2>Team access</h2>
        <small>Only super admins see this</small>
      </div>
      <form
        className="ad-team-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (email.trim()) change("POST", "", { email: email.trim() });
        }}
      >
        <input
          type="email"
          placeholder="Add an admin by email"
          aria-label="Admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="ad-btn" disabled={busy}>
          <UserPlus size={16} /> Add admin
        </button>
      </form>
      {msg && <p className={msg.error ? "ad-error" : "ad-note"}>{msg.text}</p>}
      <ul className="ad-team-list">
        {(rows || []).map((a) => (
          <li key={a.email}>
            <span className={`ad-role is-${a.role}`}>
              <ShieldCheck size={14} /> {a.role === "super" ? "Super admin" : "Admin"}
            </span>
            <span className="ad-team-email">{a.email}</span>
            <small className="ad-muted">
              {a.source === "settings" ? "Set in server settings" : `Added by ${a.addedBy || "a super admin"}`}
            </small>
            {a.source === "dashboard" ? (
              <button
                type="button"
                className="ad-icon-btn"
                aria-label={`Remove ${a.email}`}
                disabled={busy}
                onClick={() => change("DELETE", `/${encodeURIComponent(a.email)}`)}
              >
                <Trash2 size={16} />
              </button>
            ) : (
              <span />
            )}
          </li>
        ))}
        {rows && !rows.length && <li className="ad-muted">No admins yet.</li>}
      </ul>
    </section>
  );
}

export default function AdminDashboard() {
  const [days, setDays] = useState(30);
  const [{ loading, error, status, data }, reload] = useSummary(days);
  const role = useAdminRole("dashboard");
  const [tab, setTab] = useState("overview");
  const email = useMemo(() => {
    try {
      return localStorage.getItem("userEmail");
    } catch {
      return null;
    }
  }, []);

  if (!loading && error === "signin") {
    return (
      <div className="ad-root">
        <Gate icon={Lock} title="Admin dashboard">
          <p>Sign in with an admin account to see bookings, revenue and users.</p>
          <Link className="ad-btn" to="/signin">
            Sign in
          </Link>
        </Gate>
      </div>
    );
  }
  if (!loading && (status === 401 || status === 403 || status === 503)) {
    return (
      <div className="ad-root">
        <Gate icon={ShieldAlert} title={status === 403 ? "Admins only" : "Admin dashboard"}>
          <p>{error}</p>
          {status === 403 && email && (
            <p className="ad-muted">
              You're signed in as <b>{email}</b>. To make it the owner account, add it to <code>SUPER_ADMIN_EMAILS</code> in the server
              settings (Vercel → Settings → Environment Variables) and redeploy. A super admin can also add you from Admin → Team access.
            </p>
          )}
          {status === 401 && (
            <Link className="ad-btn" to="/signin">
              Sign in again
            </Link>
          )}
        </Gate>
      </div>
    );
  }

  const t = data?.totals;
  const empty = data && t.orders === 0 && t.cancelled === 0;

  return (
    <div className="ad-root">
      <header className="ad-head">
        <div>
          <span className="ad-kicker">{role === "super" ? "Super admin" : "Admin"}</span>
          <h1>Dashboard</h1>
          <p className="ad-muted">Bookings, revenue and users from the live database.</p>
        </div>
        <div className="ad-filters" role="group" aria-label="Time range">
          <CalendarRange size={16} aria-hidden="true" />
          {RANGES.map(([r, label]) => (
            <button key={r} type="button" aria-pressed={days === r} className={days === r ? "is-on" : ""} onClick={() => setDays(r)}>
              {label}
            </button>
          ))}
          <button type="button" className="ad-refresh" onClick={reload} aria-label="Refresh">
            <RefreshCw size={15} className={loading ? "is-spinning" : ""} />
          </button>
        </div>
      </header>

      {role && (
        <div className="ad-tabs" role="tablist" aria-label="Admin sections">
          {[
            ["overview", "Overview"],
            ["news", "News"],
            ...(role === "super"
              ? [
                  ["prices", "Prices"],
                  ["database", "Tables"],
                  ["structure", "Structure"],
                  ["architecture", "Architecture"],
                ]
              : []),
          ].map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "is-on" : ""} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </div>
      )}

      {tab === "news" && role ? (
        <AdminNews />
      ) : tab !== "overview" && role === "super" ? (
        tab === "prices" ? (
          <AdminPrices />
        ) : tab === "structure" ? (
          <AdminStructure />
        ) : tab === "architecture" ? (
          <AdminArchitecture />
        ) : (
          <AdminDatabase />
        )
      ) : (
      <>
      {error && status !== 200 && <p className="ad-error">{error}</p>}

      <section className="ad-tiles" aria-label="Totals">
        {[
          { icon: CircleDollarSign, label: "Revenue", value: t ? formatPrice(t.revenue, { whole: true }) : "—", note: `last ${days} days` },
          { icon: ReceiptText, label: "Bookings", value: t ? t.orders.toLocaleString() : "—", note: t ? `avg ${formatPrice(t.averageOrder, { whole: true })}` : "" },
          { icon: Users, label: "Users", value: t ? t.users.toLocaleString() : "—", note: t ? `+${t.newUsers} new` : "" },
          { icon: XCircle, label: "Cancelled", value: t ? t.cancelled.toLocaleString() : "—", note: t ? `${formatPrice(t.refunds, { whole: true })} refunded` : "" },
        ].map(({ icon: Icon, label, value, note }) => (
          <div className="ad-tile" key={label}>
            <span className="ad-tile-icon">
              <Icon size={18} />
            </span>
            <small>{label}</small>
            <strong>{loading && !t ? <i className="ad-skeleton" /> : value}</strong>
            <em>{note}</em>
          </div>
        ))}
      </section>

      {empty && (
        <div className="ad-empty">
          <ReceiptText size={22} />
          <div>
            <strong>No bookings in the last {days} days yet</strong>
            <p>Each flight, hotel or train booking appears here as soon as its payment finishes.</p>
          </div>
        </div>
      )}

      {data && (
        <>
          <section className="ad-card ad-card-wide">
            <div className="ad-card-head">
              <h2>Revenue per day</h2>
              <small>{formatPrice(t.revenue)} total</small>
            </div>
            <RevenueChart daily={data.daily} />
          </section>

          <div className="ad-grid-3">
            <section className="ad-card">
              <div className="ad-card-head">
                <h2>Bookings by type</h2>
              </div>
              <Bars
                rows={data.byKind}
                value={(r) => r.orders}
                label={(r) => KINDS[r.kind].label}
                colorFor={(r) => `var(--ad-${r.kind})`}
                format={(r) => `${r.orders} · ${formatPrice(r.revenue, { whole: true })}`}
              />
            </section>
            <section className="ad-card">
              <div className="ad-card-head">
                <h2>Top routes & stays</h2>
              </div>
              {data.topRoutes.length ? (
                <Bars rows={data.topRoutes} value={(r) => r.revenue} label={(r) => r.name} format={(r) => formatPrice(r.revenue, { whole: true })} />
              ) : (
                <p className="ad-muted">No bookings yet.</p>
              )}
            </section>
            <section className="ad-card">
              <div className="ad-card-head">
                <h2>Payment methods</h2>
              </div>
              {data.paymentMethods.length ? (
                <Bars rows={data.paymentMethods} value={(r) => r.orders} label={(r) => r.name} format={(r) => `${r.orders}`} />
              ) : (
                <p className="ad-muted">No payments yet.</p>
              )}
            </section>
          </div>

          <section className="ad-card ad-card-wide">
            <div className="ad-card-head">
              <h2>Recent bookings</h2>
            </div>
            {data.recent.length ? (
              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Type</th>
                      <th>Booking</th>
                      <th>Customer</th>
                      <th className="ad-num">Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((o) => {
                      const K = KINDS[o.kind];
                      return (
                        <tr key={o.reference}>
                          <td className="ad-mono">
                            {o.reference}
                            {o.legacy && <span className="ad-tag">older flow</span>}
                          </td>
                          <td>
                            <span className="ad-kind">
                              <i style={{ background: `var(--ad-${o.kind})` }} />
                              <K.icon size={14} /> {K.label.slice(0, -1)}
                            </span>
                          </td>
                          <td>{o.title}</td>
                          <td className="ad-muted">{o.email || "Guest"}</td>
                          <td className="ad-num">{formatPrice(o.amountMyr)}</td>
                          <td>
                            <span className={`ad-status is-${o.status}`}>{o.status}</span>
                          </td>
                          <td className="ad-muted">{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="ad-muted">Bookings will appear here.</p>
            )}
          </section>
        </>
      )}

      {role === "super" && status === 200 && <TeamAccess />}
      </>
      )}
    </div>
  );
}
