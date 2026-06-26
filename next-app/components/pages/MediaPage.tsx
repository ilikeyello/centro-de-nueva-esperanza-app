"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Calendar, Music, Play, Pause } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";
import { useBackend } from "@/hooks/useBackend";
import { MuxPlayer } from "@/components/MuxPlayer";

interface SermonItem {
  id: number;
  title: string;
  muxPlaybackId: string | null;
  description?: string | null;
  createdAt: string;
}

export function MediaPage() {
  const { language, t } = useLanguage();
  const backend = useBackend();
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const [selectedSermonId, setSelectedSermonId] = useState<number | null>(null);
  const [loadingSermons, setLoadingSermons] = useState(false);
  const {
    tracks,
    playTrackList,
    currentTrack,
    isPlaying,
    livestreamPlaybackId,
    livestreamTitle,
    livestreamIsLive,
  } = usePlayer();

  useEffect(() => {
    const loadSermons = async () => {
      try {
        setLoadingSermons(true);
        const { sermons } = await backend.listSermons();
        const transformed: SermonItem[] = sermons.map((s: any) => ({
          id: s.id,
          title: s.title,
          muxPlaybackId: s.muxPlaybackId ?? null,
          description: s.description ?? null,
          createdAt: s.createdAt,
        }));
        setSermons(transformed);
        if (transformed.length > 0) setSelectedSermonId(transformed[0].id);
      } catch {
        // ignore
      } finally {
        setLoadingSermons(false);
      }
    };
    void loadSermons();
  }, [backend]);

  const selectedSermon = useMemo(() => {
    if (!sermons.length) return null;
    if (selectedSermonId == null) return sermons[0];
    return sermons.find((s) => s.id === selectedSermonId) ?? sermons[0];
  }, [sermons, selectedSermonId]);

  const showLivePlayer = Boolean(livestreamIsLive && livestreamPlaybackId);

  return (
    <div className="container mx-auto space-y-10 px-4 py-8">
      <section className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <Play className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em]">{t("Watch Live", "Ver en Vivo")}</span>
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{t("Experience CNE Online", "Experimenta CNE en Línea")}</h1>
            <p className="text-neutral-300">
              {t(
                "Join us for our weekly services and special events. When we go live, the stream will begin automatically.",
                "Únete a nosotros para nuestros servicios semanales y eventos especiales. Cuando estemos en vivo, la transmisión comenzará automáticamente."
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-red-600 hover:bg-red-700" asChild>
                <a href="#music" className="flex items-center gap-2">
                  <Music className="h-4 w-4" />
                  {t("Listen to Music", "Escuchar Música")}
                </a>
              </Button>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
              <Calendar className="h-5 w-5 text-red-400" />
              <div>
                <p className="text-sm font-semibold text-white">{t("Live Sundays at 3:30 PM", "En vivo los domingos a las 3:30 PM")}</p>
                <p className="text-sm text-neutral-400">{t("Arrive a few minutes early to chat and pray together.", "Llega unos minutos antes para conversar y orar juntos.")}</p>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 shadow-xl md:col-span-2">
            <div className="relative aspect-video">
              {!showLivePlayer && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-neutral-950/90 px-6 text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-400">{livestreamTitle || t("Livestream", "Transmisión en vivo")}</p>
                  <p className="text-xl font-semibold text-white sm:text-2xl">{t("Tune in Sundays at 3:00 PM", "Conéctate los domingos a las 3:00 PM")}</p>
                  <p className="text-xs text-neutral-500">{t("The player will appear when we go live.", "El reproductor aparecerá cuando estemos en vivo.")}</p>
                </div>
              )}
              {showLivePlayer && (
                <MuxPlayer
                  playbackId={livestreamPlaybackId!}
                  streamType="live"
                  title={livestreamTitle || "CNE Live Stream"}
                  className="absolute inset-0 h-full w-full"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{t("Devotionals", "Devocionales")}</h2>
          <p className="text-neutral-400">{t("Catch up on previous devotionals and share them with friends.", "Ponte al día con los devocionales anteriores y compártelos con amigos.")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-none bg-transparent shadow-none md:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">{selectedSermon ? selectedSermon.title : t("No devotional selected", "Ningún devocional seleccionado")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
                {loadingSermons && (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-500">{t("Loading devotionals...", "Cargando devocionales...")}</div>
                )}
                {!loadingSermons && selectedSermon?.muxPlaybackId && (
                  <MuxPlayer
                    key={selectedSermon.muxPlaybackId}
                    playbackId={selectedSermon.muxPlaybackId}
                    streamType="on-demand"
                    title={selectedSermon.title}
                    className="absolute inset-0 h-full w-full"
                  />
                )}
                {!loadingSermons && !selectedSermon && (
                  <div className="flex h-full items-center justify-center text-xs text-neutral-500">{t("No devotionals available yet.", "Todavía no hay devocionales disponibles.")}</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-800 bg-neutral-900/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-white">{t("All Devotionals", "Todos los Devocionales")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-80 space-y-1 overflow-y-auto text-xs">
                {loadingSermons && <p className="text-neutral-500">{t("Loading...", "Cargando...")}</p>}
                {!loadingSermons && sermons.length === 0 && <p className="text-neutral-500">{t("No devotionals available yet.", "Todavía no hay devocionales disponibles.")}</p>}
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
                              {new Date(sermon.createdAt).toLocaleDateString(language === "en" ? "en-US" : "es-MX", {
                                month: "short", day: "numeric", year: "numeric",
                              })}
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
          <h2 className="text-2xl font-bold text-white">{t("Music & Worship", "Música y Adoración")}</h2>
          <p className="text-neutral-400">{t("Listen to worship songs we love to sing together.", "Escucha canciones de adoración que nos encanta cantar juntos.")}</p>
        </div>

        {tracks.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 text-center">
            <Music className="mx-auto mb-2 h-8 w-8 text-neutral-500" />
            <p className="text-sm text-neutral-500">{t("No worship tracks available yet.", "Todavía no hay canciones de adoración disponibles.")}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {tracks.map((track, index) => {
              const isThisPlaying = currentTrack?.id === track.id;
              return (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => playTrackList(tracks, index)}
                    className="flex w-full items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-left transition-colors hover:bg-neutral-800/80"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-lg">
                      {isThisPlaying && isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{track.title}</p>
                      <p className="text-xs text-neutral-400">
                        {isThisPlaying ? t("Now Playing", "Reproduciendo") : track.artist || t("Worship", "Adoración")}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
