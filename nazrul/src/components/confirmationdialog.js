import React from "react";
import "./confirmationdialog.css";

const ConfirmationDialog = ({ onClose }) => {
  return (
    <div className="overlay1">
      <div className="dialog1">
        <div className="dialog-icon1">
          <i className="fas fa-check-circle"></i>
        </div>
        <h2>Success!</h2>
        <p>Your booking has been confirmed.</p>
        <button className="dialog-button1" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
