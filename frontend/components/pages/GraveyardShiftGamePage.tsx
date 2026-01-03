import { ArrowLeft, Gamepad2, ExternalLink, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { useState } from "react";

export function GraveyardShiftGamePage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { language, t } = useLanguage();

  const openGameInNewTab = () => {
    window.open('https://yellogames.itch.io/graveyard-shift', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => onNavigate?.("games")}
          className="mb-4 text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Back to Games", "Volver a Juegos")}
        </Button>
        
        <div className="flex items-center gap-3 mb-4">
          <Gamepad2 className="h-8 w-8 text-red-400" />
          <h1 className="text-3xl font-bold text-white">
            Graveyard Shift
          </h1>
        </div>
        
        <p className="text-neutral-400 max-w-2xl">
          {language === 'es' 
            ? 'Un juego de aventuras y misterio. ¡Embárcate en una experiencia emocionante!'
            : 'An adventure and mystery game. Embark on an exciting experience!'
          }
        </p>
      </div>

      {/* Game Container */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <iframe
              frameBorder="0"
              src="https://itch.io/embed-upload/15184635?color=010028"
              allowFullScreen
              width="800"
              height="600"
              className="border border-neutral-700 rounded-lg max-w-4xl w-full"
              style={{ minHeight: '400px' }}
            >
              <a href="https://yellogames.itch.io/graveyard-shift">
                Play Graveyard Shift on itch.io
              </a>
            </iframe>
          </div>
          
          <div className="mt-4 text-center">
            <Button
              onClick={() => {
                const iframe = document.querySelector('iframe') as HTMLIFrameElement;
                if (iframe && iframe.requestFullscreen) {
                  iframe.requestFullscreen();
                } else if (iframe && (iframe as any).webkitRequestFullscreen) {
                  (iframe as any).webkitRequestFullscreen();
                } else if (iframe && (iframe as any).mozRequestFullScreen) {
                  (iframe as any).mozRequestFullScreen();
                } else if (iframe && (iframe as any).msRequestFullscreen) {
                  (iframe as any).msRequestFullscreen();
                }
              }}
              variant="outline"
              size="sm"
              className="border-neutral-600 text-neutral-400 hover:text-white"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              {t("Fullscreen", "Pantalla Completa")}
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-neutral-800">
            <p className="text-sm text-neutral-500">
              {language === 'es' ? 'Creado por Yello Games' : 'Created by Yello Games'}
            </p>
            
            <a 
              href="https://yellogames.itch.io/graveyard-shift" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm underline"
            >
              <ExternalLink className="h-4 w-4" />
              {language === 'es' ? 'Ver en itch.io' : 'View on itch.io'}
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-neutral-900 border-neutral-800 mt-6">
        <CardContent className="p-6">
          <h3 className="text-xl font-semibold text-white mb-3">
            {t("How to Play", "Cómo Jugar")}
          </h3>
          <ul className="text-neutral-400 space-y-2">
            <li>• {t("Use your keyboard or mouse to control the game", "Usa tu teclado o ratón para controlar el juego")}</li>
            <li>• {t("Click the fullscreen button for better experience", "Haz clic en el botón de pantalla completa para una mejor experiencia")}</li>
            <li>• {t("Enjoy the adventure and mystery gameplay", "Disfruta del juego de aventuras y misterio")}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
