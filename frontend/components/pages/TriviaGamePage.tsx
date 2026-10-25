import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { Brain, Clock, Target, Trophy, RotateCcw, ArrowLeft, Check, X } from "lucide-react";
import { supabase, churchOrgId } from "../../lib/mainSiteData";
import { GameMenuScreen, GameOptionCard, GameMenuNote, resetGameScroll } from "../games/GameMenu";

interface TriviaLevel {
  id: string;
  name_en: string;
  name_es: string;
  description_en?: string;
  description_es?: string;
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

  const snapToTop = () => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    const main = document.querySelector("main");
    if (main) (main as HTMLElement).scrollTop = 0;
    resetGameScroll();
  };

  const loadLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('trivia_levels')
        .select('*')
        .eq('church_id', churchOrgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Game page - loaded levels:', data?.length);
      setLevels(data || []);
    } catch (error) {
      console.error('Failed to load levels:', error);
      setLevels([]);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (levelId: string) => {
    try {
      const { data, error } = await supabase
        .from('trivia_questions')
        .select('*')
        .eq('level_id', levelId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to load questions:', error);
      return [];
    }
  };

  const standardizeQuestions = (questions: any[]) => {
    return questions.map(q => ({
      ...q,
      // Convert database 1-based index to internal 0-based index
      correct_answer: typeof q.correct_answer === 'number' ? q.correct_answer - 1 : parseInt(q.correct_answer) - 1,
      options_en: typeof q.options_en === 'string' ? JSON.parse(q.options_en) : q.options_en,
      options_es: typeof q.options_es === 'string' ? JSON.parse(q.options_es) : q.options_es,
    }));
  };

  const startGame = async (level: TriviaLevel) => {
    const rawQuestions = await loadQuestions(level.id);
    const questions = standardizeQuestions(rawQuestions);
    if (questions.length === 0) {
      alert(language === 'es' ? 'No hay preguntas disponibles para este nivel.' : 'No questions available for this level.');
      return;
    }

    const shuffledQuestions = level.shuffle_questions 
      ? [...questions].sort(() => Math.random() - 0.5)
      : questions;

    // Shuffle options for each question if shuffle is enabled
    const processedQuestions = shuffledQuestions.map((question: TriviaQuestion) => {
      if (!level.shuffle_questions) return question;
      
      const options_en = typeof question.options_en === 'string' 
        ? JSON.parse(question.options_en) 
        : question.options_en;
      const options_es = typeof question.options_es === 'string' 
        ? JSON.parse(question.options_es) 
        : question.options_es;
      
      // Create array of option indices and shuffle them
      const optionIndices = Array.from({ length: options_en.length }, (_, i) => i);
      const shuffledIndices = [...optionIndices].sort(() => Math.random() - 0.5);
      
      // Reorder options based on shuffled indices
      const shuffledOptions_en = shuffledIndices.map(i => options_en[i]);
      const shuffledOptions_es = shuffledIndices.map(i => options_es[i]);
      
      // Update correct answer index - Database uses 1-based indexing
      const newCorrectIndex = shuffledIndices.indexOf(question.correct_answer);
      
      return {
        ...question,
        options_en: shuffledOptions_en,
        options_es: shuffledOptions_es,
        correct_answer: newCorrectIndex
      };
    });

    setGameState({
      status: 'playing',
      selectedLevel: level,
      questions: processedQuestions,
      currentQuestionIndex: 0,
      userAnswers: [],
      score: 0,
      isTimerActive: level.time_limit > 0, // Only activate timer if time_limit > 0
      timeRemaining: level.time_limit,
      selectedAnswer: null,
      showFeedback: false,
    });
    snapToTop();
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
    const newAnswers = [...gameState.userAnswers, gameState.selectedAnswer !== null ? gameState.selectedAnswer : -1];

    if (gameState.currentQuestionIndex < gameState.questions.length - 1) {
      setGameState({
        ...gameState,
        userAnswers: newAnswers,
        score: newScore,
        currentQuestionIndex: gameState.currentQuestionIndex + 1,
        selectedAnswer: null,
        showFeedback: false,
        isTimerActive: (gameState.selectedLevel?.time_limit ?? 0) > 0, // Preserve timer state based on level
        timeRemaining: (gameState.selectedLevel?.time_limit ?? 0) > 0 ? gameState.selectedLevel!.time_limit! : gameState.timeRemaining, // Reset time for timed levels, preserve for infinite
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
    
    // Fill remaining questions with -1 (unanswered) and end game
    const remainingQuestions = gameState.questions.length - gameState.currentQuestionIndex - 1;
    const newAnswers = [...gameState.userAnswers, -1, ...Array(remainingQuestions).fill(-1)];
    
    setGameState({
      ...gameState,
      userAnswers: newAnswers,
      status: 'results',
      isTimerActive: false,
    });
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
    
    const rawQuestions = await loadQuestions(gameState.selectedLevel.id);
    const questions = standardizeQuestions(rawQuestions);
    if (questions.length === 0) return;

    const shuffledQuestions = gameState.selectedLevel.shuffle_questions 
      ? [...questions].sort(() => Math.random() - 0.5)
      : questions;

    // Shuffle options for each question if shuffle is enabled
    const processedQuestions = shuffledQuestions.map((question: TriviaQuestion) => {
      if (!gameState.selectedLevel?.shuffle_questions) return question;
      
      const options_en = typeof question.options_en === 'string' 
        ? JSON.parse(question.options_en) 
        : question.options_en;
      const options_es = typeof question.options_es === 'string' 
        ? JSON.parse(question.options_es) 
        : question.options_es;
      
      // Create array of option indices and shuffle them
      const optionIndices = Array.from({ length: options_en.length }, (_, i) => i);
      const shuffledIndices = [...optionIndices].sort(() => Math.random() - 0.5);
      
      // Reorder options based on shuffled indices
      const shuffledOptions_en = shuffledIndices.map(i => options_en[i]);
      const shuffledOptions_es = shuffledIndices.map(i => options_es[i]);
      
      // Update correct answer index - Database uses 1-based indexing
      const newCorrectIndex = shuffledIndices.indexOf(question.correct_answer);
      
      return {
        ...question,
        options_en: shuffledOptions_en,
        options_es: shuffledOptions_es,
        correct_answer: newCorrectIndex
      };
    });

    setGameState(prev => ({
      ...prev,
      status: 'playing',
      questions: processedQuestions, // FIX: must update questions in state
      currentQuestionIndex: 0,
      userAnswers: [],
      score: 0,
      isTimerActive: prev.selectedLevel?.time_limit ? prev.selectedLevel.time_limit > 0 : false,
      timeRemaining: prev.selectedLevel?.time_limit || 0,
      selectedAnswer: null,
      showFeedback: false,
    }));
    snapToTop();
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

  useEffect(() => {
    // Ensure any transition between menu/playing/results is pinned to top
    snapToTop();
  }, [gameState.status]);

  if (loading || gameState.status === 'menu') {
    return (
      <GameMenuScreen
        onBack={() => onNavigate?.("games")}
        backLabel={t("Games", "Juegos")}
        icon={<Brain />}
        eyebrow={t("Choose a level", "Elige un nivel")}
        title={t("Bible Trivia", "Trivia Bíblica")}
        subtitle={t(
          "Test your Bible knowledge with fun and educational questions for all ages.",
          "Pon a prueba tu conocimiento de la Biblia con preguntas divertidas y educativas para todas las edades."
        )}
      >
        {loading ? (
          <GameMenuNote>{t("Loading levels...", "Cargando niveles...")}</GameMenuNote>
        ) : levels.length === 0 ? (
          <GameMenuNote>{t("No trivia levels available yet.", "No hay niveles de trivia disponibles aún.")}</GameMenuNote>
        ) : (
          levels.map((level, i) => (
            <GameOptionCard
              key={level.id}
              icon={<span className="text-lg font-bold">{i + 1}</span>}
              title={language === 'es' ? level.name_es : level.name_en}
              description={language === 'es' ? level.description_es : level.description_en}
              meta={[
                <><Clock />{level.time_limit > 0 ? `${level.time_limit}s` : '∞'}</>,
                <><Target />{level.passing_score}% {t("to pass", "para aprobar")}</>,
              ]}
              onClick={() => startGame(level)}
            />
          ))
        )}
      </GameMenuScreen>
    );
  }

  if (gameState.status === 'playing' && gameState.questions.length > 0) {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const questionText = language === 'es' ? currentQuestion.question_es : currentQuestion.question_en;
    const options = language === 'es' 
      ? (typeof currentQuestion.options_es === 'string' ? JSON.parse(currentQuestion.options_es) : currentQuestion.options_es)
      : (typeof currentQuestion.options_en === 'string' ? JSON.parse(currentQuestion.options_en) : currentQuestion.options_en);
    
    // Safety check for correct_answer
    const correctAnswerIndex = currentQuestion.correct_answer;

    return (
      <div className="w-full flex flex-col overflow-hidden pt-2" style={{ height: 'calc(100vh - env(safe-area-inset-top) - 6rem)' }}>
        {/* Header/Back Button - Moved higher */}
        <div className="flex-shrink-0 px-3 flex items-center justify-between">
          <Button onClick={resetGame} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4" />
            {t("Levels", "Niveles")}
          </Button>
          <div className={`flex items-center gap-2 ${gameState.isTimerActive && gameState.timeRemaining <= 5 ? 'text-red-600 dark:text-red-400' : 'text-[--ink-mid]'}`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono text-base">{gameState.isTimerActive ? `${gameState.timeRemaining}s` : '∞'}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-3 pt-2 flex-shrink-0">
          <div className="flex justify-between text-[10px] text-[--ink-mid] mb-1 uppercase tracking-wider">
            <span>{t("Question", "Pregunta")} {gameState.currentQuestionIndex + 1} / {gameState.questions.length}</span>
            <span>{Math.round(((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-[--surface-mid] rounded-full h-1">
            <div 
              className="bg-[--sage] h-1 rounded-full transition-all duration-300"
              style={{ width: `${((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 p-3 overflow-hidden flex flex-col min-h-0">
          <Card className="warm-card border-[--border-color] flex flex-col h-full min-h-0">
            <CardContent className="p-3 md:p-6 flex flex-col h-full min-h-0">
              <div className="flex-1 flex flex-col justify-between gap-2 min-h-0">
                <h3 className="text-base md:text-xl font-semibold text-[--ink-dark] leading-tight flex-shrink-0">
                  {questionText}
                </h3>
                
                <div className="grid content-start gap-2 md:gap-3 flex-1 overflow-y-auto p-1 custom-scrollbar">
                  {options.map((option: string, index: number) => {
                    const isSelected = gameState.selectedAnswer === index;
                    const isCorrect = index === currentQuestion.correct_answer;
                    
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectAnswer(index)}
                        disabled={gameState.showFeedback}
                        aria-pressed={isSelected}
                        className={`trivia-answer text-sm md:text-base ${
                          gameState.showFeedback
                            ? isCorrect
                              ? 'is-correct'
                              : isSelected
                              ? 'is-wrong'
                              : 'is-dim'
                            : isSelected
                            ? 'is-selected'
                            : ''
                        }`}
                      >
                        <span className="trivia-answer-letter">{String.fromCharCode(65 + index)}</span>
                        <span className="flex-1">{option}</span>
                        {gameState.showFeedback && isCorrect && <Check className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />}
                        {gameState.showFeedback && isSelected && !isCorrect && <X className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0 pt-2 border-t border-[--border-color]">
                  {!gameState.showFeedback ? (
                    <Button
                      onClick={submitAnswer}
                      disabled={gameState.selectedAnswer === null}
                      className="w-full h-11 md:h-12 font-bold disabled:opacity-50"
                    >
                      {t("Submit Answer", "Enviar Respuesta")}
                    </Button>
                  ) : (
                    <Button
                      onClick={nextQuestion}
                      className="w-full h-11 md:h-12 font-bold"
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
      </div>
    );
  }

  if (gameState.status === 'results') {
    const percentage = Math.round((gameState.score / gameState.questions.length) * 100);
    const passed = percentage >= (gameState.selectedLevel?.passing_score || 70);
    
    return (
      <div className="container mx-auto space-y-6 px-4 py-8 max-w-2xl">
        <Card className="warm-card">
          <CardContent className="p-8 text-center space-y-6">
            <div className={`flex flex-col items-center justify-center gap-3 ${passed ? 'text-green-600 dark:text-green-400' : 'text-[--sage]'}`}>
              <div className="game-icon-bubble h-16 w-16">{passed ? <Trophy className="h-8 w-8" /> : <RotateCcw className="h-8 w-8" />}</div>
              <h2 className="text-3xl font-bold text-[--ink-dark]">
                {passed 
                  ? (language === 'es' ? '¡Aprobado!' : 'Passed!') 
                  : (language === 'es' ? '¡Inténtalo de nuevo!' : 'Try again!')
                }
              </h2>
            </div>

            <div className="space-y-2">
              <div className="text-xl text-[--ink-dark]">
                {percentage}% {t("correct", "correctas")}
              </div>
              <div className="text-sm text-[--ink-mid]">
                {t("Required", "Requerido")}: {gameState.selectedLevel?.passing_score || 70}%
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={restartLevel}>
                <RotateCcw className="h-4 w-4" />
                {t("Restart", "Reiniciar")}
              </Button>
              <Button onClick={resetGame} variant="outline">
                <ArrowLeft className="h-4 w-4" />
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
