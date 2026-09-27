// Ticket PDFs and emails for flights, trains and hotels.
// Keeps the same reference/gate algorithms as src/lib/ticketMeta.js so the
// PDF, the email and the confirmation page all show matching details.

const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const QRCode = require("qrcode");

/* ---------------------------------------------------------------- helpers */

const hash = (text = "") =>
  String(text)
    .split("")
    .reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 2166136261);

function pnrFor(bookingId = "") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let h = hash(bookingId);
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[h % alphabet.length];
    h = (Math.floor(h / alphabet.length) ^ hash(out + i)) >>> 0;
  }
  return out;
}
const gateFor = (key = "") => {
  const h = hash(key);
  return `${"ABCDEFGH"[h % 8]}${(h % 38) + 2}`;
};
const terminalFor = (key = "") => `T${(hash(key) % 2) + 1}`;
function barcodeBars(text = "", count = 56) {
  let h = hash(text);
  return Array.from({ length: count }, () => {
    h = (h * 1103515245 + 12345) >>> 0;
    return (h % 4) + 1;
  });
}

const AIRPORTS = [
  [/kuala lumpur/i, "KUL", "Kuala Lumpur"],
  [/heathrow|london/i, "LHR", "London"],
  [/haneda|japan|tokyo/i, "HND", "Tokyo"],
  [/ngurah|bali/i, "DPS", "Bali"],
  [/changi|singapore/i, "SIN", "Singapore"],
  [/suvarnabhumi|bangkok/i, "BKK", "Bangkok"],
  [/charles de gaulle|paris|france/i, "CDG", "Paris"],
  [/dubai/i, "DXB", "Dubai"],
  [/incheon|seoul|korea/i, "ICN", "Seoul"],
  [/sydney/i, "SYD", "Sydney"],
  [/kota kinabalu|sabah/i, "BKI", "Kota Kinabalu"],
];
function airportMeta(value = "") {
  const m = AIRPORTS.find(([p]) => p.test(value));
  if (m) return { code: m[1], city: m[2] };
  const city = String(value).replace(/ International Airport.*| Airport.*|\s*\(.*\)/g, "");
  return { code: city.slice(0, 3).toUpperCase() || "---", city };
}
const STATION_CODES = {
  "KL Sentral": "KLS",
  KLIA: "KLIA",
  KLIA2: "KLIA2",
  "Terminal Bersepadu Selatan(TBS)": "TBS",
  Ipoh: "IPH",
  Butterworth: "BTW",
  "Padang Besar": "PDB",
};
const stationCode = (s = "") => STATION_CODES[s] || String(s).slice(0, 3).toUpperCase();

const AIRLINE_CODES = [
  [/malaysia/i, "MH"], [/british/i, "BA"], [/emirates/i, "EK"], [/singapore/i, "SQ"],
  [/qatar/i, "QR"], [/turkish/i, "TK"], [/cathay/i, "CX"], [/etihad/i, "EY"],
  [/saudia/i, "SV"], [/nippon/i, "NH"], [/air france/i, "AF"], [/air india/i, "AI"],
  [/biman/i, "BG"], [/china southern/i, "CZ"], [/finnair/i, "AY"], [/klm/i, "KL"],
  [/korean/i, "KE"], [/kuwait/i, "KU"], [/oman/i, "WY"], [/thai/i, "TG"], [/airasia/i, "AK"],
];
const airlineCode = (name = "") => (AIRLINE_CODES.find(([p]) => p.test(name)) || [])[1];
const airlineLogoUrl = (name) => {
  const code = airlineCode(name);
  return code ? `https://www.gstatic.com/flights/airline_logos/70px/${code}.png` : "";
};

const money = (v) =>
  `MYR ${Number(v || 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const hhmm = (iso) => {
  const d = iso instanceof Date ? iso : new Date(iso);
  return Number.isNaN(d.getTime())
    ? String(iso || "-")
    : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const shift = (iso, minutes) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  d.setMinutes(d.getMinutes() + minutes);
  return hhmm(d);
};
const day = (value, withYear = true) => {
  if (!value) return "-";
  const d = new Date(String(value).length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
};
const durationLabel = (a, b) => {
  const m = Math.round((new Date(b) - new Date(a)) / 60000);
  if (!Number.isFinite(m) || m <= 0) return "";
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Standard PDF fonts only cover WinAnsi; replace anything else.
const safe = (s = "") =>
  String(s)
    .replace(/→|⟶/g, ">")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E -ÿ·–—]/g, "");

/* ------------------------------------------------------------ PDF drawing */

const C = {
  ink: rgb(0.075, 0.212, 0.204),
  forest: rgb(0.114, 0.29, 0.247),
  lime: rgb(0.851, 0.937, 0.49),
  soft: rgb(0.933, 0.953, 0.918),
  paper: rgb(0.961, 0.969, 0.953),
  line: rgb(0.886, 0.914, 0.894),
  muted: rgb(0.42, 0.498, 0.478),
  white: rgb(1, 1, 1),
  warn: rgb(0.706, 0.329, 0.122),
};
const PLANE =
  "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z";

async function fetchPng(url) {
  if (!url || typeof fetch !== "function") return null;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch (e) {
    return null;
  }
}

async function newDoc(title) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(title);
  pdf.setAuthor("BookingFlex");
  pdf.setCreator("BookingFlex");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.CourierBold);
  const page = pdf.addPage([595.28, 841.89]);
  const H = page.getHeight();
  const W = page.getWidth();
  // Text helper using top-left coordinates.
  const text = (str, x, y, { size = 10, f = font, color = C.ink, align = "left", maxWidth } = {}) => {
    let s = safe(str);
    if (maxWidth && f.widthOfTextAtSize(s, size) > maxWidth) {
      while (s.length > 1 && f.widthOfTextAtSize(`${s}...`, size) > maxWidth) s = s.slice(0, -1);
      s = `${s.trimEnd()}...`;
    }
    const w = f.widthOfTextAtSize(s, size);
    const dx = align === "right" ? -w : align === "center" ? -w / 2 : 0;
    page.drawText(s, { x: x + dx, y: H - y - size * 0.8, size, font: f, color });
    return w;
  };
  const box = (x, y, w, h, opts = {}) =>
    page.drawRectangle({ x, y: H - y - h, width: w, height: h, ...opts });
  return { pdf, page, H, W, font, bold, mono, text, box };
}

function drawHeader(k, { title, subtitle, reference, status = "CONFIRMED" }) {
  const { W, box, text, bold, page, H } = k;
  box(0, 0, W, 104, { color: C.ink });
  box(0, 104, W, 5, { color: C.lime });
  // Wordmark
  box(36, 30, 34, 34, { color: C.lime });
  page.drawSvgPath(PLANE, { x: 41, y: H - 35, scale: 1, color: C.ink });
  text("booking", 80, 34, { size: 20, f: bold, color: C.white });
  const w = bold.widthOfTextAtSize("booking", 20);
  text("flex.", 80 + w, 34, { size: 20, color: C.lime });
  text(title, 80, 62, { size: 9, f: bold, color: C.lime });
  text(subtitle, 80, 76, { size: 8.5, color: rgb(0.8, 0.86, 0.84) });
  text("Booking reference", W - 36, 30, { size: 8, color: rgb(0.8, 0.86, 0.84), align: "right" });
  text(reference, W - 36, 42, { size: 20, f: k.mono, color: C.white, align: "right" });
  const sw = bold.widthOfTextAtSize(status, 8) + 18;
  box(W - 36 - sw, 70, sw, 18, { color: C.lime });
  text(status, W - 36 - sw / 2, 75, { size: 8, f: bold, color: C.ink, align: "center" });
}

function drawInfoRow(k, y, cells) {
  const { W, box, text, bold } = k;
  box(36, y, W - 72, 58, { color: C.white, borderColor: C.line, borderWidth: 1 });
  const colW = (W - 72) / cells.length;
  cells.forEach(([label, value], i) => {
    const x = 50 + i * colW;
    text(label.toUpperCase(), x, y + 14, { size: 7, f: bold, color: C.muted });
    text(value, x, y + 28, { size: 10.5, f: bold, maxWidth: colW - 18 });
  });
}

async function drawStub(k, { x, y, w, h, bigLeft, bigRight, qrText, footer }) {
  const { box, text, bold, page, H, pdf } = k;
  box(x, y, w, h, { color: C.ink });
  // Perforation
  page.drawLine({
    start: { x, y: H - y - 8 },
    end: { x, y: H - y - h + 8 },
    thickness: 1.2,
    color: rgb(0.55, 0.65, 0.62),
    dashArray: [3, 3],
  });
  const half = w / 2;
  [bigLeft, bigRight].forEach(([label, value], i) => {
    const cx = x + half / 2 + i * half;
    text(label.toUpperCase(), cx, y + 14, { size: 7, f: bold, color: rgb(0.75, 0.82, 0.8), align: "center" });
    text(value, cx, y + 26, { size: 18, f: bold, color: C.lime, align: "center" });
  });
  const qrPng = await QRCode.toBuffer(qrText, { margin: 1, width: 240, color: { dark: "#133634", light: "#ffffff" } });
  const qr = await pdf.embedPng(qrPng);
  const q = Math.min(88, w - 36, h - 116);
  box(x + (w - q) / 2 - 5, y + 54, q + 10, q + 10, { color: C.white });
  page.drawImage(qr, { x: x + (w - q) / 2, y: H - y - 59 - q, width: q, height: q });
  // Barcode
  const bars = barcodeBars(qrText);
  const total = bars.reduce((a, b) => a + b, 0);
  const bw = w - 30;
  let bx = x + 15;
  bars.forEach((b, i) => {
    const width = (b / total) * bw;
    if (i % 2 === 0) box(bx, y + h - 46, width, 22, { color: C.white });
    bx += width;
  });
  text(footer, x + w / 2, y + h - 17, { size: 6.5, color: rgb(0.75, 0.82, 0.8), align: "center", maxWidth: w - 12 });
}

async function drawBoardingPass(k, y, { label, flight, passengerName, seat, pnr, travellers }) {
  const { W, box, text, bold, page, H, pdf } = k;
  const x = 36;
  const w = W - 72;
  const h = 214;
  const stubW = 150;
  const mainW = w - stubW;
  box(x, y, w, h, { color: C.white, borderColor: C.line, borderWidth: 1 });
  const from = airportMeta(flight.origin);
  const to = airportMeta(flight.destination);
  // Airline row
  const logo = await fetchPng(airlineLogoUrl(flight.airline));
  let tx = x + 18;
  if (logo) {
    try {
      const img = await pdf.embedPng(logo);
      box(x + 16, y + 14, 30, 30, { color: C.white, borderColor: C.line, borderWidth: 0.8 });
      page.drawImage(img, { x: x + 19, y: H - y - 41, width: 24, height: 24 });
      tx = x + 54;
    } catch (e) {
      /* logo optional */
    }
  }
  text(flight.airline || "Airline", tx, y + 17, { size: 11.5, f: bold });
  text(`${label} · Boarding pass · ${flight.flightNumber || ""}`, tx, y + 32, { size: 8.5, color: C.muted });
  const pill = "ECONOMY";
  const pw = bold.widthOfTextAtSize(pill, 7.5) + 16;
  box(x + mainW - 16 - pw, y + 18, pw, 16, { color: C.ink });
  text(pill, x + mainW - 16 - pw / 2, y + 22.5, { size: 7.5, f: bold, color: C.lime, align: "center" });

  // Route
  text(from.code, x + 18, y + 58, { size: 40, f: bold });
  text(to.code, x + mainW - 18, y + 58, { size: 40, f: bold, align: "right" });
  text(from.city, x + 18, y + 98, { size: 9, color: C.muted });
  text(to.city, x + mainW - 18, y + 98, { size: 9, color: C.muted, align: "right" });
  text(hhmm(flight.departure), x + 18, y + 112, { size: 15, f: bold });
  text(hhmm(flight.arrival), x + mainW - 18, y + 112, { size: 15, f: bold, align: "right" });
  const ax1 = x + 130;
  const ax2 = x + mainW - 130;
  page.drawLine({ start: { x: ax1, y: H - y - 80 }, end: { x: ax2, y: H - y - 80 }, thickness: 1.2, color: rgb(0.62, 0.72, 0.67), dashArray: [3, 4] });
  page.drawCircle({ x: ax1, y: H - y - 80, size: 3, color: C.forest });
  page.drawCircle({ x: ax2, y: H - y - 80, size: 3, color: C.forest });
  const mid = (ax1 + ax2) / 2;
  box(mid - 14, y + 68, 28, 24, { color: C.white });
  page.drawSvgPath(PLANE, { x: mid - 12, y: H - y - 68, scale: 1, borderColor: C.forest, borderWidth: 1.6 });
  const dur = durationLabel(flight.departure, flight.arrival);
  text(`${dur}${dur ? " · " : ""}${flight.nonStop === false ? "1 stop" : "Direct"}`, mid, y + 96, { size: 8, color: C.muted, align: "center" });

  // Details grid
  page.drawLine({ start: { x: x + 18, y: H - y - 136 }, end: { x: x + mainW - 18, y: H - y - 136 }, thickness: 0.8, color: C.line, dashArray: [2, 3] });
  const cells = [
    ["Passenger", passengerName, 2],
    ["Date", day(flight.departure, false), 1],
    ["Boarding", shift(flight.departure, -45), 1],
    ["Terminal", terminalFor(flight.flightNumber), 1],
    ["Zone", String((hash(pnr + label) % 3) + 2), 1],
    ["Seat", seat || "At check-in", 1],
    ["Travellers", String(travellers), 1],
  ];
  const cols = 4;
  const cw = (mainW - 36) / cols;
  let col = 0;
  let row = 0;
  cells.forEach(([lab, val, span]) => {
    if (col + span > cols) {
      col = 0;
      row += 1;
    }
    const cx = x + 18 + col * cw;
    const cy = y + 146 + row * 32;
    text(lab.toUpperCase(), cx, cy, { size: 6.8, f: bold, color: C.muted });
    text(val, cx, cy + 11, { size: 10, f: bold, maxWidth: cw * span - 8 });
    col += span;
  });

  const qrText = `M1${passengerName.replace(/\s/g, "")} ${pnr} ${from.code}${to.code} ${flight.flightNumber} ${String(flight.departure).slice(0, 10)} ${seat || "---"}`;
  await drawStub(k, {
    x: x + mainW,
    y,
    w: stubW,
    h,
    bigLeft: ["Gate", gateFor(`${flight.flightNumber}${flight.departure}`)],
    bigRight: ["Seat", seat || "TBA"],
    qrText,
    footer: `Gate closes ${shift(flight.departure, -15)} · ${pnr}`,
  });
  return y + h;
}

function drawChecklist(k, y, title, items) {
  const { W, box, text, bold, page, H } = k;
  box(36, y, W - 72, 26 + items.length * 18, { color: C.soft });
  text(title, 50, y + 12, { size: 10, f: bold });
  items.forEach((item, i) => {
    page.drawCircle({ x: 55, y: H - (y + 34 + i * 18), size: 2.5, color: C.forest });
    text(item, 64, y + 30 + i * 18, { size: 8.8, color: C.ink, maxWidth: W - 120 });
  });
  return y + 26 + items.length * 18;
}

function drawFooter(k) {
  const { W, H, text } = k;
  text(
    "BookingFlex · Sample booking for demonstration. Times, gates and seats are illustrative - always check airport screens.",
    W / 2,
    H - 30,
    { size: 7, color: C.muted, align: "center" },
  );
}

/* ---------------------------------------------------------------- flight */

async function flightPdf(b) {
  const k = await newDoc("BookingFlex e-ticket");
  const pnr = pnrFor(b.bookingId);
  const p = b.passengerDetails || {};
  const name = `${(p.lastName || "").toUpperCase()} / ${(p.firstName || "").toUpperCase()}`;
  drawHeader(k, {
    title: "E-TICKET & BOARDING PASS",
    subtitle: "Present with your passport at check-in, security and the gate.",
    reference: pnr,
  });
  let y = 128;
  drawInfoRow(k, y, [
    ["Lead passenger", name],
    ["Travellers", String(b.people || 1)],
    ["Payment", b.paymentMethod || "-"],
    ["Total paid", money(b.amount)],
  ]);
  y += 74;
  const legs = [["Outbound", b.outboundFlight], ["Return", b.returnFlight]].filter(([, f]) => f && f.flightNumber);
  for (const [label, flight] of legs) {
    y = (await drawBoardingPass(k, y, {
      label,
      flight,
      passengerName: name,
      seat: (b.selectedSeats || [])[0],
      pnr,
      travellers: b.people || 1,
    })) + 16;
  }
  const dep = b.outboundFlight && b.outboundFlight.departure;
  y = drawChecklist(k, y, "Before you fly", [
    `Online check-in opens 24 hours before departure (${day(dep)}).`,
    `Arrive at the airport by ${shift(dep, -180)} - bag drop closes at ${shift(dep, -60)}.`,
    `Boarding starts ${shift(dep, -45)}; the gate closes 15 minutes before departure.`,
    `Baggage: 30 kg checked + 7 kg cabin per traveller. Protection: ${(b.selectedInsurance && b.selectedInsurance.name) || "none"}.`,
    `Order ${b.bookingId || "-"} · issued ${day(new Date().toISOString())}.`,
  ]);
  drawFooter(k);
  return Buffer.from(await k.pdf.save());
}

/* ----------------------------------------------------------------- train */

async function trainPdf(b) {
  const k = await newDoc("BookingFlex train ticket");
  const { W, box, text, bold, page, H } = k;
  const pnr = pnrFor(String(b._id || b.bookingId || b.trainId || ""));
  drawHeader(k, { title: "E-TICKET · RAIL", subtitle: "Show this ticket at the platform gate or to the train crew.", reference: pnr });
  let y = 128;
  drawInfoRow(k, y, [
    ["Passenger", b.name || "-"],
    ["Passengers", String(b.people || 1)],
    ["Payment", b.paymentMethod || "-"],
    ["Total paid", money(b.totalPrice)],
  ]);
  y += 74;
  const legs = [["Outbound", b.startDate, b.origin, b.destination]];
  if (b.returnDate) legs.push(["Return", b.returnDate, b.destination, b.origin]);
  for (const [label, date, from, to] of legs) {
    const h = 190;
    const stubW = 150;
    const mainW = W - 72 - stubW;
    box(36, y, W - 72, h, { color: C.white, borderColor: C.line, borderWidth: 1 });
    text(b.trainDetails || "Train", 54, y + 18, { size: 12, f: bold });
    text(`${label} · ${b.LineID || b.trainId || ""} · Standard class`, 54, y + 34, { size: 8.5, color: C.muted });
    text(stationCode(from), 54, y + 58, { size: 36, f: bold });
    text(stationCode(to), 36 + mainW - 18, y + 58, { size: 36, f: bold, align: "right" });
    text(from, 54, y + 94, { size: 9, color: C.muted, maxWidth: 150 });
    text(to, 36 + mainW - 18, y + 94, { size: 9, color: C.muted, align: "right", maxWidth: 150 });
    const outbound = label === "Outbound";
    text(outbound ? b.departureTime || "-" : "Open return", 54, y + 108, { size: 14, f: bold });
    text(outbound ? b.arrivalTime || "" : "", 36 + mainW - 18, y + 108, { size: 14, f: bold, align: "right" });
    page.drawLine({ start: { x: 170, y: H - y - 76 }, end: { x: 36 + mainW - 130, y: H - y - 76 }, thickness: 1.2, color: rgb(0.62, 0.72, 0.67), dashArray: [6, 3] });
    text(outbound ? b.travelTime || "" : "", (170 + 36 + mainW - 130) / 2, y + 84, { size: 8, color: C.muted, align: "center" });
    const coach = String.fromCharCode(65 + (hash(pnr + label) % 6));
    const seat = `${(hash(pnr) % 40) + 1}${"ABCD"[hash(label) % 4]}`;
    [["Date", day(date, false)], ["Coach", coach], ["Seat", seat], ["Platform", String((hash(from) % 6) + 1)]].forEach(([l, v], i) => {
      const cx = 54 + i * ((mainW - 36) / 4);
      text(l.toUpperCase(), cx, y + 142, { size: 6.8, f: bold, color: C.muted });
      text(v, cx, y + 153, { size: 10.5, f: bold });
    });
    await drawStub(k, {
      x: 36 + mainW,
      y,
      w: stubW,
      h,
      bigLeft: ["Coach", coach],
      bigRight: ["Seat", seat],
      qrText: `RAIL ${pnr} ${stationCode(from)}-${stationCode(to)} ${date} ${b.departureTime || ""}`,
      footer: `Boarding closes 10 min before · ${pnr}`,
    });
    y += h + 16;
  }
  drawChecklist(k, y, "Before you travel", [
    "Arrive at the station at least 30 minutes before departure.",
    "Carry your IC or passport - the name must match this ticket.",
    "Platform gates close 10 minutes before the train leaves.",
  ]);
  drawFooter(k);
  return Buffer.from(await k.pdf.save());
}

/* ----------------------------------------------------------------- hotel */

async function hotelPdf(b) {
  const k = await newDoc("BookingFlex hotel voucher");
  const { W, box, text, bold } = k;
  const conf = pnrFor(`${b.hotelName}${b.checkInDate}${(b.userData && b.userData.email) || ""}`);
  const guest = b.userData ? `${b.userData.firstName || ""} ${b.userData.lastName || ""}`.trim() : "-";
  drawHeader(k, { title: "HOTEL VOUCHER", subtitle: "Show this voucher and your ID at check-in.", reference: conf });
  let y = 128;
  drawInfoRow(k, y, [
    ["Lead guest", guest || "-"],
    ["Guests", String(b.people || 1)],
    ["Payment", b.paymentMethod || "-"],
    ["Total paid", money(b.totalPrice || b.price)],
  ]);
  y += 74;
  const h = 200;
  const stubW = 150;
  const mainW = W - 72 - stubW;
  box(36, y, W - 72, h, { color: C.white, borderColor: C.line, borderWidth: 1 });
  text(b.hotelName || "Hotel", 54, y + 18, { size: 16, f: bold, maxWidth: mainW - 40 });
  text(b.location || b.hotellocation || "", 54, y + 40, { size: 9.5, color: C.muted });
  box(54, y + 62, (mainW - 54) / 2, 64, { color: C.soft });
  box(54 + (mainW - 54) / 2 + 8, y + 62, (mainW - 54) / 2 - 8, 64, { color: C.soft });
  text("CHECK-IN", 66, y + 72, { size: 7, f: bold, color: C.muted });
  text(day(b.checkInDate), 66, y + 86, { size: 12.5, f: bold });
  text("from 15:00", 66, y + 104, { size: 8.5, color: C.muted });
  const cx = 54 + (mainW - 54) / 2 + 20;
  text("CHECK-OUT", cx, y + 72, { size: 7, f: bold, color: C.muted });
  text(day(b.checkOutDate), cx, y + 86, { size: 12.5, f: bold });
  text("until 11:00", cx, y + 104, { size: 8.5, color: C.muted });
  const nights = Math.max(1, Math.round((new Date(b.checkOutDate) - new Date(b.checkInDate)) / 86400000) || 1);
  const colW = (mainW - 54) / 4;
  [["Room", b.roomType || "Standard room", 0, 2], ["Nights", String(nights), 2, 1], ["Guests", String(b.people || 1), 3, 1]].forEach(([l, v, col, span]) => {
    const x = 54 + col * colW;
    text(l.toUpperCase(), x, y + 142, { size: 6.8, f: bold, color: C.muted });
    text(v, x, y + 154, { size: 10.5, f: bold, maxWidth: colW * span - 8 });
  });
  await drawStub(k, {
    x: 36 + mainW,
    y,
    w: stubW,
    h,
    bigLeft: ["Nights", String(nights)],
    bigRight: ["Guests", String(b.people || 1)],
    qrText: `HOTEL ${conf} ${b.hotelName} ${b.checkInDate}`,
    footer: `Confirmation ${conf}`,
  });
  y += h + 16;
  drawChecklist(k, y, "Good to know", [
    "Check-in from 15:00 · check-out until 11:00.",
    "Photo ID and a card for incidentals are required at check-in.",
    "Free cancellation on most rooms until 3 days before arrival.",
  ]);
  drawFooter(k);
  return Buffer.from(await k.pdf.save());
}

async function buildTicketPdf(kind, booking) {
  if (kind === "train") return trainPdf(booking);
  if (kind === "hotel") return hotelPdf(booking);
  return flightPdf(booking);
}

/* ----------------------------------------------------------------- email */

const shell = ({ preheader, heroTitle, heroSub, reference, body }) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(heroTitle)}</title></head>
<body style="margin:0;padding:0;background:#eef3ea;font-family:Inter,'Segoe UI',Helvetica,Arial,sans-serif;color:#133634;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef3ea;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;">
  <tr><td style="background:#133634;border-radius:24px 24px 0 0;padding:26px 28px;">
    <table role="presentation" width="100%"><tr>
      <td style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">booking<span style="color:#d9ef7d;font-weight:400">flex.</span></td>
      <td align="right" style="color:#b9cbc4;font-size:11px;">Booking reference<br><span style="font-family:'Courier New',monospace;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:2px;">${esc(reference)}</span></td>
    </tr></table>
    <div style="margin-top:22px;display:inline-block;background:#d9ef7d;color:#133634;border-radius:999px;padding:6px 12px;font-size:11px;font-weight:800;letter-spacing:1px;">&#10003; CONFIRMED</div>
    <h1 style="margin:12px 0 6px;font-size:30px;line-height:1.15;color:#ffffff;font-weight:700;letter-spacing:-0.8px;">${esc(heroTitle)}</h1>
    <p style="margin:0;color:#cfdcd6;font-size:14px;">${esc(heroSub)}</p>
  </td></tr>
  <tr><td style="background:#d9ef7d;height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr><td style="background:#ffffff;border-radius:0 0 24px 24px;padding:24px 22px 28px;">
    ${body}
    <p style="margin:22px 0 0;font-size:12px;color:#6b7f7a;line-height:1.6;">Your PDF ticket is attached. This is a sample booking made with BookingFlex for demonstration - times, gates and seats are illustrative.</p>
  </td></tr>
  <tr><td align="center" style="padding:18px;font-size:11px;color:#6b7f7a;">BookingFlex · Plan with confidence. Travel your way.</td></tr>
</table></td></tr></table></body></html>`;

const passCard = ({ logo, airline, label, fromCode, fromCity, toCode, toCity, dep, arr, middle, cells, gate, seat }) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e9e4;border-radius:20px;margin:0 0 16px;border-collapse:separate;overflow:hidden;">
<tr>
<td style="padding:18px 18px 16px;vertical-align:top;">
  <table role="presentation" width="100%"><tr>
    <td style="font-size:14px;font-weight:700;">${logo ? `<img src="${logo}" width="26" height="26" alt="" style="vertical-align:middle;border:1px solid #e2e9e4;border-radius:8px;padding:2px;margin-right:8px;">` : ""}${esc(airline)}</td>
    <td align="right"><span style="background:#133634;color:#d9ef7d;border-radius:999px;padding:4px 10px;font-size:10px;font-weight:800;letter-spacing:1px;">${esc(label)}</span></td>
  </tr></table>
  <table role="presentation" width="100%" style="margin-top:14px;"><tr>
    <td style="width:30%;"><div style="font-size:36px;font-weight:800;letter-spacing:-1px;line-height:1;">${esc(fromCode)}</div><div style="font-size:12px;color:#6b7f7a;margin-top:4px;">${esc(fromCity)}</div><div style="font-size:17px;font-weight:700;margin-top:6px;">${esc(dep)}</div></td>
    <td align="center" style="width:40%;color:#6b7f7a;font-size:11px;"><div style="border-top:2px dashed #b5c9be;margin:0 6px 6px;"></div>&#9992;&nbsp;${esc(middle)}</td>
    <td align="right" style="width:30%;"><div style="font-size:36px;font-weight:800;letter-spacing:-1px;line-height:1;">${esc(toCode)}</div><div style="font-size:12px;color:#6b7f7a;margin-top:4px;">${esc(toCity)}</div><div style="font-size:17px;font-weight:700;margin-top:6px;">${esc(arr)}</div></td>
  </tr></table>
  <table role="presentation" width="100%" style="margin-top:14px;border-top:1px dashed #e2e9e4;padding-top:10px;"><tr>
    ${cells.map(([l, v]) => `<td style="padding-top:10px;vertical-align:top;"><div style="font-size:9px;font-weight:800;letter-spacing:1px;color:#6b7f7a;text-transform:uppercase;">${esc(l)}</div><div style="font-size:13px;font-weight:700;margin-top:2px;">${esc(v)}</div></td>`).join("")}
  </tr></table>
</td>
<td width="120" style="background:#133634;color:#ffffff;text-align:center;vertical-align:middle;padding:14px 10px;border-left:2px dashed #5b7d73;">
  <div style="font-size:9px;letter-spacing:1px;color:#b9cbc4;">${esc(gate[0])}</div><div style="font-size:22px;font-weight:800;color:#d9ef7d;">${esc(gate[1])}</div>
  <div style="font-size:9px;letter-spacing:1px;color:#b9cbc4;margin-top:8px;">${esc(seat[0])}</div><div style="font-size:22px;font-weight:800;color:#d9ef7d;">${esc(seat[1])}</div>
  <img src="cid:ticketqr" width="84" height="84" alt="QR code" style="margin-top:10px;background:#ffffff;border-radius:10px;padding:5px;">
</td>
</tr></table>`;

const rows = (items) => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f3;border-radius:16px;margin-top:6px;">
${items
  .map(
    ([l, v], i) => `<tr><td style="padding:10px 16px;font-size:13px;color:#6b7f7a;${i ? "border-top:1px solid #e2e9e4;" : ""}">${esc(l)}</td><td align="right" style="padding:10px 16px;font-size:13px;font-weight:700;${i ? "border-top:1px solid #e2e9e4;" : ""}">${esc(v)}</td></tr>`,
  )
  .join("")}
</table>`;

async function buildTicketEmail(kind, b) {
  let html;
  let text;
  let subject;
  let qrText;
  let reference;
  if (kind === "train") {
    reference = pnrFor(String(b._id || b.bookingId || b.trainId || ""));
    qrText = `RAIL ${reference} ${stationCode(b.origin)}-${stationCode(b.destination)} ${b.startDate} ${b.departureTime || ""}`;
    subject = `Your train ticket ${stationCode(b.origin)} > ${stationCode(b.destination)} · ${reference}`;
    const body =
      passCard({
        airline: b.trainDetails || "Train",
        label: "RAIL E-TICKET",
        fromCode: stationCode(b.origin),
        fromCity: b.origin,
        toCode: stationCode(b.destination),
        toCity: b.destination,
        dep: b.departureTime || "-",
        arr: b.arrivalTime || "-",
        middle: b.travelTime || "",
        cells: [["Date", day(b.startDate, false)], ["Return", b.returnDate ? day(b.returnDate, false) : "One way"], ["Passengers", String(b.people || 1)]],
        gate: ["COACH", String.fromCharCode(65 + (hash(reference + "Outbound") % 6))],
        seat: ["SEAT", `${(hash(reference) % 40) + 1}${"ABCD"[hash("Outbound") % 4]}`],
      }) +
      rows([["Passenger", b.name || "-"], ["Paid with", b.paymentMethod || "-"], ["Total paid", money(b.totalPrice)]]);
    html = shell({ preheader: `Train ticket ${reference}`, heroTitle: `You're all set for ${b.destination}`, heroSub: `${day(b.startDate)} · departs ${b.departureTime || ""}`, reference, body });
    text = `BookingFlex train ticket ${reference}\n${b.origin} > ${b.destination}\n${day(b.startDate)} ${b.departureTime || ""}\nTotal ${money(b.totalPrice)}`;
  } else if (kind === "hotel") {
    reference = pnrFor(`${b.hotelName}${b.checkInDate}${(b.userData && b.userData.email) || ""}`);
    qrText = `HOTEL ${reference} ${b.hotelName} ${b.checkInDate}`;
    subject = `Your stay at ${b.hotelName} is confirmed · ${reference}`;
    const guest = b.userData ? `${b.userData.firstName || ""} ${b.userData.lastName || ""}`.trim() : "-";
    const body =
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e9e4;border-radius:20px;border-collapse:separate;margin-bottom:14px;"><tr><td style="padding:18px;">
        <div style="font-size:20px;font-weight:800;">${esc(b.hotelName)}</div>
        <div style="font-size:13px;color:#6b7f7a;margin-top:4px;">${esc(b.location || b.hotellocation || "")} · ${esc(b.roomType || "")}</div>
        <table role="presentation" width="100%" style="margin-top:14px;"><tr>
          <td style="background:#eef3ea;border-radius:14px;padding:12px;width:50%;"><div style="font-size:9px;font-weight:800;letter-spacing:1px;color:#6b7f7a;">CHECK-IN</div><div style="font-size:15px;font-weight:800;">${esc(day(b.checkInDate))}</div><div style="font-size:11px;color:#6b7f7a;">from 15:00</div></td>
          <td style="width:10px"></td>
          <td style="background:#eef3ea;border-radius:14px;padding:12px;width:50%;"><div style="font-size:9px;font-weight:800;letter-spacing:1px;color:#6b7f7a;">CHECK-OUT</div><div style="font-size:15px;font-weight:800;">${esc(day(b.checkOutDate))}</div><div style="font-size:11px;color:#6b7f7a;">until 11:00</div></td>
        </tr></table>
      </td><td width="120" style="background:#133634;text-align:center;padding:12px;border-radius:0 20px 20px 0;"><img src="cid:ticketqr" width="84" height="84" alt="QR code" style="background:#fff;border-radius:10px;padding:5px;"><div style="color:#d9ef7d;font-family:'Courier New',monospace;font-weight:700;margin-top:8px;letter-spacing:2px;">${esc(reference)}</div></td></tr></table>` +
      rows([["Lead guest", guest], ["Guests", String(b.people || 1)], ["Paid with", b.paymentMethod || "-"], ["Total paid", money(b.totalPrice || b.price)]]);
    html = shell({ preheader: `Hotel voucher ${reference}`, heroTitle: `Your stay in ${b.location || b.hotellocation || "town"} is booked`, heroSub: `${b.hotelName} · ${day(b.checkInDate)}`, reference, body });
    text = `BookingFlex hotel voucher ${reference}\n${b.hotelName}\nCheck-in ${day(b.checkInDate)} · Check-out ${day(b.checkOutDate)}\nTotal ${money(b.totalPrice || b.price)}`;
  } else {
    reference = pnrFor(b.bookingId);
    const p = b.passengerDetails || {};
    const name = `${(p.lastName || "").toUpperCase()} / ${(p.firstName || "").toUpperCase()}`;
    const out = b.outboundFlight || {};
    const from = airportMeta(out.origin);
    const to = airportMeta(out.destination);
    qrText = `M1${name.replace(/\s/g, "")} ${reference} ${from.code}${to.code} ${out.flightNumber} ${String(out.departure).slice(0, 10)} ${(b.selectedSeats || [])[0] || "---"}`;
    subject = `Your flight to ${to.city} is confirmed · ${reference}`;
    const legs = [["OUTBOUND", out], ["RETURN", b.returnFlight]].filter(([, f]) => f && f.flightNumber);
    const body =
      legs
        .map(([label, f]) => {
          const a = airportMeta(f.origin);
          const z = airportMeta(f.destination);
          return passCard({
            logo: airlineLogoUrl(f.airline),
            airline: `${f.airline} · ${f.flightNumber}`,
            label,
            fromCode: a.code,
            fromCity: a.city,
            toCode: z.code,
            toCity: z.city,
            dep: hhmm(f.departure),
            arr: hhmm(f.arrival),
            middle: `${durationLabel(f.departure, f.arrival)} · ${f.nonStop === false ? "1 stop" : "Direct"}`,
            cells: [["Passenger", name], ["Date", day(f.departure, false)], ["Boarding", shift(f.departure, -45)]],
            gate: ["GATE", gateFor(`${f.flightNumber}${f.departure}`)],
            seat: ["SEAT", (b.selectedSeats || [])[0] || "TBA"],
          });
        })
        .join("") +
      rows([
        ["Travellers", String(b.people || 1)],
        ["Seats", (b.selectedSeats || []).join(", ") || "Assigned at check-in"],
        ["Travel protection", (b.selectedInsurance && b.selectedInsurance.name) || "None"],
        ["Paid with", `${b.paymentMethod || "-"}${b.paymentDetail && b.paymentDetail !== b.paymentMethod ? ` (${b.paymentDetail})` : ""}`],
        ["Total paid", money(b.amount)],
      ]) +
      `<table role="presentation" width="100%" style="margin-top:16px;"><tr><td style="background:#fbf6e3;border-radius:16px;padding:14px 16px;font-size:13px;line-height:1.6;color:#5b4a17;">
        <strong>Before you fly</strong><br>Check-in opens 24 hours before departure · arrive by ${esc(shift(out.departure, -180))} · boarding ${esc(shift(out.departure, -45))}.
      </td></tr></table>`;
    html = shell({ preheader: `E-ticket ${reference} · ${from.code} to ${to.code}`, heroTitle: `You're going to ${to.city}!`, heroSub: `${day(out.departure)} · ${out.airline || ""} ${out.flightNumber || ""}`, reference, body });
    text = `BookingFlex e-ticket ${reference}\n${from.code} > ${to.code} ${day(out.departure)} ${hhmm(out.departure)}\nPassenger ${name}\nTotal ${money(b.amount)}`;
  }
  const qrPng = await QRCode.toBuffer(qrText, { margin: 1, width: 240, color: { dark: "#133634", light: "#ffffff" } });
  const pdf = await buildTicketPdf(kind, b);
  return {
    subject,
    html,
    text,
    reference,
    attachments: [
      { filename: `BookingFlex-${reference}.pdf`, content: pdf, contentType: "application/pdf" },
      { filename: "qr.png", content: qrPng, contentType: "image/png", cid: "ticketqr" },
    ],
  };
}

module.exports = { buildTicketPdf, buildTicketEmail, pnrFor };
