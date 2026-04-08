import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { Brain, Play, Clock, Target, Trophy, RotateCcw, ChevronRight, ArrowLeft } from "lucide-react";
import { supabase, churchOrgId } from "../../lib/mainSiteData";

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

  const snapToTop = () => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    const main = document.querySelector("main");
    if (main) (main as HTMLElement).scrollTop = 0;
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-[--ink-dark]">
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
          className="mb-6 bg-[--surface] text-[--ink-dark] hover:bg-[--sage] hover:text-white border border-[--border-color]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Back to Games", "Volver a Juegos")}
        </Button>

        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <Brain className="h-8 w-8 text-[--sage]" />
            <h1 className="text-4xl font-bold text-[--ink-dark]">
              {language === 'es' ? 'Trivia Bíblica' : 'Bible Trivia'}
            </h1>
          </div>
          <p className="text-[--ink-light] max-w-2xl mx-auto">
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
              className={`warm-card transition-all cursor-pointer group ${
                selectedLevelForConfirmation?.id === level.id 
                  ? 'border-[--sage] ring-2 ring-[--sage]/50' 
                  : 'hover:border-[--sage]'
              }`}
              onClick={() => setSelectedLevelForConfirmation(level)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[--ink-dark] mb-2">
                      {language === 'es' ? level.name_es : level.name_en}
                    </h3>
                    {level.description_en && (
                      <p className="text-[--ink-light] mb-3">
                        {language === 'es' ? level.description_es : level.description_en}
                      </p>
                    )}
                    <div className="flex gap-4 text-sm text-[--ink-light]">
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
                        className="bg-[--sage] hover:bg-[--sage-mid]"
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
            <Brain className="h-16 w-16 mx-auto mb-4 text-[--ink-mid]" />
            <p className="text-[--ink-light]">
              {t("No trivia levels available yet.", "No hay niveles de trivia disponibles aún.")}
            </p>
          </div>
        )}
      </div>
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
      <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-[--background] overflow-hidden" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Header/Back Button - Moved higher */}
        <div className="flex-shrink-0 px-3 pt-0 mt-[-4px] flex items-center justify-between">
          <Button 
            onClick={resetGame}
            className="bg-[--surface] text-[--ink-dark] hover:bg-[--sage] hover:text-white border border-[--border-color] h-8 text-xs"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            {t("Levels", "Niveles")}
          </Button>
          <div className={`flex items-center gap-2 ${gameState.timeRemaining <= 5 ? 'text-[--sage]' : 'text-[--ink-mid]'}`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono text-base">{gameState.isTimerActive ? `${gameState.timeRemaining}s` : '∞'}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-3 pt-2 flex-shrink-0">
          <div className="flex justify-between text-[10px] text-[--ink-light] mb-1 uppercase tracking-wider">
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
                
                <div className="grid gap-1.5 md:gap-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                  {options.map((option: string, index: number) => {
                    const isSelected = gameState.selectedAnswer === index;
                    const isCorrect = index === currentQuestion.correct_answer;
                    
                    return (
                      <Button
                        key={index}
                        onClick={() => selectAnswer(index)}
                        variant="outline"
                        disabled={gameState.showFeedback}
                        className={`justify-start h-auto p-2.5 md:p-4 text-left transition-all text-xs md:text-base relative min-h-[44px] ${
                          gameState.showFeedback
                            ? isCorrect
                              ? 'bg-green-100 border-green-400 text-green-800 opacity-100'
                              : isSelected
                              ? 'bg-red-100 border-red-400 text-red-800 opacity-100'
                              : 'bg-[--surface-mid] border-[--border-color] text-[--ink-light] opacity-50'
                            : isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-600/30'
                            : 'bg-[--surface] border-[--border-color] hover:bg-[--surface-mid] hover:border-blue-500 text-[--ink-dark]'
                        }`}
                      >
                        <span className="font-bold mr-2 opacity-50">{String.fromCharCode(65 + index)}.</span>
                        <span className="flex-1 pr-4">{option}</span>
                        {gameState.showFeedback && isCorrect && <span className="ml-auto text-green-600">✓</span>}
                        {gameState.showFeedback && isSelected && !isCorrect && <span className="ml-auto text-red-600">✗</span>}
                      </Button>
                    );
                  })}
                </div>

                {/* Action Button */}
                <div className="flex-shrink-0 pt-2 border-t border-[--border-color]">
                  {!gameState.showFeedback ? (
                    <Button
                      onClick={submitAnswer}
                      disabled={gameState.selectedAnswer === null}
                      className="w-full bg-[--sage] hover:bg-[--sage-mid] h-10 md:h-12 font-bold disabled:opacity-50"
                    >
                      {t("Submit Answer", "Enviar Respuesta")}
                    </Button>
                  ) : (
                    <Button
                      onClick={nextQuestion}
                      className="w-full bg-[--sage] hover:bg-[--sage-mid] h-10 md:h-12 font-bold"
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
        <Card className={`warm-card border-2 ${passed ? 'border-green-600' : 'border-red-600'}`}>
          <CardContent className="p-8 text-center space-y-6">
            <div className={`flex items-center justify-center gap-3 ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? <Trophy className="h-8 w-8" /> : <RotateCcw className="h-8 w-8" />}
              <h2 className="text-3xl font-bold text-[--ink-dark]">
                {passed 
                  ? (language === 'es' ? '¡Aprobado!' : 'Passed!') 
                  : (language === 'es' ? '¡Fracasado!' : 'Failed!')
                }
              </h2>
            </div>

            <div className="space-y-2">
              <div className="text-xl text-[--ink-light]">
                {percentage}% {t("correct", "correctas")}
              </div>
              <div className="text-sm text-[--ink-light]">
                {t("Required", "Requerido")}: {gameState.selectedLevel?.passing_score || 70}%
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={restartLevel} className="bg-[--sage] hover:bg-[--sage-mid]">
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("Restart", "Reiniciar")}
              </Button>
              <Button onClick={resetGame} className="bg-[--surface] text-[--ink-dark] hover:bg-[--sage] hover:text-white border border-[--border-color]">
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
