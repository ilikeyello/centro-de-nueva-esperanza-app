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
              className="text-neutral-700 hover:text-warm-red"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="serif-heading text-3xl font-bold text-neutral-900">
            {t("Contact Us", "Contáctanos")}
          </h1>
        </div>
        <p className="text-neutral-600">
          {t("We'd love to hear from you!", "¡Nos encantaría saber de ti!")}
        </p>
      </div>

      <Card className="warm-card">
        <CardHeader>
          <CardTitle className="serif-heading text-neutral-900">
            {language === "en" ? churchInfo.nameEn : churchInfo.nameEs}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-warm-red" />
            <div>
              <p className="font-semibold text-neutral-900">
                {t("Address", "Dirección")}
              </p>
              <p className="text-neutral-700">{churchInfo.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="mt-1 h-5 w-5 text-warm-red" />
            <div>
              <p className="font-semibold text-neutral-900">
                {t("Phone", "Teléfono")}
              </p>
              <a
                href={`tel:${churchInfo.phone}`}
                className="text-neutral-700 hover:text-warm-red"
              >
                {churchInfo.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 text-warm-red" />
            <div>
              <p className="font-semibold text-neutral-900">
                {t("Email", "Correo Electrónico")}
              </p>
              <a
                href={`mailto:${churchInfo.email}`}
                className="text-neutral-700 hover:text-warm-red"
              >
                {churchInfo.email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-1 h-5 w-5 text-warm-red" />
            <div>
              <p className="font-semibold text-neutral-900">
                {t("Service Times", "Horarios de Servicio")}
              </p>
              <p className="text-neutral-700">
                {language === "en"
                  ? churchInfo.serviceTimesEn
                  : churchInfo.serviceTimesEs}
              </p>
            </div>
          </div>

          {churchInfo.facebookPageUrl && (
            <div className="flex items-start gap-3">
              <Facebook className="mt-1 h-5 w-5 text-warm-red" />
              <div>
                <p className="font-semibold text-neutral-900">
                  {t("Follow Us", "Síguenos")}
                </p>
                <a
                  href={churchInfo.facebookPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-700 hover:text-warm-red"
                >
                  {t("Visit our Facebook page", "Visita nuestra página de Facebook")}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {churchInfo.descriptionEn && churchInfo.descriptionEs && (
        <Card className="warm-card">
          <CardHeader>
            <CardTitle className="serif-heading text-neutral-900">
              {t("About Us", "Sobre Nosotros")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-neutral-700">
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
