import React, { createContext, useState, useEffect, useContext } from "react";

export const ACCENT_PRIMARY_MAP = {
  indigo:   { primary: '#4b41e1', hover: '#3d33d0', light: 'rgba(75, 65, 225, 0.12)', border: 'rgba(75, 65, 225, 0.4)', gradient: 'linear-gradient(135deg, #4b41e1 0%, #3d33d0 50%, #2b1fb8 100%)' },
  emerald:  { primary: '#00a472', hover: '#008f63', light: 'rgba(0, 164, 114, 0.12)', border: 'rgba(0, 164, 114, 0.4)', gradient: 'linear-gradient(135deg, #00a472 0%, #008f63 50%, #00704d 100%)' },
  sunset:   { primary: '#ea580c', hover: '#c2410c', light: 'rgba(234, 88, 12, 0.12)', border: 'rgba(234, 88, 12, 0.4)', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 50%, #dc2626 100%)' },
  ocean:    { primary: '#2563eb', hover: '#1d4ed8', light: 'rgba(37, 99, 235, 0.12)', border: 'rgba(37, 99, 235, 0.4)', gradient: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)' },
  midnight: { primary: '#0f172a', hover: '#020617', light: 'rgba(15, 23, 42, 0.12)', border: 'rgba(15, 23, 42, 0.4)', gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)' },
  amethyst: { primary: '#7c3aed', hover: '#6d28d9', light: 'rgba(124, 58, 237, 0.12)', border: 'rgba(124, 58, 237, 0.4)', gradient: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 50%, #4c1d95 100%)' },
  rose:     { primary: '#e11d48', hover: '#be123c', light: 'rgba(225, 29, 72, 0.12)', border: 'rgba(225, 29, 72, 0.4)', gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 50%, #9f1239 100%)' },
  aurora:   { primary: '#0d9488', hover: '#0f766e', light: 'rgba(13, 148, 136, 0.12)', border: 'rgba(13, 148, 136, 0.4)', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0d9488 50%, #115e59 100%)' },
  unicorn:  { primary: '#ec4899', hover: '#db2777', light: 'rgba(236, 72, 153, 0.12)', border: 'rgba(236, 72, 153, 0.4)', gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)' },
};

export const ThemeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {},
  accentTheme: 'indigo',
  setAccentTheme: () => {},
  primaryColor: '#4b41e1',
  themeGradient: 'linear-gradient(135deg, #4b41e1 0%, #3d33d0 50%, #2b1fb8 100%)',
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

    const theme = ACCENT_PRIMARY_MAP[accentTheme] || ACCENT_PRIMARY_MAP.indigo;
    let styleTag = document.getElementById("dynamic-accent-theme");
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "dynamic-accent-theme";
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      :root {
        --accent-primary: ${theme.primary};
        --accent-primary-hover: ${theme.hover};
        --accent-primary-light: ${theme.light};
        --accent-primary-border: ${theme.border};
        --accent-gradient: ${theme.gradient};
      }

      /* Background Colors */
      .bg-\\[\\#4b41e1\\], .bg-\\[\\#3d33d0\\], .bg-purple-600, .bg-purple-700, .bg-indigo-600 {
        background-color: var(--accent-primary) !important;
      }
      .bg-\\[\\#e2dfff\\], .bg-purple-50, .bg-purple-100 {
        background-color: var(--accent-primary-light) !important;
      }

      /* Hover Background Colors */
      .hover\\:bg-\\[\\#3d33d0\\]:hover,
      .hover\\:bg-purple-700:hover,
      .hover\\:bg-indigo-700:hover,
      .hover\\:bg-purple-800:hover,
      .hover\\:bg-\\[\\#4b41e1\\]:hover {
        background-color: var(--accent-primary-hover) !important;
      }
      .hover\\:bg-purple-50:hover,
      .hover\\:bg-purple-100:hover {
        background-color: var(--accent-primary-light) !important;
      }

      /* Group Hover Background Colors */
      .group:hover .group-hover\\:bg-\\[\\#4b41e1\\],
      .group:hover .group-hover\\:bg-purple-600,
      .group:hover .group-hover\\:bg-purple-700 {
        background-color: var(--accent-primary) !important;
      }
      .group:hover .group-hover\\:bg-purple-50,
      .group:hover .group-hover\\:bg-purple-100 {
        background-color: var(--accent-primary-light) !important;
      }

      /* Text Colors */
      .text-\\[\\#4b41e1\\], .text-purple-600, .text-purple-700, .text-purple-400, .text-indigo-600 {
        color: var(--accent-primary) !important;
      }

      /* Hover Text Colors */
      .hover\\:text-\\[\\#4b41e1\\]:hover,
      .hover\\:text-purple-600:hover,
      .hover\\:text-purple-700:hover,
      .hover\\:text-purple-800:hover {
        color: var(--accent-primary-hover) !important;
      }

      /* Group Hover Text Colors */
      .group:hover .group-hover\\:text-\\[\\#4b41e1\\],
      .group:hover .group-hover\\:text-purple-600,
      .group:hover .group-hover\\:text-purple-700,
      .group:hover .group-hover\\:text-purple-800 {
        color: var(--accent-primary) !important;
      }

      /* Border Colors */
      .border-\\[\\#4b41e1\\], .border-purple-500, .border-purple-600 {
        border-color: var(--accent-primary) !important;
      }
      .border-purple-100, .border-purple-200 {
        border-color: var(--accent-primary-border) !important;
      }

      /* Hover Border Colors */
      .hover\\:border-\\[\\#4b41e1\\]\\/40:hover,
      .hover\\:border-\\[\\#4b41e1\\]:hover,
      .hover\\:border-purple-200:hover,
      .hover\\:border-purple-300:hover,
      .hover\\:border-purple-400:hover,
      .hover\\:border-purple-500:hover,
      .hover\\:border-purple-600:hover {
        border-color: var(--accent-primary-border) !important;
      }

      /* Focus Ring & Outline */
      .focus\\:ring-[#4b41e1]:focus,
      .focus\\:ring-purple-600:focus,
      .focus\\:border-[#4b41e1]:focus {
        --tw-ring-color: var(--accent-primary) !important;
        border-color: var(--accent-primary) !important;
      }

      /* Specific Accent Gradient utility */
      .bg-theme-accent-gradient {
        background-image: var(--accent-gradient) !important;
      }
    `;
  }, [accentTheme]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const setAccentTheme = (themeId) => setAccentThemeState(themeId);

  const themeConfig = ACCENT_PRIMARY_MAP[accentTheme] || ACCENT_PRIMARY_MAP.indigo;
  const primaryColor = themeConfig.primary;
  const themeGradient = themeConfig.gradient;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, accentTheme, setAccentTheme, primaryColor, themeGradient }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
