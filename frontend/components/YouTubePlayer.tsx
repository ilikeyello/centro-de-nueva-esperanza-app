import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  className?: string;
  title?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

/**
 * Renders a YouTube video using the IFrame API (not a plain <iframe>).
 * Works reliably in WKWebView (Capacitor iOS) where plain youtube-nocookie.com
 * iframes get blocked by the content process sandbox.
 */
export function YouTubePlayer({ videoId, className, title }: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!videoId) return;
    let cancelled = false;
    setIsReady(false);
    setHasError(false);

    const createPlayer = () => {
      if (cancelled || !containerRef.current) return;
      const w = window as any;
      if (!w.YT || !w.YT.Player) return;

      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }

      containerRef.current.innerHTML = '';
      const div = document.createElement('div');
      containerRef.current.appendChild(div);

      playerRef.current = new w.YT.Player(div, {
        // Use '100%' so the API creates the iframe with CSS-percentage dimensions
        // instead of the default fixed pixel values that overflow the container.
        height: '100%',
        width: '100%',
        videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
          playsinline: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          fs: 1,
        },
        events: {
          onReady: () => {
            if (!cancelled) {
              setIsReady(true);
              // Also force the iframe to fill its container via inline style
              const iframe = containerRef.current?.querySelector('iframe');
              if (iframe) {
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.position = 'absolute';
                iframe.style.inset = '0';
              }
            }
          },
          onError: () => {
            if (!cancelled) setHasError(true);
          },
        },
      });
    };

    const w = window as any;
    if (w.YT && w.YT.Player) {
      createPlayer();
    } else {
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        createPlayer();
      };
      if (!document.querySelector("script[src='https://www.youtube.com/iframe_api']")) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
    }

    return () => {
      cancelled = true;
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  }, [videoId]);

  return (
    <div className={`relative bg-black ${className ?? ''}`} style={{ position: 'relative' }}>
      {!isReady && !hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      )}
      {hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
          <p className="text-white/60 text-sm text-center px-4">
            {title ? `"${title}" is unavailable` : 'Video unavailable'}
          </p>
        </div>
      )}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
}

/** Extract a YouTube video ID from any common YouTube URL format. */
export function extractYouTubeVideoId(url: string): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.replace('/', '').split('?')[0];
    if (u.searchParams.get('v')) return u.searchParams.get('v')!;
    if (u.pathname.includes('/live/')) return u.pathname.split('/live/')[1]?.split('?')[0] ?? '';
    if (u.pathname.includes('/embed/')) {
      const id = u.pathname.split('/embed/')[1]?.split('/')[0]?.split('?')[0];
      if (id && id !== 'live_stream') return id;
    }
    if (u.pathname.includes('/shorts/')) return u.pathname.split('/shorts/')[1]?.split('?')[0] ?? '';
  } catch {}
  return '';
}
