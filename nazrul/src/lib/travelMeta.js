// Display helpers shared by the flight, train and home pages.

const AIRLINES = [
  [/malaysia/i, "MH", "#0b2d6b"],
  [/british/i, "BA", "#075aaa"],
  [/emirates/i, "EK", "#d71a21"],
  [/singapore/i, "SQ", "#f5a300"],
  [/qatar/i, "QR", "#5c0632"],
  [/turkish/i, "TK", "#c8102e"],
  [/cathay/i, "CX", "#006564"],
  [/etihad/i, "EY", "#b08a4b"],
  [/saudia/i, "SV", "#006c35"],
  [/nippon|ana\b/i, "NH", "#13448f"],
  [/air france/i, "AF", "#002157"],
  [/air india/i, "AI", "#da0e29"],
  [/biman/i, "BG", "#0b7a3e"],
  [/china southern/i, "CZ", "#1b4fa0"],
  [/finnair/i, "AY", "#0b1560"],
  [/klm/i, "KL", "#00a1de"],
  [/korean/i, "KE", "#1d8fd1"],
  [/kuwait/i, "KU", "#0a4b8c"],
  [/oman/i, "WY", "#8a6d3b"],
  [/thai/i, "TG", "#51127f"],
  [/airasia/i, "AK", "#e3000f"],
];

export const airlineLogoUrl = (code) =>
  `https://www.gstatic.com/flights/airline_logos/70px/${code}.png`;

export function airlineMeta(name = "") {
  const match = AIRLINES.find(([pattern]) => pattern.test(name));
  if (match) return { code: match[1], color: match[2], logo: airlineLogoUrl(match[1]) };
  const initials = name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return { code: initials || "✈", color: "#183c3c" };
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

export function airportMeta(value = "") {
  const match = AIRPORTS.find(([pattern]) => pattern.test(value));
  if (match) return { code: match[1], city: match[2] };
  const city = value.replace(/ International Airport.*| Airport.*|\s*\(.*\)/g, "");
  return { code: city.slice(0, 3).toUpperCase(), city };
}

export function formatDay(value, options = {}) {
  if (!value) return "";
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    ...options,
  });
}

export function shiftDate(value, days) {
  const date = new Date(`${value}T00:00:00`);
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Deterministic "indicative" fare so the date strip is stable between renders.
export function indicativeFare(base, date) {
  const seed = date.split("-").reduce((sum, part) => sum * 31 + Number(part), 7);
  const swing = ((seed % 23) - 9) / 100;
  const weekday = new Date(`${date}T00:00:00`).getDay();
  const weekend = weekday === 5 || weekday === 6 ? 0.08 : 0;
  return Math.round(base * (1 + swing + weekend));
}

export function minutesToLabel(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${String(m).padStart(2, "0")}m` : `${h}h`;
}
