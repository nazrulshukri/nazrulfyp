import React, { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Plane,
  ArrowRight,
  ArrowLeft,
  SlidersHorizontal,
  CalendarDays,
  Users,
  Info,
  Check,
  Zap,
  BadgeDollarSign,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Luggage,
  Briefcase,
  Wifi,
  Utensils,
  ChevronDown,
  X,
  BedDouble,
  Palmtree,
} from "lucide-react";
import { generateMockFlights } from "../mockdata/flights";
import { generateMockReturnFlights1 } from "../mockdata/returnlondon";
import { validateSearch, localDate } from "../lib/searchValidation";
import { formatMoney } from "../lib/bookingStorage";
import {
  airlineMeta,
  airportMeta,
  formatDay,
  shiftDate,
  indicativeFare,
  minutesToLabel,
} from "../lib/travelMeta";

const readSaved = () => {
  try {
    const value = JSON.parse(localStorage.getItem("flightParams"));
    return value?.flightParams || value;
  } catch {
    return null;
  }
};
const time = (value) =>
  new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
const minutes = (flight) =>
  Math.round((new Date(flight.arrival) - new Date(flight.departure)) / 60000);
const hourOf = (flight) => new Date(flight.departure).getHours();

const TIME_SLOTS = [
  ["morning", "Morning", "05–12", Sunrise, (h) => h >= 5 && h < 12],
  ["afternoon", "Afternoon", "12–18", Sun, (h) => h >= 12 && h < 18],
  ["evening", "Evening", "18–24", Sunset, (h) => h >= 18],
  ["night", "Night", "00–05", Moon, (h) => h < 5],
];

export function AirlineBadge({ name, size = 44 }) {
  const { code, color, logo } = airlineMeta(name);
  const [failed, setFailed] = useState(false);
  if (logo && !failed) {
    return (
      <span
        className="bf26-airline has-logo"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <img src={logo} alt="" onError={() => setFailed(true)} />
      </span>
    );
  }
  return (
    <span
      className="bf26-airline"
      style={{ "--airline": color, width: size, height: size }}
      aria-hidden="true"
    >
      {code}
    </span>
  );
}

export function BookingSteps({ current, tripType, steps: custom }) {
  const steps = custom ? [...custom] : ["Search", "Outbound"];
  if (!custom) {
    if (tripType === "return") steps.push("Return");
    steps.push("Traveller details", "Payment");
  }
  const index = Math.max(0, steps.indexOf(current));
  return (
    <ol className="bf26-steps" aria-label="Booking progress">
      {steps.map((step, i) => (
        <li
          key={step}
          className={i < index ? "is-done" : i === index ? "is-current" : ""}
          aria-current={i === index ? "step" : undefined}
        >
          <span>{i < index ? <Check size={13} /> : i + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  );
}

export default function FlightResults({ returnLeg = false }) {
  const { state, pathname } = useLocation();
  const navigate = useNavigate();
  const params = useMemo(
    () =>
      returnLeg ? state?.flightParams : state?.flightParams || readSaved(),
    [state, returnLeg],
  );
  const [airlines, setAirlines] = useState([]);
  const [stops, setStops] = useState("any");
  const [slots, setSlots] = useState([]);
  const [maxDuration, setMaxDuration] = useState(24);
  const [sort, setSort] = useState("price");
  const [expanded, setExpanded] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const people = Number(params?.people) || 1;

  const flights = useMemo(() => {
    if (
      !params ||
      validateSearch({
        mode: "flight",
        ...params,
        adults: Number(params.adults ?? people),
        children: Number(params.children || 0),
        infants: Number(params.infants || 0),
      })
    )
      return [];
    if (returnLeg)
      return generateMockReturnFlights1(
        params.returnDate,
        params.returnDate,
        params.origin,
        params.destination,
      );
    return generateMockFlights(
      params.departureDate,
      params.returnDate,
      params.origin,
      params.destination,
    );
  }, [params, returnLeg, people]);

  const stats = useMemo(() => {
    if (!flights.length) return null;
    const byPrice = [...flights].sort((a, b) => a.price - b.price)[0];
    const byTime = [...flights].sort((a, b) => minutes(a) - minutes(b))[0];
    const byDeparture = [...flights].sort(
      (a, b) => new Date(a.departure) - new Date(b.departure),
    )[0];
    return { byPrice, byTime, byDeparture };
  }, [flights]);

  const airlineOptions = useMemo(() => {
    const map = new Map();
    flights.forEach((f) => {
      map.set(f.airline, Math.min(map.get(f.airline) ?? Infinity, f.price));
    });
    return [...map.entries()].sort((a, b) => a[1] - b[1]);
  }, [flights]);

  const filtered = flights
    .filter(
      (f) =>
        (!airlines.length || airlines.includes(f.airline)) &&
        (stops !== "direct" || f.nonStop) &&
        minutes(f) <= maxDuration * 60 &&
        (!slots.length ||
          TIME_SLOTS.some(
            ([key, , , , test]) => slots.includes(key) && test(hourOf(f)),
          )),
    )
    .sort((a, b) =>
      sort === "duration"
        ? minutes(a) - minutes(b)
        : sort === "departure"
          ? new Date(a.departure) - new Date(b.departure)
          : a.price - b.price,
    );

  const activeFilters =
    airlines.length + slots.length + (stops !== "any") + (maxDuration < 24);

  function resetFilters() {
    setAirlines([]);
    setSlots([]);
    setStops("any");
    setMaxDuration(24);
  }

  function toggle(list, setList, value) {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  }

  function changeDate(date) {
    const next = returnLeg
      ? { ...params, returnDate: date }
      : {
          ...params,
          departureDate: date,
          returnDate:
            params.returnDate && params.returnDate < date
              ? date
              : params.returnDate,
        };
    if (!returnLeg) localStorage.setItem("flightParams", JSON.stringify(next));
    setExpanded(null);
    navigate(pathname, { replace: true, state: { ...state, flightParams: next } });
  }

  function select(flight) {
    if (!returnLeg && params.tripType === "return") {
      navigate("/return", {
        state: { flightParams: params, selectedOutboundFlight: flight },
      });
    } else {
      navigate("/payment", {
        state: {
          outboundFlight: returnLeg ? state.selectedOutboundFlight : flight,
          returnFlight: returnLeg ? flight : null,
          people,
          passengers: {
            adults: params.adults,
            children: params.children,
            infants: params.infants,
          },
          tripType: params.tripType,
          vacation: params.vacation,
        },
      });
    }
  }

  if (
    !params ||
    !flights.length ||
    (returnLeg && !state?.selectedOutboundFlight)
  )
    return (
      <section className="bf-empty">
        <Plane size={36} />
        <h1>Let’s find your next flight.</h1>
        <p>
          Your search is missing or has expired. Choose a route and new travel
          dates.
        </p>
        <Link className="bf-primary" to="/">
          Search flights <ArrowRight size={16} />
        </Link>
      </section>
    );

  const from = airportMeta(returnLeg ? params.destination : params.origin);
  const to = airportMeta(returnLeg ? params.origin : params.destination);
  const currentDate = returnLeg ? params.returnDate : params.departureDate;
  const earliest = returnLeg ? params.departureDate : localDate();
  const cheapest = stats.byPrice.price;
  const dates = [-3, -2, -1, 0, 1, 2, 3]
    .map((offset) => shiftDate(currentDate, offset))
    .filter((d) => d >= earliest);
  const outbound = state?.selectedOutboundFlight;

  return (
    <section className="bf26-results">
      <div className="bf26-results-top">
        <Link className="bf-back" to="/">
          <ArrowLeft size={15} /> Change your search
        </Link>
        <BookingSteps
          current={returnLeg ? "Return" : "Outbound"}
          tripType={params.tripType}
        />
      </div>

      <header className="bf26-route">
        <div className="bf26-route-main">
          <span className="bf26-kicker">
            {returnLeg ? "Choose your return flight" : "Choose your outbound flight"}
          </span>
          <div className="bf26-route-cities">
            <div>
              <strong>{from.code}</strong>
              <span>{from.city}</span>
            </div>
            <div className="bf26-route-line" aria-hidden="true">
              <i />
              <Plane size={20} />
              <i />
            </div>
            <div>
              <strong>{to.code}</strong>
              <span>{to.city}</span>
            </div>
          </div>
          <p className="bf26-route-meta">
            <span>
              <CalendarDays size={15} /> {formatDay(currentDate, { year: "numeric" })}
            </span>
            <span>
              <Users size={15} /> {people} {people === 1 ? "traveller" : "travellers"}
            </span>
            <span>Economy</span>
            <span>{params.tripType === "return" ? "Round trip" : "One way"}</span>
          </p>
        </div>
        <div className="bf26-route-side">
          {outbound ? (
            <div className="bf26-chosen">
              <span className="bf26-kicker">Outbound selected</span>
              <div>
                <AirlineBadge name={outbound.airline} size={36} />
                <span>
                  <strong>
                    {time(outbound.departure)} – {time(outbound.arrival)}
                  </strong>
                  <small>
                    {outbound.airline} · {formatDay(outbound.departure)}
                  </small>
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  navigate("/flight-results", {
                    state: { flightParams: params },
                  })
                }
              >
                Change
              </button>
            </div>
          ) : (
            <div className="bf26-from-price">
              <span className="bf26-kicker">Fares from</span>
              <strong>{formatMoney(cheapest)}</strong>
              <small>per traveller · sample fare</small>
            </div>
          )}
        </div>
      </header>

      {params.vacation && (
        <div className="bf26-vacation">
          <Palmtree size={20} />
          <p>
            <strong>Vacation package · {params.vacation.city}</strong>
            <span>
              Pick your flights, then add a stay in {params.vacation.city} for
              the same dates.
            </span>
          </p>
          <Link to="/hotel" className="bf26-ghost">
            <BedDouble size={16} /> Browse stays
          </Link>
        </div>
      )}

      <nav className="bf26-datestrip" aria-label="Nearby dates">
        {dates.map((date) => {
          const fare = date === currentDate ? cheapest : indicativeFare(cheapest, date);
          const low = fare <= cheapest;
          return (
            <button
              key={date}
              type="button"
              className={date === currentDate ? "is-active" : ""}
              aria-pressed={date === currentDate}
              onClick={() => date !== currentDate && changeDate(date)}
            >
              <small>{formatDay(date, { day: undefined, month: undefined })}</small>
              <strong>{formatDay(date, { weekday: undefined })}</strong>
              <em className={low ? "is-low" : ""}>
                {formatMoney(fare).replace(".00", "")}
              </em>
            </button>
          );
        })}
      </nav>

      <div className="bf26-sorts" role="tablist" aria-label="Sort flights">
        {[
          ["price", "Cheapest", BadgeDollarSign, stats.byPrice],
          ["duration", "Fastest", Zap, stats.byTime],
          ["departure", "Earliest", Sunrise, stats.byDeparture],
        ].map(([value, label, Icon, flight]) => (
          <button
            key={value}
            role="tab"
            aria-selected={sort === value}
            className={sort === value ? "is-active" : ""}
            onClick={() => setSort(value)}
          >
            <Icon size={18} />
            <span>
              <strong>{label}</strong>
              <small>
                {formatMoney(flight.price).replace(".00", "")} ·{" "}
                {value === "departure"
                  ? time(flight.departure)
                  : minutesToLabel(minutes(flight))}
              </small>
            </span>
          </button>
        ))}
      </div>

      <div className="bf26-results-layout">
        <aside className={`bf26-filters ${filtersOpen ? "is-open" : ""}`}>
          <div className="bf26-filters-head">
            <h2>
              <SlidersHorizontal size={17} /> Filters
              {activeFilters > 0 && <span>{activeFilters}</span>}
            </h2>
            <button type="button" onClick={resetFilters} disabled={!activeFilters}>
              Reset
            </button>
            <button
              type="button"
              className="bf26-filters-close"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <fieldset>
            <legend>Stops</legend>
            <div className="bf26-segment">
              {[
                ["any", "Any"],
                ["direct", "Direct only"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={stops === value}
                  className={stops === value ? "is-active" : ""}
                  onClick={() => setStops(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Departure time</legend>
            <div className="bf26-slots">
              {TIME_SLOTS.map(([key, label, range, Icon]) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={slots.includes(key)}
                  className={slots.includes(key) ? "is-active" : ""}
                  onClick={() => toggle(slots, setSlots, key)}
                >
                  <Icon size={17} />
                  <strong>{label}</strong>
                  <small>{range}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>
              Max journey time <strong>{maxDuration}h</strong>
            </legend>
            <input
              type="range"
              min="1"
              max="24"
              value={maxDuration}
              aria-label="Maximum journey time in hours"
              onChange={(e) => setMaxDuration(Number(e.target.value))}
              style={{ "--fill": `${((maxDuration - 1) / 23) * 100}%` }}
            />
          </fieldset>

          <fieldset>
            <legend>Airlines</legend>
            <div className="bf26-airline-list">
              {airlineOptions.map(([name, price]) => (
                <label key={name}>
                  <input
                    type="checkbox"
                    checked={airlines.includes(name)}
                    onChange={() => toggle(airlines, setAirlines, name)}
                  />
                  <AirlineBadge name={name} size={26} />
                  <span>{name}</span>
                  <small>{formatMoney(price).replace(".00", "")}</small>
                </label>
              ))}
            </div>
          </fieldset>

          <p className="bf26-note">
            <Info size={14} /> Demonstration fares. Availability and prices are
            not connected to airline inventory.
          </p>
          <button
            type="button"
            className="bf26-primary bf26-filters-apply"
            onClick={() => setFiltersOpen(false)}
          >
            Show {filtered.length} flights
          </button>
        </aside>

        <div className="bf26-list">
          <div className="bf26-list-bar">
            <span>
              <strong>{filtered.length}</strong> of {flights.length} flights
            </span>
            <button
              type="button"
              className="bf26-filter-toggle"
              onClick={() => setFiltersOpen(true)}
            >
              <SlidersHorizontal size={16} /> Filters
              {activeFilters > 0 && <span>{activeFilters}</span>}
            </button>
          </div>

          {filtered.length === 0 && (
            <div className="bf26-empty-card">
              <Plane size={28} />
              <h2>No flights match these filters.</h2>
              <p>Try a longer journey time or include connecting flights.</p>
              <button type="button" className="bf26-ghost" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}

          {filtered.map((flight, index) => {
            const isCheapest = flight.id === stats.byPrice.id;
            const isFastest = flight.id === stats.byTime.id;
            const nextDay =
              flight.arrival.slice(0, 10) !== flight.departure.slice(0, 10);
            const open = expanded === flight.id;
            const dep = airportMeta(flight.origin);
            const arr = airportMeta(flight.destination);
            return (
              <article
                className={`bf26-flight ${open ? "is-open" : ""}`}
                key={flight.id}
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <div className="bf26-flight-main">
                  <div className="bf26-flight-airline">
                    <AirlineBadge name={flight.airline} />
                    <span>
                      <strong>{flight.airline}</strong>
                      <small>{flight.flightNumber} · Economy</small>
                    </span>
                  </div>

                  <div className="bf26-flight-times">
                    <div>
                      <strong>{time(flight.departure)}</strong>
                      <span>{dep.code}</span>
                    </div>
                    <div className="bf26-flight-path">
                      <small>{minutesToLabel(minutes(flight))}</small>
                      <span aria-hidden="true">
                        <i />
                        {!flight.nonStop && <b />}
                        <Plane size={14} />
                      </span>
                      <small className={flight.nonStop ? "is-direct" : ""}>
                        {flight.nonStop ? "Direct" : "1 stop"}
                      </small>
                    </div>
                    <div>
                      <strong>
                        {time(flight.arrival)}
                        {nextDay && <sup>+1</sup>}
                      </strong>
                      <span>{arr.code}</span>
                    </div>
                  </div>

                  <div className="bf26-flight-fare">
                    <div className="bf26-tags">
                      {isCheapest && <span className="is-lime">Cheapest</span>}
                      {isFastest && <span className="is-sky">Fastest</span>}
                    </div>
                    <strong>{formatMoney(flight.price * people)}</strong>
                    <small>
                      {people > 1
                        ? `${formatMoney(flight.price)} × ${people} travellers`
                        : "per traveller"}
                    </small>
                    <button
                      type="button"
                      className="bf26-primary"
                      onClick={() => select(flight)}
                    >
                      Select <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="bf26-flight-toggle"
                  aria-expanded={open}
                  onClick={() => setExpanded(open ? null : flight.id)}
                >
                  <span>
                    <Briefcase size={14} /> 7 kg cabin
                  </span>
                  <span>
                    <Luggage size={14} /> 30 kg checked
                  </span>
                  <span className="bf26-hide-sm">
                    <Utensils size={14} /> Meal
                  </span>
                  <span className="bf26-hide-sm">
                    <Wifi size={14} /> Wi-Fi
                  </span>
                  <em>
                    {open ? "Hide details" : "Flight details"}{" "}
                    <ChevronDown size={15} />
                  </em>
                </button>

                {open && (
                  <div className="bf26-flight-details">
                    <ol className="bf26-timeline">
                      <li>
                        <strong>{time(flight.departure)}</strong>
                        <span>
                          {flight.origin}
                          <small>{formatDay(flight.departure, { year: "numeric" })}</small>
                        </span>
                      </li>
                      <li className="is-travel">
                        <small>
                          {minutesToLabel(minutes(flight))} ·{" "}
                          {flight.nonStop ? "Non-stop" : "Includes 1 connection"} ·{" "}
                          {flight.flightNumber}
                        </small>
                      </li>
                      <li>
                        <strong>{time(flight.arrival)}</strong>
                        <span>
                          {flight.destination}
                          <small>{formatDay(flight.arrival, { year: "numeric" })}</small>
                        </span>
                      </li>
                    </ol>
                    <div className="bf26-fare-box">
                      <span className="bf26-kicker">Fare breakdown</span>
                      <p>
                        <span>Per traveller</span>
                        <strong>{formatMoney(flight.price)}</strong>
                      </p>
                      <p>
                        <span>Travellers</span>
                        <strong>× {people}</strong>
                      </p>
                      <p className="is-total">
                        <span>Flight total</span>
                        <strong>{formatMoney(flight.price * people)}</strong>
                      </p>
                      <small>
                        Taxes, seats and extras are added at checkout. Times are
                        illustrative local times, not a live schedule.
                      </small>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
      {filtersOpen && (
        <div
          className="bf26-scrim"
          onClick={() => setFiltersOpen(false)}
          aria-hidden="true"
        />
      )}
    </section>
  );
}
