/**
 * Standalone Multi-Church Admin Dashboard
 * Can be embedded at emanuelavina.com to manage all church sites
 * No UI component dependencies - uses plain HTML/CSS
 */

import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

// Types
interface Church {
  id: string;
  name: string;
  clerk_org_id: string;
  domain: string;
}

interface Sermon {
  id: number;
  title: string;
  youtube_url: string;
  created_at: string;
}

interface Event {
  id: number;
  title_en: string;
  title_es: string;
  description_en: string;
  description_es: string;
  event_date: string;
  location: string;
  max_attendees: number;
  created_at: string;
}

interface Announcement {
  id: number;
  title_en: string;
  title_es: string;
  content_en: string;
  content_es: string;
  priority: string;
  image_url: string;
  created_at: string;
}

export function StandaloneAdminDashboard() {
  const [selectedChurch, setSelectedChurch] = useState<string>("");
  const [churches, setChurches] = useState<Church[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sermons");
  
  // Form states
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // New item forms
  const [newSermon, setNewSermon] = useState({ title: "", youtube_url: "" });
  const [newEvent, setNewEvent] = useState({
    title_en: "", title_es: "", description_en: "", description_es: "",
    event_date: "", location: "", max_attendees: 0
  });
  const [newAnnouncement, setNewAnnouncement] = useState({
    title_en: "", title_es: "", content_en: "", content_es: "",
    priority: "normal", image_url: ""
  });

  // Supabase client - configure with your credentials
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://weicxqhipwfboaxmlzei.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY || 'your-service-role-key'
  );

  useEffect(() => {
    loadChurches();
  }, []);

  useEffect(() => {
    if (selectedChurch) {
      loadData();
    }
  }, [selectedChurch]);

  async function loadChurches() {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*');
      
      if (error) throw error;
      setChurches(data || []);
    } catch (error) {
      console.error('Error loading churches:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadData() {
    if (!selectedChurch) return;

    try {
      // Set organization context
      await supabase.rpc('set_organization_id', { p_org_id: selectedChurch });

      // Load all data
      const [sermonsRes, eventsRes, announcementsRes] = await Promise.all([
        supabase.from('sermons').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('event_date', { ascending: true }),
        supabase.from('announcements').select('*').order('priority', { ascending: true })
      ]);

      setSermons(sermonsRes.data || []);
      setEvents(eventsRes.data || []);
      setAnnouncements(announcementsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  // CRUD operations
  async function addSermon() {
    try {
      const { error } = await supabase
        .from('sermons')
        .insert([newSermon]);
      
      if (error) throw error;
      setNewSermon({ title: "", youtube_url: "" });
      loadData();
    } catch (error) {
      console.error('Error adding sermon:', error);
    }
  }

  async function deleteSermon(id: number) {
    try {
      const { error } = await supabase
        .from('sermons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting sermon:', error);
    }
  }

  async function addEvent() {
    try {
      const { error } = await supabase
        .from('events')
        .insert([{
          ...newEvent,
          created_by: 'admin'
        }]);
      
      if (error) throw error;
      setNewEvent({
        title_en: "", title_es: "", description_en: "", description_es: "",
        event_date: "", location: "", max_attendees: 0
      });
      loadData();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  }

  async function deleteEvent(id: number) {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }

  async function addAnnouncement() {
    try {
      const { error } = await supabase
        .from('announcements')
        .insert([{
          ...newAnnouncement,
          created_by: 'admin'
        }]);
      
      if (error) throw error;
      setNewAnnouncement({
        title_en: "", title_es: "", content_en: "", content_es: "",
        priority: "normal", image_url: ""
      });
      loadData();
    } catch (error) {
      console.error('Error adding announcement:', error);
    }
  }

  async function deleteAnnouncement(id: number) {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        Loading churches...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`
        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }
        .admin-title {
          font-size: 2rem;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .church-select {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          background: white;
          min-width: 250px;
        }
        .admin-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 1.5rem;
        }
        .tab-button {
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tab-button.active {
          border-bottom-color: #3b82f6;
          color: #3b82f6;
        }
        .tab-button:hover {
          background: #f9fafb;
        }
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-label {
          font-weight: 500;
          font-size: 0.875rem;
        }
        .form-input, .form-textarea, .form-select {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }
        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        .btn-primary {
          background: #3b82f6;
          color: white;
        }
        .btn-primary:hover {
          background: #2563eb;
        }
        .btn-danger {
          background: #ef4444;
          color: white;
        }
        .btn-danger:hover {
          background: #dc2626;
        }
        .item-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .item-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
        }
        .item-info {
          flex: 1;
        }
        .item-title {
          font-weight: 500;
        }
        .item-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .priority-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }
        .priority-urgent {
          background: #fef2f2;
          color: #dc2626;
        }
        .priority-normal {
          background: #f3f4f6;
          color: #374151;
        }
      `}</style>

      <div className="admin-header">
        <h1 className="admin-title">
          ⛪ Multi-Church Admin Dashboard
        </h1>
        
        <select 
          className="church-select"
          value={selectedChurch} 
          onChange={(e) => setSelectedChurch(e.target.value)}
        >
          <option value="">Select a church</option>
          {churches.map((church) => (
            <option key={church.id} value={church.id}>
              {church.name} ({church.domain})
            </option>
          ))}
        </select>
      </div>

      {selectedChurch && (
        <div className="admin-card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Managing: {churches.find(c => c.id === selectedChurch)?.name}
          </h2>
          
          <div className="tabs">
            <button 
              className={`tab-button ${activeTab === "sermons" ? "active" : ""}`}
              onClick={() => setActiveTab("sermons")}
            >
              📖 Sermons
            </button>
            <button 
              className={`tab-button ${activeTab === "events" ? "active" : ""}`}
              onClick={() => setActiveTab("events")}
            >
              📅 Events
            </button>
            <button 
              className={`tab-button ${activeTab === "announcements" ? "active" : ""}`}
              onClick={() => setActiveTab("announcements")}
            >
              📢 Announcements
            </button>
          </div>

          {activeTab === "sermons" && (
            <div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Sermon Title</label>
                  <input
                    className="form-input"
                    value={newSermon.title}
                    onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                    placeholder="Enter sermon title"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">YouTube URL</label>
                  <input
                    className="form-input"
                    value={newSermon.youtube_url}
                    onChange={(e) => setNewSermon({ ...newSermon, youtube_url: e.target.value })}
                    placeholder="Enter YouTube URL"
                  />
                </div>
              </div>
              <button className="btn btn-primary" onClick={addSermon}>
                ➕ Add Sermon
              </button>

              <div className="item-list" style={{ marginTop: '1.5rem' }}>
                {sermons.map((sermon) => (
                  <div key={sermon.id} className="item-card">
                    <div className="item-info">
                      <p className="item-title">{sermon.title}</p>
                      <p className="item-subtitle">{sermon.youtube_url}</p>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteSermon(sermon.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Title (English)</label>
                  <input
                    className="form-input"
                    value={newEvent.title_en}
                    onChange={(e) => setNewEvent({ ...newEvent, title_en: e.target.value })}
                    placeholder="Event title in English"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Title (Spanish)</label>
                  <input
                    className="form-input"
                    value={newEvent.title_es}
                    onChange={(e) => setNewEvent({ ...newEvent, title_es: e.target.value })}
                    placeholder="Event title in Spanish"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Event Date</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={newEvent.event_date}
                    onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    className="form-input"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="Event location"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description (English)</label>
                  <textarea
                    className="form-textarea"
                    value={newEvent.description_en}
                    onChange={(e) => setNewEvent({ ...newEvent, description_en: e.target.value })}
                    placeholder="Event description in English"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description (Spanish)</label>
                  <textarea
                    className="form-textarea"
                    value={newEvent.description_es}
                    onChange={(e) => setNewEvent({ ...newEvent, description_es: e.target.value })}
                    placeholder="Event description in Spanish"
                  />
                </div>
              </div>
              <button className="btn btn-primary" onClick={addEvent}>
                ➕ Add Event
              </button>

              <div className="item-list" style={{ marginTop: '1.5rem' }}>
                {events.map((event) => (
                  <div key={event.id} className="item-card">
                    <div className="item-info">
                      <p className="item-title">{event.title_en} / {event.title_es}</p>
                      <p className="item-subtitle">
                        {new Date(event.event_date).toLocaleDateString()} at {event.location}
                      </p>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteEvent(event.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "announcements" && (
            <div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Title (English)</label>
                  <input
                    className="form-input"
                    value={newAnnouncement.title_en}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title_en: e.target.value })}
                    placeholder="Announcement title in English"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Title (Spanish)</label>
                  <input
                    className="form-input"
                    value={newAnnouncement.title_es}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title_es: e.target.value })}
                    placeholder="Announcement title in Spanish"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Content (English)</label>
                  <textarea
                    className="form-textarea"
                    value={newAnnouncement.content_en}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content_en: e.target.value })}
                    placeholder="Announcement content in English"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Content (Spanish)</label>
                  <textarea
                    className="form-textarea"
                    value={newAnnouncement.content_es}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content_es: e.target.value })}
                    placeholder="Announcement content in Spanish"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={newAnnouncement.priority}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL (optional)</label>
                  <input
                    className="form-input"
                    value={newAnnouncement.image_url}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, image_url: e.target.value })}
                    placeholder="Image URL"
                  />
                </div>
              </div>
              <button className="btn btn-primary" onClick={addAnnouncement}>
                ➕ Add Announcement
              </button>

              <div className="item-list" style={{ marginTop: '1.5rem' }}>
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="item-card">
                    <div className="item-info">
                      <p className="item-title">{announcement.title_en} / {announcement.title_es}</p>
                      <span className={`priority-badge priority-${announcement.priority === 'urgent' ? 'urgent' : 'normal'}`}>
                        {announcement.priority}
                      </span>
                    </div>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteAnnouncement(announcement.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
