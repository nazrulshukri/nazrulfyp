import React from "react";
import ketupatImg from "../img/assets/ketupat.png";
import "./HariRayapopup.css";

const HariRayaPopup = ({ show, onClose }) => {

  if (!show) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>

      {/* Lanterns */}
      <div className="lanterns">
        <span>🏮</span>
        <span>🏮</span>
      </div>

      {/* Fireworks */}
      <div className="fireworks">
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Sparkles */}
      <div className="sparkles">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Ketupat confetti */}
      <div className="ketupat-confetti">
        <span>🟩</span>
        <span>🟩</span>
        <span>🟩</span>
        <span>🟩</span>
        <span>🟩</span>
      </div>

      <div className="popup-container" onClick={(e) => e.stopPropagation()}>
        <img src={ketupatImg} alt="Ketupat" className="popup-ketupat" />

        <h2>🎉 Selamat Hari Raya Aidilfitri 2026! 🎉</h2>

        <p>
          We wish you joy, peace, and prosperity! May all your wishes be granted.
        </p>

        <p>
          Sincerely, <strong>Booking Flex Community</strong>
        </p>

        <button className="popup-close" onClick={onClose}>
          Close
        </button>
      </div>

    </div>
  );
};

export default HariRayaPopup;