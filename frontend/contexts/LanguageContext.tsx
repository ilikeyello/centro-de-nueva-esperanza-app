import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (en: string, es: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Default to Spanish, but respect a stored preference if present
    if (typeof window === "undefined") return "es";
    try {
      const stored = window.localStorage.getItem("cne_language");
      if (stored === "en" || stored === "es") return stored;
    } catch {
      // ignore storage errors and fall back to default
    }
    return "es";
  });

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("cne_language", language);
      }
    } catch {
      // ignore storage errors
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "es" : "en"));
  };

  const t = (en: string, es: string) => {
    return language === "en" ? en : es;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
