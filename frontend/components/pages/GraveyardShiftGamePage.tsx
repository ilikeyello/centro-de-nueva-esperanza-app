import { ArrowLeft, Gamepad2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { useEffect, useRef } from "react";

export function GraveyardShiftGamePage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { language, t } = useLanguage();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // PWA and mobile fullscreen fixes
    const handleTouchStart = () => {
      if (iframeRef.current) {
        // Force the iframe to be interactive
        iframeRef.current.style.pointerEvents = 'auto';
        
        // Try to trigger fullscreen for PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
          // This is a PWA, set up for fullscreen
          iframeRef.current.allowFullscreen = true;
        }
      }
    };

    const handleUserInteraction = () => {
      // Enable fullscreen after user interaction (required for PWA)
      if (iframeRef.current) {
        iframeRef.current.allowFullscreen = true;
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('touchstart', handleTouchStart, { passive: true });
      iframe.addEventListener('click', handleUserInteraction, { passive: true });
      
      // PWA-specific: Check if running as standalone app
      if (window.matchMedia('(display-mode: standalone)').matches) {
        // Add PWA-specific styles
        iframe.style.width = '100%';
        iframe.style.maxWidth = '350px';
        iframe.style.margin = '0 auto';
        iframe.style.display = 'block';
      }
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('touchstart', handleTouchStart);
        iframe.removeEventListener('click', handleUserInteraction);
      }
    };
  }, []);

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
              ref={iframeRef}
              frameBorder="0"
              src="https://itch.io/embed-upload/15184635?color=010028"
              allowFullScreen
              width="350"
              height="640"
              className="border border-neutral-700 rounded-lg"
              style={{ 
                maxWidth: '100%',
                height: 'auto',
                aspectRatio: '350/640',
                pointerEvents: 'auto',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none'
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-orientation-lock allow-pointer-lock allow-fullscreen allow-presentation"
              allow="autoplay *; fullscreen *; gamepad *; gyroscope *; magnetometer *; accelerometer *; clipboard-read *; clipboard-write *; camera *; microphone *; display-capture *"
            >
              <a href="https://yellogames.itch.io/graveyard-shift">
                Play Graveyard Shift on itch.io
              </a>
            </iframe>
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
