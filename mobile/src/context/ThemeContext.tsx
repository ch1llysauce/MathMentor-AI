import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { storage } from '@/utils/storage';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [hasStoredPreference, setHasStoredPreference] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await storage.getItem('darkMode');
        if (stored !== null) {
          const isDark = stored === 'true';
          setDarkMode(isDark);
          Appearance.setColorScheme(isDark ? 'dark' : 'light');
          setHasStoredPreference(true);
        }
      } catch (e) {
        console.warn('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    if (hasStoredPreference) return;
    setDarkMode(colorScheme === 'dark');
  }, [colorScheme, hasStoredPreference]);

  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    Appearance.setColorScheme(newMode ? 'dark' : 'light');
    try {
      await storage.setItem('darkMode', newMode ? 'true' : 'false');
    } catch (e) {
      console.warn('Failed to save theme preference', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
