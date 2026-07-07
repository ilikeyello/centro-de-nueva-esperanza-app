import { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TriviaAdminPanelFinal } from "../admin/TriviaAdminPanelFinal";
import { WordSearchAdminPanel } from "../admin/WordSearchAdminPanel";
import { ExternalLink } from "lucide-react";
import { openSheetBrowser } from "../../lib/systemBrowser";

/**
 * In-app admin. Media (devotionals, livestream, worship music) is now managed
 * through the Emanuel Web Design dashboard, where videos/audio are uploaded to
 * Mux. This page keeps the in-app game admin (trivia + word search) only.
 */
export function AdminUpload() {
  const { t } = useLanguage();
  const [uploadPasscode, setUploadPasscode] = useState("");

  const dashboardUrl = "https://www.emanuelavina.com/dashboard";

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[--sage]">
          {t("Admin", "Admin")}
        </p>
        <h1 className="text-2xl font-bold text-[--ink-dark]">
          {t("Admin", "Admin")}
        </h1>
        <p className="text-sm text-[--ink-light]">
          {t(
            "Manage in-app games here. Devotionals, livestream and worship music are managed in the web dashboard.",
            "Administra los juegos de la app aquí. Los devocionales, la transmisión en vivo y la música se administran en el panel web."
          )}
        </p>
      </div>

      {/* Media management moved to the web dashboard (Mux) */}
      <div className="rounded-2xl border border-[--border-color] bg-[--surface]/40 p-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-[--ink-light]">
          {t("Media, Livestream & Music", "Medios, Transmisión y Música")}
        </p>
        <p className="mt-2 text-sm text-[--ink-mid]">
          {t(
            "Upload video devotionals, set up the Mux livestream, and add worship tracks from the church web dashboard. Content appears in the app automatically once it finishes processing.",
            "Sube devocionales en video, configura la transmisión en vivo de Mux y agrega canciones de adoración desde el panel web de la iglesia. El contenido aparece en la app automáticamente cuando termina de procesarse."
          )}
        </p>
        <button
          type="button"
          onClick={() => void openSheetBrowser(dashboardUrl)}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-[--sage] px-3 py-1.5 text-[0.75rem] font-semibold text-white transition-colors hover:bg-[--sage-mid]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t("Open Web Dashboard", "Abrir Panel Web")}
        </button>
      </div>

      {/* In-app game admin */}
      <div className="rounded-2xl border border-[--border-color] bg-[--surface]/40 p-5 text-xs text-[--ink-mid]">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-[--ink-light]">
          {t("Admin Code", "Código de Admin")}
        </p>
        <p className="mt-1 text-[--ink-light]">
          {t(
            "Enter the secret admin code to manage games.",
            "Ingresa el código secreto de admin para administrar los juegos."
          )}
        </p>
        <input
          type="password"
          placeholder={t("Admin code", "Código de admin")}
          value={uploadPasscode}
          onChange={(e) => setUploadPasscode(e.target.value)}
          className="mt-3 w-full rounded-md border border-[--border-color] bg-[--surface-mid] px-2 py-1 text-[0.7rem] text-[--ink-dark] placeholder:text-[--ink-light] focus:outline-none focus:ring-[--sage] sm:w-64"
        />

        <div className="mt-5">
          <Tabs defaultValue="trivia" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trivia">{t("Trivia", "Trivia")}</TabsTrigger>
              <TabsTrigger value="wordSearch">{t("Word Search", "Sopa de Letras")}</TabsTrigger>
            </TabsList>
            <TabsContent value="trivia" className="mt-4">
              <TriviaAdminPanelFinal passcode={uploadPasscode} />
            </TabsContent>
            <TabsContent value="wordSearch" className="mt-4">
              <WordSearchAdminPanel passcode={uploadPasscode} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
