import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { Sparkles, Puzzle, Brain, Users } from "lucide-react";

const gameList = [
  {
    id: 1,
    titleEn: "Bible Trivia Sprint",
    titleEs: "Trivia Bíblica Rápida",
    descriptionEn: "Answer quick-fire questions covering Old and New Testament highlights.",
    descriptionEs: "Responde preguntas rápidas que cubren los puntos destacados del Antiguo y Nuevo Testamento.",
    icon: Brain,
    ctaEn: "Play Trivia",
    ctaEs: "Jugar Trivia",
    link: "https://www.christianity.com/trivia/",
  },
  {
    id: 2,
    titleEn: "Memory Verse Match",
    titleEs: "Memoriza Versículos",
    descriptionEn: "Match verses with their references and commit Scripture to heart.",
    descriptionEs: "Empareja versículos con sus referencias y guarda la Escritura en tu corazón.",
    icon: Puzzle,
    ctaEn: "Start Matching",
    ctaEs: "Comenzar",
    link: "https://biblepathwayadventures.com/memory/",
  },
  {
    id: 3,
    titleEn: "Kids' Adventure Quiz",
    titleEs: "Aventura Bíblica Infantil",
    descriptionEn: "A playful journey through the Bible designed for children and families.",
    descriptionEs: "Un recorrido divertido por la Biblia diseñado para niños y familias.",
    icon: Users,
    ctaEn: "Explore Now",
    ctaEs: "Explorar",
    link: "https://quiz.christianbiblereference.org/children2.htm",
  },
];

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

      <section className="grid gap-6 md:grid-cols-2">
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
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <a href={game.link} target="_blank" rel="noreferrer">
                    {t(game.ctaEn, game.ctaEs)}
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
