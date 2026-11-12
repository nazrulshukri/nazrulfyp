import React, { useState } from "react";
import { t } from "../lib/i18n";
import { useNavigate } from "react-router-dom";
import {
  Plane,
  BedDouble,
  TrainFront,
  Palmtree,
  ArrowLeftRight,
  Search,
  ArrowRight,
  Info,
} from "lucide-react";
import { localDate, validateSearch } from "../lib/searchValidation";
import { airportMeta } from "../lib/travelMeta";
import { PlacePicker, DateRangeFields, TravellersPicker } from "./searchControls";
import { WORLD_AIRPORTS } from "../lib/airports";

// Values stay identical to the strings the results pages already understand.
export const AIRPORTS = WORLD_AIRPORTS;
const STATIONS = [
  { value: "KL Sentral", code: "KLS", name: "KL Sentral", city: "KL Sentral", country: "Kuala Lumpur" },
  { value: "KLIA", code: "KLIA", name: "KLIA Terminal 1", city: "KLIA", country: "Sepang" },
  { value: "KLIA2", code: "KLIA2", name: "KLIA Terminal 2", city: "KLIA2", country: "Sepang" },
  { value: "Terminal Bersepadu Selatan(TBS)", code: "TBS", name: "Terminal Bersepadu Selatan", city: "TBS", country: "Kuala Lumpur" },
  { value: "Ipoh", code: "IPH", name: "Ipoh Railway Station", city: "Ipoh", country: "Perak" },
  { value: "Butterworth", code: "BTW", name: "Butterworth Station", city: "Butterworth", country: "Penang" },
  { value: "Padang Besar", code: "PDB", name: "Padang Besar Station", city: "Padang Besar", country: "Perlis" },
];
const CITIES = [
  { value: "London", name: "Stays across the city", city: "London", country: "United Kingdom", flag: "🇬🇧" },
  { value: "Kuala Lumpur", name: "City centre & KLCC", city: "Kuala Lumpur", country: "Malaysia", flag: "🇲🇾" },
  { value: "Bali", name: "Beach & jungle resorts", city: "Bali", country: "Indonesia", flag: "🇮🇩" },
  { value: "Tokyo", name: "Shinjuku, Ginza & more", city: "Tokyo", country: "Japan", flag: "🇯🇵" },
  { value: "Paris", name: "Left Bank & Marais", city: "Paris", country: "France", flag: "🇫🇷" },
  { value: "Singapore", name: "Marina Bay & Orchard", city: "Singapore", country: "Singapore", flag: "🇸🇬" },
];

const placeKind = (mode) =>
  mode === "train" ? "station" : mode === "hotel" ? "city" : "airport";
const MODES = [
  ["flight", "Flights", Plane],
  ["hotel", "Hotels", BedDouble],
  ["vacation", "Vacations", Palmtree],
  ["train", "Trains", TrainFront],
];

export default function Booking({ destinationPreset, mode: modeProp, onModeChange }) {
  const navigate = useNavigate();
  const [innerMode, setInnerMode] = useState("flight");
  const mode = modeProp || innerMode;
  const kind = placeKind(mode);
  const [tripType, setTripType] = useState("return");
  const [origin, setOrigin] = useState(AIRPORTS[0].value);
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [party, setParty] = useState({ adults: 1, children: 0, infants: 0 });
  const [error, setError] = useState("");
  const { adults, children, infants } = party;

  // Only reset places when switching between airports, cities and stations.
  const previousKind = React.useRef(kind);
  React.useEffect(() => {
    setError("");
    if (previousKind.current === kind) return;
    previousKind.current = kind;
    setOrigin(kind === "station" ? "KL Sentral" : AIRPORTS[0].value);
    setDestination("");
  }, [kind]);
  React.useEffect(() => {
    if (destinationPreset) setDestination(destinationPreset.value);
  }, [destinationPreset]);
  function selectMode(next) {
    if (onModeChange) onModeChange(next);
    else setInnerMode(next);
  }

  const options = kind === "station" ? STATIONS : kind === "city" ? CITIES : AIRPORTS;
  const needsReturn = mode === "hotel" || mode === "vacation" || tripType === "return";

  function submit(event) {
    event.preventDefault();
    const search = {
      mode: mode === "vacation" ? "flight" : mode,
      origin,
      destination,
      departureDate,
      returnDate: needsReturn ? returnDate : "",
      tripType: mode === "vacation" ? "return" : tripType,
      adults,
      children,
      infants,
    };
    const problem = validateSearch(search);
    if (problem) {
      setError(problem);
      return;
    }
    const people = adults + children + infants;
    if (mode === "vacation") {
      const city = airportMeta(destination).city;
      const hotelParams = {
        checkInDate: departureDate,
        checkOutDate: returnDate,
        location: city,
        people,
      };
      const flightParams = { ...search, people, vacation: { city } };
      localStorage.setItem("hotelParams", JSON.stringify(hotelParams));
      localStorage.setItem("flightParams", JSON.stringify(flightParams));
      navigate("/flight-results", { state: { flightParams } });
    } else if (mode === "flight") {
      const flightParams = { ...search, people };
      localStorage.setItem("flightParams", JSON.stringify(flightParams));
      navigate("/flight-results", { state: { flightParams } });
    } else if (mode === "hotel") {
      const hotelParams = {
        checkInDate: departureDate,
        checkOutDate: returnDate,
        location: destination,
        people,
      };
      localStorage.setItem("hotelParams", JSON.stringify(hotelParams));
      navigate("/hotel", { state: { hotelParams } });
    } else {
      const bookingData = {
        startDate: departureDate,
        returnDate: tripType === "oneway" ? "" : returnDate,
        location: origin,
        location1: destination,
        people,
      };
      sessionStorage.setItem("trainSearch", JSON.stringify(bookingData));
      navigate("/train", { state: { bookingData } });
    }
  }

  return (
    <section className="bf-search-card" id="trip-search" aria-label={t("Search your trip")}>
      <div className="bf-search-top">
        <div className="bf-tabs" aria-label={t("Booking type")}>
          {MODES.map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              className={mode === value ? "active" : ""}
              onClick={() => selectMode(value)}
            >
              <Icon size={18} />
              {t(label)}
            </button>
          ))}
        </div>
        <span className="bf-search-caption">
          {mode === "vacation"
            ? t("Flight + hotel in one search")
            : t("A little planning. A world of possibility.")}
        </span>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="bf-search-options">
          {(mode === "flight" || mode === "train") && (
            <div className="bf26-trip-toggle" role="radiogroup" aria-label={t("Trip type")}>
              {[
                ["return", "Round trip"],
                ["oneway", "One way"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={tripType === value}
                  className={tripType === value ? "is-active" : ""}
                  onClick={() => {
                    setTripType(value);
                    if (value === "oneway") setReturnDate("");
                  }}
                >
                  {t(label)}
                </button>
              ))}
            </div>
          )}
          <span>
            {mode === "hotel"
              ? t("Find somewhere to call your own")
              : mode === "vacation"
                ? t("Return flights + hotel for the same dates")
                : mode === "train"
                  ? t("Standard class")
                  : t("Economy cabin")}
          </span>
          <TravellersPicker
            value={party}
            onChange={setParty}
            noun={mode === "hotel" ? t("guest") : mode === "train" ? "passenger" : t("traveller")}
          />
        </div>
        <div className={`bf-search-fields ${mode === "hotel" ? "bf-hotel-search" : ""}`}>
          <div className={`bf26-pair ${mode === "hotel" ? "is-single" : ""}`}>
            {mode !== "hotel" && (
              <PlacePicker
                label={t("FROM")}
                ariaLabel="From"
                kind={kind}
                value={origin}
                onChange={setOrigin}
                options={options}
                placeholder={t("City or airport")}
                hint={mode === "train" ? t("Departure station") : t("Departure city or airport")}
              />
            )}
            {mode !== "hotel" && (
              <button
                className="bf-swap"
                type="button"
                aria-label={t("Swap departure and destination")}
                onClick={() => {
                  setOrigin(destination);
                  setDestination(origin);
                }}
              >
                <ArrowLeftRight size={17} />
              </button>
            )}
            <PlacePicker
              label={mode === "hotel" ? t("DESTINATION") : t("TO")}
              ariaLabel="Destination"
              kind={kind}
              value={destination}
              onChange={setDestination}
              options={options.filter((o) => mode === "hotel" || o.value !== origin)}
              placeholder={mode === "hotel" ? t("Where are you staying?") : t("Where to?")}
              hint={
                mode === "train"
                  ? t("Arrival station")
                  : mode === "hotel"
                    ? t("City or destination")
                    : mode === "vacation"
                      ? t("Flight + stay destination")
                      : t("Your next adventure")
              }
            />
          </div>
          <DateRangeFields
            start={departureDate}
            end={returnDate}
            min={localDate()}
            range={needsReturn}
            minGap={mode === "hotel" ? 1 : 0}
            nightsLabel={mode === "hotel" || mode === "vacation"}
            labels={mode === "hotel" ? [t("CHECK-IN"), t("CHECK-OUT")] : [t("DEPARTURE"), t("RETURN")]}
            hints={
              mode === "hotel"
                ? [t("First day of your stay"), t("Last day of your stay")]
                : [t("Start your journey"), t("Head back home")]
            }
            onChange={(start, end) => {
              setDepartureDate(start);
              setReturnDate(end);
            }}
          />
          <button className="bf-search-submit" type="submit">
            <Search size={20} />
            <span>
              {t(
                mode === "flight"
                  ? "Search flights"
                  : mode === "hotel"
                    ? "Search hotels"
                    : mode === "vacation"
                      ? "Search vacations"
                      : "Search trains",
              )}
            </span>
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="bf-search-bottom">
          <span>
            <Info size={13} /> {t("Preview fares · Sample travel inventory")}
          </span>
        </div>
        {error && (
          <p className="bf-search-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
