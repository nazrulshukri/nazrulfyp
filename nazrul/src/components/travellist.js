import React, { useState } from 'react';
import './travellist.css';

import airasia from '../img/assets/travel/bali.jpeg';
import malaysia1 from '../img/assets/travel/Greece_hero.jpg';
import malaysia2 from '../img/assets/travel/sabah.jpeg';
import malaysia3 from '../img/assets/travel/barcelona.jpeg';
import malaysia4 from '../img/assets/travel/paris2.jpg';
import malaysia5 from '../img/assets/travel/kualalumpur.jpg';
import malaysia6 from '../img/assets/travel/Cusco-2.jpg';
import malaysia7 from '../img/assets/travel/croatia.jpg';
import malaysia8 from '../img/assets/travel/istanbul.jpeg';
import malaysia9 from '../img/assets/travel/london.jpg';
import malaysia10 from '../img/assets/travel/mountfuji.jpg';

const images = [
  airasia, malaysia1, malaysia2, malaysia3,
  malaysia4, malaysia5, malaysia6, malaysia7,
  malaysia8, malaysia9, malaysia10,
];

const videoLinks = [
  'https://www.youtube.com/watch?v=BFS9n4B_2xA',
  'https://www.youtube.com/watch?v=4zAEDLwl9HI',
  'https://www.youtube.com/watch?v=ERYDnUA2ajA',
  'https://www.youtube.com/watch?v=s1XoYkn3osE',
  'https://www.youtube.com/watch?v=AQ6GmpMu5L8',
];

const BottomBooking = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState('');

  const openModal = (video) => {
    setCurrentVideo(video);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentVideo('');
    setIsModalOpen(false);
  };

  return (
    <div className="bottom-booking-container">
      <h2 className="section-title">Popular Destinations</h2>
      <div className="bottom-booking-gallery">
        {images.map((image, index) => (
          <div className="bottom-booking-item" key={index}>
            <img 
              src={image} 
              alt={`Destination ${index}`} 
              className="bottom-booking-image" 
            />
            <div 
              className="destination-overlay"
              onClick={() => openModal(videoLinks[index])}
            >
              <p className="destination-text">Discover More</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay123" onClick={closeModal}>
          <div className="modal-content123" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal123" onClick={closeModal}>x</button>
            <div className="iframe-container123">
              <iframe
                src={currentVideo.replace("watch?v=", "embed/")}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Destination Video"
                className="modal-iframe123"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BottomBooking;
