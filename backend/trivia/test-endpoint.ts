import { api } from "encore.dev/api";

export const testTriviaEndpoint = api(
  { expose: true, path: "/trivia/test", method: "GET" },
  async (): Promise<{ message: string; success: boolean }> => {
    return {
      message: "Trivia service is working!",
      success: true
    };
  }
);
