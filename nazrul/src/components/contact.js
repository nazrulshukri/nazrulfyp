import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plane, Ticket, UserRound } from "lucide-react";
export default function Contact() {
  return (
    <section className="bf-help">
      <span className="bf-kicker">A LITTLE HELP ALONG THE WAY</span>
      <h1>
        Wherever you’re going,
        <br />
        start with a clear answer.
      </h1>
      <p>
        Find your trip, manage your account, or get to know how BookingFlex
        works.
      </p>
      <div className="bf-help-links">
        <Link to="/dashboard">
          <Ticket />
          <strong>Find your bookings</strong>
          <span>View saved trips and booking details.</span>
          <ArrowUpRight />
        </Link>
        <Link to="/profile">
          <UserRound />
          <strong>Your account</strong>
          <span>Keep your traveller information up to date.</span>
          <ArrowUpRight />
        </Link>
        <Link to="/flightstatus">
          <Plane />
          <strong>Flight status</strong>
          <span>Open the flight status lookup.</span>
          <ArrowUpRight />
        </Link>
      </div>
      <h2>Frequently asked questions</h2>
      {[
        [
          "How do I search for a trip?",
          "Choose Flights, Hotels or Trains on the home page. Add your destination, travel dates and number of travellers, then search. For flights and trains you can choose a round trip or one-way journey.",
        ],
        [
          "Are these real-time fares?",
          "This project currently uses sample flight, hotel and train inventory. Prices, times and availability are for demonstration. Check with the travel provider before making real travel arrangements.",
        ],
        [
          "Where can I see my bookings?",
          "Sign in and open My trips to see bookings saved for your account on this browser. Unsaved searches are not confirmed bookings.",
        ],
        [
          "Can I change my search?",
          "Use Change your search from the flight results page to choose a new route or travel dates. The hotel results page also lets you update your search.",
        ],
        [
          "Why is sign-in or checkout unavailable?",
          "Account and booking services need the BookingFlex backend and its database to be connected. If the service is unavailable, your booking has not been confirmed. Try again once the service is restored.",
        ],
      ].map(([question, answer]) => (
        <details key={question}>
          <summary>{question}</summary>
          <p>{answer}</p>
        </details>
      ))}
      <Link className="bf-primary" to="/">
        Back to exploring <ArrowUpRight size={16} />
      </Link>
    </section>
  );
}
