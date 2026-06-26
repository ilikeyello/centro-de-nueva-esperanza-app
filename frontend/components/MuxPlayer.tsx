import { useEffect, useRef } from "react";
import { muxPoster } from "../lib/mux";

/**
 * Thin React wrapper around the <mux-player> web component (loaded via CDN in
 * index.html). Used for video devotionals and the livestream. The element
 * handles HLS playback natively on iOS/Safari and via hls.js everywhere else,
 * so it works inside the Capacitor WKWebView and on Android.
 */

// The custom element is registered globally by the CDN script. We render it
// through a string tag so we don't need the (uninstalled) React wrapper package.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MuxPlayerEl = "mux-player" as any;

interface MuxPlayerProps {
  playbackId: string;
  streamType?: "on-demand" | "live";
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
}

export function MuxPlayer({
  playbackId,
  streamType = "on-demand",
  title,
  poster,
  autoPlay = false,
  muted = false,
  className,
  style,
  onEnded,
  onPlay,
  onPause,
}: MuxPlayerProps) {
  const ref = useRef<HTMLElement | null>(null);

  // Custom-element media events aren't React synthetic events, so bind directly.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleEnded = () => onEnded?.();
    const handlePlay = () => onPlay?.();
    const handlePause = () => onPause?.();
    el.addEventListener("ended", handleEnded);
    el.addEventListener("play", handlePlay);
    el.addEventListener("pause", handlePause);
    return () => {
      el.removeEventListener("ended", handleEnded);
      el.removeEventListener("play", handlePlay);
      el.removeEventListener("pause", handlePause);
    };
  }, [onEnded, onPlay, onPause]);

  const resolvedPoster =
    poster ?? (streamType === "on-demand" ? muxPoster(playbackId, { width: 640 }) : undefined);

  return (
    <MuxPlayerEl
      ref={ref}
      playback-id={playbackId}
      stream-type={streamType}
      metadata-video-title={title}
      poster={resolvedPoster}
      autoplay={autoPlay ? "" : undefined}
      muted={muted ? "" : undefined}
      accent-color="#3B6D11"
      playsinline=""
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    />
  );
}
