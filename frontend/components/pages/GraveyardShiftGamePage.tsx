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
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="text-center space-y-4">
              <Gamepad2 className="h-16 w-16 text-red-400 mx-auto" />
              <h3 className="text-2xl font-bold text-white">
                {t("Ready to Play?", "¿Listo para Jugar?")}
              </h3>
              <p className="text-neutral-400 max-w-md">
                {language === 'es' 
                  ? 'Graveyard Shift se abrirá en una nueva pestaña para la mejor experiencia de juego.'
                  : 'Graveyard Shift will open in a new tab for the best gaming experience.'
                }
              </p>
            </div>
            
            <Button
              onClick={openGameInNewTab}
              className="bg-red-600 hover:bg-red-700 text-lg px-8 py-4"
              size="lg"
            >
              <Maximize2 className="h-5 w-5 mr-2" />
              {t("Play Game", "Jugar")}
            </Button>
            
            <p className="text-sm text-neutral-500 text-center">
              {language === 'es' 
                ? 'El juego se abrirá en una nueva ventana. Puedes volver a esta página cuando termines.'
                : 'Game will open in a new window. You can return to this page when done.'
              }
            </p>
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
