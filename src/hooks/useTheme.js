import { useState, useEffect } from "react";

const STORAGE_THEME = "prominence-theme";

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_THEME);
      if (stored === "light" || stored === "dark") return stored;
    } catch {}
    // Default to dark mode; respect system preference if nothing stored
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME, theme);
    } catch {}
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  return { theme, toggleTheme };
}
