import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Users, HandHeart, Clock, MapPin, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { getChurchAdditionalInfo } from "../../lib/mainSiteData";

interface NewHereProps {
  onNavigate?: (page: string) => void;
}

export function NewHere({ onNavigate }: NewHereProps) {
  const { t } = useLanguage();

  const { data: churchInfo } = useQuery({
    queryKey: ["churchInfo"],
    queryFn: () => getChurchAdditionalInfo(),
  });

  const highlights = [
    {
      icon: Sparkles,
      titleEn: "Heartfelt Worship",
      titleEs: "Alabanza de Corazón",
      descriptionEn: "Sing, pray, and hear a message of hope every week.",
      descriptionEs: "Canta, ora y escucha un mensaje de esperanza cada semana.",
    },
    {
      icon: Users,
      titleEn: "A Church Family",
      titleEs: "Una Familia de Fe",
      descriptionEn: "Everyone is welcome here, no matter your age or your story.",
      descriptionEs: "Aquí todos son bienvenidos, sin importar tu edad o tu historia.",
    },
    {
      icon: HandHeart,
      titleEn: "Come Say Hello",
      titleEs: "Ven a Saludarnos",
      descriptionEn: "After the service, stay and say hi. We'd love to meet you!",
      descriptionEs: "Después del servicio, quédate a saludarnos. ¡Nos encantaría conocerte!",
    },
  ];

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex items-center gap-3">
        {onNavigate && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("home")}
            className="text-[--ink-mid] hover:text-[--sage]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[--sage]">
            {t("Plan Your Visit", "Planea Tu Visita")}
          </p>
          <h1 className="mt-2 serif-heading text-3xl font-bold text-[--ink-dark] sm:text-4xl">
            {t("New Here?", "¿Primera Vez Aquí?")}
          </h1>
          <p className="mt-3 max-w-2xl text-[--ink-mid] whitespace-pre-wrap">
            {churchInfo?.description || t(
              "We're so glad you're here! Here's what to expect when you visit.",
              "¡Qué bueno que estás aquí! Esto es lo que puedes esperar cuando nos visites."
            )}
          </p>
          {(churchInfo?.facebook_page_url || churchInfo?.youtube_url) && (
            <div className="mt-4 flex gap-3">
              {churchInfo.facebook_page_url && (
                <a
                  href={churchInfo.facebook_page_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sage-icon-btn flex h-10 w-10 items-center justify-center rounded-full transition-colors shadow-sm"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {churchInfo.youtube_url && (
                <a
                  href={churchInfo.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sage-icon-btn flex h-10 w-10 items-center justify-center rounded-full transition-colors shadow-sm"
                  aria-label="YouTube"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.titleEn} className="warm-card p-6">
              <Icon className="h-7 w-7 text-[--sage]" />
              <h3 className="mt-4 text-lg font-semibold text-[--ink-dark]">
                {t(item.titleEn, item.titleEs)}
              </h3>
              <p className="mt-2 text-sm text-[--ink-mid]">
                {t(item.descriptionEn, item.descriptionEs)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Locations and Services Section */}
      {churchInfo && (churchInfo.address || churchInfo.service_times) ? (
        <div className="warm-card p-6">
          <h2 className="serif-heading text-xl font-semibold text-[--ink-dark] mb-4">
            {t("Our Church", "Nuestra Iglesia")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {churchInfo.address && (
              <div className="border-l-4 border-[--sage] pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-5 w-5 text-[--sage]" />
                  <h3 className="font-semibold text-[--ink-dark]">{t("Location", "Ubicación")}</h3>
                </div>
                <div className="text-sm text-[--ink-mid]">
                  <p>{churchInfo.address}</p>
                </div>
              </div>
            )}
            {churchInfo.service_times && (
              <div className="border-l-4 border-[--sage] pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-[--sage]" />
                  <h3 className="font-semibold text-[--ink-dark]">{t("Service Times", "Horarios de Servicio")}</h3>
                </div>
                <div className="text-sm text-[--ink-mid] whitespace-pre-wrap">
                  <p>{churchInfo.service_times}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="warm-card p-6">
          <h2 className="serif-heading text-xl font-semibold text-[--ink-dark] mb-4">
            {t("Our Locations", "Nuestras Ubicaciones")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border-l-4 border-[--sage] pl-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-[--sage]" />
                <h3 className="font-semibold text-[--ink-dark]">Yuma, Colorado</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-[--ink-mid]">
                <Clock className="h-4 w-4 text-[--sage]" />
                <span>{t("Service at", "Servicio a las")} 3:00 PM</span>
              </div>
            </div>
            <div className="border-l-4 border-[--sage] pl-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-[--sage]" />
                <h3 className="font-semibold text-[--ink-dark]">Holyoke, Colorado</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-[--ink-mid]">
                <Clock className="h-4 w-4 text-[--sage]" />
                <span>{t("Service at", "Servicio a las")} 7:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="warm-card p-6">
        <h2 className="serif-heading text-xl font-semibold text-[--ink-dark]">
          {t("Have Questions?", "¿Tienes Preguntas?")}
        </h2>
        <p className="mt-2 text-[--ink-mid]">
          {t(
            "Send us a message anytime. We're happy to help with your first visit.",
            "Escríbenos cuando quieras. Con gusto te ayudamos con tu primera visita."
          )}
        </p>
        <Button
          onClick={() => onNavigate?.("contact")}
          className="warm-button-primary mt-4 px-6 py-5 text-base font-semibold"
        >
          {t("Contact Us", "Contáctanos")}
        </Button>
      </div>
    </div>
  );
}
