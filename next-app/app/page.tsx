import Link from "next/link";
import { ArrowRight, PlayCircle, Radio } from "lucide-react";
import { createSupabaseServerClient } from "../lib/supabaseServer";

const heroHighlights = [
  {
    title: "Warm welcome",
    description: "High-contrast, mobile-first design for every visitor.",
  },
  {
    title: "Fresh announcements",
    description: "Update events and notes from your client portal.",
  },
  {
    title: "Sermons on demand",
    description: "Stream audio with a calm, accessible player.",
  },
];

const featuredSermons = [
  {
    title: "Esperanza en comunidad",
    speaker: "Pr. Álvarez",
    length: "24 min",
  },
  {
    title: "Fe que restaura",
    speaker: "Pr. Álvarez",
    length: "28 min",
  },
  {
    title: "Caminar en luz",
    speaker: "Invitado",
    length: "19 min",
  },
];

type Announcement = {
  id: string;
  title: string;
  summary?: string | null;
  event_date?: string | null;
};

async function getAnnouncements(): Promise<{ data: Announcement[]; error?: string }> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return { data: [], error: "Supabase keys missing" };
  }

  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, summary, event_date")
    .order("event_date", { ascending: false })
    .limit(3);

  if (error) {
    return { data: [], error: error.message };
  }

  return { data: data ?? [] };
}

export default async function Page() {
  const { data: announcements, error: announcementsError } = await getAnnouncements();

  return (
    <div className="space-y-16">
      <section className="section-shell">
        <div className="section-inner grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="badge">Centro de Nueva Esperanza</div>
            <h1 className="serif-title text-4xl sm:text-5xl">
              Modern Sanctuary — calm, bilingual, and welcoming.
            </h1>
            <p className="text-lg text-slate-700">
              A peaceful online home for your community. Share sermons, events,
              and updates with accessible design that feels warm—on any device.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link className="button-primary" href="#visit">
                Plan a visit
                <ArrowRight size={18} />
              </Link>
              <Link className="button-ghost" href="#sermons">
                Listen to sermons
                <PlayCircle size={18} />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div key={item.title} className="card p-4">
                  <p className="serif-title text-lg">{item.title}</p>
                  <p className="text-sm text-slate-700">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-sand-100 p-3" aria-hidden="true">
                <Radio size={20} />
              </div>
              <div>
                <p className="serif-title text-xl">Live + On Demand</p>
                <p className="text-sm text-slate-700">
                  Stream sermons with clear controls and transcripts.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {featuredSermons.map((sermon) => (
                <div key={sermon.title} className="border border-sand-200 rounded-2xl p-4">
                  <p className="font-medium">{sermon.title}</p>
                  <p className="text-sm text-slate-700">
                    {sermon.speaker} • {sermon.length}
                  </p>
                </div>
              ))}
            </div>
            <button className="button-primary w-full" aria-label="Play latest sermon">
              <PlayCircle size={18} />
              Play latest sermon
            </button>
            <p className="text-sm text-slate-700">
              Audio player will connect to your Supabase-hosted content once keys
              are set. We’ll keep loading and error states gentle and clear.
            </p>
          </div>
        </div>
      </section>

      <section id="sermons" className="section-shell bg-sand-100/70">
        <div className="section-inner space-y-6">
          <div className="space-y-2">
            <p className="badge">Sermons</p>
            <h2 className="serif-title text-3xl">Rooted teaching, always available</h2>
            <p className="text-slate-700">
              Sermon listings will pull from Supabase via your client portal—fully
              bilingual labels and transcripts supported.
            </p>
          </div>
          <div className="grid-cards">
            {featuredSermons.map((sermon) => (
              <article key={sermon.title} className="card p-5">
                <p className="text-sm text-slate-600">{sermon.speaker}</p>
                <h3 className="serif-title text-xl">{sermon.title}</h3>
                <p className="text-sm text-slate-700">Duration: {sermon.length}</p>
                <div className="mt-4 flex gap-2">
                  <button className="button-primary" aria-label={`Play ${sermon.title}`}>
                    <PlayCircle size={16} />
                    Play
                  </button>
                  <button className="button-ghost">Transcript</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-inner space-y-6">
          <div className="space-y-2">
            <p className="badge">Announcements</p>
            <h2 className="serif-title text-3xl">Stay in the loop</h2>
            <p className="text-slate-700">
              Pulled directly from your Supabase tables once keys are set. Clear loading/error
              handling keeps things calm for visitors.
            </p>
          </div>
          <div className="grid-cards">
            {announcements.length > 0 ? (
              announcements.map((item) => (
                <article key={item.id} className="card p-5">
                  <p className="text-sm text-slate-600">
                    {item.event_date ? new Date(item.event_date).toLocaleDateString() : ""}
                  </p>
                  <h3 className="serif-title text-xl">{item.title}</h3>
                  {item.summary && <p className="text-slate-700 text-sm">{item.summary}</p>}
                </article>
              ))
            ) : (
              <div className="card p-5">
                <p className="serif-title text-lg">Announcements coming soon</p>
                <p className="text-slate-700 text-sm">
                  Connect Supabase env keys to show live updates here.
                </p>
                {announcementsError && (
                  <p className="text-xs text-red-700 mt-2">{announcementsError}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="visit" className="section-shell">
        <div className="section-inner grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-3">
            <p className="badge">Visit</p>
            <h2 className="serif-title text-3xl">Join us in person or online</h2>
            <p className="text-slate-700">
              Service times, location, and livestream links will stay synced from
              your portal. Clear ARIA labels and large touch targets keep it
              friendly for all ages.
            </p>
            <div className="space-y-2 text-sm text-slate-700">
              <p>Sunday Service — 10:30 AM</p>
              <p>123 Calle Esperanza, Tucson, AZ</p>
              <p>Livestream available weekly</p>
            </div>
          </div>
          <div className="card p-5 space-y-4">
            <h3 className="serif-title text-xl">What to expect</h3>
            <ul className="space-y-2 text-slate-700 text-sm">
              <li>• Bilingual welcome and signage</li>
              <li>• Accessible seating and parking guidance</li>
              <li>• Kids ministry check-in details</li>
              <li>• Simple giving and contact forms</li>
            </ul>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="button-primary">Plan your visit</button>
              <button className="button-ghost">Get directions</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
