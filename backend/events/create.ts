import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface CreateEventRequest {
  titleEn: string;
  titleEs: string;
  descriptionEn?: string;
  descriptionEs?: string;
  eventDate: Date;
  location: string;
  maxAttendees?: number;
  passcode: string;
}

interface Event {
  id: number;
  titleEn: string;
  titleEs: string;
  descriptionEn: string | null;
  descriptionEs: string | null;
  eventDate: Date;
  location: string;
  maxAttendees: number | null;
  createdAt: Date;
  createdBy: string;
  rsvpCount: number;
}

// Creates a new church event.
export const create = api<CreateEventRequest, Event>(
  { expose: true, method: "POST", path: "/events" },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }
    const auth = getAuthData();
    const createdBy = auth?.userID ?? "public-web";
    const event = await db.queryRow<Event>`
      INSERT INTO events (title_en, title_es, description_en, description_es, event_date, location, max_attendees, created_by)
      VALUES (${req.titleEn}, ${req.titleEs}, ${req.descriptionEn || null}, ${req.descriptionEs || null}, ${req.eventDate}, ${req.location}, ${req.maxAttendees || null}, ${createdBy})
      RETURNING id, title_en as "titleEn", title_es as "titleEs", description_en as "descriptionEn", description_es as "descriptionEs", 
                event_date as "eventDate", location, max_attendees as "maxAttendees", created_at as "createdAt", created_by as "createdBy", 0 as "rsvpCount"
    `;

    return event!;
  }
);
