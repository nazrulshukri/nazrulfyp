import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Compass,
  SlidersHorizontal,
  Route,
  MapPin,
  Plane,
  BedDouble,
  Palmtree,
  TrainFront,
  Sparkles,
  X,
  Clock,
  Sun as SunIcon,
  Play,
} from "lucide-react";
import Booking from "./booking";
import greece from "../img/assets/travel/Greece_hero.jpg";
import plane from "../img/assets/4k-plane-beautiful-sunset-shawraxhzg2ibf4f.jpg";
import hotelFallback from "../img/assets/naera-Hotel-and-Spa-by-Horizontal-Design-30.jpg";
import bali from "../img/assets/travel/bali.jpeg";
import japan from "../img/assets/travel/mountfuji.jpg";
import london from "../img/assets/travel/london.jpg";
import sabah from "../img/assets/travel/sabah.jpeg";

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2400&q=80`;

// One hero "slide" per booking type. Selecting a slide also switches the search form.
const heroSlides = [
  {
    mode: "flight",
    label: "Flights",
    icon: Plane,
    image: plane,
    eyebrow: "ABOVE THE CLOUDS",
    title: ["Take off", "somewhere new."],
    copy: "Compare fares across 20+ airlines and fly out on your own schedule.",
    noteLabel: "Now boarding",
    note: "KUL → Anywhere",
    detail: "20+ AIRLINES · 10 AIRPORTS",
    position: "center 60%",
  },
  {
    mode: "hotel",
    label: "Hotels",
    icon: BedDouble,
    image: unsplash("photo-1566073771259-6a8506099945"),
    fallback: hotelFallback,
    eyebrow: "CHECK IN, SWITCH OFF",
    title: ["Stay", "a little longer."],
    copy: "Boutique hideaways, city suites and resorts, with verified guest scores.",
    noteLabel: "Tonight’s pick",
    note: "Resort & spa stays",
    detail: "FREE CANCELLATION ON MANY ROOMS",
    position: "center 55%",
  },
  {
    mode: "vacation",
    label: "Vacations",
    icon: Palmtree,
    image: greece,
    eyebrow: "FLIGHT + HOTEL, SORTED",
    title: ["Less ordinary.", "More out there."],
    copy: "Bundle your flight and stay in one search, and plan the whole escape in minutes.",
    noteLabel: "Somewhere worth discovering",
    note: "The Greek islands",
    detail: "37.0742° N   25.1365° E",
    position: "center 55%",
  },
  {
    mode: "train",
    label: "Trains",
    icon: TrainFront,
    image: unsplash("photo-1541427468627-a89a96e5ca1d"),
    fallback: sabah,
    eyebrow: "THE SCENIC ROUTE",
    title: ["Slow down.", "Look outside."],
    copy: "ETS, KLIA Ekspres and intercity rail, with live-style timetables and seat classes.",
    noteLabel: "Rail across Malaysia",
    note: "KL Sentral → North",
    detail: "ETS · ERL · KOMUTER",
    position: "center 50%",
  },
];

const mixkit = (id) => ({
  preview: `https://assets.mixkit.co/videos/${id}/${id}-360.mp4`,
  full: `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`,
});

const destinations = [
  {
    name: "Bali",
    country: "Indonesia",
    tag: "ISLAND TIME",
    image: bali,
    region: "Asia",
    airport: "Ngurah Rai International Airport (Bali)",
    description: "Slow mornings. Endless blue.",
    from: 1180,
    video: mixkit(16132),
    blurb: "Rice terraces, surf breaks and temple sunsets.",
    bestTime: "Apr – Oct",
    flightTime: "3h 05m",
    highlights: ["Ubud rice terraces", "Uluwatu temple", "Seminyak beaches"],
  },
  {
    name: "Tokyo",
    country: "Japan",
    tag: "A DIFFERENT PERSPECTIVE",
    image: japan,
    region: "Asia",
    airport: "Haneda International Airport (Japan)",
    description: "Tradition meets the unexpected.",
    from: 2140,
    video: mixkit(30148),
    blurb: "Neon streets, quiet shrines and Mount Fuji on a clear day.",
    bestTime: "Mar – May",
    flightTime: "7h 10m",
    highlights: ["Shibuya crossing", "Senso-ji temple", "Day trip to Mt Fuji"],
  },
  {
    name: "London",
    country: "United Kingdom",
    tag: "CITY DISCOVERY",
    image: london,
    region: "Europe",
    airport: "London Heathrow Airport (United Kingdom)",
    description: "A classic, with a new story every day.",
    from: 3439,
    video: mixkit(33823),
    blurb: "Royal landmarks, riverside walks and world-class museums.",
    bestTime: "May – Sep",
    flightTime: "14h 00m",
    highlights: ["Big Ben & Westminster", "Tower Bridge", "Borough Market"],
  },
  {
    name: "Sabah",
    country: "Malaysia",
    tag: "CLOSER TO NATURE",
    image: sabah,
    region: "Malaysia",
    airport: "Kota Kinabalu International Airport (Malaysia)",
    description: "Find your own little escape.",
    from: 320,
    video: mixkit(27379),
    blurb: "Island hopping, coral reefs and Mount Kinabalu sunrises.",
    bestTime: "Mar – Sep",
    flightTime: "2h 35m",
    highlights: ["Tunku Abdul Rahman Park", "Mount Kinabalu", "Water villages"],
  },
];

function HeroImage({ slide, active }) {
  const [src, setSrc] = useState(slide.image);
  return (
    <img
      className={`bf26-hero-img ${active ? "is-active" : ""}`}
      src={src}
      alt=""
      aria-hidden="true"
      style={{ objectPosition: slide.position }}
      onError={() => slide.fallback && setSrc(slide.fallback)}
    />
  );
}

export default function MainContent() {
  const [region, setRegion] = useState("All destinations");
  const [preset, setPreset] = useState(null);
  const [mode, setMode] = useState("flight");
  const [autoplay, setAutoplay] = useState(true);
  const searchRef = useRef(null);

  const activeIndex = heroSlides.findIndex((s) => s.mode === mode);
  const slide = heroSlides[activeIndex];

  // Gently cycle the hero until the visitor starts interacting.
  useEffect(() => {
    if (!autoplay) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    const id = setInterval(() => {
      setMode((current) => {
        const i = heroSlides.findIndex((s) => s.mode === current);
        return heroSlides[(i + 1) % heroSlides.length].mode;
      });
    }, 7000);
    return () => clearInterval(id);
  }, [autoplay]);

  function pick(nextMode) {
    setAutoplay(false);
    setMode(nextMode);
  }

  const [preview, setPreview] = useState(null);

  function playCard(card, on) {
    const video = card.querySelector("video");
    if (!video) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (on) {
      if (!video.src) video.src = video.dataset.src;
      card.classList.add("is-playing");
      video.play().catch(() => card.classList.remove("is-playing"));
    } else {
      card.classList.remove("is-playing");
      video.pause();
    }
  }

  function choose(destination) {
    setAutoplay(false);
    setMode("flight");
    setPreset({ value: destination.airport, at: Date.now() });
    searchRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const Icon = slide.icon;

  return (
    <div className="bf-home">
      <section className="bf26-hero" aria-label="Choose how you travel">
        {heroSlides.map((s) => (
          <HeroImage key={s.mode} slide={s} active={s.mode === mode} />
        ))}
        <div className="bf26-hero-shade" />

        <div className="bf26-hero-switch" role="tablist" aria-label="Travel type">
          {heroSlides.map((s) => {
            const TabIcon = s.icon;
            return (
              <button
                key={s.mode}
                role="tab"
                aria-selected={s.mode === mode}
                className={s.mode === mode ? "is-active" : ""}
                onClick={() => pick(s.mode)}
              >
                <TabIcon size={17} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bf26-hero-copy" key={mode}>
          <span className="bf-eyebrow">
            <span /> {slide.eyebrow}
          </span>
          <h1>
            {slide.title[0]}
            <br />
            <em>{slide.title[1]}</em>
          </h1>
          <p>{slide.copy}</p>
          <a className="bf-hero-link" href="#destinations">
            Find your inspiration <ArrowUpRight size={19} />
          </a>
        </div>

        <div className="bf26-hero-note" key={`note-${mode}`}>
          <span>
            <MapPin size={15} /> {slide.noteLabel}
          </span>
          <strong>
            <Icon size={20} /> {slide.note}
          </strong>
          <small>{slide.detail}</small>
        </div>

        <div className="bf26-hero-progress" aria-hidden="true">
          {heroSlides.map((s, i) => (
            <i
              key={s.mode}
              className={`${i === activeIndex ? "is-active" : ""} ${
                autoplay && i === activeIndex ? "is-running" : ""
              }`}
            />
          ))}
          <span>
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(heroSlides.length).padStart(2, "0")}
          </span>
        </div>
      </section>

      <div className="bf-content">
        <div ref={searchRef} onFocusCapture={() => setAutoplay(false)}>
          <Booking
            destinationPreset={preset}
            mode={mode}
            onModeChange={pick}
          />
        </div>

        <div className="bf-benefits">
          <div>
            <Compass />
            <span>
              <strong>Your trip, all together</strong>
              <small>Flights, stays, holidays and rail in one place</small>
            </span>
          </div>
          <div>
            <SlidersHorizontal />
            <span>
              <strong>Find what fits you</strong>
              <small>Compare options at your own pace</small>
            </span>
          </div>
          <div>
            <Route />
            <span>
              <strong>From take-off to check-in</strong>
              <small>A simpler way to plan your journey</small>
            </span>
          </div>
        </div>

        <section className="bf-destinations" id="destinations">
          <div className="bf-section-heading">
            <div>
              <span className="bf-kicker">FOLLOW YOUR CURIOSITY</span>
              <h2>Where will you go next?</h2>
              <p>
                Big city energy or a little peace and quiet. Make it your kind
                of trip.
              </p>
            </div>
            <a href="#trip-search">
              Build your trip <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="bf-region-tabs" aria-label="Filter destinations">
            {["All destinations", "Asia", "Europe", "Malaysia"].map((item) => (
              <button
                key={item}
                aria-pressed={region === item}
                className={region === item ? "active" : ""}
                onClick={() => setRegion(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="bf-destination-grid">
            {destinations
              .filter(
                (d) => region === "All destinations" || d.region === region,
              )
              .map((d) => (
                <button
                  className="bf-destination"
                  key={d.name}
                  onClick={() => setPreview(d)}
                  onMouseEnter={(e) => playCard(e.currentTarget, true)}
                  onMouseLeave={(e) => playCard(e.currentTarget, false)}
                  onFocus={(e) => playCard(e.currentTarget, true)}
                  onBlur={(e) => playCard(e.currentTarget, false)}
                  aria-label={`Preview ${d.name}`}
                >
                  <div className="bf-destination-image">
                    <img
                      src={d.image}
                      alt={`${d.name}, ${d.country}`}
                      loading="lazy"
                    />
                    <video
                      className="bf26-card-video"
                      data-src={d.video.preview}
                      poster={d.image}
                      muted
                      loop
                      playsInline
                      preload="none"
                      aria-hidden="true"
                    />
                    <b className="bf26-play-hint" aria-hidden="true">
                      <Play size={12} fill="currentColor" /> Preview
                    </b>
                    <span>{d.tag}</span>
                    <i>
                      <ArrowUpRight size={20} />
                    </i>
                    <div>
                      <small>{d.country}</small>
                      <h3>{d.name}</h3>
                    </div>
                  </div>
                  <p>
                    <span>
                      {d.description}
                      <em>Flights from MYR {d.from.toLocaleString("en-MY")}</em>
                    </span>
                    <ArrowRight size={16} />
                  </p>
                </button>
              ))}
          </div>
        </section>

        <section className="bf26-bento" aria-label="Ways to travel">
          {heroSlides.map((s) => {
            const TileIcon = s.icon;
            return (
              <button
                key={s.mode}
                className={`bf26-tile bf26-tile-${s.mode}`}
                onClick={() => {
                  pick(s.mode);
                  searchRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }}
              >
                <HeroImage slide={s} active />
                <span className="bf26-tile-icon">
                  <TileIcon size={20} />
                </span>
                <span className="bf26-tile-copy">
                  <small>{s.eyebrow}</small>
                  <strong>{s.label}</strong>
                  <em>
                    Search {s.label.toLowerCase()} <ArrowUpRight size={15} />
                  </em>
                </span>
              </button>
            );
          })}
        </section>

        <section className="bf-member">
          <div className="bf-member-orbit">
            <PlaneTicket />
          </div>
          <div>
            <span className="bf-kicker">
              <Sparkles size={12} /> A LITTLE MORE FLEXIBILITY
            </span>
            <h2>
              Good journeys start with
              <br />
              everything in one place.
            </h2>
            <p>Keep your bookings close and your next adventure closer.</p>
          </div>
          <Link className="bf-primary" to="/signup">
            Create an account <ArrowUpRight size={18} />
          </Link>
        </section>
        <div className="bf-bottom-note">
          <span>PLAN WITH CONFIDENCE</span>
          <p>Explore your options. Find your rhythm. Travel your way.</p>
          <Link to="/about">
            Meet BookingFlex <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
      {preview && (
        <DestinationPreview
          destination={preview}
          onClose={() => setPreview(null)}
          onPlan={() => {
            const d = preview;
            setPreview(null);
            choose(d);
          }}
        />
      )}
    </div>
  );
}

function DestinationPreview({ destination: d, onClose, onPlan }) {
  const closeRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      className="bf26-dest-modal"
      role="dialog"
      aria-modal="true"
      aria-label={`${d.name} preview`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bf26-dest-sheet">
        <div className="bf26-dest-media">
          <video src={d.video.full} poster={d.image} autoPlay muted loop playsInline />
          <div className="bf26-dest-shade" />
          <button ref={closeRef} type="button" className="bf26-dest-close" onClick={onClose} aria-label="Close preview">
            <X size={20} />
          </button>
          <div className="bf26-dest-title">
            <span className="bf-eyebrow">
              <span /> {d.tag}
            </span>
            <h2>{d.name}</h2>
            <p>
              <MapPin size={15} /> {d.country}
            </p>
          </div>
        </div>
        <div className="bf26-dest-body">
          <p className="bf26-dest-blurb">{d.blurb}</p>
          <div className="bf26-dest-facts">
            <div>
              <Plane size={18} />
              <span>
                <small>Flight from KUL</small>
                <strong>{d.flightTime}</strong>
              </span>
            </div>
            <div>
              <SunIcon size={18} />
              <span>
                <small>Best time to go</small>
                <strong>{d.bestTime}</strong>
              </span>
            </div>
            <div>
              <Clock size={18} />
              <span>
                <small>Fares from</small>
                <strong>MYR {d.from.toLocaleString("en-MY")}</strong>
              </span>
            </div>
          </div>
          <ul className="bf26-dest-highlights">
            {d.highlights.map((h) => (
              <li key={h}>
                <Sparkles size={14} /> {h}
              </li>
            ))}
          </ul>
          <div className="bf26-dest-actions">
            <button type="button" className="bf26-primary bf26-cta" onClick={onPlan}>
              Search flights to {d.name} <ArrowRight size={17} />
            </button>
            <small>Video: Mixkit free stock footage</small>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function PlaneTicket() {
  return (
    <div className="bf-mini-ticket">
      <span>BOOKINGFLEX / A WORLD OF POSSIBILITIES</span>
      <div>
        KUL <Route size={36} /> ANY
      </div>
      <small>YOUR NEXT CHAPTER &nbsp; · &nbsp; STARTS HERE</small>
    </div>
  );
}
