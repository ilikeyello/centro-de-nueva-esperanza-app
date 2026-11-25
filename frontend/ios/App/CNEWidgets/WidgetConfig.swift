import AppIntents
import SwiftUI
import UIKit
import WidgetKit

// MARK: - Settings

enum CNEConfig {
    /// Supabase settings come from the generated, git-ignored WidgetSecrets.swift
    /// (run `node scripts/build-widget-data.mjs` in /frontend to create it).
    static let supabaseURL = WidgetSecrets.supabaseURL
    static let supabaseAnonKey = WidgetSecrets.supabaseAnonKey
    static let churchOrgId = WidgetSecrets.churchOrgId

    /// Custom URL scheme the app registers in App/Info.plist. Widget taps open
    /// `cneapp://open/<page>` and the web app routes them (AppInner.tsx).
    static let urlScheme = "cneapp"

    /// When the dashboard has no start time on the livestream, count down to
    /// the regular service instead: Sunday 3:00 PM Mountain time.
    static let churchTimeZone = TimeZone(identifier: "America/Denver") ?? .current
    static let regularServiceWeekday = 1 // Calendar weekday: 1 = Sunday
    static let regularServiceHour = 15
    static let regularServiceMinute = 0

    /// After the start time passes without the stream going live, keep saying
    /// "starting soon" for this long before moving on to next week.
    static let startingSoonWindow: TimeInterval = 60 * 60

    static func link(_ page: String, id: Int? = nil) -> URL {
        var components = URLComponents()
        components.scheme = urlScheme
        components.host = "open"
        components.path = "/" + page
        if let id { components.queryItems = [URLQueryItem(name: "id", value: String(id))] }
        return components.url ?? URL(string: "\(urlScheme)://open/home")!
    }
}

// MARK: - Language setting ("Edit Widget" on the home screen)

enum WidgetLanguage: String, AppEnum {
    case es
    case en

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Idioma / Language"
    static var caseDisplayRepresentations: [WidgetLanguage: DisplayRepresentation] = [
        .es: "Español",
        .en: "English",
    ]

    var locale: Locale { Locale(identifier: self == .es ? "es_MX" : "en_US") }

    /// Bible version used for the verse text. Matches the app's defaults.
    var bibleVersion: String { self == .es ? "spnbes" : "kjv" }

    /// Pick the right half of a bilingual pair.
    func t(_ en: String, _ es: String) -> String { self == .es ? es : en }
}

struct LanguageIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Idioma / Language"
    static var description = IntentDescription("Elige el idioma del widget. / Choose the widget language.")

    @Parameter(title: "Idioma / Language", default: .es)
    var language: WidgetLanguage

    init() {}
    init(language: WidgetLanguage) { self.language = language }
}

// MARK: - Colors (same palette as index.css)

extension Color {
    static let cneBackground = Color(light: 0xFAF9F6, dark: 0x1C1813)
    static let cneSand = Color(light: 0xF3E6D2, dark: 0x2E271F)
    static let cneAccent = Color(light: 0xA35A2C, dark: 0xE6C08F)
    static let cneTerra = Color(light: 0x993C1D, dark: 0xE08A5E)
    static let cneInk = Color(light: 0x1C1C1A, dark: 0xF3EBDD)
    static let cneInkMid = Color(light: 0x5F5E5A, dark: 0xBDB09C)
    static let cneLive = Color(red: 0.86, green: 0.15, blue: 0.15)

    init(light: UInt32, dark: UInt32) {
        self.init(UIColor { traits in
            UIColor(hex: traits.userInterfaceStyle == .dark ? dark : light)
        })
    }
}

extension UIColor {
    convenience init(hex: UInt32) {
        self.init(
            red: CGFloat((hex >> 16) & 0xFF) / 255,
            green: CGFloat((hex >> 8) & 0xFF) / 255,
            blue: CGFloat(hex & 0xFF) / 255,
            alpha: 1
        )
    }
}
