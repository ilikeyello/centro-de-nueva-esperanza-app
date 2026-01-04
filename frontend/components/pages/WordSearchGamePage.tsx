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

  // Found word segments are now rendered via a unified SVG overlay,
  // ensuring continuous lines and perfect alignment.

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-neutral-950 overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header - Condensed - Moved higher */}
      <div className="flex-shrink-0 px-3 pt-0 mt-[-4px] flex items-center justify-between gap-2">
        <Button
          onClick={resetPuzzleState}
          variant="outline"
          className="border-neutral-700 hover:bg-neutral-800 text-white h-8 text-xs"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          {t("Levels", "Niveles")}
        </Button>
        <div className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase tracking-wider">
          <Sparkles className="h-3 w-3 text-red-400" />
          <span>
            {foundWords.size}/{puzzle.words.length} {t("found", "encontradas")}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 px-3 py-1">
        <h1 className="text-lg font-bold text-white flex items-center gap-2 truncate">
          <Grid3X3 className="h-4 w-4 text-red-400" />
          {puzzle.level.name}
        </h1>
        {allFound && (
          <p className="text-xs text-green-400 font-bold animate-pulse">
            {language === "es" ? "¡Completado!" : "Completed!"}
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-0.5 px-3 pb-3 min-h-0 overflow-hidden">
        {/* Grid Area */}
        <div className="flex-1 flex items-center justify-center min-h-0 relative">
          <div className="relative w-full h-full max-w-[min(100%,100vh-220px)] aspect-square mx-auto">
            <div className="absolute inset-0 aspect-square">
              {/* SVG Overlay for Found Words */}
              <svg
                className="absolute inset-0 z-0 h-full w-full pointer-events-none rounded-lg bg-neutral-900 p-1"
                viewBox={`0 0 ${puzzle.level.cols} ${puzzle.level.rows}`}
                preserveAspectRatio="xMidYMid meet"
              >
                {foundSegments.map((seg, i) => {
                  const color = highlightColors[i % highlightColors.length];
                  return (
                    <line
                      key={seg.id}
                      x1={seg.start.col + 0.5}
                      y1={seg.start.row + 0.5}
                      x2={seg.end.col + 0.5}
                      y2={seg.end.row + 0.5}
                      stroke={color}
                      strokeWidth="0.8"
                      strokeLinecap="round"
                      strokeOpacity="0.6"
                    />
                  );
                })}
              </svg>

              <div
                className="absolute inset-0 grid rounded-lg z-10 p-1"
                style={{
                  gridTemplateColumns: `repeat(${puzzle.level.cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${puzzle.level.rows}, minmax(0, 1fr))`,
                }}
              >
                {puzzle.grid.map((rowStr, r) =>
                  rowStr.split("").map((ch, c) => {
                    const key = `${r},${c}`;
                    const isFound = foundCells.has(`${r},${c}`);
                    const isSelectedStart =
                      selectedStart &&
                      selectedStart.row === r &&
                      selectedStart.col === c;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleCellSelection(r, c)}
                        className={`relative flex w-full h-full items-center justify-center text-[min(3vw,14px)] font-bold transition-colors ${
                          isFound
                            ? "text-white"
                            : isSelectedStart
                            ? "border border-green-400 rounded-sm text-white bg-green-400/20"
                            : "text-neutral-300 hover:text-white"
                        }`}
                      >
                        <span className="relative z-10">{ch}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Word List Area */}
        <div className="flex-shrink-0 md:w-48 flex flex-col min-h-0 max-h-[30%] md:max-h-full">
          <h2 className="text-[10px] font-semibold text-neutral-500 flex items-center gap-2 mb-1 uppercase tracking-widest">
            <Sparkles className="h-3 w-3" />
            {t("Words", "Palabras")}
          </h2>
          <div className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900/50 p-2 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-3 md:grid-cols-1 gap-1 text-[10px]">
              {puzzle.words.map((w) => {
                const upper = w.toUpperCase();
                const isFound = foundWords.has(upper);
                return (
                  <div
                    key={upper}
                    className={`flex items-center gap-1.5 p-1 rounded transition-colors ${
                      isFound ? "bg-green-500/10 text-green-400" : "text-neutral-400"
                    }`}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                        isFound ? "bg-green-400" : "bg-neutral-700"
                      }`}
                    />
                    <span className={`truncate tracking-tight ${isFound ? "line-through opacity-50" : ""}`}>{upper}</span>
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

