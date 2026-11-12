import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/** "← Back": the previous page, or `fallback` when the page was opened directly. */
export default function BackButton({ fallback = "/dashboard", label = "Back" }) {
  const navigate = useNavigate();
  const canGoBack = typeof window !== "undefined" && window.history.state && window.history.state.idx > 0;
  return (
    <button type="button" className="bf-back bf26-backbtn" onClick={() => (canGoBack ? navigate(-1) : navigate(fallback))}>
      <ArrowLeft size={15} /> {label}
    </button>
  );
}
