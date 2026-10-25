import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { Sparkles, Grid3X3, ArrowLeft } from "lucide-react";
import { supabase, churchOrgId } from "../../lib/mainSiteData";
import { GameMenuScreen, GameOptionCard, GameMenuNote } from "../games/GameMenu";

interface WordSearchLevel {
  id: string;
  name_en: string;
  name_es: string;
  description_en: string | null;
  description_es: string | null;
  rows: number;
  cols: number;
  words?: { id: string; word_en: string; word_es: string | null }[];
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

      const { data, error } = await supabase
        .from('word_search_levels')
        .select('*, word_search_words(id, word_en, word_es)')
        .eq('church_id', churchOrgId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(d => ({
        ...d,
        words: d.word_search_words || []
      })) || [];

      setLevels(formattedData);
    } catch (err) {
      console.error(err);
      setLevels([]);
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

      const level = levels.find(l => l.id === levelId);
      if (!level) throw new Error("Level not found");

      // Use the local algorithmic matrix generator with Supabase words
      const words = (language === "es"
        ? level.words?.map(w => w.word_es || w.word_en)
        : level.words?.map(w => w.word_en)
      ) || [];
      const validWords = words.filter(w => w && w.length > 0);

      if (validWords.length === 0) {
        throw new Error("No words available in this level yet.");
      }

      // Sort words by length descending to place longest words first (heuristic for denser fitting)
      validWords.sort((a, b) => b!.length - a!.length);

      let currentRows = level.rows;
      let currentCols = level.cols;
      let placedWords: string[] = [];
      let finalGrid: string[][] = [];

      let successfullyBuilt = false;

      // Dynamic grid expansion loop. Try up to 15 times to expand the grid.
      for (let expansionAttempt = 0; expansionAttempt < 15 && !successfullyBuilt; expansionAttempt++) {
        placedWords = [];
        const gridChars: string[][] = Array(currentRows).fill(null).map(() => Array(currentCols).fill('_'));

        let allWordsPlaced = true;

        for (const word of validWords) {
          if (!word) continue;

          const directions = [
            { dr: 0, dc: 1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }, { dr: -1, dc: 1 },
            { dr: 0, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: -1 }, { dr: 1, dc: -1 },
          ].sort(() => Math.random() - 0.5);

          let placed = false;
          for (let attempt = 0; attempt < 5000 && !placed; attempt++) {
            const direction = directions[attempt % directions.length];
            const startRow = Math.floor(Math.random() * currentRows);
            const startCol = Math.floor(Math.random() * currentCols);

            const endRow = startRow + direction.dr * (word.length - 1);
            const endCol = startCol + direction.dc * (word.length - 1);

            if (endRow >= 0 && endRow < currentRows && endCol >= 0 && endCol < currentCols) {
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

          if (!placed) {
            allWordsPlaced = false;
            break; // Stop attempting other words in this grid size, it failed.
          }
        }

        if (allWordsPlaced) {
          successfullyBuilt = true;
          finalGrid = gridChars;
        } else {
          // If we couldn't place all words, expand the grid size by 1 horizontally and vertically
          currentRows++;
          currentCols++;
        }
      }

      if (!successfullyBuilt) {
        throw new Error("Could not fit all words even after expanding the grid! Grid is too small.");
      }

      // Fill remaining placeholders
      const grid = finalGrid.map(row =>
        row.map(char =>
          char === '_' ? String.fromCharCode(65 + Math.floor(Math.random() * 26)) : char
        ).join('')
      );

      const generatedPuzzle: PuzzleResult = {
        level: {
          id: level.id,
          name: language === 'es' ? level.name_es : level.name_en,
          description: language === 'es' ? level.description_es : level.description_en,
          rows: currentRows,
          cols: currentCols
        },
        words: placedWords,
        grid: grid
      };

      setPuzzle(generatedPuzzle);
      snapToTop();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("Failed to load puzzle.", "Error al cargar el rompecabezas."));
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
    <GameMenuScreen
      onBack={() => onNavigate?.("games")}
      backLabel={t("Games", "Juegos")}
      icon={<Grid3X3 />}
      eyebrow={t("Choose a level", "Elige un nivel")}
      title={t("Word Search", "Sopa de Letras")}
      subtitle={t(
        "Find hidden Bible words in the grid. Each level has its own set of themed words.",
        "Encuentra palabras bíblicas escondidas en la cuadrícula. Cada nivel tiene un conjunto diferente de palabras."
      )}
    >
      {error && <GameMenuNote>{error}</GameMenuNote>}
      {loadingLevels ? (
        <GameMenuNote>{t("Loading levels...", "Cargando niveles...")}</GameMenuNote>
      ) : levels.length === 0 ? (
        <GameMenuNote>{t("No word search levels yet.", "Aún no hay niveles de sopa de letras.")}</GameMenuNote>
      ) : (
        levels.map((level, i) => (
          <GameOptionCard
            key={level.id}
            icon={<span className="text-lg font-bold">{i + 1}</span>}
            title={language === 'es' ? level.name_es : level.name_en}
            description={language === 'es' ? level.description_es : level.description_en}
            meta={[
              <><Grid3X3 />{level.rows}×{level.cols}</>,
              <><Sparkles />{level.words?.length || 0} {t("words", "palabras")}</>,
            ]}
            onClick={() => handleSelectLevel(level.id)}
            disabled={loadingPuzzle}
          />
        ))
      )}
    </GameMenuScreen>
  );

  if (!puzzle || !puzzle.level) {
    return renderLevelList();
  }

  const allFound = puzzle.words.length > 0 && foundWords.size >= puzzle.words.length;

  // Found word segments are now rendered via a unified SVG overlay,
  // ensuring continuous lines and perfect alignment.


  return (
    <div className="w-full flex flex-col overflow-hidden pt-2" style={{ height: 'calc(100vh - env(safe-area-inset-top) - 6rem)' }}>
      {/* Header - Condensed - Moved higher */}
      <div className="flex-shrink-0 px-3 flex items-center justify-between gap-2">
        <Button onClick={resetPuzzleState} variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4" />
          {t("Levels", "Niveles")}
        </Button>
        <div className="flex items-center gap-2 text-[11px] text-[--ink-mid] uppercase tracking-wider">
          <Sparkles className="h-3 w-3 text-[--sage]" />
          <span>
            {foundWords.size}/{puzzle.words.length} {t("found", "encontradas")}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 px-3 py-1">
        <h1 className="text-lg font-bold text-[--ink-dark] flex items-center gap-2 truncate">
          <Grid3X3 className="h-4 w-4 text-[--sage]" />
          {puzzle.level.name}
        </h1>
        {allFound && (
          <p className="text-xs text-green-600 dark:text-green-400 font-bold animate-pulse">
            {language === "es" ? "¡Completado!" : "Completed!"}
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-3 px-3 pb-3 min-h-0 overflow-hidden">
        {/* Grid Area */}
        <div className="flex-[2] flex items-center justify-center min-h-0 relative min-w-0 shrink">
          <div className="relative w-full aspect-square mx-auto max-w-[min(100%,70vh)] max-h-[100%]">
            <div className="glass-card absolute inset-0 aspect-square rounded-2xl">
              <div
                className="absolute inset-0 grid rounded-lg z-10 p-1"
                style={{
                  gridTemplateColumns: `repeat(${puzzle.level.cols}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${puzzle.level.rows}, minmax(0, 1fr))`,
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
                        className={`ws-cell relative flex w-full h-full items-center justify-center font-bold transition-colors overflow-hidden ${isSelectedStart ? "is-start" : ""}`}
                        style={{ fontSize: `min(${100 / Math.max(puzzle.level.cols, puzzle.level.rows)}cqw, 20px)` }}
                      >
                        <span className="relative z-10 w-full text-center leading-none" style={{ fontSize: `clamp(8px, ${60 / Math.max(puzzle.level.cols, puzzle.level.rows)}vw, 24px)` }}>{ch}</span>
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
        <div className="flex-[1] md:w-48 flex flex-col min-h-[min(25vh,200px)] min-h-0 mt-0">
          <h2 className="text-[11px] font-semibold text-[--ink-mid] flex items-center gap-2 mb-0.5 uppercase tracking-widest flex-shrink-0">
            <Sparkles className="h-3 w-3" />
            {t("Words", "Palabras")}
          </h2>
          <div className="glass-card flex-1 rounded-2xl p-2 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-3 md:grid-cols-1 gap-1 text-[11px]">
              {puzzle.words.map((w) => {
                const upper = w.toUpperCase();
                const isFound = foundWords.has(upper);
                return (
                  <div
                    key={upper}
                    className={`flex items-center gap-1.5 p-1 rounded transition-colors ${isFound ? "ws-word-found text-[--ink-dark]" : "text-[--ink-dark]"
                      }`}
                  >
                    <div
                      className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${isFound ? "bg-green-600 dark:bg-green-400" : "bg-[--sage]"
                        }`}
                    />
                    <span className={`truncate tracking-tight ${isFound ? "line-through opacity-60" : ""}`}>{upper}</span>
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

