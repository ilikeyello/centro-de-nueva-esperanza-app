import { useState, type ChangeEvent, type FormEvent } from "react";
import { Calendar, DollarSign, Gamepad2, MapPin, Megaphone, MessageCircle, Languages, Clock, Users, Car } from "lucide-react";
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
    "https://images.unsplash.com/photo-1536063766742-b514ee70707f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  const serviceTimes = {
    en: {
      yuma: "3:00 PM",
      holyoke: "7:00 PM",
    },
    es: {
      yuma: "3:00 PM",
      holyoke: "7:00 PM",
    },
  };

  const locations = {
    en: {
      yuma: "Yuma, Colorado",
      holyoke: "Holyoke, Colorado",
    },
    es: {
      yuma: "Yuma, Colorado",
      holyoke: "Holyoke, Colorado",
    },
  };

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
    {
      icon: Gamepad2,
      labelEn: "Games",
      labelEs: "Juegos",
      page: "games",
      color: "bg-orange-600 hover:bg-orange-700",
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
    <div className="pb-10">
      <section className="relative -mt-20 md:-mt-16">
        <img
          src={heroImageUrl}
          alt={t("Church congregation worshiping together", "Congregación adorando juntos")}
          className="hero-image w-full object-cover h-[250vh] md:h-[60rem] object-[center_55%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-warm-red/10 via-transparent to-transparent" />
        <div className="absolute inset-0 hero-gradient-blend md:bg-gradient-to-b md:from-black/20 md:via-black/40 md:to-black/60" />
        <div className="absolute top-20 right-4 md:top-24 z-20">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center justify-center gap-1 rounded-full bg-warm-red/90 px-3 py-1.5 text-sm font-medium text-white hover:bg-warm-red shadow-md"
              aria-label={language === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
            >
              <Languages className="h-4 w-4" />
              <span>{language === "en" ? "ESP" : "ENG"}</span>
            </button>
          </div>
          
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center sm:px-10 safe-area-padding -translate-y-32 md:-translate-y-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-warm-red drop-shadow-lg">
            {t("Welcome to", "Bienvenidos a")}
          </p>
          <h2 className="mt-2 serif-heading hero-title text-4xl font-bold text-white sm:text-5xl md:text-6xl drop-shadow-2xl">
            {t("Center of New Hope", "Centro de Nueva Esperanza")}
          </h2>
          <p className="mt-6 max-w-3xl hero-subtitle text-lg text-neutral-100 md:text-xl drop-shadow-lg">
            {t(
              "A welcoming family of believers seeking Jesus together, serving our neighbors, and sharing His hope in practical ways.",
              "Una familia acogedora de creyentes buscando a Jesús juntos, sirviendo a nuestros vecinos y compartiendo Su esperanza de manera práctica."
            )}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => onNavigate("newHere")}
              className="warm-button-primary cta-button px-8 py-4 text-lg"
            >
              {t("Plan a Visit", "Planifica una Visita")}
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate("media")}
              className="border-white bg-transparent px-8 py-4 text-lg text-white hover:bg-white hover:text-neutral-900"
            >
              {t("Watch Live", "Ver en Vivo")}
            </Button>
          </div>
        </div>
      </section>
      <div className="container mx-auto space-y-12 px-4">
        {/* What to Expect Section */}
        <section className="warm-card p-8">
          <h2 className="mb-6 serif-heading text-3xl font-bold text-neutral-900">
            {t("What to Expect", "Qué Esperar")}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warm-red/10">
                <Users className="h-8 w-8 text-warm-red" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                {t("Friendly People", "Gente Amigable")}
              </h3>
              <p className="text-neutral-600">
                {t(
                  "Join our warm and welcoming community. Come as you are!",
                  "Únete a nuestra comunidad cálida y acogedora. ¡Ven como estás!"
                )}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warm-red/10">
                <Clock className="h-8 w-8 text-warm-red" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                {t("One Hour Service", "Servicio de Una Hora")}
              </h3>
              <p className="text-neutral-600">
                {t(
                  "Our services last about 60 minutes with worship and a relevant message.",
                  "Nuestros servicios duran aproximadamente 60 minutos con adoración y un mensaje relevante."
                )}
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warm-red/10">
                <Car className="h-8 w-8 text-warm-red" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                {t("Easy Parking", "Estacionamiento Fácil")}
              </h3>
              <p className="text-neutral-600">
                {t(
                  "Plenty of free parking spaces available right at the entrance.",
                  "Amplios espacios de estacionamiento gratuitos disponibles en la entrada."
                )}
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Button
              onClick={() => onNavigate("newHere")}
              className="warm-button-secondary px-6 py-3"
            >
              {t("Learn More About Us", "Conoce Más Sobre Nosotros")}
            </Button>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="serif-heading text-3xl font-bold text-neutral-900">
            {t("Who We Are", "Quiénes Somos")}
          </h2>
          <p className="max-w-3xl text-lg leading-relaxed text-neutral-700">
            {t(
              "We are a family of believers seeking Jesus together, serving our neighbors, and sharing His hope in practical ways across our city.",
              "Somos una familia de creyentes buscando a Jesús juntos, sirviendo a nuestros vecinos y compartiendo Su esperanza de manera práctica en toda nuestra ciudad."
            )}
          </p>
          <Button
            onClick={() => onNavigate("newHere")}
            className="warm-button-primary px-6 py-3"
          >
            {t("New Here?", "¿Nuevo Aquí?")}
          </Button>
        </section>

        <section className="warm-card p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-warm-red">
            {t("Upcoming Event", "Próximo Evento")}
          </p>
          {eventsLoading ? (
            <div className="mt-4 h-24 animate-pulse rounded-xl bg-neutral-200/50" />
          ) : eventsError ? (
            <div className="mt-6 rounded-xl bg-white p-6 border border-neutral-200">
              <h3 className="text-xl font-semibold text-neutral-900">
                {t("Join Us This Sunday!", "¡Únete a Nosotros Este Domingo!")}
              </h3>
              <p className="mt-2 text-neutral-600">
                {t(
                  "We gather every week to worship, learn, and grow together.",
                  "Nos reunimos cada semana para adorar, aprender y crecer juntos."
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-700">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warm-red" />
                  <span>{t("Yuma at", "Yuma a las")} {serviceTimes[language].yuma}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warm-red" />
                  <span>{t("Holyoke at", "Holyoke a las")} {serviceTimes[language].holyoke}</span>
                </div>
              </div>
            </div>
          ) : nextEvent ? (
            <>
              <h3 className="mt-2 serif-heading text-2xl font-bold text-neutral-900">
                {t(nextEvent.titleEn, nextEvent.titleEs)}
              </h3>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-700">
                {formattedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-warm-red" />
                    <span>{formattedDate}</span>
                  </div>
                )}
                {nextEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-warm-red" />
                    <span>{nextEvent.location}</span>
                  </div>
                )}
              </div>
              <p className="mt-4 text-neutral-600">
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
                className="warm-button-primary mt-6 px-6 py-3"
              >
                {t("See Details", "Ver detalles")}
              </Button>
            </>
          ) : (
            <div className="mt-6 rounded-xl bg-white p-6 border border-neutral-200">
              <h3 className="text-xl font-semibold text-neutral-900">
                {t("Join Us This Sunday!", "¡Únete a Nosotros Este Domingo!")}
              </h3>
              <p className="mt-2 text-neutral-600">
                {t(
                  "We gather every week to worship, learn, and grow together.",
                  "Nos reunimos cada semana para adorar, aprender y crecer juntos."
                )}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-700">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warm-red" />
                  <span>{t("Yuma at", "Yuma a las")} {serviceTimes[language].yuma}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-warm-red" />
                  <span>{t("Holyoke at", "Holyoke a las")} {serviceTimes[language].holyoke}</span>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <h2 className="serif-heading text-3xl font-bold text-neutral-900">
            {t("Quick Actions", "Acciones Rápidas")}
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.page}
                  onClick={() => onNavigate(action.page)}
                  className="warm-card group p-6 text-left transition-all hover:scale-105"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-warm-red/10 group-hover:bg-warm-red/20">
                    <Icon className="h-6 w-6 text-warm-red" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-neutral-900">
                    {t(action.labelEn, action.labelEs)}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {action.page === "contact" && t(
                      "Get in touch with our team",
                      "Ponte en contacto con nuestro equipo"
                    )}
                    {action.page === "bulletin" && t(
                      "Community updates and requests",
                      "Actualizaciones y peticiones de la comunidad"
                    )}
                    {action.page === "donations" && t(
                      "Support our ministry",
                      "Apoya nuestro ministerio"
                    )}
                    {action.page === "games" && t(
                      "Faith-filled fun for the family",
                      "Diversión con fe para la familia"
                    )}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <section className="warm-card p-8">
          <h2 className="mb-6 serif-heading text-3xl font-bold text-neutral-900">
            {t("Submit a Prayer Request", "Enviar una petición de oración")}
          </h2>
          <p className="text-lg text-neutral-600">
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
              <Label htmlFor="prayer-title" className="text-neutral-700">
                {t("Title", "Título")}
              </Label>
              <Input
                id="prayer-title"
                value={prayerTitle}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setPrayerTitle(event.target.value)}
                required
                className="border-neutral-300 bg-white text-neutral-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prayer-description" className="text-neutral-700">
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
                className="border-neutral-300 bg-white text-neutral-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prayer-name" className="text-neutral-700">
                {t("Name", "Nombre")}
              </Label>
              <Input
                id="prayer-name"
                value={prayerName}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setPrayerName(event.target.value)}
                placeholder={t("Optional", "Opcional")}
                className="border-neutral-300 bg-white text-neutral-900"
              />
            </div>
            <Button
              type="submit"
              disabled={
                createPrayerMutation.isPending ||
                prayerTitle.trim().length === 0 ||
                prayerDescription.trim().length === 0
              }
              className="warm-button-primary w-full px-6 py-3"
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
