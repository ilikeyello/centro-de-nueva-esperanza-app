import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { Calendar, ChevronDown, ChevronUp, Loader2, Music, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "../../contexts/PlayerContext";
import { useBackend } from "../../hooks/useBackend";
import { cn } from "@/lib/utils";

// YouTube livestream detection
let youtubeAPIReady = false;
let liveCheckInterval: NodeJS.Timeout | null = null;

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
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
  const backend = useBackend();
  const [sermons, setSermons] = useState<SermonItem[]>([]);
  const [selectedSermonId, setSelectedSermonId] = useState<number | null>(null);
  const [loadingSermons, setLoadingSermons] = useState(false);
  const {
    playPlaylistByUrl,
    playlists,
    isPlayingYouTubePlaylist,
    currentPlaylistVideos,
    currentPlaylistActiveIndex,
    playVideoAtIndex,
    currentTrack,
    isPlaying,
    livestreamUrl,
    livestreamTitle,
    livestreamIsLive,
  } = usePlayer();
  const [expandedPlaylistId, setExpandedPlaylistId] = useState<string | null>(null);
  const [isStreamPlaying, setIsStreamPlaying] = useState(false);
  const [isActuallyLive, setIsActuallyLive] = useState(false);
  const [manualLiveOverride, setManualLiveOverride] = useState(false);
  const playerRef = useRef<any | null>(null);

  useEffect(() => {
    const loadSermons = async () => {
      try {
        setLoadingSermons(true);
        const { sermons } = await backend.listSermons();
        // Transform Supabase sermons to SermonItem format
        const transformedSermons: SermonItem[] = sermons.map((sermon: any) => ({
          id: sermon.id,
          title: sermon.title,
          youtubeUrl: sermon.youtube_url || sermon.youtubeUrl,
          createdAt: sermon.created_at || sermon.createdAt
        }));
        setSermons(transformedSermons);
        if (transformedSermons.length > 0) {
          setSelectedSermonId(transformedSermons[0].id);
        }
      } catch {
        // ignore, show empty state
      } finally {
        setLoadingSermons(false);
      }
    };

    loadSermons();
  }, [backend]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!livestreamUrl) return;

    const w = window as any;
    let cancelled = false;
    let checkInterval: NodeJS.Timeout | null = null;

    const checkIfLive = () => {
      if (!playerRef.current) return;
      
      try {
        const player = playerRef.current;
        const duration = player.getDuration();
        const playerState = player.getPlayerState();
        const videoData = player.getVideoData();
        
        console.log('Checking if live - duration:', duration, 'state:', playerState, 'videoData:', videoData);
        
        // Only consider it live if duration is 0 or NaN (the most reliable indicator)
        // Duration > 0 means it's a regular video, not a livestream
        const hasValidVideo = videoData && videoData.video_id;
        const isLiveDuration = duration === 0 || isNaN(duration);
        
        if (hasValidVideo && isLiveDuration) {
          console.log('Stream detected as live (duration is 0 or NaN)');
          setIsActuallyLive(true);
        } else {
          console.log('Stream not live (duration:', duration, ')');
          setIsActuallyLive(false);
        }
      } catch (error) {
        console.error('Error checking if live:', error);
        setIsActuallyLive(false);
      }
    };

    const createPlayer = () => {
      if (cancelled) return;
      if (!w.YT || !w.YT.Player) return;

      // Destroy existing player if it exists
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        console.log('Destroying existing player');
        playerRef.current.destroy();
        playerRef.current = null;
      }

      const existing = document.getElementById("cne-livestream-player");
      if (!existing) return;

      console.log('Creating new player for URL:', livestreamUrl);
      playerRef.current = new w.YT.Player("cne-livestream-player", {
        events: {
          onReady: (event: any) => {
            console.log('Livestream player ready');
            checkIfLive();
            // Check periodically for live status
            if (checkInterval) clearInterval(checkInterval);
            checkInterval = setInterval(checkIfLive, 10000); // Check every 10 seconds
          },
          onStateChange: (event: any) => {
            const YT = w.YT;
            if (!YT || !YT.PlayerState) return;
            console.log('Player state changed:', event.data);
            
            if (event.data === YT.PlayerState.PLAYING) {
              setIsStreamPlaying(true);
              setIsActuallyLive(true);
            } else if (event.data === YT.PlayerState.ENDED) {
              setIsStreamPlaying(false);
              setIsActuallyLive(false);
            } else if (event.data === YT.PlayerState.BUFFERING || event.data === YT.PlayerState.CUED) {
              // Check if it's actually live when buffering/cued
              checkIfLive();
            }
          },
          onError: (event: any) => {
            console.error('Player error:', event.data);
            setIsActuallyLive(false);
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
      if (checkInterval) {
        clearInterval(checkInterval);
      }
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [livestreamUrl]);

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
    console.log('getEmbedUrl input:', url);
    
    // Return empty string if no URL provided
    if (!url || url.trim() === '') {
      console.log('getEmbedUrl: empty URL, returning empty string');
      return '';
    }
    
    try {
      const u = new URL(url);
      
      // Handle YouTube live channel embed URLs
      if (u.pathname.includes('/embed/live_stream') && u.searchParams.get('channel')) {
        const channelId = u.searchParams.get('channel');
        const result = `https://www.youtube.com/embed/live_stream?channel=${channelId}`;
        console.log('getEmbedUrl output (channel live):', result);
        return result;
      }
      
      // Handle YouTube channel URLs (convert to live stream embed)
      if (u.pathname.includes('/channel/') || u.pathname.includes('/c/') || u.pathname.includes('/@')) {
        let channelId = '';
        if (u.pathname.includes('/channel/')) {
          channelId = u.pathname.split('/channel/')[1]?.split('?')[0] || '';
        } else if (u.pathname.includes('/c/')) {
          channelId = u.pathname.split('/c/')[1]?.split('?')[0] || '';
        } else if (u.pathname.includes('/@')) {
          channelId = u.pathname.split('/@')[1]?.split('?')[0] || '';
        }
        
        if (channelId) {
          // Try multiple channel live stream formats
          const formats = [
            `https://www.youtube.com/embed/live_stream?channel=${channelId}`,
            `https://www.youtube.com/embed/${channelId}?live=1`,
            `https://www.youtube.com/embed/live_stream?channel=${channelId}`
          ];
          
          console.log('getEmbedUrl output (channel live formats):', formats[0]);
          return formats[0]; // Use the first format
        }
      }
      
      // Handle regular YouTube URLs
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '');
        const result = `https://www.youtube.com/embed/${id}?enablejsapi=1`;
        console.log('getEmbedUrl output (youtu.be):', result);
        return result;
      }
      if (u.searchParams.get('v')) {
        const id = u.searchParams.get('v');
        const result = `https://www.youtube.com/embed/${id}?enablejsapi=1`;
        console.log('getEmbedUrl output (watch):', result);
        return result;
      }
      if (u.pathname.includes('/live/')) {
        const id = u.pathname.split('/live/')[1]?.split('?')[0];
        const result = `https://www.youtube.com/embed/${id}?enablejsapi=1`;
        console.log('getEmbedUrl output (live):', result);
        return result;
      }
      if (u.pathname.includes('/embed/')) {
        // Already in embed format, just add enablejsapi if missing
        if (u.searchParams.has('enablejsapi')) {
          console.log('getEmbedUrl output (already embed):', url);
          return url;
        }
        u.searchParams.set('enablejsapi', '1');
        const result = u.toString();
        console.log('getEmbedUrl output (embed with enablejsapi):', result);
        return result;
      }
      
      console.log('getEmbedUrl output (fallback):', url);
      return url;
    } catch (error) {
      console.error('getEmbedUrl error:', error);
      return url;
    }
  };

  // Removed periodic refresh to avoid overriding main-site value

  // (Removed autoplay attempt tied to legacy window calculation)

  // Create hidden div for YouTube player detection
  useEffect(() => {
    if (!livestreamUrl) return;

    // Create hidden div for YouTube player
    const detectorDiv = document.createElement('div');
    detectorDiv.id = 'youtube-livestream-detector';
    detectorDiv.style.display = 'none';
    document.body.appendChild(detectorDiv);

    return () => {
      const existingDiv = document.getElementById('youtube-livestream-detector');
      if (existingDiv) {
        existingDiv.remove();
      }
    };
  }, [livestreamUrl]);

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
              {!livestreamIsLive && !manualLiveOverride && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-neutral-900/95 px-6 text-center">
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-400">
                    {livestreamTitle || t("Livestream", "Transmisión en vivo")}
                  </p>
                  <p className="text-xl font-bold text-white sm:text-2xl">
                    {t("Tune in Sundays at 3:00 PM", "Conéctate los domingos a las 3:00 PM")}
                  </p>
                  <p className="text-sm text-neutral-300">
                    {t(
                      "The player will appear when we go live.",
                      "El reproductor aparecerá cuando estemos en vivo."
                    )}
                  </p>
                </div>
              )}

              {(livestreamIsLive || manualLiveOverride) && (
                <iframe
                  key={getEmbedUrl(livestreamUrl)}
                  id="cne-livestream-player"
                  src={getEmbedUrl(livestreamUrl)}
                  title={livestreamTitle || t("CNE Live Stream", "Transmisión en Vivo de CNE")}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onLoad={() => {
                    console.log('Livestream iframe loaded with src:', getEmbedUrl(livestreamUrl));
                  }}
                  onError={() => {
                    console.error('Livestream iframe failed to load with src:', getEmbedUrl(livestreamUrl));
                  }}
                />
              )}
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
                    "Tap a devotional from the list to watch a different message.",
                    "Toca un devocional de la lista para ver un mensaje diferente."
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
        </div>

        {playlists.length === 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-center">
            <Music className="mx-auto mb-2 h-8 w-8 text-neutral-600" />
            <p className="text-sm text-neutral-500">
              {t("No playlists available yet.", "Todavía no hay listas de reproducción disponibles.")}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {playlists.map((playlist) => {
            const isExpanded = expandedPlaylistId === playlist.id;
            const isThisPlaylistPlaying =
              isPlayingYouTubePlaylist &&
              currentTrack?.includes("list=") &&
              playlist.url.includes(
                currentTrack.match(/list=([^&]+)/)?.[1] || "__none__"
              );

            return (
              <Card
                key={playlist.id}
                className="overflow-hidden border-neutral-800 bg-neutral-900/60 transition-colors"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-neutral-800/30"
                  onClick={() =>
                    setExpandedPlaylistId(isExpanded ? null : playlist.id)
                  }
                >
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      playPlaylistByUrl(playlist.url, playlist.title);
                      setExpandedPlaylistId(playlist.id);
                      if (onStartMusic) onStartMusic();
                    }}
                    role="button"
                    aria-label={t(
                      `Play ${playlist.title}`,
                      `Reproducir ${playlist.title}`
                    )}
                  >
                    {isThisPlaylistPlaying && isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {playlist.title}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {isThisPlaylistPlaying
                        ? t("Now Playing", "Reproduciendo")
                        : t("YouTube Playlist", "Lista de YouTube")}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0 text-neutral-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-neutral-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-neutral-800 px-4 pb-4 pt-2">
                    {!isThisPlaylistPlaying && (
                      <button
                        type="button"
                        className="mb-3 w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                        onClick={() => {
                          playPlaylistByUrl(playlist.url, playlist.title);
                          if (onStartMusic) onStartMusic();
                        }}
                      >
                        <Play className="mr-2 inline h-4 w-4" />
                        {t("Play Playlist", "Reproducir Lista")}
                      </button>
                    )}

                    {isThisPlaylistPlaying &&
                    currentPlaylistVideos.length > 0 ? (
                      <ul className="max-h-72 space-y-1 overflow-y-auto">
                        {currentPlaylistVideos.map((video, idx) => {
                          const isActive =
                            idx === currentPlaylistActiveIndex;
                          return (
                            <li key={video.videoId}>
                              <button
                                type="button"
                                onClick={() => playVideoAtIndex(idx)}
                                className={cn(
                                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                                  isActive
                                    ? "bg-red-600/20 text-red-200 border border-red-500/40"
                                    : "border border-transparent text-neutral-300 hover:bg-neutral-800/60 hover:text-white"
                                )}
                              >
                                <span className="w-6 flex-shrink-0 text-center text-xs text-neutral-500">
                                  {isActive && isPlaying ? (
                                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                                  ) : (
                                    idx + 1
                                  )}
                                </span>
                                <span className="min-w-0 flex-1 truncate">
                                  {video.loading ? (
                                    <span className="inline-flex items-center gap-1.5 text-neutral-500">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      {t("Loading...", "Cargando...")}
                                    </span>
                                  ) : (
                                    video.title
                                  )}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : isThisPlaylistPlaying ? (
                      <div className="flex items-center justify-center gap-2 py-4 text-sm text-neutral-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t(
                          "Loading playlist songs...",
                          "Cargando canciones de la lista..."
                        )}
                      </div>
                    ) : (
                      <p className="py-2 text-center text-xs text-neutral-500">
                        {t(
                          "Press play to see all songs",
                          "Presiona reproducir para ver todas las canciones"
                        )}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
