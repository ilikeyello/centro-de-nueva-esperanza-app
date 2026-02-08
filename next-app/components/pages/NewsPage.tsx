"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Users, Plus, AlertTriangle, Bell, Trash2 } from "lucide-react";
import { useBackend } from "@/hooks/useBackend";
import type { Announcement, Event } from "@/hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

const RSVP_PARTICIPANT_ID_KEY = "cne-event-participant-id";
const RSVP_EVENTS_KEY = "cne-rsvped-event-ids";
const RSVP_NAME_KEY = "cne-rsvp-name";
const NEWS_DEFAULT_TAB_KEY = "cne-news-default-tab";

export function NewsPage() {
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

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [rsvpDialogOpen, setRsvpDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rsvpParticipantId, setRsvpParticipantId] = useState<string | null>(null);
  const [rsvpedEventIds, setRsvpedEventIds] = useState<Set<number>>(() => new Set());
  const [rsvpName, setRsvpName] = useState("");
  const [activeTab, setActiveTab] = useState<"announcements" | "events">(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#news-events") return "events";
      if (hash === "#news-announcements" || hash === "#news") return "announcements";

      const stored = window.localStorage.getItem(NEWS_DEFAULT_TAB_KEY);
      if (stored === "announcements" || stored === "events") return stored;
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
      } catch {
        // ignore
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
    mutationFn: async (_data: {
      titleEn: string;
      titleEs: string;
      contentEn: string;
      contentEs: string;
      priority: Priority;
      passcode: string;
      imageUrl?: string | null;
    }) => Promise.reject(new Error("Announcement creation not implemented")),
    onSuccess: () => {
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
      toast({
        title: t("Error", "Error"),
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const createEvent = useMutation({
    mutationFn: async (_data: {
      titleEn: string;
      titleEs: string;
      descriptionEn: string;
      descriptionEs: string;
      eventDate: string;
      location: string;
      maxAttendees: number;
      passcode: string;
    }) => Promise.reject(new Error("Event creation not implemented")),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setEventDialogOpen(false);
      setEventPasscode("");
      toast({
        title: t("Success", "Éxito"),
        description: t("Event created successfully", "Evento creado exitosamente"),
      });
    },
    onError: (error) => {
      toast({
        title: t("Error", "Error"),
        description: (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const rsvpForEvent = useMutation({
    mutationFn: async (_data: {
      eventId: number;
      attendees: number;
      participantId?: string | null;
      name?: string | null;
    }) => Promise.reject(new Error("RSVP not implemented")),
    onSuccess: (_data, variables) => {
      setRsvpedEventIds((previous) => {
        const updated = new Set(previous);
        updated.add(variables.eventId);
        try {
          window.localStorage.setItem(RSVP_EVENTS_KEY, JSON.stringify(Array.from(updated)));
        } catch {
          // ignore
        }
        return updated;
      });

      queryClient.invalidateQueries({ queryKey: ["events"] });
      setRsvpDialogOpen(false);
      if (variables.name) {
        try {
          window.localStorage.setItem(RSVP_NAME_KEY, variables.name);
        } catch {
          // ignore
        }
        setRsvpName(variables.name);
      }
      toast({
        title: t("Success", "Éxito"),
        description: t("RSVP submitted successfully", "RSVP enviado exitosamente"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("Error", "Error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (_data: { id: number; passcode: string }) => Promise.reject(new Error("Delete not implemented")),
    onSuccess: (_data, variables) => {
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
      toast({
        title: t("Error", "Error"),
        description: (error as Error).message,
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
        return "border-neutral-700 bg-neutral-900/50";
    }
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {activeTab === "announcements"
                ? t("News & Announcements", "Noticias y Anuncios")
                : t("Upcoming Events", "Próximos Eventos")}
            </h1>
          </div>
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
            <div className="flex w-full items-center gap-2 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/60 p-1 md:w-auto">
              <button
                type="button"
                onClick={() => setActiveTab("announcements")}
                className={cn(
                  "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors text-center md:flex-none",
                  activeTab === "announcements" ? "bg-red-600 text-white" : "text-neutral-300 hover:text-white"
                )}
              >
                {t("Announcements", "Anuncios")}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("events")}
                className={cn(
                  "flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors text-center md:flex-none",
                  activeTab === "events" ? "bg-red-600 text-white" : "text-neutral-300 hover:text-white"
                )}
              >
                {t("Events", "Eventos")}
              </button>
            </div>
            {activeTab === "announcements" ? (
              <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    className="h-10 w-10 bg-red-600 hover:bg-red-700"
                    aria-label={t("Create a new announcement", "Crear un nuevo anuncio")}
                    onClick={() => setAnnouncementDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">{t("Create a new announcement", "Crear un nuevo anuncio")}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-neutral-800 bg-neutral-900">
                  <DialogHeader>
                    <DialogTitle className="text-white">{t("Create Announcement", "Crear Anuncio")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <div>
                      <Label htmlFor="titleEn" className="text-neutral-200">{t("Title (English)", "Título (Inglés)")}</Label>
                      <Input id="titleEn" name="titleEn" required className="border-neutral-700 bg-neutral-800 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="titleEs" className="text-neutral-200">{t("Title (Spanish)", "Título (Español)")}</Label>
                      <Input id="titleEs" name="titleEs" required className="border-neutral-700 bg-neutral-800 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="contentEn" className="text-neutral-200">{t("Content (English)", "Contenido (Inglés)")}</Label>
                      <Textarea id="contentEn" name="contentEn" required className="border-neutral-700 bg-neutral-800 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="contentEs" className="text-neutral-200">{t("Content (Spanish)", "Contenido (Español)")}</Label>
                      <Textarea id="contentEs" name="contentEs" required className="border-neutral-700 bg-neutral-800 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl" className="text-neutral-200">{t("Image URL (optional)", "URL de imagen (opcional)")}</Label>
                      <Input id="imageUrl" name="imageUrl" className="border-neutral-700 bg-neutral-800 text-white" />
                    </div>
                    <div>
                      <Label className="text-neutral-200">{t("Priority", "Prioridad")}</Label>
                      <Select value={priority} onValueChange={(value) => setPriority(normalizePriority(value))}>
                        <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="border-neutral-700 bg-neutral-800">
                          {priorityOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {t(option === "normal" ? "Normal" : "Urgent", option === "normal" ? "Normal" : "Urgente")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="announcementPasscode" className="text-neutral-200">{t("Passcode", "Código")}</Label>
                      <Input
                        id="announcementPasscode"
                        type="password"
                        value={announcementPasscode}
                        onChange={(event) => setAnnouncementPasscode(event.target.value)}
                        required
                        className="border-neutral-700 bg-neutral-800 text-white"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">{t("Create Announcement", "Crear Anuncio")}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="icon"
                    className="h-10 w-10 bg-red-600 hover:bg-red-700"
                    aria-label={t("Create a new event", "Crear un nuevo evento")}
                    onClick={() => setEventDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">{t("Create a new event", "Crear un nuevo evento")}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-neutral-800 bg-neutral-900">
                  <DialogHeader>
                    <DialogTitle className="text-white">{t("Create New Event", "Crear Nuevo Evento")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div>
                      <Label htmlFor="titleEn" className="text-neutral-200">{t("Title (English)", "Título (Inglés)")}</Label>
                      <Input id="titleEn" name="titleEn" required className="border-neutral-700 bg-neutral-800 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="titleEs" className="text-neutral-200">{t("Title (Spanish)", "Título (Español)")}</Label>
                      <Input id="titleEs" name="titleEs" required className="border-neutral-700 bg-neutral-800 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="descriptionEn" className="text-neutral-200">{t("Description (English)", "Descripción (Inglés)")}</Label>
                      <Textarea id="descriptionEn" name="descriptionEn" className="border-neutral-700 bg-neutral-800 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="descriptionEs" className="text-neutral-200">{t("Description (Spanish)", "Descripción (Español)")}</Label>
                      <Textarea id="descriptionEs" name="descriptionEs" className="border-neutral-700 bg-neutral-800 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="eventDate" className="text-neutral-200">{t("Date & Time", "Fecha y Hora")}</Label>
                      <Input id="eventDate" name="eventDate" type="datetime-local" required className="border-neutral-700 bg-neutral-800 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-neutral-200">{t("Location", "Ubicación")}</Label>
                      <Input id="location" name="location" required className="border-neutral-700 bg-neutral-800 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="maxAttendees" className="text-neutral-200">{t("Max Attendees (optional)", "Máximo de Asistentes (opcional)")}</Label>
                      <Input id="maxAttendees" name="maxAttendees" type="number" min="1" className="border-neutral-700 bg-neutral-800 text-white" />
                    </div>
                    <div>
                      <Label htmlFor="eventPasscode" className="text-neutral-200">{t("Passcode", "Código")}</Label>
                      <Input
                        id="eventPasscode"
                        type="password"
                        value={eventPasscode}
                        onChange={(event) => setEventPasscode(event.target.value)}
                        required
                        className="border-neutral-700 bg-neutral-800 text-white"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">{t("Create Event", "Crear Evento")}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {activeTab === "announcements" ? (
          <div className="space-y-4">
            {(announcementsData?.announcements ?? []).map((announcement: Announcement) => (
              <Card key={announcement.id} className={cn("border-2", getPriorityColor(normalizePriority(announcement.priority)))}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 text-white">
                        {getPriorityIcon(normalizePriority(announcement.priority))}
                        {language === "en" ? announcement.titleEn : announcement.titleEs}
                      </CardTitle>
                      <p className="mt-1 text-xs text-neutral-400">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-neutral-400 hover:bg-red-950/40 hover:text-red-400"
                      onClick={() => {
                        setAnnouncementToDelete(announcement);
                        setDeletePasscode("");
                        setDeleteDialogOpen(true);
                      }}
                      aria-label={t("Delete announcement", "Eliminar anuncio")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {announcement.imageUrl && (
                    <div className="mb-3 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950/60">
                      <img
                        src={announcement.imageUrl}
                        alt={language === "en" ? announcement.titleEn : announcement.titleEs}
                        className="max-h-64 w-full object-cover"
                      />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-neutral-300">{language === "en" ? announcement.contentEn : announcement.contentEs}</p>
                </CardContent>
              </Card>
            ))}

            <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) {
                setAnnouncementToDelete(null);
                setDeletePasscode("");
              }
            }}>
              <DialogContent className="border-neutral-800 bg-neutral-900">
                <DialogHeader>
                  <DialogTitle className="text-white">{t("Delete Announcement", "Eliminar Anuncio")}</DialogTitle>
                  <p className="text-sm text-neutral-400">
                    {t(
                      "Enter the passcode to permanently delete this announcement.",
                      "Ingresa el código para eliminar este anuncio permanentemente."
                    )}
                  </p>
                </DialogHeader>
                <form onSubmit={handleDeleteAnnouncement} className="space-y-4">
                  <div>
                    <Label htmlFor="deletePasscode" className="text-neutral-200">{t("Passcode", "Código")}</Label>
                    <Input
                      id="deletePasscode"
                      type="password"
                      value={deletePasscode}
                      onChange={(event) => setDeletePasscode(event.target.value)}
                      required
                      className="border-neutral-700 bg-neutral-800 text-white"
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
                      className="border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
                    >
                      {t("Cancel", "Cancelar")}
                    </Button>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700">{t("Delete", "Eliminar")}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-neutral-400">{t("No upcoming events.", "No hay eventos próximos.")}</p>
            ) : (
              upcomingEvents.map((eventItem) => {
                const alreadyRsvped = rsvpedEventIds.has(eventItem.id);
                return (
                  <Card key={eventItem.id} className="border-neutral-700 bg-neutral-900/50">
                    <CardHeader>
                      <CardTitle className="text-white">{language === "en" ? eventItem.titleEn : eventItem.titleEs}</CardTitle>
                      <div className="mt-2 flex flex-col gap-2 text-sm text-neutral-300 sm:flex-row sm:items-center">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-red-400" />
                          {new Date(eventItem.eventDate).toLocaleString(language === "en" ? "en-US" : "es-ES")}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-red-400" />
                          {eventItem.location}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4 text-red-400" />
                          {eventItem.rsvpCount}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(language === "en" ? eventItem.descriptionEn : eventItem.descriptionEs) && (
                        <p className="text-neutral-300 whitespace-pre-wrap">
                          {language === "en" ? eventItem.descriptionEn : eventItem.descriptionEs}
                        </p>
                      )}
                      <Button
                        type="button"
                        className={cn(alreadyRsvped ? "bg-neutral-800 text-neutral-300" : "bg-red-600 hover:bg-red-700")}
                        disabled={alreadyRsvped}
                        onClick={() => {
                          setSelectedEvent(eventItem);
                          setRsvpDialogOpen(true);
                        }}
                      >
                        {alreadyRsvped ? t("RSVP'd", "Confirmado") : t("RSVP", "Confirmar")}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })
            )}

            <Dialog open={rsvpDialogOpen} onOpenChange={setRsvpDialogOpen}>
              <DialogContent className="border-neutral-800 bg-neutral-900">
                <DialogHeader>
                  <DialogTitle className="text-white">{t("RSVP", "Confirmar")}</DialogTitle>
                </DialogHeader>
                {selectedEvent && (
                  <form onSubmit={handleRsvp} className="space-y-4">
                    <div>
                      <Label htmlFor="rsvpName" className="text-neutral-200">{t("Name (optional)", "Nombre (opcional)")}</Label>
                      <Input
                        id="rsvpName"
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        className="border-neutral-700 bg-neutral-800 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="attendees" className="text-neutral-200">{t("Attendees", "Asistentes")}</Label>
                      <Input
                        id="attendees"
                        name="attendees"
                        type="number"
                        min="1"
                        defaultValue="1"
                        required
                        className="border-neutral-700 bg-neutral-800 text-white"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">{t("Submit", "Enviar")}</Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </div>
  );
}
