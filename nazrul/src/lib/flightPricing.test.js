import { flightTotals } from "./flightPricing";
import { generateMockFlights } from "../mockdata/flights";
import { generateMockReturnFlights1 } from "../mockdata/returnlondon";
test("does not double-charge one-way flights and multiplies by travellers", () => {
  expect(flightTotals({ price: 300 }, null, 2)).toEqual({
    outbound: 600,
    returning: 0,
    taxes: 50,
    extras: 0,
    total: 650,
  });
});
test("round-trip total includes both legs and extras once", () => {
  expect(flightTotals({ price: 300 }, { price: 200 }, 3, 2, 35).total).toBe(
    1625,
  );
});
test("mock flight duration stays correct in the local time zone", () => {
  const [flight] = generateMockFlights("2027-01-10", "", "KUL", "LHR");
  expect(flight.arrival).toBe("2027-01-10T17:00:00");
});
test("return flights reverse the outbound route", () => {
  const [flight] = generateMockReturnFlights1(
    "2027-01-15",
    "2027-01-15",
    "KUL",
    "LHR",
  );
  expect(flight.origin).toBe("LHR");
  expect(flight.destination).toBe("KUL");
  expect(flight.arrival).toBe("2027-01-15T23:00:00");
});
