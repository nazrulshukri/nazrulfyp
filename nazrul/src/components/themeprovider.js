// src/components/ThemeProvider.js
// Light/dark theme. Follows the device setting (and its changes, e.g. dark
// mode at night) until the visitor picks a theme with the header button;
// that choice is remembered.
import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();
const KEY = "bookingflex-theme";

const saved = () => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "dark" || v === "light" ? v : null;
  } catch {
    return null;
  }
};
const deviceDark = () =>
  typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)").matches : false;

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => (saved() ? saved() === "dark" : deviceDark()));

  // Follow the device until the visitor chooses.
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => !saved() && setIsDarkMode(e.matches);
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange));
  }, []);

  // Theme the whole page (background behind the app, scrollbars, form
  // controls and the phone browser bar), not just the app container.
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = isDarkMode ? "dark" : "light";
    root.style.colorScheme = isDarkMode ? "dark" : "light";
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = isDarkMode ? "#0f1714" : "#f5f7f3";
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(KEY, next ? "dark" : "light");
      } catch {
        /* private mode */
      }
      return next;
    });
  };

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
