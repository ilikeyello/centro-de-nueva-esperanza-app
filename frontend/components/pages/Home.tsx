import { useState, type ChangeEvent, type FormEvent } from "react";
import { Calendar, DollarSign, MapPin, Megaphone, MessageCircle, Languages } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { useBackend } from "../../hooks/useBackend";

interface HomeProps {
  onNavigate: (page: string) => void;
}

const NEWS_DEFAULT_TAB_KEY = "cne-news-default-tab";

export function Home({ onNavigate }: HomeProps) {
  const { t, language, toggleLanguage } = useLanguage();
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [prayerTitle, setPrayerTitle] = useState("");
  const [prayerDescription, setPrayerDescription] = useState("");
  const [prayerName, setPrayerName] = useState("");

  const heroImageUrl =
    "https://images.pexels.com/photos/2014775/pexels-photo-2014775.jpeg?_gl=1*mfewiz*_ga*MTQ3ODc3OTIwNS4xNzYyOTE0NDY1*_ga_8JE65Q40S6*czE3NjI5MTQ0NjQkbzEkZzEkdDE3NjI5MTQ2NDgkajQ1JGwwJGgw";

  const {
    data: eventsData,
    isLoading: eventsLoading,
    isError: eventsError,
  } = useQuery({
    queryKey: ["events"],
    queryFn: () => backend.events.list({ upcoming: true }),
  });

  const nextEvent = eventsData?.events?.[0];
  const formattedDate = nextEvent
    ? new Date(nextEvent.eventDate).toLocaleString(
        language === "en" ? "en-US" : "es-ES",
        {
          weekday: "long",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }
      )
    : null;

  const quickActions = [
    {
      icon: Megaphone,
      labelEn: "Get in Contact",
      labelEs: "Ponerse en Contacto",
      page: "contact",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: MessageCircle,
      labelEn: "Community Bulletin",
      labelEs: "Tablón Comunitario",
      page: "bulletin",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      icon: DollarSign,
      labelEn: "Give Now",
      labelEs: "Dar Ahora",
      page: "donations",
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  const createPrayerMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = prayerName.trim();
      return backend.prayers.create({
        title: prayerTitle.trim(),
        description: prayerDescription.trim(),
        isAnonymous: prayerName.trim().length === 0,
        authorName: trimmedName.length > 0 ? trimmedName : null,
      });
    },
    onSuccess: () => {
      setPrayerTitle("");
      setPrayerDescription("");
      setPrayerName("");
      queryClient.invalidateQueries({ queryKey: ["bulletin-board"] });
      toast({
        title: t("Prayer submitted", "Petición enviada"),
        description: t(
          "Your request is now visible on the Community Bulletin.",
          "Tu petición ahora es visible en el Tablón Comunitario."
        ),
      });
      onNavigate("bulletin");
    },
    onError: (error: Error) => {
      toast({
        title: t("Error", "Error"),
        description: error.message || t("Failed to submit request", "Error al enviar la petición"),
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-10 pb-10">
      <section className="relative overflow-hidden">
        <img
          src={heroImageUrl}
          alt={t("Congregation worshipping in church", "Congregación adorando en la iglesia")}
          className="hero-image w-full object-cover md:h-[54rem]"
        />
        <div className="absolute inset-0 bg-neutral-950/35 backdrop-blur-[1.5px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-950/30 to-neutral-950" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center sm:px-10 safe-area-padding">
          {/* Mobile-only translate button in top-right corner */}
          <div className="absolute top-4 right-4 md:hidden">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/90 p-2 text-neutral-200 hover:border-neutral-500 hover:text-neutral-50"
              aria-label={language === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
            >
              <Languages className="h-5 w-5" />
              <span className="sr-only">{language === "en" ? "ESP" : "ENG"}</span>
            </button>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
            {t("Welcome to", "Bienvenidos a")}
          </p>
          <h2 className="mt-2 hero-title text-3xl font-bold text-white sm:text-4xl md:text-5xl">
            {t("Center of New Hope", "Centro de Nueva Esperanza")}
          </h2>
          <p className="mt-4 max-w-2xl hero-subtitle text-base text-neutral-200 md:text-lg">
            {t(
              "Encounter hope, serve our neighbors, and grow together in Christ each week.",
              "Encuentra esperanza, sirve a nuestros vecinos y crece juntos en Cristo cada semana."
            )}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              onClick={() => onNavigate("media")}
              className="bg-red-600 px-6 py-5 text-base font-semibold hover:bg-red-700"
            >
              {t("Explore Media", "Explorar Medios")}
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("news")}
              className="border-neutral-600 bg-neutral-900/60 px-6 py-5 text-base text-white hover:bg-neutral-800"
            >
              {t("See What's New", "Ver Novedades")}
            </Button>
          </div>
        </div>
      </section>
      <div className="container mx-auto space-y-8 px-4">
        <section className="rounded-2xl px-0">
          <h2 className="mb-4 text-2xl font-bold text-white">
            {t("Who We Are", "Quiénes Somos")}
          </h2>
          <p className="leading-relaxed text-neutral-300">
            {t(
              "We are a family of believers seeking Jesus together, serving our neighbors, and sharing His hope in practical ways across our city.",
              "Somos una familia de creyentes buscando a Jesús juntos, sirviendo a nuestros vecinos y compartiendo Su esperanza de manera práctica en toda nuestra ciudad."
            )}
          </p>
          <Button
            onClick={() => onNavigate("newHere")}
            className="mt-6 bg-red-600 px-6 py-5 text-base font-semibold text-white hover:bg-red-700"
          >
            {t("New Here?", "¿Nuevo Aquí?")}
          </Button>
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">
            {t("Upcoming Event", "Próximo Evento")}
          </p>
          {eventsLoading ? (
            <div className="mt-4 h-24 animate-pulse rounded-xl bg-neutral-800/40" />
          ) : eventsError ? (
            <p className="mt-4 text-sm text-neutral-400">
              {t("Unable to load events right now.", "No se pueden cargar los eventos en este momento.")}
            </p>
          ) : nextEvent ? (
            <>
              <h3 className="mt-2 text-2xl font-bold text-white">
                {t(nextEvent.titleEn, nextEvent.titleEs)}
              </h3>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-300">
                {formattedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-red-400" />
                    <span>{formattedDate}</span>
                  </div>
                )}
                {nextEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-400" />
                    <span>{nextEvent.location}</span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-neutral-300">
                {t(
                  nextEvent.descriptionEn ?? "Join us as we gather together.",
                  nextEvent.descriptionEs ?? "Únete a nosotros mientras nos reunimos."
                )}
              </p>
              <Button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem(NEWS_DEFAULT_TAB_KEY, "events");
                  }
                  onNavigate("news");
                }}
                className="mt-6 bg-red-600 px-6 py-5 text-base font-semibold text-white hover:bg-red-700"
              >
                {t("See Details", "Ver detalles")}
              </Button>
            </>
          ) : (
            <p className="mt-4 text-sm text-neutral-400">
              {t("No upcoming events scheduled yet. Check back soon!", "Aún no hay eventos programados. ¡Vuelve pronto!")}
            </p>
          )}
        </section>

        <div>
          <h2 className="mb-4 text-2xl font-bold text-white">
            {t("Quick Actions", "Acciones Rápidas")}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.page}
                  onClick={() => onNavigate(action.page)}
                  className={`h-24 ${action.color} flex-col gap-2 text-white`}
                >
                  <Icon className="h-8 w-8" />
                  <span className="text-base font-semibold">
                    {t(action.labelEn, action.labelEs)}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h2 className="text-2xl font-bold text-white">
            {t("Submit a Prayer Request", "Enviar una petición de oración")}
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            {t(
              "Your request will appear on the Community Bulletin so everyone can pray along.",
              "Tu petición aparecerá en el Tablón Comunitario para que todos puedan orar contigo."
            )}
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              createPrayerMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="prayer-title" className="text-neutral-200">
                {t("Title", "Título")}
              </Label>
              <Input
                id="prayer-title"
                value={prayerTitle}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setPrayerTitle(event.target.value)}
                required
                className="border-neutral-700 bg-neutral-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prayer-description" className="text-neutral-200">
                {t("Description", "Descripción")}
              </Label>
              <Textarea
                id="prayer-description"
                value={prayerDescription}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                  setPrayerDescription(event.target.value)
                }
                required
                rows={4}
                className="border-neutral-700 bg-neutral-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prayer-name" className="text-neutral-200">
                {t("Name", "Nombre")}
              </Label>
              <Input
                id="prayer-name"
                value={prayerName}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setPrayerName(event.target.value)}
                placeholder={t("Optional", "Opcional")}
                className="border-neutral-700 bg-neutral-800 text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={
                createPrayerMutation.isPending ||
                prayerTitle.trim().length === 0 ||
                prayerDescription.trim().length === 0
              }
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {createPrayerMutation.isPending
                ? t("Sending...", "Enviando...")
                : t("Share Request", "Compartir petición")}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
