import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe2, LocateFixed } from "lucide-react";
import {
  CURRENCIES,
  formatPrice,
  resetCurrencyToLocation,
  setCurrency,
  useCurrency,
} from "../lib/currency";

/** Header button that shows and changes the display currency. */
export default function CurrencyPicker({ compact = false }) {
  const { code, chosen, live, updated } = useCurrency();
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => wrap.current && !wrap.current.contains(e.target) && setOpen(false);
    const key = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", key);
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  const current = CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];

  return (
    <div className={`bf26-cur ${open ? "is-open" : ""}`} ref={wrap}>
      <button
        type="button"
        className="bf-locale bf26-cur-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${current.name}. Change currency`}
        onClick={() => setOpen((v) => !v)}
      >
        <Globe2 size={16} /> {!compact && <span className="bf26-cur-lang">EN · </span>}
        {current.code}
        <ChevronDown size={14} className="bf26-cur-chev" />
      </button>

      {open && (
        <div className="bf26-cur-menu">
          <div className="bf26-cur-head">
            <strong>Currency</strong>
            <small>
              Prices are converted from MYR
              {live && updated ? ` · rates from ${new Date(updated).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}` : ""}.
              You're always charged in MYR.
            </small>
          </div>
          <button
            type="button"
            className={`bf26-cur-auto ${chosen ? "" : "is-on"}`}
            onClick={() => {
              resetCurrencyToLocation();
              setOpen(false);
            }}
          >
            <LocateFixed size={16} />
            <span>
              Match my location
              <small>{chosen ? "Pick the currency for where you are" : `On · showing ${current.code}`}</small>
            </span>
            {!chosen && <Check size={16} />}
          </button>
          <ul role="listbox" aria-label="Currencies" ref={listRef}>
            {CURRENCIES.map((c) => (
              <li
                key={c.code}
                role="option"
                aria-selected={c.code === code}
                tabIndex={0}
                onClick={() => {
                  setCurrency(c.code);
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCurrency(c.code);
                    setOpen(false);
                  }
                }}
              >
                <span className="bf26-cur-flag" aria-hidden="true">{c.flag}</span>
                <span className="bf26-cur-name">
                  <b>{c.code}</b>
                  <small>{c.name}</small>
                </span>
                <span className="bf26-cur-eg">{formatPrice(100, { code: c.code, whole: true })}</span>
                {c.code === code && <Check size={15} className="bf26-cur-tick" />}
              </li>
            ))}
          </ul>
          <p className="bf26-cur-foot">Example: RM 100 in each currency</p>
        </div>
      )}
    </div>
  );
}
