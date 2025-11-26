import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useLanguage } from "../../contexts/LanguageContext";
import { CheckCircle, XCircle, RotateCcw, Trophy, ArrowLeft, Play } from "lucide-react";
import { simpleTriviaService, SimpleTriviaData, SimpleQuestion, SimpleLevel } from "../../services/simpleTriviaService";

export default function SimpleTriviaGame() {
  const { t, language } = useLanguage();
  const [triviaData, setTriviaData] = useState<SimpleTriviaData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'kids' | 'youth' | 'adults'>('kids');
  const [questions, setQuestions] = useState<SimpleQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load trivia data on component mount
  useEffect(() => {
    const loadTrivia = async () => {
      try {
        const data = await simpleTriviaService.loadTrivia();
        setTriviaData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load trivia:', error);
        setLoading(false);
      }
    };
    loadTrivia();
  }, []);

  // Update questions when level changes
  useEffect(() => {
    if (triviaData && triviaData.levels && triviaData.levels[selectedLevel]) {
      const levelQuestions = simpleTriviaService.getQuestionsForLevel(triviaData, selectedLevel);
      setQuestions(levelQuestions.sort(() => Math.random() - 0.5)); // Shuffle
      setTimeLeft(triviaData.levels[selectedLevel].timeLimit);
    } else if (triviaData) {
      // Fallback if levels structure is missing
      console.log("Using fallback level data");
      const fallbackLevel = { name: "Default", timeLimit: 30, passingScore: 70 };
      setQuestions(triviaData.questions || []);
      setTimeLeft(fallbackLevel.timeLimit);
    }
  }, [selectedLevel, triviaData]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      setShowResult(true);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleTimeUp = () => {
    setTimerActive(false);
    setShowResult(true);
  };

  const startGame = () => {
    if (questions.length === 0) return;
    
    const levelData = triviaData?.levels?.[selectedLevel] || { timeLimit: 30 };
    
    setGameStarted(true);
    setGameOver(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(levelData.timeLimit);
    setTimerActive(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
    setTimerActive(false);
    setShowResult(true);

    if (answerIndex === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const levelData = triviaData?.levels?.[selectedLevel] || { timeLimit: 30 };
      
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(levelData.timeLimit);
      setTimerActive(true);
    } else {
      setGameOver(true);
      setTimerActive(false);
    }
  };

  const resetGame = () => {
    const levelData = triviaData?.levels?.[selectedLevel] || { timeLimit: 30 };
    
    setGameStarted(false);
    setGameOver(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(levelData.timeLimit);
    setTimerActive(false);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentLevel = triviaData?.levels?.[selectedLevel] || { name: "Default", timeLimit: 30, passingScore: 70 };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-neutral-900 border-neutral-800">
          <CardContent className="text-center p-8">
            <p className="text-xl">
              {t("Loading trivia...", "Cargando trivia...")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-neutral-900 border-neutral-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">
              {t("Bible Trivia", "Trivia Bíblica")}
            </CardTitle>
            <p className="text-neutral-400">
              {t("Test your Bible knowledge!", "¡Pon a prueba tu conocimiento de la Biblia!")}
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {/* Level Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                {t("Select Level", "Seleccionar Nivel")}
              </Label>
              <Select value={selectedLevel} onValueChange={(value: 'kids' | 'youth' | 'adults') => setSelectedLevel(value)}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue placeholder={t("Choose a level...", "Elige un nivel...")} />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  {triviaData?.levels ? 
                    Object.entries(triviaData.levels).map(([key, level]) => (
                      <SelectItem key={key} value={key} className="text-white">
                        <div className="flex flex-col">
                          <span>{language === 'es' ? 
                            (key === 'kids' ? 'Niños' : key === 'youth' ? 'Jóvenes' : 'Adultos') : 
                            level.name}</span>
                          <span className="text-xs text-neutral-400">
                            {t("Time:", "Tiempo:")} {level.timeLimit}s | 
                            {t("Passing:", "Para Aprobar:")} {level.passingScore}%
                          </span>
                        </div>
                      </SelectItem>
                    )) : (
                      <SelectItem value="kids" className="text-white">
                        <div className="flex flex-col">
                          <span>{language === 'es' ? 'Niños' : 'Kids'}</span>
                          <span className="text-xs text-neutral-400">
                            {t("Time:", "Tiempo:")} 30s | 
                            {t("Passing:", "Para Aprobar:")} 70%
                          </span>
                        </div>
                      </SelectItem>
                    )
                  }
                </SelectContent>
              </Select>
            </div>

            {/* Level Info */}
            <div className="text-lg space-y-1">
              <div>
                {t("Questions Available:", "Preguntas Disponibles:")} {questions.length}
              </div>
              <div>
                {t("Time per Question:", "Tiempo por Pregunta:")} {currentLevel?.timeLimit}s
              </div>
              <div>
                {t("Passing Score:", "Puntuación para Aprobar:")} {currentLevel?.passingScore}%
              </div>
            </div>

            <Button 
              onClick={startGame} 
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
              disabled={questions.length === 0}
            >
              <Play className="mr-2 h-5 w-5" />
              {t("Start Game", "Comenzar Juego")}
            </Button>
            
            {questions.length === 0 && (
              <p className="text-yellow-400">
                {t("No questions available for this level.", "No hay preguntas disponibles para este nivel.")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameOver) {
    const percentage = Math.round((score / questions.length) * 100);
    const passed = percentage >= (currentLevel?.passingScore || 70);
    
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-neutral-900 border-neutral-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Trophy className={`h-8 w-8 ${passed ? 'text-yellow-400' : 'text-gray-400'}`} />
              {t("Game Over!", "¡Juego Terminado!")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className={`text-4xl font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
              {score} / {questions.length}
            </div>
            <p className="text-xl text-neutral-300">
              {t("Correct Answers", "Respuestas Correctas")}
            </p>
            <div className="text-lg">
              <div className={`font-semibold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                {percentage}%
              </div>
              <div className="text-sm text-neutral-400">
                {passed ? 
                  t("You Passed! 🎉", "¡Aprobaste! 🎉") : 
                  t("Try Again!", "¡Inténtalo de nuevo!")
                }
              </div>
            </div>
            <div className="space-y-2">
              <Button onClick={resetGame} className="bg-red-600 hover:bg-red-700">
                <RotateCcw className="mr-2 h-4 w-4" />
                {t("Play Again", "Jugar de Nuevo")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-neutral-900 border-neutral-800">
          <CardContent className="text-center p-8">
            <p className="text-xl">
              {t("Loading question...", "Cargando pregunta...")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={resetGame} className="border-neutral-700 text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("Exit", "Salir")}
          </Button>
          <div className="text-center">
            <div className="text-lg font-semibold">
              {t("Question", "Pregunta")} {currentQuestionIndex + 1} / {questions.length}
            </div>
            <div className="text-sm text-neutral-400">
              {currentLevel?.name} - {t("Score", "Puntuación")}: {score}
            </div>
          </div>
          <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-green-500'}`}>
            {timeLeft}s
          </div>
        </div>

        {/* Question Card */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-xl text-center">
              {language === 'es' && currentQuestion.question_es ? 
                currentQuestion.question_es : 
                currentQuestion.question}
            </CardTitle>
            {currentQuestion.reference && (
              <p className="text-center text-sm text-neutral-400">
                {currentQuestion.reference}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {(language === 'es' && currentQuestion.answers_es ? 
              currentQuestion.answers_es : 
              currentQuestion.answers).map((answer, index) => {
              const isCorrect = index === currentQuestion.correctAnswer;
              const isSelected = index === selectedAnswer;
              const showCorrectAnswer = showResult && isCorrect;
              const showWrongAnswer = showResult && isSelected && !isCorrect;

              return (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full text-left justify-start h-auto p-4 transition-all ${
                    showCorrectAnswer
                      ? 'bg-green-600 hover:bg-green-700 border-green-500'
                      : showWrongAnswer
                      ? 'bg-red-600 hover:bg-red-700 border-red-500'
                      : isSelected
                      ? 'bg-blue-600 hover:bg-blue-700 border-blue-500'
                      : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${
                      showCorrectAnswer
                        ? 'border-white bg-white text-green-600'
                        : showWrongAnswer
                        ? 'border-white bg-white text-red-600'
                        : isSelected
                        ? 'border-white bg-white text-blue-600'
                        : 'border-neutral-500'
                    }`}>
                      {showCorrectAnswer && <CheckCircle className="h-5 w-5" />}
                      {showWrongAnswer && <XCircle className="h-5 w-5" />}
                      {!showResult && !isSelected && String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-lg">{answer}</span>
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Next Button */}
        {showResult && (
          <div className="text-center">
            <Button onClick={nextQuestion} className="bg-red-600 hover:bg-red-700 px-8">
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
