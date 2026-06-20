"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Calendar, MapPin, Users, ChevronDown, ChevronUp } from "lucide-react";

interface EventRsvp {
  id: number;
  user_name: string | null;
  user_email: string | null;
  created_at: string;
}

interface ChurchEvent {
  id: number;
  title_en: string;
  title_es: string;
  description_en: string | null;
  event_date: string;
  location: string;
  max_attendees: number | null;
  image_url: string | null;
  rsvps: EventRsvp[];
}

export function EventsPage() {
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);

  const orgId = process.env.NEXT_PUBLIC_CHURCH_ORG_ID;

  useEffect(() => {
    async function load() {
      if (!supabase || !orgId) {
        setError("Missing Supabase configuration.");
        setLoading(false);
        return;
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("id, title_en, title_es, description_en, event_date, location, max_attendees, image_url")
        .eq("organization_id", orgId)
        .order("event_date", { ascending: true });

      if (eventsError) {
        setError(eventsError.message);
        setLoading(false);
        return;
      }

      const eventIds = (eventsData ?? []).map((e: any) => e.id);

      const { data: rsvpsData, error: rsvpsError } = eventIds.length
        ? await supabase
            .from("event_rsvps")
            .select("id, event_id, user_name, user_email, created_at")
            .in("event_id", eventIds)
            .order("created_at", { ascending: true })
        : { data: [], error: null };

      if (rsvpsError) {
        setError(rsvpsError.message);
        setLoading(false);
        return;
      }

      const rsvpsByEventId = new Map<number, EventRsvp[]>();
      (rsvpsData ?? []).forEach((r: any) => {
        const list = rsvpsByEventId.get(r.event_id) ?? [];
        list.push({
          id: r.id,
          user_name: r.user_name,
          user_email: r.user_email,
          created_at: r.created_at,
        });
        rsvpsByEventId.set(r.event_id, list);
      });

      const enriched: ChurchEvent[] = (eventsData ?? []).map((e: any) => ({
        id: e.id,
        title_en: e.title_en,
        title_es: e.title_es,
        description_en: e.description_en,
        event_date: e.event_date,
        location: e.location,
        max_attendees: e.max_attendees,
        image_url: e.image_url ?? null,
        rsvps: rsvpsByEventId.get(e.id) ?? [],
      }));

      setEvents(enriched);
      setLoading(false);
    }

    load();
  }, [orgId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-neutral-400">
        Loading events…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-100">Events &amp; RSVPs</h1>

      {events.length === 0 && (
        <p className="text-neutral-400">No events found.</p>
      )}

      {events.map((event) => {
        const isExpanded = expandedEventId === event.id;
        const isPast = new Date(event.event_date) < new Date();

        return (
          <div
            key={event.id}
            className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden"
          >
            {event.image_url && (
              <img
                src={event.image_url}
                alt={event.title_en || event.title_es}
                className="max-h-96 w-full object-contain"
              />
            )}

            {/* Event header */}
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-neutral-100 truncate">
                      {event.title_en || event.title_es}
                    </h2>
                    {isPast && (
                      <span className="shrink-0 rounded-full bg-neutral-800 px-2 py-0.5 text-[0.65rem] text-neutral-500">
                        Past
                      </span>
                    )}
                  </div>
                  {event.description_en && (
                    <p className="mt-1 text-sm text-neutral-400 line-clamp-2">
                      {event.description_en}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(event.event_date).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {event.rsvps.length} RSVP{event.rsvps.length !== 1 ? "s" : ""}
                      {event.max_attendees ? ` / ${event.max_attendees} max` : ""}
                    </span>
                  </div>
                </div>

                {event.rsvps.length > 0 && (
                  <button
                    onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                    className="shrink-0 flex items-center gap-1 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-neutral-400 hover:border-neutral-500 hover:text-neutral-200 transition-colors"
                  >
                    {isExpanded ? (
                      <>Hide <ChevronUp className="h-3.5 w-3.5" /></>
                    ) : (
                      <>View RSVPs <ChevronDown className="h-3.5 w-3.5" /></>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* RSVP list */}
            {isExpanded && event.rsvps.length > 0 && (
              <div className="border-t border-neutral-800 px-5 py-3">
                <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-widest text-neutral-500">
                  Attendees ({event.rsvps.length})
                </p>
                <div className="space-y-1.5">
                  {event.rsvps.map((rsvp) => (
                    <div
                      key={rsvp.id}
                      className="flex items-center justify-between rounded-lg bg-neutral-800/60 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-200">
                          {rsvp.user_name || "Anonymous"}
                        </p>
                        {rsvp.user_email && (
                          <p className="text-xs text-neutral-500">{rsvp.user_email}</p>
                        )}
                      </div>
                      <p className="text-xs text-neutral-600">
                        {new Date(rsvp.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
