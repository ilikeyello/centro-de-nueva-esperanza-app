import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "../../contexts/LanguageContext";
import { Plus, Edit2, Trash2, Save, X, Brain, Clock, Target } from "lucide-react";

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
}

interface TriviaAdminPanelProps {
  passcode: string;
}

export function TriviaAdminPanel({ passcode }: TriviaAdminPanelProps) {
  const { t, language } = useLanguage();
  const [levels, setLevels] = useState<TriviaLevel[]>([]);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  
  // Form states
  const [editingLevel, setEditingLevel] = useState<TriviaLevel | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<TriviaQuestion | null>(null);
  const [showNewLevelForm, setShowNewLevelForm] = useState(false);
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";
      const response = await fetch(`${base}/trivia/simple`);
      const data = await response.json();
      
      setLevels(data.levels || []);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Failed to load trivia data:', error);
      setStatus('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLevel = async (level: TriviaLevel) => {
    if (!passcode) {
      setStatus('Admin passcode required');
      return;
    }

    try {
      const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";
      const response = await fetch(`${base}/trivia/simple/level`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: level.id,
          name: level.name,
          description: level.description,
          shuffle_questions: level.shuffle_questions,
          time_limit: level.time_limit,
          passing_score: level.passing_score,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      await loadData();
      setEditingLevel(null);
      setShowNewLevelForm(false);
      setStatus('Level saved successfully');
    } catch (error) {
      setStatus('Failed to save level');
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!passcode) {
      setStatus('Admin passcode required');
      return;
    }

    if (!confirm('Are you sure you want to delete this level? All questions in this level will also be deleted.')) {
      return;
    }

    try {
      const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";
      const response = await fetch(`${base}/trivia/simple/level/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      await loadData();
      setStatus('Level deleted successfully');
    } catch (error) {
      setStatus('Failed to delete level');
    }
  };

  const handleSaveQuestion = async (question: TriviaQuestion) => {
    if (!passcode) {
      setStatus('Admin passcode required');
      return;
    }

    try {
      const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";
      const response = await fetch(`${base}/trivia/simple/question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_en: question.question_en,
          question_es: question.question_es,
          options_en: JSON.stringify(question.options_en),
          options_es: JSON.stringify(question.options_es),
          correct_answer: question.correct_answer,
          category: question.category,
          level_id: question.level_id,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      await loadData();
      setEditingQuestion(null);
      setShowNewQuestionForm(false);
      setStatus('Question saved successfully');
    } catch (error) {
      setStatus('Failed to save question');
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!passcode) {
      setStatus('Admin passcode required');
      return;
    }

    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";
      const response = await fetch(`${base}/trivia/simple/question/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      await loadData();
      setStatus('Question deleted successfully');
    } catch (error) {
      setStatus('Failed to delete question');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-red-400">
        <Brain className="h-5 w-5" />
        <span className="text-sm font-semibold uppercase tracking-[0.2em]">
          {t("Trivia Management", "Gestión de Trivia")}
        </span>
      </div>

      {status && (
        <div className={`text-sm p-2 rounded ${
          status.includes('success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {status}
        </div>
      )}

      {/* Levels Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{t("Difficulty Levels", "Niveles de Dificultad")}</h3>
          <Button
            onClick={() => setShowNewLevelForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("Add Level", "Agregar Nivel")}
          </Button>
        </div>

        <div className="space-y-2">
          {levels.map((level) => (
            <div key={level.id} className="border border-neutral-800 rounded-lg p-4 bg-neutral-900/40">
              {editingLevel?.id === level.id ? (
                <LevelForm
                  level={editingLevel}
                  onSave={handleSaveLevel}
                  onCancel={() => setEditingLevel(null)}
                />
              ) : (
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">{level.name}</h4>
                    {level.description && <p className="text-sm text-neutral-400">{level.description}</p>}
                    <div className="flex gap-4 text-sm text-neutral-300">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{level.time_limit}s</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span>{level.passing_score}%</span>
                      </div>
                      {level.target_group && <span>{level.target_group}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditingLevel(level)}
                      variant="outline"
                      size="sm"
                      className="border-neutral-700 hover:bg-neutral-800"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteLevel(level.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-700 hover:bg-red-700 text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {showNewLevelForm && (
          <div className="border border-neutral-800 rounded-lg p-4 bg-neutral-900/40">
            <LevelForm
              level={{
                id: '',
                name: '',
                description: '',
                target_group: '',
                shuffle_questions: true,
                time_limit: 30,
                passing_score: 70,
              }}
              onSave={handleSaveLevel}
              onCancel={() => setShowNewLevelForm(false)}
            />
          </div>
        )}
      </div>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{t("Questions", "Preguntas")}</h3>
          <Button
            onClick={() => setShowNewQuestionForm(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("Add Question", "Agregar Pregunta")}
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {questions.map((question) => (
            <div key={question.id} className="border border-neutral-800 rounded-lg p-4 bg-neutral-900/40">
              {editingQuestion?.id === question.id ? (
                <QuestionForm
                  question={editingQuestion}
                  levels={levels}
                  onSave={handleSaveQuestion}
                  onCancel={() => setEditingQuestion(null)}
                />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-white">{language === 'es' ? question.question_es : question.question_en}</p>
                      <p className="text-sm text-neutral-400 mt-1">
                        {t("Level", "Nivel")}: {levels.find(l => l.id === question.level_id)?.name || question.level_id}
                      </p>
                      <p className="text-sm text-neutral-500">{t("Category", "Categoría")}: {question.category}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingQuestion(question)}
                        variant="outline"
                        size="sm"
                        className="border-neutral-700 hover:bg-neutral-800"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteQuestion(question.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-700 hover:bg-red-700 text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {showNewQuestionForm && (
          <div className="border border-neutral-800 rounded-lg p-4 bg-neutral-900/40">
            <QuestionForm
              question={{
                id: 0,
                question_en: '',
                question_es: '',
                options_en: ['', '', '', ''],
                options_es: ['', '', '', ''],
                correct_answer: 0,
                category: '',
                reference: '',
                level_id: levels[0]?.id || '',
              }}
              levels={levels}
              onSave={handleSaveQuestion}
              onCancel={() => setShowNewQuestionForm(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function LevelForm({ 
  level, 
  onSave, 
  onCancel 
}: { 
  level: TriviaLevel; 
  onSave: (level: TriviaLevel) => void; 
  onCancel: () => void; 
}) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState(level);

  const generateId = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const levelToSave = {
      ...formData,
      id: level.id || generateId(formData.name),
      target_group: formData.target_group || undefined
    };
    onSave(levelToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1">
          {t("Level Name", "Nombre del Nivel")}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-white"
          placeholder={language === 'es' ? 'Niños' : 'Kids'}
          required
        />
        <p className="text-xs text-neutral-500 mt-1">
          {t("ID will be automatically generated from the name", "El ID se generará automáticamente desde el nombre")}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1">
          {t("Description (optional)", "Descripción (opcional)")}
        </label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-white"
          placeholder={language === 'es' ? 'Para niños de 6-12 años' : 'For children ages 6-12'}
          rows={2}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            {t("Time Limit (seconds)", "Límite de Tiempo (segundos)")}
          </label>
          <input
            type="number"
            value={formData.time_limit}
            onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 30 })}
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-white"
            min="5"
            max="120"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            {t("Passing Score (%)", "Puntuación para Aprobar (%)")}
          </label>
          <input
            type="number"
            value={formData.passing_score}
            onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 70 })}
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-white"
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="shuffle"
          checked={formData.shuffle_questions}
          onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
          className="rounded border-neutral-700 bg-neutral-950"
        />
        <label htmlFor="shuffle" className="text-sm text-neutral-300">
          {t("Shuffle questions", "Mezclar preguntas")}
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
          <Save className="h-4 w-4 mr-1" />
          {t("Save", "Guardar")}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="border-neutral-700 hover:bg-neutral-800">
          <X className="h-4 w-4 mr-1" />
          {t("Cancel", "Cancelar")}
        </Button>
      </div>
    </form>
  );
}

function QuestionForm({ 
  question, 
  levels, 
  onSave, 
  onCancel 
}: { 
  question: TriviaQuestion; 
  levels: TriviaLevel[];
  onSave: (question: TriviaQuestion) => void; 
  onCancel: () => void; 
}) {
  const { t, language } = useLanguage();
  
  // Initialize formData with parsed options if they're strings
  const initializeFormData = (q: TriviaQuestion) => ({
    ...q,
    options_en: typeof q.options_en === 'string' ? JSON.parse(q.options_en) : q.options_en,
    options_es: typeof q.options_es === 'string' ? JSON.parse(q.options_es) : q.options_es,
  });
  
  const [formData, setFormData] = useState(initializeFormData(question));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateOption = (lang: 'en' | 'es', index: number, value: string) => {
    const options = lang === 'en' ? [...formData.options_en] : [...formData.options_es];
    options[index] = value;
    setFormData({ 
      ...formData, 
      [`options_${lang}`]: options 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            {t("Question (English)", "Pregunta (Inglés)")}
          </label>
          <textarea
            value={formData.question_en}
            onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-white"
            rows={2}
            placeholder="What is the first book of the Bible?"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            {t("Question (Spanish)", "Pregunta (Español)")}
          </label>
          <textarea
            value={formData.question_es}
            onChange={(e) => setFormData({ ...formData, question_es: e.target.value })}
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-white"
            rows={2}
            placeholder="¿Cuál es el primer libro de la Biblia?"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            {t("Level", "Nivel")}
          </label>
          <select
            value={formData.level_id}
            onChange={(e) => setFormData({ ...formData, level_id: e.target.value })}
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-white"
          >
            {levels.map((level) => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">
            {t("Category", "Categoría")}
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-white"
            placeholder="Old Testament, New Testament, Jesus"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-1">
          {t("Answer Options (click radio for correct answer)", "Opciones de respuesta (haz clic en el radio para la respuesta correcta)")}
        </label>
        
        {formData.options_en.map((option: string, index: number) => (
          <div key={index} className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400 w-4">{String.fromCharCode(65 + index)}.</span>
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption('en', index, e.target.value)}
                className="flex-1 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-white"
                placeholder={`Option ${index + 1} in English`}
                required
              />
              <input
                type="radio"
                name="correct"
                checked={formData.correct_answer === index}
                onChange={() => setFormData({ ...formData, correct_answer: index })}
                className="text-red-500"
              />
            </div>
            <div className="flex items-center gap-2 ml-6">
              <input
                type="text"
                value={formData.options_es[index]}
                onChange={(e) => updateOption('es', index, e.target.value)}
                className="flex-1 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm text-white"
                placeholder={`Opción ${index + 1} en español`}
                required
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white">
          <Save className="h-4 w-4 mr-1" />
          {t("Save", "Guardar")}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="border-neutral-700 hover:bg-neutral-800">
          <X className="h-4 w-4 mr-1" />
          {t("Cancel", "Cancelar")}
        </Button>
      </div>
    </form>
  );
}
