// Site language: English, Bahasa Melayu or 中文 (Simplified Chinese).
// Text is looked up by its English wording, so anything without a
// translation simply stays in English. Picked from the browser language
// until the visitor chooses one; the choice is remembered.
import { useSyncExternalStore } from "react";
import ms from "./i18n.ms";
import zh from "./i18n.zh";

export const LANGUAGES = [
  { code: "en", label: "English", short: "EN", locale: "en-GB" },
  { code: "ms", label: "Bahasa Melayu", short: "BM", locale: "ms-MY" },
  { code: "zh", label: "中文", short: "中文", locale: "zh-CN" },
];
const DICTS = { ms, zh };
const KEY = "bookingflexLanguage";

const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};
const fromBrowser = () => {
  const langs = (typeof navigator !== "undefined" && (navigator.languages || [navigator.language])) || [];
  for (const l of langs) {
    const code = String(l || "").toLowerCase();
    if (code.startsWith("ms") || code.startsWith("id")) return "ms";
    if (code.startsWith("zh")) return "zh";
    if (code.startsWith("en")) return "en";
  }
  return "en";
};
const valid = (c) => LANGUAGES.some((l) => l.code === c);

let state = { code: valid(read()) ? read() : fromBrowser(), chosen: valid(read()) };
const listeners = new Set();
const apply = () => {
  if (typeof document !== "undefined") document.documentElement.lang = state.code === "zh" ? "zh-Hans" : state.code;
};
apply();

export const getLanguage = () => state;
export const subscribeLanguage = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
/** Re-renders the calling component when the language changes. */
export const useLanguage = () => useSyncExternalStore(subscribeLanguage, getLanguage, getLanguage);

export function setLanguage(code) {
  if (!valid(code)) return;
  try {
    localStorage.setItem(KEY, code);
  } catch {
    /* private mode */
  }
  state = { code, chosen: true };
  apply();
  listeners.forEach((fn) => fn());
}

export const currentLanguage = () => LANGUAGES.find((l) => l.code === state.code) || LANGUAGES[0];
/** Locale for dates and numbers, e.g. toLocaleDateString(dateLocale(), …). */
export const dateLocale = () => currentLanguage().locale;

/**
 * Translates English text. Placeholders like {name} are filled from vars:
 * t("Fly to {name}", { name: "Bali" }).
 */
export function t(text, vars) {
  if (typeof text !== "string") return text;
  const dict = DICTS[state.code];
  let out = (dict && dict[text]) || text;
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? String(vars[k]) : m));
  return out;
}
