import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Phone, Mail, Clock, Facebook, Youtube } from "lucide-react";
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
              className="text-[--ink-mid] hover:text-[--sage]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="serif-heading text-3xl font-bold text-[--ink-dark]">
            {t("Contact Us", "Contáctanos")}
          </h1>
        </div>
        <p className="text-[--ink-mid]">
          {t("We'd love to hear from you!", "¡Nos encantaría saber de ti!")}
        </p>
      </div>

      <Card className="warm-card">
        <CardHeader>
          <CardTitle className="serif-heading text-[--ink-dark]">
            {churchInfo.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 text-[--sage]" />
            <div>
              <p className="font-semibold text-[--ink-dark]">
                {t("Address", "Dirección")}
              </p>
              <p className="text-[--ink-mid]">{churchInfo.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="mt-1 h-5 w-5 text-[--sage]" />
            <div>
              <p className="font-semibold text-[--ink-dark]">
                {t("Phone", "Teléfono")}
              </p>
              <a
                href={`tel:${churchInfo.phone}`}
                className="text-[--ink-mid] hover:text-[--sage]"
              >
                {churchInfo.phone}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="mt-1 h-5 w-5 text-[--sage]" />
            <div>
              <p className="font-semibold text-[--ink-dark]">
                {t("Email", "Correo Electrónico")}
              </p>
              <a
                href={`mailto:${churchInfo.email}`}
                className="text-[--ink-mid] hover:text-[--sage]"
              >
                {churchInfo.email}
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="mt-1 h-5 w-5 text-[--sage]" />
            <div>
              <p className="font-semibold text-[--ink-dark]">
                {t("Service Times", "Horarios de Servicio")}
              </p>
              <p className="text-[--ink-mid]">
                {churchInfo.serviceTimes}
              </p>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
