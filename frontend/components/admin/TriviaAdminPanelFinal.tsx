import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "../../contexts/LanguageContext";
import { Plus, Edit2, Trash2, Save, X, Brain, Clock, Target, ChevronDown, ChevronRight, AlertCircle, Check } from "lucide-react";

interface TriviaLevel {
  id: string;
  name: string;
  description?: string;
  target_group?: string;
  shuffle_questions: boolean;
  time_limit: number | null;
  passing_score: number;
  created_at: string;
  updated_at: string;
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

interface TriviaAdminPanelProps {
  passcode: string;
}

export function TriviaAdminPanelFinal({ passcode }: TriviaAdminPanelProps) {
  const { t, language } = useLanguage();
  const [levels, setLevels] = useState<TriviaLevel[]>([]);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  const [pendingOperations, setPendingOperations] = useState<{
    levelsToAdd: Partial<TriviaLevel>[];
    levelsToEdit: Partial<TriviaLevel>[];
    levelsToDelete: string[];
    questionsToAdd: Partial<TriviaQuestion>[];
    questionsToEdit: Partial<TriviaQuestion>[];
    questionsToDelete: number[];
  }>({
    levelsToAdd: [],
    levelsToEdit: [],
    levelsToDelete: [],
    questionsToAdd: [],
    questionsToEdit: [],
    questionsToDelete: []
  });

  // Fallback tracking for when backend deletion fails
  const [deletedLevelIds, setDeletedLevelIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('deletedLevelIds');
    return saved ? JSON.parse(saved) : [];
  });
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('deletedQuestionIds');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('deletedLevelIds', JSON.stringify(deletedLevelIds));
  }, [deletedLevelIds]);
  
  useEffect(() => {
    localStorage.setItem('deletedQuestionIds', JSON.stringify(deletedQuestionIds));
  }, [deletedQuestionIds]);
  

  // Dialog states
  const [showLevelDialog, setShowLevelDialog] = useState(false);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState<TriviaLevel | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<TriviaQuestion | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('=== LOADING DATA ===');
      const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";
      const response = await fetch(`${base}/trivia/simple`);
      const data = await response.json();
      
      console.log('Admin panel - loaded levels:', data.levels.length);
      console.log('Admin panel - loaded questions:', data.questions.length);
      console.log('Admin panel - level IDs:', data.levels.map((l: any) => l.id));
      console.log('Admin panel - question IDs:', data.questions.map((q: any) => q.id));
      
      setLevels(data.levels || []);
      setQuestions(data.questions || []);
      console.log('Levels after load:', data.levels);
      console.log('=== DATA LOAD COMPLETE ===');
    } catch (error) {
      console.error('Failed to load trivia data:', error);
      setStatus('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!passcode) {
      setStatus(
        language === "es" ? "Se requiere código de administrador" : "Admin passcode required"
      );
      return;
    }

    const confirmed = window.confirm(
      language === "es"
        ? "¿Seguro que deseas eliminar este nivel? Todas las preguntas de este nivel también se eliminarán."
        : "Are you sure you want to delete this level? All questions in this level will also be deleted."
    );
    if (!confirmed) return;

    try {
      const base = import.meta.env.DEV
        ? "http://127.0.0.1:4000"
        : "https://prod-cne-sh82.encr.app";
      const deleteUrl = `${base}/trivia/simple/level/${encodeURIComponent(
        id
      )}?passcode=${encodeURIComponent(passcode)}`;

      const response = await fetch(deleteUrl, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const contentType = response.headers.get("content-type") || "";
      let data: any = null;
      if (contentType.includes("application/json")) {
        data = await response.json().catch(() => null as any);
      }

      if (!response.ok || (data && data.success === false)) {
        throw new Error(data?.message || "Delete failed");
      }

      setStatus(
        language === "es" ? "Nivel eliminado correctamente" : "Level deleted successfully"
      );
      await loadData();
    } catch (error) {
      console.error("Failed to delete level", error);
      setStatus(
        language === "es" ? "Error al eliminar nivel" : "Failed to delete level"
      );
    }
  };

  const addLevelToBatch = (level: Partial<TriviaLevel>) => {
    if (editingLevel) {
      // Edit existing level
      setPendingOperations(prev => ({
        ...prev,
        levelsToEdit: [...prev.levelsToEdit.filter(l => l.id !== editingLevel.id), { ...level, id: editingLevel.id }]
      }));
    } else {
      // Add new level - generate temporary ID
      const levelWithId = { ...level, id: `temp-${Date.now()}` };
      setPendingOperations(prev => ({
        ...prev,
        levelsToAdd: [...prev.levelsToAdd, levelWithId]
      }));
    }
    setShowLevelDialog(false);
    setEditingLevel(null);
  };

  const addQuestionToBatch = (question: Partial<TriviaQuestion>) => {
    console.log('🔍 addQuestionToBatch called with:', question);
    console.log('🔍 editingQuestion:', editingQuestion);
    
    if (editingQuestion && editingQuestion.id !== 0) {
      // Edit existing question (only if id is not 0)
      setPendingOperations(prev => ({
        ...prev,
        questionsToEdit: [...prev.questionsToEdit.filter(q => q.id !== editingQuestion.id), { ...question, id: editingQuestion.id }]
      }));
      setShowQuestionDialog(false);
      setEditingQuestion(null);
    } else {
      // Add new question - close dialog and let user click add again
      console.log('🔍 Adding new question to questionsToAdd');
      setPendingOperations(prev => {
        const newQuestions = [...prev.questionsToAdd, question];
        console.log('🔍 New questionsToAdd array:', newQuestions);
        return {
          ...prev,
          questionsToAdd: newQuestions
        };
      });
      // Close dialog - user can click "Add Question" again for another
      setShowQuestionDialog(false);
      setEditingQuestion(null);
    }
  };

  const deleteLevelFromBatch = (id: string) => {
    setPendingOperations(prev => ({
      ...prev,
      levelsToDelete: [...prev.levelsToDelete, id]
    }));
  };

  const deleteQuestionFromBatch = (id: number) => {
    setPendingOperations(prev => ({
      ...prev,
      questionsToDelete: [...prev.questionsToDelete, id]
    }));
  };

  const executeBatchOperations = async () => {
    if (!passcode) {
      setStatus('Admin passcode required');
      return;
    }

    setStatus('Saving changes...');
    console.log('=== STARTING BATCH OPERATIONS ===');
    console.log('Pending operations:', JSON.stringify(pendingOperations, null, 2));
    console.log('Passcode:', passcode);
    
    try {
      const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";
      const results: { success: boolean; id?: string | number; error?: string }[] = [];

      console.log('Levels to delete:', pendingOperations.levelsToDelete);
      console.log('Questions to delete:', pendingOperations.questionsToDelete);

      // Add levels
      for (const level of pendingOperations.levelsToAdd) {
        try {
          const payload = {
            id: level.id,
            name: level.name,
            description: level.description || null,
            shuffle_questions: level.shuffle_questions ?? true,
            time_limit: level.time_limit === null ? 0 : level.time_limit,
            passing_score: level.passing_score || 70
          };
          console.log('Creating level with payload:', payload);
          
          const response = await fetch(`${base}/trivia/simple/level`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          console.log('Create level response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('Create level response body:', result);
            if (result.success) {
              console.log('✅ Level created successfully:', level.id);
              results.push({ success: true, id: level.id });
            } else {
              console.error('❌ Failed to create level:', result.message);
              results.push({ success: false, error: result.message, id: level.id });
            }
          } else {
            const errorText = await response.text();
            console.error('❌ Create level failed:', response.status, errorText);
            results.push({ success: false, error: `HTTP ${response.status}: ${errorText}`, id: level.id });
          }
        } catch (error) {
          console.error('❌ Error creating level:', level.id, error);
          results.push({ success: false, error: String(error), id: level.id });
        }
      }

      // Delete levels using correct backend endpoints
      for (const id of pendingOperations.levelsToDelete) {
        try {
          const deleteUrl = `${base}/trivia/simple/level/${id}?passcode=${passcode}`;
          console.log('Attempting to delete level:', id);
          console.log('Full delete URL:', deleteUrl);
          
          const response = await fetch(deleteUrl, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          
          console.log('Delete level response status:', response.status);
          console.log('Delete level response headers:', Object.fromEntries(response.headers.entries()));
          
          if (response.ok) {
            const result = await response.json();
            console.log('Delete level response body:', result);
            if (result.success) {
              console.log('✅ Level deleted successfully:', id);
              results.push({ success: true, id });
            } else {
              console.error('❌ Failed to delete level:', result.message);
              results.push({ success: false, error: result.message, id });
            }
          } else {
            const errorText = await response.text();
            console.error('❌ Delete level failed:', response.status, errorText);
            results.push({ success: false, error: `HTTP ${response.status}: ${errorText}`, id });
          }
        } catch (error) {
          console.error('❌ Error deleting level:', id, error);
          results.push({ success: false, error: String(error), id });
        }
      }

      // Add questions
      for (const question of pendingOperations.questionsToAdd) {
        try {
          const payload = {
            question_en: question.question_en,
            question_es: question.question_es || null,
            options_en: question.options_en,
            options_es: question.options_es || question.options_en,
            correct_answer: question.correct_answer,
            category: question.category || 'General',
            level_id: question.level_id
          };
          console.log('Creating question with payload:', payload);
          
          const response = await fetch(`${base}/trivia/simple/question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          
          console.log('Create question response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('Create question response body:', result);
            if (result.success) {
              console.log('✅ Question created successfully');
              results.push({ success: true });
            } else {
              console.error('❌ Failed to create question:', result.message);
              results.push({ success: false, error: result.message });
            }
          } else {
            const errorText = await response.text();
            console.error('❌ Create question failed:', response.status, errorText);
            results.push({ success: false, error: `HTTP ${response.status}: ${errorText}` });
          }
        } catch (error) {
          console.error('❌ Error creating question:', error);
          results.push({ success: false, error: String(error) });
        }
      }

      // Edit questions
      for (const question of pendingOperations.questionsToEdit) {
        try {
          const payload = {
            question_en: question.question_en,
            question_es: question.question_es || null,
            options_en: question.options_en,
            options_es: question.options_es || question.options_en,
            correct_answer: question.correct_answer,
            category: question.category || 'General',
            level_id: question.level_id
          };
          console.log('Updating question with payload:', payload);
          
          // If question id is 0, it's a new question, so create it instead
          if (question.id === 0) {
            console.log('Creating new question (id=0):', payload);
            
            const response = await fetch(`${base}/trivia/simple/question`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            
            console.log('Create question response status:', response.status);
            
            if (response.ok) {
              const result = await response.json();
              console.log('Create question response body:', result);
              if (result.success) {
                console.log('✅ Question created successfully');
                results.push({ success: true });
              } else {
                console.error('❌ Failed to create question:', result.message);
                results.push({ success: false, error: result.message });
              }
            } else {
              const errorText = await response.text();
              console.error('❌ Create question failed:', response.status, errorText);
              results.push({ success: false, error: `HTTP ${response.status}: ${errorText}` });
            }
          } else {
            console.log('Updating existing question:', question.id);
            // TODO: Add update endpoint when needed
            console.log('❌ Question update not implemented yet');
            results.push({ success: false, error: 'Question update not implemented' });
          }
        } catch (error) {
          console.error('❌ Error editing question:', error);
          results.push({ success: false, error: String(error) });
        }
      }

      // Delete questions using correct backend endpoints
      for (const id of pendingOperations.questionsToDelete) {
        try {
          const deleteUrl = `${base}/trivia/simple/question/${id}?passcode=${passcode}`;
          console.log('Attempting to delete question:', id);
          console.log('Full delete question URL:', deleteUrl);
          
          const response = await fetch(deleteUrl, { 
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
          });
          
          console.log('Delete question response status:', response.status);
          console.log('Delete question response headers:', Object.fromEntries(response.headers.entries()));
          
          if (response.ok) {
            const result = await response.json();
            console.log('Delete question response body:', result);
            if (result.success) {
              console.log('✅ Question deleted successfully:', id);
              results.push({ success: true, id });
            } else {
              console.error('❌ Failed to delete question:', result.message);
              results.push({ success: false, error: result.message, id });
            }
          } else {
            const errorText = await response.text();
            console.error('❌ Delete question failed:', response.status, errorText);
            results.push({ success: false, error: `HTTP ${response.status}: ${errorText}`, id });
          }
        } catch (error) {
          console.error('❌ Error deleting question:', id, error);
          results.push({ success: false, error: String(error), id });
        }
      }

      console.log('=== ALL DELETION RESULTS ===');
      console.log('Results:', JSON.stringify(results, null, 2));

      const errors = results.filter(r => !r.success);
      console.log('Errors found:', errors.length);
      console.log('Error details:', JSON.stringify(errors, null, 2));
      
      if (errors.length === 0) {
        console.log('✅ All operations successful!');
        setStatus('All changes saved successfully!');
        console.log('About to call loadData after successful save');
        
        // Clear all pending operations and reload data
        setPendingOperations({
          levelsToAdd: [],
          levelsToEdit: [],
          levelsToDelete: [],
          questionsToAdd: [],
          questionsToEdit: [],
          questionsToDelete: []
        });
        console.log('Calling loadData...');
        loadData();
      } else {
        console.log('❌ Some operations failed');
        setStatus(`${errors.length} operations failed`);
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const toggleLevelExpansion = (levelId: string) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(levelId)) {
      newExpanded.delete(levelId);
    } else {
      newExpanded.add(levelId);
    }
    setExpandedLevels(newExpanded);
  };

  // Group questions by level
  const questionsByLevel = questions.reduce((acc, question) => {
    if (!acc[question.level_id]) {
      acc[question.level_id] = [];
    }
    acc[question.level_id].push(question);
    return acc;
  }, {} as Record<string, TriviaQuestion[]>);

  // Count pending operations
  const totalPendingOps = 
    pendingOperations.levelsToAdd.length +
    pendingOperations.levelsToEdit.length +
    pendingOperations.levelsToDelete.length +
    pendingOperations.questionsToAdd.length +
    pendingOperations.questionsToEdit.length +
    pendingOperations.questionsToDelete.length;

  if (loading) {
    return (
      <div className="text-center py-8">
        <Brain className="h-8 w-8 mx-auto mb-2 animate-pulse text-red-400" />
        <p className="text-neutral-400">{t("Loading trivia data...", "Cargando datos de trivia...")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="h-6 w-6 text-red-400" />
          {t("Trivia Management", "Gestión de Trivia")}
        </h2>
        <div className="flex items-center gap-4">
          {status && (
            <div className={`px-3 py-1 rounded text-sm ${status.includes('Error') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Levels Section */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>{t("Levels", "Niveles")}</span>
            <Dialog open={showLevelDialog} onOpenChange={setShowLevelDialog}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => setEditingLevel(null)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("Add Level", "Agregar Nivel")}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingLevel ? t("Edit Level", "Editar Nivel") : t("Add New Level", "Agregar Nuevo Nivel")}
                  </DialogTitle>
                </DialogHeader>
                <LevelForm
                  level={editingLevel}
                  onSave={addLevelToBatch}
                  onCancel={() => {
                    setShowLevelDialog(false);
                    setEditingLevel(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...levels, ...pendingOperations.levelsToAdd]
            .filter((level) => typeof level.id === "string" && !pendingOperations.levelsToDelete.includes(level.id as string))
            .map((level) => {
              const levelId = level.id as string;
              const isExpanded = expandedLevels.has(levelId);
              const levelQuestions = [
                ...(questionsByLevel[levelId] || []).filter(
                  (question: TriviaQuestion) => !pendingOperations.questionsToDelete.includes(question.id)
                ),
                ...pendingOperations.questionsToAdd.filter((question) => question.level_id === levelId),
                ...pendingOperations.questionsToEdit.filter(
                  (question) => question.level_id === levelId && question.id === 0
                ),
              ].filter(
                (question, index, array) =>
                  array.findIndex(
                    (q) => q.question_en === question.question_en && q.level_id === question.level_id
                  ) === index
              );
              return (
                <div key={levelId} className="border border-neutral-800 rounded-lg bg-neutral-900/50">
                <div className="p-4 hover:bg-neutral-800/50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-2 text-left"
                      onClick={() => toggleLevelExpansion(levelId)}
                    >
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <h3 className="font-semibold text-white">{level.name}</h3>
                      <span className="text-sm text-neutral-400">({levelQuestions.length} {t("questions", "preguntas")})</span>
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-neutral-400 hover:text-red-400 hover:bg-red-900/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!level.id) return;
                        void handleDeleteLevel(level.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t border-neutral-800 p-4 space-y-4">
                    {/* Editable fields for the level */}
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label className="text-[0.7rem] text-neutral-400">{t("Name", "Nombre")}</Label>
                        <Input
                          value={level.name}
                          onChange={e => {/* handle name change */}}
                          className="h-7 border-neutral-700 bg-neutral-950 text-[0.8rem]"
                        />
                      </div>
                      <div className="space-y-1 flex gap-2">
                        <div className="flex-1">
                          <Label className="text-[0.7rem] text-neutral-400">{t("Time Limit (s)", "Límite de Tiempo (s)")}</Label>
                          <Input
                            type="number"
                            min={0}
                            value={level.time_limit || 0}
                            onChange={e => {/* handle time change */}}
                            className="h-7 border-neutral-700 bg-neutral-950 text-[0.8rem]"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-[0.7rem] text-neutral-400">{t("Passing Score (%)", "Puntaje de Aprobación (%)")}</Label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={level.passing_score || 0}
                            onChange={e => {/* handle score change */}}
                            className="h-7 border-neutral-700 bg-neutral-950 text-[0.8rem]"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[0.7rem] text-neutral-400">{t("Description", "Descripción")}</Label>
                      <Textarea
                        value={level.description || ''}
                        onChange={e => {/* handle desc change */}}
                        className="min-h-[60px] border-neutral-700 bg-neutral-950 text-[0.8rem]"
                      />
                    </div>
                    {/* Inline editable question list */}
                    <div className="space-y-2 mt-4">
                      <Label className="text-neutral-300">{t("Questions", "Preguntas")}</Label>
                      {levelQuestions.length === 0 && (
                        <div className="text-center text-neutral-400">
                          {t("No questions in this level yet.", "No hay preguntas en este nivel aún.")}
                        </div>
                      )}
                      <div className="space-y-2">
                        {levelQuestions.map((question, idx) => (
                          <div
                            key={question.id ?? `temp-${idx}`}
                            className="border border-neutral-700 rounded bg-neutral-800/50 p-3 flex flex-col gap-2"
                          >
                            <Input
                              value={question.question_en}
                              onChange={e => {/* handle inline edit for question */}}
                              placeholder={t("Question", "Pregunta")}
                              className="mb-1 text-[0.9rem]"
                            />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                              <Input
                                value={Array.isArray(question.options_en) ? (question.options_en[0] || "") : ""}
                                onChange={e => {/* handle option 1 edit */}}
                                placeholder={t("Option 1", "Opción 1")}
                                className="text-[0.9rem]"
                              />
                              <Input
                                value={Array.isArray(question.options_en) ? (question.options_en[1] || "") : ""}
                                onChange={e => {/* handle option 2 edit */}}
                                placeholder={t("Option 2", "Opción 2")}
                                className="text-[0.9rem]"
                              />
                              <Input
                                value={Array.isArray(question.options_en) ? (question.options_en[2] || "") : ""}
                                onChange={e => {/* handle option 3 edit */}}
                                placeholder={t("Option 3", "Opción 3")}
                                className="text-[0.9rem]"
                              />
                              <Input
                                value={Array.isArray(question.options_en) ? (question.options_en[3] || "") : ""}
                                onChange={e => {/* handle option 4 edit */}}
                                placeholder={t("Option 4", "Opción 4")}
                                className="text-[0.9rem]"
                              />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Label className="text-[0.7rem] text-neutral-400">
                                {t("Correct Answer", "Respuesta correcta")}
                              </Label>
                              <Select
                                value={String(question.correct_answer ?? 0)}
                                onValueChange={(value) => {
                                  // handle correct answer change via dropdown
                                }}
                              >
                                <SelectTrigger className="w-40 h-7 bg-neutral-950 border-neutral-700 text-[0.8rem]">
                                  <SelectValue placeholder={t("Choose option", "Elige opción")} />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-950 border-neutral-700 text-[0.85rem]">
                                  <SelectItem value="0">{t("Option 1", "Opción 1")}</SelectItem>
                                  <SelectItem value="1">{t("Option 2", "Opción 2")}</SelectItem>
                                  <SelectItem value="2">{t("Option 3", "Opción 3")}</SelectItem>
                                  <SelectItem value="3">{t("Option 4", "Opción 4")}</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                className="ml-auto bg-red-700 px-2 h-7 text-xs"
                                onClick={() => {/* delete question */}}
                              >
                                {t("Delete", "Eliminar")}
                              </Button>
                            </div>
                          </div>
                        ))}
                        {/* Add new question row */}
                        <div className="border border-dashed border-neutral-700 rounded bg-neutral-900/30 p-3 flex flex-col gap-2 mt-2">
                          <Input
                            value={""}
                            onChange={() => {}}
                            placeholder={t("New Question", "Nueva Pregunta")}
                            className="mb-1 text-[0.9rem]"
                          />
                          {/* Single question field only; translations can be handled later */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                            <Input
                              value={""}
                              onChange={() => {}}
                              placeholder={t("Option 1", "Opción 1")}
                              className="text-[0.9rem]"
                            />
                            <Input
                              value={""}
                              onChange={() => {}}
                              placeholder={t("Option 2", "Opción 2")}
                              className="text-[0.9rem]"
                            />
                            <Input
                              value={""}
                              onChange={() => {}}
                              placeholder={t("Option 3", "Opción 3")}
                              className="text-[0.9rem]"
                            />
                            <Input
                              value={""}
                              onChange={() => {}}
                              placeholder={t("Option 4", "Opción 4")}
                              className="text-[0.9rem]"
                            />
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Label className="text-[0.7rem] text-neutral-400">
                              {t("Correct Answer", "Respuesta correcta")}
                            </Label>
                            <Select
                              defaultValue="0"
                              onValueChange={() => {
                                // handle new-question correct answer via dropdown
                              }}
                            >
                              <SelectTrigger className="w-40 h-7 bg-neutral-950 border-neutral-700 text-[0.8rem]">
                                <SelectValue placeholder={t("Choose option", "Elige opción")} />
                              </SelectTrigger>
                              <SelectContent className="bg-neutral-950 border-neutral-700 text-[0.85rem]">
                                <SelectItem value="0">{t("Option 1", "Opción 1")}</SelectItem>
                                <SelectItem value="1">{t("Option 2", "Opción 2")}</SelectItem>
                                <SelectItem value="2">{t("Option 3", "Opción 3")}</SelectItem>
                                <SelectItem value="3">{t("Option 4", "Opción 4")}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="button" className="bg-blue-700 px-2 h-7 text-xs mt-1" onClick={() => {/* add new question */}}>{t("Add Question", "Agregar Pregunta")}</Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={executeBatchOperations}
                      disabled={totalPendingOps === 0}
                      className="mt-4 h-7 bg-red-600 px-3 text-[0.75rem] font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t("Save Changes", "Guardar Cambios")} {totalPendingOps > 0 ? `(${totalPendingOps})` : ""}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Question Dialog */}
      <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? t("Edit Question", "Editar Pregunta") : t("Add New Question", "Agregar Nueva Pregunta")}
            </DialogTitle>
          </DialogHeader>
          <QuestionForm
            question={editingQuestion}
            levels={levels}
            onSave={addQuestionToBatch}
            onCancel={() => {
              setShowQuestionDialog(false);
              setEditingQuestion(null);
            }}
            editingQuestion={editingQuestion}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LevelForm({ 
  level, 
  onSave, 
  onCancel 
}: { 
  level: TriviaLevel | null; 
  onSave: (level: Partial<TriviaLevel>) => void; 
  onCancel: () => void; 
}) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    id: level?.id || '',
    name: level?.name || '',
    description: level?.description || '',
    shuffle_questions: level?.shuffle_questions ?? true,
    time_limit: level?.time_limit ?? 30,
    passing_score: level?.passing_score || 70,
    disable_time_limit: level?.time_limit === null
  } as {
    id: string;
    name: string;
    description: string;
    shuffle_questions: boolean;
    time_limit: number | null;
    passing_score: number;
    disable_time_limit: boolean;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData: Partial<TriviaLevel> = {
      ...formData,
      time_limit: formData.disable_time_limit ? null : formData.time_limit
    } as Partial<TriviaLevel>;
    onSave(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium text-neutral-300 mb-1">
            {t("Level Name", "Nombre del Nivel")} *
          </Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            className="bg-neutral-950 border-neutral-700 text-white"
            placeholder={t("e.g., Kids, Youth, Adults", "ej., Niños, Jóvenes, Adultos")}
            required
          />
        </div>
        <div>
          <Label className="block text-sm font-medium text-neutral-300 mb-1">
            {t("Time Limit (seconds)", "Límite de Tiempo (segundos)")}
          </Label>
          <Input
            type="number"
            value={formData.time_limit || 30}
            onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 30 })}
            className="bg-neutral-950 border-neutral-700 text-white"
            min="10"
            max="300"
            disabled={formData.disable_time_limit}
          />
          <div className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="disable_time_limit"
              checked={formData.disable_time_limit}
              onChange={(e) => setFormData({ ...formData, disable_time_limit: e.target.checked, time_limit: e.target.checked ? null : formData.time_limit })}
              className="border-neutral-700 bg-neutral-950"
            />
            <Label htmlFor="disable_time_limit" className="text-sm text-neutral-300">
              {t("Disable time limit", "Desactivar límite de tiempo")}
            </Label>
          </div>
        </div>
      </div>

      <div>
        <Label className="block text-sm font-medium text-neutral-300 mb-1">
          {t("Description", "Descripción")}
        </Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="bg-neutral-950 border-neutral-700 text-white"
          placeholder={t("Optional description for this level", "Descripción opcional para este nivel")}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="block text-sm font-medium text-neutral-300 mb-1">
            {t("Passing Score (%)", "Puntuación para Aprobar (%)")}
          </Label>
          <Input
            type="number"
            value={formData.passing_score}
            onChange={(e) => setFormData({ ...formData, passing_score: parseInt(e.target.value) || 70 })}
            className="bg-neutral-950 border-neutral-700 text-white"
            min="0"
            max="100"
          />
        </div>
        <div className="flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            id="shuffle"
            checked={formData.shuffle_questions}
            onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
            className="rounded border-neutral-700 bg-neutral-950"
          />
          <Label htmlFor="shuffle" className="text-sm text-neutral-300">
            {t("Shuffle questions", "Mezclar preguntas")}
          </Label>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-red-600 hover:bg-red-700">
          <Save className="h-4 w-4 mr-2" />
          {t("Add to Changes", "Agregar a Cambios")}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="border-neutral-700 hover:bg-neutral-800">
          <X className="h-4 w-4 mr-2" />
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
  onCancel,
  editingQuestion 
}: { 
  question: TriviaQuestion | null; 
  levels: TriviaLevel[];
  onSave: (question: Partial<TriviaQuestion>) => void; 
  onCancel: () => void; 
  editingQuestion: TriviaQuestion | null;
}) {
  const { t, language } = useLanguage();
  
  // Initialize formData with parsed options if they're strings
  const initializeFormData = (q: TriviaQuestion | null) => ({
    id: q?.id || 0,
    question: q?.question_en || q?.question_es || '',
    options: typeof q?.options_en === 'string' ? JSON.parse(q.options_en) : (q?.options_en || ['', '', '', '']),
    correct_answer: q?.correct_answer || 0,
    category: q?.category || 'General',
    level_id: q?.level_id || (levels[0]?.id || ''),
  });
  
  const [formData, setFormData] = useState(initializeFormData(question));

  useEffect(() => {
    setFormData(initializeFormData(question));
  }, [question, levels]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Populate both English and Spanish fields with the same content
    const submissionData = {
      ...formData,
      question_en: formData.question,
      question_es: formData.question,
      options_en: formData.options,
      options_es: formData.options,
      level_id: formData.level_id, // Explicitly include level_id
    };
    console.log('🔍 QuestionForm submitting:', submissionData);
    onSave(submissionData);
    
    // Reset form for next question
    setFormData({
      ...initializeFormData(null),
      level_id: formData.level_id // Preserve the level_id
    });
  };

  const updateOption = (index: number, value: string) => {
    const options = [...formData.options];
    options[index] = value;
    setFormData({ 
      ...formData, 
      options: options 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="block text-sm font-medium text-neutral-300 mb-1">
          {t("Question", "Pregunta")} *
        </Label>
        <Textarea
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          className="bg-neutral-950 border-neutral-700 text-white"
          placeholder={t("Enter question", "Ingresa la pregunta")}
          rows={2}
          required
        />
      </div>

      <div className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-neutral-300 mb-1">
            {t("Category", "Categoría")}
          </Label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="bg-neutral-950 border-neutral-700 text-white"
            placeholder={t("e.g., Old Testament, New Testament", "ej., Antiguo Testamento, Nuevo Testamento")}
          />
        </div>
      </div>

      <div>
        <Label className="block text-sm font-medium text-neutral-300 mb-1">
          {t("Answer Options", "Opciones de Respuesta")} *
        </Label>
        <div className="space-y-2">
          {formData.options.map((option: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-sm text-neutral-400 w-4">{String.fromCharCode(65 + index)}.</span>
              <Input
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 bg-neutral-950 border-neutral-700 text-white"
                placeholder={`Option ${index + 1}`}
                required
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Label className="text-sm text-neutral-300">
            {t("Correct Answer", "Respuesta correcta")}
          </Label>
          <Select
            value={String(formData.correct_answer ?? 0)}
            onValueChange={(value) =>
              setFormData({ ...formData, correct_answer: parseInt(value, 10) || 0 })
            }
          >
            <SelectTrigger className="w-40 bg-neutral-950 border-neutral-700 text-[0.9rem] h-8">
              <SelectValue placeholder={t("Choose option", "Elige opción")} />
            </SelectTrigger>
            <SelectContent className="bg-neutral-950 border-neutral-700 text-[0.9rem]">
              <SelectItem value="0">{t("Option 1", "Opción 1")}</SelectItem>
              <SelectItem value="1">{t("Option 2", "Opción 2")}</SelectItem>
              <SelectItem value="2">{t("Option 3", "Opción 3")}</SelectItem>
              <SelectItem value="3">{t("Option 4", "Opción 4")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="bg-red-600 hover:bg-red-700">
          <Save className="h-4 w-4 mr-2" />
          {editingQuestion ? t("Update", "Actualizar") : t("Add Question", "Agregar Pregunta")}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="border-neutral-700 hover:bg-neutral-800">
          <X className="h-4 w-4 mr-2" />
          {t("Cancel", "Cancelar")}
        </Button>
      </div>
    </form>
  );
}
