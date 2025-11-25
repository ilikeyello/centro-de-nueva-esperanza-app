import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "../../contexts/LanguageContext";
import { CheckCircle, XCircle, RotateCcw, Trophy, ArrowLeft, Play } from "lucide-react";
import { triviaService, TriviaQuestion, TriviaData } from "../../services/triviaService";

export default function SimpleTrivia() {
  const { t, language } = useLanguage();
  const [triviaData, setTriviaData] = useState<TriviaData>({ questions: [], defaultTimer: 30 });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  // Load trivia data on component mount
  useEffect(() => {
    const loadTrivia = async () => {
      try {
        const data = await triviaService.loadTrivia();
        setTriviaData(data);
        setTimeLeft(data.defaultTimer);
      } catch (error) {
        console.error('Failed to load trivia:', error);
      }
    };
    loadTrivia();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleTimeUp = () => {
    setTimerActive(false);
    setShowResult(true);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(triviaData.defaultTimer);
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
    if (currentQuestionIndex < triviaData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(triviaData.defaultTimer);
      setTimerActive(true);
    } else {
      setGameOver(true);
      setTimerActive(false);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(triviaData.defaultTimer);
    setTimerActive(false);
  };

  const currentQuestion = triviaData.questions[currentQuestionIndex];

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
            <div className="text-lg">
              {t("Questions Available:", "Preguntas Disponibles:")} {triviaData.questions.length}
            </div>
            <div className="text-lg">
              {t("Time per Question:", "Tiempo por Pregunta:")} {triviaData.defaultTimer}s
            </div>
            <Button 
              onClick={startGame} 
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
              disabled={triviaData.questions.length === 0}
            >
              <Play className="mr-2 h-5 w-5" />
              {t("Start Game", "Comenzar Juego")}
            </Button>
            {triviaData.questions.length === 0 && (
              <p className="text-yellow-400">
                {t("No trivia questions available. Please check back later.", 
                   "No hay preguntas de trivia disponibles. Por favor, regresa más tarde.")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-neutral-900 border-neutral-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600 flex items-center justify-center gap-2">
              <Trophy className="h-8 w-8" />
              {t("Game Over!", "¡Juego Terminado!")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-4xl font-bold text-yellow-400">
              {score} / {triviaData.questions.length}
            </div>
            <p className="text-xl text-neutral-300">
              {t("Correct Answers", "Respuestas Correctas")}
            </p>
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
              {t("Question", "Pregunta")} {currentQuestionIndex + 1} / {triviaData.questions.length}
            </div>
            <div className="text-sm text-neutral-400">
              {t("Score", "Puntuación")}: {score}
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
              {language === 'es' ? currentQuestion.question : currentQuestion.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQuestion.answers.map((answer, index) => {
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
              {currentQuestionIndex < triviaData.questions.length - 1
                ? t("Next Question", "Siguiente Pregunta")
                : t("See Results", "Ver Resultados")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
