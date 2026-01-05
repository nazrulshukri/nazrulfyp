import React from 'react';
import Booking from './booking';
import ImageGallery from './imagegallery';
import TravelList from './travellist';
import Carousel from './carousel';

import Feedback from './feeback';
import InquiryForm from './inquiry'; // Import the InquiryForm component
import Tabs from './tabs'; // Import the InquiryForm component
import './body.css';

function MainContent() {
  return (
    <main className="main-content">
      <div className="image-gallery">
        <ImageGallery />
      </div>
      <div className="booking-form">
        <Booking />
      </div>
      <div className="travel-list">
        <TravelList />
      </div>
      <div className="carousel">
        <Carousel />
      </div>
      <div className="feedback">
        <Feedback />
      </div>
      <div className="inquiry"> {/* Add the InquiryForm here */}
        <InquiryForm />
      </div>
      <div className="tabs"> {/* Add the InquiryForm here */}
        <Tabs />
      </div>
    </main>
  );
}

export default MainContent;
