import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { darkColors, lightColors, ThemeColors } from './colors';
import { spacing, radius, typography, motion } from './tokens';

export type ThemeContextType = {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  motion: typeof motion;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

const THEME_KEY = 'theme:isDark';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((val) => {
      if (val === 'true') setIsDark(true);
      setLoaded(true);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, String(next));
      return next;
    });
  };

  const value = useMemo<ThemeContextType>(() => ({
    isDark,
    colors: isDark ? darkColors : lightColors,
    toggleTheme,
    spacing,
    radius,
    typography,
    motion,
  }), [isDark]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
