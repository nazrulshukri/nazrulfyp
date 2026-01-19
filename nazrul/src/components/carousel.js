import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./carousel.css";

import AirAsiaImage from "../img/assets/Hotel/a-basic-one-room_standard.jpg";
import buy1free1 from "../img/assets/Hotel/B1F1_Langkawi-1.jpg";
import flight from "../img/assets/Flight promotion/AD-TravelV-MIX-950x550_en.jpg";
import ana from "../img/assets/Flight promotion/Good-bye-summer-hello-autumn_1400.jpg";
import hotelbali from "../img/assets/Flight promotion/B1F1_Bali-1.jpg";
import malaysianotice from "../img/assets/Flight promotion/malaysia.jpeg";

const cards = [
  { title: "Travel Requirements", description: "For the list of domestic & international travel requirements, please visit our Support Page here.", image: AirAsiaImage },
  { title: "Hotel Offer", description: "Get 50% off on your hotel stay with us!", image: buy1free1 },
  { title: "Flight Offer", description: "Get 70% off on your flight ", image: flight },
  { title: "Bangkok Airways", description: "Summer Promotion", image: ana },
  { title: "Bali Hotel", description: "Buy 1 free 1 for Arunika Hotel and Spa Bali", image: hotelbali },
  { title: "Malaysia Notice", description: "Notice For Mata fair malaysia Airlines", image: malaysianotice },
];

const AppleCardsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);
  const [step, setStep] = useState(360); // px per slide (computed)

  const clampIndex = (i) => (i + cards.length) % cards.length;

  const handleNext = () => setActiveIndex((p) => clampIndex(p + 1));
  const handlePrev = () => setActiveIndex((p) => clampIndex(p - 1));

  // ✅ compute slide step from actual card width + gap
  useEffect(() => {
    const compute = () => {
      if (!trackRef.current) return;
      const firstCard = trackRef.current.querySelector(".card");
      if (!firstCard) return;

      const cardWidth = firstCard.getBoundingClientRect().width;
      const styles = getComputedStyle(trackRef.current);
      const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;

      setStep(cardWidth + gap);
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const x = useMemo(() => -(activeIndex * step), [activeIndex, step]);

  return (
    <div className="carousel-wrapper">
      <h1 className="carousel-title">Promotions & Notices</h1>

      <div className="carousel-container">
        <motion.div
          ref={trackRef}
          className="carousel-images"
          animate={{ x }}
          transition={{ type: "spring", stiffness: 220, damping: 28 }}
        >
          {cards.map((card, index) => (
            <div key={index} className="card">
              <img src={card.image} alt={card.title || `Card ${index}`} />
              <div className="card-content">
                <h2 className="card-title">{card.title}</h2>
                <p className="card-description">{card.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="carousel-buttons">
          <button className="carousel-button left-button" aria-label="Previous slide" onClick={handlePrev}>
            ‹
          </button>
          <button className="carousel-button right-button" aria-label="Next slide" onClick={handleNext}>
            ›
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppleCardsCarousel;