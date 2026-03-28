import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { getChurchAdditionalInfo } from "../../lib/mainSiteData";

export interface DonationsProps {
  onNavigate?: (page: string) => void;
}

export function Donations({ onNavigate }: DonationsProps) {
  const { t } = useLanguage();
  
  const { data: churchInfo } = useQuery({
    queryKey: ["churchInfo"],
    queryFn: () => getChurchAdditionalInfo(),
  });

  return (
    <div className="container mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("home")}
              className="text-neutral-700 hover:text-warm-red flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="serif-heading text-3xl font-bold text-neutral-900">
            {t("Give to Our Church", "Dar a Nuestra Iglesia")}
          </h1>
        </div>
        <p className="text-neutral-600">
          {t(
            "Your generosity helps us serve our community and spread God's love",
            "Tu generosidad nos ayuda a servir a nuestra comunidad y difundir el amor de Dios"
          )}
        </p>
      </div>

      {churchInfo?.tithely_url ? (
        <Card className="warm-card border-green-500/50 shadow-md">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Heart className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="serif-heading text-2xl font-bold text-neutral-900">
              {t("Donate via Tithe.ly", "Donar a través de Tithe.ly")}
            </h2>
            <p className="text-neutral-600 max-w-md">
              {t(
                "We have partnered with Tithe.ly to make giving secure and easy. Click the button below to open our official donation portal.",
                "Nos hemos asociado con Tithe.ly para que ofrendar sea seguro y fácil. Haz clic en el botón de abajo para abrir nuestro portal oficial de donaciones."
              )}
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-10 py-7 mt-6 text-lg tracking-wide rounded-xl shadow-md transition-transform hover:scale-105 flex items-center gap-3"
              onClick={() => window.open(churchInfo.tithely_url!, "_blank")}
            >
              <span>{t("Give with Tithe.ly", "Dar con Tithe.ly")}</span>
              <ExternalLink className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="warm-card mt-8">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center mb-2">
              <Heart className="h-8 w-8 text-neutral-400" />
            </div>
            <h2 className="serif-heading text-2xl font-bold text-neutral-900">
              {t("Online Giving Coming Soon", "Donaciones en línea Próximamente")}
            </h2>
            <p className="text-neutral-600 max-w-sm">
              {t(
                "We are currently setting up our online giving platform! Please check back soon or contact us to give directly.",
                "¡Actualmente estamos configurando nuestra plataforma de donaciones en línea! Por favor, vuelve pronto o contáctanos para ofrendar directamente."
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
