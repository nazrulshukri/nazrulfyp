const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 36,
};

const COLORS = {
  ink: rgb(0.07, 0.09, 0.13),
  muted: rgb(0.38, 0.43, 0.50),
  line: rgb(0.86, 0.89, 0.93),
  navy: rgb(0.02, 0.15, 0.30),
  blue: rgb(0.00, 0.35, 0.70),
  paleBlue: rgb(0.91, 0.96, 1.00),
  green: rgb(0.02, 0.48, 0.28),
  paleGreen: rgb(0.91, 0.98, 0.94),
  white: rgb(1, 1, 1),
  paper: rgb(0.97, 0.98, 1),
  warning: rgb(0.98, 0.94, 0.84),
};

const logoPath = path.join(__dirname, "../img/assets/Booking1.png");

const asText = (value, fallback = "-") => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
};

const hasFlight = (flight) => Boolean(
  flight && (flight.flightNumber || flight.origin || flight.destination || flight.departure || flight.arrival)
);

const airportCode = (value, code) => {
  if (code) return asText(code).toUpperCase();
  const raw = asText(value, "").trim();
  if (!raw) return "---";
  const letters = raw.replace(/[^a-z]/gi, "").toUpperCase();
  return (letters.slice(0, 3) || raw.slice(0, 3).toUpperCase()).padEnd(3, "-");
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return asText(value);

  return new Intl.DateTimeFormat("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return asText(value);

  return new Intl.DateTimeFormat("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const formatMoney = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return asText(value);

  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(amount);
};

const truncate = (text, max = 52) => {
  const value = asText(text);
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
};

const drawText = (page, text, x, y, options = {}) => {
  page.drawText(asText(text), {
    x,
    y,
    size: options.size || 10,
    font: options.font,
    color: options.color || COLORS.ink,
  });
};

const drawLabel = (page, fonts, label, value, x, y, width = 120) => {
  drawText(page, label.toUpperCase(), x, y + 15, {
    size: 7.5,
    font: fonts.bold,
    color: COLORS.muted,
  });
  drawText(page, truncate(value, Math.floor(width / 5.5)), x, y, {
    size: 11,
    font: fonts.bold,
    color: COLORS.ink,
  });
};

const drawDashedLine = (page, x1, x2, y, color = COLORS.line) => {
  let x = x1;
  while (x < x2) {
    page.drawLine({
      start: { x, y },
      end: { x: Math.min(x + 6, x2), y },
      thickness: 1,
      color,
    });
    x += 11;
  }
};

const drawRouteCard = (page, fonts, flight, title, y, selectedSeats, isReturn = false) => {
  const x = PAGE.margin;
  const w = PAGE.width - PAGE.margin * 2;
  const h = 150;
  const accent = isReturn ? COLORS.green : COLORS.blue;
  const pale = isReturn ? COLORS.paleGreen : COLORS.paleBlue;
  const originCode = airportCode(flight?.origin, flight?.originCode);
  const destinationCode = airportCode(flight?.destination, flight?.destinationCode);

  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
  });

  page.drawRectangle({
    x,
    y: y + h - 34,
    width: w,
    height: 34,
    color: pale,
  });

  page.drawRectangle({
    x,
    y,
    width: 6,
    height: h,
    color: accent,
  });

  drawText(page, title.toUpperCase(), x + 18, y + h - 22, {
    size: 10,
    font: fonts.bold,
    color: accent,
  });
  drawText(page, `${asText(flight?.airline, "BookingFlex Air")}  |  ${asText(flight?.flightNumber)}`, x + 150, y + h - 22, {
    size: 10,
    font: fonts.bold,
    color: COLORS.ink,
  });

  drawText(page, originCode, x + 28, y + 78, {
    size: 32,
    font: fonts.bold,
    color: COLORS.ink,
  });
  drawText(page, truncate(flight?.origin, 24), x + 30, y + 60, {
    size: 9,
    font: fonts.regular,
    color: COLORS.muted,
  });
  drawText(page, formatTime(flight?.departure), x + 30, y + 42, {
    size: 12,
    font: fonts.bold,
    color: COLORS.ink,
  });
  drawText(page, formatDate(flight?.departure), x + 30, y + 27, {
    size: 9,
    font: fonts.regular,
    color: COLORS.muted,
  });

  page.drawLine({
    start: { x: x + 168, y: y + 91 },
    end: { x: x + 350, y: y + 91 },
    thickness: 1.4,
    color: accent,
  });
  page.drawCircle({ x: x + 174, y: y + 91, size: 4, color: accent });
  page.drawCircle({ x: x + 350, y: y + 91, size: 4, color: accent });
  drawText(page, "NONSTOP", x + 232, y + 104, {
    size: 8,
    font: fonts.bold,
    color: COLORS.muted,
  });
  drawText(page, asText(flight?.duration, "Duration TBC"), x + 226, y + 73, {
    size: 9,
    font: fonts.regular,
    color: COLORS.muted,
  });

  drawText(page, destinationCode, x + 382, y + 78, {
    size: 32,
    font: fonts.bold,
    color: COLORS.ink,
  });
  drawText(page, truncate(flight?.destination, 24), x + 384, y + 60, {
    size: 9,
    font: fonts.regular,
    color: COLORS.muted,
  });
  drawText(page, formatTime(flight?.arrival), x + 384, y + 42, {
    size: 12,
    font: fonts.bold,
    color: COLORS.ink,
  });
  drawText(page, formatDate(flight?.arrival), x + 384, y + 27, {
    size: 9,
    font: fonts.regular,
    color: COLORS.muted,
  });

  drawDashedLine(page, x + 18, x + w - 18, y + 18, COLORS.line);
  drawLabel(page, fonts, "Seat", selectedSeats || "-", x + 28, y - 3, 90);
  drawLabel(page, fonts, "Gate", isReturn ? "B7" : "A5", x + 120, y - 3, 60);
  drawLabel(page, fonts, "Boarding", isReturn ? "TBC" : "45 min before", x + 190, y - 3, 110);
  drawLabel(page, fonts, "Class", "Economy", x + 315, y - 3, 80);
  drawLabel(page, fonts, "Status", "Confirmed", x + 410, y - 3, 90);
};

const drawSummaryPanel = (page, fonts, data, qrImage) => {
  const {
    bookingId,
    paymentMethod,
    amount,
    passengerDetails,
    selectedSeats,
    selectedInsurance,
  } = data;
  const passengerName = `${asText(passengerDetails?.lastName, "Passenger")} / ${asText(passengerDetails?.firstName, "")}`.trim();
  const seats = Array.isArray(selectedSeats) && selectedSeats.length ? selectedSeats.join(", ") : "-";
  const insurance = selectedInsurance?.name || (selectedInsurance ? "Selected" : "Not selected");
  const x = PAGE.margin;
  const y = 590;
  const w = PAGE.width - PAGE.margin * 2;
  const h = 118;

  page.drawRectangle({
    x,
    y,
    width: w,
    height: h,
    color: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
  });

  drawText(page, "Passenger", x + 20, y + 88, {
    size: 8,
    font: fonts.bold,
    color: COLORS.muted,
  });
  drawText(page, truncate(passengerName, 38), x + 20, y + 68, {
    size: 18,
    font: fonts.bold,
    color: COLORS.ink,
  });
  drawText(page, asText(passengerDetails?.email, "Email not provided"), x + 20, y + 52, {
    size: 9,
    font: fonts.regular,
    color: COLORS.muted,
  });

  drawLabel(page, fonts, "Booking ID", bookingId, x + 20, y + 20, 145);
  drawLabel(page, fonts, "Payment", paymentMethod, x + 158, y + 20, 86);
  drawLabel(page, fonts, "Total paid", formatMoney(amount), x + 250, y + 20, 100);
  drawLabel(page, fonts, "Seats", seats, x + 356, y + 20, 74);

  page.drawRectangle({
    x: x + w - 116,
    y: y + 17,
    width: 92,
    height: 92,
    color: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
  });

  if (qrImage) {
    page.drawImage(qrImage, {
      x: x + w - 108,
      y: y + 25,
      width: 76,
      height: 76,
    });
  } else {
    drawText(page, "QR", x + w - 83, y + 58, {
      size: 18,
      font: fonts.bold,
      color: COLORS.muted,
    });
  }

  drawText(page, `Insurance: ${truncate(insurance, 46)}`, x + 20, y + 7, {
    size: 8,
    font: fonts.regular,
    color: COLORS.muted,
  });
};

const drawHeader = async (pdfDoc, page, fonts, bookingId) => {
  page.drawRectangle({
    x: 0,
    y: 735,
    width: PAGE.width,
    height: 107,
    color: COLORS.navy,
  });

  page.drawRectangle({
    x: 0,
    y: 726,
    width: PAGE.width,
    height: 9,
    color: COLORS.blue,
  });

  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      const logo = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logo, {
        x: PAGE.margin,
        y: 768,
        width: 68,
        height: 48,
      });
    } catch (error) {
      drawText(page, "BookingFlex", PAGE.margin, 790, {
        size: 18,
        font: fonts.bold,
        color: COLORS.white,
      });
    }
  } else {
    drawText(page, "BookingFlex", PAGE.margin, 790, {
      size: 18,
      font: fonts.bold,
      color: COLORS.white,
    });
  }

  drawText(page, "E-TICKET & BOARDING PASS", 128, 795, {
    size: 18,
    font: fonts.bold,
    color: COLORS.white,
  });
  drawText(page, "Present this document at airport check-in and security.", 128, 775, {
    size: 10,
    font: fonts.regular,
    color: rgb(0.78, 0.87, 1),
  });
  drawText(page, `Booking ${asText(bookingId)}`, 420, 795, {
    size: 10,
    font: fonts.bold,
    color: rgb(0.78, 0.87, 1),
  });

  page.drawRectangle({
    x: 420,
    y: 762,
    width: 122,
    height: 24,
    color: COLORS.green,
  });
  drawText(page, "CONFIRMED", 450, 769, {
    size: 10,
    font: fonts.bold,
    color: COLORS.white,
  });
};

const drawTravelNotes = (page, fonts) => {
  const x = PAGE.margin;
  const y = 54;
  const w = PAGE.width - PAGE.margin * 2;

  page.drawRectangle({
    x,
    y,
    width: w,
    height: 58,
    color: COLORS.warning,
    borderColor: rgb(0.90, 0.77, 0.45),
    borderWidth: 1,
  });

  drawText(page, "Travel reminders", x + 14, y + 38, {
    size: 10,
    font: fonts.bold,
    color: COLORS.ink,
  });
  drawText(page, "Arrive at the airport at least 3 hours before international departure. Bring passport, visa documents, and payment card used for booking.", x + 14, y + 22, {
    size: 8.6,
    font: fonts.regular,
    color: COLORS.ink,
  });
  drawText(page, "Baggage allowance and gate may change. Always verify the latest airport screens before boarding.", x + 14, y + 10, {
    size: 8.6,
    font: fonts.regular,
    color: COLORS.ink,
  });
};

const buildQrImage = async (pdfDoc, ticketData) => {
  try {
    const qrPayload = [
      `Booking:${asText(ticketData.bookingId)}`,
      `Passenger:${asText(ticketData.passengerDetails?.lastName)} ${asText(ticketData.passengerDetails?.firstName)}`,
      `Outbound:${asText(ticketData.outboundFlight?.flightNumber)} ${asText(ticketData.outboundFlight?.origin)}-${asText(ticketData.outboundFlight?.destination)}`,
      hasFlight(ticketData.returnFlight)
        ? `Return:${asText(ticketData.returnFlight?.flightNumber)} ${asText(ticketData.returnFlight?.origin)}-${asText(ticketData.returnFlight?.destination)}`
        : "Return:None",
    ].join("\n");
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 240 });
    const base64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    return pdfDoc.embedPng(Buffer.from(base64, "base64"));
  } catch (error) {
    return null;
  }
};

const generatePDF = async (ticketData = {}) => {
  const {
    bookingId,
    outboundFlight = {},
    returnFlight,
    selectedSeats = [],
  } = ticketData;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([PAGE.width, PAGE.height]);
  const fonts = {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
  };
  const qrImage = await buildQrImage(pdfDoc, ticketData);
  const seats = Array.isArray(selectedSeats) && selectedSeats.length ? selectedSeats.join(", ") : "-";

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE.width,
    height: PAGE.height,
    color: COLORS.paper,
  });

  await drawHeader(pdfDoc, page, fonts, bookingId);
  drawSummaryPanel(page, fonts, ticketData, qrImage);
  drawRouteCard(page, fonts, outboundFlight, "Departure flight", 390, seats, false);

  if (hasFlight(returnFlight)) {
    drawRouteCard(page, fonts, returnFlight, "Return flight", 202, seats, true);
  } else {
    page.drawRectangle({
      x: PAGE.margin,
      y: 242,
      width: PAGE.width - PAGE.margin * 2,
      height: 76,
      color: COLORS.white,
      borderColor: COLORS.line,
      borderWidth: 1,
    });
    drawText(page, "One-way itinerary", PAGE.margin + 20, 286, {
      size: 14,
      font: fonts.bold,
      color: COLORS.ink,
    });
    drawText(page, "No return flight is attached to this booking.", PAGE.margin + 20, 266, {
      size: 10,
      font: fonts.regular,
      color: COLORS.muted,
    });
  }

  page.drawRectangle({
    x: PAGE.margin,
    y: 128,
    width: PAGE.width - PAGE.margin * 2,
    height: 52,
    color: COLORS.white,
    borderColor: COLORS.line,
    borderWidth: 1,
  });
  drawLabel(page, fonts, "Check-in counter", "5", PAGE.margin + 18, 145, 110);
  drawLabel(page, fonts, "Baggage", "1 x 32kg checked / 7kg cabin", PAGE.margin + 140, 145, 170);
  drawLabel(page, fonts, "Document check", "Required", PAGE.margin + 330, 145, 100);
  drawLabel(page, fonts, "Issued", formatDate(new Date()), PAGE.margin + 432, 145, 80);

  drawTravelNotes(page, fonts);

  drawText(page, "BookingFlex customer support: Bookingflex@flex.com.my | (+60)011-6100-7484", PAGE.margin, 28, {
    size: 8.5,
    font: fonts.regular,
    color: COLORS.muted,
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

module.exports = generatePDF;
