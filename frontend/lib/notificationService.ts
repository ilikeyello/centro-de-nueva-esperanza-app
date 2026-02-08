import { useBackend } from '../hooks/useBackend';
import { useLanguage } from '../contexts/LanguageContext';

interface NotificationContent {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

class NotificationService {
  private backend: ReturnType<typeof useBackend>;
  private t: ReturnType<typeof useLanguage>['t'];
  private lastCheck: Record<string, string> = {};
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(backend: ReturnType<typeof useBackend>, t: ReturnType<typeof useLanguage>['t']) {
    this.backend = backend;
    this.t = t;
    this.loadLastCheck();
  }

  private loadLastCheck() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cne:lastNotificationCheck');
      if (stored) {
        this.lastCheck = JSON.parse(stored);
      }
    }
  }

  private saveLastCheck() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cne:lastNotificationCheck', JSON.stringify(this.lastCheck));
    }
  }

  private async sendNotification(content: NotificationContent) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Check if user has push subscription
        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return;

        // Send notification via service worker
        registration.showNotification(content.title, {
          body: content.body,
          icon: content.icon || '/icon-192x192.png',
          tag: content.tag,
          data: content.data,
          requireInteraction: true
        });
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  }

  async checkAnnouncements() {
    try {
      const { announcements } = await this.backend.listAnnouncements({ limit: 10 });
      const latest = announcements[0];
      
      if (latest && latest.createdAt) {
        const key = 'announcements';
        const lastTime = this.lastCheck[key] || '0';
        
        if (latest.createdAt > lastTime) {
          await this.sendNotification({
            title: this.t('New Announcement', 'Nuevo Anuncio'),
            body: latest.titleEn || latest.title || '',
            tag: 'announcement',
            data: { type: 'announcement', id: latest.id }
          });
          this.lastCheck[key] = latest.createdAt;
          this.saveLastCheck();
        }
      }
    } catch (error) {
      console.error('Error checking announcements:', error);
    }
  }

  async checkEvents() {
    try {
      const { events } = await this.backend.listEvents({ upcoming: true });
      const latest = events[0];
      
      if (latest && latest.createdAt) {
        const key = 'events';
        const lastTime = this.lastCheck[key] || '0';
        
        if (latest.createdAt > lastTime) {
          const title = latest.titleEn || latest.title || '';
          const date = new Date(latest.eventDate).toLocaleDateString();
          
          await this.sendNotification({
            title: this.t('New Event', 'Nuevo Evento'),
            body: `${title} - ${date}`,
            tag: 'event',
            data: { type: 'event', id: latest.id }
          });
          this.lastCheck[key] = latest.createdAt;
          this.saveLastCheck();
        }
      }
    } catch (error) {
      console.error('Error checking events:', error);
    }
  }

  async checkLivestream() {
    try {
      const livestream = await this.backend.getLivestream();
      const active = livestream && livestream.isLive ? livestream : null;
      
      if (active) {
        const key = 'livestream';
        const lastTime = this.lastCheck[key] || '0';
        const now = new Date().toISOString();
        
        // For livestreams, we'll trigger notification when it goes live
        // Use a timestamp-based check to avoid spam
        if (now > lastTime) {
          await this.sendNotification({
            title: this.t('Livestream Live!', '¡Transmisión en Vivo!'),
            body: this.t('Join us for live worship', 'Únete a nosotros para adorar en vivo'),
            tag: 'livestream',
            data: { type: 'livestream', url: active.url }
          });
          this.lastCheck[key] = now;
          this.saveLastCheck();
        }
      }
    } catch (error) {
      console.error('Error checking livestream:', error);
    }
  }

  async checkDevotionals() {
    try {
      // Devotionals are stored as 'sermon' type in church_content
      const { getSermonsFromMainSite } = await import('./mainSiteData');
      const sermons = await getSermonsFromMainSite();
      const latest = sermons[0];
      
      if (latest && latest.createdAt) {
        const key = 'devotionals';
        const lastTime = this.lastCheck[key] || '0';
        
        if (latest.createdAt > lastTime) {
          await this.sendNotification({
            title: this.t('New Devotional', 'Nuevo Devocional'),
            body: latest.title,
            tag: 'devotional',
            data: { type: 'devotional', id: latest.id }
          });
          this.lastCheck[key] = latest.createdAt;
          this.saveLastCheck();
        }
      }
    } catch (error) {
      console.error('Error checking devotionals:', error);
    }
  }

  startPeriodicCheck(intervalMinutes: number = 5) {
    // Clear existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check immediately
    this.checkAllNotifications();

    // Set up periodic checking
    this.checkInterval = setInterval(() => {
      this.checkAllNotifications();
    }, intervalMinutes * 60 * 1000);
  }

  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async checkAllNotifications() {
    await Promise.all([
      this.checkAnnouncements(),
      this.checkEvents(),
      this.checkLivestream(),
      this.checkDevotionals()
    ]);
  }
}

export default NotificationService;
