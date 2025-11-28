import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { Brain, Play, Clock, Target, Trophy, RotateCcw, ChevronRight, ArrowLeft } from "lucide-react";

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
  options_en: string | string[];
  options_es: string | string[];
  correct_answer: number;
  category: string;
  reference?: string;
  level_id: string;
  created_at: string;
  updated_at: string;
}

interface GameState {
  status: 'menu' | 'playing' | 'results';
  selectedLevel: TriviaLevel | null;
  questions: TriviaQuestion[];
  currentQuestionIndex: number;
  userAnswers: number[];
  score: number;
  isTimerActive: boolean;
  timeRemaining: number;
}

export function TriviaGamePage() {
  const { t, language } = useLanguage();
  const [levels, setLevels] = useState<TriviaLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const [gameState, setGameState] = useState<GameState>({
    status: 'menu',
    selectedLevel: null,
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [],
    score: 0,
    isTimerActive: false,
    timeRemaining: 30,
  });

  const loadLevels = async () => {
    try {
      const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";
      const response = await fetch(`${base}/trivia/simple`);
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
      const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";
      const response = await fetch(`${base}/trivia/simple`);
      const data = await response.json();
      return data.questions.filter((q: TriviaQuestion) => q.level_id === levelId);
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
      userAnswers: [],
      score: 0,
      isTimerActive: true,
      timeRemaining: level.time_limit,
    });
  };

  const handleAnswer = (answerIndex: number) => {
    if (gameState.status !== 'playing') return;

    const newAnswers = [...gameState.userAnswers, answerIndex];
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correct_answer;
    const newScore = gameState.score + (isCorrect ? 1 : 0);

    if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
      setGameState({
        ...gameState,
        userAnswers: newAnswers,
        score: newScore,
        currentQuestionIndex: gameState.currentQuestionIndex + 1,
        timeRemaining: gameState.selectedLevel?.time_limit || 30,
      });
    } else {
      setGameState({
        ...gameState,
        userAnswers: newAnswers,
        score: newScore,
        status: 'results',
        isTimerActive: false,
      });
    }
  };

  const handleTimeUp = () => {
    if (gameState.status !== 'playing') return;
    
    const newAnswers = [...gameState.userAnswers, -1]; // -1 for unanswered
    if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
      setGameState({
        ...gameState,
        userAnswers: newAnswers,
        currentQuestionIndex: gameState.currentQuestionIndex + 1,
        timeRemaining: gameState.selectedLevel?.time_limit || 30,
      });
    } else {
      setGameState({
        ...gameState,
        userAnswers: newAnswers,
        status: 'results',
        isTimerActive: false,
      });
    }
  };

  const resetGame = () => {
    setGameState({
      status: 'menu',
      selectedLevel: null,
      questions: [],
      currentQuestionIndex: 0,
      userAnswers: [],
      score: 0,
      isTimerActive: false,
      timeRemaining: 30,
    });
  };

  useEffect(() => {
    loadLevels();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (gameState.isTimerActive && gameState.timeRemaining > 0) {
        setGameState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      } else if (gameState.timeRemaining === 0 && gameState.isTimerActive) {
        handleTimeUp();
      }
      return () => clearInterval(interval);
    }, 1000);
  }, [gameState.isTimerActive, gameState.timeRemaining]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">
          <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p>{t("Loading trivia...", "Cargando trivia...")}</p>
        </div>
      </div>
    );
  }

  if (gameState.status === 'menu') {
    return (
      <div className="container mx-auto space-y-8 px-4 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => window.location.href = '/games'}
          variant="outline" 
          className="mb-6 border-neutral-700 hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Back to Games", "Volver a Juegos")}
        </Button>

        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-red-400" />
            <h1 className="text-4xl font-bold text-white">
              {language === 'es' ? 'Trivia Bíblica' : 'Bible Trivia'}
            </h1>
          </div>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            {language === 'es' 
              ? 'Pon a prueba tu conocimiento de la Biblia con preguntas divertidas y educativas para todas las edades.'
              : 'Test your Bible knowledge with fun and educational questions for all ages.'
            }
          </p>
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {levels.map((level) => (
            <Card 
              key={level.id} 
              className="bg-neutral-900 border-neutral-800 hover:border-red-600 transition-all cursor-pointer group"
              onClick={() => startGame(level)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {language === 'es' ? level.name : level.name}
                    </h3>
                    {level.description && (
                      <p className="text-neutral-400 mb-3">
                        {language === 'es' ? level.description : level.description}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {level.time_limit}s
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {level.passing_score}% {t("to pass", "para aprobar")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform" />
                    <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-red-400 transition-colors" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {levels.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 mx-auto mb-4 text-neutral-600" />
            <p className="text-neutral-400">
              {t("No trivia levels available yet.", "No hay niveles de trivia disponibles aún.")}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (gameState.status === 'playing' && gameState.questions.length > 0) {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const question = language === 'es' ? currentQuestion.question_es : currentQuestion.question_en;
    const options = language === 'es' 
      ? (typeof currentQuestion.options_es === 'string' ? JSON.parse(currentQuestion.options_es) : currentQuestion.options_es)
      : (typeof currentQuestion.options_en === 'string' ? JSON.parse(currentQuestion.options_en) : currentQuestion.options_en);

    return (
      <div className="container mx-auto space-y-6 px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <Button 
          onClick={resetGame}
          variant="outline" 
          className="border-neutral-700 hover:bg-neutral-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Exit Game", "Salir del Juego")}
        </Button>

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
                {options.map((option: string, index: number) => (
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
    const percentage = Math.round((gameState.score / gameState.questions.length) * 100);
    const passed = percentage >= (gameState.selectedLevel?.passing_score || 70);
    
    return (
      <div className="container mx-auto space-y-6 px-4 py-8 max-w-2xl">
        <Card className={`bg-neutral-900 border-2 ${passed ? 'border-green-600' : 'border-red-600'}`}>
          <CardContent className="p-8 text-center space-y-6">
            <div className={`flex items-center justify-center gap-3 ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {passed ? <Trophy className="h-8 w-8" /> : <RotateCcw className="h-8 w-8" />}
              <h2 className="text-3xl font-bold">
                {passed 
                  ? (language === 'es' ? '¡Aprobado!' : 'Passed!') 
                  : (language === 'es' ? 'No Aprobado' : 'Not Passed')
                }
              </h2>
            </div>

            <div className="space-y-2">
              <div className="text-4xl font-bold text-white">
                {gameState.score} / {gameState.questions.length}
              </div>
              <div className="text-xl text-neutral-400">
                {percentage}% {t("correct", "correctas")}
              </div>
              <div className="text-sm text-neutral-500">
                {t("Required", "Requerido")}: {gameState.selectedLevel?.passing_score || 70}%
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={resetGame} className="bg-red-600 hover:bg-red-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("Play Again", "Jugar de Nuevo")}
              </Button>
              <Button onClick={() => window.location.href = '/games'} variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("Back to Games", "Volver a Juegos")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
