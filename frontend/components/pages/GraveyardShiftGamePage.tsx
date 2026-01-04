import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { useEffect, useRef } from "react";

export function GraveyardShiftGamePage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { language, t } = useLanguage();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Scroll to top immediately when page loads
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    // PWA and mobile fullscreen fixes
    const handleTouchStart = () => {
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = 'auto';
        
        if (window.matchMedia('(display-mode: standalone)').matches) {
          iframeRef.current.allowFullscreen = true;
        }
      }
    };

    const handleUserInteraction = () => {
      if (iframeRef.current) {
        iframeRef.current.allowFullscreen = true;
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('touchstart', handleTouchStart, { passive: true });
      iframe.addEventListener('click', handleUserInteraction, { passive: true });
      
      if (window.matchMedia('(display-mode: standalone)').matches) {
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
    <div className="h-screen w-full flex flex-col bg-neutral-950 overflow-hidden">
      {/* Back Button - Minimal spacing */}
      <div className="flex-shrink-0 px-4 pt-2 pb-1">
        <Button
          variant="ghost"
          onClick={() => onNavigate?.("games")}
          className="text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Back to Games", "Volver a Juegos")}
        </Button>
      </div>

      {/* Game Container - Takes remaining space with minimal padding */}
      <div className="flex-1 flex items-center justify-center px-4 pb-2 overflow-hidden">
        <iframe
          ref={iframeRef}
          frameBorder="0"
          src="https://itch.io/embed-upload/15184635?color=010028"
          allowFullScreen
          width="350"
          height="640"
          className="border border-neutral-700 rounded-lg max-w-full max-h-full"
          style={{ 
            width: '100%',
            maxWidth: '350px',
            height: '100%',
            maxHeight: '640px',
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
    </div>
  );
}
