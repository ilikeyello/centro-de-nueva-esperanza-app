import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import db from "../db";

// VAPID keys for push notifications - temporarily commented for deployment test
// const PUBLIC_VAPID_KEY = secret("PUBLIC_VAPID_KEY");
// const PRIVATE_VAPID_KEY = secret("PRIVATE_VAPID_KEY");

// Types
interface NotificationSubscription {
  id?: number;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent?: string;
  created_at: Date;
}

interface SubscribeRequest {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

interface SendNotificationRequest {
  title: string;
  body: string;
  icon?: string;
  data?: any;
  tag?: string;
}

interface SendNotificationResponse {
  success: boolean;
  sentCount: number;
  failedCount: number;
  errors?: string[];
}

// Initialize VAPID keys dynamically - temporarily disabled for deployment test
const initializeWebPush = async () => {
  const webpush = await import('web-push');
  
  // Temporarily use placeholder values for deployment test
  webpush.setVapidDetails(
    'mailto:contact@centrodenuevaesperanza.org',
    'placeholder-public-key',
    'placeholder-private-key'
  );
  
  return webpush;
};

// API Endpoints

// Subscribe to push notifications
export const subscribe = api(
  { expose: true, method: "POST", path: "/notifications/subscribe" },
  async (params: SubscribeRequest): Promise<{ success: boolean; message: string }> => {
    try {
      // Check if subscription already exists
      const existing = await db.query`
        SELECT id FROM push_subscriptions 
        WHERE endpoint = ${params.endpoint}
      `;
      
      const existingRows = [];
      for await (const row of existing) {
        existingRows.push(row);
      }
      
      if (existingRows.length > 0) {
        // Update existing subscription
        await db.exec`
          UPDATE push_subscriptions 
          SET p256dh_key = ${params.keys.p256dh}, 
              auth_key = ${params.keys.auth},
              user_agent = ${params.userAgent || null},
              updated_at = CURRENT_TIMESTAMP
          WHERE endpoint = ${params.endpoint}
        `;
      } else {
        // Insert new subscription
        await db.exec`
          INSERT INTO push_subscriptions (endpoint, p256dh_key, auth_key, user_agent, created_at)
          VALUES (${params.endpoint}, ${params.keys.p256dh}, ${params.keys.auth}, ${params.userAgent || null}, CURRENT_TIMESTAMP)
        `;
      }
      
      return { success: true, message: "Successfully subscribed to notifications" };
    } catch (error) {
      console.error("Failed to subscribe to notifications:", error);
      return { success: false, message: "Failed to subscribe to notifications" };
    }
  }
);

// Send push notifications (internal API, not exposed)
export const sendNotification = api(
  { expose: false, method: "POST", path: "/notifications/send" },
  async (params: SendNotificationRequest): Promise<SendNotificationResponse> => {
    try {
      const webpush = await initializeWebPush();
      
      // Get all subscriptions
      const subscriptions = await db.query`
        SELECT endpoint, p256dh_key, auth_key FROM push_subscriptions
      `;
      
      const subscriptionList = [];
      for await (const sub of subscriptions) {
        subscriptionList.push({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key
          }
        });
      }
      
      if (subscriptionList.length === 0) {
        return { success: true, sentCount: 0, failedCount: 0 };
      }
      
      // Prepare notification payload
      const payload = JSON.stringify({
        title: params.title,
        body: params.body,
        icon: params.icon || "/cne-app/icon-192x192.png",
        data: params.data || {},
        tag: params.tag
      });
      
      // Send notifications to all subscribers
      const results = await Promise.allSettled(
        subscriptionList.map(async (subscription) => {
          try {
            await webpush.sendNotification(subscription, payload);
            return { success: true };
          } catch (error) {
            console.error("Failed to send notification to:", subscription.endpoint, error);
            
            // If subscription is no longer valid, remove it
            if ((error as any).statusCode === 410 || (error as any).statusCode === 404) {
              await db.exec`
                DELETE FROM push_subscriptions WHERE endpoint = ${subscription.endpoint}
              `;
            }
            
            return { success: false, error: (error as any).message };
          }
        })
      );
      
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      const failed = results.length - successful;
      const errors = results
        .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
        .map(r => r.status === 'rejected' ? r.reason : r.value.error);
      
      return {
        success: successful > 0,
        sentCount: successful,
        failedCount: failed,
        errors: errors.length > 0 ? errors : undefined
      };
      
    } catch (error) {
      console.error("Failed to send notifications:", error);
      return {
        success: false,
        sentCount: 0,
        failedCount: 0,
        errors: [(error as any).message]
      };
    }
  }
);
