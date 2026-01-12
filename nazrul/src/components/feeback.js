import React, { useRef, useState } from "react";
import "./feedback.css";
import nazrul from "../img/assets/feedbac/1665246418994.jpg";
import { FaPause, FaPlay, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ImageGrid = () => {
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const feedbacks = [
    {
      text: "Booking Flex makes it easier to book. Highly recommended!",
      author: "Muhammad Nazrul Bin Ahmad Shukri",
      title: "Excellent Experience",
      image: nazrul
    },
    {
      text: "It is a truth universally acknowledged...",
      author: "Jane Austen",
      title: "Pride and Prejudice",
      image: nazrul
    },
    {
      text: "To be, or not to be, that is the question...",
      author: "William Shakespeare",
      title: "Hamlet",
      image: nazrul
    },
    
    
    

  ];

  const items = [...feedbacks, ...feedbacks];

  const handleScrollBy = (direction) => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({
      left: direction === "next" ? 340 : -340,
      behavior: "smooth"
    });
  };

  const handleTogglePause = () => {
    setPaused(!paused);
  };

  return (
    <section className="feedback-section">
      <div className="feedback-header">
        <h1>What Our Users Say</h1>
        <p>Real feedback from real travelers</p>
      </div>

      <div className="image-grid">
        <div
          className={`scroll-track ${paused ? "paused" : ""}`}
          ref={trackRef}
        >
          {items.map((f, i) => (
            <div className="card2" key={i}>
              <img src={f.image} alt={f.author} className="circle-image" />
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <p><strong>- {f.author}</strong></p>
            </div>
          ))}
        </div>

        {/* Controls inside the layout */}
       <div className="feedback-controls inside-section">
  <button onClick={() => handleScrollBy("prev")}>
    <FaChevronLeft size={50} /> {/* big icon */}
  </button>
  <button onClick={handleTogglePause}>
    {paused ? <FaPlay size={50} /> : <FaPause size={50} />}
  </button>
  <button onClick={() => handleScrollBy("next")}>
    <FaChevronRight size={50} /> {/* big icon */}
  </button>
</div>
      </div>
    </section>
  );
};

export default ImageGrid;