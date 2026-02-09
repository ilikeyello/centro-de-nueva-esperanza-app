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

  const snapToTop = () => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    const main = document.querySelector("main");
    if (main) (main as HTMLElement).scrollTop = 0;
  };

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
      // Add fallback test levels
      const testLevels = [
        {
          id: "bible-stories",
          name: "Bible Stories (Test)",
          description: "Famous stories from the Bible",
          rows: 10,
          cols: 10,
          words: [
            { id: 1, word_en: "NOAH", word_es: "NOÉ" },
            { id: 2, word_en: "MOSES", word_es: "MOISÉS" },
            { id: 3, word_en: "DAVID", word_es: "DAVID" },
            { id: 4, word_en: "JESUS", word_es: "JESÚS" },
            { id: 5, word_en: "ADAM", word_es: "ADÁN" }
          ]
        },
        {
          id: "bible-places",
          name: "Bible Places (Test)",
          description: "Important locations in the Bible",
          rows: 12,
          cols: 12,
          words: [
            { id: 1, word_en: "BETHLEHEM", word_es: "BELÉN" },
            { id: 2, word_en: "JERUSALEM", word_es: "JERUSALÉN" },
            { id: 3, word_en: "EGYPT", word_es: "EGIPTO" },
            { id: 4, word_en: "NAZARETH", word_es: "NAZARET" },
            { id: 5, word_en: "GALILEE", word_es: "GALILEA" }
          ]
        }
      ];
      setLevels(testLevels);
      console.log('Using fallback test levels:', testLevels.length);
    } finally {
      setLoadingLevels(false);
    }
  };

  useEffect(() => {
    loadLevels();
  }, [base, t]);

  useEffect(() => {
    // When entering puzzle view or returning to list, keep view at top
    snapToTop();
  }, [puzzle]);

  const resetPuzzleState = () => {
    setPuzzle(null);
    setFoundWords(new Set());
    setFoundCells(new Set());
    setSelectedStart(null);
    setFoundSegments([]);
    setError(null);
    snapToTop();
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
      snapToTop();
    } catch (err) {
      console.error(err);
      // Generate a simple fallback puzzle
      const level = levels.find(l => l.id === levelId);
      if (level) {
        const words = (language === "es" 
          ? level.words.map(w => w.word_es || w.word_en)
          : level.words.map(w => w.word_en)
        ).filter(w => w && w.length > 0);
        
        // 1. Initialize grid with placeholders
        const gridChars: string[][] = Array(level.rows).fill(null).map(() => Array(level.cols).fill('_'));

        // 2. Place words with conflict checking
        const placedWords: string[] = [];
        
        words.forEach((word) => {
          if (!word) return;

          const directions = [
            { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: -1, dc: 1 },
            { dr: 0, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: -1 }, { dr: 1, dc: -1 },
          ].sort(() => Math.random() - 0.5); // Randomize directions

          let placed = false;
          for (let attempt = 0; attempt < 100 && !placed; attempt++) {
            const direction = directions[attempt % directions.length];
            const startRow = Math.floor(Math.random() * level.rows);
            const startCol = Math.floor(Math.random() * level.cols);

            const endRow = startRow + direction.dr * (word.length - 1);
            const endCol = startCol + direction.dc * (word.length - 1);

            if (endRow >= 0 && endRow < level.rows && endCol >= 0 && endCol < level.cols) {
              let canPlace = true;
              for (let i = 0; i < word.length; i++) {
                const r = startRow + direction.dr * i;
                const c = startCol + direction.dc * i;
                if (gridChars[r][c] !== '_' && gridChars[r][c] !== word[i]) {
                  canPlace = false;
                  break;
                }
              }

              if (canPlace) {
                for (let i = 0; i < word.length; i++) {
                  const r = startRow + direction.dr * i;
                  const c = startCol + direction.dc * i;
                  gridChars[r][c] = word[i];
                }
                placed = true;
                placedWords.push(word);
              }
            }
          }
        });

        // 3. Fill remaining placeholders with random letters
        const grid = gridChars.map(row => 
          row.map(char => 
            char === '_' ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) : char
          ).join('')
        );
        
        
        const fallbackPuzzle: PuzzleResult = {
          level: {
            id: level.id,
            name: level.name,
            description: level.description,
            rows: level.rows,
            cols: level.cols
          },
          words: placedWords,
          grid: grid
        };
        
        setPuzzle(fallbackPuzzle);
      } else {
        setError(
          t("Failed to load puzzle.", "Error al cargar el rompecabezas.")
        );
      }
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
        className="bg-white text-black hover:bg-red-600 hover:text-white border border-neutral-300 mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t("Back to Games", "Volver a Juegos")}
      </Button>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Grid3X3 className="h-8 w-8 text-red-400" />
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
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
                className="warm-card hover:border-warm-red transition-all cursor-pointer"
              >
                <CardContent className="p-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-neutral-900">{level.name}</h3>
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
    <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-warm-cream overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Header - Condensed - Moved higher */}
      <div className="flex-shrink-0 px-3 pt-0 mt-[-4px] flex items-center justify-between gap-2">
        <Button
          onClick={resetPuzzleState}
          variant="outline"
          className="bg-white text-black hover:bg-red-600 hover:text-white border border-neutral-300 h-8 text-xs"
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
        <h1 className="text-lg font-bold text-neutral-900 flex items-center gap-2 truncate">
          <Grid3X3 className="h-4 w-4 text-red-400" />
          {puzzle.level.name}
        </h1>
        {allFound && (
          <p className="text-xs text-green-400 font-bold animate-pulse">
            {language === "es" ? "¡Completado!" : "Completed!"}
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 px-3 pb-3 min-h-0">
        {/* Grid Area */}
        <div className="flex-1 flex items-center justify-center min-h-0 relative">
          <div className="relative w-full max-w-[90vw] md:max-w-md mx-auto" style={{ aspectRatio: '1/1' }}>
            <div className="absolute inset-0 w-full h-full">
              <div
                className="absolute inset-0 grid rounded-lg z-10"
                style={{
                  gridTemplateColumns: `repeat(${puzzle.level.cols}, 1fr)`,
                  gridTemplateRows: `repeat(${puzzle.level.rows}, 1fr)`,
                  width: '100%',
                  height: '100%'
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
                        className={`relative flex w-full h-full items-center justify-center text-[clamp(8px,4vw,18px)] font-bold transition-colors ${
                          isSelectedStart
                            ? "border border-green-600 rounded-sm text-white bg-green-100"
                            : "text-neutral-800 bg-transparent hover:bg-black/5 rounded-sm"
                        }`}
                      >
                        <span className="relative z-10">{ch}</span>
                      </button>
                    );
                  })
                )}
              </div>
              
              {/* SVG Overlay for Found Words - on top */}
              <svg
                className="absolute inset-0 z-20 h-full w-full pointer-events-none"
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
                      strokeWidth="0.5"
                      strokeLinecap="round"
                      strokeOpacity="0.8"
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Word List Area */}
        <div className="w-full md:w-48 flex flex-col min-h-0">
          <h2 className="text-[10px] font-semibold text-neutral-500 flex items-center gap-2 mb-0.5 uppercase tracking-widest flex-shrink-0">
            <Sparkles className="h-3 w-3" />
            {t("Words", "Palabras")}
          </h2>
          <div className="flex-1 rounded-lg border border-neutral-300 bg-white p-2 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-3 md:grid-cols-1 gap-1 text-[10px]">
              {puzzle.words.map((w) => {
                const upper = w.toUpperCase();
                const isFound = foundWords.has(upper);
                return (
                  <div
                    key={upper}
                    className={`flex items-center gap-1.5 p-1 rounded transition-colors ${
                      isFound ? "bg-green-100 text-green-800" : "text-neutral-700"
                    }`}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                        isFound ? "bg-green-600" : "bg-neutral-400"
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

