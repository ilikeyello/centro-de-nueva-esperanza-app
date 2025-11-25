import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "../../contexts/LanguageContext";
import { Plus, Trash2, Save, X } from "lucide-react";
import { triviaService, TriviaQuestion, TriviaData } from "../../services/triviaService";

export default function SimpleTriviaAdmin() {
  const { t } = useLanguage();
  const [triviaData, setTriviaData] = useState<TriviaData>({ questions: [], defaultTimer: 30 });
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswers, setNewAnswers] = useState(["", "", "", ""]);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [newTimer, setNewTimer] = useState(30);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Load existing trivia data
  useEffect(() => {
    const loadTrivia = async () => {
      try {
        const data = await triviaService.loadTrivia();
        setTriviaData(data);
        setNewTimer(data.defaultTimer);
      } catch (err) {
        setError(t("Failed to load trivia data", "Error al cargar datos de trivia"));
      }
    };
    loadTrivia();
  }, [t]);

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await triviaService.saveTrivia(triviaData.questions, triviaData.defaultTimer);
      setSuccess(t("Trivia saved successfully!", "¡Trivia guardada exitosamente!"));
    } catch (err) {
      setError(t("Failed to save trivia", "Error al guardar trivia"));
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim() || newAnswers.some(answer => !answer.trim())) {
      setError(t("Please fill in all fields", "Por favor completa todos los campos"));
      return;
    }

    const question: TriviaQuestion = {
      question: newQuestion.trim(),
      answers: [...newAnswers],
      correctAnswer: newCorrectAnswer,
      timer: newTimer
    };

    setTriviaData({
      ...triviaData,
      questions: [...triviaData.questions, question]
    });

    // Reset form
    setNewQuestion("");
    setNewAnswers(["", "", "", ""]);
    setNewCorrectAnswer(0);
    setIsAdding(false);
    setSuccess(t("Question added successfully!", "¡Pregunta agregada exitosamente!"));
  };

  const handleDeleteQuestion = (index: number) => {
    setTriviaData({
      ...triviaData,
      questions: triviaData.questions.filter((_, i) => i !== index)
    });
    setSuccess(t("Question deleted successfully!", "¡Pregunta eliminada exitosamente!"));
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...newAnswers];
    updatedAnswers[index] = value;
    setNewAnswers(updatedAnswers);
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-red-600">
            {t("Trivia Admin", "Administrador de Trivia")}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="default-timer" className="text-sm">
                {t("Default Timer (s)", "Temporizador Predeterminado (s)")}:
              </Label>
              <Input
                id="default-timer"
                type="number"
                min="10"
                max="120"
                value={triviaData.defaultTimer}
                onChange={(e) => setTriviaData({ ...triviaData, defaultTimer: parseInt(e.target.value) || 30 })}
                className="w-20 bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
            <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
              <Save className="mr-2 h-4 w-4" />
              {loading ? t("Saving...", "Guardando...") : t("Save All", "Guardar Todo")}
            </Button>
          </div>
        </div>

        {/* Messages */}
        {success && (
          <div className="bg-green-900/50 border border-green-600 text-green-400 p-3 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-900/50 border border-red-600 text-red-400 p-3 rounded">
            {error}
          </div>
        )}

        {/* Add Question Section */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {t("Add New Question", "Agregar Nueva Pregunta")}
              </CardTitle>
              <Button
                onClick={() => setIsAdding(!isAdding)}
                variant={isAdding ? "outline" : "default"}
                className={isAdding ? "border-neutral-600" : "bg-red-600 hover:bg-red-700"}
              >
                {isAdding ? <X className="h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {isAdding ? t("Cancel", "Cancelar") : t("Add Question", "Agregar Pregunta")}
              </Button>
            </div>
          </CardHeader>
          {isAdding && (
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question">{t("Question", "Pregunta")}</Label>
                <Textarea
                  id="question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder={t("Enter your question here...", "Ingresa tu pregunta aquí...")}
                  className="bg-neutral-800 border-neutral-700 text-white mt-1"
                />
              </div>

              <div>
                <Label>{t("Answers", "Respuestas")}</Label>
                <div className="space-y-2 mt-1">
                  {newAnswers.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="w-8 text-sm font-bold">{String.fromCharCode(65 + index)}.</span>
                      <Input
                        value={answer}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder={`${t("Answer", "Respuesta")} ${index + 1}`}
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={newCorrectAnswer === index}
                        onChange={() => setNewCorrectAnswer(index)}
                        className="w-4 h-4"
                      />
                      <Label className="text-xs">{t("Correct", "Correcta")}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="timer">{t("Timer (seconds)", "Temporizador (segundos)")}:</Label>
                <Input
                  id="timer"
                  type="number"
                  min="10"
                  max="120"
                  value={newTimer}
                  onChange={(e) => setNewTimer(parseInt(e.target.value) || 30)}
                  className="w-20 bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              <Button onClick={handleAddQuestion} className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Question", "Agregar Pregunta")}
              </Button>
            </CardContent>
          )}
        </Card>

        {/* Questions List */}
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-xl">
              {t("Current Questions", "Preguntas Actuales")} ({triviaData.questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {triviaData.questions.length === 0 ? (
              <p className="text-neutral-400 text-center py-8">
                {t("No questions yet. Add your first question above!", 
                   "No hay preguntas aún. ¡Agrega tu primera pregunta arriba!")}
              </p>
            ) : (
              triviaData.questions.map((question, index) => (
                <div key={index} className="bg-neutral-800 border border-neutral-700 rounded p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-2">
                        {index + 1}. {question.question}
                      </div>
                      <div className="space-y-1 text-sm">
                        {question.answers.map((answer, answerIndex) => (
                          <div 
                            key={answerIndex}
                            className={`flex items-center space-x-2 ${
                              answerIndex === question.correctAnswer ? 'text-green-400' : 'text-neutral-300'
                            }`}
                          >
                            <span>{String.fromCharCode(65 + answerIndex)}.</span>
                            <span>{answer}</span>
                            {answerIndex === question.correctAnswer && (
                              <span className="text-xs bg-green-600 px-2 py-1 rounded">
                                {t("Correct", "Correcta")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-neutral-400 mt-2">
                        {t("Timer", "Temporizador")}: {question.timer}s
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDeleteQuestion(index)}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-600/20 ml-4"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
