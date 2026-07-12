'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { backend } from '@/lib/churchApi';
import { useLanguage } from '@/contexts/LanguageContext';

function getDonationEmbedUrl(tithelyUrl?: string | null, tithelyEmbed?: string | null): string | null {
  if (tithelyUrl) return tithelyUrl;
  if (tithelyEmbed) {
    const match = tithelyEmbed.match(/data-form=["']([^"']+)["']/);
    if (match?.[1]) return `https://give.tithe.ly/?formId=${match[1]}`;
  }
  return null;
}

export default function DonationsPage() {
  const { t } = useLanguage();

  const { data: churchInfo, isLoading } = useQuery({
    queryKey: ['church-info'],
    queryFn: () => backend.getChurchInfo(),
  });

  const embedUrl = getDonationEmbedUrl(churchInfo?.tithelyUrl, churchInfo?.tithelyEmbed);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <Heart className="h-7 w-7 text-green-600" />
        <h1 className="text-2xl font-bold">{t('Support Our Ministry', 'Apoya Nuestro Ministerio')}</h1>
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center text-muted-foreground">
          {t('Loading…', 'Cargando…')}
        </div>
      )}

      {!isLoading && !embedUrl && (
        <p className="text-muted-foreground">
          {t('Donation information is not available right now.', 'La información de donaciones no está disponible en este momento.')}
        </p>
      )}

      {embedUrl && (
        <>
          <iframe
            src={embedUrl}
            title={t('Give', 'Dar')}
            className="w-full rounded-lg border"
            style={{ minHeight: '700px', height: '80vh' }}
            allow="payment"
          />
          <div className="text-center">
            <Button variant="outline" size="sm" asChild>
              <a href={embedUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                {t('Open in new tab', 'Abrir en nueva pestaña')}
              </a>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
