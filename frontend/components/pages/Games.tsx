import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { Sparkles, Brain, Play, Clock, Target } from "lucide-react";
import { TriviaGame } from "./TriviaGame";

export function Games() {
  const { language, t } = useLanguage();

  return (
    <div className="container mx-auto space-y-10 px-4 py-8">
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-red-400">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">
            {t("Faith-filled Fun", "Diversión con Fe")}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-white">
          {language === "es" ? "Juegos" : "Games"}
        </h1>
        <p className="text-neutral-400 max-w-2xl">
          {language === "es"
            ? "Juegos interactivos y actividades divertidas para toda la familia. Prueba tu conocimiento y disfruta de entretenimiento inspirador."
            : "Interactive games and fun activities for the whole family. Test your knowledge and enjoy uplifting entertainment."}
        </p>
      </section>

      <section className="space-y-6">
        <TriviaGame />
      </section>
    </div>
  );
}
