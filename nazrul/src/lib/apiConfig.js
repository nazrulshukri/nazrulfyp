// The backend runs at /api on the same domain when deployed (Vercel), and on
// localhost:5001 during development. REACT_APP_API_URL overrides both.
const fallback = process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5001";

export const API_BASE = (process.env.REACT_APP_API_URL || fallback).replace(/\/$/, "");
