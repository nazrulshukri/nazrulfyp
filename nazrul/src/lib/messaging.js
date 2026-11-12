// Client helpers for chat and calls (backend/messaging.js).
import { API_BASE } from "./apiConfig";

export async function mapi(path, { method = "GET", body } = {}) {
  let token = null;
  try {
    token = localStorage.getItem("token");
  } catch {
    /* ignore */
  }
  const res = await fetch(`${API_BASE}/messages${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || "Something went wrong. Please try again.");
    error.status = res.status;
    throw error;
  }
  return data;
}

// Free public STUN servers help two browsers find each other directly.
export const ICE_SERVERS = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }];

/** Waits until the browser has gathered its network addresses (or a timeout). */
export function waitForIce(pc, ms = 3500) {
  if (pc.iceGatheringState === "complete") return Promise.resolve();
  return new Promise((resolve) => {
    const done = () => {
      pc.removeEventListener("icegatheringstatechange", check);
      clearTimeout(timer);
      resolve();
    };
    const check = () => pc.iceGatheringState === "complete" && done();
    const timer = setTimeout(done, ms);
    pc.addEventListener("icegatheringstatechange", check);
  });
}

export const clock = (date) => new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
export const dayLabel = (date) => {
  const d = new Date(date);
  const today = new Date();
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
};
