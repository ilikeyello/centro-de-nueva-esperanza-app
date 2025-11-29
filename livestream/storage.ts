// Simple in-memory storage to avoid database permission issues
let livestreamUrl: string | null = null;

export function getLivestreamUrl(): string | null {
  return livestreamUrl;
}

export function setLivestreamUrl(url: string | null): void {
  livestreamUrl = url;
}
