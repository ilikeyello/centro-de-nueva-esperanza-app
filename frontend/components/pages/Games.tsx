import { useLanguage } from "../../contexts/LanguageContext";
import { Brain, Grid3X3, Gamepad2 } from "lucide-react";
import { GameMenuScreen, GameOptionCard } from "../games/GameMenu";

export function Games({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { t } = useLanguage();

  return (
    <GameMenuScreen
      onBack={() => onNavigate?.("home")}
      backLabel={t("Home", "Inicio")}
      icon={<Gamepad2 />}
      eyebrow={t("Faith-filled Fun", "Diversión con Fe")}
      title={t("Games", "Juegos")}
      subtitle={t("Fun activities for the whole family.", "Actividades divertidas para toda la familia.")}
      footer={t("More games coming soon...", "Más juegos próximamente...")}
    >
      <GameOptionCard
        icon={<Brain />}
        title={t("Bible Trivia", "Trivia Bíblica")}
        description={t("Test your Bible knowledge with fun questions.", "Pon a prueba tu conocimiento de la Biblia con preguntas divertidas.")}
        onClick={() => onNavigate?.("triviaGame")}
      />
      <GameOptionCard
        icon={<Grid3X3 />}
        title={t("Word Search", "Sopa de Letras")}
        description={t("Find hidden Bible words in the grid.", "Encuentra palabras bíblicas escondidas en la cuadrícula.")}
        onClick={() => onNavigate?.("wordSearchGame")}
      />
    </GameMenuScreen>
  );
}
