import { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

const BIBLE_API_BASE = "https://bible-api.com";

// Common Bible versions
const BIBLE_VERSIONS: BibleVersion[] = [
  { id: "kjv", name: "King James Version", abbreviation: "KJV" },
  { id: "esv", name: "English Standard Version", abbreviation: "ESV" },
  { id: "niv", name: "New International Version", abbreviation: "NIV" },
  { id: "nlt", name: "New Living Translation", abbreviation: "NLT" },
  { id: "rvr1960", name: "Reina-Valera 1960", abbreviation: "RVR1960" },
  { id: "nvi", name: "Nueva Versión Internacional", abbreviation: "NVI" },
];

// Books of the Bible
const BIBLE_BOOKS: BibleBook[] = [
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

  const [selectedVersion, setSelectedVersion] = useState<string>("kjv");
  const [selectedBook, setSelectedBook] = useState<string>("john");
  const [selectedChapter, setSelectedChapter] = useState<number>(3);
  const [selectedVerse, setSelectedVerse] = useState<number>(16);
  const [chapter, setChapter] = useState<BibleChapter | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const currentBook = BIBLE_BOOKS.find(book => book.id === selectedBook);
  const chapters = currentBook ? Array.from({ length: currentBook.chapters }, (_, i) => i + 1) : [];

  const fetchChapter = async (bookId: string, chapterNum: number, version: string) => {
    setLoading(true);
    try {
      const bookName = BIBLE_BOOKS.find(book => book.id === bookId)?.name || bookId;
      const response = await fetch(`${BIBLE_API_BASE}/${bookName}+${chapterNum}?translation=${version}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch chapter');
      }
      
      const data = await response.json();
      
      if (data.verses) {
        const verses: BibleVerse[] = data.verses.map((verse: any) => ({
          number: verse.verse,
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
    if (selectedBook && selectedChapter) {
      fetchChapter(selectedBook, selectedChapter, selectedVersion);
    }
  }, [selectedBook, selectedChapter, selectedVersion]);

  const handlePreviousChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
      setSelectedVerse(1);
    }
  };

  const handleNextChapter = () => {
    if (currentBook && selectedChapter < currentBook.chapters) {
      setSelectedChapter(selectedChapter + 1);
      setSelectedVerse(1);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${BIBLE_API_BASE}/${encodeURIComponent(searchQuery)}?translation=${selectedVersion}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      
      if (data.verses) {
        const verses: BibleVerse[] = data.verses.map((verse: any) => ({
          number: verse.verse,
          text: verse.text,
        }));
        
        setChapter({
          number: 1,
          verses,
        });
      }
    } catch (error) {
      toast({
        title: t("Search Error", "Error de Búsqueda"),
        description: t("Failed to search verses", "No se pudieron buscar los versículos"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Version Selector */}
          <Select value={selectedVersion} onValueChange={setSelectedVersion}>
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

          {/* Book Selector */}
          <Select value={selectedBook} onValueChange={(value) => {
            setSelectedBook(value);
            setSelectedChapter(1);
            setSelectedVerse(1);
          }}>
            <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
              <SelectValue placeholder={t("Book", "Libro")} />
            </SelectTrigger>
            <SelectContent className="border-neutral-700 bg-neutral-800 max-h-60">
              <div className="p-2">
                <div className="text-xs font-semibold text-neutral-400 mb-2">{t("Old Testament", "Antiguo Testamento")}</div>
                {BIBLE_BOOKS.filter(book => book.testament === "OT").map((book) => (
                  <SelectItem key={book.id} value={book.id} className="text-white">
                    {book.name}
                  </SelectItem>
                ))}
                <div className="text-xs font-semibold text-neutral-400 mb-2 mt-4">{t("New Testament", "Nuevo Testamento")}</div>
                {BIBLE_BOOKS.filter(book => book.testament === "NT").map((book) => (
                  <SelectItem key={book.id} value={book.id} className="text-white">
                    {book.name}
                  </SelectItem>
                ))}
              </div>
            </SelectContent>
          </Select>

          {/* Chapter Selector */}
          <Select value={selectedChapter.toString()} onValueChange={(value) => {
            setSelectedChapter(parseInt(value));
            setSelectedVerse(1);
          }}>
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

          {/* Verse Selector */}
          <Select value={selectedVerse.toString()} onValueChange={(value) => setSelectedVerse(parseInt(value))}>
            <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
              <SelectValue placeholder={t("Verse", "Versículo")} />
            </SelectTrigger>
            <SelectContent className="border-neutral-700 bg-neutral-800 max-h-60">
              {chapter && Array.from({ length: Math.max(...chapter.verses.map(v => v.number)) }, (_, i) => i + 1).map((verse) => (
                <SelectItem key={verse} value={verse.toString()} className="text-white">
                  {t("Verse", "Versículo")} {verse}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
          className="border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("Previous", "Anterior")}
        </Button>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white">
            {currentBook?.name} {selectedChapter}
          </h2>
          {chapter && (
            <p className="text-sm text-neutral-400">
              {chapter.verses.length} {t("verses", "versículos")}
            </p>
          )}
        </div>
        
        <Button
          onClick={handleNextChapter}
          disabled={!currentBook || selectedChapter >= currentBook.chapters || loading}
          variant="outline"
          className="border-neutral-700 bg-neutral-800 text-white hover:bg-neutral-700"
        >
          {t("Next", "Siguiente")}
          <ChevronRight className="h-4 w-4 ml-2" />
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
        <div className="space-y-6">
          {chapter.verses.map((verse) => (
            <div
              key={verse.number}
              className={`p-4 rounded-lg border ${
                verse.number === selectedVerse
                  ? "border-red-500 bg-red-950/20"
                  : "border-neutral-800 bg-neutral-900/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-red-400 font-semibold min-w-[3rem] text-sm">
                  {verse.number}
                </span>
                <p className="text-neutral-200 leading-relaxed flex-1">
                  {verse.text}
                </p>
              </div>
            </div>
          ))}
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
