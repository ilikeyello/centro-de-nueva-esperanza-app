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

// YouTube livestream detection
let youtubeAPIReady = false;
let liveCheckInterval: NodeJS.Timeout | null = null;

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

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
  const { playTrack, playPlaylistFromIndex, playlistUrl, livestreamUrl } = usePlayer();
  const [isStreamPlaying, setIsStreamPlaying] = useState(false);
  const [isActuallyLive, setIsActuallyLive] = useState(false);
  const [manualLiveOverride, setManualLiveOverride] = useState(false);
  const playerRef = useRef<any | null>(null);
  const youtubePlayerRef = useRef<any | null>(null);

  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPasscode, setUploadPasscode] = useState("");
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [playlistSongs, setPlaylistSongs] = useState<{
    id: string;
    title: string;
    artist: string;
    position: number;
  }[]>([]);
  const [loadingPlaylistSongs, setLoadingPlaylistSongs] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadPlaylistSongs = async () => {
      if (!playlistUrl) return;
      setLoadingPlaylistSongs(true);
      try {
        const base = import.meta.env.DEV
          ? "http://127.0.0.1:4000"
          : "https://prod-cne-sh82.encr.app";
        const res = await fetch(`${base}/playlist/items`);
        if (!res.ok) return;
        const data = await res.json();
        const rawItems = Array.isArray(data.items) ? data.items : [];
        const songs = rawItems
          .map((it: any) => ({
            id: it.id as string,
            title: (it.title as string) || "",
            artist: (it.channelTitle as string) || "",
            position: typeof it.position === "number" ? it.position : 0,
          }))
          .filter((s: { id: string; title: string }) => s.id && s.title);
        setPlaylistSongs(songs);
      } catch {
        // ignore errors, just don't show list
      } finally {
        setLoadingPlaylistSongs(false);
      }
    };

    void loadPlaylistSongs();
  }, [playlistUrl]);

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
    console.log('getEmbedUrl input:', url);
    
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
  // not currently within the previous service's live window AND
  // the stream is not actually live (unless manually overridden).
  const showCountdown =
    millisecondsUntilStream > 0 && 
    now >= previousLivestreamEnd && 
    !isStreamPlaying && 
    !isActuallyLive && 
    !manualLiveOverride;

  // Show "Starting Soon" when countdown is done but stream isn't live yet
  const showStartingSoon =
    millisecondsUntilStream <= 0 && 
    now >= previousLivestreamEnd && 
    !isStreamPlaying && 
    !isActuallyLive && 
    !manualLiveOverride &&
    livestreamUrl; // Only show if there's a livestream URL

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

  // YouTube API and livestream detection
  useEffect(() => {
    if (!livestreamUrl) {
      console.log('No livestream URL provided');
      return;
    }

    console.log('Initializing YouTube livestream detection for:', livestreamUrl);

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      console.log('Loading YouTube IFrame API...');
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      console.log('YouTube API already loaded');
    }

    // Set up API ready callback
    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube IFrame API ready');
      youtubeAPIReady = true;
      initializeLivestreamDetection();
    };

    // If API already ready, initialize immediately
    if (window.YT && window.YT.Player) {
      console.log('YouTube API already available, initializing immediately');
      youtubeAPIReady = true;
      initializeLivestreamDetection();
    }

    function initializeLivestreamDetection() {
      if (!livestreamUrl || youtubePlayerRef.current) {
        console.log('Livestream detection already initialized or no URL');
        return;
      }

      console.log('Initializing livestream detection...');

      // Extract video ID from URL
      let videoId = '';
      let isChannelLive = false;
      try {
        const url = new URL(livestreamUrl);
        console.log('Parsing URL:', url);
        
        if (url.pathname.includes('/embed/live_stream') && url.searchParams.get('channel')) {
          // This is a live channel embed URL
          videoId = url.searchParams.get('channel') || '';
          isChannelLive = true;
        } else if (url.hostname.includes('youtu.be')) {
          videoId = url.pathname.replace('/', '');
        } else if (url.searchParams.get('v')) {
          videoId = url.searchParams.get('v') || '';
        } else if (url.pathname.includes('/embed/')) {
          videoId = url.pathname.split('/embed/')[1]?.split('?')[0] || '';
        }
        
        console.log('Extracted video ID/channel:', videoId, 'Is channel live:', isChannelLive);
      } catch (error) {
        console.error('Error extracting video ID:', error);
        return;
      }

      if (!videoId) {
        console.error('No video ID/channel found in URL');
        return;
      }

      // Create YouTube player for detection
      console.log('Creating YouTube player for:', isChannelLive ? 'channel' : 'video ID', videoId);
      
      if (isChannelLive) {
        // For channel live streams, we can't use the YouTube API with channel IDs
        // We'll check if the iframe can load the content properly
        console.log('Channel live stream detected, checking if actually live');
        
        // Start with assuming not live, then check iframe accessibility
        setIsActuallyLive(false);
        
        // Set up periodic checks to verify the stream is accessible
        liveCheckInterval = setInterval(() => {
          const iframe = document.querySelector('#cne-livestream-player') as HTMLIFrameElement;
          if (iframe) {
            try {
              // Check if iframe loaded successfully by trying to access its contentWindow
              // This will fail due to cross-origin, but the fact that the iframe exists
              // and we can reference it means the URL is valid
              console.log('Channel live stream iframe exists, checking if live...');
              
              // For channel streams, we'll use a simple heuristic:
              // If the iframe loads without immediate errors, assume it might be live
              // We can't reliably detect live status for channel streams without API access
              // So we'll default to showing countdown unless manually overridden
              setIsActuallyLive(false); // Default to not live for channel streams
            } catch (error) {
              console.log('Channel live stream iframe check failed, assuming not live');
              setIsActuallyLive(false);
            }
          }
        }, 30000); // Check every 30 seconds
      } else {
        // Regular video ID
        youtubePlayerRef.current = new window.YT.Player('youtube-livestream-detector', {
          videoId: videoId,
          events: {
            onReady: (event: any) => {
              console.log('YouTube player ready for livestream detection');
              // Start checking if stream is live
              checkLivestreamStatus();
              liveCheckInterval = setInterval(checkLivestreamStatus, 10000); // Check every 10 seconds for testing
            },
            onError: (error: any) => {
              console.error('YouTube player error:', error);
              setIsActuallyLive(false);
            },
            onStateChange: (event: any) => {
              console.log('YouTube player state changed:', event.data);
              // Check status when state changes
              setTimeout(checkLivestreamStatus, 1000);
            }
          }
        });
      }
    }

    function checkLivestreamStatus() {
      // Skip API-based checks for channel streams (they're handled differently)
      const url = new URL(livestreamUrl);
      if (url.pathname.includes('/embed/live_stream')) {
        console.log('Skipping API-based check for channel stream');
        return;
      }
      
      if (!youtubePlayerRef.current) {
        console.log('YouTube player not ready for livestream check');
        return;
      }

      try {
        const player = youtubePlayerRef.current;
        const playerState = player.getPlayerState();
        const playerInfo = player.getVideoData();
        const videoData = player.getVideoData?.();
        
        console.log('Livestream check:', {
          playerState,
          playerInfo,
          videoData,
          isLive: playerInfo?.isLive,
          duration: player.getDuration?.(),
          currentTime: player.getCurrentTime?.()
        });
        
        // Multiple methods to detect if stream is live
        let isLive = false;
        
        // Method 1: YouTube's isLive property (often unreliable)
        if (playerInfo?.isLive === true) {
          isLive = true;
        }
        
        // Method 2: Check if duration is infinite or very long (livestreams have no fixed duration)
        const duration = player.getDuration?.();
        if (duration === 0 || isNaN(duration) || duration > 7200) { // 2+ hours or 0 indicates livestream
          isLive = true;
        }
        
        // Method 3: Check player state (BUFFERING state often indicates live stream)
        const YT = window.YT;
        if (YT && YT.PlayerState && playerState === YT.PlayerState.BUFFERING) {
          isLive = true;
        }
        
        // Method 4: Check if video title contains "LIVE" or "live"
        if (playerInfo && playerInfo.title && 
            (playerInfo.title.toLowerCase().includes('live') || 
             playerInfo.title.toLowerCase().includes('en vivo'))) {
          isLive = true;
        }
        
        // Method 5: Check if video has ended but keeps trying to play (live behavior)
        if (playerState === YT?.PlayerState.ENDED && duration === 0) {
          isLive = true;
        }
        
        console.log('Setting isActuallyLive to:', isLive, '(detection methods used)');
        setIsActuallyLive(isLive);
      } catch (error) {
        console.error('Error checking livestream status:', error);
        // If we can't get video data, assume not live
        setIsActuallyLive(false);
      }
    }

    return () => {
      if (liveCheckInterval) {
        clearInterval(liveCheckInterval);
        liveCheckInterval = null;
      }
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
        youtubePlayerRef.current = null;
      }
    };
  }, [livestreamUrl]);

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
              {/* Debug button for testing livestream detection */}
              <Button
                variant="outline"
                className="border-yellow-600 bg-yellow-900/20 text-yellow-400 hover:bg-yellow-900/30"
                onClick={() => {
                  setManualLiveOverride(!manualLiveOverride);
                  console.log('Manual live override:', !manualLiveOverride);
                }}
              >
                {manualLiveOverride ? '🔴 Live (Manual)' : '⚫ Test Live'}
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
              {showStartingSoon && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-neutral-950/90 px-6 text-center">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-400">
                        {t("Starting Soon", "Comenzando Pronto")}
                      </p>
                      <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
                    </div>
                    <p className="text-xl font-semibold text-white sm:text-2xl">
                      {t("The stream will begin any moment", "La transmisión comenzará en cualquier momento")}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-red-400"></div>
                      <p className="text-sm text-neutral-300">
                        {t("Please wait while we connect", "Por favor espera mientras nos conectamos")}
                      </p>
                      <div className="h-2 w-2 animate-pulse rounded-full bg-red-400"></div>
                    </div>
                    <p className="text-xs text-neutral-500">
                      {t(
                        "The service is scheduled to start now. Stay on this page!",
                        "El servicio está programado para comenzar ahora. ¡Permanece en esta página!"
                      )}
                    </p>
                  </div>
                </div>
              )}
              <iframe
                id="cne-livestream-player"
                src={getEmbedUrl(livestreamUrl)}
                title={t("CNE Live Stream", "Transmisión en Vivo de CNE")}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => {
                  console.log('Livestream iframe loaded with src:', getEmbedUrl(livestreamUrl));
                }}
                onError={() => {
                  console.error('Livestream iframe failed to load with src:', getEmbedUrl(livestreamUrl));
                }}
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
          <div className="mt-3">
            <Button
              type="button"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => playPlaylistFromIndex(0)}
            >
              <Play className="mr-2 h-4 w-4" />
              {t("Play YouTube Worship Playlist", "Reproducir lista de adoración en YouTube")}
            </Button>
          </div>
          <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-xs text-neutral-200">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-neutral-500">
              {t("Songs in this playlist", "Canciones en esta lista")}
            </p>
            {loadingPlaylistSongs && (
              <p className="mt-2 text-[0.75rem] text-neutral-500">
                {t("Loading songs...", "Cargando canciones...")}
              </p>
            )}
            {!loadingPlaylistSongs && playlistSongs.length === 0 && (
              <p className="mt-2 text-[0.75rem] text-neutral-500">
                {t("No songs found for this playlist.", "No se encontraron canciones para esta lista.")}
              </p>
            )}
            {!loadingPlaylistSongs && playlistSongs.length > 0 && (
              <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto">
                {playlistSongs
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map((song) => {
                    const artist = song.artist?.trim() ?? "";
                    const title = song.title?.trim() ?? "";
                    const showArtist =
                      artist.length > 0 &&
                      artist.toLowerCase() !== title.toLowerCase() &&
                      !title.toLowerCase().includes(artist.toLowerCase());

                    return (
                      <li key={song.id}>
                        <button
                          type="button"
                          onClick={() => playPlaylistFromIndex(song.position)}
                          className="flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left hover:bg-neutral-800/80"
                        >
                          <span className="truncate text-[0.8rem] font-medium text-white">
                            {title}
                          </span>
                          {showArtist && (
                            <span className="mt-0.5 truncate text-[0.7rem] text-neutral-400">
                              {artist}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
