import { api } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

interface WordSearchLevel {
  id: string;
  name: string;
  description: string | null;
  rows: number;
  cols: number;
  created_at: Date;
}

interface WordSearchWord {
  id: number;
  level_id: string;
  word_en: string;
  word_es: string | null;
  created_at: Date;
}

interface LevelWithWords extends WordSearchLevel {
  words: WordSearchWord[];
}

export const listLevels = api<void, { levels: LevelWithWords[] }>(
  { expose: true, method: "GET", path: "/games/wordsearch/levels" },
  async () => {
    const levels = await db.queryAll<WordSearchLevel>`
      SELECT id, name, description, rows, cols, created_at
      FROM word_search_levels
      ORDER BY created_at ASC
    `;

    const words = await db.queryAll<WordSearchWord>`
      SELECT id, level_id, word_en, word_es, created_at
      FROM word_search_words
      ORDER BY level_id, created_at ASC
    `;

    const wordsByLevel: Record<string, WordSearchWord[]> = {};
    for (const w of words) {
      if (!wordsByLevel[w.level_id]) wordsByLevel[w.level_id] = [];
      wordsByLevel[w.level_id].push(w);
    }

    const result: LevelWithWords[] = levels.map((level) => ({
      ...level,
      words: wordsByLevel[level.id] || [],
    }));

    return { levels: result };
  }
);

export const upsertLevel = api(
  { expose: true, method: "POST", path: "/games/wordsearch/levels" },
  async (params: {
    id?: string;
    name: string;
    description?: string;
    passcode: string;
  }): Promise<{ success: boolean; id: string }> => {
    if (params.passcode !== "78598") {
      return { success: false, id: "" };
    }

    const id = params.id?.trim() || `ws-${Date.now().toString(36)}`;
    // Grid size is now determined automatically from the words (capped at 9x9).
    // Store a sensible default here; it will be updated when words are saved.
    const rows = 9;
    const cols = 9;

    await db.exec`
      INSERT INTO word_search_levels (id, name, description, rows, cols)
      VALUES (${id}, ${params.name}, ${params.description || null}, ${rows}, ${cols})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        rows = EXCLUDED.rows,
        cols = EXCLUDED.cols
    `;

    return { success: true, id };
  }
);

export const setWordsForLevel = api(
  { expose: true, method: "POST", path: "/games/wordsearch/levels/:id/words" },
  async ({ id, passcode, words }: { id: string; passcode: string; words: { word_en: string; word_es?: string }[] }) => {
    if (passcode !== "78598") {
      return { success: false };
    }

    await db.exec`DELETE FROM word_search_words WHERE level_id = ${id}`;

    const cleanedWords: string[] = [];

    for (const w of words) {
      const wordEn = w.word_en.trim();
      if (!wordEn) continue;
      const upper = wordEn.toUpperCase();
      cleanedWords.push(upper.replace(/\s+/g, ""));
      await db.exec`
        INSERT INTO word_search_words (level_id, word_en, word_es)
        VALUES (${id}, ${upper}, ${w.word_es?.trim() || null})
      `;
    }

    // Choose a square grid size (rows = cols) based on the longest word, between 5x5 and 9x9.
    let size = 9;
    if (cleanedWords.length > 0) {
      const maxLen = cleanedWords.reduce((max, w) => Math.max(max, w.length), 0);
      const minSize = 5;
      size = Math.min(9, Math.max(minSize, maxLen + 2));
    }

    await db.exec`
      UPDATE word_search_levels
      SET rows = ${size}, cols = ${size}
      WHERE id = ${id}
    `;

    return { success: true };
  }
);

export const deleteWordSearchLevelApi = api(
  { expose: true, method: "DELETE", path: "/games/wordsearch/levels/:id" },
  async ({ id, passcode }: { id: string; passcode: string }): Promise<{ success: boolean }> => {
    if (passcode !== "78598") {
      return { success: false };
    }

    await db.exec`DELETE FROM word_search_levels WHERE id = ${id}`;
    return { success: true };
  }
);

// Simple puzzle generator: backend returns grid + words for the game page.

interface PuzzleCell {
  row: number;
  col: number;
  letter: string;
}

interface PuzzleResult {
  level: WordSearchLevel | null;
  words: string[];
  grid: string[];
  error?: string;
}

export const getPuzzle = api<{ id: string; lang?: Query<string> }, PuzzleResult>(
  { expose: true, method: "GET", path: "/games/wordsearch/puzzle/:id" },
  async ({ id, lang }) => {
    const level = await db.queryRow<WordSearchLevel>`
      SELECT id, name, description, rows, cols, created_at
      FROM word_search_levels
      WHERE id = ${id}
    `;

    if (!level) {
      return { level: null, words: [], grid: [], error: "Level not found" };
    }

    const allWords = await db.queryAll<WordSearchWord>`
      SELECT id, level_id, word_en, word_es, created_at
      FROM word_search_words
      WHERE level_id = ${id}
      ORDER BY created_at ASC
    `;

    const useSpanish = (lang || "en") === "es";

    // Use the configured level size, ensuring a square grid between 5x5 and 9x9.
    const baseSize = Math.max(level.rows, level.cols);
    const size = Math.max(5, Math.min(9, baseSize || 9));

    const rawWords = allWords
      .map((w) => (useSpanish && w.word_es ? w.word_es : w.word_en))
      .map((w) => w.replace(/\s+/g, "").toUpperCase())
      .filter((w) => w.length >= 3 && w.length <= size);

    if (rawWords.length === 0) {
      return { level, words: [], grid: [], error: "No words configured for this level" };
    }

    const rows = size;
    const cols = size;

    const grid: PuzzleCell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: PuzzleCell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({ row: r, col: c, letter: "" });
      }
      grid.push(row);
    }

    const directions = [
      { dr: 0, dc: 1 },  // right
      { dr: 1, dc: 0 },  // down
      { dr: 1, dc: 1 },  // down-right
      { dr: -1, dc: 1 }, // up-right
    ];

    const canPlace = (word: string, r: number, c: number, dr: number, dc: number) => {
      if (dr === 0 && dc === 0) return false;
      const endR = r + dr * (word.length - 1);
      const endC = c + dc * (word.length - 1);
      if (endR < 0 || endR >= rows || endC < 0 || endC >= cols) return false;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[r + dr * i][c + dc * i];
        if (cell.letter && cell.letter !== word[i]) return false;
      }
      return true;
    };

    const placeWord = (word: string) => {
      const maxAttempts = 100;
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (!canPlace(word, r, c, dir.dr, dir.dc)) continue;
        for (let i = 0; i < word.length; i++) {
          grid[r + dir.dr * i][c + dir.dc * i].letter = word[i];
        }
        return true;
      }
      return false;
    };

    const placedWords: string[] = [];
    for (const word of rawWords) {
      if (placeWord(word)) {
        placedWords.push(word);
      }
    }

    if (placedWords.length === 0) {
      return { level, words: [], grid: [], error: "No words could be placed in the grid" };
    }

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].letter) {
          grid[r][c].letter = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }

    const gridStrings = grid.map((row) => row.map((cell) => cell.letter).join(""));

    return {
      level: { ...level, rows, cols },
      words: placedWords,
      grid: gridStrings,
    };
  }
);
