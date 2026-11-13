"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";

export type ThemeMode = "dark" | "light";

export const THEME_STORAGE_KEY = "vibepost-theme";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const listeners = new Set<() => void>();

function emitThemeChange(): void {
  listeners.forEach((listener) => listener());
}

function subscribeTheme(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function subscribeEmpty(): () => void {
  return () => {};
}

function applyThemeToDocument(nextTheme: ThemeMode): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = nextTheme;
  root.classList.toggle("dark", nextTheme === "dark");
  root.style.colorScheme = nextTheme;
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") {
      return saved;
    }
  } catch {
    // Ignore storage access errors in restricted environments
  }
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getServerThemeSnapshot(): ThemeMode {
  return "dark";
}

/**
 * Synchronizes VibePost's bidirectional Dark/Light theme tokens across DOM and localStorage.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    readStoredTheme,
    getServerThemeSnapshot
  );
  const mounted = useSyncExternalStore(
    subscribeEmpty,
    () => true,
    () => false
  );

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        emitThemeChange();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setTheme = (nextTheme: ThemeMode): void => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Ignore storage write errors
    }
    applyThemeToDocument(nextTheme);
    emitThemeChange();
  };

  const toggleTheme = (): void => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Reads the current theme mode and toggle actions from ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
