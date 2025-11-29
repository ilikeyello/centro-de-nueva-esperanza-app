import { api } from "encore.dev/api";
import db from "../db";

export const testTriviaDB = api(
  { expose: true, path: "/trivia/test-db", method: "GET" },
  async (): Promise<{ success: boolean; message: string; tablesExist: boolean }> => {
    try {
      // Check if trivia tables exist
      const levelsCheck = await db.query`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'trivia_levels_simple'
        );
      `;
      
      const questionsCheck = await db.query`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'trivia_questions_simple'
        );
      `;
      
      const levelsRows = [];
      for await (const row of levelsCheck) {
        levelsRows.push(row);
      }
      
      const questionsRows = [];
      for await (const row of questionsCheck) {
        questionsRows.push(row);
      }
      
      const levelsTableExists = levelsRows[0]?.exists || false;
      const questionsTableExists = questionsRows[0]?.exists || false;
      
      // Try to count records if tables exist
      let levelsCount = 0;
      let questionsCount = 0;
      
      if (levelsTableExists) {
        const countResult = await db.query`SELECT COUNT(*) as count FROM trivia_levels_simple`;
        const countRows = [];
        for await (const row of countResult) {
          countRows.push(row);
        }
        levelsCount = countRows[0]?.count || 0;
      }
      
      if (questionsTableExists) {
        const countResult = await db.query`SELECT COUNT(*) as count FROM trivia_questions_simple`;
        const countRows = [];
        for await (const row of countResult) {
          countRows.push(row);
        }
        questionsCount = countRows[0]?.count || 0;
      }
      
      return {
        success: true,
        message: `Database check complete. Tables: Levels=${levelsTableExists}, Questions=${questionsTableExists}. Records: Levels=${levelsCount}, Questions=${questionsCount}`,
        tablesExist: levelsTableExists && questionsTableExists
      };
    } catch (error) {
      return {
        success: false,
        message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tablesExist: false
      };
    }
  }
);
