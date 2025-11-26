import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { Sparkles, Brain } from "lucide-react";

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
        <div className="text-center py-16">
          <Card className="w-full max-w-2xl mx-auto bg-neutral-900 border-neutral-800">
            <CardContent className="text-center p-8">
              <Brain className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                {t("Games Coming Soon", "Juegos Próximamente")}
              </h2>
              <p className="text-neutral-400 mb-4">
                {language === "es"
                  ? "Estamos trabajando para traerte juegos y actividades divertidas. Vuelve pronto para ver las novedades."
                  : "We're working on bringing you fun games and activities. Check back soon for updates."}
              </p>
              <p className="text-sm text-neutral-500">
                {t("Trivia, puzzles, and more coming your way!", "¡Trivia, acertijos y más en camino!")}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center">
          <div className="flex items-center justify-center gap-2 text-neutral-400 mb-3">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-[0.2em]">
              {t("More Coming Soon", "Más Pronto")}
            </span>
          </div>
          <p className="text-neutral-300">
            {t(
              "We're working on more exciting games and activities to help you grow in faith. Check back soon for new additions!",
              "Estamos trabajando en más juegos y actividades emocionantes para ayudarte a crecer en la fe. ¡Vuelve pronto para ver las nuevas adiciones!"
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
