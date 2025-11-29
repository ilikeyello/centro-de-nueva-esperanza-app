import { api, APIError } from "encore.dev/api";
import { randomUUID } from "crypto";
import db from "../db";

interface RSVPRequest {
  eventId: number;
  attendees: number;
  participantId?: string | null;
  name?: string | null;
}

interface RSVPResponse {
  success: boolean;
}

// Creates or updates an RSVP for an event.
export const rsvp = api<RSVPRequest, RSVPResponse>(
  { expose: true, method: "POST", path: "/events/:eventId/rsvp" },
  async (req) => {
    const providedId = req.participantId?.trim();
    const userId = providedId && providedId.length > 0 ? providedId : randomUUID();
    const displayName = req.name?.trim() || "Guest";

    const event = await db.queryRow<{
      maxAttendees: number | null;
      totalAttendees: number;
      existingAttendees: number;
    }>`
      SELECT
        e.max_attendees as "maxAttendees",
        COALESCE(SUM(r.attendees), 0)::INTEGER as "totalAttendees",
        COALESCE(MAX(CASE WHEN r.user_id = ${userId} THEN r.attendees END), 0)::INTEGER as "existingAttendees"
      FROM events e
      LEFT JOIN event_rsvps r ON e.id = r.event_id
      WHERE e.id = ${req.eventId}
      GROUP BY e.id
    `;

    if (!event) {
      throw APIError.notFound("event not found");
    }

    const otherAttendees = event.totalAttendees - event.existingAttendees;
    const prospectiveTotal = otherAttendees + req.attendees;

    if (event.maxAttendees && prospectiveTotal > event.maxAttendees) {
      throw APIError.failedPrecondition("event is full");
    }

    await db.exec`
      INSERT INTO event_rsvps (event_id, user_id, user_name, attendees)
      VALUES (${req.eventId}, ${userId}, ${displayName}, ${req.attendees})
      ON CONFLICT (event_id, user_id) 
      DO UPDATE SET attendees = ${req.attendees}, user_name = ${displayName}
    `;

    return { success: true };
  }
);
