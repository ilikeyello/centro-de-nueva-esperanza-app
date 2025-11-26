import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { Sparkles, Puzzle, Brain, Users } from "lucide-react";
import SimpleTriviaGame from "../games/SimpleTriviaGame";
import { useState } from "react";

const gameList = [
  {
    id: 1,
    titleEn: "Bible Trivia Challenge",
    titleEs: "Desafío de Trivia Bíblica",
    descriptionEn: "Test your Bible knowledge with interactive questions and instant feedback.",
    descriptionEs: "Pon a prueba tu conocimiento bíblico con preguntas interactivas y retroalimentación instantánea.",
    icon: Brain,
    ctaEn: "Play Now",
    ctaEs: "Jugar Ahora",
    link: "bible-trivia",
    internal: true,
  },
];

export function Games() {
  const { language, t } = useLanguage();
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  if (currentGame === "bible-trivia") {
    return <SimpleTriviaGame />;
  }

  return (
    <div className="container mx-auto space-y-10 px-4 py-8">
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-red-400">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em]">
            {t("Faith-filled Fun", "Diversión con Fe")}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {t("Christian Games & Activities", "Juegos y Actividades Cristianas")}
        </h1>
        <p className="max-w-3xl text-neutral-300">
          {t(
            "Grow in faith while having fun with family-friendly games that build Bible knowledge and community.",
            "Crece en la fe mientras te diviertes con juegos familiares que fortalecen el conocimiento bíblico y la comunidad."
          )}
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-1">
        {gameList.map((game) => {
          const Icon = game.icon;
          return (
            <Card key={game.id} className="border-neutral-800 bg-neutral-900/60">
              <CardHeader className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/20 text-red-400">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-white">
                    {language === "en" ? game.titleEn : game.titleEs}
                  </CardTitle>
                  <p className="text-xs text-neutral-400">
                    {t("Interactive", "Interactivo")}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-neutral-300">
                  {language === "en" ? game.descriptionEn : game.descriptionEs}
                </p>
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => game.internal ? setCurrentGame(game.link) : window.open(game.link, '_blank')}
                >
                  {t(game.ctaEn, game.ctaEs)}
                </Button>
              </CardContent>
            </Card>
          );
        })}
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
