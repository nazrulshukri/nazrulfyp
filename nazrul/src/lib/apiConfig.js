// Set REACT_APP_API_URL to the deployed API origin when hosting the frontend.
export const API_BASE = (
  process.env.REACT_APP_API_URL || "http://localhost:5001"
).replace(/\/$/, "");
