import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  CreditCard,
  Dumbbell,
  Grid2x2,
  Hotel as HotelIcon,
  MapPin,
  Moon,
  ParkingCircle,
  PawPrint,
  Ruler,
  ShieldCheck,
  Sparkles,
  Train,
  Plane,
  Landmark,
  Users,
  Utensils,
  Waves,
  Wifi,
  X,
  Gift,
  Baby,
} from "lucide-react";
import { BookingSteps } from "./flightresults";
import { formatDay } from "../lib/travelMeta";

const HOTEL_STEPS = ["Search", "Stay", "Guest details", "Payment"];
const formatMYR = (value) => `MYR ${Math.round(Number(value || 0)).toLocaleString("en-MY")}`;
const AMENITY_ICONS = { WiFi: Wifi, Pool: Waves, Gym: Dumbbell, Parking: ParkingCircle, Spa: Sparkles };

const nightsBetween = (start, end) => {
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 1;
  return Math.max(1, Math.round((b - a) / 86400000));
};
const scoreLabel = (score) =>
  score >= 9 ? "Exceptional" : score >= 8.5 ? "Superb" : score >= 8 ? "Very good" : "Good";

// Stable pseudo-random helper so each hotel gets its own consistent sub-scores.
const jitter = (seed, i, spread) => (((seed * 9301 + i * 49297) % 233280) / 233280 - 0.5) * spread;

const HOUSE_RULES = [
  [Clock, "Check-in", "From 15:00"],
  [Clock, "Check-out", "Until 11:00"],
  [ShieldCheck, "Cancellation", "Policies vary by room type. Check the conditions of the room you choose."],
  [Baby, "Children", "Children of any age are welcome. Guests aged 4+ are charged as adults."],
  [Users, "Age restriction", "The minimum age for check-in is 18."],
  [PawPrint, "Pets", "Pets are not allowed."],
  [CreditCard, "Payment", "American Express, Visa and Mastercard accepted."],
];

const FINE_PRINT = [
  ["Service charge", "Rates may include a discretionary 5% accommodation service charge."],
  ["Check-in documents", "Photo identification and a credit card are required at check-in."],
  ["Arrival time", "Please let the property know your expected arrival time in advance."],
  ["Age policy", "Guests under 18 can only check in with a parent or official guardian."],
];

const HotelSelected = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const savedHotelState = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("hotelSelectedDraft") || "null");
    } catch (error) {
      return null;
    }
  }, []);
  const { selectedHotel, startDate, returnDate, people } =
    location.state || savedHotelState || {};

  const images = useMemo(() => selectedHotel?.images || [], [selectedHotel]);
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [roomIndex, setRoomIndex] = useState(0);
  const [tab, setTab] = useState("overview");
  const sections = {
    overview: useRef(null),
    rooms: useRef(null),
    facilities: useRef(null),
    reviews: useRef(null),
    rules: useRef(null),
  };

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActiveImage((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActiveImage((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, images.length]);

  if (!selectedHotel) {
    return (
      <section className="bf-empty">
        <BedDouble size={36} />
        <h1>No stay selected yet.</h1>
        <p>Pick a hotel from your search results to see rooms and prices.</p>
        <Link className="bf-primary" to="/hotel">
          Browse hotels <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const guests = Math.max(1, Number(people) || 1);
  const nights = nightsBetween(startDate, returnDate);
  const nightly = Number(selectedHotel.pricePerNight) || 0;
  const rooms = [
    {
      name: selectedHotel.roomType || "Standard Room",
      bed: selectedHotel.bedType,
      size: selectedHotel.roomSize,
      nightly,
      badge: "Best value",
      perks: ["Free WiFi", "Private bathroom", "Flat-screen TV", "Free cancellation until 3 days before"],
    },
    {
      name: "Deluxe Room, city view",
      bed: "1 king bed",
      size: Math.round((selectedHotel.roomSize || 22) * 1.3),
      nightly: Math.round(nightly * 1.18),
      badge: "Guest favourite",
      perks: ["City view", "Tea and coffee maker", "Rain shower", "Free cancellation until 3 days before"],
    },
    {
      name: "Executive Suite with breakfast",
      bed: "1 king bed + sofa",
      size: Math.round((selectedHotel.roomSize || 22) * 1.8),
      nightly: Math.round(nightly * 1.36),
      badge: "Premium pick",
      perks: ["Breakfast included", "Lounge access", "Separate living area", "Non-refundable"],
    },
  ];
  // Pricing follows the results page: nightly rate × nights × guests.
  const roomTotal = (room) => room.nightly * nights * guests;
  const room = rooms[roomIndex];
  const total = roomTotal(room);

  const subscores = ["Staff", "Facilities", "Cleanliness", "Comfort", "Value for money", "Location"].map(
    (label, i) => {
      const value = Math.max(6, Math.min(9.9, selectedHotel.rating + jitter(selectedHotel.id, i, 1.6)));
      return [label, Math.round(value * 10) / 10];
    },
  );
  const city = selectedHotel.location || "the city";
  const overview = [
    selectedHotel.description,
    `${selectedHotel.hotelName} sits ${selectedHotel.distanceFromCenter} km from the centre of ${city}, with ${(
      selectedHotel.amenities || []
    )
      .join(", ")
      .toLowerCase()} for guests.`,
    `Rooms start with the ${selectedHotel.roomType?.toLowerCase() || "standard room"} (${selectedHotel.roomSize} m², ${
      selectedHotel.bedType
    }). Guests rate the stay ${selectedHotel.rating}/10 across ${selectedHotel.reviews.toLocaleString("en-MY")} reviews.`,
  ];

  function go(key) {
    setTab(key);
    sections[key].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function book() {
    const bookingState = {
      selectedHotel: { ...selectedHotel, roomType: room.name, bedType: room.bed, pricePerNight: room.nightly },
      totalPrice: total,
      startDate,
      returnDate,
      people: guests,
    };
    sessionStorage.setItem("hotelBookingDraft", JSON.stringify(bookingState));
    navigate("/hotelform", { state: bookingState });
  }

  function showMap() {
    navigate("/Maps", {
      state: {
        location: {
          coordinates: [selectedHotel.latitude, selectedHotel.longitude],
          name: selectedHotel.hotelName,
          brand: selectedHotel.brand,
          rating: selectedHotel.rating,
          reviews: selectedHotel.reviews,
          pricePerNight: selectedHotel.pricePerNight,
          roomsAvailable: selectedHotel.roomsAvailable,
          distanceFromCenter: selectedHotel.distanceFromCenter,
        },
        from: "/Hotelselected",
      },
    });
  }

  return (
    <section className="bf26-results bf26-stay">
      <div className="bf26-results-top">
        <button type="button" className="bf-back" onClick={() => navigate("/hotel")}>
          <ArrowLeft size={15} /> Back to stays
        </button>
        <BookingSteps current="Stay" steps={HOTEL_STEPS} />
      </div>

      <header className="bf26-stay-head">
        <div>
          <span className="bf26-hotel-brand">
            {selectedHotel.brand} · {"★".repeat(selectedHotel.starRating)}
          </span>
          <h1>{selectedHotel.hotelName}</h1>
          <p className="bf26-hotel-loc">
            <MapPin size={15} /> {city} · {selectedHotel.distanceFromCenter} km from centre
            <button type="button" onClick={showMap}>
              Show on map
            </button>
          </p>
        </div>
        <div className="bf26-score bf26-score-lg">
          <span>
            <strong>{scoreLabel(selectedHotel.rating)}</strong>
            <small>{selectedHotel.reviews.toLocaleString("en-MY")} reviews</small>
          </span>
          <b>{selectedHotel.rating}</b>
        </div>
      </header>

      <div className="bf26-gallery">
        {images.slice(0, 5).map((src, i) => (
          <button
            key={src}
            type="button"
            className={i === 0 ? "is-main" : ""}
            onClick={() => {
              setActiveImage(i);
              setLightbox(true);
            }}
            aria-label={`Open photo ${i + 1} of ${images.length}`}
          >
            <img src={src} alt={`${selectedHotel.hotelName} ${i + 1}`} />
          </button>
        ))}
        {images.length > 0 && (
          <button
            type="button"
            className="bf26-gallery-all"
            onClick={() => {
              setActiveImage(0);
              setLightbox(true);
            }}
          >
            <Grid2x2 size={15} /> All {images.length} photos
          </button>
        )}
      </div>

      <nav className="bf26-stay-tabs" aria-label="Hotel sections">
        {[
          ["overview", "Overview"],
          ["rooms", "Rooms"],
          ["facilities", "Facilities"],
          ["reviews", "Reviews"],
          ["rules", "House rules"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={tab === key ? "is-active" : ""}
            onClick={() => go(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="bf26-checkout-layout bf26-stay-layout">
        <div className="bf26-checkout-sections">
          <section className="bf26-panel" ref={sections.overview}>
            <h2 className="bf26-panel-title">About this stay</h2>
            {overview.map((p) => (
              <p key={p} className="bf26-prose">
                {p}
              </p>
            ))}
            <div className="bf26-hotel-feats">
              <span>
                <BedDouble size={14} /> {selectedHotel.bedType}
              </span>
              <span>
                <Ruler size={14} /> {selectedHotel.roomSize} m²
              </span>
              {(selectedHotel.amenities || []).map((a) => {
                const Icon = AMENITY_ICONS[a] || Check;
                return (
                  <span key={a} className="is-amenity">
                    <Icon size={14} /> {a}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="bf26-panel" ref={sections.rooms}>
            <h2 className="bf26-panel-title">Choose your room</h2>
            <p className="bf26-panel-sub">
              Prices for {nights} night{nights === 1 ? "" : "s"}, {guests} guest{guests === 1 ? "" : "s"}.
            </p>
            <div className="bf26-rooms-grid" role="radiogroup" aria-label="Room type">
              {rooms.map((r, i) => (
                <button
                  key={r.name}
                  type="button"
                  role="radio"
                  aria-checked={roomIndex === i}
                  className={`bf26-room ${roomIndex === i ? "is-active" : ""}`}
                  onClick={() => setRoomIndex(i)}
                >
                  <em>{r.badge}</em>
                  <strong>{r.name}</strong>
                  <small>
                    {r.bed} · {r.size} m²
                  </small>
                  <ul>
                    {r.perks.map((perk) => (
                      <li key={perk}>
                        <Check size={13} /> {perk}
                      </li>
                    ))}
                  </ul>
                  <span className="bf26-room-price">
                    <b>{formatMYR(roomTotal(r))}</b>
                    <small>{formatMYR(r.nightly)} / night</small>
                  </span>
                  <span className="bf26-room-check">
                    {roomIndex === i ? <Check size={16} /> : null}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="bf26-panel" ref={sections.facilities}>
            <h2 className="bf26-panel-title">Facilities & surroundings</h2>
            <div className="bf26-facts">
              {[
                [Wifi, "Internet", "Free WiFi in all areas"],
                [Coffee, "Food & drink", "Café, bar and in-room coffee"],
                [HotelIcon, "Services", "24-hour front desk, luggage storage, concierge"],
                [Utensils, "Nearby dining", "Restaurants within a 5-minute walk"],
                [Train, "Public transport", "Metro station within 400 m"],
                [Plane, "Closest airport", `${Math.round(12 + selectedHotel.distanceFromCenter * 4)} km`],
                [Landmark, "Top sights", `${(Number(selectedHotel.distanceFromCenter) + 0.6).toFixed(1)} km to the main landmarks`],
                [Sparkles, "Wellness", (selectedHotel.amenities || []).includes("Spa") ? "Spa and treatment rooms" : "Fitness access nearby"],
              ].map(([Icon, title, copy]) => (
                <div key={title}>
                  <Icon size={18} />
                  <span>
                    <strong>{title}</strong>
                    <small>{copy}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bf26-panel" ref={sections.reviews}>
            <div className="bf26-reviews-head">
              <b>{selectedHotel.rating}</b>
              <span>
                <strong>{scoreLabel(selectedHotel.rating)}</strong>
                <small>Based on {selectedHotel.reviews.toLocaleString("en-MY")} verified reviews</small>
              </span>
            </div>
            <div className="bf26-bars">
              {subscores.map(([label, value]) => (
                <div key={label}>
                  <span>
                    {label} <strong>{value.toFixed(1)}</strong>
                  </span>
                  <i>
                    <b style={{ width: `${value * 10}%` }} />
                  </i>
                </div>
              ))}
            </div>
          </section>

          <section className="bf26-panel" ref={sections.rules}>
            <h2 className="bf26-panel-title">House rules</h2>
            <div className="bf26-rules">
              {HOUSE_RULES.map(([Icon, title, copy]) => (
                <div key={title}>
                  <Icon size={17} />
                  <strong>{title}</strong>
                  <span>{copy}</span>
                </div>
              ))}
            </div>
            <h3 className="bf26-subhead">The fine print</h3>
            <div className="bf26-fine">
              {FINE_PRINT.map(([title, copy], i) => (
                <article key={title}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="bf26-summary">
          <div className="bf26-summary-card">
            <span className="bf26-kicker">Your stay</span>
            <div className="bf26-stay-dates">
              <div>
                <small>Check-in</small>
                <strong>{startDate ? formatDay(startDate) : "—"}</strong>
                <small>from 15:00</small>
              </div>
              <div>
                <small>Check-out</small>
                <strong>{returnDate ? formatDay(returnDate) : "—"}</strong>
                <small>until 11:00</small>
              </div>
            </div>
            <div className="bf26-summary-rows">
              <p>
                <span>
                  <BedDouble size={13} /> {room.name}
                </span>
              </p>
              <p>
                <span>
                  {formatMYR(room.nightly)} × {nights} night{nights === 1 ? "" : "s"} × {guests} guest
                  {guests === 1 ? "" : "s"}
                </span>
                <strong>{formatMYR(total)}</strong>
              </p>
              <p>
                <span>
                  <Moon size={13} /> {nights} night{nights === 1 ? "" : "s"} ·{" "}
                  <Users size={13} /> {guests}
                </span>
              </p>
            </div>
            <div className="bf26-summary-total">
              <span>Total</span>
              <strong>{formatMYR(total)}</strong>
            </div>
            <button type="button" className="bf26-primary bf26-cta" onClick={book}>
              Reserve this room <ArrowRight size={17} />
            </button>
            <p className="bf26-note">
              <CalendarDays size={14} /> You won’t be charged yet. Sample stay pricing.
            </p>
          </div>
          <Link to="/signup" className="bf26-summary-extra bf26-member-deal">
            <Gift size={18} />
            <span>
              <strong>Members save 10% or more</strong>
              <small>Create a free account to unlock member prices</small>
            </span>
            <ArrowRight size={16} />
          </Link>
        </aside>
      </div>

      {lightbox && images.length > 0 && (
        <div
          className="bf26-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
          onClick={(e) => e.target === e.currentTarget && setLightbox(false)}
        >
          <button type="button" className="bf26-lb-close" onClick={() => setLightbox(false)} aria-label="Close gallery">
            <X size={22} />
          </button>
          <button
            type="button"
            className="bf26-lb-nav is-prev"
            aria-label="Previous photo"
            onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
          >
            <ChevronLeft size={26} />
          </button>
          <figure>
            <img src={images[activeImage]} alt={`${selectedHotel.hotelName} ${activeImage + 1}`} />
            <figcaption>
              {activeImage + 1} / {images.length}
            </figcaption>
          </figure>
          <button
            type="button"
            className="bf26-lb-nav is-next"
            aria-label="Next photo"
            onClick={() => setActiveImage((i) => (i + 1) % images.length)}
          >
            <ChevronRight size={26} />
          </button>
          <div className="bf26-lb-thumbs">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={i === activeImage ? "is-active" : ""}
                onClick={() => setActiveImage(i)}
                aria-label={`Show photo ${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default HotelSelected;
