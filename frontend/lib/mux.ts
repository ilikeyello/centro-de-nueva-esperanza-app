/**
 * Mux helpers for the church app. Playback happens through the <mux-player>
 * web component (loaded via CDN in index.html), so we only need URL builders.
 */

/** HLS playback URL for a Mux playback id. */
export function muxStreamUrl(playbackId: string): string {
  return `https://stream.mux.com/${playbackId}.m3u8`;
}

/** Poster/thumbnail image for a Mux playback id (on-demand assets only). */
export function muxPoster(playbackId: string, opts?: { width?: number; time?: number }): string {
  const params = new URLSearchParams();
  if (opts?.width) params.set('width', String(opts.width));
  if (opts?.time != null) params.set('time', String(opts.time));
  const qs = params.toString();
  return `https://image.mux.com/${playbackId}/thumbnail.jpg${qs ? `?${qs}` : ''}`;
}
