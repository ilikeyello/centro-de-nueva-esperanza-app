import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Facebook } from "lucide-react";
import { useBackend } from "../../hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";

interface ContactProps {
  onNavigate?: (page: string) => void;
}

export function Contact({ onNavigate }: ContactProps) {
  const { language, t } = useLanguage();
  const backend = useBackend();

  const { data: churchInfo } = useQuery({
    queryKey: ["churchInfo"],
    queryFn: () => backend.church.info(),
  });

  if (!churchInfo) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("home")}
              className="text-neutral-300 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-3xl font-bold text-white">
            {t("Contact Us", "Contáctanos")}
          </h1>
        </div>
        <p className="text-neutral-400">
          {t("We'd love to hear from you!", "¡Nos encantaría saber de ti!")}
        </p>
      </div>

      <Card className="border-neutral-800 bg-neutral-900/50">
        <CardHeader>
          <CardTitle className="text-white">
            {language === "en" ? churchInfo.nameEn : churchInfo.nameEs}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-red-500" />
            <div>
              <p className="font-semibold text-white">
                {t("Address", "Dirección")}
              </p>
              <p className="text-neutral-300">{churchInfo.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="mt-1 h-5 w-5 text-red-500" />
            <div>
              <p className="font-semibold text-white">
                {t("Phone", "Teléfono")}
              </p>
              <a
                href={`tel:${churchInfo.phone}`}
                className="text-neutral-300 hover:text-red-500"
              >
                {churchInfo.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 text-red-500" />
            <div>
              <p className="font-semibold text-white">
                {t("Email", "Correo Electrónico")}
              </p>
              <a
                href={`mailto:${churchInfo.email}`}
                className="text-neutral-300 hover:text-red-500"
              >
                {churchInfo.email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-1 h-5 w-5 text-red-500" />
            <div>
              <p className="font-semibold text-white">
                {t("Service Times", "Horarios de Servicio")}
              </p>
              <p className="text-neutral-300">
                {language === "en"
                  ? churchInfo.serviceTimesEn
                  : churchInfo.serviceTimesEs}
              </p>
            </div>
          </div>

          {churchInfo.facebookPageUrl && (
            <div className="flex items-start gap-3">
              <Facebook className="mt-1 h-5 w-5 text-red-500" />
              <div>
                <p className="font-semibold text-white">
                  {t("Follow Us", "Síguenos")}
                </p>
                <a
                  href={churchInfo.facebookPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-300 hover:text-red-500"
                >
                  {t("Visit our Facebook page", "Visita nuestra página de Facebook")}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {churchInfo.latitude && churchInfo.longitude && (
        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="text-white">
              {t("Location", "Ubicación")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video overflow-hidden rounded-lg">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${churchInfo.latitude},${churchInfo.longitude}`}
                allowFullScreen
              />
            </div>
            <Button
              className="mt-4 w-full bg-red-600 hover:bg-red-700"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${churchInfo.latitude},${churchInfo.longitude}`,
                  "_blank"
                )
              }
            >
              <MapPin className="mr-2 h-4 w-4" />
              {t("Get Directions", "Obtener Direcciones")}
            </Button>
          </CardContent>
        </Card>
      )}

      {churchInfo.descriptionEn && churchInfo.descriptionEs && (
        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="text-white">
              {t("About Us", "Sobre Nosotros")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-neutral-300">
              {language === "en"
                ? churchInfo.descriptionEn
                : churchInfo.descriptionEs}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
