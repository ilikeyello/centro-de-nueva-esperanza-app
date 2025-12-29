// Complete Bible structure with all books and chapters
export interface BibleBookData {
  id: string;
  name: string;
  testament: "OT" | "NT";
  chapters: number;
}

export interface BibleVerseData {
  translation: string;
  book: string;
  chapter: number;
  verses: string[];
}

// Complete Bible books structure
export const BIBLE_BOOKS: BibleBookData[] = [
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

// Generate placeholder verses for all books and chapters
export function generateCompleteBibleData(): BibleVerseData[] {
  const translations = ["kjv", "rv1909", "spnbes"];
  const placeholderTexts = {
    kjv: "This verse content would be added here in a full implementation. For production use, this should be replaced with actual Bible text from authorized sources.",
    rv1909: "Este contenido del verso se agregaría aquí en una implementación completa. Para uso en producción, esto debe ser reemplazado con texto bíblico real de fuentes autorizadas.",
    spnbes: "El contenido de este versículo se añadiría aquí en una implementación completa. Para uso producción, esto debe ser reemplazado con texto bíblico real de fuentes autorizadas."
  };

  const allData: BibleVerseData[] = [];

  for (const translation of translations) {
    for (const book of BIBLE_BOOKS) {
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        // Generate a reasonable number of verses per chapter
        const verseCount = getVerseCount(book.id, chapter);
        const verses: string[] = [];
        
        for (let verse = 1; verse <= verseCount; verse++) {
          verses.push(placeholderTexts[translation as keyof typeof placeholderTexts]);
        }
        
        allData.push({
          translation,
          book: book.id,
          chapter,
          verses
        });
      }
    }
  }

  return allData;
}

// Estimate verse counts for each chapter (approximate)
function getVerseCount(bookId: string, chapter: number): number {
  const verseCounts: Record<string, number[]> = {
    "genesis": [31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34, 28, 34, 31, 22, 33, 26],
    "john": [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25],
    "psalms": Array.from({length: 150}, (_, i) => Math.floor(Math.random() * 20) + 5), // Variable length psalms
    // Add more specific verse counts as needed
  };

  if (verseCounts[bookId] && verseCounts[bookId][chapter - 1]) {
    return verseCounts[bookId][chapter - 1];
  }

  // Default verse counts based on book type and chapter
  if (bookId === "psalms") {
    return Math.floor(Math.random() * 20) + 5; // 5-25 verses for psalms
  } else if (bookId === "proverbs") {
    return Math.floor(Math.random() * 15) + 10; // 10-25 verses for proverbs
  } else if (chapter <= 5) {
    return Math.floor(Math.random() * 20) + 20; // 20-40 verses for early chapters
  } else {
    return Math.floor(Math.random() * 15) + 15; // 15-30 verses for other chapters
  }
}
