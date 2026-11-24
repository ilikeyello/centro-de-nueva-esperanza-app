import SwiftUI
import UIKit
import WidgetKit

// MARK: - 1. Verse of the Day (small, medium)

struct VerseWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: "CNEVerseWidget", intent: LanguageIntent.self, provider: CNEProvider()) { entry in
            FamilyRouter {
                VerseWidgetView(entry: entry)
            } lockScreen: {
                VerseLockScreenView(entry: entry)
            }
            .cneWidgetStyle(entry)
        }
        .configurationDisplayName("Versículo del Día")
        .description("El versículo de hoy. / Today's verse.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline])
    }
}

struct VerseWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CNEEntry

    var body: some View {
        let l = entry.language
        VStack(alignment: .leading, spacing: 6) {
            SectionLabel(icon: "book.closed.fill", text: l.t("Verse of the Day", "Versículo del Día"))
            if let verse = entry.verse {
                Text(verse.text)
                    .font(.system(size: family == .systemSmall ? 13 : 15, design: .serif))
                    .foregroundStyle(Color.cneInk)
                    .lineLimit(family == .systemSmall ? 6 : 5)
                    .minimumScaleFactor(0.75)
                Spacer(minLength: 0)
                Text(verse.reference)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.cneAccent)
            } else {
                EmptyMessage(icon: "book", text: l.t("Open the app to read today's verse.", "Abre la app para leer el versículo de hoy."))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .widgetURL(CNEConfig.link("verse"))
    }
}

// MARK: - 2. Next Event (small, medium)

struct NextEventWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: "CNENextEventWidget", intent: LanguageIntent.self, provider: CNEProvider()) { entry in
            FamilyRouter {
                NextEventWidgetView(entry: entry)
            } lockScreen: {
                EventLockScreenView(entry: entry)
            }
            .cneWidgetStyle(entry)
        }
        .configurationDisplayName("Próximo Evento")
        .description("El siguiente evento de la iglesia. / The church's next event.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryRectangular, .accessoryInline])
    }
}

struct NextEventWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CNEEntry

    var body: some View {
        let l = entry.language
        VStack(alignment: .leading, spacing: 8) {
            SectionLabel(icon: "calendar", text: l.t("Next Event", "Próximo Evento"))
            if let event = entry.event {
                if family == .systemSmall {
                    DateTile(date: event.date, language: l, size: 40)
                    Text(event.title)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color.cneInk)
                        .lineLimit(2)
                        .minimumScaleFactor(0.8)
                    Spacer(minLength: 0)
                    Text(Fmt.date(event.date, "EEEjmm", l))
                        .font(.caption)
                        .foregroundStyle(Color.cneInkMid)
                        .lineLimit(1)
                } else {
                    HStack(alignment: .top, spacing: 12) {
                        DateTile(date: event.date, language: l, size: 56)
                        VStack(alignment: .leading, spacing: 4) {
                            Text(event.title)
                                .font(.headline)
                                .foregroundStyle(Color.cneInk)
                                .lineLimit(2)
                                .minimumScaleFactor(0.8)
                            Label(Fmt.date(event.date, "EEEEdMMMMjmm", l), systemImage: "clock")
                                .font(.caption)
                                .foregroundStyle(Color.cneInkMid)
                                .lineLimit(1)
                                .minimumScaleFactor(0.8)
                            if let location = event.location {
                                Label(location, systemImage: "mappin.and.ellipse")
                                    .font(.caption)
                                    .foregroundStyle(Color.cneInkMid)
                                    .lineLimit(1)
                            }
                        }
                    }
                    Spacer(minLength: 0)
                }
            } else {
                EmptyMessage(icon: "calendar.badge.clock", text: l.t("No upcoming events right now.", "No hay eventos próximos por ahora."))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .widgetURL(CNEConfig.link("event", id: entry.event?.id))
    }
}

// MARK: - 3. Livestream countdown (small) + latest sermon (medium)

struct LivestreamWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: "CNELivestreamWidget", intent: LanguageIntent.self, provider: CNEProvider()) { entry in
            FamilyRouter {
                LivestreamWidgetView(entry: entry)
            } lockScreen: {
                LivestreamLockScreenView(entry: entry)
            }
            .cneWidgetStyle(entry)
        }
        .configurationDisplayName("Transmisión en Vivo")
        .description("Cuenta regresiva y último sermón. / Countdown and latest sermon.")
        .supportedFamilies([.systemSmall, .systemMedium, .accessoryCircular, .accessoryRectangular, .accessoryInline])
    }
}

struct LivestreamWidgetView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CNEEntry

    var body: some View {
        if family == .systemSmall {
            countdown
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                .widgetURL(CNEConfig.link("live", id: entry.livestream?.id))
        } else {
            HStack(alignment: .top, spacing: 14) {
                Link(destination: CNEConfig.link("live", id: entry.livestream?.id)) {
                    countdown.frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                }
                Rectangle()
                    .fill(Color.cneInkMid.opacity(0.25))
                    .frame(width: 1)
                Link(destination: CNEConfig.link("sermon", id: entry.sermon?.id)) {
                    SermonBlock(sermon: entry.sermon, language: entry.language)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                }
            }
        }
    }

    private var countdown: some View {
        let l = entry.language
        return VStack(alignment: .leading, spacing: 6) {
            if entry.livestream?.isLive == true {
                LiveBadge(language: l)
            } else {
                SectionLabel(icon: "dot.radiowaves.left.and.right", text: l.t("Livestream", "Transmisión"))
            }
            if let stream = entry.livestream {
                Text(stream.title)
                    .font(.headline)
                    .foregroundStyle(Color.cneInk)
                    .lineLimit(2)
                    .minimumScaleFactor(0.8)
                Spacer(minLength: 0)
                CountdownBlock(stream: stream, now: entry.date, language: l)
            }
        }
    }
}

struct SermonBlock: View {
    let sermon: SermonInfo?
    let language: WidgetLanguage

    var body: some View {
        let l = language
        VStack(alignment: .leading, spacing: 6) {
            SectionLabel(icon: "play.rectangle.fill", text: l.t("Latest Sermon", "Último Sermón"))
            if let sermon {
                if let image = sermon.thumbnail {
                    Color.clear
                        .frame(maxWidth: .infinity)
                        .frame(height: 46)
                        .overlay {
                            Image(uiImage: image).resizable().scaledToFill()
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
                Text(sermon.title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.cneInk)
                    .lineLimit(2)
                    .minimumScaleFactor(0.85)
                Spacer(minLength: 0)
                if let date = sermon.date {
                    Text(Fmt.date(date, "dMMMyyyy", l))
                        .font(.caption2)
                        .foregroundStyle(Color.cneInkMid)
                        .lineLimit(1)
                }
            } else {
                EmptyMessage(icon: "play.rectangle", text: l.t("No sermons yet.", "Todavía no hay sermones."))
            }
        }
    }
}

/// The big countdown used on the livestream widget.
struct CountdownBlock: View {
    let stream: LivestreamInfo
    let now: Date
    let language: WidgetLanguage

    var body: some View {
        let l = language
        if stream.isLive {
            Label(l.t("Watch now", "Míralo ahora"), systemImage: "play.circle.fill")
                .font(.subheadline.weight(.bold))
                .foregroundStyle(Color.cneLive)
        } else if stream.start <= now {
            Text(l.t("Starting soon", "Comenzando pronto"))
                .font(.subheadline.weight(.bold))
                .foregroundStyle(Color.cneAccent)
        } else {
            VStack(alignment: .leading, spacing: 1) {
                Text(l.t("Starts in", "Empieza en"))
                    .font(.caption2)
                    .foregroundStyle(Color.cneInkMid)
                if stream.start.timeIntervalSince(now) < 86_400 {
                    // Ticks every second on its own, no refresh needed.
                    Text(timerInterval: now...stream.start, countsDown: true)
                        .font(.system(size: 26, weight: .bold, design: .rounded))
                        .monospacedDigit()
                        .foregroundStyle(Color.cneAccent)
                        .lineLimit(1)
                        .minimumScaleFactor(0.6)
                } else {
                    Text(stream.start, style: .relative)
                        .font(.system(size: 17, weight: .bold, design: .rounded))
                        .foregroundStyle(Color.cneAccent)
                        .lineLimit(2)
                        .minimumScaleFactor(0.7)
                }
                Text(Fmt.date(stream.start, "EEEjmm", l))
                    .font(.caption2)
                    .foregroundStyle(Color.cneInkMid)
                    .lineLimit(1)
            }
        }
    }
}

// MARK: - 4. Esta Semana / This Week (large)

struct ThisWeekWidget: Widget {
    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: "CNEThisWeekWidget", intent: LanguageIntent.self, provider: CNEProvider()) { entry in
            ThisWeekWidgetView(entry: entry).cneWidgetStyle(entry)
        }
        .configurationDisplayName("Esta Semana")
        .description("Versículo, transmisión, evento y sermón. / Verse, livestream, event and sermon.")
        .supportedFamilies([.systemLarge])
    }
}

struct ThisWeekWidgetView: View {
    let entry: CNEEntry

    var body: some View {
        let l = entry.language
        VStack(alignment: .leading, spacing: 10) {
            // Header
            HStack(spacing: 8) {
                Image("CNELogo")
                    .renderingMode(.template)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 18)
                    .foregroundStyle(Color.cneAccent)
                Text(l.t("This Week", "Esta Semana"))
                    .font(.title3.weight(.bold))
                    .foregroundStyle(Color.cneInk)
                Spacer(minLength: 4)
                Text(Fmt.date(entry.date, "EEEEdMMM", l))
                    .font(.caption)
                    .foregroundStyle(Color.cneInkMid)
                    .lineLimit(1)
            }

            // Verse
            Link(destination: CNEConfig.link("verse")) {
                VStack(alignment: .leading, spacing: 5) {
                    SectionLabel(icon: "book.closed.fill", text: l.t("Verse of the Day", "Versículo del Día"))
                    if let verse = entry.verse {
                        Text(verse.text)
                            .font(.system(size: 14, design: .serif))
                            .foregroundStyle(Color.cneInk)
                            .lineLimit(4)
                            .minimumScaleFactor(0.8)
                        Text(verse.reference)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(Color.cneAccent)
                    } else {
                        Text(l.t("Open the app to read today's verse.", "Abre la app para leer el versículo de hoy."))
                            .font(.caption)
                            .foregroundStyle(Color.cneInkMid)
                    }
                }
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Color.cneSand.opacity(0.7)))
            }

            // Livestream
            if let stream = entry.livestream {
                Link(destination: CNEConfig.link("live", id: stream.id)) {
                    InfoRow(
                        icon: stream.isLive ? "dot.radiowaves.left.and.right" : "video.fill",
                        iconColor: stream.isLive ? .cneLive : .cneAccent,
                        label: stream.isLive ? l.t("Live now", "En vivo ahora") : l.t("Livestream", "Transmisión"),
                        title: stream.title
                    ) {
                        CountdownLine(stream: stream, now: entry.date, language: l)
                    }
                }
            }

            // Next event
            Link(destination: CNEConfig.link("event", id: entry.event?.id)) {
                InfoRow(
                    icon: "calendar",
                    iconColor: .cneTerra,
                    label: l.t("Next Event", "Próximo Evento"),
                    title: entry.event?.title ?? l.t("No upcoming events", "No hay eventos próximos")
                ) {
                    if let event = entry.event {
                        Text(Fmt.date(event.date, "EEEEdMMMjmm", l))
                    }
                }
            }

            // Latest sermon
            if let sermon = entry.sermon {
                Link(destination: CNEConfig.link("sermon", id: sermon.id)) {
                    InfoRow(
                        icon: "play.rectangle.fill",
                        iconColor: .cneAccent,
                        label: l.t("Latest Sermon", "Último Sermón"),
                        title: sermon.title,
                        thumbnail: sermon.thumbnail
                    ) {
                        if let date = sermon.date {
                            Text(Fmt.date(date, "dMMMyyyy", l))
                        }
                    }
                }
            }

            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .widgetURL(CNEConfig.link("home"))
    }
}

/// One-line countdown for the Esta Semana rows.
struct CountdownLine: View {
    let stream: LivestreamInfo
    let now: Date
    let language: WidgetLanguage

    var body: some View {
        let l = language
        if stream.isLive {
            Text(l.t("Tap to watch", "Toca para ver"))
                .foregroundStyle(Color.cneLive)
        } else if stream.start <= now {
            Text(l.t("Starting soon", "Comenzando pronto"))
        } else if stream.start.timeIntervalSince(now) < 86_400 {
            Text(l.t("Starts in ", "Empieza en ")) + Text(timerInterval: now...stream.start, countsDown: true)
        } else {
            Text(Fmt.date(stream.start, "EEEjmm", l) + l.t(" · in ", " · en ")) + Text(stream.start, style: .relative)
        }
    }
}

// MARK: - Shared pieces

struct InfoRow<Detail: View>: View {
    let icon: String
    let iconColor: Color
    let label: String
    let title: String
    var thumbnail: UIImage? = nil
    @ViewBuilder let detail: () -> Detail

    var body: some View {
        HStack(spacing: 10) {
            Group {
                if let thumbnail {
                    Color.clear.overlay {
                        Image(uiImage: thumbnail).resizable().scaledToFill()
                    }
                } else {
                    Image(systemName: icon)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(iconColor)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(iconColor.opacity(0.14))
                }
            }
            .frame(width: thumbnail == nil ? 36 : 56, height: 36)
            .clipShape(RoundedRectangle(cornerRadius: 9, style: .continuous))

            VStack(alignment: .leading, spacing: 1) {
                Text(label.uppercased())
                    .font(.system(size: 9, weight: .bold))
                    .tracking(0.5)
                    .foregroundStyle(iconColor)
                    .lineLimit(1)
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Color.cneInk)
                    .lineLimit(1)
                detail()
                    .font(.caption)
                    .foregroundStyle(Color.cneInkMid)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            Spacer(minLength: 0)
            Image(systemName: "chevron.right")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(Color.cneInkMid.opacity(0.6))
        }
    }
}

struct SectionLabel: View {
    let icon: String
    let text: String
    var color: Color = .cneAccent

    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
            Text(text.uppercased()).tracking(0.6)
        }
        .font(.system(size: 10, weight: .bold))
        .foregroundStyle(color)
        .lineLimit(1)
        .minimumScaleFactor(0.8)
    }
}

struct LiveBadge: View {
    let language: WidgetLanguage

    var body: some View {
        HStack(spacing: 4) {
            Circle().fill(Color.white).frame(width: 6, height: 6)
            Text(language.t("LIVE", "EN VIVO"))
        }
        .font(.system(size: 10, weight: .heavy))
        .foregroundStyle(Color.white)
        .padding(.horizontal, 7)
        .padding(.vertical, 3)
        .background(Capsule().fill(Color.cneLive))
    }
}

struct DateTile: View {
    let date: Date
    let language: WidgetLanguage
    let size: CGFloat

    var body: some View {
        VStack(spacing: 0) {
            Text(Fmt.date(date, "MMM", language).uppercased())
                .font(.system(size: size * 0.22, weight: .bold))
                .foregroundStyle(Color.cneTerra)
            Text(Fmt.date(date, "d", language))
                .font(.system(size: size * 0.48, weight: .bold, design: .rounded))
                .foregroundStyle(Color.cneInk)
        }
        .frame(width: size, height: size)
        .background(RoundedRectangle(cornerRadius: size * 0.22, style: .continuous).fill(Color.cneSand))
    }
}

struct EmptyMessage: View {
    let icon: String
    let text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Spacer(minLength: 0)
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(Color.cneAccent.opacity(0.7))
            Text(text)
                .font(.caption)
                .foregroundStyle(Color.cneInkMid)
                .lineLimit(3)
            Spacer(minLength: 0)
        }
    }
}

struct CNEBackground: View {
    @Environment(\.widgetFamily) private var family

    var body: some View {
        switch family {
        case .accessoryCircular:
            AccessoryWidgetBackground()
        case .accessoryRectangular, .accessoryInline:
            Color.clear
        default:
            LinearGradient(colors: [.cneBackground, .cneSand], startPoint: .top, endPoint: .bottom)
        }
    }
}

extension View {
    /// Background + language every CNE widget shares.
    func cneWidgetStyle(_ entry: CNEEntry) -> some View {
        self
            .environment(\.locale, entry.language.locale)
            .containerBackground(for: .widget) { CNEBackground() }
    }
}

enum Fmt {
    /// Formats a date from a template ("EEEjmm" → "dom 3:00 p.m.") in the widget's language.
    static func date(_ date: Date, _ template: String, _ language: WidgetLanguage) -> String {
        let formatter = DateFormatter()
        formatter.locale = language.locale
        formatter.setLocalizedDateFormatFromTemplate(template)
        return formatter.string(from: date)
    }
}

// MARK: - Lock screen
//
// iOS draws lock-screen widgets in one tint, so these skip the colors and
// lean on text weight instead. Same data and same tap targets as the home
// screen versions.

/// Shows `lockScreen` for lock-screen sizes and `home` for everything else.
struct FamilyRouter<Home: View, Lock: View>: View {
    @Environment(\.widgetFamily) private var family
    @ViewBuilder let home: () -> Home
    @ViewBuilder let lockScreen: () -> Lock

    var body: some View {
        switch family {
        case .accessoryCircular, .accessoryRectangular, .accessoryInline:
            lockScreen()
        default:
            home()
        }
    }
}

struct VerseLockScreenView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CNEEntry

    var body: some View {
        let l = entry.language
        let reference = entry.verse?.reference ?? l.t("Verse of the Day", "Versículo del Día")
        Group {
            if family == .accessoryInline {
                Label(reference, systemImage: "book.closed.fill")
            } else {
                VStack(alignment: .leading, spacing: 1) {
                    Label(reference, systemImage: "book.closed.fill")
                        .font(.headline)
                        .lineLimit(1)
                        .widgetAccentable()
                    Text(entry.verse?.text ?? l.t("Open the app to read today's verse.", "Abre la app para leer el versículo de hoy."))
                        .font(.system(.caption, design: .serif))
                        .lineLimit(3)
                        .minimumScaleFactor(0.8)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .widgetURL(CNEConfig.link("verse"))
    }
}

struct EventLockScreenView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CNEEntry

    var body: some View {
        let l = entry.language
        Group {
            if family == .accessoryInline {
                if let event = entry.event {
                    Label("\(event.title) · \(Fmt.date(event.date, "EEEd", l))", systemImage: "calendar")
                } else {
                    Label(l.t("No upcoming events", "Sin eventos próximos"), systemImage: "calendar")
                }
            } else {
                VStack(alignment: .leading, spacing: 1) {
                    Label(l.t("Next Event", "Próximo Evento"), systemImage: "calendar")
                        .font(.caption.weight(.bold))
                        .widgetAccentable()
                    if let event = entry.event {
                        Text(event.title)
                            .font(.headline)
                            .lineLimit(2)
                            .minimumScaleFactor(0.8)
                        Text(Fmt.date(event.date, "EEEdMMMjmm", l))
                            .font(.caption)
                            .lineLimit(1)
                    } else {
                        Text(l.t("No upcoming events right now.", "No hay eventos próximos por ahora."))
                            .font(.caption)
                            .lineLimit(2)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .widgetURL(CNEConfig.link("event", id: entry.event?.id))
    }
}

struct LivestreamLockScreenView: View {
    @Environment(\.widgetFamily) private var family
    let entry: CNEEntry

    var body: some View {
        Group {
            if let stream = entry.livestream {
                switch family {
                case .accessoryCircular:
                    circular(stream)
                case .accessoryInline:
                    inline(stream)
                default:
                    rectangular(stream)
                }
            }
        }
        .widgetURL(CNEConfig.link("live", id: entry.livestream?.id))
    }

    private var l: WidgetLanguage { entry.language }

    @ViewBuilder
    private func circular(_ stream: LivestreamInfo) -> some View {
        VStack(spacing: 1) {
            Image(systemName: stream.isLive ? "dot.radiowaves.left.and.right" : "video.fill")
                .font(.system(size: 13, weight: .semibold))
                .widgetAccentable()
            if stream.isLive {
                Text(l.t("LIVE", "VIVO"))
                    .font(.system(size: 12, weight: .heavy))
            } else if stream.start <= entry.date {
                Text(l.t("SOON", "PRONTO"))
                    .font(.system(size: 10, weight: .heavy))
                    .minimumScaleFactor(0.6)
            } else if stream.start.timeIntervalSince(entry.date) < 86_400 {
                Text(timerInterval: entry.date...stream.start, countsDown: true)
                    .font(.system(size: 11, weight: .semibold, design: .rounded))
                    .monospacedDigit()
                    .multilineTextAlignment(.center)
                    .lineLimit(1)
                    .minimumScaleFactor(0.5)
                    .frame(maxWidth: 48)
            } else {
                Text(Fmt.date(stream.start, "EEE", l).uppercased())
                    .font(.system(size: 12, weight: .bold))
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                Text(Fmt.date(stream.start, "j", l))
                    .font(.system(size: 9, weight: .medium))
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
            }
        }
        .padding(4)
    }

    @ViewBuilder
    private func rectangular(_ stream: LivestreamInfo) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Label(
                stream.isLive ? l.t("Live now", "En vivo ahora") : l.t("Livestream", "Transmisión"),
                systemImage: stream.isLive ? "dot.radiowaves.left.and.right" : "video.fill"
            )
            .font(.caption.weight(.bold))
            .widgetAccentable()
            Text(stream.title)
                .font(.headline)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
            CountdownLine(stream: stream, now: entry.date, language: l)
                .font(.caption)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    @ViewBuilder
    private func inline(_ stream: LivestreamInfo) -> some View {
        if stream.isLive {
            Label(l.t("Live now: ", "En vivo: ") + stream.title, systemImage: "dot.radiowaves.left.and.right")
        } else if stream.start <= entry.date {
            Label(l.t("Service starting soon", "El servicio empieza pronto"), systemImage: "video.fill")
        } else {
            Label {
                Text(l.t("Service in ", "Servicio en ")) + Text(stream.start, style: .relative)
            } icon: {
                Image(systemName: "video.fill")
            }
        }
    }
}
