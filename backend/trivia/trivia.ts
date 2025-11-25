import { api, APIError } from "encore.dev/api";
import db from "../db";

interface TriviaQuestion {
  id?: number;
  question: string;
  answers: string[];
  correctAnswer: number;
  timer: number;
}

interface UpdateTriviaRequest {
  passcode: string;
  questions: TriviaQuestion[];
  defaultTimer: number;
}

interface GetTriviaResponse {
  questions: TriviaQuestion[];
  defaultTimer: number;
}

export const save = api<UpdateTriviaRequest, void>(
  { expose: true, method: "POST", path: "/trivia" },
  async (req) => {
    if (req.passcode !== "78598") {
      throw APIError.permissionDenied("invalid passcode");
    }

    // Store as JSON in database
    await db.exec`
      UPDATE church_info 
      SET trivia_data = ${JSON.stringify({
        questions: req.questions,
        defaultTimer: req.defaultTimer
      })}
      WHERE id = 1
    `;
  }
);

export const get = api<void, GetTriviaResponse>(
  { expose: true, method: "GET", path: "/trivia" },
  async () => {
    const result = await db.queryRow<{ trivia_data: string | null }>`
      SELECT trivia_data
      FROM church_info
      WHERE id = 1
    `;
    
    if (result?.trivia_data) {
      const data = JSON.parse(result.trivia_data);
      return data;
    }
    
    return { questions: [], defaultTimer: 30 };
  }
);
