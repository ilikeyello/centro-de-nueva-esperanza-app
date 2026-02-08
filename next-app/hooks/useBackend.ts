"use client";

import { churchApi } from "@/lib/churchApi";

export function useBackend() {
  return churchApi;
}

export type {
  Sermon,
  Event,
  Announcement,
  PrayerRequest,
  PrayerComment,
  BulletinPost,
  BulletinComment,
  ChurchInfo,
} from "@/lib/churchApi";
