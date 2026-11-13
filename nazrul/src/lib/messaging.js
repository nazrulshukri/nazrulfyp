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

/** Full URL for a file link the server returned (relative to the API). */
export const fileHref = (path) => (path && path.startsWith("/") ? `${API_BASE}${path}` : path);

/** Uploads a file for a chat with progress (0–1). Resolves to { id, url }. */
export function uploadChatFile(blob, type, name, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/messages/uploads`);
    xhr.setRequestHeader("Content-Type", type);
    xhr.setRequestHeader("X-File-Name", encodeURIComponent(name || "file"));
    try {
      const token = localStorage.getItem("token");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    } catch {
      /* ignore */
    }
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(xhr.status === 413 ? "That file is too large. Files can be up to 4 MB." : data.message || "Upload failed."));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(blob);
  });
}

const icsDate = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsText = (s) => String(s || "").replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

/** Downloads an .ics file so the event opens in Apple, Google or Outlook calendar. */
export function downloadIcs(ev) {
  const start = new Date(ev.start);
  const end = ev.end ? new Date(ev.end) : new Date(start.getTime() + 60 * 60 * 1000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BookingFlex//Chat//EN",
    "BEGIN:VEVENT",
    `UID:${icsDate(start)}-${Math.random().toString(36).slice(2)}@bookingflex`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsText(ev.title)}`,
    ev.location ? `LOCATION:${icsText(ev.location)}` : "",
    ev.note ? `DESCRIPTION:${icsText(ev.note)}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${String(ev.title || "event").replace(/[^\w-]+/g, "-").slice(0, 40)}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const googleCalendarUrl = (ev) => {
  const start = new Date(ev.start);
  const end = ev.end ? new Date(ev.end) : new Date(start.getTime() + 60 * 60 * 1000);
  const q = new URLSearchParams({ action: "TEMPLATE", text: ev.title || "", dates: `${icsDate(start)}/${icsDate(end)}`, location: ev.location || "", details: ev.note || "" });
  return `https://calendar.google.com/calendar/render?${q}`;
};

export const fileSize = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/** One-line summary of a message for conversation lists. */
export function preview(m) {
  if (!m) return "";
  const p = m.payload || {};
  switch (m.kind) {
    case "image":
      return `📷 ${m.text || "Photo"}`;
    case "video":
      return `🎥 ${m.text || "Video"}`;
    case "file":
      return `📎 ${p.name || "File"}`;
    case "poll":
      return `📊 ${p.question || "Poll"}`;
    case "event":
      return `📅 ${p.title || "Event"}`;
    case "contact":
      return `👤 ${p.name || "Contact"}`;
    case "ticket":
      return `🎫 ${p.title || "Booking"}`;
    case "savings":
      return `🐷 Saving for ${p.destination || "a trip"}`;
    default:
      return m.text || "";
  }
}
