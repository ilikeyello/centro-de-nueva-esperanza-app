import { api, APIError } from "encore.dev/api";
import db from "../db";

interface TriviaQuestion {
  id?: number;
  question: string;
  question_es?: string;
  answers: string[];
  answers_es?: string[];
  correctAnswer: number;
  timer: number;
  level_id: string;
  category?: string;
  reference?: string;
}

interface TriviaLevel {
  id: string;
  name: string;
  description?: string;
  target_group?: string;
  shuffle_questions: boolean;
  time_limit: number;
  passing_score: number;
}

interface UpdateTriviaRequest {
  passcode: string;
  questions: TriviaQuestion[];
  levels: TriviaLevel[];
  defaultTimer: number;
}

interface GetTriviaResponse {
  questions: TriviaQuestion[];
  levels: TriviaLevel[];
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
        levels: req.levels,
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
    
    // Return default levels if no data exists
    return { 
      questions: [], 
      levels: [
        {
          id: "kids",
          name: "Kids",
          description: "For children ages 6-12",
          target_group: "Children",
          shuffle_questions: true,
          time_limit: 30,
          passing_score: 70
        },
        {
          id: "youth", 
          name: "Youth",
          description: "For teenagers and young adults",
          target_group: "Youth",
          shuffle_questions: true,
          time_limit: 20,
          passing_score: 80
        },
        {
          id: "adults",
          name: "Adults", 
          description: "For adult church members",
          target_group: "Adults",
          shuffle_questions: true,
          time_limit: 15,
          passing_score: 85
        }
      ],
      defaultTimer: 30 
    };
  }
);
