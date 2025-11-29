import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface CancelRSVPRequest {
  eventId: number;
}

interface CancelRSVPResponse {
  success: boolean;
}

// Cancels an RSVP for an event.
export const cancelRsvp = api<CancelRSVPRequest, CancelRSVPResponse>(
  { expose: true, method: "DELETE", path: "/events/:eventId/rsvp", auth: true },
  async (req) => {
    const auth = getAuthData()!;
    await db.exec`
      DELETE FROM event_rsvps 
      WHERE event_id = ${req.eventId} AND user_id = ${auth.userID}
    `;
    return { success: true };
  }
);
