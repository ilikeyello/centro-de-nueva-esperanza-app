import { api } from "encore.dev/api";
import db from "../db";
import * as notifications from "../notifications/notifications";

interface UpdateChurchInfoRequest {
  nameEn?: string;
  nameEs?: string;
  address?: string;
  phone?: string;
  email?: string;
  serviceTimesEn?: string;
  serviceTimesEs?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  facebookPageUrl?: string;
  latitude?: number;
  longitude?: number;
  livestreamStatus?: "offline" | "starting" | "live" | "ending";
  livestreamUrl?: string;
}

interface ChurchInfo {
  nameEn: string;
  nameEs: string;
  address: string;
  phone: string;
  email: string;
  serviceTimesEn: string;
  serviceTimesEs: string;
  descriptionEn: string | null;
  descriptionEs: string | null;
  facebookPageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  livestreamStatus: string;
  livestreamUrl: string | null;
  livestreamStartedAt: Date | null;
}

// Updates church information.
export const update = api<UpdateChurchInfoRequest, ChurchInfo>(
  { expose: true, method: "PUT", path: "/church/info" },
  async (req) => {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (req.nameEn !== undefined) {
      updates.push(`name_en = $${paramIndex++}`);
      params.push(req.nameEn);
    }
    if (req.nameEs !== undefined) {
      updates.push(`name_es = $${paramIndex++}`);
      params.push(req.nameEs);
    }
    if (req.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      params.push(req.address);
    }
    if (req.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      params.push(req.phone);
    }
    if (req.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      params.push(req.email);
    }
    if (req.serviceTimesEn !== undefined) {
      updates.push(`service_times_en = $${paramIndex++}`);
      params.push(req.serviceTimesEn);
    }
    if (req.serviceTimesEs !== undefined) {
      updates.push(`service_times_es = $${paramIndex++}`);
      params.push(req.serviceTimesEs);
    }
    if (req.descriptionEn !== undefined) {
      updates.push(`description_en = $${paramIndex++}`);
      params.push(req.descriptionEn);
    }
    if (req.descriptionEs !== undefined) {
      updates.push(`description_es = $${paramIndex++}`);
      params.push(req.descriptionEs);
    }
    if (req.facebookPageUrl !== undefined) {
      updates.push(`facebook_page_url = $${paramIndex++}`);
      params.push(req.facebookPageUrl);
    }
    if (req.latitude !== undefined) {
      updates.push(`latitude = $${paramIndex++}`);
      params.push(req.latitude);
    }
    if (req.longitude !== undefined) {
      updates.push(`longitude = $${paramIndex++}`);
      params.push(req.longitude);
    }
    if (req.livestreamStatus !== undefined) {
      updates.push(`livestream_status = $${paramIndex++}`);
      params.push(req.livestreamStatus);
      
      // Set livestream started time when going live
      if (req.livestreamStatus === "live") {
        updates.push(`livestream_started_at = $${paramIndex++}`);
        params.push(new Date());
      }
    }
    if (req.livestreamUrl !== undefined) {
      updates.push(`livestream_url = $${paramIndex++}`);
      params.push(req.livestreamUrl);
    }

    const query = `
      UPDATE church_info
      SET ${updates.join(", ")}
      WHERE id = 1
      RETURNING 
        name_en as "nameEn",
        name_es as "nameEs",
        address,
        phone,
        email,
        service_times_en as "serviceTimesEn",
        service_times_es as "serviceTimesEs",
        description_en as "descriptionEn",
        description_es as "descriptionEs",
        facebook_page_url as "facebookPageUrl",
        latitude,
        longitude,
        livestream_status as "livestreamStatus",
        livestream_url as "livestreamUrl",
        livestream_started_at as "livestreamStartedAt"
    `;

    const info = await db.rawQueryRow<ChurchInfo>(query, ...params);

    // Send push notification when livestream status changes to "live"
    if (req.livestreamStatus === "live") {
      try {
        await notifications.sendNotification({
          title: "🔴 We're Live!",
          body: "Join our livestream now - we're broadcasting live!",
          icon: "/cne-app/icon-192x192.png",
          tag: `livestream-${Date.now()}`,
          data: {
            type: "livestream",
            status: "live",
            url: req.livestreamUrl || "#"
          }
        });
      } catch (error) {
        // Non-blocking - don't fail the update if notification fails
        console.error("Failed to send push notification for livestream:", error);
      }
    }

    return info!;
  }
);
