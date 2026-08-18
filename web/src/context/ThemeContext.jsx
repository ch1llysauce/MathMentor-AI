import React, { createContext, useState, useEffect, useContext } from "react";

const ACCENT_PRIMARY_MAP = {
  indigo: '#4b41e1',
  emerald: '#00a472',
  sunset: '#ea580c',
  ocean: '#2563eb',
  midnight: '#0f172a',
  amethyst: '#7c3aed',
  rose: '#e11d48',
  aurora: '#0d9488',
  unicorn: '#ec4899',
};

export const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
  accentTheme: 'indigo',
  setAccentTheme: () => {},
  primaryColor: '#4b41e1',
});

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return false;
  });

  const [accentTheme, setAccentThemeState] = useState(() => {
    return localStorage.getItem("accentTheme") || "indigo";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("accentTheme", accentTheme);
  }, [accentTheme]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const setAccentTheme = (themeId) => setAccentThemeState(themeId);

  const primaryColor = ACCENT_PRIMARY_MAP[accentTheme] || '#4b41e1';

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, accentTheme, setAccentTheme, primaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
