'use client';

import React, { createContext, useContext, useSyncExternalStore, useCallback, useMemo, useEffect } from 'react';

export type Theme = 'alabaster' | 'obsidian';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'starmatch_theme';

type Listener = () => void;
const listeners = new Set<Listener>();

// Deterministic fallback for server rendering & snapshot caching
let currentTheme: Theme = 'alabaster';

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function applyThemeToDocument(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  if (theme === 'obsidian') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const themeStore = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): Theme {
    return currentTheme;
  },
  getServerSnapshot(): Theme {
    return 'alabaster';
  },
  setTheme(newTheme: Theme) {
    if (newTheme === currentTheme) return;
    currentTheme = newTheme;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, newTheme);
      } catch {
        // Storage access might fail in private browsing
      }
      applyThemeToDocument(newTheme);
    }
    emitChange();
  },
  toggleTheme() {
    this.setTheme(currentTheme === 'obsidian' ? 'alabaster' : 'obsidian');
  },
};

// Client initialization
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved === 'alabaster' || saved === 'obsidian') {
      currentTheme = saved;
    } else {
      currentTheme = 'alabaster';
    }
  } catch {
    currentTheme = 'alabaster';
  }
  applyThemeToDocument(currentTheme);
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot
  );

  // Sync DOM whenever theme changes on client
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    themeStore.toggleTheme();
  }, []);

  const setTheme = useCallback((next: Theme) => {
    themeStore.setTheme(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme,
      setTheme,
    }),
    [theme, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context) return context;

  // Fallback if hook is invoked outside ThemeProvider
  return {
    theme: currentTheme,
    toggleTheme: () => themeStore.toggleTheme(),
    setTheme: (t: Theme) => themeStore.setTheme(t),
  };
}
