import { api, APIError } from "encore.dev/api";
import { Query } from "encore.dev/api";
import db from "../db";

export interface TriviaLevel {
  id: string;
  name: string;
  description: string | null;
  shuffle_questions: boolean;
  time_limit: number;
  passing_score: number;
  created_at: Date;
}

export interface TriviaQuestion {
  id: number;
  question_en: string;
  question_es: string;
  options_en: string;
  options_es: string;
  correct_answer: number;
  category: string;
  level_id: string;
  created_at: Date;
}

export interface TriviaResponse {
  levels: TriviaLevel[];
  questions: TriviaQuestion[];
}

// Get all trivia data
export const getTrivia = api<void, TriviaResponse>(
  { expose: true, method: "GET", path: "/trivia/simple" },
  async () => {
    const levels = await db.queryAll<TriviaLevel>`
      SELECT id, name, description, shuffle_questions, time_limit, passing_score, created_at
      FROM trivia_levels_simple
      ORDER BY created_at ASC
    `;

    const questions = await db.queryAll<TriviaQuestion>`
      SELECT id, question_en, question_es, options_en, options_es, correct_answer, category, level_id, created_at
      FROM trivia_questions_simple
      ORDER BY created_at ASC
    `;

    return {
      levels,
      questions
    };
  }
);

// Create level
export const createLevel = api(
  { expose: true, method: "POST", path: "/trivia/simple/level" },
  async (params: {
    id: string;
    name: string;
    description?: string;
    shuffle_questions?: boolean;
    time_limit?: number;
    passing_score?: number;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      console.log("Creating level with params:", params);
      
      const result = await db.query`
        INSERT INTO trivia_levels_simple (id, name, description, shuffle_questions, time_limit, passing_score)
        VALUES (${params.id}, ${params.name}, ${params.description || null}, ${params.shuffle_questions ?? true}, ${params.time_limit ?? 30}, ${params.passing_score ?? 70})
        RETURNING id, name
      `;
      
      console.log("Insert result:", result);
      
      // Check if insert actually worked
      const rows = [];
      for await (const row of result) {
        rows.push(row);
      }
      
      if (rows.length > 0) {
        return { success: true, message: "Level created successfully" };
      } else {
        return { success: false, message: "Failed to insert level - no rows returned" };
      }
    } catch (error) {
      console.error("Error creating level:", error);
      return { success: false, message: `Failed to create level: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
);

// Create question
export const createQuestion = api(
  { expose: true, method: "POST", path: "/trivia/simple/question" },
  async (params: {
    question_en: string;
    question_es: string;
    options_en: string;
    options_es: string;
    correct_answer: number;
    category: string;
    level_id: string;
  }): Promise<{ success: boolean; message: string }> => {
    try {
      console.log("Creating question with params:", params);
      
      const result = await db.query`
        INSERT INTO trivia_questions_simple (question_en, question_es, options_en, options_es, correct_answer, category, level_id)
        VALUES (${params.question_en}, ${params.question_es}, ${params.options_en}, ${params.options_es}, ${params.correct_answer}, ${params.category}, ${params.level_id})
        RETURNING id, question_en
      `;
      
      console.log("Insert result:", result);
      
      // Check if insert actually worked
      const rows = [];
      for await (const row of result) {
        rows.push(row);
      }
      
      if (rows.length > 0) {
        return { success: true, message: "Question created successfully" };
      } else {
        return { success: false, message: "Failed to insert question - no rows returned" };
      }
    } catch (error) {
      console.error("Error creating question:", error);
      return { success: false, message: `Failed to create question: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
);

// Delete level
export const deleteLevel = api(
  { expose: true, method: "DELETE", path: "/trivia/simple/level/:id" },
  async ({ id, passcode }: { id: string; passcode?: Query<string> }): Promise<{ success: boolean; message: string }> => {
    // Check if passcode is correct
    if (!passcode || passcode !== "78598") {
      return { success: false, message: "Invalid passcode" };
    }

    try {
      await db.query`DELETE FROM trivia_levels_simple WHERE id = ${id}`;
      return { success: true, message: "Level deleted successfully" };
    } catch (error) {
      return { success: false, message: `Failed to delete level: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
);

// Delete question
export const deleteQuestion = api(
  { expose: true, method: "DELETE", path: "/trivia/simple/question/:id" },
  async ({ id, passcode }: { id: number; passcode?: Query<string> }): Promise<{ success: boolean; message: string }> => {
    // Check if passcode is correct
    if (!passcode || passcode !== "78598") {
      return { success: false, message: "Invalid passcode" };
    }

    try {
      await db.query`DELETE FROM trivia_questions_simple WHERE id = ${id}`;
      return { success: true, message: "Question deleted successfully" };
    } catch (error) {
      return { success: false, message: `Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
);
