import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  ArrowLeft,
  ArrowRight,
  TrainFront,
  CalendarDays,
  Users,
  Repeat,
  Clock,
  ChevronDown,
  Coffee,
  PlugZap,
  Wifi,
  Luggage,
  Accessibility,
  Zap,
  Info,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  MapPin,
  Search,
} from "lucide-react";
import { BookingSteps } from "./flightresults";
import { formatMoney } from "../lib/bookingStorage";
import { formatDay, minutesToLabel } from "../lib/travelMeta";
import {
  planJourneys,
  stationCode,
  stationLabel,
  STATIONS,
} from "../lib/trainNetwork";
import "./train.css";

const TRAIN_STEPS = ["Search", "Train", "Traveller details", "Payment"];
const AMENITY_ICONS = {
  "Café car": Coffee,
  "Power sockets": PlugZap,
  "Wi-Fi": Wifi,
  "Luggage racks": Luggage,
  "Step-free access": Accessibility,
  "Non-stop": Zap,
};
const SLOTS = [
  ["morning", "Morning", Sunrise, (h) => h >= 5 && h < 12],
  ["afternoon", "Afternoon", Sun, (h) => h >= 12 && h < 18],
  ["evening", "Evening", Sunset, (h) => h >= 18],
  ["night", "Early", Moon, (h) => h < 5],
];
const hour = (hhmm) => Number(hhmm.slice(0, 2));

function FitRoute({ path }) {
  const map = useMap();
  useEffect(() => {
    if (!path.length) return;
    map.invalidateSize();
    map.fitBounds(path, { padding: [36, 36] });
  }, [map, path]);
  return null;
}

function RouteMap({ path, origin, destination, highlight }) {
  const center = path[0] || [3.139, 101.686];
  const stops = (highlight?.stops || [])
    .map((s) => ({ ...s, coords: STATIONS[s.name]?.coords }))
    .filter((s) => s.coords);
  return (
    <div className="bf26-map">
      <MapContainer
        center={center}
        zoom={9}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FitRoute path={path} />
        <Polyline positions={path} pathOptions={{ color: "#ffffff", weight: 9, opacity: 0.9 }} />
        <Polyline
          positions={path}
          pathOptions={{ color: highlight?.color || "#1d4a3f", weight: 5, opacity: 0.95 }}
        />
        {stops.map((s) => (
          <CircleMarker
            key={s.name}
            center={s.coords}
            radius={5}
            pathOptions={{ color: "#1d4a3f", weight: 2, fillColor: "#fff", fillOpacity: 1 }}
          >
            <Tooltip>{s.name}</Tooltip>
          </CircleMarker>
        ))}
        {[origin, destination].map(
          (name, i) =>
            STATIONS[name] && (
              <CircleMarker
                key={name}
                center={STATIONS[name].coords}
                radius={9}
                pathOptions={{
                  color: "#fff",
                  weight: 3,
                  fillColor: i === 0 ? "#1d4a3f" : "#9dbf2c",
                  fillOpacity: 1,
                }}
              >
                <Tooltip permanent direction={i === 0 ? "left" : "right"} className="bf26-map-label">
                  {stationLabel(name)}
                </Tooltip>
              </CircleMarker>
            ),
        )}
      </MapContainer>
    </div>
  );
}

const TrainPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [savedSearch] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("trainSearch"));
    } catch {
      return null;
    }
  });
  const bookingData = location.state?.bookingData || savedSearch;
  const [sort, setSort] = useState("departure");
  const [brand, setBrand] = useState("all");
  const [slots, setSlots] = useState([]);
  const [open, setOpen] = useState(null);

  const origin = bookingData?.location;
  const destination = bookingData?.location1;
  const plan = useMemo(
    () => (bookingData ? planJourneys(origin, destination) : null),
    [bookingData, origin, destination],
  );

  if (!bookingData) {
    return (
      <section className="bf-empty">
        <TrainFront size={36} />
        <h1>Plan your train journey.</h1>
        <p>Choose your stations and travel dates to see routes.</p>
        <Link className="bf-primary" to="/">
          Search trains <ArrowRight size={16} />
        </Link>
      </section>
    );
  }

  const { startDate, returnDate } = bookingData;
  const people = Number(bookingData.people) || 1;
  const legs = returnDate ? 2 : 1;
  const { journeys, path, error } = plan;
  const brands = [...new Set(journeys.map((j) => j.brand))];
  const list = journeys
    .filter(
      (j) =>
        (brand === "all" || j.brand === brand) &&
        (!slots.length ||
          SLOTS.some(([key, , , test]) => slots.includes(key) && test(hour(j.departureTime)))),
    )
    .sort((a, b) =>
      sort === "price"
        ? a.fare - b.fare
        : sort === "duration"
          ? a.minutes - b.minutes
          : a.departureTime.localeCompare(b.departureTime),
    );
  const fastest = journeys.length ? Math.min(...journeys.map((j) => j.minutes)) : 0;
  const cheapest = journeys.length ? Math.min(...journeys.map((j) => j.fare)) : 0;
  const highlight = journeys.find((j) => j.id === open) || list[0];

  function select(journey) {
    const selectedTrain = {
      LineID: journey.number,
      details: journey.brand,
      price: journey.fare,
      totalPrice: journey.fare * people * legs,
      departureTime: journey.departureTime,
      arrivalTime: journey.arrivalTime,
      travelTime: minutesToLabel(journey.minutes),
      origin,
      destination,
      startDate,
      returnDate: returnDate || "",
      people,
    };
    navigate("/fillform", { state: { selectedTrain } });
  }

  return (
    <section className="bf26-results bf26-train">
      <div className="bf26-results-top">
        <Link className="bf-back" to="/">
          <ArrowLeft size={15} /> Change your search
        </Link>
        <BookingSteps current="Train" steps={TRAIN_STEPS} />
      </div>

      <header className="bf26-route bf26-route-train">
        <div className="bf26-route-main">
          <span className="bf26-kicker">
            <TrainFront size={14} /> Choose your train
          </span>
          <div className="bf26-route-cities">
            <div>
              <strong>{stationCode(origin)}</strong>
              <span>{stationLabel(origin)}</span>
            </div>
            <div className="bf26-route-line" aria-hidden="true">
              <i />
              <TrainFront size={20} />
              <i />
            </div>
            <div>
              <strong>{stationCode(destination)}</strong>
              <span>{stationLabel(destination)}</span>
            </div>
          </div>
          <p className="bf26-route-meta">
            <span>
              <CalendarDays size={15} /> {formatDay(startDate, { year: "numeric" })}
            </span>
            {returnDate && (
              <span>
                <Repeat size={15} /> Return {formatDay(returnDate)}
              </span>
            )}
            <span>
              <Users size={15} /> {people} {people === 1 ? "passenger" : "passengers"}
            </span>
            <span>Standard class</span>
          </p>
        </div>
        <div className="bf26-route-side">
          {journeys.length > 0 && (
            <div className="bf26-from-price">
              <span className="bf26-kicker">Fares from</span>
              <strong>{formatMoney(cheapest)}</strong>
              <small>
                per passenger, one way · fastest {minutesToLabel(fastest)}
              </small>
            </div>
          )}
        </div>
      </header>

      {error ? (
        <div className="bf26-empty-card bf26-train-empty">
          <MapPin size={28} />
          <h2>{error}</h2>
          <p>
            Try one of these stations:{" "}
            {Object.keys(STATIONS).map(stationLabel).join(", ")}.
          </p>
          <Link className="bf26-primary" to="/">
            <Search size={16} /> New search
          </Link>
        </div>
      ) : (
        <div className="bf26-train-layout">
          <div className="bf26-list">
            <div className="bf26-train-controls">
              <div className="bf26-segment bf26-segment-3" role="tablist" aria-label="Sort trains">
                {[
                  ["departure", "Earliest"],
                  ["duration", "Fastest"],
                  ["price", "Cheapest"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    role="tab"
                    aria-selected={sort === value}
                    className={sort === value ? "is-active" : ""}
                    onClick={() => setSort(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="bf26-chips" aria-label="Filter trains">
                {["all", ...brands].map((b) => (
                  <button
                    key={b}
                    type="button"
                    aria-pressed={brand === b}
                    className={brand === b ? "is-active" : ""}
                    onClick={() => setBrand(b)}
                  >
                    {b === "all" ? "All services" : b}
                  </button>
                ))}
                <span className="bf26-chips-sep" />
                {SLOTS.map(([key, label, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={slots.includes(key)}
                    className={slots.includes(key) ? "is-active" : ""}
                    onClick={() =>
                      setSlots(
                        slots.includes(key) ? slots.filter((s) => s !== key) : [...slots, key],
                      )
                    }
                  >
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bf26-list-bar">
              <span>
                <strong>{list.length}</strong> trains on {formatDay(startDate)}
              </span>
            </div>

            {list.length === 0 && (
              <div className="bf26-empty-card">
                <TrainFront size={28} />
                <h2>No trains match these filters.</h2>
                <button
                  type="button"
                  className="bf26-ghost"
                  onClick={() => {
                    setBrand("all");
                    setSlots([]);
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}

            {list.map((j, index) => {
              const isOpen = open === j.id;
              return (
                <article
                  key={j.id}
                  className={`bf26-flight bf26-rail ${isOpen ? "is-open" : ""}`}
                  style={{ "--line": j.color, animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <div className="bf26-flight-main">
                    <div className="bf26-flight-airline">
                      <span className="bf26-rail-badge" aria-hidden="true">
                        <TrainFront size={20} />
                      </span>
                      <span>
                        <strong>{j.brand}</strong>
                        <small>
                          {j.number} · {j.seatsLeft < 10 ? (
                            <b className="bf26-scarce">{j.seatsLeft} seats left</b>
                          ) : (
                            "Standard"
                          )}
                        </small>
                      </span>
                    </div>
                    <div className="bf26-flight-times">
                      <div>
                        <strong>{j.departureTime}</strong>
                        <span>{stationCode(origin)}</span>
                      </div>
                      <div className="bf26-flight-path">
                        <small>
                          <Clock size={12} /> {minutesToLabel(j.minutes)}
                        </small>
                        <span aria-hidden="true">
                          <i />
                          {j.changes > 0 && <b />}
                          <TrainFront size={14} />
                        </span>
                        <small className={!j.changes && j.stops.length <= 2 ? "is-direct" : ""}>
                          {j.changes
                            ? "1 change · KL Sentral"
                            : j.stops.length > 2
                              ? `${j.stops.length - 2} stops`
                              : "Non-stop"}
                        </small>
                      </div>
                      <div>
                        <strong>
                          {j.arrivalTime}
                          {j.nextDay && <sup>+1</sup>}
                        </strong>
                        <span>{stationCode(destination)}</span>
                      </div>
                    </div>
                    <div className="bf26-flight-fare">
                      <div className="bf26-tags">
                        {j.fare === cheapest && <span className="is-lime">Cheapest</span>}
                        {j.minutes === fastest && <span className="is-sky">Fastest</span>}
                      </div>
                      <strong>{formatMoney(j.fare * people * legs)}</strong>
                      <small>
                        {formatMoney(j.fare)} × {people}
                        {legs > 1 ? " × 2 ways" : ""}
                      </small>
                      <button type="button" className="bf26-primary" onClick={() => select(j)}>
                        Select <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="bf26-flight-toggle"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : j.id)}
                  >
                    {j.amenities.map((a) => {
                      const Icon = AMENITY_ICONS[a] || Info;
                      return (
                        <span key={a} className="bf26-hide-sm">
                          <Icon size={14} /> {a}
                        </span>
                      );
                    })}
                    <em>
                      {isOpen ? "Hide stops" : "Stops & times"} <ChevronDown size={15} />
                    </em>
                  </button>
                  {isOpen && (
                    <div className="bf26-flight-details bf26-rail-details">
                      <ol className="bf26-timeline bf26-rail-stops">
                        {j.stops.map((s, i) => (
                          <li
                            key={`${s.name}-${i}`}
                            className={
                              i === 0 || i === j.stops.length - 1
                                ? "is-end"
                                : s.change
                                  ? "is-change"
                                  : "is-stop"
                            }
                          >
                            <strong>{s.time}</strong>
                            <span>
                              {stationLabel(s.name)}
                              {s.change && <small>Change trains · allow 20 min</small>}
                            </span>
                          </li>
                        ))}
                      </ol>
                      <div className="bf26-fare-box">
                        <span className="bf26-kicker">Fare breakdown</span>
                        <p>
                          <span>Per passenger, one way</span>
                          <strong>{formatMoney(j.fare)}</strong>
                        </p>
                        <p>
                          <span>Passengers</span>
                          <strong>× {people}</strong>
                        </p>
                        {legs > 1 && (
                          <p>
                            <span>Return on {formatDay(returnDate)}</span>
                            <strong>× 2</strong>
                          </p>
                        )}
                        <p className="is-total">
                          <span>Total</span>
                          <strong>{formatMoney(j.fare * people * legs)}</strong>
                        </p>
                        <small>
                          Sample timetable and fares. Confirm schedules with the
                          operator before travelling.
                        </small>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <aside className="bf26-train-side">
            <div className="bf26-map-card">
              <RouteMap
                path={path}
                origin={origin}
                destination={destination}
                highlight={highlight}
              />
              <div className="bf26-map-foot">
                <span className="bf26-rail-dot" style={{ background: highlight?.color }} />
                <span>
                  <strong>{highlight?.brand}</strong>
                  <small>
                    {highlight?.departureTime} → {highlight?.arrivalTime} ·{" "}
                    {minutesToLabel(highlight?.minutes || 0)}
                  </small>
                </span>
              </div>
            </div>
            <p className="bf26-note">
              <Info size={14} /> Sample rail routes and fares. Confirm schedules
              with the operator before travelling.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
};

export default TrainPage;
