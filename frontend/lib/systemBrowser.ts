import { Capacitor } from "@capacitor/core";
import { AndroidViewStyle, DefaultSystemBrowserOptions, InAppBrowser, iOSViewStyle } from "@capacitor/inappbrowser";

/**
 * Present a URL as a partial-height sheet that slides up from the bottom,
 * backed by SFSafariViewController on iOS (Chrome Custom Tabs on Android) —
 * never an embedded WebView. Shared by any flow (donations, the web admin
 * dashboard, etc.) that needs to hand the user off to an external site
 * without a full-screen takeover.
 *
 * On the web build there is no SFSafariViewController/Custom Tabs — the
 * Capacitor InAppBrowser plugin has no web implementation, so calling it does
 * nothing (donations and the admin dashboard link appear broken). On web we
 * instead open the URL in a normal new browser tab. Native platforms keep the
 * system sheet so the flow stays compliant with Apple Guideline 3.2.2(iv).
 */
export async function openSheetBrowser(url: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  await InAppBrowser.openInSystemBrowser({
    url,
    options: {
      ...DefaultSystemBrowserOptions,
      iOS: {
        ...DefaultSystemBrowserOptions.iOS,
        viewStyle: iOSViewStyle.PAGE_SHEET,
      },
      android: {
        ...DefaultSystemBrowserOptions.android,
        viewStyle: AndroidViewStyle.BOTTOM_SHEET,
      },
    },
  });
}
