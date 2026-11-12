// Client helpers for the social dashboard (backend/social.js).
import { API_BASE } from "./apiConfig";

export async function api(path, { method = "GET", body } = {}) {
  let token = null;
  try {
    token = localStorage.getItem("token");
  } catch {
    /* ignore */
  }
  const res = await fetch(`${API_BASE}/social${path}`, {
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

// Character avatars people can pick instead of a photo.
export const CHARACTERS = [
  { id: "traveller", emoji: "🧳", label: "Traveller", bg: "linear-gradient(135deg,#1d4a3f,#3f8f6b)" },
  { id: "pilot", emoji: "🧑‍✈️", label: "Pilot", bg: "linear-gradient(135deg,#1e3a8a,#3b82f6)" },
  { id: "explorer", emoji: "🧭", label: "Explorer", bg: "linear-gradient(135deg,#7c2d12,#f97316)" },
  { id: "surfer", emoji: "🏄", label: "Surfer", bg: "linear-gradient(135deg,#0e7490,#22d3ee)" },
  { id: "hiker", emoji: "🥾", label: "Hiker", bg: "linear-gradient(135deg,#365314,#84cc16)" },
  { id: "foodie", emoji: "🍜", label: "Foodie", bg: "linear-gradient(135deg,#9f1239,#fb7185)" },
  { id: "photographer", emoji: "📸", label: "Photographer", bg: "linear-gradient(135deg,#312e81,#a78bfa)" },
  { id: "beach", emoji: "🏝️", label: "Beach lover", bg: "linear-gradient(135deg,#0f766e,#fde68a)" },
  { id: "city", emoji: "🌆", label: "City hopper", bg: "linear-gradient(135deg,#1f2937,#f59e0b)" },
  { id: "camper", emoji: "🏕️", label: "Camper", bg: "linear-gradient(135deg,#14532d,#a3e635)" },
  { id: "golfer", emoji: "🏌️", label: "Golfer", bg: "linear-gradient(135deg,#166534,#bbf7d0)" },
  { id: "music", emoji: "🎧", label: "Music fan", bg: "linear-gradient(135deg,#581c87,#ec4899)" },
];
export const characterById = (id) => CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];

export const INTERESTS = [
  "Fishing", "Golf", "Music", "Hiking", "Diving", "Photography", "Food", "Cycling", "Football",
  "Badminton", "Running", "Camping", "Beaches", "Museums", "Shopping", "Gaming", "Reading", "Cooking",
  "Yoga", "Road trips", "Art", "Coffee", "Nightlife", "Wildlife",
];

export const RELATIONSHIPS = [
  ["", "Not set"],
  ["single", "Single"],
  ["in a relationship", "In a relationship"],
  ["engaged", "Engaged"],
  ["married", "Married"],
  ["divorced", "Divorced"],
  ["widowed", "Widowed"],
  ["prefer not to say", "Prefer not to say"],
];

export const MOODS = ["😊", "😍", "🤩", "😎", "🥳", "😌", "🤔", "😴", "😢", "😤", "✈️", "🌴"];

export const COVERS = {
  forest: "linear-gradient(120deg,#0f2c26 0%,#1d4a3f 45%,#3f8f6b 100%)",
  sunset: "linear-gradient(120deg,#7c2d12 0%,#f97316 55%,#fde68a 100%)",
  ocean: "linear-gradient(120deg,#0c4a6e 0%,#0ea5e9 55%,#a5f3fc 100%)",
  night: "linear-gradient(120deg,#0f172a 0%,#312e81 55%,#a78bfa 100%)",
  blossom: "linear-gradient(120deg,#831843 0%,#ec4899 55%,#fbcfe8 100%)",
  lime: "linear-gradient(120deg,#1d4a3f 0%,#65a30d 55%,#d9ef7d 100%)",
};

/** Shrinks a photo in the browser to a JPEG data URL small enough to upload. */
export function resizeImage(file, maxSide = 1080, maxChars = 440 * 1024) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) return reject(new Error("Choose an image file."));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      let side = maxSide;
      for (let attempt = 0; attempt < 6; attempt += 1) {
        const scale = Math.min(1, side / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        for (const q of [0.82, 0.7, 0.6]) {
          const data = canvas.toDataURL("image/jpeg", q);
          if (data.length <= maxChars) return resolve(data);
        }
        side = Math.round(side * 0.75);
      }
      reject(new Error("That photo is too large. Try a smaller one."));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("We couldn't read that image."));
    };
    img.src = url;
  });
}

export function timeAgo(date) {
  const s = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
