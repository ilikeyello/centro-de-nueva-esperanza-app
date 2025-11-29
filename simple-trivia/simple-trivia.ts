import { api, APIError } from "encore.dev/api";
import db from "../db";

interface SimpleQuestion {
  id: string;
  question: string;
  question_es?: string;
  answers: string[];
  answers_es?: string[];
  correctAnswer: number;
  level: 'kids' | 'youth' | 'adults';
  category?: string;
  reference?: string;
}

interface SimpleLevel {
  name: string;
  timeLimit: number;
  passingScore: number;
}

interface SimpleTriviaData {
  levels: {
    kids: SimpleLevel;
    youth: SimpleLevel;
    adults: SimpleLevel;
  };
  questions: SimpleQuestion[];
}

interface SaveRequest {
  passcode: string;
  data: SimpleTriviaData;
}

// Default data structure
const DEFAULT_DATA: SimpleTriviaData = {
  levels: {
    kids: { name: "Kids", timeLimit: 30, passingScore: 70 },
    youth: { name: "Youth", timeLimit: 20, passingScore: 80 },
    adults: { name: "Adults", timeLimit: 15, passingScore: 85 }
  },
  questions: []
};

// export const get = api<void, SimpleTriviaData>(
//   { expose: true, method: "GET", path: "/simple-trivia" },
//   async () => {
    const result = await db.queryRow<{ trivia_data: string | null }>`
      SELECT trivia_data 
      FROM church_info 
      WHERE id = 1
    `;
    
    if (result?.trivia_data) {
      try {
        const data = JSON.parse(result.trivia_data);
        // Ensure it has the correct structure
        if (data.levels && data.questions) {
        //   return data;
        }
      } catch (e) {
        console.error("Failed to parse trivia data:", e);
      }
    }
    
    // Return default structure
    // return DEFAULT_DATA;
  // }
// );

// export const save = api<SaveRequest, void>(
//   { expose: true, method: "POST", path: "/simple-trivia" },
//   async (req) => {
//     if (req.passcode !== "78598") {
//       throw APIError.permissionDenied("Invalid passcode");
//     }

//     // Validate data structure
//     if (!req.data.levels || !req.data.questions) {
//       throw APIError.invalidArgument("Invalid data structure");
//     }

//     // Ensure all required levels exist
//     const requiredLevels = ['kids', 'youth', 'adults'] as const;
//     for (const level of requiredLevels) {
//       if (!req.data.levels[level]) {
//         req.data.levels[level] = DEFAULT_DATA.levels[level];
//       }
//     }

//     // Save to database
//     await db.exec`
//       UPDATE church_info 
//       SET trivia_data = ${JSON.stringify(req.data)}
//       WHERE id = 1
//     `;
//   }
// );
