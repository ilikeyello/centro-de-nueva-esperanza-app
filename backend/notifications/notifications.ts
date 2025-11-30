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

// Simple health check endpoint
export const health = api(
  { expose: true, method: "GET", path: "/notifications/health" },
  async () => {
    return { 
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "notifications"
    };
  }
);

// Test endpoint to verify notifications service is working
export const test = api(
  { expose: true, method: "GET", path: "/notifications/test" },
  async () => {
    try {
      // Test VAPID key initialization
      const webpush = await initializeWebPush();
      return { 
        message: "Push notifications service is working!",
        timestamp: new Date().toISOString(),
        vapidConfigured: true,
        webpushLoaded: !!webpush
      };
    } catch (error) {
      return {
        message: "Push notifications service has issues",
        timestamp: new Date().toISOString(),
        vapidConfigured: false,
        error: String(error)
      };
    }
  }
);

// Simple test notification endpoint
export const testNotification = api(
  { expose: true, method: "POST", path: "/notifications/test-send" },
  async () => {
    console.log("Testing notification sending...");
    
    try {
      // Get first subscription for testing
      const subscriptions = [];
      for await (const sub of db.query`
        SELECT endpoint, p256dh_key, auth_key, user_agent 
        FROM push_subscriptions 
        WHERE created_at > NOW() - INTERVAL '30 days'
        LIMIT 1
      `) {
        subscriptions.push(sub);
      }
      
      if (subscriptions.length === 0) {
        return { success: false, message: "No subscriptions found for testing" };
      }
      
      const subscription = subscriptions[0];
      console.log("Testing with subscription:", subscription.endpoint.substring(0, 50));
      
      // Initialize web-push
      const webpush = await initializeWebPush();
      
      // Send test notification
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        },
        JSON.stringify({
          title: "🧪 Test Notification",
          body: "This is a test notification from CNE",
          icon: "/cne-app/icon-192x192.png",
          tag: "test-notification",
          data: { type: "test", timestamp: Date.now() }
        })
      );
      
      return { 
        success: true, 
        message: "Test notification sent successfully",
        endpoint: subscription.endpoint.substring(0, 50) + "..."
      };
    } catch (error) {
      console.error("Test notification failed:", error);
      return { 
        success: false, 
        message: "Test notification failed",
        error: String(error)
      };
    }
  }
);

// Check subscriptions endpoint for debugging
export const checkSubscriptions = api(
  { expose: true, method: "GET", path: "/notifications/subscriptions" },
  async () => {
    const subscriptions = [];
    for await (const sub of db.query`
      SELECT endpoint, user_agent, created_at 
      FROM push_subscriptions 
      WHERE created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 10
    `) {
      subscriptions.push(sub);
    }
    
    return {
      count: subscriptions.length,
      subscriptions: subscriptions.map((sub: any) => ({
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
      
      return { success: true, message: "Successfully subscribed to push notifications" };
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return { success: false, message: "Failed to subscribe to push notifications" };
    }
  }
);

// Simple test notification endpoint (no auth required for testing)
export const testSimpleNotification = api(
  { expose: true, method: "POST", path: "/notifications/test-simple" },
  async () => {
    console.log("🧪 Testing simple notification to iPhone...");
    
    try {
      const result = await sendNotification({
        title: "🧪 Test Notification",
        body: "This is a test to see if iPhone notifications work!",
        icon: "/cne-app/icon-192x192.png",
        tag: `test-${Date.now()}`,
        data: {
          type: "test",
          timestamp: new Date().toISOString()
        }
      });
      
      console.log("🧪 Test notification result:", result);
      return result;
    } catch (error) {
      console.error("🧪 Test notification failed:", error);
      return { 
        success: false, 
        message: "Test notification failed",
        error: String(error)
      };
    }
  }
// Debug endpoint to check subscriptions and test sending
export const debugSubscriptions = api(
  { expose: true, method: "GET", path: "/notifications/debug" },
  async () => {
    console.log("🔍 Debug: Checking subscriptions...");
    
    try {
      // Get all subscriptions from database
      const subscriptions = [];
      for await (const sub of db.query`
        SELECT endpoint, p256dh_key, auth_key, user_agent, created_at 
        FROM push_subscriptions 
        WHERE created_at > NOW() - INTERVAL '30 days'
      `) {
        subscriptions.push({
          endpoint: sub.endpoint.substring(0, 50) + "...",
          userAgent: sub.user_agent,
          hasP256dh: !!sub.p256dh_key,
          hasAuth: !!sub.auth_key,
          createdAt: sub.created_at
        });
      }
      
      console.log(`🔍 Debug: Found ${subscriptions.length} subscriptions`);
      
      // Test VAPID setup
      let vapidStatus = "unknown";
      try {
        const testPayload = JSON.stringify({
          title: "Debug Test",
          body: "Testing VAPID setup"
        });
        vapidStatus = "configured";
      } catch (error) {
        vapidStatus = `error: ${String(error)}`;
      }
      
      return {
        success: true,
        subscriptions,
        subscriptionCount: subscriptions.length,
        vapidStatus,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error("🔍 Debug error:", error);
      return {
        success: false,
        error: String(error),
        subscriptionCount: 0
      };
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
      const subscriptions = [];
      for await (const sub of db.query`
        SELECT endpoint, p256dh_key, auth_key, user_agent 
        FROM push_subscriptions 
        WHERE created_at > NOW() - INTERVAL '30 days'
      `) {
        subscriptions.push(sub);
      }
      
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
      return {
        success: results.sentCount > 0,
        sentCount: results.sentCount,
        failedCount: results.failedCount,
        errors: results.errors.length > 0 ? results.errors : undefined
      };
    } catch (error) {
      console.error("Error in sendNotification:", error);
      throw error;
    }
  }
);
