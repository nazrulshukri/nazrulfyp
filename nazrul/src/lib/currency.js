// Display currency for the whole site. Every price in the app is stored in
// MYR; this converts it for display only (bookings are still charged in MYR).
// The currency is picked from the visitor's location (the country Vercel
// reports for their IP, else their device time zone) until they choose one.
import { useSyncExternalStore } from "react";
import { API_BASE } from "./apiConfig";

export const CURRENCIES = [
  { code: "MYR", name: "Malaysian ringgit", flag: "🇲🇾" },
  { code: "USD", name: "US dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British pound", flag: "🇬🇧" },
  { code: "SGD", name: "Singapore dollar", flag: "🇸🇬" },
  { code: "BND", name: "Brunei dollar", flag: "🇧🇳" },
  { code: "IDR", name: "Indonesian rupiah", flag: "🇮🇩" },
  { code: "THB", name: "Thai baht", flag: "🇹🇭" },
  { code: "PHP", name: "Philippine peso", flag: "🇵🇭" },
  { code: "VND", name: "Vietnamese dong", flag: "🇻🇳" },
  { code: "JPY", name: "Japanese yen", flag: "🇯🇵" },
  { code: "KRW", name: "South Korean won", flag: "🇰🇷" },
  { code: "CNY", name: "Chinese yuan", flag: "🇨🇳" },
  { code: "HKD", name: "Hong Kong dollar", flag: "🇭🇰" },
  { code: "TWD", name: "New Taiwan dollar", flag: "🇹🇼" },
  { code: "INR", name: "Indian rupee", flag: "🇮🇳" },
  { code: "AED", name: "UAE dirham", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi riyal", flag: "🇸🇦" },
  { code: "QAR", name: "Qatari riyal", flag: "🇶🇦" },
  { code: "TRY", name: "Turkish lira", flag: "🇹🇷" },
  { code: "CHF", name: "Swiss franc", flag: "🇨🇭" },
  { code: "AUD", name: "Australian dollar", flag: "🇦🇺" },
  { code: "NZD", name: "New Zealand dollar", flag: "🇳🇿" },
  { code: "CAD", name: "Canadian dollar", flag: "🇨🇦" },
];
const SUPPORTED = new Set(CURRENCIES.map((c) => c.code));

// Approximate MYR rates (Nov 2026), used until live rates arrive.
const FALLBACK_RATES = {
  MYR: 1, USD: 0.2464, EUR: 0.2201, GBP: 0.1836, SGD: 0.3154, BND: 0.3154, IDR: 4454, THB: 8.251,
  PHP: 15.56, VND: 6480, JPY: 38.91, KRW: 331.8, CNY: 1.644, HKD: 1.932, TWD: 7.9, INR: 23.14,
  AED: 0.905, SAR: 0.924, QAR: 0.897, TRY: 12.35, CHF: 0.2017, AUD: 0.3574, NZD: 0.4389, CAD: 0.3474,
};

const EURO = "AT BE CY DE EE ES FI FR GR HR IE IT LT LU LV MT NL PT SI SK".split(" ");
const COUNTRY_CURRENCY = {
  MY: "MYR", US: "USD", GB: "GBP", SG: "SGD", BN: "BND", ID: "IDR", TH: "THB", PH: "PHP", VN: "VND",
  JP: "JPY", KR: "KRW", CN: "CNY", HK: "HKD", MO: "HKD", TW: "TWD", IN: "INR", AE: "AED", SA: "SAR",
  QA: "QAR", TR: "TRY", CH: "CHF", LI: "CHF", AU: "AUD", NZ: "NZD", CA: "CAD",
  ...Object.fromEntries(EURO.map((c) => [c, "EUR"])),
};

const ZONE_COUNTRY = {
  "Asia/Kuala_Lumpur": "MY", "Asia/Kuching": "MY", "Asia/Singapore": "SG", "Asia/Brunei": "BN",
  "Asia/Jakarta": "ID", "Asia/Pontianak": "ID", "Asia/Makassar": "ID", "Asia/Jayapura": "ID",
  "Asia/Bangkok": "TH", "Asia/Manila": "PH", "Asia/Ho_Chi_Minh": "VN", "Asia/Saigon": "VN",
  "Asia/Tokyo": "JP", "Asia/Seoul": "KR", "Asia/Shanghai": "CN", "Asia/Chongqing": "CN",
  "Asia/Urumqi": "CN", "Asia/Hong_Kong": "HK", "Asia/Macau": "MO", "Asia/Taipei": "TW",
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Asia/Dubai": "AE", "Asia/Riyadh": "SA",
  "Asia/Qatar": "QA", "Europe/Istanbul": "TR", "Europe/Zurich": "CH", "Europe/London": "GB",
  "Pacific/Auckland": "NZ", "America/Toronto": "CA", "America/Vancouver": "CA",
  "America/Edmonton": "CA", "America/Winnipeg": "CA", "America/Halifax": "CA",
};

export function countryFromTimeZone(zone) {
  if (!zone) return null;
  if (ZONE_COUNTRY[zone]) return ZONE_COUNTRY[zone];
  if (zone.startsWith("Australia/")) return "AU";
  if (/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit)|^Pacific\/Honolulu/.test(zone)) return "US";
  return null;
}

export function currencyForCountry(country) {
  if (!country) return null;
  return COUNTRY_CURRENCY[country.toUpperCase()] || "USD";
}

const STORAGE_KEY = "bookingflexCurrency";
const read = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

let state = {
  code: SUPPORTED.has(read()) ? read() : "MYR",
  chosen: SUPPORTED.has(read()), // the visitor picked it themselves
  rates: FALLBACK_RATES,
  live: false,
  updated: null,
  country: null,
};
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());
const update = (patch) => {
  state = { ...state, ...patch };
  emit();
};

export const getCurrency = () => state;
export function subscribeCurrency(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
/** Re-renders the calling component when the currency or rates change. */
export const useCurrency = () => useSyncExternalStore(subscribeCurrency, getCurrency, getCurrency);

export function setCurrency(code) {
  if (!SUPPORTED.has(code)) return;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* private mode: keep it for this visit */
  }
  update({ code, chosen: true });
}

/** Go back to the currency for the visitor's location. */
export function resetCurrencyToLocation() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  update({ chosen: false, code: detectedCode() });
}

function detectedCode() {
  let zone = null;
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    /* ignore */
  }
  const country = state.country || countryFromTimeZone(zone);
  return currencyForCountry(country) || "MYR";
}

/** MYR amount -> amount in the display currency. */
export function convert(amountMyr, code = state.code) {
  const rate = state.rates[code] ?? FALLBACK_RATES[code] ?? 1;
  return Number(amountMyr) * rate;
}

const formatters = new Map();
function formatterFor(code, whole) {
  const key = `${code}:${whole}`;
  if (!formatters.has(key)) {
    const options = { style: "currency", currency: code, currencyDisplay: "narrowSymbol" };
    if (whole) options.maximumFractionDigits = 0;
    const locale = code === "MYR" ? "en-MY" : "en";
    let f;
    try {
      f = new Intl.NumberFormat(locale, options);
    } catch {
      f = new Intl.NumberFormat(locale, { ...options, currencyDisplay: "symbol" });
    }
    formatters.set(key, f);
  }
  return formatters.get(key);
}

/**
 * Formats an MYR amount in the display currency. `whole` drops the cents
 * (for "from" prices). MYR keeps its familiar "RM" style.
 */
export function formatPrice(amountMyr, { whole = false, code = state.code } = {}) {
  const value = Number(amountMyr);
  if (!Number.isFinite(value)) return amountMyr || "-";
  if (code === "MYR") {
    const n = value.toLocaleString("en-MY", whole ? { maximumFractionDigits: 0 } : { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `RM ${n}`;
  }
  return formatterFor(code, whole).format(convert(value, code));
}

/** "Charged as RM 1,234.00" when showing another currency, else "". */
export function chargeNote(amountMyr) {
  if (state.code === "MYR") return "";
  return `Charged as ${formatPrice(amountMyr, { code: "MYR" })}`;
}

let started = false;
/** Loads live rates and the visitor's country once per page load. */
export async function initCurrency() {
  if (started) return;
  started = true;
  if (!state.chosen) update({ code: detectedCode() });
  try {
    const res = await fetch(`${API_BASE}/rates`);
    if (!res.ok) throw new Error(`rates ${res.status}`);
    const body = await res.json();
    const rates = { ...FALLBACK_RATES, ...(body.rates || {}), MYR: 1 };
    update({ rates, live: true, updated: body.updated || null, country: body.country || null });
    if (!state.chosen) update({ code: detectedCode() });
  } catch {
    /* keep the built-in rates */
  }
}
