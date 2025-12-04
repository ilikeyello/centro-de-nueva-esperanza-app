import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "../../contexts/LanguageContext";

interface WordSearchLevel {
  id: string;
  name: string;
  description: string | null;
  rows: number;
  cols: number;
  words: { id: number; word_en: string; word_es: string | null }[];
}

interface WordSearchAdminPanelProps {
  passcode: string;
}

export function WordSearchAdminPanel({ passcode }: WordSearchAdminPanelProps) {
  const { t, language } = useLanguage();
  const [levels, setLevels] = useState<WordSearchLevel[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [openLevelId, setOpenLevelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState(12);
  const [cols, setCols] = useState(12);
  const [wordsText, setWordsText] = useState("");

  const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";

  const loadLevels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${base}/games/wordsearch/levels`);
      if (!res.ok) throw new Error("Failed to load levels");
      const data = await res.json();
      setLevels(data.levels || []);
    } catch (err) {
      console.error(err);
      setStatus(t("Failed to load word search levels", "Error al cargar niveles de sopa de letras"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLevels();
  }, []);

  const selectLevel = (level: WordSearchLevel) => {
    setSelectedLevelId(level.id);
    setOpenLevelId((current) => (current === level.id ? null : level.id));
    setName(level.name);
    setDescription(level.description || "");
    setRows(level.rows || 12);
    setCols(level.cols || 12);
    setWordsText(
      level.words
        .map((w) => (language === "es" && w.word_es ? `${w.word_en}|${w.word_es}` : w.word_en))
        .join("\n")
    );
  };

  const handleNewLevel = () => {
    setSelectedLevelId(null);
    setOpenLevelId(null);
    setName("");
    setDescription("");
    setRows(12);
    setCols(12);
    setStatus(null);
  };

  const handleSaveLevel = async () => {
    setStatus(null);
    if (!passcode) {
      setStatus(t("Enter admin passcode first", "Ingresa el código de admin primero"));
      return;
    }
    if (!name.trim()) {
      setStatus(t("Enter a level name", "Ingresa un nombre de nivel"));
      return;
    }

    try {
      const res = await fetch(`${base}/games/wordsearch/levels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedLevelId || undefined,
          name: name.trim(),
          description: description.trim() || undefined,
          rows,
          cols,
          passcode,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error("Save failed");
      }
      await loadLevels();
      setStatus(t("Level saved", "Nivel guardado"));
      if (!selectedLevelId) {
        setSelectedLevelId(data.id);
      }
    } catch (err) {
      console.error(err);
      setStatus(t("Failed to save level", "Error al guardar nivel"));
    }
  };

  const handleSaveWords = async () => {
    setStatus(null);
    if (!passcode) {
      setStatus(t("Enter admin passcode first", "Ingresa el código de admin primero"));
      return;
    }
    if (!selectedLevelId) {
      setStatus(t("Save the level first", "Guarda el nivel primero"));
      return;
    }

    const lines = wordsText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const words = lines.map((line) => {
      const [en, es] = line.split("|");
      return { word_en: en.trim(), word_es: es?.trim() };
    });

    try {
      const res = await fetch(`${base}/games/wordsearch/levels/${selectedLevelId}/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedLevelId, passcode, words }),
      });

      const contentType = res.headers.get("content-type") || "";
      let data: any = null;
      if (contentType.includes("application/json")) {
        data = await res.json();
      }

      if (!res.ok || (data && data.success === false)) {
        throw new Error("Save failed");
      }

      await loadLevels();
      setStatus(t("Words saved", "Palabras guardadas"));
    } catch (err) {
      console.error(err);
      setStatus(t("Failed to save words", "Error al guardar palabras"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {t("Word Search Management", "Gestión de Sopa de Letras")}
        </h2>
        {status && (
          <div className="px-3 py-1 rounded text-xs bg-neutral-800 text-neutral-200">
            {status}
          </div>
        )}
      </div>

      {/* Levels Card - refactored: each level row expands to show full editor inline */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>{t("Levels", "Niveles")}</span>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleNewLevel}
            >
              {t("New Level", "Nuevo Nivel")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-[0.7rem] text-neutral-400">
            {t(
              "Create levels and word lists. The game will auto-generate the puzzles.",
              "Crea niveles y listas de palabras. El juego generará los rompecabezas automáticamente."
            )}
          </p>
          {loading && (
            <p className="text-[0.7rem] text-neutral-500">
              {t("Loading levels...", "Cargando niveles...")}
            </p>
          )}
          {!loading && levels.length === 0 && (
            <p className="text-[0.7rem] text-neutral-500">
              {t("No levels yet. Create one below.", "Aún no hay niveles. Crea uno abajo.")}
            </p>
          )}
          {!loading &&
            levels.map((level) => (
              <div key={level.id} className="border border-neutral-800 rounded-lg bg-neutral-900/50">
                <div className="p-4 cursor-pointer hover:bg-neutral-800/50 transition-colors"
                  onClick={() => selectLevel(level)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {openLevelId === level.id ? (
                        <span className="inline-block w-4 text-red-400">▼</span>
                      ) : (
                        <span className="inline-block w-4 text-neutral-400">▶</span>
                      )}
                      <h3 className="font-semibold text-white">{level.name}</h3>
                      <span className="text-sm text-neutral-400">
                        ({level.words.length} {t("words", "palabras")})
                      </span>
                    </div>
                  </div>
                </div>
                {openLevelId === level.id && (
                  <div className="border-t border-neutral-800 p-4 space-y-4">
                    {/* Inline full editor for this level */}
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-[0.7rem] text-neutral-400">{t("Name", "Nombre")}</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-7 border-neutral-700 bg-neutral-950 text-[0.8rem]"
                        />
                      </div>
                      <div className="space-y-1 flex gap-2">
                        <div className="flex-1">
                          <Label className="text-[0.7rem] text-neutral-400">{t("Rows", "Filas")}</Label>
                          <Input
                            type="number"
                            min={8}
                            max={22}
                            value={rows}
                            onChange={(e) => setRows(parseInt(e.target.value || "12", 10))}
                            className="h-7 border-neutral-700 bg-neutral-950 text-[0.8rem]"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-[0.7rem] text-neutral-400">{t("Columns", "Columnas")}</Label>
                          <Input
                            type="number"
                            min={8}
                            max={22}
                            value={cols}
                            onChange={(e) => setCols(parseInt(e.target.value || "12", 10))}
                            className="h-7 border-neutral-700 bg-neutral-950 text-[0.8rem]"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[0.7rem] text-neutral-400">{t("Description", "Descripción")}</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[60px] border-neutral-700 bg-neutral-950 text-[0.8rem]"
                      />
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label className="text-neutral-300">{t("Words", "Palabras")}</Label>
                      <p className="text-[0.7rem] text-neutral-500">
                        {t(
                          "Enter one word per line. Optionally, use 'ENGLISH|ESPAÑOL' to add both languages.",
                          "Ingresa una palabra por línea. Opcionalmente usa 'ENGLISH|ESPAÑOL' para agregar ambos idiomas."
                        )}
                      </p>
                      <Textarea
                        value={wordsText}
                        onChange={(e) => setWordsText(e.target.value)}
                        className="min-h-[120px] border-neutral-700 bg-neutral-950 text-[0.8rem] font-mono"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={async () => { await handleSaveLevel(); await handleSaveWords(); }}
                      className="mt-4 h-7 bg-red-600 px-3 text-[0.75rem] font-semibold hover:bg-red-700"
                    >
                      {t("Save Changes", "Guardar Cambios")}
                    </Button>
                  </div>
                )}
              </div>
            ))}
        </CardContent>
      </Card>

    </div>
  );
}
