import { localDate, validateSearch } from "./searchValidation";
const valid = {
  mode: "flight",
  origin: "Kuala Lumpur",
  destination: "London",
  departureDate: "2027-01-10",
  returnDate: "2027-01-15",
  tripType: "return",
  adults: 2,
  children: 1,
  infants: 0,
};
const check = (changes) =>
  validateSearch({ ...valid, ...changes }, "2027-01-01");
test("allows a future round trip and a one-way journey without return date", () => {
  expect(check({})).toBe("");
  expect(check({ tripType: "oneway", returnDate: "" })).toBe("");
});
test("rejects matching routes and past travel dates", () => {
  expect(check({ destination: " kuala lumpur " })).toMatch(/different/);
  expect(check({ departureDate: "2026-12-31" })).toMatch(/today or later/);
});
test("rejects a return before departure and a same-day hotel stay", () => {
  expect(check({ returnDate: "2027-01-09" })).toMatch(/return date/);
  expect(
    check({ mode: "hotel", origin: "", returnDate: "2027-01-10" }),
  ).toMatch(/at least one day/);
});
test("hotels need a destination, not an origin", () =>
  expect(check({ mode: "hotel", origin: "" })).toBe(""));
test("rejects invalid traveller counts and unaccompanied infants", () => {
  expect(check({ adults: 0 })).toMatch(/1–9/);
  expect(check({ adults: 9, children: 1 })).toMatch(/1–9/);
  expect(check({ children: 1.5 })).toMatch(/1–9/);
  expect(check({ infants: 3 })).toMatch(/adult/);
});
test("formats calendar dates using local date components", () =>
  expect(localDate(new Date(2027, 0, 1, 0, 30))).toBe("2027-01-01"));
test("rejects impossible calendar dates and malformed restored searches", () => {
  expect(check({ departureDate: "2027-02-30" })).toMatch(/today or later/);
  expect(check({ returnDate: "invalid" })).toMatch(/return date/);
  expect(validateSearch({ mode: "flight" }, "2027-01-01")).toMatch(/Choose/);
});
