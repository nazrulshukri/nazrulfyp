import React from "react";
import { currentLanguage, t } from "../lib/i18n";
import { getCurrency } from "../lib/currency";
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
            {t("A world of possibilities.")}
            <br />{t("A simpler way to get there.")}
          </p>
        </div>
        <div>
          <h3>{t("Discover")}</h3>
          <Link to="/">{t("Explore destinations")}</Link>
          <Link to="/about">{t("About BookingFlex")}</Link>
          <Link to="/flightstatus">{t("Flight status")}</Link>
        </div>
        <div>
          <h3>{t("Your journey")}</h3>
          <Link to="/dashboard">{t("My trips")}</Link>
          <Link to="/services">{t("Check-in")}</Link>
          <Link to="/contact">
            {t("Contact & support")} <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="bf-footer-message">
          <span>{t("WHEREVER YOU GO,")}</span>
          <strong>
            {t("make it")}
            <br />
            {t("memorable.")}
          </strong>
        </div>
      </div>
      <div className="bf-footer-bottom">
        <span>
          {t("© {year} BookingFlex. All rights reserved.", { year: new Date().getFullYear() })}
        </span>
        <span>
          {t("Made for the way you travel.")} &nbsp; {currentLanguage().short} · {getCurrency().code}
        </span>
      </div>
    </footer>
  );
}
