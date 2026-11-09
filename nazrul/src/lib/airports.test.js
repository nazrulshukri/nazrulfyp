import { WORLD_AIRPORTS, airportByCode, distanceKm, fitFlightsToRoute, flightTimeLabel } from "./airports";
import { generateMockFlights } from "../mockdata/flights";
import { airportMeta } from "./travelMeta";

const v = (code) => airportByCode(code).value;
const minutes = (f) => (new Date(`${f.arrival}Z`) - new Date(`${f.departure}Z`)) / 60000;

test("airport values and codes are unique", () => {
  expect(new Set(WORLD_AIRPORTS.map((a) => a.value)).size).toBe(WORLD_AIRPORTS.length);
  expect(new Set(WORLD_AIRPORTS.map((a) => a.code)).size).toBe(WORLD_AIRPORTS.length);
});

test("keeps the original airport strings saved bookings use", () => {
  expect(v("KUL")).toBe("Kuala Lumpur International Airport (Malaysia)");
  expect(v("DPS")).toBe("Ngurah Rai International Airport (Bali)");
});

test("distances are sensible", () => {
  expect(distanceKm(v("KUL"), v("SIN"))).toBeGreaterThan(250);
  expect(distanceKm(v("KUL"), v("SIN"))).toBeLessThan(400);
  expect(distanceKm(v("KUL"), v("LHR"))).toBeGreaterThan(10000);
  expect(flightTimeLabel(v("KUL"), v("SIN"))).toMatch(/^1h/);
});

test("short routes get short, cheap flights; long routes long, dearer ones", () => {
  const short = fitFlightsToRoute(generateMockFlights("2027-01-10", "", v("KUL"), v("SIN")), v("KUL"), v("SIN"));
  const long = fitFlightsToRoute(generateMockFlights("2027-01-10", "", v("KUL"), v("JFK")), v("KUL"), v("JFK"));
  expect(Math.max(...short.map(minutes))).toBeLessThan(150);
  expect(Math.min(...long.map(minutes))).toBeGreaterThan(17 * 60);
  expect(Math.max(...short.map((f) => f.price))).toBeLessThan(Math.min(...long.map((f) => f.price)));
  expect(short.every((f) => f.nonStop)).toBe(true);
});

test("unknown airports leave the sample flights unchanged", () => {
  const flights = generateMockFlights("2027-01-10", "", "KUL", "LHR");
  expect(fitFlightsToRoute(flights, "KUL", "LHR")).toBe(flights);
});

test("airportMeta knows worldwide airports", () => {
  expect(airportMeta(v("CPT"))).toEqual({ code: "CPT", city: "Cape Town" });
});
