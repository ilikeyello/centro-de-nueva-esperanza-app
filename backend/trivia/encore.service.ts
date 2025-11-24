import { api } from "encore.dev/api";
import database from "../db";

export interface TriviaLevel {
  id: string;
  name: string;
  description?: string;
  target_group?: string;
  shuffle_questions: boolean;
  time_limit: number;
  passing_score: number;
  created_at: string;
  updated_at: string;
}

export interface TriviaQuestion {
  id: number;
  question_en: string;
  question_es: string;
  options_en: string[];
  options_es: string[];
  correct_answer: number;
  category: string;
  reference?: string;
  level_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLevelRequest {
  id: string;
  name: string;
  description?: string;
  target_group?: string;
  shuffle_questions?: boolean;
  time_limit?: number;
  passing_score?: number;
}

export interface UpdateLevelRequest {
  name?: string;
  description?: string;
  target_group?: string;
  shuffle_questions?: boolean;
  time_limit?: number;
  passing_score?: number;
}

export interface CreateQuestionRequest {
  question_en: string;
  question_es: string;
  options_en: string[];
  options_es: string[];
  correct_answer: number;
  category: string;
  reference?: string;
  level_id: string;
}

export interface UpdateQuestionRequest {
  question_en?: string;
  question_es?: string;
  options_en?: string[];
  options_es?: string[];
  correct_answer?: number;
  category?: string;
  reference?: string;
  level_id?: string;
}

// Level endpoints
export const levels = api(
  { expose: true, path: "/trivia/levels", method: "GET" },
  async (): Promise<TriviaLevel[]> => {
    const result = await database.query`
      SELECT * FROM trivia_levels 
      ORDER BY created_at ASC
    `;
    
    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      target_group: row.target_group,
      shuffle_questions: row.shuffle_questions,
      time_limit: row.time_limit,
      passing_score: row.passing_score,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    }));
  }
);

export const createLevel = api(
  { expose: true, path: "/trivia/levels", method: "POST" },
  async (params: CreateLevelRequest): Promise<TriviaLevel> => {
    const result = await database.query`
      INSERT INTO trivia_levels (id, name, description, target_group, shuffle_questions, time_limit, passing_score)
      VALUES (${params.id}, ${params.name}, ${params.description || null}, ${params.target_group || null}, 
              ${params.shuffle_questions ?? true}, ${params.time_limit ?? 30}, ${params.passing_score ?? 70})
      RETURNING *
    `;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      target_group: row.target_group,
      shuffle_questions: row.shuffle_questions,
      time_limit: row.time_limit,
      passing_score: row.passing_score,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    };
  }
);

export const updateLevel = api(
  { expose: true, path: "/trivia/levels/:id", method: "PUT" },
  async (params: UpdateLevelRequest & { id: string }): Promise<TriviaLevel> => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(params.name);
    }
    if (params.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(params.description);
    }
    if (params.target_group !== undefined) {
      updates.push(`target_group = $${paramIndex++}`);
      values.push(params.target_group);
    }
    if (params.shuffle_questions !== undefined) {
      updates.push(`shuffle_questions = $${paramIndex++}`);
      values.push(params.shuffle_questions);
    }
    if (params.time_limit !== undefined) {
      updates.push(`time_limit = $${paramIndex++}`);
      values.push(params.time_limit);
    }
    if (params.passing_score !== undefined) {
      updates.push(`passing_score = $${paramIndex++}`);
      values.push(params.passing_score);
    }

    updates.push(`updated_at = NOW()`);
    values.push(params.id);

    const result = await database.query`
      UPDATE trivia_levels 
      SET ${database.raw(updates.join(', '))}
      WHERE id = ${params.id}
      RETURNING *
    `;
    
    if (result.rows.length === 0) {
      throw new Error("Level not found");
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      target_group: row.target_group,
      shuffle_questions: row.shuffle_questions,
      time_limit: row.time_limit,
      passing_score: row.passing_score,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    };
  }
);

export const deleteLevel = api(
  { expose: true, path: "/trivia/levels/:id", method: "DELETE" },
  async ({ id }: { id: string }): Promise<void> => {
    await database.query`DELETE FROM trivia_levels WHERE id = ${id}`;
  }
);

// Question endpoints
export const questions = api(
  { expose: true, path: "/trivia/questions", method: "GET" },
  async ({ level_id }: { level_id?: string }): Promise<TriviaQuestion[]> => {
    let query = `SELECT * FROM trivia_questions`;
    const params: any[] = [];
    
    if (level_id) {
      query += ` WHERE level_id = $1`;
      params.push(level_id);
    }
    
    query += ` ORDER BY created_at ASC`;
    
    const result = await database.query(query, ...params);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      question_en: row.question_en,
      question_es: row.question_es,
      options_en: row.options_en,
      options_es: row.options_es,
      correct_answer: row.correct_answer,
      category: row.category,
      reference: row.reference,
      level_id: row.level_id,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    }));
  }
);

export const createQuestion = api(
  { expose: true, path: "/trivia/questions", method: "POST" },
  async (params: CreateQuestionRequest): Promise<TriviaQuestion> => {
    const result = await database.query`
      INSERT INTO trivia_questions (question_en, question_es, options_en, options_es, correct_answer, category, reference, level_id)
      VALUES (${params.question_en}, ${params.question_es}, ${JSON.stringify(params.options_en)}, ${JSON.stringify(params.options_es)}, 
              ${params.correct_answer}, ${params.category}, ${params.reference || null}, ${params.level_id})
      RETURNING *
    `;
    
    const row = result.rows[0];
    return {
      id: row.id,
      question_en: row.question_en,
      question_es: row.question_es,
      options_en: row.options_en,
      options_es: row.options_es,
      correct_answer: row.correct_answer,
      category: row.category,
      reference: row.reference,
      level_id: row.level_id,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    };
  }
);

export const updateQuestion = api(
  { expose: true, path: "/trivia/questions/:id", method: "PUT" },
  async (params: UpdateQuestionRequest & { id: number }): Promise<TriviaQuestion> => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.question_en !== undefined) {
      updates.push(`question_en = $${paramIndex++}`);
      values.push(params.question_en);
    }
    if (params.question_es !== undefined) {
      updates.push(`question_es = $${paramIndex++}`);
      values.push(params.question_es);
    }
    if (params.options_en !== undefined) {
      updates.push(`options_en = $${paramIndex++}`);
      values.push(JSON.stringify(params.options_en));
    }
    if (params.options_es !== undefined) {
      updates.push(`options_es = $${paramIndex++}`);
      values.push(JSON.stringify(params.options_es));
    }
    if (params.correct_answer !== undefined) {
      updates.push(`correct_answer = $${paramIndex++}`);
      values.push(params.correct_answer);
    }
    if (params.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(params.category);
    }
    if (params.reference !== undefined) {
      updates.push(`reference = $${paramIndex++}`);
      values.push(params.reference);
    }
    if (params.level_id !== undefined) {
      updates.push(`level_id = $${paramIndex++}`);
      values.push(params.level_id);
    }

    updates.push(`updated_at = NOW()`);
    values.push(params.id);

    const result = await database.query`
      UPDATE trivia_questions 
      SET ${database.raw(updates.join(', '))}
      WHERE id = ${params.id}
      RETURNING *
    `;
    
    if (result.rows.length === 0) {
      throw new Error("Question not found");
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      question_en: row.question_en,
      question_es: row.question_es,
      options_en: row.options_en,
      options_es: row.options_es,
      correct_answer: row.correct_answer,
      category: row.category,
      reference: row.reference,
      level_id: row.level_id,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
    };
  }
);

export const deleteQuestion = api(
  { expose: true, path: "/trivia/questions/:id", method: "DELETE" },
  async ({ id }: { id: number }): Promise<void> => {
    await database.query`DELETE FROM trivia_questions WHERE id = ${id}`;
  }
);
