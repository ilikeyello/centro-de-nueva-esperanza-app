import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "../../contexts/LanguageContext";
import { CheckCircle, XCircle, RotateCcw, Trophy, ArrowLeft, Play } from "lucide-react";

// API base URLs
const base = import.meta.env.DEV
  ? "http://127.0.0.1:4000"
  : "https://prod-cne-sh82.encr.app";

interface TriviaLevel {
  id: string;
  name: string;
  description: string;
  targetGroup: string;
  shuffleQuestions: boolean;
  timeLimit?: number;
  passingScore?: number;
}

interface TriviaQuestion {
  id: number;
  questionEn: string;
  questionEs: string;
  options: {
    en: string[];
    es: string[];
  };
  correctAnswer: number;
  category: string;
  reference?: string;
  level: string;
}

const loadLevels = async () => {
  try {
    const res = await fetch(`${base}/trivia/levels`);
    if (res.ok) {
      const levelsData = await res.json();
      const formattedLevels = levelsData.map((level: any) => ({
        id: level.id,
        name: level.name,
        description: level.description || "",
        targetGroup: level.target_group || "",
        shuffleQuestions: level.shuffle_questions,
        timeLimit: level.time_limit,
        passingScore: level.passing_score
      }));
      return formattedLevels;
    }
  } catch (err) {
    console.error("Failed to load levels:", err);
  }
};

const loadQuestions = async (levelId: string) => {
  try {
    const res = await fetch(`${base}/trivia/questions?level_id=${levelId}`);
    if (res.ok) {
      const questionsData = await res.json();
      const formattedQuestions = questionsData.map((q: any) => ({
        id: q.id,
        questionEn: q.question_en,
        questionEs: q.question_es,
        options: {
          en: q.options_en,
          es: q.options_es
        },
        correctAnswer: q.correct_answer,
        category: q.category,
        reference: q.reference,
        level: q.level_id
      }));
      return formattedQuestions;
    }
  } catch (err) {
    console.error("Failed to load questions:", err);
  }
};

export function BibleTrivia({ onBack }: { onBack?: () => void }) {
  const { language, t } = useLanguage();
  const [selectedLevel, setSelectedLevel] = useState<string>('kids');
  const [levels, setLevels] = useState<TriviaLevel[]>([]);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            // Auto-submit when time runs out
            if (!showResult) {
              handleAnswerSelect(-1); // -1 indicates timeout
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeLeft, showResult]);

  // Load levels and questions from local storage
  useEffect(() => {
    loadLevels();
  }, []);

  useEffect(() => {
    if (selectedLevel) {
      loadQuestions(selectedLevel).then((questions) => setQuestions(questions));
    }
  }, [selectedLevel]);

  const currentQuestion = questions[currentQuestionIndex];

  const startGame = () => {
    setGameStarted(true);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setGameComplete(false);
    
    // Set timer based on level
    const currentLevel = levels.find(l => l.id === selectedLevel);
    if (currentLevel?.timeLimit && currentLevel.timeLimit > 0) {
      setTimeLeft(currentLevel.timeLimit);
      setTimerActive(true);
    } else {
      setTimeLeft(0);
      setTimerActive(false);
    }
    
    // Shuffle questions if level requires it
    if (currentLevel?.shuffleQuestions) {
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setQuestions(shuffled);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    
    setTimerActive(false); // Stop timer when answer is selected
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      
      // Reset timer for next question
      const currentLevel = levels.find(l => l.id === selectedLevel);
      if (currentLevel?.timeLimit && currentLevel.timeLimit > 0) {
        setTimeLeft(currentLevel.timeLimit);
        setTimerActive(true);
      } else {
        setTimeLeft(0);
        setTimerActive(false);
      }
    } else {
      setGameComplete(true);
      setTimerActive(false);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setGameComplete(false);
    loadLevelsAndQuestions();
  };


  // Show level selection screen if game hasn't started
  if (!gameStarted) {
    const currentLevel = levels.find(l => l.id === selectedLevel);
    const questionCount = questions.length;
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="border-neutral-700 text-white hover:bg-neutral-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("Back", "Volver")}
              </Button>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {t("Bible Trivia Challenge", "Desafío de Trivia Bíblica")}
              </h1>
              <p className="text-neutral-400">
                {t("Select a level to begin", "Selecciona un nivel para comenzar")}
              </p>
            </div>
          </div>

          {/* Level Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">
              {t("Choose Your Level", "Elige Tu Nivel")}
            </h2>
            
            <div className="grid gap-4">
              {levels.map((level) => {
                const questionCount = questions.filter(q => q.level === level.id).length;
                const isSelected = selectedLevel === level.id;
                
                return (
                  <div key={level.id} className="space-y-3">
                    <Card 
                      className={`cursor-pointer border-neutral-800 bg-neutral-900/60 transition-all ${
                        isSelected 
                          ? 'ring-2 ring-red-600 bg-red-600/10' 
                          : 'hover:bg-neutral-800'
                      }`}
                      onClick={() => setSelectedLevel(level.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{level.name}</h3>
                            <p className="text-sm text-neutral-400">{level.description}</p>
                            <div className="mt-2 flex gap-4 text-xs text-neutral-500">
                              <span>{t("Target", "Objetivo")}: {level.targetGroup}</span>
                              <span>{t("Time Limit", "Límite de Tiempo")}: {level.timeLimit && level.timeLimit > 0 ? `${level.timeLimit}s` : t("Disabled", "Desactivado")}</span>
                              <span>{t("Passing Score", "Puntuación Aprobatoria")}: {level.passingScore}%</span>
                            </div>
                            {isSelected && (
                              <div className="mt-4 pt-4 border-t border-neutral-700">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-neutral-400">
                                      {questionCount > 0 
                                        ? t(`${questionCount} questions available`, `${questionCount} preguntas disponibles`)
                                        : t("Sample questions will be used", "Se usarán preguntas de ejemplo")
                                      }
                                    </p>
                                    {level.timeLimit && level.timeLimit > 0 ? (
                                      <p className="text-xs text-neutral-500 mt-1">
                                        {t("Timer", "Temporizador")}: {level.timeLimit}s {t("per question", "por pregunta")}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-neutral-500 mt-1">
                                        {t("No timer", "Sin temporizador")}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    onClick={startGame}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={questionCount === 0}
                                  >
                                    <Play className="mr-2 h-4 w-4" />
                                    {t("Start Game", "Comenzar Juego")}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            {isSelected && (
                              <div className="rounded-full bg-red-600 p-2">
                                <CheckCircle className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    const getMessage = () => {
      if (percentage === 100) return t("Perfect! You're a Bible expert!", "¡Perfecto! ¡Eres un experto en la Biblia!");
      if (percentage >= 80) return t("Excellent! Great knowledge!", "¡Excelente! ¡Gran conocimiento!");
      if (percentage >= 60) return t("Good job! Keep studying!", "¡Buen trabajo! ¡Sigue estudiando!");
      return t("Keep learning! God loves you!", "¡Sigue aprendiendo! ¡Dios te ama!");
    };

    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-md border-neutral-800 bg-neutral-900/60">
          <CardHeader className="text-center">
            <Trophy className="mx-auto h-16 w-16 text-yellow-400" />
            <CardTitle className="text-2xl font-bold text-white">
              {t("Game Complete!", "¡Juego Terminado!")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="text-4xl font-bold text-white">
              {score}/{questions.length}
            </div>
            <div className="text-lg text-neutral-300">
              {percentage}% {t("Correct", "Correctas")}
            </div>
            <p className="text-sm text-neutral-400">{getMessage()}</p>
            <Button onClick={resetGame} className="w-full bg-red-600 hover:bg-red-700">
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("Back to Levels", "Volver a Niveles")}
            </Button>
            <Button onClick={() => {
              setGameStarted(true);
              setGameComplete(false);
              setCurrentQuestionIndex(0);
              setSelectedAnswer(null);
              setShowResult(false);
              setScore(0);
              
              // Reset timer
              const currentLevel = levels.find(l => l.id === selectedLevel);
              if (currentLevel?.timeLimit) {
                setTimeLeft(currentLevel.timeLimit);
                setTimerActive(true);
              } else {
                setTimeLeft(0);
                setTimerActive(false);
              }
            }} className="w-full bg-neutral-700 hover:bg-neutral-600">
              <RotateCcw className="mr-2 h-4 w-4" />
              {t("Play Again", "Jugar de Nuevo")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={resetGame}
              className="border-neutral-700 text-white hover:bg-neutral-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("Back to Levels", "Volver a Niveles")}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {t("Bible Trivia Challenge", "Desafío de Trivia Bíblica")}
              </h1>
              <p className="text-neutral-400">
                {t(`Question ${currentQuestionIndex + 1} of ${questions.length}`, 
                   `Pregunta ${currentQuestionIndex + 1} de ${questions.length}`)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Timer Display */}
            {timerActive && (
              <div className={`text-right ${
                timeLeft <= 5 ? 'text-red-400' : 'text-white'
              }`}>
                <div className="text-sm text-neutral-400">{t("Time Left", "Tiempo Restante")}</div>
                <div className="text-xl font-bold">{timeLeft}s</div>
              </div>
            )}
            <div className="text-right">
              <div className="text-sm text-neutral-400">{t("Score", "Puntuación")}</div>
              <div className="text-xl font-bold text-white">{score}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-neutral-800">
          <div
            className="h-2 rounded-full bg-red-600 transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <Card className="border-neutral-800 bg-neutral-900/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-semibold text-red-400">
                {currentQuestion.category}
              </span>
              {currentQuestion.reference && (
                <span className="text-xs text-neutral-400">
                  {currentQuestion.reference}
                </span>
              )}
            </div>
            <CardTitle className="text-lg font-semibold text-white">
              {language === "en" ? currentQuestion.questionEn : currentQuestion.questionEs}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.options[language === "en" ? "en" : "es"].map((option, index) => {
              const isCorrect = index === currentQuestion.correctAnswer;
              const isSelected = index === selectedAnswer;
              const showCorrect = showResult && isCorrect;
              const showIncorrect = showResult && isSelected && !isCorrect;

              return (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full justify-start border-neutral-700 text-left transition-all ${
                    showCorrect
                      ? "border-green-600 bg-green-600/20 text-green-400"
                      : showIncorrect
                      ? "border-red-600 bg-red-600/20 text-red-400"
                      : isSelected
                      ? "border-red-600 bg-red-600/20 text-white"
                      : "text-white hover:bg-neutral-800"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span>
                      {option}
                    </span>
                    {showCorrect && <CheckCircle className="h-5 w-5" />}
                    {showIncorrect && <XCircle className="h-5 w-5" />}
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Result Message and Next Button */}
        {showResult && (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 ${
              selectedAnswer === currentQuestion.correctAnswer
                ? "bg-green-600/20 text-green-400"
                : selectedAnswer === -1
                ? "bg-yellow-600/20 text-yellow-400"
                : "bg-red-600/20 text-red-400"
            }`}>
              {selectedAnswer === currentQuestion.correctAnswer
                ? t("Correct! Well done!", "¡Correcto! ¡Bien hecho!")
                : selectedAnswer === -1
                ? t("Time's up! The correct answer was:", "¡Se acabó el tiempo! La respuesta correcta era:")
                : t(`Incorrect. The correct answer was: ${currentQuestion.options[language === "en" ? "en" : "es"][currentQuestion.correctAnswer]}`,
                   `Incorrecto. La respuesta correcta era: ${currentQuestion.options[language === "en" ? "es" : "en"][currentQuestion.correctAnswer]}`)
              }
              {selectedAnswer === -1 && (
                <div className="mt-1">
                  {currentQuestion.options[language === "en" ? "en" : "es"][currentQuestion.correctAnswer]}
                </div>
              )}
            </div>
            <Button
              onClick={handleNextQuestion}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {currentQuestionIndex < questions.length - 1
                ? t("Next Question", "Siguiente Pregunta")
                : t("See Results", "Ver Resultados")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
