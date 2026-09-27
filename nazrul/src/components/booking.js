import React, { useState } from "react";
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

// Values stay identical to the strings the results pages already understand.
export const AIRPORTS = [
  { value: "Kuala Lumpur International Airport (Malaysia)", code: "KUL", city: "Kuala Lumpur", name: "Kuala Lumpur International", country: "Malaysia", flag: "🇲🇾" },
  { value: "Kota Kinabalu International Airport (Malaysia)", code: "BKI", city: "Kota Kinabalu", name: "Kota Kinabalu International", country: "Malaysia", flag: "🇲🇾" },
  { value: "London Heathrow Airport (United Kingdom)", code: "LHR", city: "London", name: "Heathrow Airport", country: "United Kingdom", flag: "🇬🇧" },
  { value: "Haneda International Airport (Japan)", code: "HND", city: "Tokyo", name: "Haneda International", country: "Japan", flag: "🇯🇵" },
  { value: "Ngurah Rai International Airport (Bali)", code: "DPS", city: "Bali", name: "Ngurah Rai International", country: "Indonesia", flag: "🇮🇩" },
  { value: "Changi Airport (Singapore)", code: "SIN", city: "Singapore", name: "Changi Airport", country: "Singapore", flag: "🇸🇬" },
  { value: "Bangkok Suvarnabhumi Airport (Thailand)", code: "BKK", city: "Bangkok", name: "Suvarnabhumi Airport", country: "Thailand", flag: "🇹🇭" },
  { value: "Charles de Gaulle Airport (France)", code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France", flag: "🇫🇷" },
  { value: "Dubai International Airport (United Arab Emirates)", code: "DXB", city: "Dubai", name: "Dubai International", country: "United Arab Emirates", flag: "🇦🇪" },
  { value: "Incheon International Airport (South Korea)", code: "ICN", city: "Seoul", name: "Incheon International", country: "South Korea", flag: "🇰🇷" },
  { value: "Sydney Kingsford Smith Airport (Australia)", code: "SYD", city: "Sydney", name: "Kingsford Smith Airport", country: "Australia", flag: "🇦🇺" },
];
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
    <section className="bf-search-card" id="trip-search" aria-label="Search your trip">
      <div className="bf-search-top">
        <div className="bf-tabs" aria-label="Booking type">
          {MODES.map(([value, label, Icon]) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              className={mode === value ? "active" : ""}
              onClick={() => selectMode(value)}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
        <span className="bf-search-caption">
          {mode === "vacation"
            ? "Flight + hotel in one search"
            : "A little planning. A world of possibility."}
        </span>
      </div>
      <form onSubmit={submit} noValidate>
        <div className="bf-search-options">
          {(mode === "flight" || mode === "train") && (
            <div className="bf26-trip-toggle" role="radiogroup" aria-label="Trip type">
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
                  {label}
                </button>
              ))}
            </div>
          )}
          <span>
            {mode === "hotel"
              ? "Find somewhere to call your own"
              : mode === "vacation"
                ? "Return flights + hotel for the same dates"
                : mode === "train"
                  ? "Standard class"
                  : "Economy cabin"}
          </span>
          <TravellersPicker
            value={party}
            onChange={setParty}
            noun={mode === "hotel" ? "guest" : mode === "train" ? "passenger" : "traveller"}
          />
        </div>
        <div className={`bf-search-fields ${mode === "hotel" ? "bf-hotel-search" : ""}`}>
          <div className={`bf26-pair ${mode === "hotel" ? "is-single" : ""}`}>
            {mode !== "hotel" && (
              <PlacePicker
                label="FROM"
                ariaLabel="From"
                kind={kind}
                value={origin}
                onChange={setOrigin}
                options={options}
                placeholder="City or airport"
                hint={mode === "train" ? "Departure station" : "Departure city or airport"}
              />
            )}
            {mode !== "hotel" && (
              <button
                className="bf-swap"
                type="button"
                aria-label="Swap departure and destination"
                onClick={() => {
                  setOrigin(destination);
                  setDestination(origin);
                }}
              >
                <ArrowLeftRight size={17} />
              </button>
            )}
            <PlacePicker
              label={mode === "hotel" ? "DESTINATION" : "TO"}
              ariaLabel="Destination"
              kind={kind}
              value={destination}
              onChange={setDestination}
              options={options.filter((o) => mode === "hotel" || o.value !== origin)}
              placeholder={mode === "hotel" ? "Where are you staying?" : "Where to?"}
              hint={
                mode === "train"
                  ? "Arrival station"
                  : mode === "hotel"
                    ? "City or destination"
                    : mode === "vacation"
                      ? "Flight + stay destination"
                      : "Your next adventure"
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
            labels={mode === "hotel" ? ["CHECK-IN", "CHECK-OUT"] : ["DEPARTURE", "RETURN"]}
            hints={
              mode === "hotel"
                ? ["First day of your stay", "Last day of your stay"]
                : ["Start your journey", "Head back home"]
            }
            onChange={(start, end) => {
              setDepartureDate(start);
              setReturnDate(end);
            }}
          />
          <button className="bf-search-submit" type="submit">
            <Search size={20} />
            <span>
              Search{" "}
              {mode === "flight"
                ? "flights"
                : mode === "hotel"
                  ? "hotels"
                  : mode === "vacation"
                    ? "packages"
                    : "trains"}
            </span>
            <ArrowRight size={18} />
          </button>
        </div>
        <div className="bf-search-bottom">
          <span>
            <Info size={13} /> Preview fares · Sample travel inventory
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
