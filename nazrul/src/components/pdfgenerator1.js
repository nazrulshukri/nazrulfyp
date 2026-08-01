import jsPDF from "jspdf";
import QRCode from "qrcode";

const colors = {
  navy: [5, 38, 76],
  blue: [0, 88, 168],
  green: [0, 126, 75],
  ink: [18, 24, 38],
  muted: [92, 105, 122],
  line: [218, 226, 236],
  paper: [247, 250, 255],
  paleBlue: [232, 244, 255],
  paleGreen: [231, 248, 239],
  warning: [252, 242, 215],
};

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

const truncate = (text, max = 34) => {
  const value = asText(text);
  return value.length > max ? `${value.slice(0, max - 1)}...` : value;
};

const setColor = (pdf, color) => pdf.setTextColor(color[0], color[1], color[2]);
const setFill = (pdf, color) => pdf.setFillColor(color[0], color[1], color[2]);
const setDraw = (pdf, color) => pdf.setDrawColor(color[0], color[1], color[2]);

const labelValue = (pdf, label, value, x, y, max = 24) => {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  setColor(pdf, colors.muted);
  pdf.text(label.toUpperCase(), x, y);

  pdf.setFontSize(10.5);
  setColor(pdf, colors.ink);
  pdf.text(truncate(value, max), x, y + 5.5);
};

const dashedLine = (pdf, x1, x2, y) => {
  setDraw(pdf, colors.line);
  for (let x = x1; x < x2; x += 5) {
    pdf.line(x, y, Math.min(x + 2.8, x2), y);
  }
};

const drawHeader = (pdf, bookingId) => {
  setFill(pdf, colors.navy);
  pdf.rect(0, 0, 210, 34, "F");
  setFill(pdf, colors.blue);
  pdf.rect(0, 34, 210, 3, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  setColor(pdf, [255, 255, 255]);
  pdf.text("BookingFlex", 14, 17);

  pdf.setFontSize(13);
  pdf.text("E-TICKET & BOARDING PASS", 58, 15);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  setColor(pdf, [196, 219, 255]);
  pdf.text("Present this document at check-in and security.", 58, 23);
  pdf.text(`Booking ${asText(bookingId)}`, 156, 15);

  setFill(pdf, colors.green);
  pdf.rect(158, 20, 34, 8, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  setColor(pdf, [255, 255, 255]);
  pdf.text("CONFIRMED", 164, 25.5);
};

const drawSummary = (pdf, data, qrDataUrl) => {
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

  setFill(pdf, [255, 255, 255]);
  setDraw(pdf, colors.line);
  pdf.rect(14, 45, 182, 45, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.5);
  setColor(pdf, colors.muted);
  pdf.text("PASSENGER", 20, 56);

  pdf.setFontSize(15);
  setColor(pdf, colors.ink);
  pdf.text(truncate(passengerName, 34), 20, 65);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  setColor(pdf, colors.muted);
  pdf.text(truncate(passengerDetails?.email || "Email not provided", 42), 20, 72);

  labelValue(pdf, "Booking ID", bookingId, 20, 82, 20);
  labelValue(pdf, "Payment", paymentMethod, 60, 82, 14);
  labelValue(pdf, "Paid", formatMoney(amount), 92, 82, 16);
  labelValue(pdf, "Seats", seats, 130, 82, 16);

  setFill(pdf, [255, 255, 255]);
  setDraw(pdf, colors.line);
  pdf.rect(166, 54, 22, 22, "FD");
  if (qrDataUrl) {
    pdf.addImage(qrDataUrl, "PNG", 168, 56, 18, 18);
  }

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  setColor(pdf, colors.muted);
  pdf.text(`Insurance: ${truncate(insurance, 40)}`, 20, 88);
};

const drawFlightCard = (pdf, flight, title, y, seats, isReturn = false) => {
  const accent = isReturn ? colors.green : colors.blue;
  const pale = isReturn ? colors.paleGreen : colors.paleBlue;
  const originCode = airportCode(flight?.origin, flight?.originCode);
  const destinationCode = airportCode(flight?.destination, flight?.destinationCode);

  setFill(pdf, [255, 255, 255]);
  setDraw(pdf, colors.line);
  pdf.rect(14, y, 182, 55, "FD");

  setFill(pdf, pale);
  pdf.rect(14, y, 182, 11, "F");
  setFill(pdf, accent);
  pdf.rect(14, y, 2.5, 55, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  setColor(pdf, accent);
  pdf.text(title.toUpperCase(), 21, y + 7);

  pdf.setFontSize(8.5);
  setColor(pdf, colors.ink);
  pdf.text(`${truncate(flight?.airline || "BookingFlex Air", 22)} | ${asText(flight?.flightNumber)}`, 70, y + 7);

  pdf.setFontSize(22);
  pdf.text(originCode, 24, y + 28);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  setColor(pdf, colors.muted);
  pdf.text(truncate(flight?.origin, 18), 24, y + 35);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  setColor(pdf, colors.ink);
  pdf.text(formatTime(flight?.departure), 24, y + 43);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  setColor(pdf, colors.muted);
  pdf.text(formatDate(flight?.departure), 24, y + 49);

  setDraw(pdf, accent);
  pdf.line(76, y + 29, 132, y + 29);
  setFill(pdf, accent);
  pdf.circle(78, y + 29, 1.2, "F");
  pdf.circle(132, y + 29, 1.2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  setColor(pdf, colors.muted);
  pdf.text("NONSTOP", 94, y + 25);
  pdf.setFont("helvetica", "normal");
  pdf.text(asText(flight?.duration, "Duration TBC"), 92, y + 35);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  setColor(pdf, colors.ink);
  pdf.text(destinationCode, 144, y + 28);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  setColor(pdf, colors.muted);
  pdf.text(truncate(flight?.destination, 18), 144, y + 35);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  setColor(pdf, colors.ink);
  pdf.text(formatTime(flight?.arrival), 144, y + 43);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  setColor(pdf, colors.muted);
  pdf.text(formatDate(flight?.arrival), 144, y + 49);

  dashedLine(pdf, 22, 188, y + 59);
  labelValue(pdf, "Seat", seats, 24, y + 67, 12);
  labelValue(pdf, "Gate", isReturn ? "B7" : "A5", 55, y + 67, 8);
  labelValue(pdf, "Boarding", isReturn ? "TBC" : "45 min before", 78, y + 67, 18);
  labelValue(pdf, "Class", "Economy", 122, y + 67, 12);
  labelValue(pdf, "Status", "Confirmed", 154, y + 67, 12);
};

const drawNotes = (pdf) => {
  setFill(pdf, colors.warning);
  setDraw(pdf, [226, 191, 107]);
  pdf.rect(14, 264, 182, 18, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  setColor(pdf, colors.ink);
  pdf.text("Travel reminders", 19, 271);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.text("Arrive at least 3 hours before international departure. Bring passport, visa documents, and payment card.", 19, 276);
};

const generatePDF = async (ticketData = {}) => {
  const {
    bookingId,
    outboundFlight = {},
    returnFlight,
    selectedSeats = [],
  } = ticketData;
  const seats = Array.isArray(selectedSeats) && selectedSeats.length ? selectedSeats.join(", ") : "-";

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  setFill(pdf, colors.paper);
  pdf.rect(0, 0, 210, 297, "F");

  const qrPayload = [
    `Booking:${asText(bookingId)}`,
    `Outbound:${asText(outboundFlight?.flightNumber)} ${asText(outboundFlight?.origin)}-${asText(outboundFlight?.destination)}`,
    hasFlight(returnFlight)
      ? `Return:${asText(returnFlight?.flightNumber)} ${asText(returnFlight?.origin)}-${asText(returnFlight?.destination)}`
      : "Return:None",
  ].join("\n");

  const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 180 });

  drawHeader(pdf, bookingId);
  drawSummary(pdf, ticketData, qrDataUrl);
  drawFlightCard(pdf, outboundFlight, "Departure flight", 104, seats, false);

  if (hasFlight(returnFlight)) {
    drawFlightCard(pdf, returnFlight, "Return flight", 176, seats, true);
  } else {
    setFill(pdf, [255, 255, 255]);
    setDraw(pdf, colors.line);
    pdf.rect(14, 185, 182, 28, "FD");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    setColor(pdf, colors.ink);
    pdf.text("One-way itinerary", 22, 198);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    setColor(pdf, colors.muted);
    pdf.text("No return flight is attached to this booking.", 22, 207);
  }

  drawNotes(pdf);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7.5);
  setColor(pdf, colors.muted);
  pdf.text("BookingFlex customer support: Bookingflex@flex.com.my | (+60)011-6100-7484", 14, 288);

  pdf.save(`Bookingflex_${asText(bookingId, "ticket")}.pdf`);
};

export default generatePDF;
