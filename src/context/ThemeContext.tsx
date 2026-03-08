'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export type Theme = 'system' | 'dark' | 'light';

const STORAGE_KEY = 'whatever_theme';

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'system') return stored;
  return 'system';
}

function getEffectiveDark(): boolean {
  if (typeof window === 'undefined') return false;
  const theme = getStoredTheme();
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(dark: boolean) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (dark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolved: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolved, setResolved] = useState<'dark' | 'light'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(getStoredTheme());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const effective = getEffectiveDark();
    setResolved(effective ? 'dark' : 'light');
    applyTheme(effective);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted || theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const effective = getEffectiveDark();
      setResolved(effective ? 'dark' : 'light');
      applyTheme(effective);
    };
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme, mounted]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    const effective = next === 'dark' ? true : next === 'light' ? false : getEffectiveDark();
    setResolved(effective ? 'dark' : 'light');
    applyTheme(effective);
  };

  const contextValue = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      resolved: theme === 'system' ? resolved : theme,
    }),
    [theme, resolved]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
