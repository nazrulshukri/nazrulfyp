import { orderFromBooking } from "./orders";

test("flight bookings become flight orders", () => {
  const o = orderFromBooking({
    kind: "flight",
    bookingId: "abc123",
    amount: 4280,
    people: 2,
    paymentMethod: "Card",
    outboundFlight: {
      airline: "Malaysia Airlines",
      flightNumber: "MH88",
      origin: "Kuala Lumpur International Airport (Malaysia)",
      destination: "Haneda International Airport (Japan)",
      departure: "2027-01-10T10:00:00",
      arrival: "2027-01-10T17:30:00",
    },
  });
  expect(o).toMatchObject({ kind: "flight", title: "KUL → HND", amountMyr: 4280, travellers: 2, paymentMethod: "Card" });
  expect(o.reference).toMatch(/^[A-Z0-9]{6}$/);
  expect(o.startAt).toBeTruthy();
});

test("hotel and train bookings use their totals", () => {
  const hotel = orderFromBooking({ kind: "hotel", hotelName: "The Shard", checkInDate: "2027-02-01", checkOutDate: "2027-02-04", totalPrice: 1890, people: 2 });
  expect(hotel).toMatchObject({ kind: "hotel", title: "The Shard", amountMyr: 1890 });
  const train = orderFromBooking({ kind: "train", trainId: "ETS9", origin: "KL Sentral", destination: "Butterworth", startDate: "2027-03-01", departureTime: "08.30", totalPrice: 79 });
  expect(train).toMatchObject({ kind: "train", amountMyr: 79 });
});

test("unknown shapes are ignored", () => {
  expect(orderFromBooking(null)).toBeNull();
  expect(orderFromBooking({ foo: 1 })).toBeNull();
});
