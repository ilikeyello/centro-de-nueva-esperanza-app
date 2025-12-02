import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";
import { sendNotificationInternal } from "../notifications/notifications";

interface CreateAnnouncementRequest {
  titleEn: string;
  titleEs: string;
  contentEn: string;
  contentEs: string;
  priority: "low" | "normal" | "high" | "urgent";
  passcode: string;
}

interface Announcement {
  id: number;
  titleEn: string;
  titleEs: string;
  contentEn: string;
  contentEs: string;
  priority: string;
  createdAt: Date;
  createdBy: string;
}

// Creates a new church announcement.
export const create = api<CreateAnnouncementRequest, Announcement>(
  { expose: true, method: "POST", path: "/announcements" },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }
    const auth = getAuthData();
    const createdBy = auth?.userID ?? "public-web";
    const announcement = await db.queryRow<Announcement>`
      INSERT INTO announcements (title_en, title_es, content_en, content_es, priority, created_by)
      VALUES (${req.titleEn}, ${req.titleEs}, ${req.contentEn}, ${req.contentEs}, ${req.priority}, ${createdBy})
      RETURNING id, title_en as "titleEn", title_es as "titleEs", content_en as "contentEn", content_es as "contentEs", 
                priority, created_at as "createdAt", created_by as "createdBy"
    `;

    // Send push notification (non-blocking)
    try {
      console.log("🔔 Preparing to send announcement notification:", {
        title: req.titleEn,
        body: req.priority === "urgent" ? "🚨 URGENT: " + req.contentEn.substring(0, 100) + "..." : req.contentEn.substring(0, 100) + "...",
        priority: req.priority,
        announcementId: announcement!.id
      });
      
      const result = await sendNotificationInternal({
        title: req.titleEn,
        body: req.priority === "urgent" ? "🚨 URGENT: " + req.contentEn.substring(0, 100) + "..." : req.contentEn.substring(0, 100) + "...",
        icon: "/cne-app/icon-192x192.png",
        tag: `announcement-${announcement!.id}`,
        data: {
          type: "announcement",
          id: announcement!.id,
          priority: req.priority
        }
      });
      
      console.log("✅ Announcement notification sent successfully:", result);
    } catch (error) {
      // Non-blocking - don't fail the announcement creation if notification fails
      console.error("❌ Failed to send push notification for announcement:", error);
    }

    return announcement!;
  }
);

// Test endpoint to verify deployment
export const testDeploy = api(
  { expose: true, method: "GET", path: "/announcements/test-deploy" },
  async () => {
    return { 
      message: "Announcements service is working!",
      timestamp: new Date().toISOString()
    };
  }
);
