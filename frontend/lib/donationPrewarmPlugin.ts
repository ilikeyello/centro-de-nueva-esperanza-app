import { registerPlugin } from "@capacitor/core";

/**
 * JS bridge for the custom native `DonationPrewarmPlugin` (see
 * `ios/App/App/DonationPrewarmPlugin.swift` and
 * `android/app/src/main/java/.../DonationPrewarmPlugin.java`).
 *
 * It pre-opens a network connection to the donation URL ahead of time
 * (SFSafariViewController.prewarmConnections on iOS,
 * CustomTabsSession.mayLaunchUrl on Android) so the sheet opened by
 * `openDonationSheet()` in `lib/donations.ts` loads faster instead of
 * starting the connection cold. It never renders any content itself.
 */
export interface DonationPrewarmPlugin {
  prewarm(options: { url: string }): Promise<void>;
  invalidate(): Promise<void>;
}

const DonationPrewarm = registerPlugin<DonationPrewarmPlugin>("DonationPrewarm");

export default DonationPrewarm;
