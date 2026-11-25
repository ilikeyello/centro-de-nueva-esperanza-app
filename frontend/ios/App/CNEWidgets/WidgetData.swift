import SwiftUI
import UIKit
import WidgetKit

// MARK: - What the widgets show

struct VerseInfo {
    let text: String
    let reference: String
}

struct LivestreamInfo {
    let id: Int?
    let title: String
    let start: Date
    let isLive: Bool
}

struct SermonInfo {
    let id: Int
    let title: String
    let date: Date?
    let thumbnail: UIImage?
}

struct EventInfo {
    let id: Int
    let title: String
    let date: Date
    let location: String?
}

struct CNEEntry: TimelineEntry {
    /// The moment this entry is shown. Views treat it as "now".
    let date: Date
    let language: WidgetLanguage
    let verse: VerseInfo?
    let livestream: LivestreamInfo?
    let sermon: SermonInfo?
    let event: EventInfo?

    func at(_ newDate: Date) -> CNEEntry {
        CNEEntry(date: newDate, language: language, verse: verse, livestream: livestream, sermon: sermon, event: event)
    }

    /// Sample content for the widget gallery placeholder.
    static func sample(_ language: WidgetLanguage) -> CNEEntry {
        let now = Date()
        return CNEEntry(
            date: now,
            language: language,
            verse: VerseInfo(
                text: language.t(
                    "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
                    "Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna."
                ),
                reference: language.t("John 3:16", "Juan 3:16")
            ),
            livestream: LivestreamInfo(
                id: nil,
                title: language.t("Sunday Service", "Servicio Dominical"),
                start: CNEDataLoader.nextRegularService(after: now),
                isLive: false
            ),
            sermon: SermonInfo(id: 0, title: language.t("Latest sermon", "Último sermón"), date: now, thumbnail: nil),
            event: EventInfo(id: 0, title: language.t("Worship Night", "Noche de Adoración"), date: now.addingTimeInterval(4 * 86_400), location: nil)
        )
    }
}

// MARK: - Timeline

struct CNEProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> CNEEntry {
        .sample(.es)
    }

    func snapshot(for configuration: LanguageIntent, in context: Context) async -> CNEEntry {
        await CNEDataLoader.load(language: configuration.language)
    }

    func timeline(for configuration: LanguageIntent, in context: Context) async -> Timeline<CNEEntry> {
        let now = Date()
        let entry = await CNEDataLoader.load(language: configuration.language, now: now)
        var entries = [entry]

        // Same data, but switch the countdown's look at the right moments:
        // a ticking clock from 24h out, then "starting soon" at the start time.
        var refresh = now.addingTimeInterval(30 * 60)
        if let stream = entry.livestream {
            if stream.isLive {
                refresh = now.addingTimeInterval(15 * 60)
            } else {
                let dayBefore = stream.start.addingTimeInterval(-86_400)
                if dayBefore > now { entries.append(entry.at(dayBefore)) }
                if stream.start > now { entries.append(entry.at(stream.start)) }
                // Check more often close to the service so "EN VIVO" shows up quickly.
                if stream.start.timeIntervalSince(now) < 2 * 3600 {
                    refresh = now.addingTimeInterval(10 * 60)
                }
            }
        }

        // The verse changes at midnight.
        let midnight = Calendar.current.startOfDay(for: now).addingTimeInterval(86_400 + 60)
        refresh = min(refresh, midnight)

        return Timeline(entries: entries, policy: .after(refresh))
    }
}

// MARK: - Loading

enum CNEDataLoader {
    static func load(language: WidgetLanguage, now: Date = Date()) async -> CNEEntry {
        async let verse = loadVerse(language: language, now: now)
        async let livestream = loadLivestream(language: language, now: now)
        async let sermon = loadSermon()
        async let event = loadNextEvent(language: language, now: now)
        return await CNEEntry(
            date: now,
            language: language,
            verse: verse,
            livestream: livestream,
            sermon: sermon,
            event: event
        )
    }

    // MARK: Livestream

    private struct LivestreamRow: Decodable {
        let id: Int
        let title: String?
        let is_live: Bool?
        let scheduled_start: String?
    }

    static func loadLivestream(language: WidgetLanguage, now: Date) async -> LivestreamInfo {
        let rows: [LivestreamRow] = (try? await SupabaseREST.get("livestreams", [
            ("select", "id,title,is_live,scheduled_start"),
            ("organization_id", "eq.\(CNEConfig.churchOrgId)"),
            ("mux_playback_id", "not.is.null"),
            ("order", "updated_at.desc"),
            ("limit", "1"),
        ])) ?? []
        let row = rows.first
        let title = row?.title?.trimmedNonEmpty ?? language.t("Sunday Service", "Servicio Dominical")

        if row?.is_live == true {
            return LivestreamInfo(id: row?.id, title: title, start: now, isLive: true)
        }

        // Use the time set on the dashboard while it's still upcoming (or only
        // just passed); otherwise fall back to the regular Sunday service.
        if let start = parseTimestamp(row?.scheduled_start),
           start > now.addingTimeInterval(-CNEConfig.startingSoonWindow) {
            return LivestreamInfo(id: row?.id, title: title, start: start, isLive: false)
        }
        return LivestreamInfo(id: row?.id, title: title, start: nextRegularService(after: now), isLive: false)
    }

    static func nextRegularService(after now: Date) -> Date {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = CNEConfig.churchTimeZone
        let match = DateComponents(
            hour: CNEConfig.regularServiceHour,
            minute: CNEConfig.regularServiceMinute,
            weekday: CNEConfig.regularServiceWeekday
        )
        return calendar.nextDate(
            after: now.addingTimeInterval(-CNEConfig.startingSoonWindow),
            matching: match,
            matchingPolicy: .nextTime
        ) ?? now.addingTimeInterval(7 * 86_400)
    }

    // MARK: Sermon

    private struct SermonRow: Decodable {
        let id: Int
        let title: String?
        let mux_playback_id: String?
        let sermon_date: String?
        let created_at: String?
    }

    /// Same filter and order as listSermons() in supabase-client.ts.
    static func loadSermon() async -> SermonInfo? {
        let rows: [SermonRow] = (try? await SupabaseREST.get("sermons", [
            ("select", "id,title,mux_playback_id,sermon_date,created_at"),
            ("organization_id", "eq.\(CNEConfig.churchOrgId)"),
            ("mux_status", "eq.ready"),
            ("mux_playback_id", "not.is.null"),
            ("published", "not.is.false"),
            ("order", "sermon_date.desc.nullslast,created_at.desc"),
            ("limit", "1"),
        ])) ?? []
        guard let row = rows.first, let title = row.title?.trimmedNonEmpty else { return nil }

        var thumbnail: UIImage?
        if let playbackId = row.mux_playback_id,
           let url = URL(string: "https://image.mux.com/\(playbackId)/thumbnail.jpg?width=320&height=180&fit_mode=smartcrop"),
           let download = try? await URLSession.shared.data(from: url) {
            thumbnail = UIImage(data: download.0)
        }

        let date = parseDay(row.sermon_date) ?? parseTimestamp(row.created_at)
        return SermonInfo(id: row.id, title: title, date: date, thumbnail: thumbnail)
    }

    // MARK: Next event

    private struct EventRow: Decodable {
        let id: Int
        let title: String?
        let title_en: String?
        let title_es: String?
        let event_date: String?
        let location: String?
    }

    static func loadNextEvent(language: WidgetLanguage, now: Date) async -> EventInfo? {
        // Keep showing an event until an hour after it starts.
        let from = isoFormatter.string(from: now.addingTimeInterval(-3600))
        let rows: [EventRow] = (try? await SupabaseREST.get("events", [
            ("select", "id,title,title_en,title_es,event_date,location"),
            ("organization_id", "eq.\(CNEConfig.churchOrgId)"),
            ("event_date", "gte.\(from)"),
            ("order", "event_date.asc"),
            ("limit", "1"),
        ])) ?? []
        guard let row = rows.first, let date = parseTimestamp(row.event_date) else { return nil }
        let localized = language == .es ? row.title_es : row.title_en
        guard let title = localized?.trimmedNonEmpty ?? row.title?.trimmedNonEmpty
            ?? row.title_es?.trimmedNonEmpty ?? row.title_en?.trimmedNonEmpty else { return nil }
        return EventInfo(id: row.id, title: title, date: date, location: row.location?.trimmedNonEmpty)
    }

    // MARK: Verse of the day

    private struct OverrideRow: Decodable {
        let book: String?
        let chapter: Int?
        let verse: Int?
        let end_verse: Int?
    }

    /// Same rules as lib/verseOfTheDay.ts: an admin-picked verse for today
    /// wins, otherwise the built-in list by day of the year.
    static func loadVerse(language: WidgetLanguage, now: Date) async -> VerseInfo? {
        let version = language.bibleVersion
        let today = dayKey(now)

        let overrides: [OverrideRow] = (try? await SupabaseREST.get("verses_of_the_day", [
            ("select", "book,chapter,verse,end_verse"),
            ("organization_id", "eq.\(CNEConfig.churchOrgId)"),
            ("verse_date", "eq.\(today)"),
            ("limit", "1"),
        ])) ?? []

        if let row = overrides.first, let book = row.book, let chapter = row.chapter, let verse = row.verse,
           let text = VerseStore.textFromAppBible(version: version, book: book, chapter: chapter, verse: verse, endVerse: row.end_verse) {
            return VerseInfo(text: text, reference: VerseStore.reference(book: book, chapter: chapter, verse: verse, endVerse: row.end_verse, language: language))
        }

        return VerseStore.builtIn(for: now, version: version, language: language)
    }

    // MARK: Date helpers

    static let isoFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime]
        return formatter
    }()

    private static let isoFractionalFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    /// Postgres timestamps, e.g. "2026-10-01T01:00:00+00:00" (with or without fractions).
    static func parseTimestamp(_ raw: String?) -> Date? {
        guard let raw else { return nil }
        return isoFormatter.date(from: raw) ?? isoFractionalFormatter.date(from: raw)
    }

    /// Plain dates ("2026-06-30") as local midnight, so they don't shift a day.
    static func parseDay(_ raw: String?) -> Date? {
        guard let raw else { return nil }
        let parts = raw.split(separator: "-").compactMap { Int($0) }
        guard parts.count == 3 else { return nil }
        return Calendar.current.date(from: DateComponents(year: parts[0], month: parts[1], day: parts[2]))
    }

    /// Local YYYY-MM-DD, same as todayKey() in the web app.
    static func dayKey(_ date: Date) -> String {
        let c = Calendar.current.dateComponents([.year, .month, .day], from: date)
        return String(format: "%04ld-%02ld-%02ld", c.year ?? 0, c.month ?? 0, c.day ?? 0)
    }
}

// MARK: - Supabase REST

enum SupabaseREST {
    static func get<T: Decodable>(_ table: String, _ query: [(String, String)]) async throws -> [T] {
        guard var components = URLComponents(string: "\(CNEConfig.supabaseURL)/rest/v1/\(table)") else {
            throw URLError(.badURL)
        }
        components.queryItems = query.map { URLQueryItem(name: $0.0, value: $0.1) }
        guard let url = components.url else { throw URLError(.badURL) }

        var request = URLRequest(url: url, timeoutInterval: 10)
        request.setValue(CNEConfig.supabaseAnonKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(CNEConfig.supabaseAnonKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }
        return try JSONDecoder().decode([T].self, from: data)
    }
}

// MARK: - Verses bundled with the widget

enum VerseStore {
    private struct BookName: Decodable {
        let en: String
        let es: String
    }

    private struct DailyVerse: Decodable {
        let book: String
        let chapter: Int
        let verse: Int
        let kjv: String
        let rv1909: String
        let spnbes: String

        func text(_ version: String) -> String {
            switch version {
            case "kjv": return kjv
            case "rv1909": return rv1909
            default: return spnbes
            }
        }
    }

    private struct VerseFile: Decodable {
        let books: [String: BookName]
        let verses: [DailyVerse]
    }

    /// WidgetVerses.json, built by scripts/build-widget-data.mjs.
    private static let file: VerseFile? = {
        guard let url = Bundle.main.url(forResource: "WidgetVerses", withExtension: "json"),
              let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(VerseFile.self, from: data)
    }()

    static func builtIn(for date: Date, version: String, language: WidgetLanguage) -> VerseInfo? {
        guard let verses = file?.verses, !verses.isEmpty else { return nil }
        // 0-based day of the year, same as dayOfYear() in lib/verseOfTheDay.ts.
        let day = (Calendar.current.ordinality(of: .day, in: .year, for: date) ?? 1) - 1
        let entry = verses[day % verses.count]
        return VerseInfo(
            text: entry.text(version),
            reference: reference(book: entry.book, chapter: entry.chapter, verse: entry.verse, endVerse: nil, language: language)
        )
    }

    static func reference(book: String, chapter: Int, verse: Int, endVerse: Int?, language: WidgetLanguage) -> String {
        let names = file?.books[book]
        let name = (language == .es ? names?.es : names?.en) ?? book
        let range = endVerse.map { "\(verse)-\($0)" } ?? "\(verse)"
        return "\(name) \(chapter):\(range)"
    }

    // An admin can pick any verse, so read the full Bible the app already ships
    // (App.app/public/bible). The widget sits at App.app/PlugIns/CNEWidgets.appex.
    private struct BibleBook: Decodable {
        struct Chapter: Decodable {
            let number: Int
            let verses: [Verse]
        }
        struct Verse: Decodable {
            let number: Int
            let text: String
        }
        let chapters: [Chapter]
    }

    static func textFromAppBible(version: String, book: String, chapter: Int, verse: Int, endVerse: Int?) -> String? {
        let appURL = Bundle.main.bundleURL.deletingLastPathComponent().deletingLastPathComponent()
        let url = appURL.appendingPathComponent("public/bible/\(version)/\(book).json")
        guard let data = try? Data(contentsOf: url),
              let bible = try? JSONDecoder().decode(BibleBook.self, from: data),
              let found = bible.chapters.first(where: { $0.number == chapter }) else { return nil }

        let last = max(endVerse ?? verse, verse)
        let parts = found.verses
            .filter { $0.number >= verse && $0.number <= last }
            .map { $0.text.trimmingCharacters(in: .whitespacesAndNewlines) }
        return parts.isEmpty ? nil : parts.joined(separator: " ")
    }
}

extension String {
    var trimmedNonEmpty: String? {
        let trimmed = trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}
