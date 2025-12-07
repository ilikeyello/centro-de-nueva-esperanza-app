import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { Sparkles, Grid3X3, ArrowLeft, Play } from "lucide-react";

interface WordSearchLevel {
  id: string;
  name: string;
  description: string | null;
  rows: number;
  cols: number;
  words: { id: number; word_en: string; word_es: string | null }[];
}

interface PuzzleLevelInfo {
  id: string;
  name: string;
  description: string | null;
  rows: number;
  cols: number;
}

interface PuzzleResult {
  level: PuzzleLevelInfo | null;
  words: string[];
  grid: string[];
  error?: string;
}

interface WordSearchGamePageProps {
  onNavigate?: (page: string) => void;
}

interface CellCoord {
  row: number;
  col: number;
}

interface FoundSegment {
  id: string;
  start: CellCoord;
  end: CellCoord;
}

export function WordSearchGamePage({ onNavigate }: WordSearchGamePageProps) {
  const { t, language } = useLanguage();

  const [levels, setLevels] = useState<WordSearchLevel[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [loadingPuzzle, setLoadingPuzzle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [puzzle, setPuzzle] = useState<PuzzleResult | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(() => new Set());
  const [foundCells, setFoundCells] = useState<Set<string>>(() => new Set());
  const [selectedStart, setSelectedStart] = useState<CellCoord | null>(null);
  const [foundSegments, setFoundSegments] = useState<FoundSegment[]>([]);

  // Palette of soft highlight colors to cycle through for found words
  const highlightColors = [
    "#f97316", // orange-500
    "#22c55e", // green-500
    "#60a5fa", // blue-400
    "#eab308", // yellow-500
    "#ec4899", // pink-500
    "#a855f7", // purple-500
  ];

  const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";

  useEffect(() => {
    const loadLevels = async () => {
      try {
        setLoadingLevels(true);
        setError(null);
        const res = await fetch(`${base}/games/wordsearch/levels`);
        if (!res.ok) throw new Error("Failed to load levels");
        const data = await res.json();
        setLevels(data.levels || []);
      } catch (err) {
        console.error(err);
        setError(
          t(
            "Failed to load word search levels.",
            "Error al cargar niveles de sopa de letras."
          )
        );
      } finally {
        setLoadingLevels(false);
      }
    };

    loadLevels();
  }, [base, t]);

  const resetPuzzleState = () => {
    setPuzzle(null);
    setFoundWords(new Set());
    setFoundCells(new Set());
    setSelectedStart(null);
    setFoundSegments([]);
    setError(null);
  };

  const handleBackToGames = () => {
    resetPuzzleState();
    if (onNavigate) onNavigate("games");
  };

  const handleSelectLevel = async (levelId: string) => {
    try {
      setLoadingPuzzle(true);
      setError(null);
      setFoundWords(new Set());
      setFoundCells(new Set());
      setSelectedStart(null);
      setFoundSegments([]);

      const langParam = language === "es" ? "es" : "en";
      const res = await fetch(
        `${base}/games/wordsearch/puzzle/${encodeURIComponent(levelId)}?lang=${langParam}`
      );

      const data: PuzzleResult = await res.json();

      if (!res.ok || data.error || !data.level || !data.grid || !data.words) {
        throw new Error(data.error || "Failed to load puzzle");
      }

      setPuzzle(data);
    } catch (err) {
      console.error(err);
      setError(
        t("Failed to load puzzle.", "Error al cargar el rompecabezas.")
      );
    } finally {
      setLoadingPuzzle(false);
    }
  };

  const toggleCellSelection = (row: number, col: number) => {
    if (!puzzle || !puzzle.level) return;

    const cols = puzzle.level.cols;
    const rows = puzzle.level.rows;

    if (!selectedStart) {
      setSelectedStart({ row, col });
      return;
    }

    const start = selectedStart;
    const end = { row, col };

    const dr = Math.sign(end.row - start.row);
    const dc = Math.sign(end.col - start.col);

    if (dr === 0 && dc === 0) {
      setSelectedStart(null);
      return;
    }

    const length = Math.max(
      Math.abs(end.row - start.row),
      Math.abs(end.col - start.col)
    ) + 1;

    const validDirection =
      (dr === 0 && dc !== 0) ||
      (dc === 0 && dr !== 0) ||
      (Math.abs(dr) === 1 && Math.abs(dc) === 1);

    if (!validDirection) {
      setSelectedStart(null);
      return;
    }

    const coords: CellCoord[] = [];
    for (let i = 0; i < length; i++) {
      const r = start.row + dr * i;
      const c = start.col + dc * i;
      if (r < 0 || r >= rows || c < 0 || c >= cols) {
        setSelectedStart(null);
        return;
      }
      coords.push({ row: r, col: c });
    }

    const letters = coords
      .map(({ row: r, col: c }) => puzzle.grid[r][c])
      .join("");

    const candidate = letters.toUpperCase();
    const reversed = candidate.split("").reverse().join("");
    const upperWords = new Set(puzzle.words.map((w) => w.toUpperCase()));

    let matched = "";
    if (upperWords.has(candidate)) {
      matched = candidate;
    } else if (upperWords.has(reversed)) {
      matched = reversed;
    }

    if (!matched) {
      setSelectedStart(null);
      return;
    }

    // Determine the canonical segment direction so our highlight line
    // always runs from the first letter of the matched word to the last.
    const segmentStart: CellCoord =
      matched === candidate ? start : end;
    const segmentEnd: CellCoord =
      matched === candidate ? end : start;

    setFoundWords((prev) => {
      const next = new Set(prev);
      next.add(matched);
      return next;
    });

    setFoundCells((prev) => {
      const next = new Set(prev);
      coords.forEach(({ row: r, col: c }) => {
        next.add(`${r},${c}`);
      });
      return next;
    });

    // Record a segment for this found word so we can draw a line across it.
    setFoundSegments((prev) => {
      const id = `${matched}-${segmentStart.row},${segmentStart.col}-${segmentEnd.row},${segmentEnd.col}`;
      if (prev.some((seg) => seg.id === id)) return prev;
      return [
        ...prev,
        {
          id,
          start: segmentStart,
          end: segmentEnd,
        },
      ];
    });

    setSelectedStart(null);
  };

  const renderLevelList = () => (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <Button
        onClick={() => onNavigate?.("games")}
        variant="outline"
        className="border-neutral-700 hover:bg-neutral-800 text-white mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("Back to Games", "Volver a Juegos")}
      </Button>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Grid3X3 className="h-8 w-8 text-red-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">
              {language === "es" ? "Sopa de Letras Bíblica" : "Bible Word Search"}
            </h1>
            <p className="text-neutral-400 max-w-2xl mt-1 text-sm">
              {language === "es"
                ? "Encuentra palabras bíblicas escondidas en la cuadrícula. Cada nivel tiene un conjunto diferente de palabras."
                : "Find hidden Bible words in the grid. Each level has its own set of themed words."}
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="grid gap-4 max-w-4xl">
          {loadingLevels ? (
            <p className="text-neutral-400 text-sm">
              {t("Loading levels...", "Cargando niveles...")}
            </p>
          ) : levels.length === 0 ? (
            <p className="text-neutral-400 text-sm">
              {t("No word search levels yet.", "Aún no hay niveles de sopa de letras.")}
            </p>
          ) : (
            levels.map((level) => (
              <Card
                key={level.id}
                className="bg-neutral-900 border-neutral-800 hover:border-red-600 transition-all cursor-pointer"
              >
                <CardContent className="p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-white">{level.name}</h3>
                    {level.description && (
                      <p className="text-xs text-neutral-400 max-w-xl">
                        {level.description}
                      </p>
                    )}
                    <p className="text-[0.75rem] text-neutral-500">
                      {level.rows}x{level.cols} - {level.words.length}{" "}
                      {t("words", "palabras")}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleSelectLevel(level.id)}
                    className="mt-2 sm:mt-0 sm:w-auto w-full bg-red-600 hover:bg-red-700"
                    disabled={loadingPuzzle}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {t("Play", "Jugar")}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );

  if (!puzzle || !puzzle.level) {
    return renderLevelList();
  }

  const allFound = puzzle.words.length > 0 && foundWords.size >= puzzle.words.length;

  return (
    <div className="container mx-auto space-y-4 px-3 py-4 max-w-4xl">
      <div className="flex items-center justify-between gap-2">
        <Button
          onClick={resetPuzzleState}
          variant="outline"
          className="border-neutral-700 hover:bg-neutral-800 text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Levels", "Niveles")}
        </Button>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Sparkles className="h-4 w-4 text-red-400" />
          <span>
            {foundWords.size}/{puzzle.words.length} {t("words found", "palabras encontradas")}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Grid3X3 className="h-6 w-6 text-red-400" />
          {puzzle.level.name}
        </h1>
        {puzzle.level.description && (
          <p className="text-sm text-neutral-400 max-w-2xl">
            {puzzle.level.description}
          </p>
        )}
        {allFound && (
          <p className="text-sm text-green-400">
            {language === "es" ? "¡Completado!" : "Completed!"}
          </p>
        )}
        <p className="text-[0.7rem] text-neutral-500">
          {language === "es"
            ? "Toca la primera y la última letra de la palabra en línea recta para marcarla."
            : "Tap the first and last letter of the word in a straight line to mark it."}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <div className="flex-1">
          <div className="relative w-full max-w-full mx-auto">
            <div
              className="relative grid rounded-lg bg-neutral-900 overflow-hidden"
              style={{
                gridTemplateColumns: `repeat(${puzzle.level.cols}, minmax(0, 1fr))`,
              }}
            >
              {puzzle.grid.map((rowStr, r) =>
                rowStr.split("").map((ch, c) => {
                  const key = `${r},${c}`;
                  const isFound = foundCells.has(key);
                  const isSelectedStart =
                    selectedStart && selectedStart.row === r && selectedStart.col === c;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleCellSelection(r, c)}
                      className={`flex aspect-square items-center justify-center text-[0.55rem] md:text-xs font-semibold ${
                        isFound
                          ? "text-white"
                          : isSelectedStart
                          ? "border border-green-400 rounded-sm text-white"
                          : "text-neutral-100"
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })
              )}

              {foundSegments.length > 0 && (
                <svg
                  className="pointer-events-none absolute inset-0"
                  viewBox={`0 0 ${puzzle.level.cols} ${puzzle.level.rows}`}
                  preserveAspectRatio="none"
                >
                  {foundSegments.map((seg, index) => {
                    const cols = puzzle.level!.cols;
                    const rows = puzzle.level!.rows;
                    const x1 = seg.start.col + 0.5;
                    const y1 = seg.start.row + 0.5;
                    const x2 = seg.end.col + 0.5;
                    const y2 = seg.end.row + 0.5;

                    const color = highlightColors[index % highlightColors.length];

                    return (
                      <line
                        key={seg.id}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={color}
                        strokeWidth={3.5}
                        strokeOpacity={0.6}
                        strokeLinecap="round"
                      />
                    );
                  })}
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-red-400" />
            {t("Words to Find", "Palabras a Encontrar")}
          </h2>
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/70 p-3 max-h-64 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {puzzle.words.map((w) => {
                const upper = w.toUpperCase();
                const isFound = foundWords.has(upper);
                return (
                  <div
                    key={upper}
                    className={`flex items-center gap-1 ${
                      isFound ? "text-green-400" : "text-neutral-200"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isFound ? "bg-green-400" : "bg-neutral-500"
                      }`}
                    />
                    <span className="truncate tracking-wide">{upper}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

