import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { Sparkles, Brain, Play, Clock, Target, ChevronRight } from "lucide-react";

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
            ? "Juegos interactivos y actividades divertidas para toda la familia. Prueba tu conocimiento y disfruta de entretenimiento inspirado."
            : "Interactive games and fun activities for the whole family. Test your knowledge and enjoy uplifting entertainment."}
        </p>
      </section>

      <section className="space-y-6">
        <Card className="bg-neutral-900 border-neutral-800 hover:border-red-600 transition-all cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Brain className="h-8 w-8 text-red-400" />
                  <h3 className="text-2xl font-bold text-white">
                    {language === 'es' ? 'Trivia Bíblica' : 'Bible Trivia'}
                  </h3>
                </div>
                <p className="text-neutral-400 mb-4">
                  {language === 'es' 
                    ? 'Pon a prueba tu conocimiento de la Biblia con preguntas divertidas y educativas para todas las edades.'
                    : 'Test your Bible knowledge with fun and educational questions for all ages.'
                  }
                </p>
                <div className="flex gap-4 text-sm text-neutral-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {t("Timed Questions", "Preguntas Cronometradas")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {t("Multiple Levels", "Múltiples Niveles")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Play className="h-6 w-6 text-red-400 group-hover:scale-110 transition-transform" />
                <ChevronRight className="h-6 w-6 text-neutral-400 group-hover:text-red-400 transition-colors" />
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/trivia-game'} 
              className="mt-4 w-full bg-red-600 hover:bg-red-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {t("Play Now", "Jugar Ahora")}
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder for future games */}
        <Card className="bg-neutral-900/50 border-neutral-800 border-dashed">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-neutral-600" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {t("More Games Coming Soon", "Más Juegos Pronto")}
            </h3>
            <p className="text-neutral-400">
              {t("Check back for more faith-filled games and activities!", "¡Vuelve a consultar para más juegos y actividades llenas de fe!")}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
