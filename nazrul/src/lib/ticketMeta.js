// Deterministic, illustrative ticket details (the app has no live airline data).

const hash = (text = "") =>
  String(text)
    .split("")
    .reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 2166136261);

/** Six-character booking reference, e.g. "K7QX2M". */
export function pnrFor(bookingId = "") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let h = hash(bookingId);
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[h % alphabet.length];
    h = (Math.floor(h / alphabet.length) ^ hash(out + i)) >>> 0;
  }
  return out;
}

export function gateFor(key = "") {
  const h = hash(key);
  return `${"ABCDEFGH"[h % 8]}${(h % 38) + 2}`;
}

export function terminalFor(key = "") {
  return `T${(hash(key) % 2) + 1}`;
}

export function shiftTime(iso, minutes) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  d.setMinutes(d.getMinutes() + minutes);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

/** Bar widths (1–4) for a decorative barcode generated from text. */
export function barcodeBars(text = "", count = 56) {
  let h = hash(text);
  return Array.from({ length: count }, () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h % 4) + 1;
  });
}

const icsDate = (d) =>
  `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}T${String(d.getUTCHours()).padStart(2, "0")}${String(d.getUTCMinutes()).padStart(2, "0")}00Z`;

/** Download an .ics calendar file for the given events. */
export function downloadCalendar(filename, events) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BookingFlex//Trips//EN",
    ...events.flatMap((e, i) => [
      "BEGIN:VEVENT",
      `UID:${hash(e.title + e.start)}-${i}@bookingflex`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(new Date(e.start))}`,
      `DTEND:${icsDate(new Date(e.end || e.start))}`,
      `SUMMARY:${e.title}`,
      `LOCATION:${e.location || ""}`,
      `DESCRIPTION:${(e.description || "").replace(/\n/g, "\\n")}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Ask the backend for the ticket PDF; fall back to the browser's print dialog. */
export async function downloadTicketPdf(apiBase, kind, booking, filename) {
  try {
    const res = await fetch(`${apiBase}/ticket-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, booking }),
    });
    if (!res.ok) throw new Error(`PDF service returned ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (error) {
    console.warn("PDF download unavailable, opening print dialog instead.", error);
    window.print();
    return false;
  }
}

/** Re-send the ticket email through the backend. */
export async function resendTicket(apiBase, kind, email, booking) {
  const res = await fetch(`${apiBase}/send-ticket`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, email, booking }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) throw new Error(data.message || "Email failed");
  return true;
}
