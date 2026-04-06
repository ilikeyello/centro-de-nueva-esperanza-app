import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { getChurchAdditionalInfo } from "../../lib/mainSiteData";
import { TithelyEmbed } from "../giving/TithelyEmbed";

export interface DonationsProps {
  onNavigate?: (page: string) => void;
}

export function Donations({ onNavigate }: DonationsProps) {
  const { t } = useLanguage();
  
  const { data: churchInfo } = useQuery({
    queryKey: ["churchInfo"],
    queryFn: () => getChurchAdditionalInfo(),
  });

  const hasEmbed = Boolean(churchInfo?.tithely_embed);

  return (
    <div className={hasEmbed ? "w-full h-full flex flex-col" : "container mx-auto space-y-6 px-4 py-8 max-w-2xl"}>
      <div className={`flex flex-col gap-3 text-center sm:text-left ${hasEmbed ? "px-4 py-4" : ""}`}>
        <div className="flex items-center gap-3">
          {onNavigate && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("home")}
              className="text-[--ink-mid] hover:text-[--sage] flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          {!hasEmbed && (
            <h1 className="serif-heading text-3xl font-bold text-[--ink-dark]">
              {t("Give to Our Church", "Dar a Nuestra Iglesia")}
            </h1>
          )}
          {hasEmbed && (
            <h1 className="serif-heading text-xl font-bold text-[--ink-dark]">
              {t("Give", "Dar")}
            </h1>
          )}
        </div>
        {!hasEmbed && (
          <p className="text-[--ink-mid]">
            {t(
              "Your generosity helps us serve our community and spread God's love",
              "Tu generosidad nos ayuda a servir a nuestra comunidad y difundir el amor de Dios"
            )}
          </p>
        )}
      </div>

      {churchInfo?.tithely_embed || churchInfo?.tithely_url ? (
        hasEmbed ? (
          <div className="flex-[1_1_100%] w-full relative">
            <TithelyEmbed embedCode={churchInfo.tithely_embed!} fullScreen={true} />
          </div>
        ) : (
          <Card className="bg-surface border-border-color mt-8">
            <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
              <div className="h-16 w-16 bg-sage-light rounded-full flex items-center justify-center mb-2">
                <Heart className="h-8 w-8 text-sage" />
              </div>
              <h2 className="serif-heading text-2xl font-bold text-ink-dark">
                {t("Donate via Tithe.ly", "Donar a través de Tithe.ly")}
              </h2>
              <Button
                className="bg-[--sage] hover:bg-[--sage-mid] text-white w-full sm:w-auto px-10 py-7 mt-6 text-lg tracking-wide rounded-xl shadow-md transition-transform hover:scale-105 flex items-center gap-3"
                onClick={() => window.open(churchInfo!.tithely_url!, "_blank")}
              >
                <span>{t("Give with Tithe.ly", "Dar con Tithe.ly")}</span>
                <ExternalLink className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="bg-[--surface] border-[--border-color] mt-8">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 bg-[--sage-light-50] rounded-full flex items-center justify-center mb-2">
              <Heart className="h-8 w-8 text-[--ink-light]" />
            </div>
            <h2 className="serif-heading text-2xl font-bold text-[--ink-dark]">
              {t("Online Giving Coming Soon", "Donaciones en línea Próximamente")}
            </h2>
            <p className="text-[--ink-mid] max-w-sm">
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
