import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { Brain, Play, Clock, Target, Trophy, RotateCcw, ChevronRight } from "lucide-react";

interface TriviaLevel {
  id: string;
  name: string;
  description?: string;
  target_group?: string;
  shuffle_questions: boolean;
  time_limit: number;
  passing_score: number;
}

interface TriviaQuestion {
  id: number;
  question_en: string;
  question_es: string;
  options_en: string[];
  options_es: string[];
  correct_answer: number;
  category: string;
  reference?: string;
  level_id: string;
}

interface GameState {
  status: 'menu' | 'playing' | 'results';
  selectedLevel: TriviaLevel | null;
  questions: TriviaQuestion[];
  currentQuestionIndex: number;
  score: number;
  answers: number[];
  timeRemaining: number;
  isTimerActive: boolean;
}

export function TriviaGame() {
  const { language, t } = useLanguage();
  const [gameState, setGameState] = useState<GameState>({
    status: 'menu',
    selectedLevel: null,
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    answers: [],
    timeRemaining: 30,
    isTimerActive: false,
  });
  const [levels, setLevels] = useState<TriviaLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLevels();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState.isTimerActive && gameState.timeRemaining > 0) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);
    } else if (gameState.timeRemaining === 0 && gameState.isTimerActive) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [gameState.isTimerActive, gameState.timeRemaining]);

  const loadLevels = async () => {
    try {
      const response = await fetch('/trivia/levels');
      const data = await response.json();
      setLevels(data.levels);
    } catch (error) {
      console.error('Failed to load levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (levelId: string) => {
    try {
      const response = await fetch(`/trivia/questions?level_id=${levelId}`);
      const data = await response.json();
      return data.questions;
    } catch (error) {
      console.error('Failed to load questions:', error);
      return [];
    }
  };

  const startGame = async (level: TriviaLevel) => {
    const questions = await loadQuestions(level.id);
    if (questions.length === 0) {
      alert(language === 'es' ? 'No hay preguntas disponibles para este nivel.' : 'No questions available for this level.');
      return;
    }

    const shuffledQuestions = level.shuffle_questions 
      ? [...questions].sort(() => Math.random() - 0.5)
      : questions;

    setGameState({
      status: 'playing',
      selectedLevel: level,
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
      timeRemaining: level.time_limit,
      isTimerActive: true,
    });
  };

  const handleAnswer = (answerIndex: number) => {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correct_answer;
    
    const newAnswers = [...gameState.answers, answerIndex];
    const newScore = isCorrect ? gameState.score + 1 : gameState.score;

    if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        answers: newAnswers,
        score: newScore,
        timeRemaining: prev.selectedLevel!.time_limit,
      }));
    } else {
      endGame(newAnswers, newScore);
    }
  };

  const handleTimeUp = () => {
    const newAnswers = [...gameState.answers, -1]; // -1 indicates no answer
    if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        answers: newAnswers,
        timeRemaining: prev.selectedLevel!.time_limit,
      }));
    } else {
      endGame(newAnswers, gameState.score);
    }
  };

  const endGame = (finalAnswers: number[], finalScore: number) => {
    setGameState(prev => ({
      ...prev,
      status: 'results',
      answers: finalAnswers,
      score: finalScore,
      isTimerActive: false,
    }));
  };

  const resetGame = () => {
    setGameState({
      status: 'menu',
      selectedLevel: null,
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      answers: [],
      timeRemaining: 30,
      isTimerActive: false,
    });
  };

  const calculatePercentage = () => {
    return Math.round((gameState.score / gameState.questions.length) * 100);
  };

  const hasPassed = () => {
    return calculatePercentage() >= (gameState.selectedLevel?.passing_score || 70);
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
        <p className="text-neutral-400 mt-4">{t("Loading...", "Cargando...")}</p>
      </div>
    );
  }

  if (gameState.status === 'menu') {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <Brain className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-3xl font-bold text-white">
            {t("Bible Trivia Challenge", "Desafío de Biblia Trivia")}
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            {language === 'es' 
              ? 'Pon a prueba tu conocimiento de la Biblia con nuestro divertido juego de trivia. Elige tu nivel y ver cuántas preguntas puedes responder correctamente.'
              : 'Test your Bible knowledge with our fun trivia game. Choose your level and see how many questions you can answer correctly.'
            }
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {levels.map((level) => (
            <Card key={level.id} className="bg-neutral-900 border-neutral-800 hover:border-red-500 transition-colors">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{level.name}</h3>
                    {level.description && (
                      <p className="text-neutral-400 text-sm mt-1">{level.description}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-neutral-300">
                      <Clock className="h-4 w-4" />
                      <span>{level.time_limit}s {t("per question", "por pregunta")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-300">
                      <Target className="h-4 w-4" />
                      <span>{level.passing_score}% {t("to pass", "para aprobar")}</span>
                    </div>
                    {level.target_group && (
                      <div className="text-neutral-300">
                        {t("For", "Para")}: {level.target_group}
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={() => startGame(level)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {t("Start", "Empezar")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (gameState.status === 'playing' && gameState.questions.length > 0) {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const question = language === 'es' ? currentQuestion.question_es : currentQuestion.question_en;
    const options = language === 'es' ? currentQuestion.options_es : currentQuestion.options_en;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-neutral-400">
            {t("Question", "Pregunta")} {gameState.currentQuestionIndex + 1} / {gameState.questions.length}
          </div>
          <div className={`flex items-center gap-2 ${gameState.timeRemaining <= 5 ? 'text-red-500' : 'text-neutral-300'}`}>
            <Clock className="h-5 w-5" />
            <span className="font-mono text-lg">{gameState.timeRemaining}s</span>
          </div>
        </div>

        <div className="w-full bg-neutral-800 rounded-full h-2">
          <div 
            className="bg-red-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100}%` }}
          />
        </div>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-8">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white">{question}</h3>
              
              <div className="grid gap-3">
                {options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    variant="outline"
                    className="justify-start h-auto p-4 text-left bg-neutral-800 border-neutral-700 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all"
                  >
                    <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                    <span className="ml-3">{option}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState.status === 'results') {
    const percentage = calculatePercentage();
    const passed = hasPassed();

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-8 text-center space-y-6">
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
              passed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
            }`}>
              {passed ? <Trophy className="h-10 w-10" /> : <Brain className="h-10 w-10" />}
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white">
                {passed 
                  ? (language === 'es' ? '¡Felicidades!' : 'Congratulations!')
                  : (language === 'es' ? 'Inténtalo de nuevo' : 'Try Again')
                }
              </h2>
              <p className="text-neutral-400">
                {passed
                  ? (language === 'es' 
                      ? `Has aprobado el nivel ${gameState.selectedLevel?.name} con ${percentage}%`
                      : `You passed the ${gameState.selectedLevel?.name} level with ${percentage}%`
                    )
                  : (language === 'es'
                      ? `Obtuviste ${percentage}% - necesitas ${gameState.selectedLevel?.passing_score}% para aprobar`
                      : `You got ${percentage}% - you need ${gameState.selectedLevel?.passing_score}% to pass`
                    )
                }
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-4xl font-bold text-white">
                {gameState.score} / {gameState.questions.length}
              </div>
              <div className="text-neutral-300">
                {t("Correct Answers", "Respuestas Correctas")}
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button 
                onClick={resetGame}
                variant="outline"
                className="border-neutral-700 hover:bg-neutral-800"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("Back to Menu", "Volver al Menú")}
              </Button>
              {!passed && gameState.selectedLevel && (
                <Button 
                  onClick={() => startGame(gameState.selectedLevel!)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  {t("Try Again", "Inténtalo de Nuevo")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
