import UIKit
import UserNotifications
import Capacitor
import SafariServices

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    // Paint the window (behind everything, including status bar) with the app's
    // cream background so it never shows black while the app is active.
    func applicationDidBecomeActive(_ application: UIApplication) {
        let bg = UIColor(red: 250/255, green: 249/255, blue: 246/255, alpha: 1.0)
        window?.backgroundColor = bg

        // Clear the app icon badge and any delivered notifications now that
        // the user has opened the app
        application.applicationIconBadgeNumber = 0
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
    }

    func applicationWillResignActive(_ application: UIApplication) {}
    func applicationDidEnterBackground(_ application: UIApplication) {}
    func applicationWillEnterForeground(_ application: UIApplication) {}
    func applicationWillTerminate(_ application: UIApplication) {}

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

    // REQUIRED: relay APNs device token to Capacitor's push notification plugin
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    // REQUIRED: relay APNs registration failure to Capacitor's push notification plugin
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
}

// Custom bridge view controller — in AppDelegate.swift so Xcode includes it
// without needing to manually add a separate file to the project.
// @objc(MainViewController) keeps the class visible to the storyboard in
// Release builds (otherwise dead-code stripping removes it → white screen).
@objc(MainViewController)
class MainViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        let bg = UIColor(red: 250/255, green: 249/255, blue: 246/255, alpha: 1.0)

        // Prevent black from showing behind the status bar and home indicator
        view.backgroundColor = bg

        // Make WebView itself transparent so the cream view shows through
        webView?.isOpaque = false
        webView?.backgroundColor = .clear

        // Give the scroll view a solid cream background so rubber-band overscroll
        // at the top and bottom reveals cream instead of black
        webView?.scrollView.backgroundColor = bg

    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // Also set the window background — available here after view is in hierarchy
        let bg = UIColor(red: 250/255, green: 249/255, blue: 246/255, alpha: 1.0)
        view.window?.backgroundColor = bg
    }

    override func capacitorDidLoad() {
        // Safari-like User-Agent so YouTube allows iframe embeds (fixes error 150)
        webView?.customUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Mobile/15E148 Safari/604.1"

        // Disable rubber-band overscroll here — capacitorDidLoad is after the
        // WebView is fully configured so this won't get reset by Capacitor
        webView?.scrollView.bounces = false
        webView?.scrollView.alwaysBounceVertical = false
        webView?.scrollView.alwaysBounceHorizontal = false

        bridge?.registerPluginInstance(DonationPrewarmPlugin())
    }
}

// Pure-Swift Capacitor plugin that prewarmsthe SFSafariViewController connection
// to the donation URL so it loads instantly when the user taps "Give".
// Registered directly in capacitorDidLoad — no ObjC .m bridge file needed.
@objc(DonationPrewarmPlugin)
public class DonationPrewarmPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "DonationPrewarmPlugin"
    public let jsName = "DonationPrewarm"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "prewarm", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "invalidate", returnType: CAPPluginReturnPromise),
    ]

    private var prewarmToken: AnyObject?

    @objc func prewarm(_ call: CAPPluginCall) {
        guard let urlString = call.getString("url"), let url = URL(string: urlString) else {
            call.reject("A valid url is required")
            return
        }
        if #available(iOS 15.0, *) {
            (prewarmToken as? SFSafariViewController.PrewarmingToken)?.invalidate()
            prewarmToken = SFSafariViewController.prewarmConnections(to: [url])
        }
        call.resolve()
    }

    @objc func invalidate(_ call: CAPPluginCall) {
        if #available(iOS 15.0, *) {
            (prewarmToken as? SFSafariViewController.PrewarmingToken)?.invalidate()
        }
        prewarmToken = nil
        call.resolve()
    }
}
