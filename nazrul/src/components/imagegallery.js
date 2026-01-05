import React, { useState } from 'react';
import Slider from 'react-slick';
import airasia from '../img/assets/korean.png';
import malaysia1 from '../img/assets/Flight promotion/Kids-Fly-Free-with-Malaysia-Airlines-2-1024x668.jpg';
import malaysia2 from '../img/assets/aa-superapp.jpeg';
import malaysia3 from '../img/assets/SEQ4_Comms_ENG+(1).jpg';
import malaysia5 from '../img/assets/ad_34489786_75959a71d7c555f1_web.jpg';
import malaysia6 from '../img/assets/intro02.jpg';
import malaysia7 from '../img/assets/emirates.jpg';
import malaysia8 from '../img/assets/naera-Hotel-and-Spa-by-Horizontal-Design-30.jpg';
import malaysia9 from '../img/assets/TRY.jpeg';
import malaysia10 from '../img/assets/Monorail-malaysia-advertising-price-rate.jpg';
import malaysia11 from '../img/assets/ana2.jpg';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './imagegallery.css';

const images = [
  airasia,
  malaysia1,
  malaysia2,
  malaysia3,
  malaysia5,
  malaysia6,
  malaysia7,
  malaysia8,
  malaysia9,
  malaysia10,
  malaysia11
];

const videoLinks = [
  "https://www.youtube.com/embed/7kOXJarFRHU",
  "https://www.youtube.com/embed/B7XuxEVHJx0",
  "https://www.youtube.com/embed/MekPx8635XU",
  "https://www.youtube.com/embed/ssVe0FaBhUU",
  "https://www.youtube.com/embed/SAolvci7SeA",
  "https://www.youtube.com/embed/jjtQ19icQBU",
];

function ImageGallery() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);
  const [miniPlayerPosition, setMiniPlayerPosition] = useState({ x: 50, y: 50 }); // Position for mini-player

  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  const openModal = (videoLink) => {
    setCurrentVideo(videoLink);
    setIsModalOpen(true);
    setIsMiniPlayer(false); // Ensure it's not in mini-player mode when opened
  };

  const closeModal = () => {
    setCurrentVideo(null);
    setIsModalOpen(false);
  };

  const toggleMiniPlayer = () => {
    setIsMiniPlayer(!isMiniPlayer);
  };

  const handleDrag = (event) => {
    setMiniPlayerPosition({
      x: event.clientX - 100, // Adjust to center mini-player on drag
      y: event.clientY - 50,
    });
  };

  return (
    <div className="slide-container">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div className="each-slide" key={index}>
            <img src={image} alt={`Slide ${index}`} />
            <div className="overlay">
              <h2>Slide {index + 1}</h2>
              <button onClick={() => openModal(videoLinks[index])}>Learn More</button>
            </div>
          </div>
        ))}
      </Slider>

      {/* Plain Modal */}
      {isModalOpen && (
        <div
          className={`custom-modal ${isMiniPlayer ? "mini-player" : ""}`}
          style={isMiniPlayer ? { top: miniPlayerPosition.y, left: miniPlayerPosition.x } : {}}
         
        >
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>×</button>
            <button className="mini-toggle-button" onClick={toggleMiniPlayer}>
              {isMiniPlayer ? "Full Screen" : "Mini Player"}
            </button>
            {currentVideo && (
              <iframe
                src={currentVideo}
                title="Video"
                width="100%"
                height="100%"
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
