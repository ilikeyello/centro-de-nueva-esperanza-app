import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Calendar, Gamepad2, Heart, MapPin, Megaphone, Languages, Clock, Users, Play, BookOpen } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "../../contexts/LanguageContext";
import { usePlayer } from "../../contexts/PlayerContext";
import { useBackend } from "../../hooks/useBackend";
import { getChurchAdditionalInfo } from "../../lib/mainSiteData";
import { getDonationUrl, invalidateDonationPrewarm, openDonationSheet, prewarmDonation } from "../../lib/donations";
import { openSheetBrowser } from "../../lib/systemBrowser";
import { UGC_ENABLED } from "@/lib/featureFlags";
import { VerseOfTheDayDialog, VerseOfTheDayHero, useVerseOfTheDay } from "../VerseOfTheDay";

interface HomeProps {
  onNavigate: (page: string) => void;
}

const NEWS_DEFAULT_TAB_KEY = "cne-news-default-tab";

/**
 * Announcement bodies are rich text from the dashboard editor, so they arrive
 * as HTML. The News page renders that markup; here we only want a short teaser,
 * so flatten it to plain text instead — otherwise the card literally shows
 * "<p>" and friends.
 *
 * DOMParser is used rather than assigning innerHTML: it never executes scripts
 * or fetches resources, so admin-authored markup can't do anything unexpected.
 */
function htmlToPlainText(html: string): string {
  if (!html) return "";
  try {
    // Turn block boundaries into spaces first, or words run together.
    const spaced = html.replace(/<\/(p|div|h[1-6]|li|tr)>|<br\s*\/?>/gi, " ");
    const text = new DOMParser().parseFromString(spaced, "text/html").body.textContent ?? "";
    return text.replace(/\s+/g, " ").trim();
  } catch {
    // Very old WebViews without DOMParser: strip tags crudely rather than fail.
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
}

export function Home({ onNavigate }: HomeProps) {
  const { t, language, toggleLanguage } = useLanguage();
  const { livestreamIsLive } = usePlayer();
  const backend = useBackend();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [prayerTitle, setPrayerTitle] = useState("");
  const [prayerDescription, setPrayerDescription] = useState("");
  const [prayerName, setPrayerName] = useState("");

  // Bundled with the app (public/hero-home.jpg) so it loads instantly and works offline.
  const heroImageUrl = "/hero-home.jpg";

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

  const { verse, loading: verseLoading } = useVerseOfTheDay();

  const { data: announcementsData } = useQuery({
    queryKey: ["announcements", "latest"],
    queryFn: () => backend.listAnnouncements({ limit: 5 }),
  });

  // listAnnouncements sorts by priority then recency, so the newest is not
  // necessarily first — sort by date here and drop anything already expired.
  const latestAnnouncement = (announcementsData?.announcements ?? [])
    .filter((a: any) => !a.expiresAt || new Date(a.expiresAt).getTime() > Date.now())
    .slice()
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

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
      {/* Pops once per new verse — i.e. the first time the app is opened today. */}
      <VerseOfTheDayDialog verse={verse} loading={verseLoading} />
      <section className="relative -mt-20 md:-mt-16">
        <img
          src={heroImageUrl}
          alt={t("Church congregation worshiping together", "Congregación adorando juntos")}
          className="hero-image hero-fade-mask w-full object-cover h-[100vh] md:h-[40rem] object-[33%_55%] md:object-[60%_55%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[--sage]/10 via-transparent to-transparent" />
        {/* The photo fades itself out (.hero-fade-mask), so it blends into
            whatever background is behind it — no hard edge at the top of the page. */}
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
          
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 pt-[6vh] text-center safe-area-padding md:pt-0 md:translate-y-8">
            <img
              data-hero-logo
              src="/cne_logo_white.png"
              alt="Centro de Nueva Esperanza"
              width={1000}
              height={598}
              // The soft shadow is baked into the PNG (with transparent padding,
              // hence the larger width): CSS drop-shadow drew a dark box
              // around the logo on iPhone, especially while it animates.
              className="-my-5 h-auto w-[200px] sm:-my-6 sm:w-[240px] md:-my-7 md:w-[280px]"
            />
            <VerseOfTheDayHero verse={verse} />
            {/* Opens today's verse in the app's Bible page, scrolled to and highlighted. */}
            {verse && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("cne-open-bible-verse", {
                      detail: { book: verse.book, chapter: verse.chapter, verse: verse.verse, version: verse.version },
                    })
                  );
                  onNavigate("bible");
                }}
                className="hero-live-btn mt-5 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
              >
                <BookOpen className="h-4 w-4" />
                {t("Read in Bible", "Leer en la Biblia")}
              </button>
            )}
            {/* "View Media" — becomes "Live Now" with a pulsing red dot while
                the livestream is on. */}
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("cne-media-tab", { detail: "live" }));
                onNavigate("media");
              }}
              className={`hero-live-btn mt-4 flex items-center gap-2.5 rounded-full px-6 py-3 text-base font-semibold text-white${livestreamIsLive ? " is-live" : ""}`}
            >
              {livestreamIsLive ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                  </span>
                  {t("Live Now", "En Vivo Ahora")}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  {t("View Media", "Ver Medios")}
                </>
              )}
            </button>
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

            {/* Latest announcement, directly under the Quick Action buttons. */}
            {latestAnnouncement && (
              <section className="warm-card p-6">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-[--sage]" />
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[--sage]">
                    {t("Latest Announcement", "Último Anuncio")}
                  </p>
                </div>
                {latestAnnouncement.imageUrl && (
                  <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-[--surface-mid]">
                    <img
                      src={latestAnnouncement.imageUrl}
                      alt={t(latestAnnouncement.titleEn, latestAnnouncement.titleEs)}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <h3 className="mt-3 serif-heading text-xl font-bold text-[--ink-dark]">
                  {htmlToPlainText(
                    t(latestAnnouncement.titleEn, latestAnnouncement.titleEs)
                  )}
                </h3>
                <p className="mt-2 line-clamp-4 text-[--ink-mid]">
                  {htmlToPlainText(
                    t(latestAnnouncement.contentEn, latestAnnouncement.contentEs)
                  )}
                </p>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-xs text-[--ink-light]">
                    {new Date(latestAnnouncement.createdAt).toLocaleDateString(
                      language === "en" ? "en-US" : "es-ES",
                      { month: "long", day: "numeric", year: "numeric" }
                    )}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.localStorage.setItem(NEWS_DEFAULT_TAB_KEY, "announcements");
                        window.dispatchEvent(
                          new CustomEvent("cne-set-news-tab", { detail: "announcements" })
                        );
                      }
                      onNavigate("news");
                    }}
                    className="border-[--border-color] px-4 py-2 text-[--ink-dark]"
                  >
                    {t("See All", "Ver Todos")}
                  </Button>
                </div>
              </section>
            )}
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
