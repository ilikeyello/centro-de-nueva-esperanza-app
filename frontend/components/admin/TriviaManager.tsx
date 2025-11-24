import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "../../contexts/LanguageContext";
import { Plus, Edit2, Trash2, Save, X, CheckCircle } from "lucide-react";

interface TriviaQuestion {
  id: number;
  questionEn: string;
  questionEs: string;
  question: string;
  options: {
    en: string[];
    es: string[];
  };
  optionInputs: string[];
  correctAnswer: number;
  category: string;
  reference?: string;
  level: string;
}

interface TriviaLevel {
  id: string;
  name: string;
  description: string;
  targetGroup: string;
  shuffleQuestions: boolean;
  timeLimit?: number;
  passingScore?: number;
}

const categories = [
  "Old Testament",
  "New Testament", 
  "Bible Characters",
  "Bible Verses",
  "Bible History",
  "Jesus Life",
  "Apostles",
  "Miracles",
  "Parables",
  "Other"
];

export function TriviaManager() {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [levels, setLevels] = useState<TriviaLevel[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('kids');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingLevel, setIsAddingLevel] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [formData, setFormData] = useState<Partial<TriviaQuestion>>({
    questionEn: "",
    questionEs: "",
    question: "",
    options: { en: ["", "", "", ""], es: ["", "", "", ""] },
    optionInputs: ["", "", "", ""],
    correctAnswer: 0,
    category: "Old Testament",
    reference: "",
    level: selectedLevel
  });
  const [levelFormData, setLevelFormData] = useState<Partial<TriviaLevel>>({
    name: "",
    description: "",
    targetGroup: "",
    shuffleQuestions: true,
    timeLimit: 30,
    passingScore: 70
  });

  useEffect(() => {
    loadLevelsAndQuestions();
  }, [selectedLevel]);

  const loadLevelsAndQuestions = () => {
    // Load levels from local storage or use defaults
    const savedLevels = JSON.parse(localStorage.getItem('triviaLevels') || 'null');
    if (savedLevels) {
      setLevels(savedLevels);
    } else {
      // Initialize with default levels and save to local storage
      const defaultLevels = [
        {
          id: 'kids',
          name: 'Kids',
          description: 'For children ages 6-12',
          targetGroup: 'Children',
          shuffleQuestions: true,
          timeLimit: 30,
          passingScore: 70
        },
        {
          id: 'youth',
          name: 'Youth',
          description: 'For teenagers and young adults',
          targetGroup: 'Youth',
          shuffleQuestions: true,
          timeLimit: 20,
          passingScore: 80
        },
        {
          id: 'adults',
          name: 'Adults',
          description: 'For adult church members',
          targetGroup: 'Adults',
          shuffleQuestions: true,
          timeLimit: 15,
          passingScore: 85
        }
      ];
      localStorage.setItem('triviaLevels', JSON.stringify(defaultLevels));
      setLevels(defaultLevels);
    }
    
    loadQuestions();
  };

  const loadQuestions = async () => {
    try {
      setLoading(true);
      // Load from local storage for now (until backend is ready)
      const savedQuestions = JSON.parse(localStorage.getItem('triviaQuestions') || '[]');
      const filteredQuestions = savedQuestions.filter((q: TriviaQuestion) => q.level === selectedLevel);
      setQuestions(filteredQuestions);
    } catch (err) {
      setError(t("Failed to load questions", "Error al cargar preguntas"));
    } finally {
      setLoading(false);
    }
  };

  const saveLevel = async () => {
    try {
      if (!levelFormData.name) {
        setError(t("Please enter a level name", "Por favor ingresa un nombre de nivel"));
        return;
      }

      const levelData = {
        id: editingLevelId || levelFormData.name.toLowerCase().replace(/\s+/g, '-'),
        name: levelFormData.name,
        description: levelFormData.description || "",
        targetGroup: levelFormData.targetGroup || "",
        shuffleQuestions: levelFormData.shuffleQuestions || true,
        timeLimit: levelFormData.timeLimit || 30,
        passingScore: levelFormData.passingScore || 70
      };

      // Save to local storage
      let savedLevels = JSON.parse(localStorage.getItem('triviaLevels') || 'null') || levels;
      
      if (editingLevelId) {
        savedLevels = savedLevels.map((level: TriviaLevel) => 
          level.id === editingLevelId ? levelData : level
        );
        setSuccess(t("Level updated successfully!", "¡Nivel actualizado exitosamente!"));
      } else {
        savedLevels = [...savedLevels, levelData];
        setSuccess(t("Level created successfully!", "¡Nivel creado exitosamente!"));
      }
      
      localStorage.setItem('triviaLevels', JSON.stringify(savedLevels));
      setLevels(savedLevels);
      resetLevelForm();
    } catch (err) {
      setError(t("Failed to save level", "Error al guardar nivel"));
    }
  };

  const deleteLevel = async (levelId: string) => {
    if (!confirm(t("Are you sure you want to delete this level?", "¿Estás seguro de que quieres eliminar este nivel?"))) {
      return;
    }

    try {
      // Remove from local storage
      let savedLevels = JSON.parse(localStorage.getItem('triviaLevels') || 'null') || levels;
      savedLevels = savedLevels.filter((level: TriviaLevel) => level.id !== levelId);
      localStorage.setItem('triviaLevels', JSON.stringify(savedLevels));
      
      setLevels(savedLevels);
      setSuccess(t("Level deleted successfully!", "¡Nivel eliminado exitosamente!"));
      
      if (selectedLevel === levelId) {
        setSelectedLevel(levels[0]?.id || 'kids');
      }
    } catch (err) {
      setError(t("Failed to delete level", "Error al eliminar nivel"));
    }
  };

  const resetLevelForm = () => {
    setLevelFormData({
      name: "",
      description: "",
      targetGroup: "",
      shuffleQuestions: true,
      timeLimit: 30,
      passingScore: 70
    });
    setIsAddingLevel(false);
    setEditingLevelId(null);
  };

  const saveQuestion = async () => {
    try {
      if (!formData.question || !formData.optionInputs) {
        setError(t("Please fill all required fields", "Por favor completa todos los campos requeridos"));
        return;
      }

      // Detect language and set appropriate fields
      const spanishWords = ['¿', 'ñ', 'él', 'ella', 'dios', 'biblia', 'pregunta', 'mandamientos'];
      const hasSpanishChars = /[¿ñáéíóúü]/i.test(formData.question || "");
      const hasSpanishWords = spanishWords.some(word => (formData.question || "").toLowerCase().includes(word));
      const isSpanish = hasSpanishChars || hasSpanishWords;
      
      const questionData: TriviaQuestion = {
        id: editingId || Date.now(),
        questionEn: isSpanish ? "" : formData.question || "",
        questionEs: isSpanish ? formData.question : "",
        question: formData.question || "",
        options: {
          en: isSpanish ? ["", "", "", ""] : formData.optionInputs || ["", "", "", ""],
          es: isSpanish ? formData.optionInputs || ["", "", "", ""] : ["", "", "", ""]
        },
        optionInputs: formData.optionInputs || ["", "", "", ""],
        correctAnswer: formData.correctAnswer || 0,
        category: formData.category || "Old Testament",
        reference: formData.reference,
        level: selectedLevel
      };

      // Save to local storage for now (until backend is ready)
      let savedQuestions = JSON.parse(localStorage.getItem('triviaQuestions') || '[]');
      
      if (editingId) {
        savedQuestions = savedQuestions.map((q: TriviaQuestion) => 
          q.id === editingId ? questionData : q
        );
        setSuccess(t("Question updated successfully!", "¡Pregunta actualizada exitosamente!"));
      } else {
        savedQuestions.push(questionData);
        setSuccess(t("Question added successfully!", "¡Pregunta agregada exitosamente!"));
      }
      
      localStorage.setItem('triviaQuestions', JSON.stringify(savedQuestions));
      loadQuestions();
      resetForm();
    } catch (err) {
      setError(t("Failed to save question", "Error al guardar pregunta"));
    }
  };

  const deleteQuestion = async (id: number) => {
    if (!confirm(t("Are you sure you want to delete this question?", "¿Estás seguro de que quieres eliminar esta pregunta?"))) {
      return;
    }

    try {
      // Delete from local storage for now (until backend is ready)
      let savedQuestions = JSON.parse(localStorage.getItem('triviaQuestions') || '[]');
      savedQuestions = savedQuestions.filter((q: TriviaQuestion) => q.id !== id);
      localStorage.setItem('triviaQuestions', JSON.stringify(savedQuestions));
      
      setSuccess(t("Question deleted successfully!", "¡Pregunta eliminada exitosamente!"));
      loadQuestions();
    } catch (err) {
      setError(t("Failed to delete question", "Error al eliminar pregunta"));
    }
  };

  const resetForm = () => {
    setFormData({
      questionEn: "",
      questionEs: "",
      question: "",
      options: { en: ["", "", "", ""], es: ["", "", "", ""] },
      optionInputs: ["", "", "", ""],
      correctAnswer: 0,
      category: "Old Testament",
      reference: ""
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const startEdit = (question: TriviaQuestion) => {
    console.log('Editing question:', question);
    // Show the primary language version for editing
    const primaryQuestion = question.questionEn || question.questionEs;
    const primaryOptions = question.options.en.some(opt => opt) ? question.options.en : question.options.es;
    
    console.log('Setting form data with:', {
      ...question,
      question: primaryQuestion,
      optionInputs: primaryOptions
    });
    
    setFormData({
      ...question,
      question: primaryQuestion,
      optionInputs: primaryOptions
    });
    setEditingId(question.id);
    setIsAdding(true);
  };

  return (
    <div className="space-y-6">
      {/* Level Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {t("Trivia Levels", "Niveles de Trivia")}
          </h2>
          <Button
            onClick={() => {
              console.log('Add Level button clicked');
              setIsAddingLevel(true);
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("Add Level", "Agregar Nivel")}
          </Button>
        </div>

        {/* Level Selector */}
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => (
            <Button
              key={level.id}
              variant={selectedLevel === level.id ? "default" : "outline"}
              onClick={() => setSelectedLevel(level.id)}
              className={selectedLevel === level.id 
                ? "bg-red-600 hover:bg-red-700" 
                : "border-neutral-700 text-white hover:bg-neutral-800"
              }
            >
              {level.name}
            </Button>
          ))}
        </div>

        {/* Level Details */}
        {levels.find(l => l.id === selectedLevel) && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {levels.find(l => l.id === selectedLevel)?.name}
                </h3>
                <p className="text-sm text-neutral-400">
                  {levels.find(l => l.id === selectedLevel)?.description}
                </p>
                <div className="mt-2 flex gap-4 text-xs text-neutral-500">
                  <span>{t("Target", "Objetivo")}: {levels.find(l => l.id === selectedLevel)?.targetGroup}</span>
                  <span>{t("Time Limit", "Límite de Tiempo")}: {levels.find(l => l.id === selectedLevel)?.timeLimit}s</span>
                  <span>{t("Passing Score", "Puntuación Aprobatoria")}: {levels.find(l => l.id === selectedLevel)?.passingScore}%</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log('Level edit button clicked for level:', levels.find(l => l.id === selectedLevel));
                    const levelData = levels.find(l => l.id === selectedLevel);
                    if (levelData) {
                      console.log('Setting level form data:', levelData);
                      setLevelFormData(levelData);
                      setEditingLevelId(levelData.id);
                      setIsAddingLevel(true);
                    }
                  }}
                  className="border-neutral-700 text-white hover:bg-neutral-800"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteLevel(selectedLevel)}
                  className="border-red-600 text-red-400 hover:bg-red-600/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {t("Bible Trivia Questions", "Preguntas de Trivia Bíblica")} - {levels.find(l => l.id === selectedLevel)?.name}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="shuffle-questions"
                checked={shuffleQuestions}
                onCheckedChange={(checked) => setShuffleQuestions(checked as boolean)}
                className="border-neutral-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              />
              <Label
                htmlFor="shuffle-questions"
                className="text-sm text-neutral-300 cursor-pointer"
              >
                {t("Shuffle Questions", "Barajar Preguntas")}
              </Label>
            </div>
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              {t("Add Question", "Agregar Pregunta")}
            </Button>
          </div>
        </div>

      {error && (
        <div className="rounded-lg bg-red-600/20 p-3 text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-600/20 p-3 text-green-400">
          {success}
        </div>
      )}

      {isAdding && (() => {
        console.log('Question modal should be showing, isAdding:', isAdding, 'editingId:', editingId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="mx-4 max-w-2xl border-neutral-800 bg-neutral-900">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {editingId 
                  ? t("Edit Question", "Editar Pregunta")
                  : t("Add New Question", "Agregar Nueva Pregunta")
                }
              </span>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">
                {t("Question", "Pregunta")}
              </Label>
              <Textarea
                value={formData.question || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                className="border-neutral-700 bg-neutral-800 text-white"
                placeholder={t("Enter your question in any language", "Ingresa tu pregunta en cualquier idioma")}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">{t("Category", "Categoría")}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-neutral-700 bg-neutral-800">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="text-white">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">{t("Level", "Nivel")}</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
              >
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-neutral-700 bg-neutral-800">
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id} className="text-white">
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white">{t("Reference (Optional)", "Referencia (Opcional)")}</Label>
              <Input
                value={formData.reference || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                className="border-neutral-700 bg-neutral-800 text-white"
                placeholder={t("e.g., Genesis 1:1", "ej., Génesis 1:1")}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-white">{t("Answer Options", "Opciones de Respuesta")}</Label>
              {[0, 1, 2, 3].map((index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">{index + 1}.</span>
                  <Input
                    value={formData.optionInputs?.[index] || ""}
                    onChange={(e) => {
                      const newOptions = [...(formData.optionInputs || ["", "", "", ""])];
                      newOptions[index] = e.target.value;
                      setFormData(prev => ({ ...prev, optionInputs: newOptions }));
                    }}
                    className="border-neutral-700 bg-neutral-800 text-white"
                    placeholder={t("Enter option in any language", "Ingresa la opción en cualquier idioma")}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="text-white">{t("Correct Answer", "Respuesta Correcta")}</Label>
              <Select
                value={formData.correctAnswer?.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, correctAnswer: parseInt(value) }))}
              >
                <SelectTrigger className="border-neutral-700 bg-neutral-800 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-neutral-700 bg-neutral-800">
                  {[0, 1, 2, 3].map(index => (
                    <SelectItem key={index} value={index.toString()} className="text-white">
                      {t("Option", "Opción")} {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveQuestion} className="bg-red-600 hover:bg-red-700">
                <Save className="mr-2 h-4 w-4" />
                {t("Save Question", "Guardar Pregunta")}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                {t("Cancel", "Cancelar")}
              </Button>
            </div>
          </CardContent>
        </Card>
        </div>
        );
      })()}

      {/* Level Form Modal */}
      {isAddingLevel && (() => {
        console.log('Level modal should be showing, isAddingLevel:', isAddingLevel, 'editingLevelId:', editingLevelId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="mx-4 max-w-2xl border-neutral-800 bg-neutral-900">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {editingLevelId 
                      ? t("Edit Level", "Editar Nivel")
                      : t("Add New Level", "Agregar Nuevo Nivel")
                    }
                  </span>
                  <Button variant="outline" size="sm" onClick={() => {
                    setIsAddingLevel(false);
                    setEditingLevelId(null);
                    resetLevelForm();
                  }}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">
                    {t("Level Name", "Nombre del Nivel")}
                  </Label>
                  <Input
                    value={levelFormData.name || ""}
                    onChange={(e) => setLevelFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t("e.g., Kids, Youth, Adults", "ej., Niños, Jóvenes, Adultos")}
                    className="border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">
                    {t("Description", "Descripción")}
                  </Label>
                  <Textarea
                    value={levelFormData.description || ""}
                    onChange={(e) => setLevelFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={t("Describe this level...", "Describe este nivel...")}
                    className="border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">
                    {t("Target Group", "Grupo Objetivo")}
                  </Label>
                  <Input
                    value={levelFormData.targetGroup || ""}
                    onChange={(e) => setLevelFormData(prev => ({ ...prev, targetGroup: e.target.value }))}
                    placeholder={t("e.g., Children, Teenagers, Adults", "ej., Niños, Adolescentes, Adultos")}
                    className="border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enable-timer"
                      checked={levelFormData.timeLimit !== undefined && levelFormData.timeLimit > 0}
                      onCheckedChange={(checked) => setLevelFormData(prev => ({ 
                        ...prev, 
                        timeLimit: checked ? (prev.timeLimit || 30) : 0 
                      }))}
                      className="border-neutral-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <Label
                      htmlFor="enable-timer"
                      className="text-sm text-neutral-300 cursor-pointer"
                    >
                      {t("Enable Timer", "Habilitar Temporizador")}
                    </Label>
                  </div>
                  
                  {(levelFormData.timeLimit !== undefined && levelFormData.timeLimit > 0) && (
                    <div className="space-y-2">
                      <Label className="text-white">
                        {t("Time Limit (seconds)", "Límite de Tiempo (segundos)")}
                      </Label>
                      <Input
                        type="number"
                        value={levelFormData.timeLimit || ""}
                        onChange={(e) => setLevelFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                        placeholder="30"
                        min="5"
                        max="300"
                        className="border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500"
                      />
                      <p className="text-xs text-neutral-500">
                        {t("Set 0 to disable timer", "Establecer 0 para desactivar el temporizador")}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-white">
                    {t("Passing Score (%)", "Puntuación Aprobatoria (%)")}
                  </Label>
                  <Input
                    type="number"
                    value={levelFormData.passingScore || ""}
                    onChange={(e) => setLevelFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) || 70 }))}
                    placeholder="70"
                    min="0"
                    max="100"
                    className="border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffle-questions-level"
                    checked={levelFormData.shuffleQuestions || false}
                    onCheckedChange={(checked) => setLevelFormData(prev => ({ ...prev, shuffleQuestions: checked as boolean }))}
                    className="border-neutral-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                  />
                  <Label
                    htmlFor="shuffle-questions-level"
                    className="text-sm text-neutral-300 cursor-pointer"
                  >
                    {t("Shuffle Questions", "Barajar Preguntas")}
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveLevel} className="bg-red-600 hover:bg-red-700">
                    <Save className="mr-2 h-4 w-4" />
                    {t("Save Level", "Guardar Nivel")}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsAddingLevel(false);
                    setEditingLevelId(null);
                    resetLevelForm();
                  }}>
                    {t("Cancel", "Cancelar")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-neutral-400">
            {t("Loading questions...", "Cargando preguntas...")}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center text-neutral-400">
            {t("No questions yet. Add your first question!", "No hay preguntas aún. ¡Agrega tu primera pregunta!")}
          </div>
        ) : (
          questions.map((question) => (
            <Card key={question.id} className="border-neutral-800 bg-neutral-900/60">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-red-600/20 px-2 py-1 text-xs font-semibold text-red-400">
                        {question.category}
                      </span>
                      {question.reference && (
                        <span className="text-xs text-neutral-400">
                          {question.reference}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">{question.questionEn}</p>
                      <p className="text-sm text-neutral-400">{question.questionEs}</p>
                    </div>
                    <div className="grid gap-1 text-xs text-neutral-400 md:grid-cols-2">
                      <div>
                        <span className="font-medium text-white">EN:</span> {question.options.en.join(" • ")}
                      </div>
                      <div>
                        <span className="font-medium text-white">ES:</span> {question.options.es.join(" • ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">
                        {t("Correct", "Correcto")}: {t("Option", "Opción")} {question.correctAnswer + 1}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log('Edit button clicked for question:', question);
                        startEdit(question);
                      }}
                      className="border-neutral-700 text-white hover:bg-neutral-800"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteQuestion(question.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
