import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [theme] = useState('dark');

  useEffect(() => {
    localStorage.setItem('tontine-theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.setAttribute('data-theme', 'dark');
  }, []);

  const toggleTheme = () => {
    // Désactivé : On reste en mode sombre
  };

  const isDark = true;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
