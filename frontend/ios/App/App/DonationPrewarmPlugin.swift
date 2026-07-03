import Foundation
import Capacitor
import SafariServices

/// Prewarms the network connection to the donation URL (Tithe.ly) so that
/// when `@capacitor/inappbrowser` actually presents `SFSafariViewController`,
/// the DNS lookup / TCP / TLS handshake are already done and the page loads
/// noticeably faster instead of starting cold.
///
/// This plugin never renders any content itself — it only opens a network
/// connection ahead of time — so it has no bearing on Apple Guideline
/// 3.2.2(iv), which governs how the donation *page* is presented (that's
/// handled entirely by `openDonationSheet()` in `lib/donations.ts`).
@objc(DonationPrewarmPlugin)
public class DonationPrewarmPlugin: CAPPlugin {
    // Untyped because SFSafariViewController.PrewarmingToken only exists on
    // iOS 15+, and this plugin still needs to compile/run against the app's
    // iOS 14 deployment target (see Podfile).
    private var prewarmingToken: AnyObject?

    @objc func prewarm(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"), let url = URL(string: urlString) else {
            call.reject("A valid url is required")
            return
        }

        if #available(iOS 15.0, *) {
            (prewarmingToken as? SFSafariViewController.PrewarmingToken)?.invalidate()
            prewarmingToken = SFSafariViewController.prewarmConnections(to: [url])
        }

        call.resolve()
    }

    @objc func invalidate(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            (prewarmingToken as? SFSafariViewController.PrewarmingToken)?.invalidate()
        }
        prewarmingToken = nil
        call.resolve()
    }
}
