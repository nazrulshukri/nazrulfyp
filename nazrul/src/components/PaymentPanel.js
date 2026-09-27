import React, { useState } from "react";
import {
  CreditCard,
  Landmark,
  Wallet,
  Smartphone,
  Lock,
  ShieldCheck,
  Mail,
  User,
  Check,
  Loader2,
  Plane,
  Send,
  Ticket,
  Fingerprint,
} from "lucide-react";
import paypalLogo from "../img/assets/seat/Paypal_2014_logo.png";
import applePayLogo from "../img/assets/seat/Apple_Pay-Logo.wine.png";
import tngLogo from "../img/assets/seat/Touch_'n_Go_eWallet_logo.svg.png";
import grabLogo from "../img/assets/seat/grab-pay-logo-A0CA65B6C4-seeklogo.com.png";
import boostLogo from "../img/assets/seat/Logo-Boost-e-Wallet.png";
import mastercardLogo from "../img/assets/seat/Mastercard-logo.svg.png";

const METHODS = [
  { id: "card", label: "Card", sub: "Visa · Mastercard · Amex", icon: CreditCard },
  { id: "paypal", label: "PayPal", sub: "Pay with your PayPal", logo: paypalLogo },
  { id: "fpx", label: "FPX", sub: "Malaysian online banking", icon: Landmark },
  { id: "ewallet", label: "E-wallet", sub: "TNG · GrabPay · Boost", icon: Wallet },
  { id: "applePay", label: "Apple Pay", sub: "Face ID or Touch ID", logo: applePayLogo },
];

const BANKS = [
  ["Maybank", "#ffc72c", "#1a1a1a"],
  ["CIMB Bank", "#ec1c24", "#fff"],
  ["Public Bank", "#d71920", "#fff"],
  ["RHB Bank", "#0067b1", "#fff"],
  ["Hong Leong Bank", "#1d2c6b", "#fff"],
  ["AmBank", "#e30613", "#ffd200"],
  ["Bank Islam", "#b5134e", "#fff"],
  ["Bank Rakyat", "#004b8d", "#fff"],
  ["BSN", "#003a70", "#fff"],
  ["HSBC Bank", "#db0011", "#fff"],
  ["OCBC Bank", "#e11b22", "#fff"],
  ["UOB Bank", "#0b3b8c", "#fff"],
];

const WALLETS = [
  ["Touch 'n Go", tngLogo],
  ["GrabPay", grabLogo],
  ["Boost", boostLogo],
];

const digits = (s) => String(s || "").replace(/\D/g, "");

export function cardBrand(number) {
  const n = digits(number);
  if (/^3[47]/.test(n)) return "amex";
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  return "";
}

export function luhnValid(number) {
  const n = digits(number);
  if (n.length < 13 || n.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = n.length - 1; i >= 0; i -= 1) {
    let d = Number(n[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

function formatCard(value) {
  const n = digits(value);
  if (cardBrand(n) === "amex") {
    const v = n.slice(0, 15);
    return [v.slice(0, 4), v.slice(4, 10), v.slice(10)].filter(Boolean).join(" ");
  }
  return n.slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value, previous) {
  let n = digits(value).slice(0, 4);
  if (n.length === 1 && Number(n) > 1) n = `0${n}`;
  if (n.length >= 3) return `${n.slice(0, 2)}/${n.slice(2)}`;
  if (n.length === 2 && !previous.endsWith("/")) return `${n}/`;
  return n;
}

export function expiryValid(value, now = new Date()) {
  const m = /^(\d{2})\/(\d{2})$/.exec(value || "");
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const end = new Date(year, month, 1);
  return end > now;
}

function BrandMark({ brand }) {
  if (brand === "visa") return <span className="bf26-brand-visa">VISA</span>;
  if (brand === "amex") return <span className="bf26-brand-amex">AMEX</span>;
  if (brand === "mastercard") return <img src={mastercardLogo} alt="Mastercard" className="bf26-brand-mc" />;
  return <CreditCard size={26} />;
}

function CardPreview({ card, flipped }) {
  const brand = cardBrand(card.number);
  const shown = card.number || (brand === "amex" ? "•••• •••••• •••••" : "•••• •••• •••• ••••");
  return (
    <div className={`bf26-cardviz ${flipped ? "is-flipped" : ""} is-${brand || "blank"}`} aria-hidden="true">
      <div className="bf26-cardviz-inner">
        <div className="bf26-cardviz-front">
          <div className="bf26-cardviz-top">
            <span className="bf26-chip" />
            <BrandMark brand={brand} />
          </div>
          <div className="bf26-cardviz-number">{shown}</div>
          <div className="bf26-cardviz-bottom">
            <span>
              <small>Card holder</small>
              {card.name || "YOUR NAME"}
            </span>
            <span>
              <small>Expires</small>
              {card.expiry || "MM/YY"}
            </span>
          </div>
        </div>
        <div className="bf26-cardviz-back">
          <i className="bf26-cardviz-stripe" />
          <div className="bf26-cardviz-cvv">
            <small>CVV</small>
            <b>{card.cvv ? "•".repeat(card.cvv.length) : "•••"}</b>
          </div>
          <BrandMark brand={brand} />
        </div>
      </div>
    </div>
  );
}

/**
 * Shared payment method picker + forms.
 * Calls onPay({ method, label, detail }) once the chosen method's fields are valid.
 * Card numbers and CVVs never leave this component.
 */
export default function PaymentPanel({ amountLabel, defaultEmail = "", onPay, disabled }) {
  const [method, setMethod] = useState("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [flipped, setFlipped] = useState(false);
  const [paypal, setPaypal] = useState(defaultEmail);
  const [bank, setBank] = useState("");
  const [wallet, setWallet] = useState("");
  const [touched, setTouched] = useState(false);

  const brand = cardBrand(card.number);
  const errors = {
    card: {
      number: !luhnValid(card.number) && "Enter a valid card number",
      name: card.name.trim().length < 2 && "Enter the name on the card",
      expiry: !expiryValid(card.expiry) && "Enter a future expiry date (MM/YY)",
      cvv: digits(card.cvv).length !== (brand === "amex" ? 4 : 3) && `Enter the ${brand === "amex" ? 4 : 3}-digit CVV`,
    },
    paypal: { email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(paypal) && "Enter your PayPal email" },
    fpx: { bank: !bank && "Choose your bank" },
    ewallet: { wallet: !wallet && "Choose an e-wallet" },
    applePay: {},
  }[method];
  const firstError = Object.values(errors).find(Boolean);

  function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (firstError || disabled) return;
    const detail =
      method === "card"
        ? `${brand ? brand[0].toUpperCase() + brand.slice(1) : "Card"} •••• ${digits(card.number).slice(-4)}`
        : method === "paypal"
          ? paypal
          : method === "fpx"
            ? bank
            : method === "ewallet"
              ? wallet
              : "Apple Pay";
    const label = METHODS.find((m) => m.id === method).label;
    onPay({ method, label, detail });
  }

  const err = (key) => touched && errors[key] ? <small role="alert">{errors[key]}</small> : null;

  return (
    <form className="bf26-pay" onSubmit={submit} noValidate>
      <div className="bf26-pay-methods" role="radiogroup" aria-label="Payment method">
        {METHODS.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={method === m.id}
              className={method === m.id ? "is-active" : ""}
              onClick={() => {
                setMethod(m.id);
                setTouched(false);
              }}
            >
              <span className="bf26-pay-logo">
                {m.logo ? <img src={m.logo} alt="" /> : m.id === "fpx" ? <b>FPX</b> : <Icon size={22} />}
              </span>
              <strong>{m.label}</strong>
              <small>{m.sub}</small>
              <i className="bf26-pay-tick">
                <Check size={12} />
              </i>
            </button>
          );
        })}
      </div>

      <div className="bf26-pay-body" key={method}>
        {method === "card" && (
          <div className="bf26-pay-card">
            <CardPreview card={card} flipped={flipped} />
            <div className="bf26-form-grid">
              <label className={`bf26-input bf26-span-2 ${err("number") ? "has-error" : ""}`}>
                <span>Card number</span>
                <div>
                  <CreditCard size={17} />
                  <input
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                    onFocus={() => setFlipped(false)}
                  />
                  {luhnValid(card.number) && <Check size={17} className="bf26-phone-ok" />}
                </div>
                {err("number")}
              </label>
              <label className={`bf26-input bf26-span-2 ${err("name") ? "has-error" : ""}`}>
                <span>Name on card</span>
                <div>
                  <User size={17} />
                  <input
                    autoComplete="cc-name"
                    placeholder="As printed on the card"
                    value={card.name}
                    onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
                    onFocus={() => setFlipped(false)}
                  />
                </div>
                {err("name")}
              </label>
              <label className={`bf26-input ${err("expiry") ? "has-error" : ""}`}>
                <span>Expiry</span>
                <div>
                  <input
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value, card.expiry) })}
                    onFocus={() => setFlipped(false)}
                  />
                </div>
                {err("expiry")}
              </label>
              <label className={`bf26-input ${err("cvv") ? "has-error" : ""}`}>
                <span>CVV</span>
                <div>
                  <Lock size={16} />
                  <input
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder={brand === "amex" ? "4 digits" : "3 digits"}
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: digits(e.target.value).slice(0, brand === "amex" ? 4 : 3) })}
                    onFocus={() => setFlipped(true)}
                    onBlur={() => setFlipped(false)}
                  />
                </div>
                {err("cvv")}
              </label>
            </div>
          </div>
        )}

        {method === "paypal" && (
          <div className="bf26-pay-simple">
            <img src={paypalLogo} alt="PayPal" className="bf26-pay-hero-logo" />
            <p>You’ll confirm this payment with your PayPal account.</p>
            <label className={`bf26-input ${err("email") ? "has-error" : ""}`}>
              <span>PayPal email</span>
              <div>
                <Mail size={17} />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={paypal}
                  onChange={(e) => setPaypal(e.target.value)}
                />
              </div>
              {err("email")}
            </label>
          </div>
        )}

        {method === "fpx" && (
          <div>
            <p className="bf26-pay-hint">Choose your bank. You’ll approve the payment in your bank’s app.</p>
            <div className="bf26-banks" role="radiogroup" aria-label="Bank">
              {BANKS.map(([name, bg, fg]) => (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={bank === name}
                  className={bank === name ? "is-active" : ""}
                  onClick={() => setBank(name)}
                >
                  <span style={{ background: bg, color: fg }}>
                    {name
                      .replace(/ Bank$/, "")
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 3)}
                  </span>
                  {name}
                </button>
              ))}
            </div>
            {err("bank")}
          </div>
        )}

        {method === "ewallet" && (
          <div>
            <p className="bf26-pay-hint">Scan or approve the request in your e-wallet app.</p>
            <div className="bf26-wallets" role="radiogroup" aria-label="E-wallet">
              {WALLETS.map(([name, logo]) => (
                <button
                  key={name}
                  type="button"
                  role="radio"
                  aria-checked={wallet === name}
                  className={wallet === name ? "is-active" : ""}
                  onClick={() => setWallet(name)}
                >
                  <img src={logo} alt="" />
                  <strong>{name}</strong>
                </button>
              ))}
            </div>
            {err("wallet")}
          </div>
        )}

        {method === "applePay" && (
          <div className="bf26-pay-simple bf26-applepay">
            <Smartphone size={40} />
            <p>Double-click the side button, or use Face ID / Touch ID, to confirm.</p>
            <span>
              <Fingerprint size={16} /> Your card details are never shared with BookingFlex.
            </span>
          </div>
        )}
      </div>

      <button
        type="submit"
        className={`bf26-primary bf26-cta bf26-pay-btn ${method === "applePay" ? "is-apple" : ""}`}
        disabled={disabled}
      >
        <Lock size={17} /> {method === "applePay" ? "Pay with Apple Pay" : `Pay ${amountLabel}`}
      </button>
      <div className="bf26-pay-trust">
        <span>
          <ShieldCheck size={14} /> Encrypted checkout
        </span>
        <span>
          <Lock size={13} /> Card details are never stored
        </span>
        <span>Sample checkout · no real charge</span>
      </div>
    </form>
  );
}

const STEP_ICONS = [Lock, Ticket, Send];

/** Full-screen progress while the booking is confirmed and emailed. */
export function ProcessingOverlay({ steps, current, title = "Confirming your trip" }) {
  return (
    <div className="bf26-processing" role="status" aria-live="polite">
      <div className="bf26-processing-card">
        <div className="bf26-processing-orbit">
          <span className="bf26-orbit-ring" />
          <span className="bf26-orbit-plane">
            <Plane size={22} />
          </span>
          <Lock size={26} className="bf26-orbit-lock" />
        </div>
        <h2>{title}</h2>
        <ol>
          {steps.map((label, i) => {
            const Icon = STEP_ICONS[i] || Check;
            const state = i < current ? "is-done" : i === current ? "is-now" : "";
            return (
              <li key={label} className={state}>
                <span>
                  {i < current ? <Check size={14} /> : i === current ? <Loader2 size={14} className="bf26-spin" /> : <Icon size={14} />}
                </span>
                {label}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
