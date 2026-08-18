import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useColorScheme, Appearance, Text as RNText, type TextProps } from 'react-native';
import { storage } from '@/utils/storage';
import { getThemePrimaryColor } from '@/constants/bannerThemes';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  accentTheme: string;
  setAccentTheme: (themeId: string) => Promise<void>;
  primaryColor: string;
}

export const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
  accentTheme: 'indigo',
  setAccentTheme: async () => {},
  primaryColor: '#4b41e1',
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  const [hasStoredPreference, setHasStoredPreference] = useState(false);
  const [accentTheme, setAccentThemeState] = useState<string>('indigo');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedDark = await storage.getItem('darkMode');
        if (storedDark !== null) {
          const isDark = storedDark === 'true';
          setDarkMode(isDark);
          Appearance.setColorScheme(isDark ? 'dark' : 'light');
          setHasStoredPreference(true);
        }

        const storedAccent = await storage.getItem('accentTheme');
        if (storedAccent) {
          setAccentThemeState(storedAccent);
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

  const setAccentTheme = async (themeId: string) => {
    setAccentThemeState(themeId);
    try {
      await storage.setItem('accentTheme', themeId);
    } catch (e) {
      console.warn('Failed to save accent theme preference', e);
    }
  };

  const primaryColor = getThemePrimaryColor(accentTheme);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, accentTheme, setAccentTheme, primaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export function ScaledText(props: TextProps) {
  return <RNText {...props} />;
}
