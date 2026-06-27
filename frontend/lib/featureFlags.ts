// Feature flags for the app.
//
// UGC_ENABLED controls all user-generated content surfaces (the Community
// Bulletin board, its posts/comments, and the public "Submit a Prayer Request"
// form on the Home page).
//
// It is currently DISABLED to comply with App Store Review Guideline 1.2
// (Safety - User Generated Content). Re-enabling it requires the full set of
// UGC precautions Apple mandates (EULA, content filtering, blocking, 24h
// moderation, in-app reporting/contact). Flip this to `true` only after those
// are in place.
export const UGC_ENABLED = false;
