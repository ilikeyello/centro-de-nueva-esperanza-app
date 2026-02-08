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

const API_BASE = "/bible";

const BIBLE_STORAGE_KEY = "cne:bible:selection";

// Common Bible versions that work with the API
const FALLBACK_BIBLE_VERSIONS: BibleVersion[] = [
  { id: "kjv", name: "King James Version", abbreviation: "KJV" },
  { id: "rv1909", name: "Reina-Valera 1909", abbreviation: "RV1909" },
  { id: "spnbes", name: "La Biblia en Español Sencillo", abbreviation: "SPNBES" },
];

// Spanish book names mapping
const SPANISH_BOOK_NAMES: Record<string, string> = {
  // Old Testament
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
  // New Testament
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

// Books of the Bible - fallback while API loads
const FALLBACK_BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
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
  // New Testament
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

interface BibleProps {
  onNavigate: (page: string) => void;
}

export function Bible({ onNavigate }: BibleProps) {
  const { t, language } = useLanguage();
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
  const [loading, setLoading] = useState<boolean>(false);
  const [booksLoading, setBooksLoading] = useState<boolean>(true);
  const [bibleBooks, setBibleBooks] = useState<BibleBook[]>([]);
  const [versionsLoading, setVersionsLoading] = useState<boolean>(true);
  const [bibleVersions, setBibleVersions] = useState<BibleVersion[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectorsOpen, setSelectorsOpen] = useState<boolean>(false);
  const [highlightedVerse, setHighlightedVerse] = useState<number | null>(null);
  const [pendingVersion, setPendingVersion] = useState<string>(selectedVersion);
  const [pendingBook, setPendingBook] = useState<string>(selectedBook);
  const [pendingChapter, setPendingChapter] = useState<number>(selectedChapter);

  const currentBook = bibleBooks.find(book => book.id === selectedBook) || FALLBACK_BIBLE_BOOKS.find(book => book.id === selectedBook);
  const chapters = currentBook ? Array.from({ length: currentBook.chapters }, (_, i) => i + 1) : [];
  
  // Pending selection helpers
  const pendingBookObj = bibleBooks.find(book => book.id === pendingBook) || FALLBACK_BIBLE_BOOKS.find(book => book.id === pendingBook);
  const pendingChapters = pendingBookObj ? Array.from({ length: pendingBookObj.chapters }, (_, i) => i + 1) : [];

  const displayBooks = bibleBooks.length > 0 ? bibleBooks : FALLBACK_BIBLE_BOOKS;
  const displayVersions = bibleVersions.length > 0 ? bibleVersions : FALLBACK_BIBLE_VERSIONS;

  // Helper to get localized book name
  const getLocalizedName = (book: BibleBook): string => {
    // Show Spanish names for Spanish Bible translations (RV1909, SPNBES)
    if ((selectedVersion === "rv1909" || selectedVersion === "spnbes") && SPANISH_BOOK_NAMES[book.id]) {
      return SPANISH_BOOK_NAMES[book.id];
    }
    // For English versions (KJV), always show English names regardless of UI language
    return book.name;
  };

  // Helper to get localized book name for a specific version
  const getLocalizedNameForVersion = (book: BibleBook, version: string): string => {
    // Show Spanish names for Spanish Bible translations (RV1909, SPNBES)
    if ((version === "rv1909" || version === "spnbes") && SPANISH_BOOK_NAMES[book.id]) {
      return SPANISH_BOOK_NAMES[book.id];
    }
    // For English versions (KJV), always show English names regardless of UI language
    return book.name;
  };

  const fetchTranslations = async () => {
    setBibleVersions(FALLBACK_BIBLE_VERSIONS);
    setVersionsLoading(false);
  };

  const fetchBooks = async () => {
    setBibleBooks(FALLBACK_BIBLE_BOOKS);
    setBooksLoading(false);
  };

  const fetchChapter = async (bookId: string, chapterNum: number, version: string) => {
    setLoading(true);
    try {
      // Fetch the full book JSON file
      // URL: /bible/{version}/{bookId}.json
      // e.g. /bible/kjv/genesis.json
      const response = await fetch(`${API_BASE}/${version}/${bookId}.json?v=3`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch book data');
      }
      
      const data = await response.json();
      
      // Find the specific chapter
      const chapterData = data.chapters.find((c: any) => c.number === chapterNum);
      
      if (chapterData) {
        setChapter({
          number: chapterNum,
          verses: chapterData.verses
        });
      } else {
        setChapter(null);
        toast({
          title: t("Chapter not found", "Capítulo no encontrado"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
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
    
    // Migrate legacy/uppercase version IDs to lowercase for local files
    if (selectedVersion === "RVR1909" || selectedVersion === "RV1960" || selectedVersion === "rvr09") {
      setSelectedVersion("rv1909");
    } else if (selectedVersion === "KJV") {
      setSelectedVersion("kjv");
    }
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

    // Normalize book name for search: remove special chars, lowercase, trim spaces
    const normalizeBookName = (name: string): string => {
      return name
        .toLowerCase()
        .replace(/[áÁ]/g, 'a')
        .replace(/[éÉ]/g, 'e')
        .replace(/[íÍ]/g, 'i')
        .replace(/[óÓ]/g, 'o')
        .replace(/[úÚüÜ]/g, 'u')
        .replace(/[ñÑ]/g, 'n')
        .replace(/[^a-z0-9\s]/g, '') // Remove all non-alphanumeric chars except spaces
        .replace(/\s+/g, ' ')
        .trim();
    };

    const normalizedSearch = normalizeBookName(bookPart);

    // Create search map with both English and Spanish names (normalized)
    const searchMap = new Map<string, string>();
    displayBooks.forEach((book: BibleBook) => {
      // Add English name
      searchMap.set(normalizeBookName(book.name), book.id);
      
      // Add Spanish name if available
      const spanishName = SPANISH_BOOK_NAMES[book.id];
      if (spanishName) {
        searchMap.set(normalizeBookName(spanishName), book.id);
      }

      // Add common variations and typos
      const variations = getBookNameVariations(book.name, spanishName);
      variations.forEach(variation => {
        searchMap.set(normalizeBookName(variation), book.id);
      });
    });

    // Try exact normalized match first
    if (searchMap.has(normalizedSearch)) {
      const bookId = searchMap.get(normalizedSearch)!;
      const found = displayBooks.find((b: BibleBook) => b.id === bookId);
      if (found) {
        const boundedChapter = Math.min(Math.max(chapterNum, 1), found.chapters);
        return {
          bookId: found.id,
          chapter: boundedChapter,
          verse: verseNum,
        };
      }
    }

    // Try fuzzy matching (contains)
    for (const [key, bookId] of searchMap.entries()) {
      if (key.includes(normalizedSearch) || normalizedSearch.includes(key)) {
        const found = displayBooks.find((b: BibleBook) => b.id === bookId);
        if (found) {
          const boundedChapter = Math.min(Math.max(chapterNum, 1), found.chapters);
          return {
            bookId: found.id,
            chapter: boundedChapter,
            verse: verseNum,
          };
        }
      }
    }

    return null;
  };

  // Helper function to generate common book name variations and typos
  const getBookNameVariations = (englishName: string, spanishName?: string): string[] => {
    const variations: string[] = [];
    
    // Add common abbreviations
    const abbreviations: Record<string, string[]> = {
      "Genesis": ["gen", "gn"],
      "Exodus": ["exo", "ex"],
      "Leviticus": ["lev", "lv"],
      "Numbers": ["num", "nm"],
      "Deuteronomy": ["deut", "dt"],
      "Joshua": ["josh", "jos"],
      "Judges": ["judg", "jdg"],
      "Ruth": ["rut"],
      "1 Samuel": ["1 sam", "1sa", "i samuel"],
      "2 Samuel": ["2 sam", "2sa", "ii samuel"],
      "1 Kings": ["1 king", "1ki", "i kings"],
      "2 Kings": ["2 king", "2ki", "ii kings"],
      "1 Chronicles": ["1 chr", "1ch", "i chronicles"],
      "2 Chronicles": ["2 chr", "2ch", "ii chronicles"],
      "Ezra": ["ezr"],
      "Nehemiah": ["neh", "nh"],
      "Esther": ["est", "esth"],
      "Job": ["job"],
      "Psalms": ["psalm", "ps", "psal"],
      "Proverbs": ["prov", "prv"],
      "Ecclesiastes": ["eccl", "ecc"],
      "Song of Solomon": ["song", "songs", "cant"],
      "Isaiah": ["isa", "is"],
      "Jeremiah": ["jer", "jr"],
      "Lamentations": ["lam", "lm"],
      "Ezekiel": ["eze", "ez"],
      "Daniel": ["dan", "dn"],
      "Hosea": ["hos", "ho"],
      "Joel": ["joel", "jl"],
      "Amos": ["amos", "am"],
      "Obadiah": ["oba", "ob"],
      "Jonah": ["jon", "jn"],
      "Micah": ["mic", "mi"],
      "Nahum": ["nah", "na"],
      "Habakkuk": ["hab", "hb"],
      "Zephaniah": ["zep", "zp"],
      "Haggai": ["hag", "hg"],
      "Zechariah": ["zech", "zc"],
      "Malachi": ["mal", "ml"],
      "Matthew": ["matt", "mt"],
      "Mark": ["mark", "mk", "mr"],
      "Luke": ["luke", "lk"],
      "John": ["john", "jn", "jhn"],
      "Acts": ["acts", "act"],
      "Romans": ["rom", "rm", "ro"],
      "1 Corinthians": ["1 cor", "1co", "i corinthians"],
      "2 Corinthians": ["2 cor", "2co", "ii corinthians"],
      "Galatians": ["gal", "ga"],
      "Ephesians": ["eph", "ep"],
      "Philippians": ["phil", "php", "pp"],
      "Colossians": ["col", "cl"],
      "1 Thessalonians": ["1 thess", "1th", "i thessalonians"],
      "2 Thessalonians": ["2 thess", "2th", "ii thessalonians"],
      "1 Timothy": ["1 tim", "1ti", "i timothy"],
      "2 Timothy": ["2 tim", "2ti", "ii timothy"],
      "Titus": ["tit", "tt"],
      "Philemon": ["philem", "phm", "pm"],
      "Hebrews": ["heb", "he"],
      "James": ["jam", "ja", "jm"],
      "1 Peter": ["1 pet", "1pe", "i peter"],
      "2 Peter": ["2 pet", "2pe", "ii peter"],
      "1 John": ["1 john", "1jn", "i john"],
      "2 John": ["2 john", "2jn", "ii john"],
      "3 John": ["3 john", "3jn", "iii john"],
      "Jude": ["jude", "jd"],
      "Revelation": ["rev", "rv", "revelations"],
    };

    // Add English variations
    if (abbreviations[englishName]) {
      variations.push(...abbreviations[englishName]);
    }

    // Add Spanish variations
    if (spanishName) {
      const spanishAbbreviations: Record<string, string[]> = {
        "Génesis": ["gen", "gn"],
        "Éxodo": ["exo", "ex"],
        "Levítico": ["lev", "lv"],
        "Números": ["num", "nm"],
        "Deuteronomio": ["deut", "dt"],
        "Josué": ["josh", "jos"],
        "Jueces": ["juez", "jdg"],
        "Rut": ["rut"],
        "1 Samuel": ["1 sam", "1sa"],
        "2 Samuel": ["2 sam", "2sa"],
        "1 Reyes": ["1 rey", "1rey", "1 reyes"],
        "2 Reyes": ["2 rey", "2rey", "2 reyes"],
        "1 Crónicas": ["1 cron", "1cr", "1 cronicas"],
        "2 Crónicas": ["2 cron", "2cr", "2 cronicas"],
        "Esdras": ["ezr"],
        "Nehemías": ["neh", "nh"],
        "Ester": ["est", "esth"],
        "Job": ["job"],
        "Salmos": ["sal", "salmo", "sal"],
        "Proverbios": ["prov", "prv"],
        "Eclesiastés": ["ecl", "ecc"],
        "Cantares": ["cant", "cantar"],
        "Isaías": ["isa", "is"],
        "Jeremías": ["jer", "jr"],
        "Lamentaciones": ["lam", "lm"],
        "Ezequiel": ["eze", "ez"],
        "Daniel": ["dan", "dn"],
        "Oseas": ["ose", "hos"],
        "Joel": ["joel", "jl"],
        "Amós": ["amos", "am"],
        "Abdías": ["abd", "ob"],
        "Jonás": ["jon", "jn"],
        "Miqueas": ["mic", "mi"],
        "Nahúm": ["nah", "na"],
        "Habacuc": ["hab", "hb"],
        "Sofonías": ["sof", "zp"],
        "Hageo": ["hag", "hg"],
        "Zacarías": ["zac", "zc"],
        "Malaquías": ["mal", "ml"],
        "Mateo": ["mat", "mt"],
        "Marcos": ["mar", "mr", "mc"],
        "Lucas": ["luc", "lk"],
        "Juan": ["juan", "jn", "jhn"],
        "Hechos": ["hech", "act"],
        "Romanos": ["rom", "rm", "ro"],
        "1 Corintios": ["1 cor", "1co"],
        "2 Corintios": ["2 cor", "2co"],
        "Gálatas": ["gal", "ga"],
        "Efesios": ["efe", "ef"],
        "Filipenses": ["fil", "php", "pp"],
        "Colosenses": ["col", "cl"],
        "1 Tesalonicenses": ["1 tes", "1th"],
        "2 Tesalonicenses": ["2 tes", "2th"],
        "1 Timoteo": ["1 tim", "1ti"],
        "2 Timoteo": ["2 tim", "2ti"],
        "Tito": ["tit", "tt"],
        "Filemón": ["file", "phm"],
        "Hebreos": ["heb", "he"],
        "Santiago": ["sant", "ja", "sdg"],
        "1 Pedro": ["1 ped", "1pe"],
        "2 Pedro": ["2 ped", "2pe"],
        "1 Juan": ["1 juan", "1jn"],
        "2 Juan": ["2 juan", "2jn"],
        "3 Juan": ["3 juan", "3jn"],
        "Judas": ["jud", "jd"],
        "Apocalipsis": ["apo", "apoc", "rev", "rv"],
      };

      if (spanishAbbreviations[spanishName]) {
        variations.push(...spanishAbbreviations[spanishName]);
      }
    }

    return variations;
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
        <h1 className="serif-heading text-3xl font-bold text-neutral-900 mb-2">
          {t("Bible", "Biblia")}
        </h1>
        <p className="text-neutral-600">
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
            className="border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-500"
          />
          <Button onClick={handleSearch} disabled={loading} className="warm-button-primary">
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
          className="warm-button-secondary border-neutral-300 text-neutral-700 hover:text-white hover:border-warm-red hover:bg-warm-red"
          aria-label={t("Previous chapter", "Capítulo anterior")}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Dialog open={selectorsOpen} onOpenChange={setSelectorsOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              disabled={loading}
              className="text-center px-3 py-2 rounded-md hover:bg-neutral-100 transition-colors disabled:opacity-50"
            >
              <h2 className="serif-heading text-xl font-semibold text-neutral-900">
                {getLocalizedName(currentBook || FALLBACK_BIBLE_BOOKS[0])} {selectedChapter}
              </h2>
              {chapter && (
                <p className="text-sm text-neutral-600">
                  {chapter.verses.length} {t("verses", "versículos")}
                </p>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                {t("Tap to change", "Toca para cambiar")}
              </p>
            </button>
          </DialogTrigger>
          <DialogContent className="border-neutral-200 bg-white text-neutral-900">
            <DialogHeader>
              <DialogTitle className="serif-heading text-neutral-900">{t("Select passage", "Seleccionar pasaje")}</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Select
                  value={pendingVersion}
                  onValueChange={setPendingVersion}
                  disabled={versionsLoading}
                >
                  <SelectTrigger className="w-full border-neutral-300 bg-white text-neutral-900">
                    <SelectValue placeholder={t("Version", "Versión")} />
                  </SelectTrigger>
                  <SelectContent className="border-neutral-200 bg-white">
                    {displayVersions.map((version) => (
                      <SelectItem key={version.id} value={version.id} className="text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900">
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
                  <SelectTrigger className="w-full border-neutral-300 bg-white text-neutral-900">
                    <SelectValue placeholder={t("Book", "Libro")} />
                  </SelectTrigger>
                  <SelectContent className="border-neutral-200 bg-white max-h-60">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-neutral-500 mb-2">{t("Old Testament", "Antiguo Testamento")}</div>
                      {displayBooks.filter(book => book.testament === "OT").map((book) => (
                        <SelectItem key={book.id} value={book.id} className="text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900">
                          {getLocalizedNameForVersion(book, pendingVersion)}
                        </SelectItem>
                      ))}
                      <div className="text-xs font-semibold text-neutral-500 mb-2 mt-4">{t("New Testament", "Nuevo Testamento")}</div>
                      {displayBooks.filter(book => book.testament === "NT").map((book) => (
                        <SelectItem key={book.id} value={book.id} className="text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900">
                          {getLocalizedNameForVersion(book, pendingVersion)}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>

                <Select
                  value={pendingChapter.toString()}
                  onValueChange={(value) => {
                    setPendingChapter(parseInt(value));
                  }}
                >
                  <SelectTrigger className="w-full border-neutral-300 bg-white text-neutral-900">
                    <SelectValue placeholder={t("Chapter", "Capítulo")} />
                  </SelectTrigger>
                  <SelectContent className="border-neutral-200 bg-white max-h-60">
                    {pendingChapters.map((chapter) => (
                      <SelectItem key={chapter} value={chapter.toString()} className="text-neutral-900 focus:bg-neutral-100 focus:text-neutral-900">
                        {t("Chapter", "Capítulo")} {chapter}
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
                  className="warm-button-primary"
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
          className="warm-button-secondary border-neutral-300 text-neutral-700 hover:text-white hover:border-warm-red hover:bg-warm-red"
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
              <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
            </div>
          ))}
        </div>
      ) : chapter ? (
        <div className="warm-card p-6 md:p-8">
          <div className="space-y-4">
            {chapter.verses.map((verse) => (
              <div
                key={verse.number}
                id={`verse-${verse.number}`}
                className={
                  `flex items-start gap-3 rounded-md px-2 py-1 transition-colors ` +
                  (highlightedVerse === verse.number ? "bg-warm-red/10 ring-1 ring-warm-red/30" : "hover:bg-neutral-50")
                }
              >
                <span className="text-warm-red font-semibold min-w-[2rem] text-sm mt-1 select-none">
                  {verse.number}
                </span>
                <p className="text-neutral-800 leading-relaxed flex-1 text-lg font-serif">
                  {verse.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 leading-relaxed text-center">
              {selectedVersion === "spnbes"
                ? "La Biblia en Español Sencillo. 2018–2019 AudioBiblia.org / Irma Flores. Licensed CC BY 4.0."
                : selectedVersion === "rv1909"
                  ? "Reina-Valera 1909 (RV1909), Public Domain."
                  : "King James Version (KJV), Public Domain."}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
          <p className="text-neutral-600">
            {t("Select a book and chapter to begin reading", "Selecciona un libro y capítulo para comenzar a leer")}
          </p>
        </div>
      )}
    </div>
  );
}
