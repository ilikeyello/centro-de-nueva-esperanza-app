import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  isDark: false,
});

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getSystemTheme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Update <meta name="theme-color"> so the mobile status bar / notch matches
    const lightMeta = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: light)"]');
    const darkMeta = document.querySelector('meta[name="theme-color"][media="(prefers-color-scheme: dark)"]');
    const themeColor = theme === "dark" ? "#0E1A0B" : "#FAF9F6";
    if (lightMeta) lightMeta.setAttribute("content", theme === "dark" ? "#0E1A0B" : "#FAF9F6");
    if (darkMeta) darkMeta.setAttribute("content", themeColor);
    // Also set a non-media-queried fallback
    let fallbackMeta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!fallbackMeta) {
      fallbackMeta = document.createElement("meta");
      fallbackMeta.setAttribute("name", "theme-color");
      document.head.appendChild(fallbackMeta);
    }
    fallbackMeta.setAttribute("content", themeColor);
  }, [theme]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
