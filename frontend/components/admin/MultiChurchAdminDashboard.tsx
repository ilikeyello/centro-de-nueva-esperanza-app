/**
 * Multi-Church Admin Dashboard
 * Can be embedded at emanuelavina.com to manage all church sites
 */

import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Edit, Save, X, Church, Calendar, Megaphone, Music, BookOpen } from "lucide-react";

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

export function MultiChurchAdminDashboard() {
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

  // Supabase client (you'll need to configure this)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_KEY!
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
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Church className="w-8 h-8" />
          Multi-Church Admin Dashboard
        </h1>
        
        <Select value={selectedChurch} onValueChange={setSelectedChurch}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a church" />
          </SelectTrigger>
          <SelectContent>
            {churches.map((church) => (
              <SelectItem key={church.id} value={church.id}>
                {church.name} ({church.domain})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedChurch && (
        <Card>
          <CardHeader>
            <CardTitle>
              Managing: {churches.find(c => c.id === selectedChurch)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sermons" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Sermons
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="announcements" className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4" />
                  Announcements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sermons" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sermon-title">Sermon Title</Label>
                    <Input
                      id="sermon-title"
                      value={newSermon.title}
                      onChange={(e) => setNewSermon({ ...newSermon, title: e.target.value })}
                      placeholder="Enter sermon title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sermon-url">YouTube URL</Label>
                    <Input
                      id="sermon-url"
                      value={newSermon.youtube_url}
                      onChange={(e) => setNewSermon({ ...newSermon, youtube_url: e.target.value })}
                      placeholder="Enter YouTube URL"
                    />
                  </div>
                </div>
                <Button onClick={addSermon} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Sermon
                </Button>

                <div className="space-y-2">
                  {sermons.map((sermon) => (
                    <div key={sermon.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{sermon.title}</p>
                        <p className="text-sm text-gray-500">{sermon.youtube_url}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteSermon(sermon.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title-en">Title (English)</Label>
                    <Input
                      id="event-title-en"
                      value={newEvent.title_en}
                      onChange={(e) => setNewEvent({ ...newEvent, title_en: e.target.value })}
                      placeholder="Event title in English"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-title-es">Title (Spanish)</Label>
                    <Input
                      id="event-title-es"
                      value={newEvent.title_es}
                      onChange={(e) => setNewEvent({ ...newEvent, title_es: e.target.value })}
                      placeholder="Event title in Spanish"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-date">Event Date</Label>
                    <Input
                      id="event-date"
                      type="datetime-local"
                      value={newEvent.event_date}
                      onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-location">Location</Label>
                    <Input
                      id="event-location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="Event location"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="event-desc-en">Description (English)</Label>
                    <Textarea
                      id="event-desc-en"
                      value={newEvent.description_en}
                      onChange={(e) => setNewEvent({ ...newEvent, description_en: e.target.value })}
                      placeholder="Event description in English"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="event-desc-es">Description (Spanish)</Label>
                    <Textarea
                      id="event-desc-es"
                      value={newEvent.description_es}
                      onChange={(e) => setNewEvent({ ...newEvent, description_es: e.target.value })}
                      placeholder="Event description in Spanish"
                    />
                  </div>
                </div>
                <Button onClick={addEvent} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Event
                </Button>

                <div className="space-y-2">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{event.title_en} / {event.title_es}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(event.event_date).toLocaleDateString()} at {event.location}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="announcements" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ann-title-en">Title (English)</Label>
                    <Input
                      id="ann-title-en"
                      value={newAnnouncement.title_en}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title_en: e.target.value })}
                      placeholder="Announcement title in English"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ann-title-es">Title (Spanish)</Label>
                    <Input
                      id="ann-title-es"
                      value={newAnnouncement.title_es}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title_es: e.target.value })}
                      placeholder="Announcement title in Spanish"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ann-content-en">Content (English)</Label>
                    <Textarea
                      id="ann-content-en"
                      value={newAnnouncement.content_en}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content_en: e.target.value })}
                      placeholder="Announcement content in English"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ann-content-es">Content (Spanish)</Label>
                    <Textarea
                      id="ann-content-es"
                      value={newAnnouncement.content_es}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content_es: e.target.value })}
                      placeholder="Announcement content in Spanish"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ann-priority">Priority</Label>
                    <Select value={newAnnouncement.priority} onValueChange={(value) => setNewAnnouncement({ ...newAnnouncement, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ann-image">Image URL (optional)</Label>
                    <Input
                      id="ann-image"
                      value={newAnnouncement.image_url}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, image_url: e.target.value })}
                      placeholder="Image URL"
                    />
                  </div>
                </div>
                <Button onClick={addAnnouncement} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Announcement
                </Button>

                <div className="space-y-2">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{announcement.title_en} / {announcement.title_es}</p>
                        <Badge variant={announcement.priority === 'urgent' ? 'destructive' : 'secondary'}>
                          {announcement.priority}
                        </Badge>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
