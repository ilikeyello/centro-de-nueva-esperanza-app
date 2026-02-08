"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function GraveyardShiftGamePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      const mainElement = document.querySelector("main");
      if (mainElement) (mainElement as HTMLElement).scrollTop = 0;
    };

    scrollToTop();
    const timeoutId = window.setTimeout(scrollToTop, 100);

    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    const handleTouchStart = () => {
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = "auto";
      }
    };

    const handleUserInteraction = () => {
      if (iframeRef.current) {
        iframeRef.current.allowFullscreen = true;
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("touchstart", handleTouchStart, { passive: true } as any);
      iframe.addEventListener("click", handleUserInteraction, { passive: true } as any);

      if (isPWA) {
        iframe.style.width = "100%";
        iframe.style.maxWidth = "350px";
        iframe.style.margin = "0 auto";
        iframe.style.display = "block";
      }
    }

    return () => {
      window.clearTimeout(timeoutId);
      if (iframe) {
        iframe.removeEventListener("touchstart", handleTouchStart as any);
        iframe.removeEventListener("click", handleUserInteraction as any);
      }
    };
  }, []);

  return (
    <div
      className="h-screen w-full flex flex-col bg-neutral-950 overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex-shrink-0 px-4 pt-0 pb-0 mt-[-4px]">
        <Button
          variant="ghost"
          onClick={() => router.push("/games")}
          className="text-neutral-400 hover:text-white h-8"
          type="button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Back to Games", "Volver a Juegos")}
        </Button>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-2 overflow-hidden pt-0">
        <iframe
          ref={iframeRef}
          frameBorder="0"
          src="https://itch.io/embed-upload/15184635?color=010028"
          allowFullScreen
          width="350"
          height="640"
          className="border border-neutral-700 rounded-lg max-w-full max-h-[calc(100vh-60px)]"
          style={{
            width: "100%",
            maxWidth: "350px",
            height: "100%",
            maxHeight: "640px",
            aspectRatio: "350/640",
            pointerEvents: "auto",
            WebkitUserSelect: "none" as any,
            WebkitTouchCallout: "none" as any,
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-orientation-lock allow-pointer-lock allow-fullscreen allow-presentation"
          allow="autoplay *; fullscreen *; gamepad *; gyroscope *; magnetometer *; accelerometer *; clipboard-read *; clipboard-write *; camera *; microphone *; display-capture *"
        >
          <a href="https://yellogames.itch.io/graveyard-shift">Play Graveyard Shift on itch.io</a>
        </iframe>
      </div>
    </div>
  );
}
