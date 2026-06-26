/** Mux URL helpers for the web app. Playback uses the <mux-player> web component. */

export function muxStreamUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

export function muxPoster(playbackId: string, opts?: { width?: number; time?: number }): string {
  const params = new URLSearchParams();
  if (opts?.width) params.set("width", String(opts.width));
  if (opts?.time != null) params.set("time", String(opts.time));
  const qs = params.toString();
  return `https://image.mux.com/${playbackId}/thumbnail.jpg${qs ? `?${qs}` : ""}`;
}
