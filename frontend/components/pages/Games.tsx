import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { Sparkles, Brain, Play, Clock, Target, Grid3X3, Gamepad2 } from "lucide-react";

export function Games({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { language, t } = useLanguage();

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-neutral-950 overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header - Condensed */}
      <section className="flex-shrink-0 px-4 pt-4 pb-2 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2 text-red-400 mb-1">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">
            {t("Faith-filled Fun", "Diversión con Fe")}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {language === "es" ? "Juegos" : "Games"}
        </h1>
        <p className="text-neutral-400 text-sm max-w-2xl mx-auto md:mx-0">
          {language === "es"
            ? "Actividades divertidas para toda la familia."
            : "Fun activities for the whole family."}
        </p>
      </section>

      {/* Games List - Fits all without scrolling */}
      <section className="flex-1 flex flex-col gap-3 px-4 pb-4 overflow-hidden">
        <Card 
          className="bg-neutral-900 border-neutral-800 hover:border-red-600 transition-all cursor-pointer flex-1 min-h-0"
          onClick={() => onNavigate?.("triviaGame")}
        >
          <CardContent className="p-3 h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-6 w-6 text-red-400" />
              <h3 className="text-lg font-bold text-white">
                {language === 'es' ? 'Trivia Bíblica' : 'Bible Trivia'}
              </h3>
            </div>
            <p className="text-neutral-400 text-xs line-clamp-2">
              {language === 'es' 
                ? 'Pon a prueba tu conocimiento de la Biblia con preguntas divertidas.'
                : 'Test your Bible knowledge with fun questions.'}
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-neutral-900 border-neutral-800 hover:border-red-600 transition-all cursor-pointer flex-1 min-h-0"
          onClick={() => onNavigate?.("wordSearchGame")}
        >
          <CardContent className="p-3 h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <Grid3X3 className="h-6 w-6 text-red-400" />
              <h3 className="text-lg font-bold text-white">
                {language === "es" ? "Sopa de Letras" : "Word Search"}
              </h3>
            </div>
            <p className="text-neutral-400 text-xs line-clamp-2">
              {language === "es"
                ? "Encuentra palabras bíblicas escondidas en la cuadrícula."
                : "Find hidden Bible words in the grid."}
            </p>
          </CardContent>
        </Card>

        <Card 
          className="bg-neutral-900 border-neutral-800 hover:border-red-600 transition-all cursor-pointer flex-1 min-h-0"
          onClick={() => onNavigate?.("graveyardShiftGame")}
        >
          <CardContent className="p-3 h-full flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <Gamepad2 className="h-6 w-6 text-red-400" />
              <h3 className="text-lg font-bold text-white">
                Graveyard Shift
              </h3>
            </div>
            <p className="text-neutral-400 text-xs line-clamp-2">
              {language === 'es' 
                ? 'Un juego de aventuras y misterio emocionante.'
                : 'An exciting adventure and mystery game.'}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
