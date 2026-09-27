import React from "react";
import { Link, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  TrainFront,
  ArrowRight,
  Building2,
  DoorClosed,
  IdCard,
  Receipt,
  CreditCard,
  Users,
} from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { formatMoney } from "../lib/bookingStorage";
import { formatDay } from "../lib/travelMeta";
import { stationCode, stationLabel } from "../lib/trainNetwork";
import { pnrFor, downloadCalendar, downloadTicketPdf, resendTicket } from "../lib/ticketMeta";
import { SuccessHero, EmailStatus, Barcode, TicketActions, TripTimeline, HomeLinks } from "./TicketParts";

const HERO = "https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?auto=format&fit=crop&w=2000&q=70";

const hash = (t = "") => String(t).split("").reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 2166136261);
const minus = (hhmm, m) => {
  const [h, mm] = String(hhmm || "00:00").split(/[:.]/).map(Number);
  const t = (((h * 60 + mm - m) % 1440) + 1440) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

function RailTicket({ label, date, from, to, dep, arr, b, pnr, index }) {
  const coach = String.fromCharCode(65 + (hash(pnr + label) % 6));
  const seat = `${(hash(pnr) % 40) + 1}${"ABCD"[hash(label) % 4]}`;
  const platform = (hash(from) % 6) + 1;
  const qr = `RAIL ${pnr} ${stationCode(from)}-${stationCode(to)} ${date} ${dep || ""}`;
  return (
    <article className="bf26-pass bf26-pass-rail" style={{ animationDelay: `${index * 140}ms` }}>
      <div className="bf26-pass-main">
        <header>
          <div className="bf26-flight-airline">
            <span className="bf26-rail-badge" style={{ "--line": "#1d4a3f" }}>
              <TrainFront size={20} />
            </span>
            <span>
              <strong>{b.trainDetails}</strong>
              <small>
                {label} · {b.LineID}
              </small>
            </span>
          </div>
          <span className="bf26-pass-class">Standard</span>
        </header>
        <div className="bf26-pass-route">
          <div>
            <strong>{stationCode(from)}</strong>
            <span>{stationLabel(from)}</span>
            <b>{dep || "Open"}</b>
          </div>
          <div className="bf26-rail-track" aria-hidden="true">
            <i />
            <span className="bf26-rail-train">
              <TrainFront size={18} />
            </span>
            <small>{label === "Outbound" ? b.travelTime : "Open return"}</small>
          </div>
          <div>
            <strong>{stationCode(to)}</strong>
            <span>{stationLabel(to)}</span>
            <b>{arr || "—"}</b>
          </div>
        </div>
        <dl className="bf26-pass-grid">
          <div className="is-wide">
            <dt>Passenger</dt>
            <dd>{(b.name || "").toUpperCase()}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatDay(date)}</dd>
          </div>
          <div>
            <dt>Platform</dt>
            <dd>{platform}</dd>
          </div>
          <div>
            <dt>Passengers</dt>
            <dd>{b.people || 1}</dd>
          </div>
          <div>
            <dt>Class</dt>
            <dd>Standard</dd>
          </div>
          <div>
            <dt>Booking ref</dt>
            <dd className="bf26-mono-lg">{pnr}</dd>
          </div>
        </dl>
      </div>
      <div className="bf26-pass-stub">
        <div className="bf26-pass-stub-top">
          <div>
            <small>Coach</small>
            <strong>{coach}</strong>
          </div>
          <div>
            <small>Seat</small>
            <strong>{seat}</strong>
          </div>
        </div>
        <div className="bf26-pass-qr">
          <QRCodeSVG value={qr} size={112} bgColor="transparent" fgColor="#133634" level="M" />
        </div>
        <Barcode text={qr} />
        <small className="bf26-pass-seq">Gate closes {dep ? minus(dep, 10) : "10 min before"}</small>
      </div>
    </article>
  );
}

const TrainConfirmation = () => {
  const { state } = useLocation();
  const b =
    state?.bookingDetails ||
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem("lastTrainTicket"));
      } catch {
        return null;
      }
    })();

  if (!b) {
    return (
      <section className="bf-empty">
        <TrainFront size={36} />
        <h1>No train ticket to show yet.</h1>
        <p>Book a train to see your e-ticket here.</p>
        <Link className="bf-primary" to="/">
          Search trains <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const pnr = pnrFor(String(b._id || b.bookingId || b.trainId || ""));
  const legs = [["Outbound", b.startDate, b.origin, b.destination, b.departureTime, b.arrivalTime]];
  if (b.returnDate) legs.push(["Return", b.returnDate, b.destination, b.origin, "", ""]);

  return (
    <div className="bf26-page bf26-ticket">
      <SuccessHero
        image={HERO}
        kicker={`Train booked · Ref ${pnr}`}
        title={`All aboard for ${stationLabel(b.destination)}!`}
        subtitle={`${formatDay(b.startDate, { year: "numeric" })} · departs ${b.departureTime} · paid ${formatMoney(b.totalPrice)}`}
      />
      <div className="bf26-ticket-wrap">
        <EmailStatus
          status={b.emailStatus}
          email={b.email}
          onResend={() => resendTicket(API_BASE, "train", b.email, b)}
        />
        <div className="bf26-ticket-grid">
          <div className="bf26-passes">
            <div className="bf26-section-title">
              <h2>Your e-tickets</h2>
              <span>Scan at the platform gate</span>
            </div>
            {legs.map(([label, date, from, to, dep, arr], i) => (
              <RailTicket key={label} {...{ label, date, from, to, dep, arr, b, pnr, index: i }} />
            ))}
            <TicketActions
              onDownload={() => downloadTicketPdf(API_BASE, "train", b, `BookingFlex-${pnr}.pdf`)}
              onCalendar={() =>
                downloadCalendar(`BookingFlex-${pnr}.ics`, [
                  {
                    title: `${b.trainDetails}: ${stationLabel(b.origin)} → ${stationLabel(b.destination)}`,
                    start: `${b.startDate}T${(b.departureTime || "09:00").replace(".", ":")}:00`,
                    end: `${b.startDate}T${(b.arrivalTime || b.departureTime || "10:00").replace(".", ":")}:00`,
                    location: b.origin,
                    description: `Booking ref ${pnr}`,
                  },
                ])
              }
            />
          </div>
          <aside className="bf26-ticket-side">
            <section className="bf26-panel">
              <h2 className="bf26-panel-title">Before you travel</h2>
              <TripTimeline
                items={[
                  [IdCard, "Bring your IC or passport", "The name must match your ticket"],
                  [Building2, "Arrive at the station", `By ${minus(b.departureTime, 30)} · 30 minutes before`],
                  [DoorClosed, "Platform gate closes", `${minus(b.departureTime, 10)} · 10 minutes before`],
                  [TrainFront, "Departure", `${b.departureTime} from ${stationLabel(b.origin)}`],
                ]}
              />
            </section>
            <section className="bf26-panel bf26-receipt">
              <h2 className="bf26-panel-title">
                <Receipt size={18} /> Receipt
              </h2>
              <div className="bf26-summary-rows">
                <p>
                  <span>
                    <CreditCard size={13} /> {b.paymentMethod}
                    {b.paymentDetail && b.paymentDetail !== b.paymentMethod ? ` · ${b.paymentDetail}` : ""}
                  </span>
                </p>
                <p>
                  <span>
                    <Users size={13} /> Passengers
                  </span>
                  <strong>{b.people || 1}</strong>
                </p>
                <p>
                  <span>Paid on</span>
                  <strong>{b.paidAt ? new Date(b.paidAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—"}</strong>
                </p>
              </div>
              <div className="bf26-summary-total">
                <span>Total paid</span>
                <strong>{formatMoney(b.totalPrice)}</strong>
              </div>
            </section>
            <HomeLinks />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TrainConfirmation;
