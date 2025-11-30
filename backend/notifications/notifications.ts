import { api } from "encore.dev/api";
import db from "../db";

// VAPID keys - using hardcoded values to avoid Encore secret infrastructure issues
const PUBLIC_VAPID_KEY = 'BFV4AsnDQ4zCK3JwckjWV63mVnsHKbsg5N7mVSv3V0zEtXrpaItfSLj40jiIAIh2hhyONV74l_D1a8qzwR0AD0E';
const PRIVATE_VAPID_KEY = '9xt3gUMOgX98gaY2CcSDd1MmVYhM4s3Lx4kSSfpdpWs';

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

// Initialize VAPID keys dynamically - using hardcoded values
const initializeWebPush = async () => {
  const webpush = await import('web-push');
  
  webpush.setVapidDetails(
    'mailto:contact@centrodenuevaesperanza.org',
    PUBLIC_VAPID_KEY,
    PRIVATE_VAPID_KEY
  );
  
  return webpush;
};

// API Endpoints

// Test endpoint to verify notifications service is working
export const test = api(
  { expose: true, method: "GET", path: "/notifications/test" },
  async () => {
    return { 
      message: "Notifications service is working!",
      timestamp: new Date().toISOString(),
      vapidConfigured: true
    };
  }
);

// Check subscriptions endpoint for debugging
export const checkSubscriptions = api(
  { expose: true, method: "GET", path: "/notifications/subscriptions" },
  async () => {
    const subscriptions = await db.query`
      SELECT endpoint, user_agent, created_at 
      FROM push_subscriptions 
      WHERE created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    return {
      count: subscriptions.length,
      subscriptions: subscriptions.map(sub => ({
        endpoint: sub.endpoint.substring(0, 50) + '...',
        userAgent: sub.user_agent,
        createdAt: sub.created_at
      }))
    };
  }
);

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

// Send notification to all subscribed users
export const sendNotification = api(
  { expose: true, method: "POST", path: "/notifications/send" },
  async (params: SendNotificationRequest): Promise<SendNotificationResponse> => {
    console.log("sendNotification called with:", params);
    
    try {
      // Get all subscriptions from database
      const subscriptions = await db.query`
        SELECT endpoint, p256dh_key, auth_key, user_agent 
        FROM push_subscriptions 
        WHERE created_at > NOW() - INTERVAL '30 days'
      `;
      
      console.log(`Found ${subscriptions.length} subscriptions to notify`);

      if (subscriptions.length === 0) {
        return {
          success: true,
          sentCount: 0,
          failedCount: 0,
          errors: ["No active subscriptions found"]
        };
      }

      // Initialize web-push
      const webpush = await initializeWebPush();
      console.log("WebPush initialized with VAPID keys");

      const results = {
        sentCount: 0,
        failedCount: 0,
        errors: [] as string[]
      };

      // Send to each subscription
      for (const subscription of subscriptions) {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh_key,
              auth: subscription.auth_key
            }
          };

          console.log(`Sending to: ${subscription.endpoint.substring(0, 50)}...`);

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title: params.title,
              body: params.body,
              icon: params.icon || "/cne-app/icon-192x192.png",
              badge: "/cne-app/icon-192x192.png",
              tag: params.tag,
              data: params.data || {},
              actions: [
                {
                  action: 'explore',
                  title: 'Open App',
                  icon: '/cne-app/icon-192x192.png'
                }
              ]
            })
          );

          results.sentCount++;
          console.log(`Successfully sent to: ${subscription.endpoint.substring(0, 50)}...`);
        } catch (error) {
          results.failedCount++;
          const errorMsg = `Failed to send to ${subscription.endpoint.substring(0, 50)}...: ${error}`;
          results.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log(`Notification sending complete: ${results.sentCount} sent, ${results.failedCount} failed`);
      return results;
    } catch (error) {
      console.error("Error in sendNotification:", error);
      throw error;
    }
  }
);
