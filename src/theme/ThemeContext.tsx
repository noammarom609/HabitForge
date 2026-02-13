import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { darkColors, lightColors, ThemeColors } from './colors';

type ThemeContextType = {
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

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

  const colors = isDark ? darkColors : lightColors;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
