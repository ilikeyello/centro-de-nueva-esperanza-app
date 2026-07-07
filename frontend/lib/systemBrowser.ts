import { AndroidViewStyle, DefaultSystemBrowserOptions, InAppBrowser, iOSViewStyle } from "@capacitor/inappbrowser";

/**
 * Present a URL as a partial-height sheet that slides up from the bottom,
 * backed by SFSafariViewController on iOS (Chrome Custom Tabs on Android) —
 * never an embedded WebView. Shared by any flow (donations, the web admin
 * dashboard, etc.) that needs to hand the user off to an external site
 * without a full-screen takeover.
 */
export async function openSheetBrowser(url: string): Promise<void> {
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
