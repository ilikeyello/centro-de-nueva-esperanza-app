import { api } from "encore.dev/api";
import { getLivestreamUrl } from "./storage";

interface GetLivestreamResponse {
  url: string | null;
}

export const get = api<void, GetLivestreamResponse>(
  { expose: true, method: "GET", path: "/livestream" },
  async () => {
    return { url: getLivestreamUrl() };
  }
);
