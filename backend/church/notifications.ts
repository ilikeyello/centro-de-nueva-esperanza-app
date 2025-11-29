import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";
import db from "../db";

// Note: web-push will be imported dynamically when needed

// VAPID keys for push notifications
const publicKey = secret("PUBLIC_VAPID_KEY");
const privateKey = secret("PRIVATE_VAPID_KEY");

// Types
interface NotificationSubscription {
  id?: number;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent?: string;
  created_at: Date;
}

interface SendNotificationRequest {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// Initialize VAPID keys dynamically
const initializeWebPush = async () => {
  const webpush = await import('web-push');
  
  webpush.setVapidDetails(
    'mailto:contact@centrodnuevaesperanza.org',
    publicKey as unknown as string,
    privateKey as unknown as string
  );
  
  return webpush;
};

// API Endpoints

// Subscribe to push notifications
export const subscribe = api(
  { expose: true, method: "POST", path: "/notifications/subscribe" },
  async (params: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }): Promise<{ success: boolean; message: string }> => {
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
              created_at = CURRENT_TIMESTAMP
          WHERE endpoint = ${params.endpoint}
        `;
      } else {
        // Insert new subscription
        await db.exec`
          INSERT INTO push_subscriptions (endpoint, p256dh_key, auth_key, created_at)
          VALUES (${params.endpoint}, ${params.keys.p256dh}, ${params.keys.auth}, CURRENT_TIMESTAMP)
        `;
      }

      console.log('✅ Push subscription saved:', params.endpoint);
      return { success: true, message: "Subscription saved successfully" };
    } catch (error) {
      console.error('❌ Error saving subscription:', error);
      return { success: false, message: `Failed to save subscription: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
);

// Unsubscribe from push notifications
export const unsubscribe = api(
  { expose: true, method: "POST", path: "/notifications/unsubscribe" },
  async (params: { endpoint: string }): Promise<{ success: boolean; message: string }> => {
    try {
      await db.exec`
        DELETE FROM push_subscriptions 
        WHERE endpoint = ${params.endpoint}
      `;

      console.log('✅ Push subscription removed:', params.endpoint);
      return { success: true, message: "Subscription removed successfully" };
    } catch (error) {
      console.error('❌ Error removing subscription:', error);
      return { success: false, message: `Failed to remove subscription: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
);

// Send notification to all subscribers
export const sendToAll = api(
  { expose: true, method: "POST", path: "/notifications/send-all" },
  async (params: SendNotificationRequest): Promise<{ success: boolean; message: string; sent: number; failed: number }> => {
    try {
      const webpush = await initializeWebPush();
      
      // Get all subscriptions
      const subscriptions = await db.query`
        SELECT endpoint, p256dh_key, auth_key 
        FROM push_subscriptions
      `;
      
      const subscriptionRows = [];
      for await (const row of subscriptions) {
        subscriptionRows.push(row);
      }

      let sent = 0;
      let failed = 0;

      for (const sub of subscriptionRows) {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh_key,
              auth: sub.auth_key
            }
          };

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify({
              title: params.title,
              body: params.body,
              icon: params.icon || '/cne-app/icon-192x192.png',
              badge: params.badge || '/cne-app/icon-192x192.png',
              tag: params.tag,
              data: params.data,
              actions: params.actions || [
                {
                  action: 'explore',
                  title: 'Open App',
                  icon: '/cne-app/icon-192x192.png'
                }
              ]
            })
          );

          sent++;
        } catch (error) {
          console.error('❌ Failed to send to', sub.endpoint, ':', error);
          failed++;

          // Remove invalid subscription
          if (error instanceof Error && error.message.includes('410')) {
            await db.exec`
              DELETE FROM push_subscriptions 
              WHERE endpoint = ${sub.endpoint}
            `;
          }
        }
      }

      console.log(`📱 Notification sent: ${sent} success, ${failed} failed`);
      return { 
        success: true, 
        message: `Notification sent to ${sent} subscribers`, 
        sent, 
        failed 
      };
    } catch (error) {
      console.error('❌ Error sending notifications:', error);
      return { 
        success: false, 
        message: `Failed to send notifications: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        sent: 0, 
        failed: 0 
      };
    }
  }
);

// Send notification for news
export const sendNewsNotification = api(
  { expose: true, method: "POST", path: "/notifications/news" },
  async (params: { 
    title: string; 
    body: string; 
    newsId?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return await sendToAll({
      title: params.title,
      body: params.body,
      tag: `news-${params.newsId || Date.now()}`,
      data: { type: 'news', newsId: params.newsId },
      icon: '/cne-app/icon-192x192.png',
      actions: [
        {
          action: 'explore',
          title: 'Read News',
          icon: '/cne-app/icon-192x192.png'
        }
      ]
    });
  }
);

// Send notification for announcements
export const sendAnnouncementNotification = api(
  { expose: true, method: "POST", path: "/notifications/announcement" },
  async (params: { 
    title: string; 
    body: string; 
    announcementId?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return await sendToAll({
      title: params.title,
      body: params.body,
      tag: `announcement-${params.announcementId || Date.now()}`,
      data: { type: 'announcement', announcementId: params.announcementId },
      icon: '/cne-app/icon-192x192.png',
      actions: [
        {
          action: 'explore',
          title: 'View Announcement',
          icon: '/cne-app/icon-192x192.png'
        }
      ]
    });
  }
);

// Send notification for livestream reminder
export const sendLivestreamNotification = api(
  { expose: true, method: "POST", path: "/notifications/livestream" },
  async (params: { 
    title?: string; 
    body?: string; 
    streamTime?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const defaultTitle = "🔴 Livestream Starting Soon!";
    const defaultBody = "Join us for live worship and teaching at Centro de Nueva Esperanza";
    
    return await sendToAll({
      title: params.title || defaultTitle,
      body: params.body || defaultBody,
      tag: `livestream-${params.streamTime || Date.now()}`,
      data: { type: 'livestream', streamTime: params.streamTime },
      icon: '/cne-app/icon-192x192.png',
      actions: [
        {
          action: 'explore',
          title: 'Watch Now',
          icon: '/cne-app/icon-192x192.png'
        }
      ]
    });
  }
);

// Get subscription statistics
export const getStats = api(
  { expose: true, method: "GET", path: "/notifications/stats" },
  async (): Promise<{ 
    totalSubscribers: number; 
    activeSubscriptions: number;
  }> => {
    try {
      const result = await db.query`
        SELECT COUNT(*) as total FROM push_subscriptions
      `;
      
      const rows = [];
      for await (const row of result) {
        rows.push(row);
      }
      
      return {
        totalSubscribers: rows[0].total,
        activeSubscriptions: rows[0].total
      };
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return { totalSubscribers: 0, activeSubscriptions: 0 };
    }
  }
);
