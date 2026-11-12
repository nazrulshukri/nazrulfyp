// Turns a finished booking (flight, hotel or train, in the shapes the payment
// pages save) into an order and sends it to the server, which keeps it for
// My trips and the admin dashboard. Amounts are always MYR.
import { API_BASE } from "./apiConfig";
import { airportMeta } from "./travelMeta";
import { pnrFor } from "./ticketMeta";
import { stationCode, stationLabel } from "./trainNetwork";

const iso = (v) => {
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
};
const hhmm = (t) => String(t || "00:00").replace(".", ":");

export function orderFromBooking(b) {
  if (!b) return null;
  const kind = b.kind || (b.outboundFlight ? "flight" : b.hotelName ? "hotel" : b.trainDetails ? "train" : null);
  if (kind === "flight" && b.outboundFlight) {
    const out = b.outboundFlight;
    const from = airportMeta(out.origin);
    const to = airportMeta(out.destination);
    return {
      kind,
      reference: pnrFor(b.bookingId),
      title: `${from.code} → ${to.code}`,
      subtitle: `${out.airline} ${out.flightNumber}${b.returnFlight ? " · return" : " · one way"}`,
      origin: from.city,
      destination: to.city,
      startAt: iso(out.departure),
      endAt: iso((b.returnFlight && b.returnFlight.arrival) || out.arrival),
      travellers: Number(b.people) || (b.passengerDetails ? b.passengerDetails.length : 1),
      amountMyr: Number(b.amount) || 0,
      paymentMethod: b.paymentMethod,
    };
  }
  if (kind === "train") {
    return {
      kind,
      reference: pnrFor(String(b._id || b.bookingId || b.trainId || "")),
      title: `${stationCode(b.origin || "")} → ${stationCode(b.destination || "")}`,
      subtitle: `${b.trainDetails || "Train"} · ${stationLabel(b.origin || "")} to ${stationLabel(b.destination || "")}`,
      origin: b.origin,
      destination: b.destination,
      startAt: iso(`${b.startDate}T${hhmm(b.departureTime)}:00`),
      endAt: iso(`${b.returnDate || b.startDate}T${hhmm(b.arrivalTime || "23:59")}:00`),
      travellers: Number(b.passengers || b.people) || 1,
      amountMyr: Number(b.totalPrice) || 0,
      paymentMethod: b.paymentMethod,
    };
  }
  if (kind === "hotel") {
    return {
      kind,
      reference: pnrFor(`${b.hotelName}${b.checkInDate}${(b.userData && b.userData.email) || ""}`),
      title: b.hotelName,
      subtitle: `${b.location || ""} · ${b.roomType || "Room"}`,
      origin: b.location,
      destination: b.location,
      startAt: iso(`${b.checkInDate}T15:00:00`),
      endAt: iso(`${b.checkOutDate}T11:00:00`),
      travellers: Number(b.people) || 1,
      amountMyr: Number(b.totalPrice) || 0,
      paymentMethod: b.paymentMethod,
    };
  }
  return null;
}

/** Sends a finished booking to the server. Never throws: My trips still works offline. */
export async function recordOrder(email, booking) {
  const order = orderFromBooking(booking);
  if (!order || !order.reference) return false;
  const headers = { "Content-Type": "application/json" };
  try {
    const token = localStorage.getItem("token");
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    /* ignore */
  }
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...order, email }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
