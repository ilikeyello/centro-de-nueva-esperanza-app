import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface ListEventsRequest {
  upcoming: Query<boolean>;
}

export interface Event {
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

interface ListEventsResponse {
  events: Event[];
}

// Lists all church events.
export const list = api<ListEventsRequest, ListEventsResponse>(
  { expose: true, method: "GET", path: "/events" },
  async (req) => {
    const now = new Date();
    let events: Event[];
    
    if (req.upcoming) {
      events = await db.queryAll<Event>`
        SELECT 
          e.id, 
          e.title_en as "titleEn", 
          e.title_es as "titleEs", 
          e.description_en as "descriptionEn", 
          e.description_es as "descriptionEs",
          e.event_date as "eventDate", 
          e.location, 
          e.max_attendees as "maxAttendees", 
          e.created_at as "createdAt", 
          e.created_by as "createdBy",
          COALESCE(SUM(r.attendees), 0)::INTEGER as "rsvpCount"
        FROM events e
        LEFT JOIN event_rsvps r ON e.id = r.event_id
        WHERE e.event_date >= ${now}
        GROUP BY e.id
        ORDER BY e.event_date ASC
      `;
    } else {
      events = await db.queryAll<Event>`
        SELECT 
          e.id, 
          e.title_en as "titleEn", 
          e.title_es as "titleEs", 
          e.description_en as "descriptionEn", 
          e.description_es as "descriptionEs",
          e.event_date as "eventDate", 
          e.location, 
          e.max_attendees as "maxAttendees", 
          e.created_at as "createdAt", 
          e.created_by as "createdBy",
          COALESCE(SUM(r.attendees), 0)::INTEGER as "rsvpCount"
        FROM events e
        LEFT JOIN event_rsvps r ON e.id = r.event_id
        GROUP BY e.id
        ORDER BY e.event_date DESC
      `;
    }
    
    return { events };
  }
);
