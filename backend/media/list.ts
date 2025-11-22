import { api } from "encore.dev/api";
import { mediaStorage } from "./storage";

export interface MediaItem {
  name: string;
  size: number;
  url: string;
  etag: string;
}

interface ListMediaResponse {
  items: MediaItem[];
}

// Lists all media files in the gallery.
export const list = api<void, ListMediaResponse>(
  { expose: true, method: "GET", path: "/media" },
  async () => {
    const items: MediaItem[] = [];
    for await (const entry of mediaStorage.list({})) {
      items.push({
        name: entry.name,
        size: entry.size,
        url: mediaStorage.publicUrl(entry.name),
        etag: entry.etag,
      });
    }
    return { items: items.reverse() };
  }
);
