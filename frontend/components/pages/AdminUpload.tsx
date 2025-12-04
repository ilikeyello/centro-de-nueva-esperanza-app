import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { usePlayer } from "../../contexts/PlayerContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TriviaAdminPanelFinal } from "../admin/TriviaAdminPanelFinal";
import { WordSearchAdminPanel } from "../admin/WordSearchAdminPanel";
import { Trash2 } from "lucide-react";

export function AdminUpload() {
  const { t } = useLanguage();
  const { playlistUrl, setPlaylistUrl, livestreamUrl, setLivestreamUrl } = usePlayer();
  const [uploadPasscode, setUploadPasscode] = useState("");
  const [playlistStatus, setPlaylistStatus] = useState<string | null>(null);
  const [sermons, setSermons] = useState<
    { id: number; title: string; youtubeUrl: string; createdAt: string }[]
  >([]);
  const [loadingSermons, setLoadingSermons] = useState(false);
  const [sermonTitle, setSermonTitle] = useState("");
  const [sermonUrl, setSermonUrl] = useState("");
  const [sermonStatus, setSermonStatus] = useState<string | null>(null);
  const [livestreamStatus, setLivestreamStatus] = useState<string | null>(null);

  useEffect(() => {
    document.title = t("Admin Upload", "Carga de Admin");
  }, [t]);

  useEffect(() => {
    const loadSermons = async () => {
      try {
        setLoadingSermons(true);
        const base = import.meta.env.DEV
          ? "http://127.0.0.1:4000"
          : "https://prod-cne-sh82.encr.app";
        const res = await fetch(`${base}/sermons/recent`);
        if (!res.ok) return;

        const raw = (await res.json()) as any;
        const rawSermons = raw?.sermons;
        const list:
          { id: number; title: string; youtubeUrl: string; createdAt: string }[] = Array.isArray(rawSermons)
          ? rawSermons
          : rawSermons && typeof rawSermons === "object"
          ? Object.values(rawSermons)
          : [];

        setSermons(list);
      } catch {
        // ignore
      } finally {
        setLoadingSermons(false);
      }
    };

    loadSermons();
  }, []);

  const handleSavePlaylist = async () => {
    setPlaylistStatus(null);

    if (!playlistUrl.trim()) {
      setPlaylistStatus(
        t(
          "Enter a playlist URL before saving.",
          "Ingresa una URL de lista de reproducción antes de guardar."
        )
      );
      return;
    }
    if (!uploadPasscode) {
      setPlaylistStatus(
        t(
          "Enter the upload passcode before saving.",
          "Ingresa el código de carga antes de guardar."
        )
      );
      return;
    }

    try {
      const base = import.meta.env.DEV
        ? "http://127.0.0.1:4000"
        : "https://prod-cne-sh82.encr.app";
      const res = await fetch(`${base}/playlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode: uploadPasscode,
          url: playlistUrl.trim(),
        }),
      });

      if (!res.ok) {
        setPlaylistStatus(
          t(
            "Failed to save playlist URL. Check the passcode and URL.",
            "No se pudo guardar la URL de la lista de reproducción. Verifica el código y la URL."
          )
        );
        return;
      }

      setPlaylistStatus(
        t(
          "Playlist URL saved successfully.",
          "URL de la lista de reproducción guardada correctamente."
        )
      );
    } catch {
      setPlaylistStatus(
        t(
          "An unexpected error occurred while saving the playlist URL.",
          "Ocurrió un error inesperado al guardar la URL de la lista de reproducción."
        )
      );
    }
  };

  const handleSaveLivestream = async () => {
    setLivestreamStatus(null);

    // Allow empty URLs (erasing) - don't require validation
    if (!uploadPasscode) {
      setLivestreamStatus(
        t(
          "Enter the upload passcode before saving.",
          "Ingresa el código de carga antes de guardar."
        )
      );
      return;
    }

    try {
      const base = import.meta.env.DEV
        ? "http://127.0.0.1:4000"
        : "https://prod-cne-sh82.encr.app";
      const res = await fetch(`${base}/livestream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode: uploadPasscode,
          url: livestreamUrl.trim(),
        }),
      });

      if (!res.ok) {
        setLivestreamStatus(
          t(
            "Failed to save livestream URL. Check the passcode and URL.",
            "No se pudo guardar la URL de transmisión en vivo. Verifica el código y la URL."
          )
        );
        return;
      }

      setLivestreamStatus(
        t(
          "Livestream URL saved successfully.",
          "URL de transmisión en vivo guardada correctamente."
        )
      );
    } catch {
      setLivestreamStatus(
        t(
          "An unexpected error occurred while saving the livestream URL.",
          "Ocurrió un error inesperado al guardar la URL de transmisión en vivo."
        )
      );
    }
  };

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">
          {t("Admin", "Admin")}
        </p>
        <h1 className="text-2xl font-bold text-white">
          {t("Admin Media & Devotionals", "Admin Medios y Devocionales")}
        </h1>
        <p className="text-sm text-neutral-400">
          {t(
            "Use this page to manage the YouTube music playlist and devotionals for the site.",
            "Usa esta página para administrar la lista de reproducción de música de YouTube y los devocionales para el sitio."
          )}
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 text-xs text-neutral-300">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-neutral-500">
          {t("Admin Code", "Código de Admin")}
        </p>
        <p className="mt-1 text-neutral-400">
          {t(
            "Enter the secret admin code once. It will be used for devotionals.",
            "Ingresa el código secreto de admin una sola vez. Se usará para devocionales."
          )}
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="password"
            placeholder={t("Admin code", "Código de admin")}
            value={uploadPasscode}
            onChange={(e) => setUploadPasscode(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-[0.7rem] text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:w-64"
          />
          <p className="text-[0.65rem] text-neutral-500 sm:flex-1">
            {t("Required for all actions on this page.", "Requerido para todas las acciones en esta página.")}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 text-xs text-neutral-300">
        <Tabs defaultValue="media" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="media">{t("Music", "Música")}</TabsTrigger>
            <TabsTrigger value="other">{t("Media", "Medios")}</TabsTrigger>
            <TabsTrigger value="games">{t("Games", "Juegos")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="media" className="space-y-4 mt-4">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-neutral-500">
                {t("Music Playlist", "Lista de Música")}
              </p>
              <p className="mt-1 text-neutral-400">
                {t(
                  "Set the YouTube playlist used by the Music & Worship section.",
                  "Configura la lista de reproducción de YouTube usada por la sección de Música y Adoración."
                )}
              </p>
              <div className="mt-3 space-y-2 text-[0.75rem]">
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-[0.7rem] text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="https://youtube.com/playlist?list=..."
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="bg-red-600 px-3 py-1 text-[0.75rem] font-semibold hover:bg-red-700"
                    onClick={handleSavePlaylist}
                  >
                    {t("Save Playlist", "Guardar Lista de Reproducción")}
                  </Button>
                </div>
                {playlistStatus && (
                  <p className="text-[0.7rem] text-neutral-400">{playlistStatus}</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="other" className="space-y-4 mt-4">
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-neutral-500">
                {t("Livestream Link", "Enlace de Transmisión en Vivo")}
              </p>
              <p className="mt-1 text-neutral-400">
                {t(
            "Set the YouTube livestream link used by the Watch Live player on the Media page.",
            "Configura el enlace de transmisión en vivo de YouTube usado por el reproductor Ver en Vivo en la página de Medios."
          )}
        </p>
        <div className="mt-3 space-y-2 text-[0.75rem]">
                <input
                  type="text"
                  value={livestreamUrl}
                  onChange={(e) => setLivestreamUrl(e.target.value)}
                  className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-[0.7rem] text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="bg-red-600 px-3 py-1 text-[0.75rem] font-semibold hover:bg-red-700"
                    onClick={handleSaveLivestream}
                  >
                    {t("Save Livestream", "Guardar Transmisión en Vivo")}
                  </Button>
                </div>
                {livestreamStatus && (
                  <p className="text-[0.7rem] text-neutral-400">{livestreamStatus}</p>
                )}
                <p className="text-[0.7rem] text-neutral-500">
                  {t(
                    "Tip: You can paste a regular YouTube link; we will convert it to the correct embed format.",
                    "Consejo: Puedes pegar un enlace normal de YouTube; lo convertiremos al formato de inserción correcto."
                  )}
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-neutral-500">
                {t("Devotionals", "Devocionales")}
              </p>
              <p className="mt-1 text-neutral-400">
                {t(
                  "Add or remove YouTube devotional videos shown on the Media page.",
                  "Agrega o elimina videos devocionales de YouTube que se muestran en la página de Medios."
                )}
              </p>

              <form
                className="mt-4 space-y-2 text-[0.75rem]"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSermonStatus(null);

                  if (!sermonTitle.trim() || !sermonUrl.trim()) {
                    setSermonStatus(
                      t(
                        "Enter a title and YouTube URL before saving.",
                        "Ingresa un título y URL de YouTube antes de guardar."
                )
              );
              return;
            }
            if (!uploadPasscode) {
              setSermonStatus(
                t(
                  "Enter the upload passcode before saving.",
                  "Ingresa el código de carga antes de guardar."
                )
              );
              return;
            }

            try {
              const base = import.meta.env.DEV
                ? "http://127.0.0.1:4000"
                : "https://prod-cne-sh82.encr.app";
              const res = await fetch(`${base}/sermons`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  passcode: uploadPasscode,
                  title: sermonTitle.trim(),
                  youtubeUrl: sermonUrl.trim(),
                }),
              });

              if (!res.ok) {
                setSermonStatus(
                  t(
                    "Failed to save sermon. Check the passcode and URL.",
                    "No se pudo guardar el sermón. Verifica el código y la URL."
                  )
                );
                return;
              }

              const created: { id: number } = await res.json();
              setSermons((prev) => {
                const current = Array.isArray(prev) ? prev : [];
                return [
                  {
                    id: created.id,
                    title: sermonTitle.trim(),
                    youtubeUrl: sermonUrl.trim(),
                    createdAt: new Date().toISOString(),
                  },
                  ...current,
                ];
              });
              setSermonTitle("");
              setSermonUrl("");
              setSermonStatus(
                t(
                  "Devotional saved. Reload the Media page to see it.",
                  "Devocional guardado. Recarga la página de Medios para verlo."
                )
              );
            } catch {
              setSermonStatus(
                t(
                  "An unexpected error occurred while saving the sermon.",
                  "Ocurrió un error inesperado al guardar el sermón."
                )
              );
            }
          }}
        >
          <input
            type="text"
            placeholder={t("Devotional title", "Título del devocional")}
            value={sermonTitle}
            onChange={(e) => setSermonTitle(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-[0.7rem] text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <input
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={sermonUrl}
            onChange={(e) => setSermonUrl(e.target.value)}
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-[0.7rem] text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <Button
            type="submit"
            className="mt-1 bg-red-600 px-3 py-1 text-[0.75rem] font-semibold hover:bg-red-700"
          >
            {t("Save Devotional", "Guardar Devocional")}
          </Button>
        </form>

        {sermonStatus && (
          <p className="mt-2 text-[0.7rem] text-neutral-400">{sermonStatus}</p>
        )}

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950/40 p-2">
          {loadingSermons && (
            <p className="text-[0.7rem] text-neutral-500">
              {t("Loading devotionals...", "Cargando devocionales...")}
            </p>
          )}
          {!loadingSermons && sermons.length === 0 && (
            <p className="text-[0.7rem] text-neutral-500">
              {t("No devotionals found.", "No se encontraron devocionales.")}
            </p>
          )}
          {!loadingSermons && sermons.length > 0 && (
            <ul className="space-y-1">
              {sermons.map((sermon) => (
                <li
                  key={sermon.id}
                  className="flex items-center justify-between rounded-md bg-neutral-900/80 px-2 py-1.5"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="truncate text-[0.8rem] font-medium text-neutral-100">
                      {sermon.title}
                    </p>
                    <p className="truncate text-[0.65rem] text-neutral-500">
                      {sermon.youtubeUrl}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    className="ml-2 bg-red-700 px-2 py-1 text-[0.7rem] hover:bg-red-800"
                    onClick={async () => {
                      if (!uploadPasscode) {
                        setSermonStatus(
                          t(
                            "Enter the upload passcode before deleting.",
                            "Ingresa el código de carga antes de eliminar."
                          )
                        );
                        return;
                      }

                      const confirmDelete = window.confirm(
                        t(
                          "Are you sure you want to delete this devotional?",
                          "¿Seguro que deseas eliminar este devocional?"
                        )
                      );
                      if (!confirmDelete) return;

                      try {
                        const base = import.meta.env.DEV
                          ? "http://127.0.0.1:4000"
                          : "https://prod-cne-sh82.encr.app";
                        const res = await fetch(`${base}/sermons/delete`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            id: sermon.id,
                            passcode: uploadPasscode,
                          }),
                        });

                        if (!res.ok) {
                          setSermonStatus(
                            t(
                              "Delete failed: server returned an error.",
                              "La eliminación falló: el servidor devolvió un error."
                            )
                          );
                          return;
                        }

                        setSermons((prev) => {
                          const current = Array.isArray(prev) ? prev : [];
                          return current.filter((s) => s.id !== sermon.id);
                        });
                        setSermonStatus(
                          t(
                            "Devotional deleted.",
                            "Devocional eliminado."
                          )
                        );
                      } catch {
                        setSermonStatus(
                          t(
                            "An unexpected error occurred while deleting.",
                            "Ocurrió un error inesperado al eliminar."
                          )
                        );
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
            </div>
          </TabsContent>
          
          <TabsContent value="games" className="space-y-4 mt-4">
            <TriviaAdminPanelFinal passcode={uploadPasscode} />
            <WordSearchAdminPanel passcode={uploadPasscode} />
          </TabsContent>
        </Tabs>
      </div>

      <p className="text-[0.7rem] text-neutral-500">
        {t(
          "Tip: Bookmark this URL. It is not linked from the main site.",
          "Consejo: Guarda esta URL en favoritos. No está enlazada desde el sitio principal."
        )}
      </p>
    </div>
  );
}
