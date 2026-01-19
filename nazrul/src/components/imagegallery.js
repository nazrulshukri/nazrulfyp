import React, { useMemo, useRef, useState } from "react";
import Slider from "react-slick";
import { AnimatePresence, motion } from "framer-motion";

import airasia from "../img/assets/koreanair2026.jpg";
import malaysia1 from "../img/assets/WEST_CommsBanner_EN_1440x560.jpg";
import malaysia2 from "../img/assets/aa-superapp.jpeg";
import malaysia3 from "../img/assets/KLM-Royal-Dutch-Ocelott.png.webp";
import malaysia5 from "../img/assets/Untitled 5.1.jpeg";
import malaysia6 from "../img/assets/ana2.jpg";
import malaysia7 from "../img/assets/0a14b12000j1wv3vy9E0E.png";
import malaysia8 from "../img/assets/naera-Hotel-and-Spa-by-Horizontal-Design-30.jpg";
import malaysia9 from "../img/assets/TRY.jpeg";
import malaysia10 from "../img/assets/Monorail-malaysia-advertising-price-rate.jpg";
import malaysia11 from "../img/assets/tf723jtm8xo598qdpvz9h853essv.jpeg";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./imagegallery.css";

const slides = [
  {
    image: airasia,
    title: "Smart Deals, Faster Booking",
    subtitle: "Discover promos, compare routes, book in minutes.",
    video: "https://www.youtube.com/embed/TstlfPD70ZA" ,
    tag: "Featured",
  },
  {
    image: malaysia1,
    title: "Family Promotions",
    subtitle: "Kids fly free campaigns & seasonal discounts.",
    video: "https://www.youtube.com/embed/rEztlr-Zoag",
    tag: "Limited",
  },
  {
    image: malaysia2,
    title: "All-in-One Super App",
    subtitle: "Flights, hotels, and services in one platform.",
    video: "https://www.youtube.com/embed/1zt2G6Uilhw",
    tag: "New",
  },
  {
    image: malaysia3,
    title: "Global Routes",
    subtitle: "Explore more destinations with modern search.",
    video: "https://www.youtube.com/embed/ZWlwp_IDYG4",
    tag: "Trending",
  },
  {
    image: malaysia5,
    title: "Premium Experiences",
    subtitle: "Better seats, better timing, better pricing.",
    video: "https://www.youtube.com/embed/kb8vWrxVrCE",
    tag: "Plus",
  },
  {
    image: malaysia6,
    title: "Travel Smarter",
    subtitle: "Built-in tools to manage your whole trip.",
    video: "https://www.youtube.com/embed/B5EOLFSKNh8",
    tag: "Smart",
  },
  { image: malaysia7, title: "Luxury Partners", subtitle: "Top airlines & verified offers.", video: "https://www.youtube.com/embed/5UIbSbmZ-v8", tag: "Elite" },
  { image: malaysia8, title: "Hotels & Resorts", subtitle: "Stay options with clean comparisons.", video: "https://www.youtube.com/embed/B7XuxEVHJx0", tag: "Stay" },
  { image: malaysia9, title: "Seasonal Trips", subtitle: "Fresh deals for your next holiday.", video: "https://www.youtube.com/embed/MekPx8635XU", tag: "Hot" },
  { image: malaysia10, title: "City Mobility", subtitle: "Transport + booking in one flow.", video: "https://www.youtube.com/embed/WpW1j-v3cQE", tag: "Urban" },
  { image: malaysia11, title: "Fly With qatar Airlines", subtitle: "World Best Airlines.", video: "https://www.youtube.com/embed/tPp1Dy9t6ho", tag: "Explore" },
];

function ImageGallery() {
  const sliderRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);

  const [isMini, setIsMini] = useState(false);
  const [pos, setPos] = useState({ x: 60, y: 120 });

  const dragRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 });

  // ✅ How far INSIDE from right edge you want mini to sit
  const RIGHT_INSET = 140;
  const PAD = 12;

  // ✅ Match CSS: width: min(360px, 100vw - 24px)
  const getMiniW = () => Math.min(360, window.innerWidth - 24);
  // ✅ 16:9 aspect ratio
  const getMiniH = () => Math.round(getMiniW() * 9 / 16);

  const settings = useMemo(
    () => ({
      dots: true,
      infinite: true,
      speed: 900,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3500,
      arrows: true,
      pauseOnHover: true,
      cssEase: "cubic-bezier(0.22, 1, 0.36, 1)",
      appendDots: (dots) => <ul className="slick-dots modern-dots">{dots}</ul>,
    }),
    []
  );

  const openModal = (videoLink) => {
    setCurrentVideo(videoLink);
    setIsModalOpen(true);
    setIsMini(false);
    setPos({ x: 60, y: 120 });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentVideo(null);
    setIsMini(false);
  };

  const toggleMini = () => setIsMini((v) => !v);

  // drag start (mini only)
  const onMiniMouseDown = (e) => {
    if (!isMini) return;
    dragRef.current.dragging = true;
    dragRef.current.offsetX = e.clientX - pos.x;
    dragRef.current.offsetY = e.clientY - pos.y;
  };

  // drag move
  const onMouseMove = (e) => {
    if (!dragRef.current.dragging) return;

    const nextX = e.clientX - dragRef.current.offsetX;
    const nextY = e.clientY - dragRef.current.offsetY;

    const w = getMiniW();
    const h = getMiniH();

    // ✅ keep inside screen + keep away from right edge
    const maxX = window.innerWidth - w - RIGHT_INSET;
    const maxY = window.innerHeight - h - PAD;

    setPos({
      x: Math.max(PAD, Math.min(maxX, nextX)),
      y: Math.max(PAD, Math.min(maxY, nextY)),
    });
  };

  // drag end + snap
  const onMouseUp = () => {
    if (!dragRef.current.dragging) return;
    dragRef.current.dragging = false;

    const w = getMiniW();
    const h = getMiniH();

    // ✅ snap inside from right (not touching edge)
    const rightX = window.innerWidth - w - RIGHT_INSET;
    const leftX = PAD;

    setPos((p) => ({
      x: p.x > window.innerWidth / 2 ? rightX : leftX,
      y: Math.max(PAD, Math.min(window.innerHeight - h - PAD, p.y)),
    }));
  };

  return (
    <div className="slide-container modern" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <Slider ref={sliderRef} {...settings}>
        {slides.map((s, index) => (
          <div className="each-slide modern" key={index}>
            <img src={s.image} alt={`Slide ${index}`} />
            <div className="hero-overlay" />

            <motion.div
              className="overlay modern"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <div className="overlay-top">
                <span className="badge">{s.tag}</span>
                <div className="overlay-actions">
                  <button className="ghost" onClick={() => sliderRef.current?.slickPrev()}>
                    Prev
                  </button>
                  <button className="ghost" onClick={() => sliderRef.current?.slickNext()}>
                    Next
                  </button>
                </div>
              </div>

              <h2>{s.title}</h2>
              <p>{s.subtitle}</p>

              <div className="overlay-cta">
                <button className="cta" onClick={() => openModal(s.video)}>
                  Watch Video
                </button>
                <button className="cta secondary" onClick={() => alert("Add your action here")}>
                  Explore
                </button>
              </div>
            </motion.div>
          </div>
        ))}
      </Slider>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              className="video-modal-overlay modern"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            />

            <motion.div
              className={`video-modal modern ${isMini ? "mini-player" : ""}`}
              style={isMini ? { left: pos.x, top: pos.y } : undefined}
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.22 }}
              onMouseDown={onMiniMouseDown}
            >
              <div className="video-topbar">
                <div className="video-title">
                  <span className="dot" />
                  Now Playing
                </div>

                <div className="video-controls">
                  <button className="mini-toggle-button modern" onClick={toggleMini}>
                    {isMini ? "Full" : "Mini"}
                  </button>
                  <button className="close-button modern" onClick={closeModal}>
                    ×
                  </button>
                </div>
              </div>

              <div className="video-frame">
                <iframe
                  src={currentVideo}
                  title="Video"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>

              {isMini && <div className="mini-hint">Drag me</div>}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ImageGallery;