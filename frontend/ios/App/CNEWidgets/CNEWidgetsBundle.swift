import SwiftUI
import WidgetKit

/// The home-screen widgets for the CNE app.
///
/// All four share one data loader (WidgetData.swift): it pulls today's verse,
/// the livestream, the latest sermon and the next event in a single pass, and
/// each widget just shows the part it needs.
@main
struct CNEWidgetsBundle: WidgetBundle {
    var body: some Widget {
        VerseWidget()
        NextEventWidget()
        LivestreamWidget()
        ThisWeekWidget()
    }
}
