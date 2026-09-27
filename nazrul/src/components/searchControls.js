import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Plane,
  TrainFront,
  Building2,
  MapPin,
  User,
  Baby,
  Smile,
  Users,
  X,
  CalendarDays,
  Search,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Shared: close a popover when clicking outside or pressing Escape.   */
/* ------------------------------------------------------------------ */
function useDismiss(open, onClose, ref) {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, ref]);
}

/* ------------------------------------------------------------------ */
/* Place picker: airports, stations or cities with type-ahead search.  */
/* ------------------------------------------------------------------ */
const KIND_ICON = { airport: Plane, station: TrainFront, city: Building2 };

export function PlacePicker({
  label,
  hint,
  value,
  onChange,
  options,
  kind = "airport",
  placeholder,
  ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrap = useRef(null);
  const input = useRef(null);
  const listId = useId();
  useDismiss(open, () => setOpen(false), wrap);

  const selected = options.find((o) => o.value === value);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      [o.value, o.code, o.city, o.country, o.name]
        .filter(Boolean)
        .some((f) => f.toLowerCase().includes(q)),
    );
  }, [options, query]);

  useEffect(() => setActive(0), [query, open]);

  function choose(option) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      e.preventDefault();
      return;
    }
    if (e.key === "ArrowDown") {
      setActive((i) => Math.min(results.length - 1, i + 1));
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setActive((i) => Math.max(0, i - 1));
      e.preventDefault();
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      if (results[active]) choose(results[active]);
      else if (query.trim()) {
        onChange(query.trim());
        setOpen(false);
      }
    }
  }

  const Icon = KIND_ICON[kind] || MapPin;
  const display = open ? query : selected ? selected.city || selected.name : value;

  return (
    <div className={`bf-field bf26-place ${open ? "is-open" : ""}`} ref={wrap}>
      <span>{label}</span>
      <div className="bf26-place-input">
        {selected?.code && !open && <b className="bf26-code">{selected.code}</b>}
        <input
          ref={input}
          aria-label={ariaLabel || label}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={display || ""}
          placeholder={open ? "Type a city, airport or code" : placeholder}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
        />
      </div>
      <small>{selected ? `${selected.name}${selected.country ? ` · ${selected.country}` : ""}` : hint}</small>

      {open && (
        <div className="bf26-pop bf26-place-pop" role="listbox" id={listId}>
          <div className="bf26-pop-head">
            <Search size={14} />
            <span>{query ? `${results.length} matches` : kind === "station" ? "Popular stations" : kind === "city" ? "Popular cities" : "Popular airports"}</span>
          </div>
          <div className="bf26-place-list">
            {results.map((o, i) => (
              <button
                type="button"
                role="option"
                aria-selected={o.value === value}
                key={o.value}
                className={`${i === active ? "is-active" : ""} ${o.value === value ? "is-selected" : ""}`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(o)}
              >
                <span className="bf26-place-icon">
                  {o.flag ? <em>{o.flag}</em> : <Icon size={17} />}
                </span>
                <span className="bf26-place-text">
                  <strong>{o.city || o.name}</strong>
                  <small>
                    {o.name}
                    {o.country ? ` · ${o.country}` : ""}
                  </small>
                </span>
                {o.code && <b className="bf26-code">{o.code}</b>}
              </button>
            ))}
            {results.length === 0 && (
              <div className="bf26-place-empty">
                No matches for “{query}”. Press Enter to search it anyway.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Date range picker                                                   */
/* ------------------------------------------------------------------ */
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => (s ? new Date(`${s}T00:00:00`) : null);
const WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday first
  const days = new Date(year, month + 1, 0).getDate();
  const cells = Array(offset).fill(null);
  for (let d = 1; d <= days; d += 1) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

const fmtField = (s) =>
  s
    ? parse(s).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })
    : "";

export function DateRangeFields({
  start,
  end,
  onChange,
  min,
  range = true,
  labels = ["DEPARTURE", "RETURN"],
  hints = ["Start your journey", "Head back home"],
  nightsLabel = false,
  minGap = 0,
}) {
  const [open, setOpen] = useState(null); // "start" | "end" | null
  const [hover, setHover] = useState(null);
  const wrap = useRef(null);
  const today = parse(min);
  const base = parse(start) || today;
  const [view, setView] = useState(new Date(base.getFullYear(), base.getMonth(), 1));
  useDismiss(!!open, () => setOpen(null), wrap);

  useEffect(() => {
    if (open) {
      const b = parse(open === "end" && end ? end : start) || today;
      setView(new Date(b.getFullYear(), b.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function pick(day) {
    const value = iso(day);
    if (!range || open === "start" || !start || value < start || (minGap && value === start)) {
      const keepEnd = range && end && end > value ? end : "";
      onChange(value, keepEnd);
      if (range) setOpen("end");
      else setOpen(null);
    } else {
      onChange(start, value);
      setOpen(null);
    }
  }

  const months = [view, new Date(view.getFullYear(), view.getMonth() + 1, 1)];
  const previewEnd = open === "end" && start && hover && hover > start ? hover : end;
  const nights =
    start && end ? Math.round((parse(end) - parse(start)) / 86400000) : 0;
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1);

  const field = (which, label, hint, value) => (
    <button
      type="button"
      className={`bf-field bf26-date-field ${open === which ? "is-open" : ""}`}
      onClick={() => setOpen(open === which ? null : which)}
      aria-label={`${label}: ${value ? fmtField(value) : "choose a date"}`}
    >
      <span>{label}</span>
      <strong className={value ? "" : "is-empty"}>
        <CalendarDays size={16} /> {value ? fmtField(value) : "Add date"}
      </strong>
      <small>{hint}</small>
    </button>
  );

  return (
    <div className={`bf26-dates ${range ? "" : "is-single"}`} ref={wrap}>
      {field("start", labels[0], hints[0], start)}
      {range && field("end", labels[1], hints[1], end)}
      {open && (
        <div className="bf26-pop bf26-cal-pop" role="dialog" aria-label="Choose dates">
          <div className="bf26-cal-top">
            <div className="bf26-cal-tabs">
              <button
                type="button"
                className={open === "start" ? "is-active" : ""}
                onClick={() => setOpen("start")}
              >
                <small>{labels[0]}</small>
                {start ? fmtField(start) : "Add date"}
              </button>
              {range && (
                <button
                  type="button"
                  className={open === "end" ? "is-active" : ""}
                  onClick={() => setOpen("end")}
                >
                  <small>{labels[1]}</small>
                  {end ? fmtField(end) : "Add date"}
                </button>
              )}
            </div>
            <div className="bf26-cal-nav">
              <button
                type="button"
                aria-label="Previous month"
                disabled={!canPrev}
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="bf26-cal-months" onMouseLeave={() => setHover(null)}>
            {months.map((m, mi) => (
              <div className={`bf26-cal-month ${mi ? "is-second" : ""}`} key={m.toISOString()}>
                <h4>{m.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h4>
                <div className="bf26-cal-grid">
                  {WEEK.map((w) => (
                    <i key={w}>{w}</i>
                  ))}
                  {monthGrid(m.getFullYear(), m.getMonth()).map((day, i) => {
                    if (!day) return <span key={`e${i}`} />;
                    const v = iso(day);
                    const disabled =
                      v < min ||
                      (open === "end" && range && start && (v < start || (minGap > 0 && v === start)));
                    const isStart = v === start;
                    const isEnd = v === previewEnd;
                    const inRange = range && start && previewEnd && v > start && v < previewEnd;
                    return (
                      <button
                        type="button"
                        key={v}
                        disabled={disabled}
                        onMouseEnter={() => setHover(v)}
                        onClick={() => pick(day)}
                        className={[
                          isStart && "is-start",
                          isEnd && "is-end",
                          inRange && "is-range",
                          v === min && "is-today",
                          (day.getDay() === 0 || day.getDay() === 6) && "is-weekend",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        aria-label={day.toDateString()}
                        aria-pressed={isStart || isEnd}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="bf26-cal-foot">
            <span>
              {range && start && end
                ? `${fmtField(start)} → ${fmtField(end)} · ${nights} ${nightsLabel ? (nights === 1 ? "night" : "nights") : nights === 1 ? "day" : "days"}`
                : open === "end"
                  ? `Now choose your ${labels[1].toLowerCase()} date`
                  : `Choose your ${labels[0].toLowerCase()} date`}
            </span>
            <div>
              {(start || end) && (
                <button type="button" className="bf26-link" onClick={() => onChange("", "")}>
                  Clear
                </button>
              )}
              <button type="button" className="bf26-cal-done" onClick={() => setOpen(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Travellers picker                                                   */
/* ------------------------------------------------------------------ */
const ROWS = [
  ["adults", "Adults", "Age 12+", User],
  ["children", "Children", "Age 2–11", Smile],
  ["infants", "Infants", "Under 2, on lap", Baby],
];

export function TravellersPicker({ value, onChange, noun = "traveller" }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  useDismiss(open, () => setOpen(false), wrap);
  const total = value.adults + value.children + value.infants;

  const limits = {
    adults: [1, 9 - value.children - value.infants],
    children: [0, 9 - value.adults - value.infants],
    infants: [0, Math.min(value.adults, 9 - value.adults - value.children)],
  };
  const step = (key, delta) => onChange((v) => ({ ...v, [key]: v[key] + delta }));
  const summary = [
    `${value.adults} adult${value.adults > 1 ? "s" : ""}`,
    value.children && `${value.children} child${value.children > 1 ? "ren" : ""}`,
    value.infants && `${value.infants} infant${value.infants > 1 ? "s" : ""}`,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bf26-trav" ref={wrap}>
      <button
        type="button"
        className={`bf26-trav-btn ${open ? "is-open" : ""}`}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <Users size={17} />
        <span>
          <strong>
            {total} {noun}
            {total > 1 ? "s" : ""}
          </strong>
          <small>{summary}</small>
        </span>
        <ChevronRight size={16} className="bf26-trav-chev" />
      </button>
      {open && (
        <div className="bf26-pop bf26-trav-pop" role="dialog" aria-label="Travellers">
          <div className="bf26-trav-head">
            <strong>Who’s coming?</strong>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>
          {ROWS.map(([key, label, sub, Icon]) => {
            const [lo, hi] = limits[key];
            return (
              <div className="bf26-trav-row" key={key}>
                <span className="bf26-trav-icon">
                  <Icon size={19} />
                </span>
                <span className="bf26-trav-label">
                  <strong>{label}</strong>
                  <small>{sub}</small>
                </span>
                <div className="bf26-stepper">
                  <button
                    type="button"
                    aria-label={`Remove ${label.toLowerCase()}`}
                    disabled={value[key] <= lo}
                    onClick={() => step(key, -1)}
                  >
                    <Minus size={15} />
                  </button>
                  <output aria-live="polite" aria-label={label}>
                    {value[key]}
                  </output>
                  <button
                    type="button"
                    aria-label={`Add ${label.toLowerCase()}`}
                    disabled={value[key] >= hi}
                    onClick={() => step(key, 1)}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            );
          })}
          <p className="bf26-trav-note">
            Up to 9 travellers. Each infant travels on an adult’s lap.
          </p>
          <button type="button" className="bf26-cal-done bf26-trav-done" onClick={() => setOpen(false)}>
            Done
          </button>
        </div>
      )}
    </div>
  );
}
