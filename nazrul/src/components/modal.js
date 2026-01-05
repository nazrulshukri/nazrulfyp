import React from 'react';
import './modal.css';
import { AiOutlineWarning } from 'react-icons/ai'; // Import an icon library like react-icons

const Modal = ({ show, onClose, title, message }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content1" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <AiOutlineWarning className="modal-icon" /> {/* Professional warning icon */}
          <h2>{title}</h2>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-button" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
