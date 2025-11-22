import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../contexts/LanguageContext";

export function Header() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-600">
            <span className="text-xl font-extrabold text-white">CNE</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CNE</h1>
            <p className="text-xs text-neutral-400">
              {t("Center of New Hope", "Centro de Nueva Esperanza")}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="gap-2 border-neutral-700 bg-neutral-900 hover:bg-neutral-800"
        >
          <Languages className="h-4 w-4" />
          <span className="font-semibold">{language === "en" ? "ES" : "EN"}</span>
        </Button>
      </div>
    </header>
  );
}
