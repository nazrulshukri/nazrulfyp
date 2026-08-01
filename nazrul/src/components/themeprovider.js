// src/components/ThemeProvider.js
import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('bookingflex-theme') === 'dark');

  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const nextMode = !prevMode;
      localStorage.setItem('bookingflex-theme', nextMode ? 'dark' : 'light');
      return nextMode;
    });
  };

  return (  
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
