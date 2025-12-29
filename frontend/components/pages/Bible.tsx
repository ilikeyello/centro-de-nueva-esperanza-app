import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";

interface BibleVersion {
  id: string;
  name: string;
  abbreviation: string;
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

const API_BASE =
  import.meta.env.VITE_CLIENT_TARGET ??
  (import.meta.env.DEV ? "http://localhost:4000" : "https://prod-cne-sh82.encr.app");

const BIBLE_STORAGE_KEY = "cne:bible:selection";

// Common Bible versions that work with the API
const BIBLE_VERSIONS: BibleVersion[] = [
  { id: "kjv", name: "King James Version", abbreviation: "KJV" },
  { id: "rv1909", name: "Reina-Valera 1909", abbreviation: "RV1909" },
  { id: "spnbes", name: "La Biblia en Español Sencillo", abbreviation: "SPNBES" },
];

// Books of the Bible - will be loaded from API
const BIBLE_BOOKS: BibleBook[] = [];

interface BibleProps {
  onNavigate: (page: string) => void;
}

export function Bible({ onNavigate }: BibleProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [selectedVersion, setSelectedVersion] = useState<string>(() => {
    try {
      if (typeof window === "undefined") return "kjv";
      const raw = localStorage.getItem(BIBLE_STORAGE_KEY);
      if (!raw) return "kjv";
      const parsed = JSON.parse(raw);
      const version = typeof parsed?.version === "string" ? parsed.version : "kjv";
      return BIBLE_VERSIONS.some(v => v.id === version) ? version : "kjv";
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
      // We'll validate this after books are loaded
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
      const currentBook = BIBLE_BOOKS.find(b => b.id === book) ?? BIBLE_BOOKS.find(b => b.id === "john");
      const maxChapters = currentBook?.chapters ?? 21;

      const chapter = typeof parsed?.chapter === "number" ? parsed.chapter : parseInt(String(parsed?.chapter));
      if (!Number.isFinite(chapter)) return 3;

      return Math.min(Math.max(chapter, 1), maxChapters);
    } catch {
      return 3;
    }
  });
  const [chapter, setChapter] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [booksLoading, setBooksLoading] = useState<boolean>(true);
  const [bibleBooks, setBibleBooks] = useState<BibleBook[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectorsOpen, setSelectorsOpen] = useState<boolean>(false);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);

  const currentBook = bibleBooks.find(book => book.id === selectedBook);
  const chapters = currentBook ? Array.from({ length: currentBook.chapters }, (_, i) => i + 1) : [];

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_BASE}/bible/books`);
      if (response.ok) {
        const data = await response.json();
        setBibleBooks(data.books);
        
        // Validate selected book exists in loaded books
        const bookExists = data.books.some((b: BibleBook) => b.id === selectedBook);
        if (!bookExists && data.books.length > 0) {
          setSelectedBook(data.books[0].id); // Default to first book
          setSelectedChapter(1);
        }
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
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
        )}&chapter=${encodeURIComponent(String(chapterNum))}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch chapter');
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
    } catch (error) {
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
  }, []);

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

    const normalizedBook = bookPart.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

    const found = bibleBooks.find((b) => b.name.toLowerCase() === normalizedBook)
      ?? bibleBooks.find((b) => b.id.toLowerCase() === normalizedBook)
      ?? bibleBooks.find((b) => b.name.toLowerCase().replace(/\s+/g, " ").trim() === normalizedBook);

    if (!found) return null;

    const boundedChapter = Math.min(Math.max(chapterNum, 1), found.chapters);

    return {
      bookId: found.id,
      chapter: boundedChapter,
      verse: verseNum,
    };
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
      description: t(
        "Use a passage format like: John 3:16",
        "Usa un formato como: Juan 3:16"
      ),
      variant: "destructive",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t("Bible", "Biblia")}
        </h1>
        <p className="text-neutral-400">
          {t("Read and explore God's Word", "Lee y explora la Palabra de Dios")}
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder={t("Search verses... (e.g., John 3:16)", "Buscar versículos... (ej: Juan 3:16)")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="border-neutral-700 bg-neutral-800 text-white placeholder:text-neutral-500"
          />
          <Button onClick={handleSearch} disabled={loading} className="bg-red-600 hover:bg-red-700">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chapter Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Button
          onClick={handlePreviousChapter}
          disabled={selectedChapter <= 1 || loading}
          variant="outline"
          size="icon"
          className="border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
          aria-label={t("Previous chapter", "Capítulo anterior")}
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
                {currentBook?.name} {selectedChapter}
              </h2>
              {chapter && (
                <p className="text-sm text-neutral-400">
                  {chapter.verses.length} {t("verses", "versículos")}
                </p>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                {t("Tap to change", "Toca para cambiar")}
              </p>
            </button>
          </DialogTrigger>
          <DialogContent className="border-neutral-700 bg-neutral-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">{t("Select passage", "Seleccionar pasaje")}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4">
              <Select
                value={selectedVersion}
                onValueChange={(value) => {
                  setSelectedVersion(value);
                }}
              >
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                  <SelectValue placeholder={t("Version", "Versión")} />
                </SelectTrigger>
                <SelectContent className="border-neutral-700 bg-neutral-800">
                  {BIBLE_VERSIONS.map((version) => (
                    <SelectItem key={version.id} value={version.id} className="text-white">
                      {version.name} ({version.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedBook}
                onValueChange={(value) => {
                  setHighlightedVerse(null);
                  setSelectedBook(value);
                  setSelectedChapter(1);
                }}
                disabled={booksLoading}
              >
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                  <SelectValue placeholder={t("Book", "Libro")} />
                </SelectTrigger>
                <SelectContent className="border-neutral-700 bg-neutral-800 max-h-60">
                  <div className="p-2">
                    <div className="text-xs font-semibold text-neutral-400 mb-2">{t("Old Testament", "Antiguo Testamento")}</div>
                    {bibleBooks.filter(book => book.testament === "OT").map((book) => (
                      <SelectItem key={book.id} value={book.id} className="text-white">
                        {book.name}
                      </SelectItem>
                    ))}
                    <div className="text-xs font-semibold text-neutral-400 mb-2 mt-4">{t("New Testament", "Nuevo Testamento")}</div>
                    {bibleBooks.filter(book => book.testament === "NT").map((book) => (
                      <SelectItem key={book.id} value={book.id} className="text-white">
                        {book.name}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>

              <Select
                value={selectedChapter.toString()}
                onValueChange={(value) => {
                  setHighlightedVerse(null);
                  setSelectedChapter(parseInt(value));
                  setSelectorsOpen(false);
                }}
              >
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                  <SelectValue placeholder={t("Chapter", "Capítulo")} />
                </SelectTrigger>
                <SelectContent className="border-neutral-700 bg-neutral-800 max-h-60">
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter} value={chapter.toString()} className="text-white">
                      {t("Chapter", "Capítulo")} {chapter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Verses */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-neutral-800 rounded w-full mb-2"></div>
            </div>
          ))}
        </div>
      ) : chapter ? (
        <div className="p-4 rounded-lg border border-neutral-800 bg-neutral-900/50">
          <div className="space-y-3">
            {chapter.verses.map((verse) => (
              <div
                key={verse.number}
                id={`verse-${verse.number}`}
                className={
                  `flex items-start gap-4 rounded-md px-2 py-1 ` +
                  (highlightedVerse === verse.number ? "bg-red-950/30 ring-1 ring-red-500/60" : "")
                }
              >
                <span className="text-red-400 font-semibold min-w-[3rem] text-sm">
                  {verse.number}
                </span>
                <p className="text-neutral-200 leading-relaxed flex-1">
                  {verse.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800">
            <p className="text-xs text-neutral-500 leading-relaxed">
              {BIBLE_VERSIONS.find(v => v.id === selectedVersion)?.id === "spnbes"
                ? "La Biblia en Español Sencillo. © 2018–2019 AudioBiblia.org / Irma Flores. Licensed CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)."
                : BIBLE_VERSIONS.find(v => v.id === selectedVersion)?.id === "rv1909"
                  ? "Reina-Valera 1909 (RV1909), Public Domain in the United States."
                  : "King James Version (KJV), Public Domain."}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400">
            {t("Select a book and chapter to begin reading", "Selecciona un libro y capítulo para comenzar a leer")}
          </p>
        </div>
      )}
    </div>
  );
}
