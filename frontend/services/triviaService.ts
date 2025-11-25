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

interface TriviaData {
  questions: TriviaQuestion[];
  levels: TriviaLevel[];
  defaultTimer: number;
}

const TRIVIA_API = 'https://prod-cne-sh82.encr.app/trivia';

export const triviaService = {
  // Save trivia data (admin only)
  async saveTrivia(questions: TriviaQuestion[], levels: TriviaLevel[], defaultTimer: number): Promise<void> {
    console.log("triviaService.saveTrivia called with:", { questions, levels, defaultTimer });
    try {
      const response = await fetch(TRIVIA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: '78598',
          questions,
          levels,
          defaultTimer
        })
      });

      console.log("Save response status:", response.status);
      console.log("Save response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Save failed response:", errorText);
        throw new Error(`Failed to save trivia data: ${response.status} ${errorText}`);
      }

      console.log("Save successful!");
    } catch (error) {
      console.error("Error in saveTrivia:", error);
      throw error;
    }
  },

  // Load trivia data (everyone)
  async loadTrivia(): Promise<TriviaData> {
    console.log("triviaService.loadTrivia called");
    try {
      const response = await fetch(TRIVIA_API);
      console.log("Load response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Load failed response:", errorText);
        throw new Error(`Failed to load trivia data: ${response.status} ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Load successful, data:", data);
      return data;
    } catch (error) {
      console.error("Error in loadTrivia:", error);
      throw error;
    }
  }
};

export type { TriviaQuestion, TriviaLevel, TriviaData };
