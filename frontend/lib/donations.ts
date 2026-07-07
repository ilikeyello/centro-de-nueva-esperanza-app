import { Capacitor } from "@capacitor/core";
import DonationPrewarm from "./donationPrewarmPlugin";
import { openSheetBrowser } from "./systemBrowser";
import type { ChurchAdditionalInfo } from "./mainSiteData";

/**
 * Resolve the URL donors should be sent to for giving.
 *
 * Apple Guideline 3.2.2(iv): donation flows may not be rendered inside an
 * embedded/native-looking view (e.g. an in-app iframe). This URL must only
 * ever be handed to `openDonationSheet()` below (never rendered in an
 * iframe/WebView) so it always opens via SFSafariViewController on iOS.
 */
export function getDonationUrl(
  churchInfo: Pick<ChurchAdditionalInfo, "tithely_url" | "tithely_embed"> | null | undefined
): string | null {
  if (!churchInfo) return null;
  if (churchInfo.tithely_url) return churchInfo.tithely_url;

  if (churchInfo.tithely_embed) {
    const formIdMatch = churchInfo.tithely_embed.match(/data-form=["']([^"']+)["']/);
    if (formIdMatch?.[1]) {
      return `https://give.tithe.ly/?formId=${formIdMatch[1]}`;
    }
  }

  return null;
}

/**
 * Present the Tithe.ly donation page as a partial-height sheet that slides
 * up from the bottom, backed by SFSafariViewController on iOS (Chrome
 * Custom Tabs on Android) — never an embedded WebView. This keeps the
 * donation flow compliant with Apple Guideline 3.2.2(iv) while avoiding a
 * full-screen takeover.
 */
export async function openDonationSheet(url: string): Promise<void> {
  await openSheetBrowser(url);
}

let prewarmedUrl: string | null = null;

/**
 * Best-effort: pre-opens the network connection to `url` so the sheet
 * opened by `openDonationSheet()` loads faster instead of connecting cold.
 * Safe to call speculatively (e.g. as soon as the donation URL is known) —
 * it never throws and is a no-op on web or if it's already prewarmed the
 * same URL.
 */
export async function prewarmDonation(url: string): Promise<void> {
  if (!Capacitor.isNativePlatform() || prewarmedUrl === url) return;
  prewarmedUrl = url;
  try {
    await DonationPrewarm.prewarm({ url });
  } catch {
    // Prewarming is an optimization, never a requirement — ignore failures
    // (e.g. plugin not yet synced into the native project).
  }
}

/**
 * Tears down a prewarmed connection/session. Safe to call even if nothing
 * was prewarmed, or on web.
 */
export async function invalidateDonationPrewarm(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  prewarmedUrl = null;
  try {
    await DonationPrewarm.invalidate();
  } catch {
    // no-op
  }
}
