import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, MapPin, Users, Plus, X } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import type { Event } from "../hooks/useBackend";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    queryFn: () => backend.events.list({ upcoming: true }),
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      titleEn: string;
      titleEs: string;
      descriptionEn: string;
      descriptionEs: string;
      eventDate: Date;
      location: string;
      maxAttendees: number;
      passcode: string;
    }) => {
      return backend.events.create(data);
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
    mutationFn: async (data: { eventId: number; attendees: number }) => {
      return backend.events.rsvp(data);
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
        <h1 className="text-3xl font-bold text-white">
          {t("Church Events", "Eventos de la Iglesia")}
        </h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              {t("Create Event", "Crear Evento")}
            </Button>
          </DialogTrigger>
          <DialogContent className="border-neutral-800 bg-neutral-900">
            <DialogHeader>
              <DialogTitle className="text-white">
                {t("Create New Event", "Crear Nuevo Evento")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <Label htmlFor="titleEn" className="text-neutral-200">
                  {t("Title (English)", "Título (Inglés)")}
                </Label>
                <Input
                  id="titleEn"
                  name="titleEn"
                  required
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div>
                <Label htmlFor="titleEs" className="text-neutral-200">
                  {t("Title (Spanish)", "Título (Español)")}
                </Label>
                <Input
                  id="titleEs"
                  name="titleEs"
                  required
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div>
                <Label htmlFor="descriptionEn" className="text-neutral-200">
                  {t("Description (English)", "Descripción (Inglés)")}
                </Label>
                <Textarea
                  id="descriptionEn"
                  name="descriptionEn"
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div>
                <Label htmlFor="descriptionEs" className="text-neutral-200">
                  {t("Description (Spanish)", "Descripción (Español)")}
                </Label>
                <Textarea
                  id="descriptionEs"
                  name="descriptionEs"
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div>
                <Label htmlFor="eventDate" className="text-neutral-200">
                  {t("Date & Time", "Fecha y Hora")}
                </Label>
                <Input
                  id="eventDate"
                  name="eventDate"
                  type="datetime-local"
                  required
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-neutral-200">
                  {t("Location", "Ubicación")}
                </Label>
                <Input
                  id="location"
                  name="location"
                  required
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div>
                <Label htmlFor="maxAttendees" className="text-neutral-200">
                  {t("Max Attendees (optional)", "Máximo de Asistentes (opcional)")}
                </Label>
                <Input
                  id="maxAttendees"
                  name="maxAttendees"
                  type="number"
                  min="1"
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <div>
                <Label htmlFor="passcode" className="text-neutral-200">
                  {t("Passcode", "Contraseña")}
                </Label>
                <Input
                  id="passcode"
                  name="passcode"
                  type="password"
                  required
                  placeholder={t("Enter a passcode for editing/deleting", "Ingrese una contraseña para editar/eliminar")}
                  className="border-neutral-700 bg-neutral-800 text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                {t("Create Event", "Crear Evento")}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {eventsData?.events.map((event) => (
          <Card key={event.id} className="border-neutral-800 bg-neutral-900/50">
            <CardHeader>
              <CardTitle className="text-white">
                {language === "en" ? event.titleEn : event.titleEs}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-300">
                {language === "en" ? event.descriptionEn : event.descriptionEs}
              </p>
              <div className="space-y-2 text-sm text-neutral-400">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(event.eventDate).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {event.rsvpCount} {t("attending", "asistirán")}
                    {event.maxAttendees && ` / ${event.maxAttendees}`}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => {
                  setSelectedEvent(event as any);
                  setShowRsvpDialog(true);
                }}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {t("RSVP", "Confirmar Asistencia")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showRsvpDialog} onOpenChange={setShowRsvpDialog}>
        <DialogContent className="border-neutral-800 bg-neutral-900">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t("RSVP for Event", "Confirmar Asistencia al Evento")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRsvp} className="space-y-4">
            <div>
              <Label htmlFor="attendees" className="text-neutral-200">
                {t("Number of Attendees", "Número de Asistentes")}
              </Label>
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
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
              {t("Confirm RSVP", "Confirmar Asistencia")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
