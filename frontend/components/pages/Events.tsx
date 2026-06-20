import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Users, Plus, X } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import type { Event } from "../../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { RsvpCustomFields, firstMissingRequired, type RsvpResponses } from "../RsvpCustomFields";

export function Events() {
  const backend = useBackend();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRsvpDialog, setShowRsvpDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [rsvpResponses, setRsvpResponses] = useState<RsvpResponses>({});

  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: () => backend.listEvents({ upcoming: true }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      titleEn: string;
      titleEs: string;
      descriptionEn: string;
      descriptionEs: string;
      eventDate: string;
      location: string;
      maxAttendees: number;
      passcode: string;
    }) => {
      return backend.createEvent({
        titleEn: data.titleEn,
        titleEs: data.titleEs,
        descriptionEn: data.descriptionEn,
        descriptionEs: data.descriptionEs,
        eventDate: data.eventDate,
        location: data.location,
        maxAttendees: data.maxAttendees,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setShowCreateDialog(false);
      toast({
        title: t("Success", "Éxito"),
        description: t("Event created successfully", "Evento creado exitosamente"),
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: t("Error", "Error"),
        description: t("Failed to create event", "Error al crear evento"),
        variant: "destructive",
      });
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async (data: { eventId: number; userName: string; userEmail?: string; responses?: RsvpResponses }) => {
      return backend.createRsvp(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setShowRsvpDialog(false);
      toast({
        title: t("Success", "Éxito"),
        description: t("RSVP submitted successfully", "RSVP enviado exitosamente"),
      });
    },
    onError: (error) => {
      console.error("RSVP submission failed:", error);
      const detail =
        error instanceof Error ? error.message : String(error);
      toast({
        title: t("Error", "Error"),
        description: `${t("Failed to submit RSVP", "Error al enviar RSVP")}: ${detail}`,
        variant: "destructive",
      });
    },
  });

  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      titleEn: formData.get("titleEn") as string,
      titleEs: formData.get("titleEs") as string,
      descriptionEn: formData.get("descriptionEn") as string,
      descriptionEs: formData.get("descriptionEs") as string,
      eventDate: new Date(formData.get("eventDate") as string).toISOString(),
      location: formData.get("location") as string,
      maxAttendees: parseInt(formData.get("maxAttendees") as string) || 0,
      passcode: formData.get("passcode") as string,
    });
  };

  const handleRsvp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!selectedEvent) return;

    const fields = selectedEvent.rsvpFields ?? [];
    const missing = firstMissingRequired(fields, rsvpResponses);
    if (missing) {
      toast({
        title: t("Missing information", "Falta información"),
        description: t(`Please answer: ${missing}`, `Por favor responde: ${missing}`),
        variant: "destructive",
      });
      return;
    }

    rsvpMutation.mutate({
      eventId: selectedEvent.id,
      userName: formData.get("userName") as string,
      userEmail: (formData.get("userEmail") as string) || undefined,
      responses: rsvpResponses,
    });
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[--ink-dark]">
          {t("Church Events", "Eventos de la Iglesia")}
        </h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <button className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" style={{ backgroundColor: 'var(--sage)', color: 'white' }}>
              <Plus className="mr-2 h-4 w-4" />
              {t("Create Event", "Crear Evento")}
            </button>
          </DialogTrigger>
          <DialogContent className="border-[--border-color] bg-surface shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-[--ink-dark]">
                {t("Create New Event", "Crear Nuevo Evento")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <Label htmlFor="titleEn" className="text-[--ink-mid]">
                  {t("Title (English)", "Título (Inglés)")}
                </Label>
                <Input
                  id="titleEn"
                  name="titleEn"
                  required
                  className="border-[--border-color] bg-surface text-[--ink-dark]"
                />
              </div>
              <div>
                <Label htmlFor="titleEs" className="text-[--ink-mid]">
                  {t("Title (Spanish)", "Título (Español)")}
                </Label>
                <Input
                  id="titleEs"
                  name="titleEs"
                  required
                  className="border-[--border-color] bg-surface text-[--ink-dark]"
                />
              </div>
              <div>
                <Label htmlFor="descriptionEn" className="text-[--ink-mid]">
                  {t("Description (English)", "Descripción (Inglés)")}
                </Label>
                <Textarea
                  id="descriptionEn"
                  name="descriptionEn"
                  className="border-[--border-color] bg-surface text-[--ink-dark]"
                />
              </div>
              <div>
                <Label htmlFor="descriptionEs" className="text-[--ink-mid]">
                  {t("Description (Spanish)", "Descripción (Español)")}
                </Label>
                <Textarea
                  id="descriptionEs"
                  name="descriptionEs"
                  className="border-[--border-color] bg-surface text-[--ink-dark]"
                />
              </div>
              <div>
                <Label htmlFor="eventDate" className="text-[--ink-mid]">
                  {t("Date & Time", "Fecha y Hora")}
                </Label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="datetime-local"
                  required
                  className="border-[--border-color] bg-surface text-[--ink-dark]"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-[--ink-mid]">
                  {t("Location", "Ubicación")}
                </Label>
                <Input
                  id="location"
                  name="location"
                  required
                  className="border-[--border-color] bg-surface text-[--ink-dark]"
                />
              </div>
              <div>
                <Label htmlFor="maxAttendees" className="text-[--ink-mid]">
                  {t("Max Attendees (optional)", "Máximo de Asistentes (opcional)")}
                </Label>
                <Input
                  id="maxAttendees"
                  name="maxAttendees"
                  type="number"
                  min="1"
                  className="border-[--border-color] bg-surface text-[--ink-dark]"
                />
              </div>
              <div>
                <Label htmlFor="passcode" className="text-[--ink-mid]">
                  {t("Passcode", "Contraseña")}
                </Label>
                <Input
                  id="passcode"
                  name="passcode"
                  type="password"
                  required
                  placeholder={t("Enter a passcode for editing/deleting", "Ingrese una contraseña para editar/eliminar")}
                  className="border-[--border-color] bg-surface text-[--ink-dark]"
                />
              </div>
              <Button type="submit" className="w-full warm-button-primary border-2 border-[--sage] !text-white">
                {t("Create Event", "Crear Evento")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {eventsData?.events.map((event: Event) => (
          <div
            key={event.id}
            className="warm-card rounded-2xl flex flex-col"
            style={{ border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.07)" }}
          >
            <div className="px-5 pt-5 pb-3">
              <p className="font-semibold text-[--ink-dark]">
                {language === "en" ? event.titleEn : event.titleEs}
              </p>
            </div>
            <div className="px-5 pb-4 flex-1 space-y-3">
              <p className="text-sm text-[--ink-mid]">
                {language === "en" ? event.descriptionEn : event.descriptionEs}
              </p>
              <div className="space-y-2 text-sm text-[--ink-mid]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[--sage]" />
                  <span>{new Date(event.eventDate).toLocaleString(language === "en" ? "en-US" : "es-ES", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[--sage]" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[--sage]" />
                  <span>
                    {event.rsvpCount} {t("attending", "asistirán")}
                    {event.maxAttendees && ` / ${event.maxAttendees}`}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-5 pb-5">
              <Button
                onClick={() => {
                  setSelectedEvent(event as any);
                  setRsvpResponses({});
                  setShowRsvpDialog(true);
                }}
                className="w-full warm-button-primary border-2 border-[--sage] !text-white"
              >
                {t("RSVP", "Confirmar Asistencia")}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showRsvpDialog} onOpenChange={setShowRsvpDialog}>
        <DialogContent className="border-[--border-color] bg-surface shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-[--ink-dark]">
              {t("RSVP for Event", "Confirmar Asistencia al Evento")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRsvp} className="space-y-4">
            <div>
              <Label htmlFor="userName" className="text-[--ink-mid]">
                {t("Your Name", "Tu Nombre")}
              </Label>
              <Input
                id="userName"
                name="userName"
                type="text"
                required
                placeholder={t("Enter your name", "Ingresa tu nombre")}
                className="border-[--border-color] bg-surface text-[--ink-dark]"
              />
            </div>
            <div>
              <Label htmlFor="userEmail" className="text-[--ink-mid]">
                {t("Email (optional)", "Correo electrónico (opcional)")}
              </Label>
              <Input
                id="userEmail"
                name="userEmail"
                type="email"
                placeholder={t("Enter your email", "Ingresa tu correo")}
                className="border-[--border-color] bg-surface text-[--ink-dark]"
              />
            </div>
            <RsvpCustomFields
              fields={selectedEvent?.rsvpFields ?? []}
              values={rsvpResponses}
              onChange={(key, value) =>
                setRsvpResponses((prev) => ({ ...prev, [key]: value }))
              }
            />
            <Button
              type="submit"
              disabled={rsvpMutation.isPending}
              className="w-full warm-button-primary border-2 border-[--sage] !text-white"
            >
              {rsvpMutation.isPending
                ? t("Submitting...", "Enviando...")
                : t("Confirm RSVP", "Confirmar Asistencia")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
