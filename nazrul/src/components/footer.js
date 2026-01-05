import React from 'react';
import './footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';

function Footer() {
  return (
    <footer className="footer1">
      <div className="footer-content78">
        <div className="footer-section90">
          <h4>Find inspiration</h4>
          <ul>
            <li><a href="./">Booking Flex</a></li>
            <li><a href="./">About Us</a></li>
            <li><a href="./">About the Bookingflex</a></li>
            <li><a href="./">Bookingflex® news</a></li>
            <li><a href="./">Sustainability</a></li>
          </ul>
        </div>
        <div className="footer-section90">
          <h4>Support</h4>
          <ul>
            <li><a href="./">Contact us</a></li>
            <li><a href="./">Find building instructions</a></li>
            <li><a href="./">Replacement parts</a></li>
            <li><a href="./">Deliveries and returns</a></li>
            <li><a href="./">Payment methods</a></li>
            <li><a href="./">Terms & conditions</a></li>
            <li><a href="./">Product recalls</a></li>
          </ul>
        </div>
        <div className="footer-section90">
          <h4>Attractions</h4>
          <ul>
            <li><a href="./">Booking flex</a></li>
            <li><a href="./">Booking flex offer</a></li>
            <li><a href="./">Price deal booking flex</a></li>
          </ul>
        </div>
        <div className="footer-section90">
          <h4>More From Us</h4>
          <ul>
            <li><a href="./">Bookingflex® magazine (FREE)</a></li>
            <li><a href="./">Flex education</a></li>
            <li><a href="./">Flex ideas</a></li>
            <li><a href="./">Flex foundation</a></li>
            <li><a href="./">Flex braille bricks</a></li>
          </ul>
        </div>
        <div className="footer-section90">
          <h4>Follow Us</h4>
          <ul className="social-media">
            <li><a href="./"><FontAwesomeIcon icon={faFacebookF} /></a></li>
            <li><a href="./"><FontAwesomeIcon icon={faTwitter} /></a></li>
            <li><a href="./"><FontAwesomeIcon icon={faInstagram} /></a></li>
            <li><a href="./"><FontAwesomeIcon icon={faYoutube} /></a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom90">
        <p>&copy; 2024 Booking Flex</p>
        <p>Privacy policy | Cookies | Legal notice | Terms of Use | Digital wellbeing | Accessibility | Cookie Settings</p>
        <p>No 35 jalan tj 7/4 taman temerloh Jaya 28000 Pahang Darul Makmur. Must be 18 years or older to purchase online. Booking Flex, the Booking Flex, the Minifigure, DUPLO, the FRIENDS logo, the MINIFIGURES logo, DREAMZzz, NINJAGO, VIDIYO and MINDSTORMS are trademarks of the  Booking Flex Group. ©2024 The Flex Group. All rights reserved. Use of this site signifies your agreement to the Terms of Use.</p>
      </div>
    </footer>
  );
}

export default Footer;
