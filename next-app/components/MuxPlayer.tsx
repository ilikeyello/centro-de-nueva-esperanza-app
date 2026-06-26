"use client";

import { useEffect, useRef } from "react";
import { muxPoster } from "@/lib/mux";

// <mux-player> web component is registered globally via the CDN script in layout.tsx.
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
      accent-color="#dc2626"
      playsinline=""
      className={className}
      style={{ width: "100%", height: "100%", ...style }}
    />
  );
}
