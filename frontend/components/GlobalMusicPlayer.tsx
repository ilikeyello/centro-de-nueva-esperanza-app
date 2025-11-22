import { useLanguage } from "../contexts/LanguageContext";

const playlistUrl =
  "https://www.youtube.com/embed/videoseries?si=g3eYWy0W6k0dxGAf&list=PLiMbwlK6tmAPdaksYbeLA1Ri11doloNiX";

export function GlobalMusicPlayer() {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-16 right-4 z-40 hidden w-80 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/90 shadow-2xl md:block">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
        {t("Worship Playlist", "Lista de Adoración")}
      </div>
      <div className="aspect-video w-full">
        <iframe
          src={playlistUrl}
          title={t("Global Worship Playlist", "Lista de Adoración Global")}
          className="h-full w-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}
