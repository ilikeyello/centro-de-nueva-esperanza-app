import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "../../contexts/LanguageContext";
import { Plus, Trash2, Save, X } from "lucide-react";
import { simpleTriviaService, SimpleTriviaData, SimpleQuestion } from "../../services/simpleTriviaService";

export default function SimpleTriviaAdminPanel() {
  const { t } = useLanguage();
  const [triviaData, setTriviaData] = useState<SimpleTriviaData | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<'kids' | 'youth' | 'adults'>('kids');
  const [newQuestion, setNewQuestion] = useState("");
  const [newQuestionEs, setNewQuestionEs] = useState("");
  const [newAnswers, setNewAnswers] = useState(["", "", "", ""]);
  const [newAnswersEs, setNewAnswersEs] = useState(["", "", "", ""]);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState(0);
  const [newCategory, setNewCategory] = useState("");
  const [newReference, setNewReference] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Load existing trivia data
  useEffect(() => {
    const loadTrivia = async () => {
      try {
        const data = await simpleTriviaService.loadTrivia();
        setTriviaData(data);
      } catch (err) {
        setError(t("Failed to load trivia data", "Error al cargar datos de trivia"));
      }
    };
    loadTrivia();
  }, [t]);

  const handleSave = async () => {
    if (!triviaData) return;
    
    console.log("Saving simple trivia data");
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await simpleTriviaService.saveTrivia(triviaData);
      setSuccess(t("Trivia saved successfully!", "¡Trivia guardada exitosamente!"));
      console.log("Simple trivia saved successfully");
    } catch (err) {
      console.error("Save failed:", err);
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

    const question: SimpleQuestion = {
      id: simpleTriviaService.generateId(),
      question: newQuestion.trim(),
      question_es: newQuestionEs.trim() || undefined,
      answers: [...newAnswers],
      answers_es: newAnswersEs.some(a => a.trim()) ? [...newAnswersEs] : undefined,
      correctAnswer: newCorrectAnswer,
      level: selectedLevel,
      category: newCategory.trim() || undefined,
      reference: newReference.trim() || undefined
    };

    if (!triviaData) return;

    setTriviaData({
      ...triviaData,
      questions: [...triviaData.questions, question]
    });

    // Reset form
    setNewQuestion("");
    setNewQuestionEs("");
    setNewAnswers(["", "", "", ""]);
    setNewAnswersEs(["", "", "", ""]);
    setNewCorrectAnswer(0);
    setNewCategory("");
    setNewReference("");
    setIsAdding(false);
    setSuccess(t("Question added successfully!", "¡Pregunta agregada exitosamente!"));
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!triviaData) return;
    
    setTriviaData({
      ...triviaData,
      questions: triviaData.questions.filter(q => q.id !== questionId)
    });
    setSuccess(t("Question deleted successfully!", "¡Pregunta eliminada exitosamente!"));
  };

  const handleAnswerChange = (index: number, value: string) => {
    const updatedAnswers = [...newAnswers];
    updatedAnswers[index] = value;
    setNewAnswers(updatedAnswers);
  };

  const handleAnswerEsChange = (index: number, value: string) => {
    const updatedAnswers = [...newAnswersEs];
    updatedAnswers[index] = value;
    setNewAnswersEs(updatedAnswers);
  };

  const levelQuestions = triviaData ? 
    triviaData.questions.filter(q => q.level === selectedLevel) : 
    [];

  if (!triviaData) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl bg-neutral-900 border-neutral-800">
          <CardContent className="text-center p-8">
            <p className="text-xl">
              {t("Loading trivia data...", "Cargando datos de trivia...")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-red-600">
            {t("Trivia Admin", "Administrador de Trivia")}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label className="text-sm">
                {t("Level", "Nivel")}:
              </Label>
              <Select value={selectedLevel} onValueChange={(value: 'kids' | 'youth' | 'adults') => setSelectedLevel(value)}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700">
                  {Object.entries(triviaData.levels).map(([key, level]) => (
                    <SelectItem key={key} value={key} className="text-white">
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="question-es">{t("Question (Spanish)", "Pregunta (Español)")} ({t("Optional", "Opcional")})</Label>
                <Textarea
                  id="question-es"
                  value={newQuestionEs}
                  onChange={(e) => setNewQuestionEs(e.target.value)}
                  placeholder={t("Spanish translation...", "Traducción en español...")}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
              </div>

              <div>
                <Label>{t("Answers", "Respuestas")}</Label>
                <div className="space-y-2">
                  {newAnswers.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={answer}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder={`${t("Answer", "Respuesta")} ${String.fromCharCode(65 + index)}`}
                        className="bg-neutral-800 border-neutral-700 text-white"
                      />
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={newCorrectAnswer === index}
                        onChange={() => setNewCorrectAnswer(index)}
                        className="w-4 h-4"
                      />
                      <Label className="text-xs">{t("Correct", "Correcta")}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>{t("Answers (Spanish)", "Respuestas (Español)")} ({t("Optional", "Opcional")})</Label>
                <div className="space-y-2">
                  {newAnswersEs.map((answer, index) => (
                    <Input
                      key={index}
                      value={answer}
                      onChange={(e) => handleAnswerEsChange(index, e.target.value)}
                      placeholder={`${t("Spanish Answer", "Respuesta en Español")} ${String.fromCharCode(65 + index)}`}
                      className="bg-neutral-800 border-neutral-700 text-white"
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">{t("Category", "Categoría")} ({t("Optional", "Opcional")})</Label>
                  <Input
                    id="category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder={t("e.g., Old Testament, New Testament", "ej: Antiguo Testamento, Nuevo Testamento")}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="reference">{t("Bible Reference", "Referencia Bíblica")} ({t("Optional", "Opcional")})</Label>
                  <Input
                    id="reference"
                    value={newReference}
                    onChange={(e) => setNewReference(e.target.value)}
                    placeholder={t("e.g., John 3:16", "ej: Juan 3:16")}
                    className="bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
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
              {t("Questions for Level", "Preguntas para Nivel")} {triviaData.levels[selectedLevel].name}
              <span className="text-sm text-neutral-400 ml-2">
                ({levelQuestions.length} {t("questions", "preguntas")})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {levelQuestions.length === 0 ? (
              <p className="text-neutral-400 text-center py-8">
                {t("No questions for this level yet. Add your first question above!", 
                   "No hay preguntas para este nivel aún. ¡Agrega tu primera pregunta arriba!")}
              </p>
            ) : (
              <div className="space-y-4">
                {levelQuestions.map((question) => (
                  <div key={question.id} className="bg-neutral-800 border border-neutral-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-2">
                          {question.question}
                        </h4>
                        {question.question_es && (
                          <p className="text-sm text-neutral-400 mb-2">
                            {question.question_es}
                          </p>
                        )}
                        <div className="space-y-1">
                          {question.answers.map((answer, index) => (
                            <div key={index} className={`text-sm ${index === question.correctAnswer ? 'text-green-400 font-semibold' : 'text-neutral-300'}`}>
                              {String.fromCharCode(65 + index)}. {answer}
                              {index === question.correctAnswer && " ✓"}
                            </div>
                          ))}
                        </div>
                        {(question.category || question.reference) && (
                          <div className="text-xs text-neutral-400 mt-2">
                            {question.category && <span>{t("Category", "Categoría")}: {question.category}</span>}
                            {question.category && question.reference && " | "}
                            {question.reference && <span>{question.reference}</span>}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleDeleteQuestion(question.id)}
                        variant="outline"
                        size="sm"
                        className="ml-4 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
