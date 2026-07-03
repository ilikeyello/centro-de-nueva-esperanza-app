import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Heart } from "lucide-react";
import { Browser } from "@capacitor/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { getChurchAdditionalInfo, type ChurchAdditionalInfo } from "../../lib/mainSiteData";

export interface DonationsProps {
  onNavigate?: (page: string) => void;
}

/**
 * Resolve the URL donors should be sent to.
 *
 * Apple Guideline 3.2.2(iv): donation flows may not be rendered inside an
 * embedded/native-looking view (e.g. an in-app iframe). They must open
 * outside the app's WebView via Safari or SFSafariViewController. We only
 * ever hand this URL to `Browser.open()` (never render it in an iframe) so
 * that on iOS it always launches in SFSafariViewController.
 */
function getDonationUrl(
  churchInfo: Pick<ChurchAdditionalInfo, "tithely_url" | "tithely_embed"> | null | undefined
): string | null {
  if (!churchInfo) return null;
  if (churchInfo.tithely_url) return churchInfo.tithely_url;

  if (churchInfo.tithely_embed) {
    const formIdMatch = churchInfo.tithely_embed.match(/data-form=["']([^"']+)["']/);
    if (formIdMatch?.[1]) {
      return `https://give.tithe.ly/?formId=${formIdMatch[1]}`;
    }
  }

  return null;
}

export function Donations({ onNavigate }: DonationsProps) {
  const { t } = useLanguage();

  const { data: churchInfo } = useQuery({
    queryKey: ["churchInfo"],
    queryFn: () => getChurchAdditionalInfo(),
  });

  const donationUrl = getDonationUrl(churchInfo);

  const handleGive = async () => {
    if (!donationUrl) return;
    // Browser.open() presents SFSafariViewController on iOS, Chrome Custom
    // Tabs on Android, and a new tab on web — never an in-app embedded view.
    await Browser.open({ url: donationUrl });
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8 max-w-2xl">
      <div className="flex flex-col gap-3 text-center sm:text-left">
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
          <h1 className="serif-heading text-3xl font-bold text-[--ink-dark]">
            {t("Give to Our Church", "Dar a Nuestra Iglesia")}
          </h1>
        </div>
        <p className="text-[--ink-mid]">
          {t(
            "Your generosity helps us serve our community and spread God's love",
            "Tu generosidad nos ayuda a servir a nuestra comunidad y difundir el amor de Dios"
          )}
        </p>
      </div>

      {donationUrl ? (
        <Card className="bg-surface border-border-color mt-8">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 bg-sage-light rounded-full flex items-center justify-center mb-2">
              <Heart className="h-8 w-8 text-sage" />
            </div>
            <h2 className="serif-heading text-2xl font-bold text-ink-dark">
              {t("Donate via Tithe.ly", "Donar a través de Tithe.ly")}
            </h2>
            <p className="text-[--ink-mid] max-w-sm">
              {t(
                "You'll be securely taken to Tithe.ly in a browser window to complete your gift.",
                "Serás llevado de forma segura a Tithe.ly en una ventana del navegador para completar tu donación."
              )}
            </p>
            <Button
              className="bg-[--sage] hover:bg-[--sage-mid] text-white w-full sm:w-auto px-10 py-7 mt-6 text-lg tracking-wide rounded-xl shadow-md transition-transform hover:scale-105 flex items-center gap-3"
              onClick={handleGive}
            >
              <span>{t("Give with Tithe.ly", "Dar con Tithe.ly")}</span>
              <ExternalLink className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
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
