import React, { createContext, useState, useEffect, useContext } from "react";

const FONT_SIZES = {
  'Small': '14px',
  'Medium': '16px',
  'Large': '18px',
  'Extra Large': '20px',
};

export const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
  fontSize: 'Medium',
  setFontSize: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) return stored === "true";
    return false; // Default to light mode explicitly
  });

  const [fontSize, setFontSizeState] = useState(() => {
    return localStorage.getItem("fontSize") || "Medium";
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
    const sizePx = FONT_SIZES[fontSize] || '16px';
    document.documentElement.style.fontSize = sizePx;
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const setFontSize = (size) => setFontSizeState(size);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, fontSize, setFontSize }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
