"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Brain, Play, Clock, Target, Trophy, RotateCcw, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

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
  status: "menu" | "playing" | "results";
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

export function TriviaGamePage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [levels, setLevels] = useState<TriviaLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevelForConfirmation, setSelectedLevelForConfirmation] = useState<TriviaLevel | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    status: "menu",
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

  const base = process.env.NEXT_PUBLIC_CLIENT_TARGET || "https://prod-cne-sh82.encr.app";

  const snapToTop = () => {
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    const main = document.querySelector("main");
    if (main) (main as HTMLElement).scrollTop = 0;
  };

  const loadLevels = async () => {
    try {
      const response = await fetch(`${base}/trivia/simple`, { cache: "no-store" });
      const data = await response.json();
      setLevels(data.levels);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (levelId: string) => {
    try {
      const response = await fetch(`${base}/trivia/simple`, { cache: "no-store" });
      const data = await response.json();
      return data.questions.filter((q: TriviaQuestion) => q.level_id === levelId);
    } catch {
      return [];
    }
  };

  const startGame = async (level: TriviaLevel) => {
    const questions = await loadQuestions(level.id);
    if (questions.length === 0) {
      alert(language === "es" ? "No hay preguntas disponibles para este nivel." : "No questions available for this level.");
      return;
    }

    const shuffledQuestions = level.shuffle_questions ? [...questions].sort(() => Math.random() - 0.5) : questions;

    const processedQuestions = shuffledQuestions.map((question: TriviaQuestion) => {
      if (!level.shuffle_questions) return question;

      const options_en = typeof question.options_en === "string" ? JSON.parse(question.options_en) : question.options_en;
      const options_es = typeof question.options_es === "string" ? JSON.parse(question.options_es) : question.options_es;

      const optionIndices = Array.from({ length: options_en.length }, (_, i) => i);
      const shuffledIndices = [...optionIndices].sort(() => Math.random() - 0.5);

      const shuffledOptions_en = shuffledIndices.map((i) => options_en[i]);
      const shuffledOptions_es = shuffledIndices.map((i) => options_es[i]);

      const newCorrectIndex = shuffledIndices.indexOf(question.correct_answer);

      return {
        ...question,
        options_en: JSON.stringify(shuffledOptions_en),
        options_es: JSON.stringify(shuffledOptions_es),
        correct_answer: newCorrectIndex,
      };
    });

    setGameState({
      status: "playing",
      selectedLevel: level,
      questions: processedQuestions,
      currentQuestionIndex: 0,
      userAnswers: [],
      score: 0,
      isTimerActive: level.time_limit > 0,
      timeRemaining: level.time_limit,
      selectedAnswer: null,
      showFeedback: false,
    });

    snapToTop();
  };

  const selectAnswer = (answerIndex: number) => {
    if (gameState.status !== "playing" || gameState.showFeedback) return;
    setGameState((prev) => ({
      ...prev,
      selectedAnswer: answerIndex,
    }));
  };

  const submitAnswer = () => {
    if (gameState.selectedAnswer === null || gameState.status !== "playing") return;

    setGameState((prev) => ({
      ...prev,
      showFeedback: true,
      isTimerActive: false,
    }));
  };

  const nextQuestion = () => {
    if (gameState.status !== "playing") return;

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
        isTimerActive: (gameState.selectedLevel?.time_limit ?? 0) > 0,
        timeRemaining: (gameState.selectedLevel?.time_limit ?? 0) > 0 ? gameState.selectedLevel!.time_limit : gameState.timeRemaining,
      });
    } else {
      setGameState({
        ...gameState,
        userAnswers: newAnswers,
        score: newScore,
        status: "results",
        isTimerActive: false,
      });
    }
  };

  const handleTimeUp = () => {
    if (gameState.status !== "playing") return;

    const remainingQuestions = gameState.questions.length - gameState.currentQuestionIndex - 1;
    const newAnswers = [...gameState.userAnswers, -1, ...Array(remainingQuestions).fill(-1)];

    setGameState({
      ...gameState,
      userAnswers: newAnswers,
      status: "results",
      isTimerActive: false,
    });
  };

  const resetGame = () => {
    setGameState({
      status: "menu",
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

    const shuffledQuestions = gameState.selectedLevel.shuffle_questions ? [...questions].sort(() => Math.random() - 0.5) : questions;

    setGameState((prev) => ({
      ...prev,
      status: "playing",
      questions: shuffledQuestions,
      currentQuestionIndex: 0,
      userAnswers: [],
      score: 0,
      isTimerActive: prev.selectedLevel?.time_limit ? prev.selectedLevel.time_limit > 0 : false,
      timeRemaining: prev.selectedLevel?.time_limit ?? prev.timeRemaining,
      selectedAnswer: null,
      showFeedback: false,
    }));

    snapToTop();
  };

  useEffect(() => {
    loadLevels();
  }, [base]);

  useEffect(() => {
    if (gameState.status !== "playing" || !gameState.isTimerActive) return;
    if (gameState.timeRemaining <= 0) {
      handleTimeUp();
      return;
    }

    const interval = window.setInterval(() => {
      setGameState((prev) => ({
        ...prev,
        timeRemaining: prev.timeRemaining - 1,
      }));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [gameState.status, gameState.isTimerActive, gameState.timeRemaining]);

  if (loading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-neutral-800 rounded" />
          <div className="h-6 bg-neutral-800 rounded" />
          <div className="h-6 bg-neutral-800 rounded" />
        </div>
      </div>
    );
  }

  if (gameState.status === "menu") {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8 max-w-4xl">
        <Button
          onClick={() => router.push("/games")}
          variant="outline"
          className="border-neutral-700 hover:bg-neutral-800 text-white"
          type="button"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Back to Games", "Volver a Juegos")}
        </Button>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-red-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">{language === "es" ? "Trivia Bíblica" : "Bible Trivia"}</h1>
              <p className="text-neutral-400 max-w-2xl mt-1 text-sm">
                {language === "es"
                  ? "Pon a prueba tu conocimiento de la Biblia con diferentes niveles."
                  : "Test your Bible knowledge with different levels."}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {levels.map((level) => (
              <Card
                key={level.id}
                className={`bg-neutral-900 border-neutral-800 transition-all cursor-pointer group ${
                  selectedLevelForConfirmation?.id === level.id
                    ? "border-red-600 ring-2 ring-red-600/50"
                    : "hover:border-red-600"
                }`}
                onClick={() => setSelectedLevelForConfirmation(level)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2">{level.name}</h3>
                      {level.description && <p className="text-neutral-400 mb-3">{level.description}</p>}
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
                          type="button"
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
              <p className="text-neutral-400">{t("No trivia levels available yet.", "No hay niveles de trivia disponibles aún.")}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (gameState.status === "playing" && gameState.questions.length > 0) {
    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const questionText = language === "es" ? currentQuestion.question_es : currentQuestion.question_en;
    const options =
      language === "es"
        ? typeof currentQuestion.options_es === "string"
          ? JSON.parse(currentQuestion.options_es)
          : currentQuestion.options_es
        : typeof currentQuestion.options_en === "string"
        ? JSON.parse(currentQuestion.options_en)
        : currentQuestion.options_en;

    return (
      <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-neutral-950 overflow-hidden" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex-shrink-0 px-3 pt-0 mt-[-4px] flex items-center justify-between">
          <Button
            onClick={resetGame}
            variant="outline"
            className="border-neutral-700 hover:bg-neutral-800 text-white h-8 text-xs"
            type="button"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            {t("Levels", "Niveles")}
          </Button>
          <div className={`flex items-center gap-2 ${gameState.timeRemaining <= 5 ? "text-red-500" : "text-neutral-300"}`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono text-base">{gameState.isTimerActive ? `${gameState.timeRemaining}s` : "∞"}</span>
          </div>
        </div>

        <div className="px-3 pt-2 flex-shrink-0">
          <div className="flex justify-between text-[10px] text-neutral-500 mb-1 uppercase tracking-wider">
            <span>
              {t("Question", "Pregunta")} {gameState.currentQuestionIndex + 1} / {gameState.questions.length}
            </span>
            <span>{Math.round(((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-1">
            <div
              className="bg-red-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 p-3 overflow-hidden flex flex-col min-h-0">
          <Card className="bg-neutral-900 border-neutral-800 flex flex-col h-full min-h-0">
            <CardContent className="p-3 md:p-6 flex flex-col h-full min-h-0">
              <div className="flex-1 flex flex-col justify-between gap-2 min-h-0">
                <h3 className="text-base md:text-xl font-semibold text-white leading-tight flex-shrink-0">{questionText}</h3>

                <div className="grid gap-1.5 md:gap-2 flex-1 overflow-y-auto pr-1">
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
                              ? "bg-green-600 border-green-400 text-white opacity-100"
                              : isSelected
                              ? "bg-red-600 border-red-400 text-white opacity-100"
                              : "bg-neutral-800 border-neutral-700 text-neutral-500 opacity-50"
                            : isSelected
                            ? "bg-red-600 border-red-400 text-white ring-2 ring-red-400/50"
                            : "bg-neutral-800 border-neutral-700 hover:bg-neutral-800 hover:border-red-600 text-neutral-200"
                        }`}
                        type="button"
                      >
                        <span className="font-bold mr-2 opacity-50">{String.fromCharCode(65 + index)}.</span>
                        <span className="flex-1 pr-4">{option}</span>
                        {gameState.showFeedback && isCorrect && <span className="ml-auto text-white">✓</span>}
                        {gameState.showFeedback && isSelected && !isCorrect && <span className="ml-auto text-white">✗</span>}
                      </Button>
                    );
                  })}
                </div>

                <div className="flex-shrink-0 pt-2 border-t border-neutral-800/50">
                  {!gameState.showFeedback ? (
                    <Button
                      onClick={submitAnswer}
                      disabled={gameState.selectedAnswer === null}
                      className="w-full bg-red-600 hover:bg-red-700 h-10 md:h-12 font-bold disabled:opacity-50"
                      type="button"
                    >
                      {t("Submit Answer", "Enviar Respuesta")}
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion} className="w-full bg-red-600 hover:bg-red-700 h-10 md:h-12 font-bold" type="button">
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

  if (gameState.status === "results") {
    const percentage = Math.round((gameState.score / gameState.questions.length) * 100);
    const passed = percentage >= (gameState.selectedLevel?.passing_score || 70);

    return (
      <div className="container mx-auto space-y-6 px-4 py-8 max-w-2xl">
        <Card className={`bg-neutral-900 border-2 ${passed ? "border-green-600" : "border-red-600"}`}>
          <CardContent className="p-8 text-center space-y-6">
            <div className={`flex items-center justify-center gap-3 ${passed ? "text-green-400" : "text-red-400"}`}>
              {passed ? <Trophy className="h-8 w-8" /> : <RotateCcw className="h-8 w-8" />}
              <h2 className="text-3xl font-bold">{passed ? (language === "es" ? "¡Aprobado!" : "Passed!") : language === "es" ? "¡Fracasado!" : "Failed!"}</h2>
            </div>

            <div className="space-y-2">
              <div className="text-xl text-neutral-400">{percentage}% {t("correct", "correctas")}</div>
              <div className="text-sm text-neutral-500">{t("Required", "Requerido")}: {gameState.selectedLevel?.passing_score || 70}%</div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={restartLevel} className="bg-red-600 hover:bg-red-700" type="button">
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("Restart", "Reiniciar")}
              </Button>
              <Button onClick={resetGame} variant="outline" className="border-neutral-700 hover:bg-neutral-800 text-white" type="button">
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
