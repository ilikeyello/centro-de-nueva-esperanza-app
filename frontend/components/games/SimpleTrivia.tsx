import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "../../contexts/LanguageContext";
import { CheckCircle, XCircle, RotateCcw, Trophy, ArrowLeft, Play } from "lucide-react";
import { triviaService, TriviaQuestion, TriviaLevel, TriviaData } from "../../services/triviaService";

export default function SimpleTrivia() {
  const { t, language } = useLanguage();
  const [triviaData, setTriviaData] = useState<TriviaData>({ questions: [], levels: [], defaultTimer: 30 });
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<TriviaQuestion[]>([]);

  // Load trivia data on component mount
  useEffect(() => {
    const loadTrivia = async () => {
      try {
        const data = await triviaService.loadTrivia();
        setTriviaData(data);
        if (data.levels.length > 0) {
          setSelectedLevel(data.levels[0].id);
          setTimeLeft(data.levels[0].time_limit);
        }
      } catch (error) {
        console.error('Failed to load trivia:', error);
      }
    };
    loadTrivia();
  }, []);

  // Shuffle questions when level changes
  useEffect(() => {
    if (selectedLevel) {
      const level = triviaData.levels.find(l => l.id === selectedLevel);
      const levelQuestions = triviaData.questions.filter(q => q.level_id === selectedLevel);
      
      if (level?.shuffle_questions) {
        const shuffled = [...levelQuestions].sort(() => Math.random() - 0.5);
        setShuffledQuestions(shuffled);
      } else {
        setShuffledQuestions(levelQuestions);
      }
      
      if (level) {
        setTimeLeft(level.time_limit);
      }
    }
  }, [selectedLevel, triviaData.questions, triviaData.levels]);

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
    if (!selectedLevel) return;
    
    setGameStarted(true);
    setGameOver(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    
    const level = triviaData.levels.find(l => l.id === selectedLevel);
    setTimeLeft(level?.time_limit || 30);
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
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      const level = triviaData.levels.find(l => l.id === selectedLevel);
      setTimeLeft(level?.time_limit || 30);
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
    const level = triviaData.levels.find(l => l.id === selectedLevel);
    setTimeLeft(level?.time_limit || 30);
    setTimerActive(false);
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const currentLevel = triviaData.levels.find(l => l.id === selectedLevel);

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
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue placeholder={t("Choose a level...", "Elige un nivel...")} />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  {triviaData.levels.map((level) => (
                    <SelectItem key={level.id} value={level.id} className="text-white">
                      <div className="flex flex-col">
                        <span>{language === 'es' && level.name === 'Kids' ? 'Niños' : 
                               language === 'es' && level.name === 'Youth' ? 'Jóvenes' :
                               language === 'es' && level.name === 'Adults' ? 'Adultos' : level.name}</span>
                        <span className="text-xs text-neutral-400">{level.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level Info */}
            {currentLevel && (
              <div className="text-lg space-y-1">
                <div>
                  {t("Questions Available:", "Preguntas Disponibles:")} {shuffledQuestions.length}
                </div>
                <div>
                  {t("Time per Question:", "Tiempo por Pregunta:")} {currentLevel.time_limit}s
                </div>
                <div>
                  {t("Passing Score:", "Puntuación para Aprobar:")} {currentLevel.passing_score}%
                </div>
              </div>
            )}

            <Button 
              onClick={startGame} 
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
              disabled={!selectedLevel || shuffledQuestions.length === 0}
            >
              <Play className="mr-2 h-5 w-5" />
              {t("Start Game", "Comenzar Juego")}
            </Button>
            
            {!selectedLevel && (
              <p className="text-yellow-400">
                {t("Please select a level to start.", "Por favor selecciona un nivel para comenzar.")}
              </p>
            )}
            
            {selectedLevel && shuffledQuestions.length === 0 && (
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
    const percentage = Math.round((score / shuffledQuestions.length) * 100);
    const passed = percentage >= (currentLevel?.passing_score || 70);
    
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
              {score} / {shuffledQuestions.length}
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
              {t("Question", "Pregunta")} {currentQuestionIndex + 1} / {shuffledQuestions.length}
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
              {currentQuestionIndex < shuffledQuestions.length - 1
                ? t("Next Question", "Siguiente Pregunta")
                : t("See Results", "Ver Resultados")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
