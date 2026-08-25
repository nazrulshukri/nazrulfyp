import React from "react";
import { Link } from "react-router-dom";
import "./about.css";
import Logo from "../img/assets/Booking1.png";

const values = [
  {
    icon: "✦",
    title: "Simple by design",
    description: "Clear choices, useful details, and fewer steps from search to confirmation.",
  },
  {
    icon: "◎",
    title: "Built around travellers",
    description: "Every feature is shaped around the questions people ask before and during a trip.",
  },
  {
    icon: "↗",
    title: "Ready for the journey",
    description: "Flights, stays, trains, payments, and travel documents stay together in one place.",
  },
];

const AboutUs = () => (
  <div className="about-page">
    <section className="about-hero" aria-labelledby="about-title">
      <div className="about-hero-copy">
        <span className="about-kicker">Travel made simpler</span>
        <h1 id="about-title">More freedom to explore. Less work to get there.</h1>
        <p>
          Booking Flex brings the important parts of planning a trip into one calm,
          connected experience—so travellers can spend less time organising and more
          time looking forward to the journey.
        </p>
        <div className="about-actions">
          <Link className="about-primary-action" to="/">Plan a trip</Link>
          <Link className="about-secondary-action" to="/services">Check in online</Link>
        </div>
      </div>

      <div className="about-visual" aria-hidden="true">
        <div className="about-orbit about-orbit-one" />
        <div className="about-orbit about-orbit-two" />
        <div className="about-logo-card">
          <img src={Logo} alt="" />
        </div>
        <div className="about-visual-note">
          <span>One place</span>
          <strong>Every part of your trip</strong>
        </div>
      </div>
    </section>

    <section className="about-stat-strip" aria-label="Booking Flex highlights">
      <div><strong>5</strong><span>travel services connected</span></div>
      <div><strong>24/7</strong><span>access to your trip details</span></div>
      <div><strong>1</strong><span>simple travel workspace</span></div>
    </section>

    <section className="about-story" aria-labelledby="about-story-title">
      <div className="about-section-heading">
        <span className="about-kicker">Why Booking Flex</span>
        <h2 id="about-story-title">A smoother way to move through the world</h2>
      </div>
      <div className="about-story-copy">
        <p>
          Travel planning often means switching between tabs, confirmations, and
          disconnected services. Booking Flex was created to make that experience feel
          more human: focused, transparent, and easy to follow.
        </p>
        <p>
          From the first search to check-in day, the platform keeps the next useful step
          visible. It is designed for real journeys, whether that means a quick weekend
          flight, a hotel stay, or a multi-part trip.
        </p>
      </div>
    </section>

    <section className="about-values" aria-labelledby="about-values-title">
      <div className="about-section-heading about-section-heading-centered">
        <span className="about-kicker">What guides us</span>
        <h2 id="about-values-title">Thoughtful travel tools, without the clutter</h2>
      </div>
      <div className="about-value-grid">
        {values.map((value) => (
          <article className="about-value-card" key={value.title}>
            <span className="about-value-icon" aria-hidden="true">{value.icon}</span>
            <h3>{value.title}</h3>
            <p>{value.description}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="about-cta" aria-labelledby="about-cta-title">
      <div>
        <span className="about-kicker">Ready when you are</span>
        <h2 id="about-cta-title">Make your next journey feel easier.</h2>
      </div>
      <Link className="about-primary-action" to="/">Start searching</Link>
    </section>
  </div>
);

export default AboutUs;
