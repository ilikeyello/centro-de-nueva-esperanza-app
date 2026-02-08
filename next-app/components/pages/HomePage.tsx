"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Calendar, DollarSign, MapPin, Megaphone, MessageCircle, Languages } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBackend } from "@/hooks/useBackend";
import { pathFromPage } from "@/components/pageRoutes";
import { useRouter } from "next/navigation";

const NEWS_DEFAULT_TAB_KEY = "cne-news-default-tab";

export function HomePage() {
  const router = useRouter();
  const onNavigate = (page: string) => {
    router.push(pathFromPage(page));
  };

  const { t, language, toggleLanguage } = useLanguage();
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [prayerTitle, setPrayerTitle] = useState("");
  const [prayerDescription, setPrayerDescription] = useState("");
  const [prayerName, setPrayerName] = useState("");
  const [prayerAnonymous, setPrayerAnonymous] = useState(false);

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
    ? new Date(nextEvent.eventDate).toLocaleString(language === "en" ? "en-US" : "es-ES", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  const quickActions = [
    {
      icon: Megaphone,
      labelEn: "News",
      labelEs: "Noticias",
      page: "news",
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
      page: "news",
      color: "bg-green-600 hover:bg-green-700",
    },
  ];

  const createPrayerMutation = useMutation({
    mutationFn: async () => {
      const trimmedName = prayerName.trim();
      return backend.createPrayerRequest({
        title: prayerTitle.trim(),
        description: prayerDescription.trim(),
        isAnonymous: prayerAnonymous || trimmedName.length === 0,
        authorName: trimmedName.length > 0 ? trimmedName : null,
      });
    },
    onSuccess: () => {
      setPrayerTitle("");
      setPrayerDescription("");
      setPrayerName("");
      setPrayerAnonymous(false);
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

  const handleSubmitPrayer = (event: FormEvent) => {
    event.preventDefault();
    if (!prayerTitle.trim() || !prayerDescription.trim()) {
      toast({
        title: t("Missing fields", "Faltan campos"),
        description: t("Please add a title and description.", "Agrega un título y una descripción."),
        variant: "destructive",
      });
      return;
    }
    createPrayerMutation.mutate();
  };

  const setDefaultNewsTab = (tab: "announcements" | "events") => {
    try {
      window.localStorage.setItem(NEWS_DEFAULT_TAB_KEY, tab);
    } catch {
      // ignore
    }
  };

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
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">{t("Welcome to", "Bienvenidos a")}</p>
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
            <Button onClick={() => onNavigate("media")} className="bg-red-600 px-6 py-5 text-base font-semibold hover:bg-red-700">
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
          <h2 className="mb-4 text-2xl font-bold text-white">{t("Who We Are", "Quiénes Somos")}</h2>
          <p className="leading-relaxed text-neutral-300">
            {t(
              "We are a family of believers seeking Jesus together, serving our neighbors, and sharing His hope in practical ways across our city.",
              "Somos una familia de creyentes buscando a Jesús juntos, sirviendo a nuestros vecinos y compartiendo Su esperanza de manera práctica en toda nuestra ciudad."
            )}
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.page}
                type="button"
                onClick={() => onNavigate(action.page)}
                className={`${action.color} flex items-center justify-center gap-2 rounded-2xl px-4 py-4 text-base font-semibold text-white transition-colors`}
              >
                <Icon className="h-5 w-5" />
                {t(action.labelEn, action.labelEs)}
              </button>
            );
          })}
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-400">{t("Upcoming Event", "Próximo Evento")}</p>
          {eventsLoading ? (
            <div className="mt-4 h-24 animate-pulse rounded-xl bg-neutral-800/40" />
          ) : eventsError ? (
            <p className="mt-4 text-sm text-red-400">{t("Could not load events.", "No se pudieron cargar eventos.")}</p>
          ) : nextEvent ? (
            <div className="mt-4 space-y-2">
              <p className="text-xl font-bold text-white">{language === "en" ? nextEvent.titleEn : nextEvent.titleEs}</p>
              <div className="flex flex-col gap-2 text-sm text-neutral-300 sm:flex-row sm:items-center">
                {formattedDate && (
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-red-400" />
                    {formattedDate}
                  </span>
                )}
                {nextEvent.location && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-400" />
                    {nextEvent.location}
                  </span>
                )}
              </div>
              <Button
                onClick={() => {
                  setDefaultNewsTab("events");
                  onNavigate("news");
                }}
                className="mt-3 bg-red-600 hover:bg-red-700"
              >
                {t("See details", "Ver detalles")}
              </Button>
            </div>
          ) : (
            <p className="mt-4 text-sm text-neutral-300">{t("No upcoming events yet.", "No hay eventos próximos.")}</p>
          )}
        </section>

        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="text-xl font-bold text-white">{t("Submit a Prayer", "Enviar Petición")}</h3>
          <p className="mt-1 text-sm text-neutral-400">
            {t("Share a request with the community.", "Comparte una petición con la comunidad.")}
          </p>

          <form onSubmit={handleSubmitPrayer} className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prayer-title">{t("Title", "Título")}</Label>
              <Input
                id="prayer-title"
                value={prayerTitle}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPrayerTitle(e.target.value)}
                placeholder={t("Prayer title", "Título de la petición")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prayer-description">{t("Description", "Descripción")}</Label>
              <Textarea
                id="prayer-description"
                value={prayerDescription}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrayerDescription(e.target.value)}
                placeholder={t("How can we pray?", "¿Cómo podemos orar?")}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prayer-name">{t("Name (optional)", "Nombre (opcional)")}</Label>
              <Input
                id="prayer-name"
                value={prayerName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPrayerName(e.target.value)}
                placeholder={t("Your name", "Tu nombre")}
              />
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="prayer-anonymous"
                checked={prayerAnonymous}
                onCheckedChange={(checked) => setPrayerAnonymous(Boolean(checked))}
              />
              <label htmlFor="prayer-anonymous" className="text-sm text-neutral-300">
                {t("Post as anonymous", "Publicar como anónimo")}
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 py-6 text-base font-semibold hover:bg-red-700"
              disabled={createPrayerMutation.isPending}
            >
              {createPrayerMutation.isPending ? t("Submitting...", "Enviando...") : t("Submit", "Enviar")}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
