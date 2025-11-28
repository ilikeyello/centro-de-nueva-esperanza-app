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
  selectedAnswer: number | null;
  showFeedback: boolean;
}

export function TriviaGamePage({ onNavigate }: { onNavigate?: (page: string) => void } = {}) {
  const { t, language } = useLanguage();
  const [levels, setLevels] = useState<TriviaLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevelForConfirmation, setSelectedLevelForConfirmation] = useState<TriviaLevel | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    status: 'menu',
    selectedLevel: null,
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [],
    score: 0,
    isTimerActive: false,
    timeRemaining: 30,
    selectedAnswer: null,
    showFeedback: false,
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
      selectedAnswer: null,
      showFeedback: false,
    });
  };

  const selectAnswer = (answerIndex: number) => {
    if (gameState.status !== 'playing' || gameState.showFeedback) return;
    setGameState(prev => ({
      ...prev,
      selectedAnswer: answerIndex
    }));
  };

  const submitAnswer = () => {
    if (gameState.selectedAnswer === null || gameState.status !== 'playing') return;

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = gameState.selectedAnswer === currentQuestion.correct_answer;
    
    // Show feedback
    setGameState(prev => ({
      ...prev,
      showFeedback: true,
      isTimerActive: false // Stop timer when showing feedback
    }));
  };

  const nextQuestion = () => {
    if (gameState.status !== 'playing') return;

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = gameState.selectedAnswer === currentQuestion.correct_answer;
    const newScore = gameState.score + (isCorrect ? 1 : 0);
    const newAnswers = [...gameState.userAnswers, gameState.selectedAnswer!];

    if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
      setGameState({
        ...gameState,
        userAnswers: newAnswers,
        score: newScore,
        currentQuestionIndex: gameState.currentQuestionIndex + 1,
        timeRemaining: gameState.selectedLevel?.time_limit || 30,
        selectedAnswer: null,
        showFeedback: false,
        isTimerActive: true,
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
        selectedAnswer: null,
        showFeedback: false,
        isTimerActive: true,
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
      selectedAnswer: null,
      showFeedback: false,
    });
  };

  const restartLevel = async () => {
    if (!gameState.selectedLevel) return;
    
    const questions = await loadQuestions(gameState.selectedLevel.id);
    if (questions.length === 0) return;

    const shuffledQuestions = gameState.selectedLevel.shuffle_questions 
      ? [...questions].sort(() => Math.random() - 0.5)
      : questions;

    setGameState({
      status: 'playing',
      selectedLevel: gameState.selectedLevel,
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      userAnswers: [],
      score: 0,
      isTimerActive: true,
      timeRemaining: gameState.selectedLevel.time_limit,
      selectedAnswer: null,
      showFeedback: false,
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
    }, 1000);
    return () => clearInterval(interval);
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
          onClick={() => onNavigate?.("games")}
          variant="outline" 
          className="mb-6 border-neutral-700 hover:bg-neutral-800 text-white"
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
              className={`bg-neutral-900 border-neutral-800 transition-all cursor-pointer group ${
                selectedLevelForConfirmation?.id === level.id 
                  ? 'border-red-600 ring-2 ring-red-600/50' 
                  : 'hover:border-red-600'
              }`}
              onClick={() => setSelectedLevelForConfirmation(level)}
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
                  {selectedLevelForConfirmation?.id === level.id && (
                    <div className="flex gap-2">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          startGame(level);
                          setSelectedLevelForConfirmation(null);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {t("Play Now", "Jugar Ahora")}
                      </Button>
                    </div>
                  )}
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
      <div className="container mx-auto space-y-4 px-3 py-4 max-w-3xl h-screen md:h-auto flex flex-col md:block overflow-hidden">
        {/* Back Button */}
        <Button 
          onClick={resetGame}
          variant="outline" 
          className="border-neutral-700 hover:bg-neutral-800 text-white flex-shrink-0 mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Levels", "Niveles")}
        </Button>

        <div className="flex items-center justify-between flex-shrink-0">
          <div className="text-neutral-400 text-sm">
            {t("Question", "Pregunta")} {gameState.currentQuestionIndex + 1} / {gameState.questions.length}
          </div>
          <div className={`flex items-center gap-2 ${gameState.timeRemaining <= 5 ? 'text-red-500' : 'text-neutral-300'}`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono text-lg">{gameState.timeRemaining}s</span>
          </div>
        </div>

        <div className="w-full bg-neutral-800 rounded-full h-1.5 flex-shrink-0">
          <div 
            className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100}%` }}
          />
        </div>

        <Card className="bg-neutral-900 border-neutral-800 flex-1 overflow-hidden md:overflow-visible">
          <CardContent className="p-4 md:p-8 h-full flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col">
              <h3 className="text-lg md:text-2xl font-semibold text-white flex-shrink-0">{question}</h3>
              
              <div className="grid gap-2 md:gap-3 flex-1">
                {options.map((option: string, index: number) => {
                  const isSelected = gameState.selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correct_answer;
                  const showCorrect = gameState.showFeedback && isCorrect;
                  const showWrong = gameState.showFeedback && isSelected && !isCorrect;
                  
                  return (
                    <Button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      variant="outline"
                      disabled={gameState.showFeedback}
                      className={`justify-start h-auto p-3 md:p-4 text-left transition-all text-sm md:text-base ${
                        gameState.showFeedback
                          ? isCorrect
                            ? 'bg-green-600 border-green-500 text-white'
                            : isSelected
                            ? 'bg-red-600 border-red-500 text-white'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                          : isSelected
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-neutral-800 border-neutral-700 hover:bg-red-600 hover:border-red-600 hover:text-white'
                      }`}
                    >
                      <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                      <span>{option}</span>
                      {showCorrect && <span className="ml-auto">✓</span>}
                      {showWrong && <span className="ml-auto">✗</span>}
                    </Button>
                  );
                })}
              </div>

              {/* Submit/Next Button */}
              <div className="flex-shrink-0 pt-4">
                {!gameState.showFeedback ? (
                  <Button
                    onClick={submitAnswer}
                    disabled={gameState.selectedAnswer === null}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-700 disabled:text-neutral-500"
                  >
                    {t("Submit Answer", "Enviar Respuesta")}
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {gameState.currentQuestionIndex < gameState.questions.length - 1
                      ? t("Next Question", "Siguiente Pregunta")
                      : t("See Results", "Ver Resultados")}
                  </Button>
                )}
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
                  : (language === 'es' ? '¡Fracasado!' : 'Failed!')
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
              <Button onClick={restartLevel} className="bg-red-600 hover:bg-red-700">
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("Restart", "Reiniciar")}
              </Button>
              <Button onClick={resetGame} variant="outline" className="border-neutral-700 hover:bg-neutral-800 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("Back to Levels", "Volver a Niveles")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
