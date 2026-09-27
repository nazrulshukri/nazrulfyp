import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check, Search, Phone } from "lucide-react";

// [iso, name, dial code, flag, min national digits, max national digits]
export const COUNTRIES = [
  ["MY", "Malaysia", "60", "🇲🇾", 9, 10],
  ["SG", "Singapore", "65", "🇸🇬", 8, 8],
  ["ID", "Indonesia", "62", "🇮🇩", 9, 12],
  ["TH", "Thailand", "66", "🇹🇭", 9, 9],
  ["BN", "Brunei", "673", "🇧🇳", 7, 7],
  ["PH", "Philippines", "63", "🇵🇭", 10, 10],
  ["VN", "Vietnam", "84", "🇻🇳", 9, 10],
  ["GB", "United Kingdom", "44", "🇬🇧", 10, 10],
  ["US", "United States / Canada", "1", "🇺🇸", 10, 10],
  ["AU", "Australia", "61", "🇦🇺", 9, 9],
  ["NZ", "New Zealand", "64", "🇳🇿", 8, 10],
  ["JP", "Japan", "81", "🇯🇵", 10, 10],
  ["KR", "South Korea", "82", "🇰🇷", 9, 10],
  ["CN", "China", "86", "🇨🇳", 11, 11],
  ["HK", "Hong Kong", "852", "🇭🇰", 8, 8],
  ["IN", "India", "91", "🇮🇳", 10, 10],
  ["AE", "United Arab Emirates", "971", "🇦🇪", 9, 9],
  ["SA", "Saudi Arabia", "966", "🇸🇦", 9, 9],
  ["QA", "Qatar", "974", "🇶🇦", 8, 8],
  ["TR", "Türkiye", "90", "🇹🇷", 10, 10],
  ["FR", "France", "33", "🇫🇷", 9, 9],
  ["DE", "Germany", "49", "🇩🇪", 10, 11],
  ["NL", "Netherlands", "31", "🇳🇱", 9, 9],
].map(([iso, name, dial, flag, min, max]) => ({ iso, name, dial, flag, min, max }));

const byIso = (iso) => COUNTRIES.find((c) => c.iso === iso) || COUNTRIES[0];
// Longest dial code first so "+673" (Brunei) wins over "+6x".
const BY_DIAL = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);

const digitsOnly = (s) => String(s || "").replace(/\D/g, "");

export function formatNational(national) {
  if (national.length <= 4) return national;
  const first = national.slice(0, 2);
  const rest = national.slice(2);
  const last = rest.slice(-4);
  const middle = rest.slice(0, -4);
  return [first, middle, last].filter(Boolean).join(" ");
}

/** Split any typed or stored number into { country, national }. */
export function parsePhone(raw, fallbackIso = "MY") {
  const text = String(raw || "").trim();
  let digits = digitsOnly(text);
  const international = text.startsWith("+") || text.startsWith("00");
  if (text.startsWith("00")) digits = digits.slice(2);
  if (international) {
    const match = BY_DIAL.find((c) => digits.startsWith(c.dial));
    if (match) return { country: match, national: digits.slice(match.dial.length) };
    return { country: byIso(fallbackIso), national: digits };
  }
  const current = byIso(fallbackIso);
  // Local format with a trunk "0" (e.g. 011-6100 7484 in Malaysia).
  if (digits.startsWith("0")) {
    const local = digits.slice(1);
    // A leading 01 is a Malaysian mobile, even if another country was picked.
    if (local.startsWith("1") && current.iso !== "MY" && local.length >= 9 && local.length <= 10)
      return { country: byIso("MY"), national: local };
    return { country: current, national: local };
  }
  // Digits typed with the country code but without "+".
  if (digits.length > current.max) {
    const match = BY_DIAL.find(
      (c) =>
        digits.startsWith(c.dial) &&
        digits.length - c.dial.length >= c.min &&
        digits.length - c.dial.length <= c.max,
    );
    if (match) return { country: match, national: digits.slice(match.dial.length) };
  }
  return { country: current, national: digits };
}

export function isValidPhone(value) {
  if (!value || !String(value).trim().startsWith("+")) return false;
  const { country, national } = parsePhone(value);
  return national.length >= country.min && national.length <= country.max;
}

const toValue = (country, national) =>
  national ? `+${country.dial} ${formatNational(national)}` : "";

export default function PhoneField({ id, label = "Mobile number", value, onChange, onBlur, error }) {
  const initial = useMemo(() => parsePhone(value, "MY"), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [country, setCountry] = useState(initial.country);
  const [national, setNational] = useState(initial.national);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [detected, setDetected] = useState(false);
  // Holds a partly typed "+code" until it matches a country.
  const [pending, setPending] = useState(null);
  const wrap = useRef(null);
  const input = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => wrap.current && !wrap.current.contains(e.target) && setOpen(false);
    const key = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  function commit(nextCountry, nextNational) {
    setCountry(nextCountry);
    setNational(nextNational.slice(0, nextCountry.max + 1));
    onChange(toValue(nextCountry, nextNational.slice(0, nextCountry.max + 1)));
  }

  function handleInput(e) {
    const raw = e.target.value.trim();
    if (raw.startsWith("+") || raw.startsWith("00")) {
      const digits = digitsOnly(raw.startsWith("00") ? raw.slice(2) : raw);
      const match = BY_DIAL.find((c) => digits.startsWith(c.dial));
      if (!match) {
        setPending(raw);
        return;
      }
    }
    setPending(null);
    const parsed = parsePhone(raw, country.iso);
    setDetected(parsed.country.iso !== country.iso);
    commit(parsed.country, parsed.national);
  }

  const valid = national.length >= country.min && national.length <= country.max;
  const list = COUNTRIES.filter((c) =>
    `${c.name} +${c.dial} ${c.iso}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const status = !national
    ? `${country.name} numbers have ${country.min === country.max ? country.min : `${country.min}–${country.max}`} digits after +${country.dial}`
    : valid
      ? `${country.name} number${detected ? " · detected automatically" : ""}`
      : national.length < country.min
        ? `${country.min - national.length} more digit${country.min - national.length === 1 ? "" : "s"} for ${country.name}`
        : `Too many digits for ${country.name}`;

  return (
    <div className={`bf26-input bf26-phone ${error ? "has-error" : ""}`} ref={wrap}>
      <label htmlFor={id}>{label}</label>
      <div>
        <button
          type="button"
          className="bf26-phone-country"
          aria-label={`Country code: ${country.name} +${country.dial}. Change country`}
          aria-expanded={open}
          onClick={(e) => {
            e.preventDefault();
            setOpen(!open);
          }}
        >
          <em>{country.flag}</em>
          <b>+{country.dial}</b>
          <ChevronDown size={14} />
        </button>
        <input
          ref={input}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={country.iso === "MY" ? "11-6100 7484 or 011-6100 7484" : "Phone number"}
          value={pending ?? formatNational(national)}
          onChange={handleInput}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (text) {
              e.preventDefault();
              handleInput({ target: { value: text } });
            }
          }}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={`${id}-status`}
        />
        {valid && <Check size={17} className="bf26-phone-ok" aria-hidden="true" />}
      </div>
      {error ? (
        <small role="alert" id={`${id}-status`}>
          {error}
        </small>
      ) : (
        <small className={`bf26-phone-status ${valid ? "is-valid" : ""}`} id={`${id}-status`}>
          <Phone size={12} /> {status}
        </small>
      )}
      {open && (
        <div className="bf26-pop bf26-phone-pop" role="listbox" aria-label="Choose country code">
          <div className="bf26-phone-search">
            <Search size={15} />
            <input
              autoFocus
              placeholder="Search country or code"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.preventDefault()}
            />
          </div>
          <div className="bf26-place-list">
            {list.map((c) => (
              <button
                type="button"
                role="option"
                aria-selected={c.iso === country.iso}
                key={c.iso}
                className={c.iso === country.iso ? "is-active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setDetected(false);
                  commit(c, national);
                  setOpen(false);
                  setQuery("");
                  input.current?.focus();
                }}
              >
                <span className="bf26-place-icon">
                  <em>{c.flag}</em>
                </span>
                <span className="bf26-place-text">
                  <strong>{c.name}</strong>
                </span>
                <b className="bf26-code">+{c.dial}</b>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
