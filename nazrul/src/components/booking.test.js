import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import Booking from "./booking";
import { localDate } from "../lib/searchValidation";

function Destination() {
  const location = useLocation();
  return (
    <pre data-testid="route">
      {JSON.stringify({ path: location.pathname, state: location.state })}
    </pre>
  );
}
function setup() {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Booking />} />
        <Route path="*" element={<Destination />} />
      </Routes>
    </MemoryRouter>,
  );
}
const daysFromNow = (n) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
};
function chooseDestination(text) {
  const input = screen.getByLabelText("Destination");
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
  fireEvent.click(within(screen.getByRole("listbox")).getAllByRole("option")[0]);
}
// Opens the calendar from a date field and clicks the given day.
function pickDay(fieldLabel, date) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^${fieldLabel}`) }));
  const dialog = screen.getByRole("dialog", { name: "Choose dates" });
  fireEvent.click(within(dialog).getByRole("button", { name: date.toDateString() }));
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test("one-way search preserves traveller counts and clears the return date", () => {
  setup();
  fireEvent.click(screen.getByRole("radio", { name: "One way" }));
  chooseDestination("London");
  fireEvent.click(screen.getByRole("button", { name: /1 traveller/ }));
  fireEvent.click(screen.getByRole("button", { name: "Add adults" }));
  pickDay("DEPARTURE", daysFromNow(10));
  fireEvent.click(screen.getByRole("button", { name: "Search flights" }));
  const { state } = JSON.parse(screen.getByTestId("route").textContent);
  expect(state.flightParams.people).toBe(2);
  expect(state.flightParams.returnDate).toBe("");
  expect(state.flightParams.departureDate).toBe(localDate(daysFromNow(10)));
  expect(JSON.parse(localStorage.getItem("flightParams")).destination).toBe(
    "London Heathrow Airport (United Kingdom)",
  );
});

test("train search supplies the bookingData contract expected by its results page", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Trains" }));
  fireEvent.click(screen.getByRole("radio", { name: "One way" }));
  chooseDestination("KLIA2");
  pickDay("DEPARTURE", daysFromNow(5));
  fireEvent.click(screen.getByRole("button", { name: "Search trains" }));
  const result = JSON.parse(screen.getByTestId("route").textContent);
  expect(result.path).toBe("/train");
  expect(result.state.bookingData).toMatchObject({
    location: "KL Sentral",
    location1: "KLIA2",
    startDate: localDate(daysFromNow(5)),
    returnDate: "",
  });
});

test("round trips need a return date before searching", () => {
  setup();
  chooseDestination("Tokyo");
  pickDay("DEPARTURE", daysFromNow(7));
  fireEvent.click(screen.getByRole("button", { name: "Search flights" }));
  expect(screen.getByRole("alert")).toHaveTextContent("return date");
  expect(screen.queryByTestId("route")).not.toBeInTheDocument();
});

test("hotel search requires no departure location and supplies hotelParams", () => {
  setup();
  fireEvent.click(screen.getByRole("button", { name: "Hotels" }));
  expect(screen.queryByLabelText("From")).not.toBeInTheDocument();
  chooseDestination("London");
  pickDay("CHECK-IN", daysFromNow(3));
  // The calendar stays open on the check-out step after choosing check-in.
  const dialog = screen.getByRole("dialog", { name: "Choose dates" });
  fireEvent.click(within(dialog).getByRole("button", { name: daysFromNow(6).toDateString() }));
  fireEvent.click(screen.getByRole("button", { name: "Search hotels" }));
  expect(JSON.parse(screen.getByTestId("route").textContent).state.hotelParams).toMatchObject({
    location: "London",
    checkInDate: localDate(daysFromNow(3)),
    checkOutDate: localDate(daysFromNow(6)),
  });
});
