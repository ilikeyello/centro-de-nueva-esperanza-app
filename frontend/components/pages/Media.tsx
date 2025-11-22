import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { Calendar, Music, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "../../contexts/PlayerContext";

const LIVESTREAM_DAY = 0; // Sunday
const LIVESTREAM_HOUR = 15;
const LIVESTREAM_MINUTE = 30;
// Approximate service length including a small grace window for late starts
const LIVESTREAM_DURATION_MINUTES = 120;

function getNextLivestream(reference: Date) {
  const next = new Date(reference);
  next.setSeconds(0, 0);
  next.setMinutes(LIVESTREAM_MINUTE);
  next.setHours(LIVESTREAM_HOUR);

  const daysUntilService = (LIVESTREAM_DAY - reference.getDay() + 7) % 7;
  next.setDate(reference.getDate() + daysUntilService);

  if (daysUntilService === 0 && reference.getTime() >= next.getTime()) {
    next.setDate(next.getDate() + 7);
  }

  return next;
}

function formatCountdown(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const segments = [];
  if (days > 0) segments.push(`${days}d`);
  segments.push(`${hours.toString().padStart(2, "0")}h`);
  segments.push(`${minutes.toString().padStart(2, "0")}m`);
  segments.push(`${seconds.toString().padStart(2, "0")}s`);

  return segments.join(" ");
}

interface SermonItem {
  id: number;
  title: string;
  youtubeUrl: string;
  createdAt: string;
}

interface MediaProps {
  onStartMusic?: () => void;
}

export function Media({ onStartMusic }: MediaProps) {
  const { language, t } = useLanguage();
  const [now, setNow] = useState(() => new Date());
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const [selectedSermonId, setSelectedSermonId] = useState<number | null>(null);
  const [loadingSermons, setLoadingSermons] = useState(false);
  const { playTrack, playlistUrl, livestreamUrl } = usePlayer();
  const [isStreamPlaying, setIsStreamPlaying] = useState(false);
  const playerRef = useRef<any | null>(null);

  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPasscode, setUploadPasscode] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadSermons = async () => {
      try {
        setLoadingSermons(true);
        const base = import.meta.env.DEV
          ? "http://127.0.0.1:4000"
          : "https://prod-cne-sh82.encr.app";
        const res = await fetch(`${base}/sermons/recent`);
        if (!res.ok) return;

        const raw = (await res.json()) as any;
        const rawSermons = raw?.sermons;
        const list: SermonItem[] = Array.isArray(rawSermons)
          ? rawSermons
          : rawSermons && typeof rawSermons === "object"
          ? Object.values(rawSermons)
          : [];

        setSermons(list);
        if (list.length > 0) {
          setSelectedSermonId(list[0].id);
        }
      } catch {
        // ignore, show empty state
      } finally {
        setLoadingSermons(false);
      }
    };

    loadSermons();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const w = window as any;
    let cancelled = false;

    const createPlayer = () => {
      if (cancelled) return;
      if (!w.YT || !w.YT.Player) return;
      if (playerRef.current) return;

      const existing = document.getElementById("cne-livestream-player");
      if (!existing) return;

      playerRef.current = new w.YT.Player("cne-livestream-player", {
        events: {
          onStateChange: (event: any) => {
            const YT = w.YT;
            if (!YT || !YT.PlayerState) return;
            if (event.data === YT.PlayerState.PLAYING) {
              setIsStreamPlaying(true);
            } else if (event.data === YT.PlayerState.ENDED) {
              setIsStreamPlaying(false);
            }
          },
        },
      });
    };

    if (w.YT && w.YT.Player) {
      createPlayer();
    } else {
      const prevReady = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        if (typeof prevReady === "function") prevReady();
        createPlayer();
      };

      const existingScript = document.querySelector(
        "script[src='https://www.youtube.com/iframe_api']"
      );
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
    }

    return () => {
      cancelled = true;
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  const selectedSermon = useMemo(() => {
    if (!Array.isArray(sermons) || sermons.length === 0) return null;
    if (selectedSermonId == null) return sermons[0];
    return sermons.find((s) => s.id === selectedSermonId) ?? sermons[0];
  }, [sermons, selectedSermonId]);

  const isDev = import.meta.env.DEV;
  const devSampleSermon: SermonItem | null = isDev
    ? {
        id: -1,
        title: "Sample Devotional (Local Only)",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        createdAt: new Date().toISOString(),
      }
    : null;

  const effectiveSelectedSermon = selectedSermon ?? devSampleSermon;

  const getEmbedUrl = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.replace("/", "");
        return `https://www.youtube.com/embed/${id}`;
      }
      if (u.searchParams.get("v")) {
        const id = u.searchParams.get("v");
        return `https://www.youtube.com/embed/${id}`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const nextLivestream = useMemo(() => getNextLivestream(now), [now]);

  // Previous livestream window (last Sunday at service time, plus duration)
  const previousLivestreamStart = useMemo(() => {
    const prev = new Date(nextLivestream);
    prev.setDate(prev.getDate() - 7);
    return prev;
  }, [nextLivestream]);

  const previousLivestreamEnd = useMemo(() => {
    const end = new Date(previousLivestreamStart);
    end.setMinutes(end.getMinutes() + LIVESTREAM_DURATION_MINUTES);
    return end;
  }, [previousLivestreamStart]);

  const millisecondsUntilStream = nextLivestream.getTime() - now.getTime();

  const isInCurrentLivestreamWindow =
    now >= previousLivestreamStart && now <= previousLivestreamEnd;

  // Show countdown only when we're before the *next* livestream AND
  // not currently within the previous service's live window.
  const showCountdown =
    millisecondsUntilStream > 0 && now >= previousLivestreamEnd && !isStreamPlaying;

  const countdownLabel = formatCountdown(Math.max(millisecondsUntilStream, 0));
  const nextServiceFormatted = useMemo(() => {
    return nextLivestream.toLocaleString(language === "en" ? "en-US" : "es-MX", {
      weekday: "long",
      hour: "numeric",
      minute: "2-digit",
    });
  }, [language, nextLivestream]);

  const nextStreamMessage =
    language === "en"
      ? `Next stream: ${nextServiceFormatted}`
      : `Próxima transmisión: ${nextServiceFormatted}`;

  // When countdown ends and we are in the current live window, try to start playback once.
  useEffect(() => {
    if (!isInCurrentLivestreamWindow) return;
    if (showCountdown) return;
    if (isStreamPlaying) return;
    if (!playerRef.current || typeof playerRef.current.playVideo !== "function") return;

    try {
      playerRef.current.playVideo();
    } catch {
      // Autoplay may be blocked by the browser; user can still start manually.
    }
  }, [isInCurrentLivestreamWindow, showCountdown, isStreamPlaying]);

  return (
    <div className="container mx-auto space-y-10 px-4 py-8">
      <section className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <Play className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                {t("Watch Live", "Ver en Vivo")}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {t("Experience CNE Online", "Experimenta CNE en Línea")}
            </h1>
            <p className="text-neutral-300">
              {t(
                "Join us for our weekly services and special events. When we go live, the stream will begin automatically.",
                "Únete a nosotros para nuestros servicios semanales y eventos especiales. Cuando estemos en vivo, la transmisión comenzará automáticamente."
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-red-600 hover:bg-red-700" asChild>
                <a
                  href="#music"
                  className="flex items-center gap-2"
                  onClick={() => {
                    if (onStartMusic) {
                      onStartMusic();
                    }
                  }}
                >
                  <Music className="h-4 w-4" />
                  {t("Listen to Music", "Escuchar Música")}
                </a>
              </Button>
              <Button
                variant="outline"
                className="border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
                asChild
              >
                <a
                  href="https://www.youtube.com/@centrodenuevaesperanzaiglesia"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("View All on YouTube", "Ver todo en YouTube")}
                </a>
              </Button>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
              <Calendar className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm font-semibold text-white">
                  {t("Live Sundays at 3:30 PM", "En vivo los domingos a las 3:30 PM")}
                </p>
                <p className="text-sm text-neutral-400">
                  {t(
                    "Arrive a few minutes early to chat and pray together.",
                    "Llega unos minutos antes para conversar y orar juntos."
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 shadow-xl md:col-span-2">
            <div className="relative aspect-video">
              {showCountdown && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-neutral-950/90 px-6 text-center">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-400">
                      {t("Live service begins soon", "El servicio en vivo comienza pronto")}
                    </p>
                    <p className="text-xl font-semibold text-white sm:text-2xl">
                      {t("We'll go live in", "Comenzaremos en")}
                    </p>
                    <p className="text-3xl font-bold text-white sm:text-4xl">{countdownLabel}</p>
                    <p className="text-sm text-neutral-300">
                      {nextStreamMessage}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {t(
                        "Stay on this page and the stream will start automatically.",
                        "Permanece en esta página y la transmisión comenzará automáticamente."
                      )}
                    </p>
                  </div>
                </div>
              )}
              <iframe
                id="cne-livestream-player"
                src={livestreamUrl}
                title={t("CNE Live Stream", "Transmisión en Vivo de CNE")}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {t("Devotionals", "Devocionales")}
          </h2>
          <p className="text-neutral-400">
            {t(
              "Catch up on previous devotionals and share them with friends.",
              "Ponte al día con los devocionales anteriores y compártelos con amigos."
            )}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-none bg-transparent shadow-none md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">
                {effectiveSelectedSermon
                  ? effectiveSelectedSermon.title
                  : t("No devotional selected", "Ningún devocional seleccionado")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-2xl">
                {loadingSermons && !selectedSermon && (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-500">
                    {t("Loading sermons...", "Cargando sermones...")}
                  </div>
                )}
                {!loadingSermons && effectiveSelectedSermon && (
                  <iframe
                    src={getEmbedUrl(effectiveSelectedSermon.youtubeUrl)}
                    title={effectiveSelectedSermon.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
                {!loadingSermons && !effectiveSelectedSermon && (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-500">
                    {t("No devotionals available yet.", "Todavía no hay devocionales disponibles.")}
                  </div>
                )}
              </div>
              {!loadingSermons && effectiveSelectedSermon && (
                <p className="text-xs text-neutral-500">
                  {t(
                    "Tap a devotional from the list on the right to watch a different message.",
                    "Toca un devocional de la lista de la derecha para ver un mensaje diferente."
                  )}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-neutral-800 bg-neutral-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">
                {t("All Devotionals", "Todos los Devocionales")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 space-y-1 overflow-y-auto text-xs">
                {loadingSermons && (
                  <p className="text-neutral-500">
                    {t("Loading sermons...", "Cargando sermones...")}
                  </p>
                )}
                {!loadingSermons && sermons.length === 0 && (
                  <p className="text-neutral-500">
                    {t("No devotionals available yet.", "Todavía no hay devocionales disponibles.")}
                  </p>
                )}
                {!loadingSermons && sermons.length > 0 && (
                  <ul className="space-y-1">
                    {sermons.map((sermon) => {
                      const isActive = selectedSermon?.id === sermon.id;
                      return (
                        <li key={sermon.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedSermonId(sermon.id)}
                            className={`flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left transition-colors ${
                              isActive
                                ? "bg-red-600/20 text-red-50 border border-red-500"
                                : "border border-transparent text-neutral-200 hover:border-neutral-700 hover:bg-neutral-800/80"
                            }`}
                          >
                            <span className="truncate text-[0.8rem] font-medium">{sermon.title}</span>
                            <span className="mt-0.5 text-[0.65rem] text-neutral-400">
                              {new Date(sermon.createdAt).toLocaleDateString(
                                language === "en" ? "en-US" : "es-MX",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="music" className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {t("Music & Worship", "Música y Adoración")}
          </h2>
          <p className="text-neutral-400">
            {t(
              "Listen to curated worship playlists that we love to sing together.",
              "Escucha listas de reproducción de adoración que nos encanta cantar juntos."
            )}
          </p>
          <div className="mt-3">
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => playTrack(playlistUrl)}
            >
              <Play className="mr-2 h-4 w-4" />
              {t("Play YouTube Worship Playlist", "Reproducir lista de adoración en YouTube")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
