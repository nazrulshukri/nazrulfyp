import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgePercent,
  BarChart3,
  CalendarDays,
  Eye,
  Plane,
  Plus,
  Save,
  ShieldCheck,
  Ticket,
  Trash2,
  Users,
} from "lucide-react";
import {
  canAccessAdmin,
  canAccessSuperAdmin,
  deleteVoucher,
  formatFlightDate,
  formatMoney,
  getAllBookingHistory,
  getCurrentUserEmail,
  getCurrentUserRole,
  getRoleLabel,
  getVouchers,
  saveVoucher,
  updateVoucherStatus,
} from "../lib/bookingStorage";
import "./dashboard.css";

const emptyVoucher = {
  code: "",
  title: "",
  discountType: "percent",
  discountValue: 10,
  maxDiscount: 150,
  audience: "All travellers",
  expiresAt: "2026-12-31",
  status: "active",
};

const AccessNotice = ({ title, message, icon: Icon = ShieldCheck }) => (
  <div className="account-page auth-required">
    <div className="empty-state">
      <Icon size={38} />
      <h2>{title}</h2>
      <p>{message}</p>
      <Link className="account-button primary" to="/signin">
        Go to login
      </Link>
    </div>
  </div>
);

const sortBookings = (bookings) =>
  bookings
    .slice()
    .sort(
      (a, b) =>
        new Date(b.paidAt || b.savedAt || 0).getTime() -
        new Date(a.paidAt || a.savedAt || 0).getTime()
    );

const AdminConsole = () => {
  const email = getCurrentUserEmail();
  const role = getCurrentUserRole();
  const [vouchers, setVouchers] = useState(() => getVouchers());
  const [voucherDraft, setVoucherDraft] = useState(emptyVoucher);
  const [savedMessage, setSavedMessage] = useState("");

  const bookings = useMemo(() => sortBookings(getAllBookingHistory()), []);
  const activeVouchers = vouchers.filter((voucher) => voucher.status === "active");
  const totalRevenue = bookings.reduce((sum, booking) => sum + (Number(booking.amount) || 0), 0);
  const travellers = new Set(bookings.map((booking) => booking.email).filter(Boolean)).size;

  if (!email) {
    return (
      <AccessNotice
        title="Admin login required"
        message="Sign in with an admin or super admin account to monitor bookings and maintain vouchers."
      />
    );
  }

  if (!canAccessAdmin(role)) {
    return (
      <AccessNotice
        title="Admin access only"
        message="Your current account is a traveller account. Admin tools are only available to admin and super admin users."
        icon={Eye}
      />
    );
  }

  const updateDraft = (field, value) => {
    setSavedMessage("");
    setVoucherDraft((current) => ({ ...current, [field]: value }));
  };

  const handleVoucherSubmit = (event) => {
    event.preventDefault();
    const savedVoucher = saveVoucher(voucherDraft);
    setVouchers(getVouchers());
    setVoucherDraft(emptyVoucher);
    setSavedMessage(`${savedVoucher.code} voucher saved and ready for checkout.`);
  };

  const handleStatusChange = (id, status) => {
    setVouchers(updateVoucherStatus(id, status));
  };

  const handleDelete = (id) => {
    setVouchers(deleteVoucher(id));
  };

  return (
    <div className="account-page admin-page">
      <div className="account-shell">
        <div className="account-topbar admin-hero">
          <div>
            <p className="account-kicker">
              <ShieldCheck size={16} /> {getRoleLabel(role)} control room
            </p>
            <h1 className="account-title">Admin Operations</h1>
            <p className="account-subtitle">
              Monitor user bookings, review payment value, and key in voucher discounts that travellers can apply during checkout.
            </p>
          </div>
          <div className="account-actions">
            <Link className="account-button" to="/dashboard">
              <Plane size={17} /> Traveller View
            </Link>
            {canAccessSuperAdmin(role) && (
              <Link className="account-button primary" to="/super-admin">
                <Plus size={17} /> Super Admin
              </Link>
            )}
          </div>
        </div>

        <section className="dashboard-grid">
          <div className="metric-card glass-stat">
            <div className="metric-head">
              Bookings <Ticket size={18} />
            </div>
            <div className="metric-value">{bookings.length}</div>
            <p className="metric-note">paid records saved locally</p>
          </div>
          <div className="metric-card glass-stat">
            <div className="metric-head">
              Revenue <BarChart3 size={18} />
            </div>
            <div className="metric-value" style={{ fontSize: "1.35rem" }}>
              {formatMoney(totalRevenue)}
            </div>
            <p className="metric-note">confirmed checkout value</p>
          </div>
          <div className="metric-card glass-stat">
            <div className="metric-head">
              Travellers <Users size={18} />
            </div>
            <div className="metric-value">{travellers}</div>
            <p className="metric-note">unique booking emails</p>
          </div>
          <div className="metric-card glass-stat">
            <div className="metric-head">
              Active Vouchers <BadgePercent size={18} />
            </div>
            <div className="metric-value">{activeVouchers.length}</div>
            <p className="metric-note">available at checkout</p>
          </div>
        </section>

        <div className="admin-layout">
          <section className="account-panel admin-monitor-panel">
            <div className="panel-heading">
              <div>
                <h2>Booking monitor</h2>
                <p>Latest traveller bookings captured after payment.</p>
              </div>
            </div>

            {bookings.length ? (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Traveller</th>
                      <th>Route</th>
                      <th>Flight</th>
                      <th>Departure</th>
                      <th>Paid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={`${booking.email}-${booking.bookingId}`}>
                        <td>{booking.email}</td>
                        <td>
                          {booking.outboundFlight?.origin || "-"} to {booking.outboundFlight?.destination || "-"}
                        </td>
                        <td>{booking.outboundFlight?.flightNumber || booking.bookingId || "-"}</td>
                        <td>{formatFlightDate(booking.outboundFlight?.departure)}</td>
                        <td>{formatMoney(booking.amount)}</td>
                        <td>
                          <span className="status-chip">{booking.status || "Confirmed"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state compact-empty">
                <Plane size={34} />
                <h3>No bookings yet</h3>
                <p>Paid bookings will appear here once a traveller completes checkout.</p>
              </div>
            )}
          </section>

          <aside className="admin-side-stack">
            <section className="account-panel">
              <div className="panel-heading">
                <div>
                  <h2>Key in voucher</h2>
                  <p>Create discount codes for user booking checkout.</p>
                </div>
              </div>

              <form className="maintenance-form voucher-form" onSubmit={handleVoucherSubmit}>
                <div className="maintenance-field">
                  <label>Voucher code</label>
                  <input
                    value={voucherDraft.code}
                    onChange={(event) => updateDraft("code", event.target.value)}
                    placeholder="FLEX50"
                    required
                  />
                </div>
                <div className="maintenance-field">
                  <label>Campaign title</label>
                  <input
                    value={voucherDraft.title}
                    onChange={(event) => updateDraft("title", event.target.value)}
                    placeholder="Member discount"
                    required
                  />
                </div>
                <div className="maintenance-field">
                  <label>Discount type</label>
                  <select
                    value={voucherDraft.discountType}
                    onChange={(event) => updateDraft("discountType", event.target.value)}
                  >
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed MYR</option>
                  </select>
                </div>
                <div className="maintenance-field">
                  <label>Discount value</label>
                  <input
                    type="number"
                    min="0"
                    value={voucherDraft.discountValue}
                    onChange={(event) => updateDraft("discountValue", event.target.value)}
                    required
                  />
                </div>
                <div className="maintenance-field">
                  <label>Max discount</label>
                  <input
                    type="number"
                    min="0"
                    value={voucherDraft.maxDiscount}
                    onChange={(event) => updateDraft("maxDiscount", event.target.value)}
                  />
                </div>
                <div className="maintenance-field">
                  <label>Expiry date</label>
                  <input
                    type="date"
                    value={voucherDraft.expiresAt}
                    onChange={(event) => updateDraft("expiresAt", event.target.value)}
                  />
                </div>
                <div className="maintenance-field full">
                  <label>Audience</label>
                  <input
                    value={voucherDraft.audience}
                    onChange={(event) => updateDraft("audience", event.target.value)}
                    placeholder="Students, members, all travellers"
                  />
                </div>
                {savedMessage && <div className="form-success">{savedMessage}</div>}
                <div className="maintenance-field full">
                  <button className="account-button primary" type="submit">
                    <Save size={17} /> Save Voucher
                  </button>
                </div>
              </form>
            </section>

            <section className="account-panel">
              <div className="panel-heading">
                <div>
                  <h2>Voucher library</h2>
                  <p>Active codes are shown to users at checkout.</p>
                </div>
              </div>

              <div className="voucher-list">
                {vouchers.map((voucher) => (
                  <article className="voucher-card" key={voucher.id}>
                    <div>
                      <span className="voucher-code">{voucher.code}</span>
                      <h3>{voucher.title}</h3>
                      <p>
                        {voucher.discountType === "fixed"
                          ? formatMoney(voucher.discountValue)
                          : `${voucher.discountValue}%`}
                        {voucher.maxDiscount ? ` max ${formatMoney(voucher.maxDiscount)}` : ""} · {voucher.audience}
                      </p>
                    </div>
                    <div className="voucher-actions">
                      <span className={`status-chip ${voucher.status === "active" ? "good" : "muted"}`}>
                        {voucher.status}
                      </span>
                      <button
                        type="button"
                        className="icon-button"
                        title={voucher.status === "active" ? "Deactivate voucher" : "Activate voucher"}
                        onClick={() => handleStatusChange(voucher.id, voucher.status === "active" ? "inactive" : "active")}
                      >
                        <CalendarDays size={17} />
                      </button>
                      <button
                        type="button"
                        className="icon-button danger"
                        title="Delete voucher"
                        onClick={() => handleDelete(voucher.id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;
