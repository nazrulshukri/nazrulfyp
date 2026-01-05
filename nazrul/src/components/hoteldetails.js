import React from 'react';
import './hoteldetails.css';
import cancel from '../img/assets/Hotel/images (2).png'
import payment from '../img/assets/Hotel/8539461.png'
import lucky from '../img/assets/Hotel/png-transparent-award-prize-medal-computer-icons-award-culture-trophy-symbol-thumbnail.png'
import ringgit from '../img/assets/Hotel/2769286.png'
import calendar from '../img/assets/Hotel/images (1).png'
import foreigntransaction from '../img/assets/Hotel/images.png'

const HotelDetails = ({ selectedHotel, totalPrice, returnDate, startDate, people }) => {
  // Format the date to display as you want (e.g., 'Wed 1 Jan 2025')
  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div>
     <div class="hotel-card">
  <div class="hotel-header">
    <span class="hotel-type">Hotel</span>
    <div class="rating">
      <span class="stars">★★★★★</span>
      <span class="rating-icon">👍</span>
    </div>
  </div>
  <h3 class="hotel-name">{selectedHotel.hotelName}</h3>
  <p class="hotel-address">{selectedHotel.location}</p>
  <div class="hotel-location">
    <span class="location-text">Excellent location - <a href="#map">show map</a></span>
    <span class="location-score">— 9.8</span>
  </div>
  <div class="divider"></div>
  <div class="review-section">
    <div class="review-score">9.1</div>
    <div class="review-info">
      <span class="review-type">Superb</span> · <span class="review-count">954 reviews</span>
    </div>
  </div>
</div>

        {/* Booking Details Section */}
<div className="booking-details">
  <h3>Your Booking Details</h3>
  <div className="booking-info">
    <div className="booking-item">
      <strong>Check-in:</strong>
      <span>{formatDate(startDate)} 15:00 – 00:00</span>
    </div>
    <div className="booking-item">
      <strong>Check-out:</strong>
      <span>{formatDate(returnDate)} Until 12:00</span>
    </div>
    <div className="booking-item">
      <strong>Total length of stay:</strong>
      <span>{Math.abs(new Date(returnDate) - new Date(startDate)) / (1000 * 3600 * 24)} night(s)</span>
    </div>
  </div>
</div>

<div className="price-summary">
  <h3 className="section-header25">Price Information</h3>
  <hr />
  <div className="section-content">
    <img src={payment} alt="Payment Icon" className="section-icon" />
    <p className="payment-info">
      <strong>This price is converted to show you the approximate cost in MYR.</strong> You'll pay in £. The exchange rate may change before you pay.
    </p>
  </div>

  <div className="section-content">
    <img src={foreigntransaction} alt="Cancel Icon" className="section-icon" />
    <p className="Bear-information">
    Bear in mind that your card issuer may charge you a foreign transaction fee.
    </p>
  </div>
  <hr />

  <div className="lucky-find">
    <strong>
      <img src={lucky} alt="Lucky Find Icon" className="section-icon" />
      Lucky find for your dates!   
    </strong>
    <p>15 hotels like this are already unavailable on our site.</p>
  </div>
  <hr />

  <h3 className="section-header">Price Summary</h3>
  <div className="price-details">
    <div className="total-price">
      <img src={ringgit} alt="Price Icon" className="section-icon" />
      Total Price for <strong>{people} guests</strong>: <span>MYR{totalPrice}</span>
    </div>
   
  </div>
</div>


<div className="red-container">
  <h4 className="section-subheader">Cancellation Policy</h4>
  <div className="section-content">
    <img src={cancel} alt="Cancel Icon" className="section-icon" />
    <p className="cancel-info">
      If you cancel, you'll pay <strong style={{ color: "#FF5252" }}>MYR 3,604</strong>.
    </p>
  </div>
</div>


  

      {/* You Selected Section */}
   
      <div className="you-selected">
      <h3>You selected</h3>
      <div className="stay-dates">
      <img src={calendar} alt="Calendar Icon" className="section-icon" />
      Stay from <strong>{formatDate(startDate)}</strong> to <strong>{formatDate(returnDate)}</strong>
    </div>

        <p>{1} room for {people} adult{people > 1 ? 's' : ''}</p>
      </div>
    </div>
  );
};

export default HotelDetails;
