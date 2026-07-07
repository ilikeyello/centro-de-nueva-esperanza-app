import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Calendar, Gamepad2, Heart, MapPin, Megaphone, Languages, Clock, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { useBackend } from "../../hooks/useBackend";
import { getChurchAdditionalInfo } from "../../lib/mainSiteData";
import { getDonationUrl, invalidateDonationPrewarm, openDonationSheet, prewarmDonation } from "../../lib/donations";
import { openSheetBrowser } from "../../lib/systemBrowser";
import { UGC_ENABLED } from "@/lib/featureFlags";

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

  const { data: churchInfo } = useQuery({
    queryKey: ["churchInfo"],
    queryFn: () => getChurchAdditionalInfo(),
  });

  const donationUrl = getDonationUrl(churchInfo);

  // Pre-open the connection to Tithe.ly as soon as we know the URL so the
  // "Support Our Ministry" sheet loads fast instead of connecting cold.
  useEffect(() => {
    if (!donationUrl) return;
    void prewarmDonation(donationUrl);
    return () => {
      void invalidateDonationPrewarm();
    };
  }, [donationUrl]);

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
          hour12: true,
        }
      )
    : null;

  const quickActions = [
    {
      icon: Heart,
      labelEn: "Support Our Ministry",
      labelEs: "Apoyar el Ministerio",
      page: "donations",
      color: "bg-green-600 hover:bg-green-700",
      iconClassName: "h-5 w-5 text-[--sage] translate-y-1",
    },
    {
      icon: Megaphone,
      labelEn: "Get in Contact",
      labelEs: "Ponerse en Contacto",
      page: "contact",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      icon: Gamepad2,
      labelEn: "Games",
      labelEs: "Juegos",
      page: "games",
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      icon: Users,
      labelEn: "Church Staff",
      labelEs: "Personal de la Iglesia",
      page: "https://www.emanuelavina.com/dashboard/client-portal",
      color: "bg-[--ink-mid] hover:bg-[--ink-dark]",
      isExternal: true,
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
          className="hero-image w-full object-cover h-[90vh] md:h-[40rem] object-[center_55%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[--sage]/10 via-transparent to-transparent" />
        <div className="absolute inset-0 hero-gradient-blend md:bg-gradient-to-b md:from-black/20 md:via-black/40 md:to-black/60" />
        <div className="absolute top-[calc(env(safe-area-inset-top)+56px)] right-4 md:top-24 z-20">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center justify-center gap-1 rounded-full bg-[--sage]/90 px-3 py-1.5 text-sm font-medium text-white hover:bg-[--sage] shadow-md"
              aria-label={language === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
            >
              <Languages className="h-4 w-4" />
              <span>{language === "en" ? "ESP" : "ENG"}</span>
            </button>
          </div>
          
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center sm:px-10 safe-area-padding translate-y-0 md:translate-y-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white drop-shadow-lg">
            {t("Welcome to", "Bienvenidos a")}
          </p>
          <h2 className="mt-2 serif-heading hero-title text-4xl font-bold text-white sm:text-5xl md:text-6xl drop-shadow-2xl">
            {t("Center of New Hope", "Centro de Nueva Esperanza")}
          </h2>
          <p className="mt-6 max-w-3xl hero-subtitle text-lg text-white/90 md:text-xl drop-shadow-lg">
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
              className="border-white/30 bg-black/40 backdrop-blur-sm px-8 py-4 text-lg text-white hover:bg-black/60 hover:text-white shadow-md"
            >
              {t("Watch Live", "Ver en Vivo")}
            </Button>
          </div>
        </div>
      </section>
      <div className="container mx-auto space-y-10 px-4 -mt-16 relative z-10">
        {/* Top row: Upcoming Event first in DOM (top on mobile), right column on desktop */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Upcoming Event — first in DOM so it's top on mobile; col 3 on desktop */}
          <section className="warm-card p-6 lg:col-start-3 lg:row-start-1">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[--sage]">
              {t("Upcoming Event", "Próximo Evento")}
            </p>
            {eventsLoading ? (
              <div className="mt-4 h-24 animate-pulse rounded-xl bg-[--surface-mid]/50" />
            ) : eventsError ? (
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-[--ink-dark]">
                  {t("Join Us This Sunday!", "¡Únete a Nosotros Este Domingo!")}
                </h3>
                <p className="mt-2 text-[--ink-mid]">
                  {t(
                    "We gather every week to worship, learn, and grow together.",
                    "Nos reunimos cada semana para adorar, aprender y crecer juntos."
                  )}
                </p>
                <div className="mt-4 flex flex-col gap-2 text-sm text-[--ink-mid]">
                  {churchInfo?.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[--sage]" />
                      <span>{churchInfo.address}</span>
                    </div>
                  )}
                  {churchInfo?.service_times ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[--sage]" />
                      <span>{churchInfo.service_times}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[--sage]" />
                        <span>{t("Yuma at", "Yuma a las")} {serviceTimes[language].yuma}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[--sage]" />
                        <span>{t("Holyoke at", "Holyoke a las")} {serviceTimes[language].holyoke}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : nextEvent ? (
              <>
                {nextEvent.imageUrl && (
                  <div className="mt-3 aspect-video overflow-hidden rounded-xl bg-[--surface-mid]">
                    <img
                      src={nextEvent.imageUrl}
                      alt={t(nextEvent.titleEn, nextEvent.titleEs)}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <h3 className="mt-2 serif-heading text-xl font-bold text-[--ink-dark]">
                  {t(nextEvent.titleEn, nextEvent.titleEs)}
                </h3>
                <div className="mt-3 flex flex-col gap-2 text-sm text-[--ink-mid]">
                  {formattedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[--sage]" />
                      <span>{formattedDate}</span>
                    </div>
                  )}
                  {nextEvent.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[--sage]" />
                      <span>{nextEvent.location}</span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      // News is always mounted, so ask it to switch to the
                      // events tab via a runtime event (localStorage is only
                      // read at app startup).
                      window.localStorage.setItem(NEWS_DEFAULT_TAB_KEY, "events");
                      window.dispatchEvent(
                        new CustomEvent("cne-set-news-tab", { detail: "events" })
                      );
                    }
                    onNavigate("news");
                  }}
                  className="warm-button-primary mt-4 w-full px-4 py-2"
                >
                  {t("See Details", "Ver detalles")}
                </Button>
              </>
            ) : (
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-[--ink-dark]">
                  {t("Join Us This Sunday!", "¡Únete a Nosotros Este Domingo!")}
                </h3>
                <p className="mt-2 text-[--ink-mid]">
                  {t(
                    "We gather every week to worship, learn, and grow together.",
                    "Nos reunimos cada semana para adorar, aprender y crecer juntos."
                  )}
                </p>
                <div className="mt-4 flex flex-col gap-2 text-sm text-[--ink-mid]">
                  {churchInfo?.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[--sage]" />
                      <span>{churchInfo.address}</span>
                    </div>
                  )}
                  {churchInfo?.service_times ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[--sage]" />
                      <span>{churchInfo.service_times}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[--sage]" />
                        <span>{t("Yuma at", "Yuma a las")} {serviceTimes[language].yuma}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[--sage]" />
                        <span>{t("Holyoke at", "Holyoke a las")} {serviceTimes[language].holyoke}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Quick Actions — cols 1–2 on desktop, second on mobile */}
          <div className="space-y-6 lg:col-start-1 lg:col-span-2 lg:row-start-1">
            <h2 className="serif-heading text-3xl font-bold text-[--ink-dark]">
              {t("Quick Actions", "Acciones Rápidas")}
            </h2>
            <div className="grid gap-4 grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;

                if (action.isExternal) {
                  return (
                    <button
                      key={action.page}
                      type="button"
                      onClick={() => void openSheetBrowser(action.page)}
                      className="warm-card group p-6 text-left transition-all hover:scale-105"
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[--sage]/10 group-hover:bg-[--sage]/20">
                        <Icon className={action.iconClassName ?? "h-6 w-6 text-[--sage]"} />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-[--ink-dark]">
                        {t(action.labelEn, action.labelEs)}
                      </h3>
                      <p className="text-sm text-[--ink-mid]">
                        {t(
                          "Access the church admin dashboard",
                          "Acceder al panel de administración de la iglesia"
                        )}
                      </p>
                    </button>
                  );
                }

                return (
                  <button
                    key={action.page}
                    onClick={() => {
                      // "Support Our Ministry" pops the Tithe.ly page as a
                      // sheet directly — no page navigation — via
                      // SFSafariViewController (Apple Guideline 3.2.2(iv)).
                      // Fall back to the Donations page if the URL hasn't
                      // loaded yet.
                      if (action.page === "donations") {
                        if (donationUrl) {
                          void openDonationSheet(donationUrl);
                        } else {
                          onNavigate("donations");
                        }
                        return;
                      }
                      onNavigate(action.page);
                    }}
                    className="warm-card group p-6 text-left transition-all hover:scale-105"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[--sage]/10 group-hover:bg-[--sage]/20">
                      <Icon className={action.iconClassName ?? "h-6 w-6 text-[--sage]"} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-[--ink-dark]">
                      {t(action.labelEn, action.labelEs)}
                    </h3>
                    <p className="text-sm text-[--ink-mid]">
                      {action.page === "contact" && t(
                        "Get in touch with our team",
                        "Ponte en contacto con nuestro equipo"
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

        </div>

        <section className="space-y-6">
          <h2 className="serif-heading text-3xl font-bold text-[--ink-dark]">
            {t("Who We Are", "Quiénes Somos")}
          </h2>
          <p className="max-w-3xl text-lg leading-relaxed text-[--ink-mid] whitespace-pre-wrap">
            {churchInfo?.description || t(
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


        {UGC_ENABLED && (
        <section className="warm-card p-8">
          <h2 className="mb-6 serif-heading text-3xl font-bold text-[--ink-dark]">
            {t("Submit a Prayer Request", "Enviar una petición de oración")}
          </h2>
          <p className="text-lg text-[--ink-mid]">
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
              <Label htmlFor="prayer-title" className="text-[--ink-mid]">
                {t("Title", "Título")}
              </Label>
              <Input
                id="prayer-title"
                value={prayerTitle}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setPrayerTitle(event.target.value)}
                required
                className="border-[--border-color] bg-[--surface] text-[--ink-dark]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prayer-description" className="text-[--ink-mid]">
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
                className="border-[--border-color] bg-[--surface] text-[--ink-dark]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prayer-name" className="text-[--ink-mid]">
                {t("Name", "Nombre")}
              </Label>
              <Input
                id="prayer-name"
                value={prayerName}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setPrayerName(event.target.value)}
                placeholder={t("Optional", "Opcional")}
                className="border-[--border-color] bg-[--surface] text-[--ink-dark]"
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
        )}
      </div>
    </div>
  );
}
