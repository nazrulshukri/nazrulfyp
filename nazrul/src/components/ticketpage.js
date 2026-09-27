import React from "react";
import { Link, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  Plane,
  ArrowRight,
  Smartphone,
  Building2,
  Luggage,
  DoorOpen,
  Armchair,
  ShieldCheck,
  CreditCard,
  Users,
  BedDouble,
  Receipt,
} from "lucide-react";
import { API_BASE } from "../lib/apiConfig";
import { formatMoney } from "../lib/bookingStorage";
import { airportMeta, formatDay, minutesToLabel } from "../lib/travelMeta";
import { pnrFor, gateFor, terminalFor, shiftTime, downloadCalendar, downloadTicketPdf, resendTicket } from "../lib/ticketMeta";
import { AirlineBadge } from "./flightresults";
import { SuccessHero, EmailStatus, Barcode, TicketActions, TripTimeline, HomeLinks } from "./TicketParts";
import london from "../img/assets/travel/london.jpg";
import tokyo from "../img/assets/travel/mountfuji.jpg";
import bali from "../img/assets/travel/bali.jpeg";
import sabah from "../img/assets/travel/sabah.jpeg";
import kl from "../img/assets/travel/kualalumpur.jpg";
import plane from "../img/assets/4k-plane-beautiful-sunset-shawraxhzg2ibf4f.jpg";

const CITY_IMAGES = { London: london, Tokyo: tokyo, Bali: bali, "Kota Kinabalu": sabah, "Kuala Lumpur": kl };
const time = (value) =>
  new Date(value).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function BoardingPass({ label, flight, passenger, seat, pnr, index, travellers }) {
  const from = airportMeta(flight.origin);
  const to = airportMeta(flight.destination);
  const minutes = Math.round((new Date(flight.arrival) - new Date(flight.departure)) / 60000);
  const gate = gateFor(flight.flightNumber + flight.departure);
  const zone = (index % 3) + 2;
  const name = `${(passenger.lastName || "").toUpperCase()} / ${(passenger.firstName || "").toUpperCase()}`;
  const qr = `M1${name.replace(/\s/g, "")} ${pnr} ${from.code}${to.code} ${flight.flightNumber} ${flight.departure.slice(0, 10)} ${seat || "---"}`;
  return (
    <article className="bf26-pass" style={{ animationDelay: `${index * 140}ms` }}>
      <div className="bf26-pass-main">
        <header>
          <div className="bf26-flight-airline">
            <AirlineBadge name={flight.airline} size={40} />
            <span>
              <strong>{flight.airline}</strong>
              <small>{label} · Boarding pass</small>
            </span>
          </div>
          <span className="bf26-pass-class">Economy</span>
        </header>

        <div className="bf26-pass-route">
          <div>
            <strong>{from.code}</strong>
            <span>{from.city}</span>
            <b>{time(flight.departure)}</b>
          </div>
          <div className="bf26-pass-arc" aria-hidden="true">
            <svg viewBox="0 0 200 60" preserveAspectRatio="none">
              <path d="M4 56 Q100 -18 196 56" />
            </svg>
            <span className="bf26-pass-plane">
              <Plane size={18} />
            </span>
            <small>
              {minutesToLabel(minutes)} · {flight.nonStop === false ? "1 stop" : "Direct"}
            </small>
          </div>
          <div>
            <strong>{to.code}</strong>
            <span>{to.city}</span>
            <b>
              {time(flight.arrival)}
              {flight.arrival.slice(0, 10) !== flight.departure.slice(0, 10) && <sup>+1</sup>}
            </b>
          </div>
        </div>

        <dl className="bf26-pass-grid">
          <div className="is-wide">
            <dt>Passenger</dt>
            <dd>{name}</dd>
          </div>
          <div>
            <dt>Flight</dt>
            <dd>{flight.flightNumber}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatDay(flight.departure)}</dd>
          </div>
          <div>
            <dt>Boarding</dt>
            <dd>{shiftTime(flight.departure, -45)}</dd>
          </div>
          <div>
            <dt>Terminal</dt>
            <dd>{terminalFor(flight.flightNumber)}</dd>
          </div>
          <div>
            <dt>Zone</dt>
            <dd>{zone}</dd>
          </div>
          <div>
            <dt>Booking ref</dt>
            <dd className="bf26-mono-lg">{pnr}</dd>
          </div>
        </dl>
        {travellers > 1 && (
          <p className="bf26-pass-note">
            <Users size={13} /> Lead passenger shown · {travellers} travellers on this booking
          </p>
        )}
      </div>

      <div className="bf26-pass-stub">
        <div className="bf26-pass-stub-top">
          <div>
            <small>Gate</small>
            <strong>{gate}</strong>
          </div>
          <div>
            <small>Seat</small>
            <strong>{seat || "TBA"}</strong>
          </div>
        </div>
        <div className="bf26-pass-qr">
          <QRCodeSVG value={qr} size={112} bgColor="transparent" fgColor="#133634" level="M" />
        </div>
        <Barcode text={qr} />
        <small className="bf26-pass-seq">SEQ {String(index * 7 + 12).padStart(3, "0")} · Gate closes {shiftTime(flight.departure, -15)}</small>
      </div>
    </article>
  );
}

const TicketPage = () => {
  const { state } = useLocation();
  const ticket =
    state ||
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem("lastFlightTicket"));
      } catch {
        return null;
      }
    })();

  if (!ticket?.outboundFlight) {
    return (
      <section className="bf-empty">
        <Plane size={36} />
        <h1>No ticket to show yet.</h1>
        <p>Your confirmed bookings appear in My trips.</p>
        <Link className="bf-primary" to="/dashboard">
          Go to My trips <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const {
    bookingId,
    amount,
    outboundFlight,
    returnFlight,
    passengerDetails = {},
    selectedSeats = [],
    selectedInsurance,
    people = 1,
    paymentMethod,
    paymentDetail,
    paidAt,
    sentTo,
    emailStatus,
  } = ticket;
  const email = sentTo || passengerDetails.email;
  const pnr = pnrFor(bookingId);
  const dest = airportMeta(outboundFlight.destination);
  const legs = [
    ["Outbound", outboundFlight],
    ...(returnFlight?.flightNumber ? [["Return", returnFlight]] : []),
  ];
  const dep = outboundFlight.departure;

  const calendar = () =>
    downloadCalendar(
      `BookingFlex-${pnr}.ics`,
      legs.map(([label, f]) => ({
        title: `${label}: ${f.airline} ${f.flightNumber} ${airportMeta(f.origin).code}→${airportMeta(f.destination).code}`,
        start: f.departure,
        end: f.arrival,
        location: f.origin,
        description: `Booking ref ${pnr}. Arrive 3 hours before departure.`,
      })),
    );

  return (
    <div className="bf26-page bf26-ticket">
      <SuccessHero
        image={CITY_IMAGES[dest.city] || plane}
        kicker={`Booking confirmed · Ref ${pnr}`}
        title={`You’re going to ${dest.city}!`}
        subtitle={`${formatDay(dep, { year: "numeric" })} · ${people} ${people === 1 ? "traveller" : "travellers"} · paid ${formatMoney(amount)}`}
      />

      <div className="bf26-ticket-wrap">
        <EmailStatus
          status={emailStatus}
          email={email}
          onResend={() => resendTicket(API_BASE, "flight", email, { ...ticket, email })}
        />

        <div className="bf26-ticket-grid">
          <div className="bf26-passes">
            <div className="bf26-section-title">
              <h2>Your boarding passes</h2>
              <span>Show these at security and the gate</span>
            </div>
            {legs.map(([label, f], i) => (
              <BoardingPass
                key={label}
                label={label}
                flight={f}
                passenger={passengerDetails}
                seat={selectedSeats[0]}
                pnr={pnr}
                index={i}
                travellers={people}
              />
            ))}
            <TicketActions
              onDownload={() => downloadTicketPdf(API_BASE, "flight", ticket, `BookingFlex-${pnr}.pdf`)}
              onCalendar={calendar}
            >
              <Link
                to="/hotel"
                className="bf26-ghost"
                onClick={() =>
                  localStorage.setItem(
                    "hotelParams",
                    JSON.stringify({
                      checkInDate: dep.slice(0, 10),
                      checkOutDate: (returnFlight?.departure || dep).slice(0, 10),
                      location: dest.city,
                      people,
                    }),
                  )
                }
              >
                <BedDouble size={16} /> Add a hotel in {dest.city}
              </Link>
            </TicketActions>
          </div>

          <aside className="bf26-ticket-side">
            <section className="bf26-panel">
              <h2 className="bf26-panel-title">Before you fly</h2>
              <TripTimeline
                items={[
                  [Smartphone, "Online check-in opens", `${formatDay(new Date(new Date(dep).getTime() - 86400000).toISOString())}, ${time(dep)} · 24 hours before`],
                  [Building2, "Arrive at the airport", `By ${shiftTime(dep, -180)} · 3 hours before`],
                  [Luggage, "Bag drop closes", `${shiftTime(dep, -60)} · 30 kg checked, 7 kg cabin`],
                  [DoorOpen, "Boarding starts", `${shiftTime(dep, -45)} at gate ${gateFor(outboundFlight.flightNumber + dep)}`],
                  [Plane, "Take-off", `${time(dep)} · ${outboundFlight.flightNumber} to ${dest.city}`],
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
                    <CreditCard size={13} /> {paymentMethod}
                    {paymentDetail && paymentDetail !== paymentMethod ? ` · ${paymentDetail}` : ""}
                  </span>
                </p>
                <p>
                  <span>Paid on</span>
                  <strong>{paidAt ? new Date(paidAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—"}</strong>
                </p>
                <p>
                  <span>
                    <Users size={13} /> Travellers
                  </span>
                  <strong>{people}</strong>
                </p>
                <p>
                  <span>
                    <Armchair size={13} /> Seats
                  </span>
                  <strong>{selectedSeats.length ? selectedSeats.join(", ") : "At check-in"}</strong>
                </p>
                <p>
                  <span>
                    <ShieldCheck size={13} /> Protection
                  </span>
                  <strong>{selectedInsurance?.name || "None"}</strong>
                </p>
                <p>
                  <span>Order number</span>
                  <strong className="bf26-mono">{bookingId}</strong>
                </p>
              </div>
              <div className="bf26-summary-total">
                <span>Total paid</span>
                <strong>{formatMoney(amount)}</strong>
              </div>
            </section>
            <HomeLinks />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
