import React from "react";
import { Link } from "react-router-dom";
import { Plane, ArrowUpRight } from "lucide-react";
export default function Footer() {
  return (
    <footer className="bf-footer">
      <div className="bf-footer-top">
        <div>
          <Link className="bf-brand" to="/">
            <span className="bf-brand-mark">
              <Plane size={22} />
            </span>
            booking<span>flex</span>
            <i />
          </Link>
          <p>
            A world of possibilities.
            <br />A simpler way to get there.
          </p>
        </div>
        <div>
          <h3>Discover</h3>
          <Link to="/">Explore destinations</Link>
          <Link to="/about">About BookingFlex</Link>
          <Link to="/flightstatus">Flight status</Link>
        </div>
        <div>
          <h3>Your journey</h3>
          <Link to="/dashboard">My trips</Link>
          <Link to="/services">Check-in</Link>
          <Link to="/contact">
            Contact & support <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="bf-footer-message">
          <span>WHEREVER YOU GO,</span>
          <strong>
            make it
            <br />
            memorable.
          </strong>
        </div>
      </div>
      <div className="bf-footer-bottom">
        <span>
          © {new Date().getFullYear()} BookingFlex. All rights reserved.
        </span>
        <span>Made for the way you travel. &nbsp; EN · MYR</span>
      </div>
    </footer>
  );
}
