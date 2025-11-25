interface TriviaQuestion {
  id?: number;
  question: string;
  answers: string[];
  correctAnswer: number;
  timer: number;
}

interface TriviaData {
  questions: TriviaQuestion[];
  defaultTimer: number;
}

const TRIVIA_API = 'https://prod-cne-sh82.encr.app/trivia';

export const triviaService = {
  // Save trivia data (admin only)
  async saveTrivia(questions: TriviaQuestion[], defaultTimer: number): Promise<void> {
    const response = await fetch(TRIVIA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        passcode: '78598',
        questions,
        defaultTimer
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save trivia data');
    }
  },

  // Load trivia data (everyone)
  async loadTrivia(): Promise<TriviaData> {
    const response = await fetch(TRIVIA_API);
    
    if (!response.ok) {
      throw new Error('Failed to load trivia data');
    }
    
    return await response.json();
  }
};

export type { TriviaQuestion, TriviaData };
