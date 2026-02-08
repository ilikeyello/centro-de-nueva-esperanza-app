"use client";

import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
  attribution?: string;
}

interface BibleBook {
  id: string;
  name: string;
  testament: "OT" | "NT";
  chapters: number;
}

interface BibleChapter {
  number: number;
  verses: BibleVerse[];
}

interface BibleVerse {
  number: number;
  text: string;
}

const API_BASE = process.env.NEXT_PUBLIC_CLIENT_TARGET || "https://prod-cne-sh82.encr.app";

const BIBLE_STORAGE_KEY = "cne:bible:selection";

const FALLBACK_BIBLE_VERSIONS: BibleVersion[] = [
  { id: "kjv", name: "King James Version", abbreviation: "KJV" },
  { id: "rv1909", name: "Reina-Valera 1909", abbreviation: "RV1909" },
  { id: "spnbes", name: "La Biblia en Español Sencillo", abbreviation: "SPNBES" },
];

const SPANISH_BOOK_NAMES: Record<string, string> = {
  genesis: "Génesis",
  exodus: "Éxodo",
  leviticus: "Levítico",
  numbers: "Números",
  deuteronomy: "Deuteronomio",
  joshua: "Josué",
  judges: "Jueces",
  ruth: "Rut",
  "1-samuel": "1 Samuel",
  "2-samuel": "2 Samuel",
  "1-kings": "1 Reyes",
  "2-kings": "2 Reyes",
  "1-chronicles": "1 Crónicas",
  "2-chronicles": "2 Crónicas",
  ezra: "Esdras",
  nehemiah: "Nehemías",
  esther: "Ester",
  job: "Job",
  psalms: "Salmos",
  proverbs: "Proverbios",
  ecclesiastes: "Eclesiastés",
  "song-of-solomon": "Cantares",
  isaiah: "Isaías",
  jeremiah: "Jeremías",
  lamentations: "Lamentaciones",
  ezekiel: "Ezequiel",
  daniel: "Daniel",
  hosea: "Oseas",
  joel: "Joel",
  amos: "Amós",
  obadiah: "Abdías",
  jonah: "Jonás",
  micah: "Miqueas",
  nahum: "Nahúm",
  habakkuk: "Habacuc",
  zephaniah: "Sofonías",
  haggai: "Hageo",
  zechariah: "Zacarías",
  malachi: "Malaquías",
  matthew: "Mateo",
  mark: "Marcos",
  luke: "Lucas",
  john: "Juan",
  acts: "Hechos",
  romans: "Romanos",
  "1-corinthians": "1 Corintios",
  "2-corinthians": "2 Corintios",
  galatians: "Gálatas",
  ephesians: "Efesios",
  philippians: "Filipenses",
  colossians: "Colosenses",
  "1-thessalonians": "1 Tesalonicenses",
  "2-thessalonians": "2 Tesalonicenses",
  "1-timothy": "1 Timoteo",
  "2-timothy": "2 Timoteo",
  titus: "Tito",
  philemon: "Filemón",
  hebrews: "Hebreos",
  james: "Santiago",
  "1-peter": "1 Pedro",
  "2-peter": "2 Pedro",
  "1-john": "1 Juan",
  "2-john": "2 Juan",
  "3-john": "3 Juan",
  jude: "Judas",
  revelation: "Apocalipsis",
};

const FALLBACK_BIBLE_BOOKS: BibleBook[] = [
  { id: "genesis", name: "Genesis", testament: "OT", chapters: 50 },
  { id: "exodus", name: "Exodus", testament: "OT", chapters: 40 },
  { id: "leviticus", name: "Leviticus", testament: "OT", chapters: 27 },
  { id: "numbers", name: "Numbers", testament: "OT", chapters: 36 },
  { id: "deuteronomy", name: "Deuteronomy", testament: "OT", chapters: 34 },
  { id: "joshua", name: "Joshua", testament: "OT", chapters: 24 },
  { id: "judges", name: "Judges", testament: "OT", chapters: 21 },
  { id: "ruth", name: "Ruth", testament: "OT", chapters: 4 },
  { id: "1-samuel", name: "1 Samuel", testament: "OT", chapters: 31 },
  { id: "2-samuel", name: "2 Samuel", testament: "OT", chapters: 24 },
  { id: "1-kings", name: "1 Kings", testament: "OT", chapters: 22 },
  { id: "2-kings", name: "2 Kings", testament: "OT", chapters: 25 },
  { id: "1-chronicles", name: "1 Chronicles", testament: "OT", chapters: 29 },
  { id: "2-chronicles", name: "2 Chronicles", testament: "OT", chapters: 36 },
  { id: "ezra", name: "Ezra", testament: "OT", chapters: 10 },
  { id: "nehemiah", name: "Nehemiah", testament: "OT", chapters: 13 },
  { id: "esther", name: "Esther", testament: "OT", chapters: 10 },
  { id: "job", name: "Job", testament: "OT", chapters: 42 },
  { id: "psalms", name: "Psalms", testament: "OT", chapters: 150 },
  { id: "proverbs", name: "Proverbs", testament: "OT", chapters: 31 },
  { id: "ecclesiastes", name: "Ecclesiastes", testament: "OT", chapters: 12 },
  { id: "song-of-solomon", name: "Song of Solomon", testament: "OT", chapters: 8 },
  { id: "isaiah", name: "Isaiah", testament: "OT", chapters: 66 },
  { id: "jeremiah", name: "Jeremiah", testament: "OT", chapters: 52 },
  { id: "lamentations", name: "Lamentations", testament: "OT", chapters: 5 },
  { id: "ezekiel", name: "Ezekiel", testament: "OT", chapters: 48 },
  { id: "daniel", name: "Daniel", testament: "OT", chapters: 12 },
  { id: "hosea", name: "Hosea", testament: "OT", chapters: 14 },
  { id: "joel", name: "Joel", testament: "OT", chapters: 3 },
  { id: "amos", name: "Amos", testament: "OT", chapters: 9 },
  { id: "obadiah", name: "Obadiah", testament: "OT", chapters: 1 },
  { id: "jonah", name: "Jonah", testament: "OT", chapters: 4 },
  { id: "micah", name: "Micah", testament: "OT", chapters: 7 },
  { id: "nahum", name: "Nahum", testament: "OT", chapters: 3 },
  { id: "habakkuk", name: "Habakkuk", testament: "OT", chapters: 3 },
  { id: "zephaniah", name: "Zephaniah", testament: "OT", chapters: 3 },
  { id: "haggai", name: "Haggai", testament: "OT", chapters: 2 },
  { id: "zechariah", name: "Zechariah", testament: "OT", chapters: 14 },
  { id: "malachi", name: "Malachi", testament: "OT", chapters: 4 },
  { id: "matthew", name: "Matthew", testament: "NT", chapters: 28 },
  { id: "mark", name: "Mark", testament: "NT", chapters: 16 },
  { id: "luke", name: "Luke", testament: "NT", chapters: 24 },
  { id: "john", name: "John", testament: "NT", chapters: 21 },
  { id: "acts", name: "Acts", testament: "NT", chapters: 28 },
  { id: "romans", name: "Romans", testament: "NT", chapters: 16 },
  { id: "1-corinthians", name: "1 Corinthians", testament: "NT", chapters: 16 },
  { id: "2-corinthians", name: "2 Corinthians", testament: "NT", chapters: 13 },
  { id: "galatians", name: "Galatians", testament: "NT", chapters: 6 },
  { id: "ephesians", name: "Ephesians", testament: "NT", chapters: 6 },
  { id: "philippians", name: "Philippians", testament: "NT", chapters: 4 },
  { id: "colossians", name: "Colossians", testament: "NT", chapters: 4 },
  { id: "1-thessalonians", name: "1 Thessalonians", testament: "NT", chapters: 5 },
  { id: "2-thessalonians", name: "2 Thessalonians", testament: "NT", chapters: 3 },
  { id: "1-timothy", name: "1 Timothy", testament: "NT", chapters: 6 },
  { id: "2-timothy", name: "2 Timothy", testament: "NT", chapters: 4 },
  { id: "titus", name: "Titus", testament: "NT", chapters: 3 },
  { id: "philemon", name: "Philemon", testament: "NT", chapters: 1 },
  { id: "hebrews", name: "Hebrews", testament: "NT", chapters: 13 },
  { id: "james", name: "James", testament: "NT", chapters: 5 },
  { id: "1-peter", name: "1 Peter", testament: "NT", chapters: 5 },
  { id: "2-peter", name: "2 Peter", testament: "NT", chapters: 3 },
  { id: "1-john", name: "1 John", testament: "NT", chapters: 5 },
  { id: "2-john", name: "2 John", testament: "NT", chapters: 1 },
  { id: "3-john", name: "3 John", testament: "NT", chapters: 1 },
  { id: "jude", name: "Jude", testament: "NT", chapters: 1 },
  { id: "revelation", name: "Revelation", testament: "NT", chapters: 22 },
];

export function BiblePage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [selectedVersion, setSelectedVersion] = useState<string>(() => {
    try {
      if (typeof window === "undefined") return "kjv";
      const raw = localStorage.getItem(BIBLE_STORAGE_KEY);
      if (!raw) return "kjv";
      const parsed = JSON.parse(raw);
      const version = typeof parsed?.version === "string" ? parsed.version : "kjv";
      return version || "kjv";
    } catch {
      return "kjv";
    }
  });

  const [selectedBook, setSelectedBook] = useState<string>(() => {
    try {
      if (typeof window === "undefined") return "john";
      const raw = localStorage.getItem(BIBLE_STORAGE_KEY);
      if (!raw) return "john";
      const parsed = JSON.parse(raw);
      const book = typeof parsed?.book === "string" ? parsed.book : "john";
      return book;
    } catch {
      return "john";
    }
  });

  const [selectedChapter, setSelectedChapter] = useState<number>(() => {
    try {
      if (typeof window === "undefined") return 3;
      const raw = localStorage.getItem(BIBLE_STORAGE_KEY);
      if (!raw) return 3;
      const parsed = JSON.parse(raw);

      const book = typeof parsed?.book === "string" ? parsed.book : "john";
      const currentBook =
        FALLBACK_BIBLE_BOOKS.find((b) => b.id === book) ??
        FALLBACK_BIBLE_BOOKS.find((b) => b.id === "john");
      const maxChapters = currentBook?.chapters ?? 21;

      const chapter = typeof parsed?.chapter === "number" ? parsed.chapter : parseInt(String(parsed?.chapter));
      if (!Number.isFinite(chapter)) return 3;

      return Math.min(Math.max(chapter, 1), maxChapters);
    } catch {
      return 3;
    }
  });

  const [chapter, setChapter] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [booksLoading, setBooksLoading] = useState(true);
  const [bibleBooks, setBibleBooks] = useState<BibleBook[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(true);
  const [bibleVersions, setBibleVersions] = useState<BibleVersion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectorsOpen, setSelectorsOpen] = useState(false);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [pendingVersion, setPendingVersion] = useState(selectedVersion);
  const [pendingBook, setPendingBook] = useState(selectedBook);
  const [pendingChapter, setPendingChapter] = useState(selectedChapter);

  const currentBook =
    bibleBooks.find((book) => book.id === selectedBook) ||
    FALLBACK_BIBLE_BOOKS.find((book) => book.id === selectedBook);
  const chapters = currentBook ? Array.from({ length: currentBook.chapters }, (_, i) => i + 1) : [];
  const displayBooks = bibleBooks.length > 0 ? bibleBooks : FALLBACK_BIBLE_BOOKS;
  const displayVersions = bibleVersions.length > 0 ? bibleVersions : FALLBACK_BIBLE_VERSIONS;

  const getLocalizedName = (book: BibleBook): string => {
    if ((selectedVersion === "rv1909" || selectedVersion === "spnbes") && SPANISH_BOOK_NAMES[book.id]) {
      return SPANISH_BOOK_NAMES[book.id];
    }
    return book.name;
  };

  const getLocalizedNameForVersion = (book: BibleBook, version: string): string => {
    if ((version === "rv1909" || version === "spnbes") && SPANISH_BOOK_NAMES[book.id]) {
      return SPANISH_BOOK_NAMES[book.id];
    }
    return book.name;
  };

  const fetchTranslations = async () => {
    try {
      const response = await fetch(`${API_BASE}/bible/translations`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        const apiVersions: BibleVersion[] = Array.isArray(data?.translations)
          ? data.translations.map((v: any) => ({
              id: String(v.id),
              name: String(v.name ?? v.id),
              abbreviation: String(v.id ?? "").toUpperCase(),
              attribution: typeof v.attribution === "string" ? v.attribution : undefined,
            }))
          : [];

        setBibleVersions(apiVersions);

        const valid = apiVersions.some((v) => v.id === selectedVersion);
        if (!valid && apiVersions.length > 0) {
          setSelectedVersion(apiVersions[0].id);
        }
      }
    } catch {
      // ignore
    } finally {
      setVersionsLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_BASE}/bible/books`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setBibleBooks(data.books);

        const bookExists = data.books.some((b: BibleBook) => b.id === selectedBook);
        if (!bookExists && data.books.length > 0) {
          setSelectedBook(data.books[0].id);
          setSelectedChapter(1);
        }
      }
    } catch {
      // ignore
    } finally {
      setBooksLoading(false);
    }
  };

  const fetchChapter = async (bookId: string, chapterNum: number, version: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/bible/chapter?translation=${encodeURIComponent(version)}&book=${encodeURIComponent(
          bookId
        )}&chapter=${encodeURIComponent(String(chapterNum))}`,
        { cache: "no-store" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chapter");
      }

      const data = await response.json();

      if (data.verses) {
        const verses: BibleVerse[] = data.verses.map((verse: any) => ({
          number: verse.number,
          text: verse.text,
        }));

        setChapter({
          number: chapterNum,
          verses,
        });
      }
    } catch {
      toast({
        title: t("Error", "Error"),
        description: t("Failed to load chapter", "No se pudo cargar el capítulo"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchTranslations();
  }, []);

  useEffect(() => {
    setPendingVersion(selectedVersion);
    setPendingBook(selectedBook);
    setPendingChapter(selectedChapter);
  }, [selectedVersion, selectedBook, selectedChapter]);

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      fetchChapter(selectedBook, selectedChapter, selectedVersion);
    }
  }, [selectedBook, selectedChapter, selectedVersion]);

  useEffect(() => {
    if (!chapter || highlightedVerse == null) return;
    const el = document.getElementById(`verse-${highlightedVerse}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [chapter, highlightedVerse]);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      localStorage.setItem(
        BIBLE_STORAGE_KEY,
        JSON.stringify({
          version: selectedVersion,
          book: selectedBook,
          chapter: selectedChapter,
        })
      );
    } catch {
      // ignore
    }
  }, [selectedVersion, selectedBook, selectedChapter]);

  const handlePreviousChapter = () => {
    if (selectedChapter > 1) {
      setHighlightedVerse(null);
      setSelectedChapter(selectedChapter - 1);
    }
  };

  const handleNextChapter = () => {
    if (currentBook && selectedChapter < currentBook.chapters) {
      setHighlightedVerse(null);
      setSelectedChapter(selectedChapter + 1);
    }
  };

  const normalizeBookName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[áÁ]/g, "a")
      .replace(/[éÉ]/g, "e")
      .replace(/[íÍ]/g, "i")
      .replace(/[óÓ]/g, "o")
      .replace(/[úÚüÜ]/g, "u")
      .replace(/[ñÑ]/g, "n")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const tryParsePassageQuery = (query: string): { bookId: string; chapter: number; verse?: number } | null => {
    const trimmed = query.trim();
    if (!trimmed) return null;

    const match = trimmed.match(/^(.+?)\s+(\d+)(?::(\d+))?$/);
    if (!match) return null;

    const bookPart = match[1].trim();
    const chapterNum = parseInt(match[2], 10);
    const verseNum = match[3] ? parseInt(match[3], 10) : undefined;

    if (!Number.isFinite(chapterNum) || chapterNum < 1) return null;
    if (verseNum != null && (!Number.isFinite(verseNum) || verseNum < 1)) return null;

    const normalizedSearch = normalizeBookName(bookPart);

    const searchMap = new Map<string, string>();
    displayBooks.forEach((book) => {
      searchMap.set(normalizeBookName(book.name), book.id);
      const spanishName = SPANISH_BOOK_NAMES[book.id];
      if (spanishName) {
        searchMap.set(normalizeBookName(spanishName), book.id);
      }
    });

    if (searchMap.has(normalizedSearch)) {
      const bookId = searchMap.get(normalizedSearch)!;
      const found = displayBooks.find((b) => b.id === bookId);
      if (found) {
        const boundedChapter = Math.min(Math.max(chapterNum, 1), found.chapters);
        return { bookId: found.id, chapter: boundedChapter, verse: verseNum };
      }
    }

    for (const [key, bookId] of searchMap.entries()) {
      if (key.includes(normalizedSearch) || normalizedSearch.includes(key)) {
        const found = displayBooks.find((b) => b.id === bookId);
        if (found) {
          const boundedChapter = Math.min(Math.max(chapterNum, 1), found.chapters);
          return { bookId: found.id, chapter: boundedChapter, verse: verseNum };
        }
      }
    }

    return null;
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const passage = tryParsePassageQuery(searchQuery);
    if (passage) {
      setHighlightedVerse(passage.verse ?? null);
      setSelectedBook(passage.bookId);
      setSelectedChapter(passage.chapter);
      setSelectorsOpen(false);
      return;
    }

    toast({
      title: t("Search", "Búsqueda"),
      description: t("Use a passage format like: John 3:16", "Usa un formato como: Juan 3:16"),
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t("Bible", "Biblia")}</h1>
        <p className="text-neutral-400">{t("Read and explore God's Word", "Lee y explora la Palabra de Dios")}</p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={t("Search verses... (e.g., John 3:16)", "Buscar versículos... (ej: Juan 3:16)")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
          />
          <Button onClick={handleSearch} disabled={loading} className="bg-red-600 hover:bg-red-700" type="button">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <Button
          onClick={handlePreviousChapter}
          disabled={selectedChapter <= 1 || loading}
          variant="outline"
          size="icon"
          className="border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
          aria-label={t("Previous chapter", "Capítulo anterior")}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Dialog open={selectorsOpen} onOpenChange={setSelectorsOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              disabled={loading}
              className="text-center px-3 py-2 rounded-md hover:bg-neutral-800/60 transition-colors disabled:opacity-50"
            >
              <h2 className="text-xl font-semibold text-white">
                {getLocalizedName(currentBook || FALLBACK_BIBLE_BOOKS[0])} {selectedChapter}
              </h2>
              {chapter && (
                <p className="text-sm text-neutral-400">{chapter.verses.length} {t("verses", "versículos")}</p>
              )}
              <p className="text-xs text-neutral-500 mt-1">{t("Tap to change", "Toca para cambiar")}</p>
            </button>
          </DialogTrigger>
          <DialogContent className="border-neutral-700 bg-neutral-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">{t("Select passage", "Seleccionar pasaje")}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Select value={pendingVersion} onValueChange={setPendingVersion} disabled={versionsLoading}>
                  <SelectTrigger className="w-full border-neutral-700 bg-neutral-800 text-white">
                    <SelectValue placeholder={t("Version", "Versión")} />
                  </SelectTrigger>
                  <SelectContent className="border-neutral-700 bg-neutral-800">
                    {displayVersions.map((version) => (
                      <SelectItem key={version.id} value={version.id}>
                        {version.name} ({version.abbreviation})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={pendingBook}
                  onValueChange={(value) => {
                    setPendingBook(value);
                    setPendingChapter(1);
                  }}
                  disabled={booksLoading}
                >
                  <SelectTrigger className="w-full border-neutral-700 bg-neutral-800 text-white">
                    <SelectValue placeholder={t("Book", "Libro")} />
                  </SelectTrigger>
                  <SelectContent className="border-neutral-700 bg-neutral-800 max-h-60">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-neutral-400 mb-2">{t("Old Testament", "Antiguo Testamento")}</div>
                      {displayBooks
                        .filter((book) => book.testament === "OT")
                        .map((book) => (
                          <SelectItem key={book.id} value={book.id}>
                            {getLocalizedNameForVersion(book, pendingVersion)}
                          </SelectItem>
                        ))}
                      <div className="text-xs font-semibold text-neutral-400 mb-2 mt-4">{t("New Testament", "Nuevo Testamento")}</div>
                      {displayBooks
                        .filter((book) => book.testament === "NT")
                        .map((book) => (
                          <SelectItem key={book.id} value={book.id}>
                            {getLocalizedNameForVersion(book, pendingVersion)}
                          </SelectItem>
                        ))}
                    </div>
                  </SelectContent>
                </Select>

                <Select
                  value={pendingChapter.toString()}
                  onValueChange={(value) => {
                    setPendingChapter(parseInt(value, 10));
                  }}
                >
                  <SelectTrigger className="w-full border-neutral-700 bg-neutral-800 text-white">
                    <SelectValue placeholder={t("Chapter", "Capítulo")} />
                  </SelectTrigger>
                  <SelectContent className="border-neutral-700 bg-neutral-800 max-h-60">
                    {chapters.map((ch) => (
                      <SelectItem key={ch} value={ch.toString()}>
                        {t("Chapter", "Capítulo")} {ch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={() => {
                    setHighlightedVerse(null);
                    setSelectedVersion(pendingVersion);
                    setSelectedBook(pendingBook);
                    setSelectedChapter(pendingChapter);
                    setSelectorsOpen(false);
                  }}
                  className="bg-red-600 hover:bg-red-700"
                  type="button"
                >
                  {t("Apply", "Aplicar")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          onClick={handleNextChapter}
          disabled={!currentBook || selectedChapter >= currentBook.chapters || loading}
          variant="outline"
          size="icon"
          className="border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
          aria-label={t("Next chapter", "Siguiente capítulo")}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-6 animate-pulse rounded bg-neutral-800/40" />
          ))}
        </div>
      ) : chapter ? (
        <div className="space-y-3">
          {chapter.verses.map((verse) => (
            <div
              key={verse.number}
              id={`verse-${verse.number}`}
              className={cn(
                "rounded-xl border border-transparent p-3",
                highlightedVerse === verse.number && "border-red-500 bg-red-950/30"
              )}
            >
              <span className="mr-2 text-sm font-semibold text-red-400">{verse.number}</span>
              <span className="text-neutral-200">{verse.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-neutral-400">{t("No chapter loaded.", "No se cargó el capítulo.")}</p>
      )}
    </div>
  );
}
