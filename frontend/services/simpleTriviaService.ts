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

const SIMPLE_TRIVIA_API = 'https://prod-cne-sh82.encr.app/simple-trivia';

export const simpleTriviaService = {
  // Load all trivia data
  async loadTrivia(): Promise<SimpleTriviaData> {
    console.log("Loading simple trivia data");
    try {
      const response = await fetch(SIMPLE_TRIVIA_API);
      if (!response.ok) {
        if (response.status === 404) {
          console.log("Simple trivia API not found, using fallback data");
          return {
            levels: {
              kids: { name: "Kids", timeLimit: 30, passingScore: 70 },
              youth: { name: "Youth", timeLimit: 20, passingScore: 80 },
              adults: { name: "Adults", timeLimit: 15, passingScore: 85 }
            },
            questions: []
          };
        }
        throw new Error(`Failed to load trivia: ${response.status}`);
      }
      const data = await response.json();
      console.log("Simple trivia loaded successfully:", data);
      return data;
    } catch (error) {
      console.error("Error loading simple trivia:", error);
      // Return fallback data if API is not available
      return {
        levels: {
          kids: { name: "Kids", timeLimit: 30, passingScore: 70 },
          youth: { name: "Youth", timeLimit: 20, passingScore: 80 },
          adults: { name: "Adults", timeLimit: 15, passingScore: 85 }
        },
        questions: []
      };
    }
  },

  // Save all trivia data (admin only)
  async saveTrivia(data: SimpleTriviaData): Promise<void> {
    console.log("Saving simple trivia data");
    try {
      const response = await fetch(SIMPLE_TRIVIA_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passcode: '78598',
          data
        })
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Simple trivia API not deployed yet. Please deploy the backend first.");
        }
        throw new Error(`Failed to save trivia: ${response.status}`);
      }
      console.log("Simple trivia saved successfully");
    } catch (error) {
      console.error("Error saving simple trivia:", error);
      throw error;
    }
  },

  // Get questions for a specific level
  getQuestionsForLevel(data: SimpleTriviaData, level: 'kids' | 'youth' | 'adults'): SimpleQuestion[] {
    return data.questions.filter(q => q.level === level);
  },

  // Generate unique ID for new questions
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

export type { SimpleQuestion, SimpleLevel, SimpleTriviaData };
