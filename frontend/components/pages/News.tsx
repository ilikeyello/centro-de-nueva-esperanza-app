import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Users, Plus, AlertCircle, Info, AlertTriangle, Bell, Trash2 } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import type { Announcement, Event } from "../../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useLanguage } from "../../contexts/LanguageContext";
import { BlogPost } from "../BlogPost";

const API_BASE =
  import.meta.env.VITE_CLIENT_TARGET ??
  (import.meta.env.DEV ? "http://localhost:4000" : "https://prod-cne-sh82.encr.app");

const RSVP_PARTICIPANT_ID_KEY = "cne-event-participant-id";
const RSVP_EVENTS_KEY = "cne-rsvped-event-ids";
const RSVP_NAME_KEY = "cne-rsvp-name";
const NEWS_DEFAULT_TAB_KEY = "cne-news-default-tab";

const postEventRsvp = async (data: {
  eventId: number;
  attendees: number;
  participantId?: string | null;
  name?: string | null;
}) => {
  const response = await fetch(`${API_BASE}/events/${data.eventId}/rsvp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      attendees: data.attendees,
      participantId: data.participantId ?? null,
      name: data.name ?? null,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to submit RSVP");
  }

  return response.json();
};

export function News() {
  const backend = useBackend();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  type Priority = "normal" | "urgent";
  const priorityOptions: Priority[] = ["normal", "urgent"];
  const normalizePriority = (value: string): Priority =>
    priorityOptions.includes(value as Priority) ? (value as Priority) : "normal";
  const [priority, setPriority] = useState<Priority>("normal");
  const [announcementPasscode, setAnnouncementPasscode] = useState("");
  const [eventPasscode, setEventPasscode] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [deletePasscode, setDeletePasscode] = useState("");
  const [eventDeleteDialogOpen, setEventDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [eventDeletePasscode, setEventDeletePasscode] = useState("");

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rsvpParticipantId, setRsvpParticipantId] = useState<string | null>(null);
  const [rsvpedEventIds, setRsvpedEventIds] = useState<Set<number>>(() => new Set());
  const [rsvpName, setRsvpName] = useState("");
  const [activeTab, setActiveTab] = useState<"announcements" | "events">(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;

      // Allow deep links from notifications to control the default tab
      if (hash === "#news-events") {
        return "events";
      }
      if (hash === "#news-announcements" || hash === "#news") {
        return "announcements";
      }

      const stored = window.localStorage.getItem(NEWS_DEFAULT_TAB_KEY);
      if (stored === "announcements" || stored === "events") {
        return stored;
      }
    }
    return "announcements";
  });

  const { data: announcementsData } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => backend.listAnnouncements({ limit: 50 }),
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let storedId = window.localStorage.getItem(RSVP_PARTICIPANT_ID_KEY);
    if (!storedId) {
      storedId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      window.localStorage.setItem(RSVP_PARTICIPANT_ID_KEY, storedId);
    }
    setRsvpParticipantId(storedId);

    const storedRsvps = window.localStorage.getItem(RSVP_EVENTS_KEY);
    if (storedRsvps) {
      try {
        const parsed = JSON.parse(storedRsvps) as number[];
        setRsvpedEventIds(new Set(parsed));
      } catch (error) {
        console.error("Failed to parse RSVP data", error);
      }
    }

    const storedName = window.localStorage.getItem(RSVP_NAME_KEY);
    if (storedName) {
      setRsvpName(storedName);
    }

    window.localStorage.removeItem(NEWS_DEFAULT_TAB_KEY);
  }, []);

  const ensureParticipantId = () => {
    if (rsvpParticipantId) return rsvpParticipantId;
    if (typeof window === "undefined") return null;

    let storedId = window.localStorage.getItem(RSVP_PARTICIPANT_ID_KEY);
    if (!storedId) {
      storedId = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      window.localStorage.setItem(RSVP_PARTICIPANT_ID_KEY, storedId);
    }
    setRsvpParticipantId(storedId);
    return storedId;
  };

  const deleteEvent = useMutation({
    mutationFn: async (data: { id: number; passcode: string }) =>
      backend.deleteEvent(data.id),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["events"], (oldData?: { events: Event[] }) => {
        if (!oldData) return oldData;
        return {
          events: oldData.events.filter((item) => item.id !== variables.id),
        };
      });
      toast({
        title: t("Success", "Éxito"),
        description: t("Event deleted", "Evento eliminado"),
      });
      setEventDeleteDialogOpen(false);
      setEventToDelete(null);
      setEventDeletePasscode("");
    },
    onError: (error) => {
      console.error(error);
      const message = (error as Error)?.message?.includes("permission")
        ? t("Incorrect passcode. Please try again.", "Código incorrecto. Inténtalo de nuevo.")
        : t("Failed to delete event", "Error al eliminar el evento");
      toast({
        title: t("Error", "Error"),
        description: message,
        variant: "destructive",
      });
    },
  });

  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () => backend.listEvents({ upcoming: false }),
  });

  const upcomingEvents = useMemo(() => {
    if (!eventsData?.events) return [] as Event[];
    const now = Date.now();
    return [...eventsData.events]
      .filter((eventItem) => new Date(eventItem.eventDate).getTime() >= now)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  }, [eventsData]);

  const createAnnouncement = useMutation({
    mutationFn: async (data: {
      titleEn: string;
      titleEs: string;
      contentEn: string;
      contentEs: string;
      priority: Priority;
      passcode: string;
      imageUrl?: string | null;
    }) => backend.createAnnouncement({
      titleEn: data.titleEn,
      titleEs: data.titleEs,
      contentEn: data.contentEn,
      contentEs: data.contentEs,
      priority: data.priority,
    }) as any,
    onSuccess: (newAnnouncement) => {
      queryClient.setQueryData(["announcements"], (oldData?: { announcements: Announcement[] }) => {
        if (!oldData) {
          return { announcements: [newAnnouncement] };
        }
        const existing = oldData.announcements.filter((item) => item.id !== newAnnouncement.id);
        return {
          announcements: [newAnnouncement, ...existing],
        };
      });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setAnnouncementDialogOpen(false);
      setPriority("normal");
      setAnnouncementPasscode("");
      toast({
        title: t("Success", "Éxito"),
        description: t("Announcement created successfully", "Anuncio creado exitosamente"),
      });
    },
    onError: (error) => {
      console.error(error);
      const message = (error as Error)?.message?.includes("permission")
        ? t("Incorrect passcode. Please try again.", "Código incorrecto. Inténtalo de nuevo.")
        : t("Failed to create announcement", "Error al crear anuncio");
      toast({
        title: t("Error", "Error"),
        description: message,
        variant: "destructive",
      });
    },
  });

  const createEvent = useMutation({
    mutationFn: async (data: {
      titleEn: string;
      titleEs: string;
      descriptionEn: string;
      descriptionEs: string;
      eventDate: string;
      location: string;
      maxAttendees: number;
      passcode: string;
    }) => backend.createEvent({
      titleEn: data.titleEn,
      titleEs: data.titleEs,
      descriptionEn: data.descriptionEn,
      descriptionEs: data.descriptionEs,
      eventDate: data.eventDate,
      location: data.location,
      maxAttendees: data.maxAttendees,
    }) as any,
    onSuccess: (newEvent) => {
      queryClient.setQueryData(["events"], (oldData?: { events: Event[] }) => {
        const existing = oldData?.events ?? [];
        const filtered = existing.filter((eventItem) => eventItem.id !== newEvent.id);
        const combined = [...filtered, newEvent].sort(
          (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
        );
        return { events: combined };
      });
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setEventDialogOpen(false);
      setEventPasscode("");
      toast({
        title: t("Success", "Éxito"),
        description: t("Event created successfully", "Evento creado exitosamente"),
      });
    },
    onError: (error) => {
      console.error(error);
      const message = (error as Error)?.message?.includes("permission")
        ? t("Incorrect passcode. Please try again.", "Código incorrecto. Inténtalo de nuevo.")
        : t("Failed to create event", "Error al crear evento");
      toast({
        title: t("Error", "Error"),
        description: message,
        variant: "destructive",
      });
    },
  });

  const rsvpForEvent = useMutation({
    mutationFn: postEventRsvp,
    onSuccess: (_, variables) => {
      setRsvpedEventIds((previous) => {
        const updated = new Set(previous);
        updated.add(variables.eventId);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(RSVP_EVENTS_KEY, JSON.stringify(Array.from(updated)));
        }
        return updated;
      });

      queryClient.invalidateQueries({ queryKey: ["events"] });
      setRsvpDialogOpen(false);
      if (variables.name) {
        window.localStorage.setItem(RSVP_NAME_KEY, variables.name);
        setRsvpName(variables.name);
      }
      toast({
        title: t("Success", "Éxito"),
        description: t("RSVP submitted successfully", "RSVP enviado exitosamente"),
      });
    },
    onError: (error: Error) => {
      console.error(error);
      toast({
        title: t("Error", "Error"),
        description: error.message || t("Failed to submit RSVP", "Error al enviar RSVP"),
        variant: "destructive",
      });
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (data: { id: number; passcode: string }) =>
      backend.deleteAnnouncement(data.id),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["announcements"], (oldData?: { announcements: Announcement[] }) => {
        if (!oldData) return oldData;
        return {
          announcements: oldData.announcements.filter((item) => item.id !== variables.id),
        };
      });
      toast({
        title: t("Success", "Éxito"),
        description: t("Announcement deleted", "Anuncio eliminado"),
      });
      setDeleteDialogOpen(false);
      setAnnouncementToDelete(null);
      setDeletePasscode("");
    },
    onError: (error) => {
      console.error(error);
      const message = (error as Error)?.message?.includes("permission")
        ? t("Incorrect passcode. Please try again.", "Código incorrecto. Inténtalo de nuevo.")
        : t("Failed to delete announcement", "Error al eliminar el anuncio");
      toast({
        title: t("Error", "Error"),
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleCreateAnnouncement = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createAnnouncement.mutate({
      titleEn: formData.get("titleEn") as string,
      titleEs: formData.get("titleEs") as string,
      contentEn: formData.get("contentEn") as string,
      contentEs: formData.get("contentEs") as string,
      priority,
      passcode: announcementPasscode,
      imageUrl: (formData.get("imageUrl") as string) || "",
    });
  };

  const handleCreateEvent = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createEvent.mutate({
      titleEn: formData.get("titleEn") as string,
      titleEs: formData.get("titleEs") as string,
      descriptionEn: formData.get("descriptionEn") as string,
      descriptionEs: formData.get("descriptionEs") as string,
      eventDate: formData.get("eventDate") as string,
      location: formData.get("location") as string,
      maxAttendees: parseInt(formData.get("maxAttendees") as string) || 0,
      passcode: eventPasscode,
    });
  };

  const handleRsvp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEvent) return;
    const formData = new FormData(e.currentTarget);
    rsvpForEvent.mutate({
      eventId: selectedEvent.id,
      attendees: parseInt(formData.get("attendees") as string) || 1,
      participantId: ensureParticipantId(),
      name: rsvpName.trim().length > 0 ? rsvpName.trim() : null,
    });
  };

  const handleDeleteAnnouncement = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!announcementToDelete) return;
    deleteAnnouncement.mutate({ id: announcementToDelete.id, passcode: deletePasscode });
  };

  const handleDeleteEvent = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eventToDelete) return;
    deleteEvent.mutate({ id: eventToDelete.id, passcode: eventDeletePasscode });
  };

  const getPriorityIcon = (priorityLevel: Priority) => {
    switch (priorityLevel) {
      case "urgent":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "normal":
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityColor = (priorityLevel: Priority) => {
    switch (priorityLevel) {
      case "urgent":
        return "border-orange-600 bg-orange-950/30";
      case "normal":
      default:
        return "border-[--border-color] bg-surface/50";
    }
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[--ink-dark]">
              {activeTab === "announcements"
                ? t("News & Announcements", "Noticias y Anuncios")
                : t("Upcoming Events", "Próximos Eventos")}
            </h1>
          </div>
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
            <div className="flex w-full items-center gap-2 overflow-hidden rounded-lg border-2 border-[--border-color] bg-surface p-1 md:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("announcements")}
                style={activeTab === "announcements" ? { backgroundColor: "var(--sage)", color: "white", borderBottomColor: "var(--sage)" } : {}}
                className={cn(
                  "flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all text-center md:flex-none border-b-4",
                  activeTab === "announcements"
                    ? "shadow-md"
                    : "text-[--ink-mid] hover:text-[--sage] hover:bg-[--background] border-b-transparent"
                )}
              >
                {t("Announcements", "Anuncios")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("events")}
                style={activeTab === "events" ? { backgroundColor: "var(--sage)", color: "white", borderBottomColor: "var(--sage)" } : {}}
                className={cn(
                  "flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-all text-center md:flex-none border-b-4",
                  activeTab === "events"
                    ? "shadow-md"
                    : "text-[--ink-mid] hover:text-[--sage] hover:bg-[--background] border-b-transparent"
                )}
              >
                {t("Events", "Eventos")}
              </button>
            </div>
          </div>
        </div>

        {activeTab === "announcements" ? (
          <>
            <div className="space-y-6">
              {announcementsData?.announcements.map((announcement: Announcement) => (
                <div key={announcement.id} className="relative group">
                  <BlogPost
                    id={announcement.id}
                    titleEn={announcement.titleEn}
                    titleEs={announcement.titleEs}
                    contentEn={announcement.contentEn}
                    contentEs={announcement.contentEs}
                    imageUrl={announcement.imageUrl}
                    date={announcement.createdAt}
                    type="announcement"
                    priority={announcement.priority}
                  />
                </div>
              ))}
            </div>

            <Dialog
              open={deleteDialogOpen}
              onOpenChange={(open) => {
                setDeleteDialogOpen(open);
                if (!open) {
                  setAnnouncementToDelete(null);
                  setDeletePasscode("");
                }
              }}
            >
              <DialogContent className="border-[--border-color] bg-surface">
                <DialogHeader>
                  <DialogTitle className="text-[--ink-dark]">
                    {t("Delete Announcement", "Eliminar Anuncio")}
                  </DialogTitle>
                  <p className="text-sm text-[--ink-light]">
                    {t(
                      "Enter the passcode to permanently delete this announcement.",
                      "Ingresa el código para eliminar este anuncio permanentemente."
                    )}
                  </p>
                </DialogHeader>
                <form onSubmit={handleDeleteAnnouncement} className="space-y-4">
                  <div>
                    <Label htmlFor="deletePasscode" className="text-[--ink-mid]">
                      {t("Passcode", "Código")}
                    </Label>
                    <Input
                      id="deletePasscode"
                      type="password"
                      value={deletePasscode}
                      onChange={(event) => setDeletePasscode(event.target.value)}
                      required
                      className="border-[--border-color] bg-[--surface-mid] text-[--ink-dark]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDeleteDialogOpen(false);
                        setAnnouncementToDelete(null);
                        setDeletePasscode("");
                      }}
                      className="border-[--border-color] bg-surface text-[--ink-mid] hover:bg-[--surface-mid]"
                    >
                      {t("Cancel", "Cancelar")}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[--sage] text-[--ink-dark] hover:bg-[--sage-mid]"
                      disabled={deleteAnnouncement.isPending || deletePasscode.trim().length === 0}
                    >
                      {deleteAnnouncement.isPending ? t("Deleting...", "Eliminando...") : t("Delete", "Eliminar")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <>
            <div className="space-y-6">
              {upcomingEvents.map((eventItem) => (
                <div key={eventItem.id} className="relative group">
                  <BlogPost
                    id={eventItem.id}
                    titleEn={eventItem.titleEn}
                    titleEs={eventItem.titleEs}
                    contentEn={eventItem.descriptionEn || ''}
                    contentEs={eventItem.descriptionEs || ''}
                    date={eventItem.createdAt}
                    location={eventItem.location}
                    type="event"
                    eventDate={eventItem.eventDate}
                    maxAttendees={eventItem.maxAttendees || 0}
                    rsvpCount={eventItem.rsvpCount || 0}
                    actions={
                      <>
                        <Button
                          onClick={() => {
                            setSelectedEvent(eventItem as any);
                            setRsvpDialogOpen(true);
                          }}
                          disabled={rsvpedEventIds.has(eventItem.id)}
                          className={cn(
                            rsvpedEventIds.has(eventItem.id)
                              ? "bg-[--surface-mid] text-[--ink-mid] hover:bg-[--surface-mid] border-2 border-[--surface-mid]"
                              : "warm-button-primary border-2 border-[--sage] !text-white"
                          )}
                        >
                          {rsvpedEventIds.has(eventItem.id)
                            ? t("You're attending", "Ya confirmaste")
                            : t("RSVP", "Confirmar Asistencia")}
                        </Button>
                      </>
                    }
                  />
                </div>
              ))}
            </div>

            {upcomingEvents.length === 0 && (
              <p className="text-sm text-[--ink-light]">
                {t("No upcoming events yet. Create one to get started!", "No hay eventos próximos. ¡Crea uno para comenzar!")}
              </p>
            )}

            <Dialog open={rsvpDialogOpen} onOpenChange={setRsvpDialogOpen}>
              <DialogContent className="border-[--border-color] bg-surface">
                <DialogHeader>
                  <DialogTitle className="text-[--ink-dark]">
                    {t("RSVP for Event", "Confirmar Asistencia al Evento")}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRsvp} className="space-y-4">
                  <div>
                    <Label htmlFor="attendee-name" className="text-[--ink-mid]">
                      {t("Your name", "Tu nombre")}
                    </Label>
                    <Input
                      id="attendee-name"
                      value={rsvpName}
                      onChange={(event) => setRsvpName(event.target.value)}
                      placeholder={t("Optional", "Opcional")}
                      className="border-[--border-color] bg-[--surface-mid] text-[--ink-dark]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="attendees" className="text-[--ink-mid]">
                      {t("Number of Attendees", "Número de Asistentes")}
                    </Label>
                    <Input
                      id="attendees"
                      name="attendees"
                      type="number"
                      min="1"
                      defaultValue="1"
                      required
                      className="border-[--border-color] bg-[--surface-mid] text-[--ink-dark]"
                    />
                  </div>
                  <Button type="submit" className="w-full warm-button-primary border-2 border-[--sage] !text-white">
                    {t("Confirm RSVP", "Confirmar Asistencia")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      <Dialog
        open={eventDeleteDialogOpen}
        onOpenChange={(open) => {
          setEventDeleteDialogOpen(open);
          if (!open) {
            setEventToDelete(null);
            setEventDeletePasscode("");
          }
        }}
      >
        <DialogContent className="border-[--border-color] bg-surface">
          <DialogHeader>
            <DialogTitle className="text-[--ink-dark]">
              {t("Delete Event", "Eliminar Evento")}
            </DialogTitle>
            <p className="text-sm text-[--ink-light]">
              {t(
                "Enter the passcode to permanently delete this event.",
                "Ingresa el código para eliminar este evento permanentemente."
              )}
            </p>
          </DialogHeader>
          <form onSubmit={handleDeleteEvent} className="space-y-4">
            <div>
              <Label htmlFor="eventDeletePasscode" className="text-[--ink-mid]">
                {t("Passcode", "Código")}
              </Label>
              <Input
                id="eventDeletePasscode"
                type="password"
                value={eventDeletePasscode}
                onChange={(event) => setEventDeletePasscode(event.target.value)}
                required
                className="border-[--border-color] bg-[--surface-mid] text-[--ink-dark]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEventDeleteDialogOpen(false);
                  setEventToDelete(null);
                  setEventDeletePasscode("");
                }}
                className="border-[--border-color] bg-surface text-[--ink-mid] hover:bg-[--surface-mid]"
              >
                {t("Cancel", "Cancelar")}
              </Button>
              <Button
                type="submit"
                className="bg-[--sage] text-[--ink-dark] hover:bg-[--sage-mid]"
                disabled={deleteEvent.isPending || eventDeletePasscode.trim().length === 0}
              >
                {deleteEvent.isPending ? t("Deleting...", "Eliminando...") : t("Delete", "Eliminar")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
