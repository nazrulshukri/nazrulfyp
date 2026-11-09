import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  Bot,
  Code2,
  Compass,
  Database,
  Globe2,
  Handshake,
  Headphones,
  HeartHandshake,
  Layers,
  LayoutTemplate,
  MapPin,
  Megaphone,
  Palette,
  Plane,
  Radar,
  Server,
  ShieldCheck,
  Sparkles,
  TrainFront,
  Zap,
} from "lucide-react";
import { FaFacebookF, FaGithub, FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import "./about.css";
import founderPhoto from "../img/assets/team/nazrul.jpg";

// Add your profile links here. Any left empty are hidden on the page.
const SOCIALS = [
  { label: "GitHub", icon: FaGithub, url: "https://github.com/nazrulshukri" },
  { label: "LinkedIn", icon: FaLinkedinIn, url: "https://www.linkedin.com/in/muhd-nazrul/" },
  { label: "Facebook", icon: FaFacebookF, url: "" },
  { label: "Instagram", icon: FaInstagram, url: "" },
  { label: "X (Twitter)", icon: FaXTwitter, url: "" },
];

const STATS = [
  { value: "174", label: "airports worldwide" },
  { value: "24", label: "currencies, live rates" },
  { value: "19", label: "destinations to explore" },
  { value: "24/7", label: "Flexi, the AI assistant" },
];

const ORG = [
  {
    title: "Product & Design",
    icon: Palette,
    summary: "What we build and how it feels",
    roles: [
      { name: "Product strategy", icon: Compass },
      { name: "UX / UI design", icon: LayoutTemplate },
      { name: "Brand & content", icon: Megaphone },
    ],
  },
  {
    title: "Engineering",
    icon: Code2,
    summary: "The platform behind every booking",
    roles: [
      { name: "Web app (React)", icon: Layers },
      { name: "Backend & APIs", icon: Server },
      { name: "Flexi AI assistant", icon: Bot },
      { name: "Live trains, flights & rates", icon: Radar },
    ],
  },
  {
    title: "Operations",
    icon: HeartHandshake,
    summary: "Keeping every trip on track",
    roles: [
      { name: "Customer support", icon: Headphones },
      { name: "Airline, hotel & rail partners", icon: Handshake },
      { name: "Payments & security", icon: ShieldCheck },
    ],
  },
];

const STACK = [
  { name: "React", note: "Fast, app-like booking flow", icon: Layers },
  { name: "Node.js & Express", note: "APIs, tickets and email", icon: Server },
  { name: "MongoDB", note: "Accounts and bookings", icon: Database },
  { name: "Claude", note: "Powers Flexi, the assistant", icon: Bot },
  { name: "Live open data", note: "KTM trains, aircraft, exchange rates", icon: Radar },
  { name: "Vercel", note: "Global hosting, deployed on every merge", icon: Zap },
];

const VALUES = [
  {
    icon: Sparkles,
    title: "Simple by design",
    text: "Clear choices, useful details and fewer steps from search to confirmation.",
  },
  {
    icon: Compass,
    title: "Built around travellers",
    text: "Every feature starts with a question real people ask before or during a trip.",
  },
  {
    icon: Globe2,
    title: "Ready for the journey",
    text: "Flights, stays, trains, payments and tickets stay together in one place.",
  },
];

// Fades sections in as they scroll into view.
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const items = root.querySelectorAll(".ab-reveal");
    if (!("IntersectionObserver" in window) || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((el) => el.classList.add("is-in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

export default function AboutUs() {
  const ref = useReveal();
  const socials = SOCIALS.filter((s) => s.url);

  return (
    <div className="ab-page" ref={ref}>
      {/* Hero */}
      <section className="ab-hero" aria-labelledby="ab-title">
        <div className="ab-hero-glow" aria-hidden="true" />
        <div className="ab-hero-copy">
          <span className="ab-kicker">
            <Sparkles size={14} /> About BookingFlex
          </span>
          <h1 id="ab-title">
            Travel, made <em>flexible.</em>
          </h1>
          <p>
            One calm place for flights, hotels, trains and holidays, built so you spend less time
            organising and more time looking forward to the trip.
          </p>
          <div className="ab-actions">
            <Link className="ab-btn ab-btn-primary" to="/">
              Plan a trip <ArrowRight size={17} />
            </Link>
            <a className="ab-btn ab-btn-ghost" href="#founder">
              Meet the founder
            </a>
          </div>
        </div>

        <div className="ab-hero-visual" aria-hidden="true">
          <div className="ab-ring ab-ring-1" />
          <div className="ab-ring ab-ring-2" />
          <div className="ab-logo-card">
            <span className="ab-logo-mark">
              <Plane size={44} />
            </span>
            <strong>
              booking<span>flex</span>
              <i />
            </strong>
          </div>
          <div className="ab-float ab-float-1">
            <Plane size={16} /> KUL → HND
            <small>Boarding pass ready</small>
          </div>
          <div className="ab-float ab-float-2">
            <TrainFront size={16} /> ETS to Penang
            <small>Live on the map</small>
          </div>
          <div className="ab-float ab-float-3">
            <BedDouble size={16} /> 3 nights · Bali
            <small>Free cancellation</small>
          </div>
        </div>
      </section>

      <section className="ab-stats ab-reveal" aria-label="BookingFlex in numbers">
        {STATS.map((s) => (
          <div key={s.label}>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </section>

      {/* Founder */}
      <section className="ab-founder ab-reveal" id="founder" aria-labelledby="ab-founder-title">
        <div className="ab-photo">
          <div className="ab-photo-frame">
            <img src={founderPhoto} alt="Muhammad Nazrul, founder of BookingFlex" />
          </div>
          <span className="ab-photo-badge">
            <Sparkles size={14} /> Founder · Developer
          </span>
          <span className="ab-photo-place">
            <MapPin size={13} /> Malaysia
          </span>
        </div>

        <div className="ab-founder-copy">
          <span className="ab-kicker">Meet the founder</span>
          <h2 id="ab-founder-title">Muhammad Nazrul</h2>
          <p className="ab-role">Founder & full-stack developer</p>
          <p>
            Hi, I'm Nazrul. BookingFlex started as my final-year project, from a simple question:
            why does booking one trip still take so many tabs?
          </p>
          <p>
            I design and build every part of it: the search, the tickets and boarding passes, the
            live train and flight trackers, and Flexi, the AI travel assistant. And I'm still
            adding to it.
          </p>
          <blockquote>"Planning a trip should feel like the start of the holiday, not a chore."</blockquote>

          {socials.length > 0 && (
            <div className="ab-socials" aria-label="Find me online">
              {socials.map(({ label, icon: Icon, url }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="ab-social">
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                  <ArrowUpRight size={14} className="ab-social-arrow" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Organisation chart */}
      <section className="ab-org ab-reveal" aria-labelledby="ab-org-title">
        <div className="ab-heading ab-heading-center">
          <span className="ab-kicker">How we're organised</span>
          <h2 id="ab-org-title">The team behind your trip</h2>
          <p>
            Three teams, one goal. Today every role is led by Nazrul; the chart shows how
            BookingFlex is set up to grow.
          </p>
        </div>

        <div className="ab-tree">
          <div className="ab-tree-root">
            <img src={founderPhoto} alt="" />
            <div>
              <strong>Muhammad Nazrul</strong>
              <span>Founder & lead developer</span>
            </div>
          </div>
          <div className="ab-tree-branches">
            {ORG.map(({ title, icon: Icon, summary, roles }) => (
              <div className="ab-branch" key={title}>
                <div className="ab-dept">
                  <span className="ab-dept-icon">
                    <Icon size={20} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <small>{summary}</small>
                  </div>
                </div>
                <ul className="ab-roles">
                  {roles.map(({ name, icon: RoleIcon }) => (
                    <li key={name}>
                      <RoleIcon size={15} /> {name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="ab-stack ab-reveal" aria-labelledby="ab-stack-title">
        <div className="ab-heading">
          <span className="ab-kicker">Under the hood</span>
          <h2 id="ab-stack-title">What powers BookingFlex</h2>
        </div>
        <div className="ab-stack-grid">
          {STACK.map(({ name, note, icon: Icon }) => (
            <div className="ab-stack-card" key={name}>
              <span>
                <Icon size={20} />
              </span>
              <strong>{name}</strong>
              <small>{note}</small>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="ab-values ab-reveal" aria-labelledby="ab-values-title">
        <div className="ab-heading ab-heading-center">
          <span className="ab-kicker">What guides us</span>
          <h2 id="ab-values-title">Thoughtful travel tools, without the clutter</h2>
        </div>
        <div className="ab-value-grid">
          {VALUES.map(({ icon: Icon, title, text }, i) => (
            <article className="ab-value" key={title}>
              <span className="ab-value-num">0{i + 1}</span>
              <span className="ab-value-icon">
                <Icon size={22} />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ab-cta ab-reveal" aria-labelledby="ab-cta-title">
        <div>
          <span className="ab-kicker">Ready when you are</span>
          <h2 id="ab-cta-title">Make your next journey feel easier.</h2>
        </div>
        <div className="ab-cta-actions">
          <Link className="ab-btn ab-btn-lime" to="/">
            Start searching <ArrowRight size={17} />
          </Link>
          <Link className="ab-btn ab-btn-outline" to="/track">
            <Radar size={16} /> Track a booking
          </Link>
        </div>
      </section>
    </div>
  );
}
