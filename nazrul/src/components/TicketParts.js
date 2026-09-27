import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MailCheck,
  MailWarning,
  RefreshCw,
  Download,
  Printer,
  CalendarPlus,
  Loader2,
  Check,
} from "lucide-react";
import { barcodeBars } from "../lib/ticketMeta";

export function SuccessHero({ image, kicker, title, subtitle, children }) {
  return (
    <section className="bf26-success" style={image ? { "--hero": `url(${image})` } : undefined}>
      <div className="bf26-success-bg" aria-hidden="true" />
      <div className="bf26-confetti" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <i key={i} style={{ "--i": i }} />
        ))}
      </div>
      <div className="bf26-success-inner">
        <svg className="bf26-check" viewBox="0 0 52 52" aria-hidden="true">
          <circle cx="26" cy="26" r="24" />
          <path d="M15 27l7 7 15-16" />
        </svg>
        <span className="bf26-kicker">{kicker}</span>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}

export function EmailStatus({ status, email, onResend, docName = "E-ticket" }) {
  const [state, setState] = useState(status);
  async function resend() {
    setState("sending");
    try {
      await onResend();
      setState("sent");
    } catch (e) {
      setState("failed");
    }
  }
  if (!email) return null;
  if (state === "sent")
    return (
      <div className="bf26-mailbar is-sent" role="status">
        <MailCheck size={20} />
        <span>
          <strong>{docName} sent to {email}</strong>
          <small>Check your inbox (and the spam folder) for the PDF attachment.</small>
        </span>
        <button type="button" className="bf26-link" onClick={resend}>
          Send again
        </button>
      </div>
    );
  if (state === "sending")
    return (
      <div className="bf26-mailbar" role="status">
        <Loader2 size={20} className="bf26-spin" />
        <span>
          <strong>Sending your {docName.toLowerCase()} to {email}…</strong>
        </span>
      </div>
    );
  return (
    <div className="bf26-mailbar is-failed" role="alert">
      <MailWarning size={20} />
      <span>
        <strong>We couldn’t email your {docName.toLowerCase()} yet</strong>
        <small>Your booking is confirmed. Make sure the BookingFlex backend is running, then try again.</small>
      </span>
      <button type="button" className="bf26-ghost" onClick={resend}>
        <RefreshCw size={15} /> Email my {docName.toLowerCase()}
      </button>
    </div>
  );
}

export function Barcode({ text, height = 46 }) {
  const bars = barcodeBars(text);
  let x = 0;
  const rects = bars.map((w, i) => {
    const rect = i % 2 === 0 ? <rect key={i} x={x} y="0" width={w} height={height} /> : null;
    x += w;
    return rect;
  });
  return (
    <svg className="bf26-barcode" viewBox={`0 0 ${x} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      {rects}
    </svg>
  );
}

export function TicketActions({ onDownload, onCalendar, children }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <div className="bf26-ticket-actions">
      <button
        type="button"
        className="bf26-primary"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await onDownload();
          setBusy(false);
          setDone(true);
        }}
      >
        {busy ? <Loader2 size={16} className="bf26-spin" /> : done ? <Check size={16} /> : <Download size={16} />}{" "}
        {busy ? "Preparing PDF…" : "Download PDF"}
      </button>
      <button type="button" className="bf26-ghost" onClick={() => window.print()}>
        <Printer size={16} /> Print
      </button>
      {onCalendar && (
        <button type="button" className="bf26-ghost" onClick={onCalendar}>
          <CalendarPlus size={16} /> Add to calendar
        </button>
      )}
      {children}
    </div>
  );
}

export function TripTimeline({ items }) {
  return (
    <ol className="bf26-trip-timeline">
      {items.map(([Icon, title, detail], i) => (
        <li key={title} style={{ "--i": i }}>
          <span>
            <Icon size={17} />
          </span>
          <div>
            <strong>{title}</strong>
            <small>{detail}</small>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function HomeLinks() {
  return (
    <div className="bf26-home-links">
      <Link to="/dashboard" className="bf26-ghost">
        My trips
      </Link>
      <Link to="/" className="bf26-ghost">
        Back to home
      </Link>
    </div>
  );
}
