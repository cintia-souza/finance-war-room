"use client";
import { useEffect, useState } from "react";

export type Theme = "dark" | "light" | "colorblind";

const THEME_KEY = "destrava-theme";

export const THEME_LABELS: Record<Theme, string> = {
  dark: "Escuro",
  light: "Claro",
  colorblind: "Alto contraste (daltonismo)",
};

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return { theme, changeTheme };
}
