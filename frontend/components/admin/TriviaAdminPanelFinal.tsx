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
          {totalPendingOps > 0 && (
            <Button 
              onClick={executeBatchOperations}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {t("Save Changes", "Guardar Cambios")} ({totalPendingOps})
            </Button>
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
          {[...levels, ...pendingOperations.levelsToAdd].filter(level => level.id && !pendingOperations.levelsToDelete.includes(level.id)).map((level) => (
            <div key={level.id} className="border border-neutral-800 rounded-lg bg-neutral-900/50">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{level.name}</h3>
                    {level.description && (
                      <p className="text-sm text-neutral-400 mt-1">{level.description}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {level.time_limit ? `${level.time_limit}s` : t("No limit", "Sin límite")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        {level.passing_score}%
                      </span>
                      <span>{questionsByLevel[level.id || '']?.length || 0} {t("questions", "preguntas")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={showLevelDialog && editingLevel?.id === (level.id || '')} onOpenChange={(open) => {
                      setShowLevelDialog(open);
                      if (!open) setEditingLevel(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setEditingLevel(level)}
                          variant="outline"
                          size="sm"
                          className="border-neutral-700 hover:bg-neutral-800"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{t("Edit Level", "Editar Nivel")}</DialogTitle>
                        </DialogHeader>
                        <LevelForm
                          level={level}
                          onSave={addLevelToBatch}
                          onCancel={() => {
                            setShowLevelDialog(false);
                            setEditingLevel(null);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={() => level.id && deleteLevelFromBatch(level.id)}
                      variant="outline"
                      size="sm"
                      className="border-red-700 hover:bg-red-700 text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Questions Section - Grouped by Level */}
      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">
            {t("Questions by Level", "Preguntas por Nivel")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...levels, ...pendingOperations.levelsToAdd].filter(level => level.id && !pendingOperations.levelsToDelete.includes(level.id)).map((level) => {
            const levelQuestions = [
              ...(questionsByLevel[level.id || ''] || []).filter((question: TriviaQuestion) => !pendingOperations.questionsToDelete.includes(question.id)),
              ...pendingOperations.questionsToAdd.filter(question => question.level_id === level.id),
              ...pendingOperations.questionsToEdit.filter(question => question.level_id === level.id && question.id === 0)
            ].filter((question, index, array) => 
              array.findIndex(q => q.question_en === question.question_en && q.level_id === question.level_id) === index
            );
            const isExpanded = expandedLevels.has(level.id || '');
            
            return (
              <div key={level.id} className="border border-neutral-800 rounded-lg bg-neutral-900/50">
                <div 
                  className="p-4 cursor-pointer hover:bg-neutral-800/50 transition-colors"
                  onClick={() => level.id && toggleLevelExpansion(level.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <h3 className="font-semibold text-white">{level.name}</h3>
                      <span className="text-sm text-neutral-400">({levelQuestions.length} {t("questions", "preguntas")})</span>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingQuestion({
                          id: 0,
                          question_en: '',
                          question_es: '',
                          options_en: ['', '', '', ''],
                          options_es: ['', '', '', ''],
                          correct_answer: 0,
                          category: 'General',
                          level_id: level.id || '',
                          created_at: '',
                          updated_at: ''
                        });
                        setShowQuestionDialog(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="border-neutral-700 hover:bg-neutral-800"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {t("Add", "Agregar")}
                    </Button>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t border-neutral-800">
                    {levelQuestions.length === 0 ? (
                      <div className="p-4 text-center text-neutral-400">
                        {t("No questions in this level yet.", "No hay preguntas en este nivel aún.")}
                      </div>
                    ) : (
                      <div className="space-y-2 p-4">
                        {levelQuestions.filter(question => !pendingOperations.questionsToDelete.includes(question.id)).map((question) => {
                          const isUnsaved = question.id === 0 || !question.id;
                          return (
                          <div key={`${question.id || 'temp'}-${question.question_en}`} className={`border ${isUnsaved ? 'border-yellow-600 bg-yellow-900/20' : 'border-neutral-700 bg-neutral-800/50'} rounded p-3`}>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-white font-medium">
                                  {language === 'es' ? question.question_es : question.question_en}
                                  {isUnsaved && <span className="ml-2 text-xs text-yellow-400">({t("Unsaved", "No guardado")})</span>}
                                </p>
                                <p className="text-xs text-neutral-400 mt-1">
                                  {t("Category", "Categoría")}: {question.category || 'General'} | 
                                  {t("Correct Answer", "Respuesta Correcta")}: {String.fromCharCode(65 + (question.correct_answer || 0))}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Dialog open={showQuestionDialog && editingQuestion?.id === question.id} onOpenChange={(open) => {
                                  setShowQuestionDialog(open);
                                  if (!open) setEditingQuestion(null);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button
                                      onClick={() => setEditingQuestion(question as TriviaQuestion)}
                                      variant="outline"
                                      size="sm"
                                      className="border-neutral-700 hover:bg-neutral-800"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-neutral-900 border-neutral-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>{t("Edit Question", "Editar Pregunta")}</DialogTitle>
                                    </DialogHeader>
                                    <QuestionForm
                                      question={question as TriviaQuestion}
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
                                <Button
                                  onClick={() => deleteQuestionFromBatch(question.id || 0)}
                                  variant="outline"
                                  size="sm"
                                  className="border-red-700 hover:bg-red-700 text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
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
              <input
                type="radio"
                name="correct_answer"
                checked={formData.correct_answer === index}
                onChange={() => setFormData({ ...formData, correct_answer: index })}
                className="border-neutral-700 bg-neutral-950"
              />
            </div>
          ))}
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
