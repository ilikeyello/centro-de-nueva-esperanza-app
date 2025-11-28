import { api } from "encore.dev/api";
import database from "../db";

export const testTrivia = api(
  { expose: true, path: "/trivia/test", method: "GET" },
  async (): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      // Test if we can query trivia_levels
      const levelsResult = await database.query`SELECT COUNT(*) as count FROM trivia_levels`;
      const levelsRows = [];
      for await (const row of levelsResult) {
        levelsRows.push(row);
      }
      const levelsCount = levelsRows[0]?.count || 0;

      // Test if we can query trivia_questions
      const questionsResult = await database.query`SELECT COUNT(*) as count FROM trivia_questions`;
      const questionsRows = [];
      for await (const row of questionsResult) {
        questionsRows.push(row);
      }
      const questionsCount = questionsRows[0]?.count || 0;

      return {
        success: true,
        message: `Database accessible. Levels: ${levelsCount}, Questions: ${questionsCount}`,
        data: {
          levelsCount,
          questionsCount
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
);
