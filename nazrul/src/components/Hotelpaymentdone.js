import React from "react";
import { Link, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  BedDouble,
  ArrowRight,
  MapPin,
  KeyRound,
  Clock,
  IdCard,
  Receipt,
  CreditCard,
  Users,
  Moon,
  Plane,
} from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { formatMoney } from "../lib/bookingStorage";
import { formatDay } from "../lib/travelMeta";
import { pnrFor, downloadCalendar, downloadTicketPdf, resendTicket } from "../lib/ticketMeta";
import { SuccessHero, EmailStatus, Barcode, TicketActions, TripTimeline, HomeLinks } from "./TicketParts";

const HOTEL_PAYMENT_DRAFT_KEY = "hotelPaymentDraft";
const HERO = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=70";

const HotelPaymentDone = () => {
  const { state } = useLocation();
  const p =
    state?.paymentData ||
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem(HOTEL_PAYMENT_DRAFT_KEY));
      } catch {
        return null;
      }
    })();

  if (!p?.hotelName) {
    return (
      <section className="bf-empty">
        <BedDouble size={36} />
        <h1>No hotel voucher to show yet.</h1>
        <p>Book a stay to see your voucher here.</p>
        <Link className="bf-primary" to="/hotel">
          Browse hotels <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const u = p.userData || {};
  const conf = pnrFor(`${p.hotelName}${p.checkInDate}${u.email || ""}`);
  const nights = Math.max(1, Math.round((new Date(p.checkOutDate) - new Date(p.checkInDate)) / 86400000) || 1);
  const guest = `${u.firstName || ""} ${u.lastName || ""}`.trim();
  const qr = `HOTEL ${conf} ${p.hotelName} ${p.checkInDate}`;

  return (
    <div className="bf26-page bf26-ticket">
      <SuccessHero
        image={HERO}
        kicker={`Stay confirmed · ${conf}`}
        title={`Your stay in ${p.location || "town"} is booked`}
        subtitle={`${p.hotelName} · ${nights} night${nights === 1 ? "" : "s"} · paid ${formatMoney(p.totalPrice)}`}
      />
      <div className="bf26-ticket-wrap">
        <EmailStatus docName="Voucher" status={p.emailStatus} email={u.email} onResend={() => resendTicket(API_BASE, "hotel", u.email, p)} />
        <div className="bf26-ticket-grid">
          <div className="bf26-passes">
            <div className="bf26-section-title">
              <h2>Your hotel voucher</h2>
              <span>Show this at reception</span>
            </div>
            <article className="bf26-pass bf26-pass-hotel">
              <div className="bf26-pass-main">
                <header>
                  <div className="bf26-flight-airline">
                    <span className="bf26-rail-badge" style={{ "--line": "#1d4a3f" }}>
                      <BedDouble size={20} />
                    </span>
                    <span>
                      <strong>{p.hotelName}</strong>
                      <small>
                        <MapPin size={11} /> {p.location}
                      </small>
                    </span>
                  </div>
                  <span className="bf26-pass-class">Voucher</span>
                </header>
                <div className="bf26-stay-dates bf26-voucher-dates">
                  <div>
                    <small>Check-in</small>
                    <strong>{formatDay(p.checkInDate, { year: "numeric" })}</strong>
                    <small>from 15:00</small>
                  </div>
                  <div className="bf26-voucher-nights">
                    <Moon size={16} />
                    <b>{nights}</b>
                    <small>night{nights === 1 ? "" : "s"}</small>
                  </div>
                  <div>
                    <small>Check-out</small>
                    <strong>{formatDay(p.checkOutDate, { year: "numeric" })}</strong>
                    <small>until 11:00</small>
                  </div>
                </div>
                <dl className="bf26-pass-grid">
                  <div className="is-wide">
                    <dt>Lead guest</dt>
                    <dd>{guest || "—"}</dd>
                  </div>
                  <div className="is-wide">
                    <dt>Room</dt>
                    <dd>{p.roomType || "Standard room"}</dd>
                  </div>
                  <div>
                    <dt>Guests</dt>
                    <dd>{p.people}</dd>
                  </div>
                  <div>
                    <dt>Confirmation</dt>
                    <dd className="bf26-mono-lg">{conf}</dd>
                  </div>
                </dl>
              </div>
              <div className="bf26-pass-stub">
                <div className="bf26-pass-stub-top">
                  <div>
                    <small>Nights</small>
                    <strong>{nights}</strong>
                  </div>
                  <div>
                    <small>Guests</small>
                    <strong>{p.people}</strong>
                  </div>
                </div>
                <div className="bf26-pass-qr">
                  <QRCodeSVG value={qr} size={112} bgColor="transparent" fgColor="#133634" level="M" />
                </div>
                <Barcode text={qr} />
                <small className="bf26-pass-seq">Confirmation {conf}</small>
              </div>
            </article>
            <TicketActions
              onDownload={() => downloadTicketPdf(API_BASE, "hotel", p, `BookingFlex-${conf}.pdf`)}
              onCalendar={() =>
                downloadCalendar(`BookingFlex-${conf}.ics`, [
                  {
                    title: `Stay at ${p.hotelName}`,
                    start: `${p.checkInDate}T15:00:00`,
                    end: `${p.checkOutDate}T11:00:00`,
                    location: `${p.hotelName}, ${p.location}`,
                    description: `Confirmation ${conf}`,
                  },
                ])
              }
            >
              <Link to="/" className="bf26-ghost">
                <Plane size={16} /> Find flights to {p.location}
              </Link>
            </TicketActions>
          </div>
          <aside className="bf26-ticket-side">
            <section className="bf26-panel">
              <h2 className="bf26-panel-title">Good to know</h2>
              <TripTimeline
                items={[
                  [IdCard, "Bring photo ID", "Plus a card for incidentals at check-in"],
                  [Clock, "Check-in from 15:00", formatDay(p.checkInDate, { year: "numeric" })],
                  [KeyRound, "Check-out until 11:00", formatDay(p.checkOutDate, { year: "numeric" })],
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
                    <CreditCard size={13} /> {p.paymentMethod}
                    {p.paymentDetail && p.paymentDetail !== p.paymentMethod ? ` · ${p.paymentDetail}` : ""}
                  </span>
                </p>
                <p>
                  <span>
                    <Users size={13} /> Guests
                  </span>
                  <strong>{p.people}</strong>
                </p>
                <p>
                  <span>Paid on</span>
                  <strong>{p.paidAt ? new Date(p.paidAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—"}</strong>
                </p>
              </div>
              <div className="bf26-summary-total">
                <span>Total paid</span>
                <strong>{formatMoney(p.totalPrice)}</strong>
              </div>
            </section>
            <HomeLinks />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HotelPaymentDone;
