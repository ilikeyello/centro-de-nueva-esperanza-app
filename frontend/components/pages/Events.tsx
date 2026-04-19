import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Users, Plus, X } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import type { Event } from "../../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "../../contexts/LanguageContext";

export function Events() {
  const backend = useBackend();
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRsvpDialog, setShowRsvpDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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

  // RSVP functionality not yet implemented in Supabase
  const rsvpMutation = useMutation({
    mutationFn: async (data: { eventId: number; attendees: number }) => {
      throw new Error("RSVP not yet implemented");
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
      console.error(error);
      toast({
        title: t("Error", "Error"),
        description: t("Failed to submit RSVP", "Error al enviar RSVP"),
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
    rsvpMutation.mutate({
      eventId: selectedEvent.id,
      attendees: parseInt(formData.get("attendees") as string) || 1,
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
              <Button type="submit" className="w-full bg-[--sage] hover:bg-[--sage-mid] text-white">
                {t("Create Event", "Crear Evento")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {eventsData?.events.map((event: Event) => (
          <Card key={event.id} className="border-[--border-color] bg-surface shadow-sm">
            <CardHeader>
              <CardTitle className="text-[--ink-dark]">
                {language === "en" ? event.titleEn : event.titleEs}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[--ink-mid]">
                {language === "en" ? event.descriptionEn : event.descriptionEs}
              </p>
              <div className="space-y-2 text-sm text-[--ink-mid]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[--sage]" />
                  <span>{new Date(event.eventDate).toLocaleString()}</span>
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
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                onClick={() => {
                  setSelectedEvent(event as any);
                  setShowRsvpDialog(true);
                }}
                className="w-full bg-[--sage] hover:bg-[--sage-mid] text-white"
              >
                {t("RSVP", "Confirmar Asistencia")}
              </Button>
            </CardFooter>
          </Card>
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
                className="border-[--border-color] bg-surface text-[--ink-dark]"
              />
            </div>
            <Button type="submit" className="w-full bg-[--sage] hover:bg-[--sage-mid] text-white">
              {t("Confirm RSVP", "Confirmar Asistencia")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
