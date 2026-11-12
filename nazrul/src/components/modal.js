import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import "./modal.css";

const ICONS = { warning: AlertTriangle, error: XCircle, success: CheckCircle2, info: Info };

/**
 * Glass dialog that follows the site's light/dark theme.
 * tone: "warning" (default), "error", "success" or "info".
 */
const Modal = ({ show, onClose, title, message, tone = "warning", buttonLabel = "OK" }) => {
  const button = useRef(null);
  useEffect(() => {
    if (!show) return undefined;
    const previous = document.activeElement;
    button.current && button.current.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous && previous.focus) previous.focus();
    };
  }, [show, onClose]);

  if (!show) return null;
  const Icon = ICONS[tone] || AlertTriangle;
  // Render inside .app so the dark/light theme variables apply.
  const host = document.querySelector(".app") || document.body;
  return createPortal(
    <div className="bf26-dialog-overlay" onClick={onClose}>
      <div
        className={`bf26-dialog is-${tone}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bf26-dialog-title"
        aria-describedby="bf26-dialog-text"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="bf26-dialog-icon" aria-hidden="true">
          <Icon size={26} />
        </span>
        <h2 id="bf26-dialog-title">{title}</h2>
        <p id="bf26-dialog-text">{message}</p>
        <button ref={button} type="button" className="bf26-dialog-btn" onClick={onClose}>
          {buttonLabel}
        </button>
      </div>
    </div>,
    host,
  );
};

export default Modal;
