import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "../../contexts/LanguageContext";
import { Plus, Edit2, Trash2, Save, X, Brain, Clock, Target, ChevronDown, ChevronRight, AlertCircle, Check, Globe } from "lucide-react";

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
  id: number | string;
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
  const [status, setStatus] = useState<string>('');
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set());
  // State for tracking local changes vs server data
  const [localLevels, setLocalLevels] = useState<TriviaLevel[]>([]);
  const [localQuestions, setLocalQuestions] = useState<TriviaQuestion[]>([]);
  const [initialLevels, setInitialLevels] = useState<TriviaLevel[]>([]);
  const [initialQuestions, setInitialQuestions] = useState<TriviaQuestion[]>([]);
  
  // Track staged deletions
  const [stagedLevelDeletions, setStagedLevelDeletions] = useState<Set<string>>(new Set());
  const [stagedQuestionDeletions, setStagedQuestionDeletions] = useState<Set<number>>(new Set());

  // Track which items are new (for highlighting)
  const [newLevelIds, setNewLevelIds] = useState<Set<string>>(new Set());
  const [newQuestionTempIds, setNewQuestionTempIds] = useState<Set<string>>(new Set());
  
  // Translation toggle
  const [showTranslations, setShowTranslations] = useState(false);
  
  // State for the "Quick Add" row in each level
  const [quickAddQuestions, setQuickAddQuestions] = useState<Record<string, Partial<TriviaQuestion>>>({});

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
      setLoading(true);
      const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";
      const response = await fetch(`${base}/trivia/simple`);
      const data = await response.json();
      
      const fetchedLevels = data.levels || [];
      const fetchedQuestions = (data.questions || []).map((q: any) => ({
        ...q,
        correct_answer: Number(q.correct_answer) - 1, // Convert 1-based (DB) to 0-based (App)
        options_en: typeof q.options_en === 'string' ? JSON.parse(q.options_en) : (q.options_en || ['', '', '', '']),
        options_es: typeof q.options_es === 'string' ? JSON.parse(q.options_es) : (q.options_es || ['', '', '', '']),
      }));
      
      setInitialLevels(fetchedLevels);
      setInitialQuestions(fetchedQuestions);
      setLocalLevels(JSON.parse(JSON.stringify(fetchedLevels)));
      setLocalQuestions(JSON.parse(JSON.stringify(fetchedQuestions)));
      
      // Reset staging
      setStagedLevelDeletions(new Set());
      setStagedQuestionDeletions(new Set());
      setNewLevelIds(new Set());
      setNewQuestionTempIds(new Set());
      setQuickAddQuestions({});
      
      console.log('=== DATA LOAD COMPLETE ===');
    } catch (error) {
      console.error('Failed to load trivia data:', error);
      setStatus('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if anything has changed
  const hasChanges = () => {
    if (stagedLevelDeletions.size > 0 || stagedQuestionDeletions.size > 0) return true;
    if (newLevelIds.size > 0 || newQuestionTempIds.size > 0) return true;
    
    // Check for level edits
    const levelsEdited = localLevels.some(local => {
      const initial = initialLevels.find(i => i.id === local.id);
      if (!initial) return false;
      return (
        local.name !== initial.name ||
        local.description !== initial.description ||
        local.time_limit !== initial.time_limit ||
        local.passing_score !== initial.passing_score ||
        local.shuffle_questions !== initial.shuffle_questions
      );
    });
    if (levelsEdited) return true;
    
    // Check for question edits
    const questionsEdited = localQuestions.some(local => {
      if (typeof local.id === 'string' && (local.id as string).includes('temp')) return true; // It's new
      const initial = initialQuestions.find(i => i.id === local.id);
      if (!initial) return false;
      
      const optsEnChanged = JSON.stringify(local.options_en) !== JSON.stringify(initial.options_en);
      const optsEsChanged = JSON.stringify(local.options_es) !== JSON.stringify(initial.options_es);
      
      return (
        local.question_en !== initial.question_en ||
        local.question_es !== initial.question_es ||
        local.correct_answer !== initial.correct_answer ||
        local.category !== initial.category ||
        local.level_id !== initial.level_id ||
        optsEnChanged ||
        optsEsChanged
      );
    });
    
    return questionsEdited;
  };

  const handleLevelChange = (id: string, field: keyof TriviaLevel, value: any) => {
    setLocalLevels(prev => prev.map(level => 
      level.id === id ? { ...level, [field]: value } : level
    ));
  };

  const handleQuestionChange = (id: number | string, field: keyof TriviaQuestion, value: any) => {
    setLocalQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value, correct_answer: 0 } : q
    ));
  };

  const handleOptionChange = (qId: number | string, lang: 'en' | 'es', index: number, value: string) => {
    setLocalQuestions(prev => prev.map(q => {
      if (q.id === qId) {
        if (lang === 'en') {
          const newOptionsEn = [...(q.options_en as string[])];
          newOptionsEn[index] = value;
          // If Spanish is empty or a copy of English, keep them synced
          const newOptionsEs = [...(q.options_es as string[])];
          if (!newOptionsEs[index] || newOptionsEs[index] === (q.options_en as string[])[index]) {
            newOptionsEs[index] = value;
          }
          return { ...q, options_en: newOptionsEn, options_es: newOptionsEs };
        } else {
          const newOptionsEs = [...(q.options_es as string[])];
          newOptionsEs[index] = value;
          return { ...q, options_es: newOptionsEs };
        }
      }
      return q;
    }));
  };

  const stageLevelDelete = (id: string) => {
    const isNew = newLevelIds.has(id);
    if (isNew) {
      // Just remove from local state
      setLocalLevels(prev => prev.filter(l => l.id !== id));
      setNewLevelIds(prev => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
    } else {
      setStagedLevelDeletions(prev => new Set(prev).add(id));
    }
  };

  const stageQuestionDelete = (id: number | string) => {
    if (typeof id === 'string' && (id as string).includes('temp')) {
      // Just remove from local state
      setLocalQuestions(prev => prev.filter(q => (q.id as any) !== id));
      setNewQuestionTempIds(prev => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
    } else {
      setStagedQuestionDeletions(prev => new Set(prev).add(id as number));
    }
  };

  const addLocalQuestion = (levelId: string) => {
    const draft = quickAddQuestions[levelId];
    if (!draft || !draft.question_en) return;

    const tempId = `temp-${Date.now()}`;
    const newQ: TriviaQuestion = {
      id: tempId as any,
      question_en: draft.question_en,
      question_es: draft.question_es || draft.question_en,
      options_en: draft.options_en || ['', '', '', ''],
      options_es: draft.options_es || draft.options_en || ['', '', '', ''],
      correct_answer: 0, // Always Option A
      category: draft.category || 'General',
      level_id: levelId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setLocalQuestions(prev => [...prev, newQ]);
    setNewQuestionTempIds(prev => new Set(prev).add(tempId));
    
    // Clear the quick-add row for this level
    setQuickAddQuestions(prev => {
      const updated = { ...prev };
      delete updated[levelId];
      return updated;
    });
  };

  const updateQuickAddDraft = (levelId: string, field: string, value: any) => {
    setQuickAddQuestions(prev => ({
      ...prev,
      [levelId]: {
        ...(prev[levelId] || { options_en: ['', '', '', ''], correct_answer: 0 }),
        [field]: value
      }
    }));
  };

  const updateQuickAddOption = (levelId: string, lang: 'en' | 'es', index: number, value: string) => {
    setQuickAddQuestions(prev => {
      const draft = prev[levelId] || { options_en: ['', '', '', ''], options_es: ['', '', '', ''], correct_answer: 0 };
      if (lang === 'en') {
        const newOptionsEn = [...(draft.options_en as string[])];
        newOptionsEn[index] = value;
        const newOptionsEs = [...(draft.options_es as string[])];
        if (!newOptionsEs[index] || newOptionsEs[index] === (draft.options_en as string[])[index]) {
          newOptionsEs[index] = value;
        }
        return {
          ...prev,
          [levelId]: { ...draft, options_en: newOptionsEn, options_es: newOptionsEs }
        };
      } else {
        const newOptionsEs = [...(draft.options_es as string[])];
        newOptionsEs[index] = value;
        return {
          ...prev,
          [levelId]: { ...draft, options_es: newOptionsEs }
        };
      }
    });
  };


  const executeBatchOperations = async () => {
    if (!passcode) {
      setStatus('Admin passcode required');
      return;
    }

    const base = import.meta.env.DEV ? "http://127.0.0.1:4000" : "https://prod-cne-sh82.encr.app";
    setStatus('Saving changes...');

    try {
      // 1. Process Level Deletions
      for (const id of Array.from(stagedLevelDeletions)) {
        await fetch(`${base}/trivia/simple/level/${id}?passcode=${passcode}`, { method: 'DELETE' });
      }

      // 2. Process Question Deletions
      for (const id of Array.from(stagedQuestionDeletions)) {
        await fetch(`${base}/trivia/simple/question/${id}?passcode=${passcode}`, { method: 'DELETE' });
      }

      // 3. Process Levels (Add or Update)
      for (const level of localLevels) {
        const isNew = newLevelIds.has(level.id);
        const initial = initialLevels.find(i => i.id === level.id);
        const isChanged = !isNew && (
          level.name !== initial?.name ||
          level.description !== initial?.description ||
          level.time_limit !== initial?.time_limit ||
          level.passing_score !== initial?.passing_score ||
          level.shuffle_questions !== initial?.shuffle_questions
        );

        if (isNew || isChanged) {
          const payload = {
            id: level.id,
            name: level.name,
            description: level.description || null,
            shuffle_questions: level.shuffle_questions,
            time_limit: level.time_limit === null ? 0 : level.time_limit,
            passing_score: level.passing_score
          };
          await fetch(`${base}/trivia/simple/level`, {
            method: 'POST', // Re-using POST for upsert if backend supports it, otherwise would need PUT
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      }

      // 4. Process Questions (Add or Update)
      for (const q of localQuestions) {
        const isNew = typeof q.id === 'string' && (q.id as string).includes('temp');
        const initial = !isNew ? initialQuestions.find(i => i.id === q.id) : null;
        
        let isChanged = false;
        if (!isNew && initial) {
          isChanged = (
            q.question_en !== initial.question_en ||
            q.correct_answer !== initial.correct_answer ||
            q.category !== initial.category ||
            q.level_id !== initial.level_id ||
            JSON.stringify(q.options_en) !== JSON.stringify(initial.options_en)
          );
        }

        if (isNew || isChanged) {
          // If update (isChanged), we might need to delete first if the backend doesn't have a PUT
          if (isChanged && q.id) {
            await fetch(`${base}/trivia/simple/question/${q.id}?passcode=${passcode}`, { method: 'DELETE' });
          }

          const payload = {
            question_en: q.question_en,
            question_es: q.question_es || q.question_en,
            options_en: q.options_en,
            options_es: q.options_es || q.options_en,
            correct_answer: Number(q.correct_answer) + 1, // Convert 0-based to 1-based for DB
            reference: q.reference || null,
            category: q.category || 'General',
            level_id: q.level_id
          };
          await fetch(`${base}/trivia/simple/question`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        }
      }

      setStatus('All changes saved successfully!');
      setTimeout(() => setStatus(''), 3000);
      loadData();
    } catch (error) {
      console.error('Batch save failed:', error);
      setStatus('Some changes failed to save');
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
  const questionsByLevel = localQuestions.reduce((acc, question) => {
    if (stagedQuestionDeletions.has(question.id as number)) return acc;
    if (!acc[question.level_id]) {
      acc[question.level_id] = [];
    }
    acc[question.level_id].push(question);
    return acc;
  }, {} as Record<string, TriviaQuestion[]>);

  const pendingCount = 
    stagedLevelDeletions.size + 
    stagedQuestionDeletions.size + 
    newLevelIds.size + 
    newQuestionTempIds.size +
    localLevels.filter(l => !newLevelIds.has(l.id) && JSON.stringify(l) !== JSON.stringify(initialLevels.find(i => i.id === l.id))).length +
    localQuestions.filter(q => typeof q.id !== 'string' && JSON.stringify(q) !== JSON.stringify(initialQuestions.find(i => i.id === q.id))).length;

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
        <CardHeader className="border-b border-neutral-800">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span>{t("Levels", "Niveles")}</span>
              {hasChanges() && (
                <span className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-wider text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20">
                  <AlertCircle className="h-3 w-3" />
                  {t("Unsaved Changes", "Cambios sin guardar")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowTranslations(!showTranslations)}
                className={`flex items-center gap-2 text-[0.7rem] uppercase font-bold px-2 h-7 ${showTranslations ? 'text-red-400 bg-red-400/10 border-red-400/20 border' : 'text-neutral-500 border-neutral-800 border'}`}
              >
                <Globe className="h-3.5 w-3.5" />
                {t("Show Spanish", "Mostrar Español")}
              </Button>
              <Button 
                onClick={executeBatchOperations}
                disabled={!hasChanges()}
                className="bg-green-600 hover:bg-green-700 h-9"
              >
                <Save className="h-4 w-4 mr-2" />
                {t("Save All Changes", "Guardar Todos los Cambios")}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const confirmed = window.confirm(t("Discard all unsaved changes?", "¿Descartar todos los cambios sin guardar?"));
                  if (confirmed) loadData();
                }}
                disabled={!hasChanges()}
                className="border-neutral-700 hover:bg-neutral-800 h-9"
              >
                <X className="h-4 w-4 mr-2" />
                {t("Discard", "Descartar")}
              </Button>
              <Button 
                onClick={() => {
                  const name = prompt(t("Level name:", "Nombre del nivel:"));
                  if (name) {
                    const id = name.toLowerCase().replace(/\s+/g, '-');
                    const newLevel: TriviaLevel = {
                      id,
                      name,
                      description: '',
                      shuffle_questions: true,
                      time_limit: 30,
                      passing_score: 70,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    };
                    setLocalLevels(prev => [...prev, newLevel]);
                    setNewLevelIds(prev => new Set(prev).add(id));
                    setExpandedLevels(prev => new Set(prev).add(id));
                  }
                }}
                className="bg-red-600 hover:bg-red-700 h-9"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("Add Level", "Agregar Nivel")}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {localLevels
            .filter(l => !stagedLevelDeletions.has(l.id))
            .map((level) => {
              const levelId = level.id;
              const isExpanded = expandedLevels.has(levelId);
              const isNew = newLevelIds.has(levelId);
              const levelQuestions = questionsByLevel[levelId] || [];
              const draft = quickAddQuestions[levelId] || { question_en: '', options_en: ['', '', '', ''], correct_answer: 0 };
              
              return (
                <div key={levelId} className={`border-b border-neutral-800 last:border-0 ${isNew ? 'bg-red-950/5' : ''}`}>
                  <div className="p-4 hover:bg-neutral-800/30 transition-colors flex items-center justify-between">
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-3 text-left group"
                      onClick={() => toggleLevelExpansion(levelId)}
                    >
                      <div className="text-neutral-500 group-hover:text-white transition-colors">
                        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white group-hover:text-red-400 transition-colors">{level.name}</h3>
                          {isNew && <span className="text-[0.6rem] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">New</span>}
                        </div>
                        <p className="text-xs text-neutral-500">
                          {levelQuestions.length} {t("questions", "preguntas")} • {level.time_limit}s • {level.passing_score}% {t("to pass", "para ganar")}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                       <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-500 hover:text-red-400 hover:bg-red-950/30"
                        onClick={(e) => {
                          e.stopPropagation();
                          stageLevelDelete(levelId);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 space-y-6">
                      {/* Level Stats Editor */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-neutral-950/50 p-4 rounded-lg border border-neutral-800">
                        <div className="space-y-1">
                          <Label className="text-[0.7rem] uppercase font-bold text-neutral-500">{t("Level Name", "Nombre")}</Label>
                          <Input
                            value={level.name}
                            onChange={e => handleLevelChange(levelId, 'name', e.target.value)}
                            className="bg-neutral-900 border-neutral-800 text-white h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[0.7rem] uppercase font-bold text-neutral-500">{t("Time (sec)", "Tiempo (seg)")}</Label>
                          <Input
                            type="number"
                            value={level.time_limit || 0}
                            onChange={e => handleLevelChange(levelId, 'time_limit', parseInt(e.target.value) || 0)}
                            className="bg-neutral-900 border-neutral-800 text-white h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[0.7rem] uppercase font-bold text-neutral-500">{t("Pass Score %", "Aprobación %")}</Label>
                          <Input
                            type="number"
                            value={level.passing_score}
                            onChange={e => handleLevelChange(levelId, 'passing_score', parseInt(e.target.value) || 0)}
                            className="bg-neutral-900 border-neutral-800 text-white h-9"
                          />
                        </div>
                        <div className="flex flex-col justify-end gap-2 pb-1">
                          <Label className="text-[0.7rem] uppercase font-bold text-neutral-500 flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={level.shuffle_questions}
                              onChange={e => handleLevelChange(levelId, 'shuffle_questions', e.target.checked)}
                              className="rounded border-neutral-800 bg-neutral-900"
                            />
                            {t("Shuffle", "Mezclar")}
                          </Label>
                        </div>
                        <div className="md:col-span-4 space-y-1">
                          <Label className="text-[0.7rem] uppercase font-bold text-neutral-500">{t("Description", "Descripción")}</Label>
                          <Input
                            value={level.description || ''}
                            onChange={e => handleLevelChange(levelId, 'description', e.target.value)}
                            className="bg-neutral-900 border-neutral-800 text-white h-9"
                            placeholder={t("Level description...", "Descripción del nivel...")}
                          />
                        </div>
                      </div>

                      {/* Question List */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                          <h4 className="text-sm font-bold text-neutral-300 flex items-center gap-2">
                            <Brain className="h-4 w-4 text-red-400" />
                            {t("Questions", "Preguntas")}
                          </h4>
                        </div>
                        
                        <div className="space-y-4">
                          {levelQuestions.map((q, qIndex) => (
                            <div key={q.id} className="relative group/q bg-neutral-900/40 p-4 rounded-lg border border-neutral-800 hover:border-neutral-700 transition-colors">
                              <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-4 mb-3">
                                      <div className="flex-1 space-y-2">
                                        <div className="grid grid-cols-[1fr_200px] gap-2">
                                          <Input
                                            value={q.question_en}
                                            onChange={e => {
                                              handleQuestionChange(q.id, 'question_en', e.target.value);
                                              if (!q.question_es || q.question_es === q.question_en) {
                                                handleQuestionChange(q.id, 'question_es', e.target.value);
                                              }
                                            }}
                                            className="bg-neutral-950 border-neutral-800 text-white font-medium italic h-9"
                                            placeholder={t("Question text (EN)...", "Texto de la pregunta (ING)...")}
                                          />
                                          <Input
                                            value={q.category || 'General'}
                                            onChange={e => handleQuestionChange(q.id, 'category', e.target.value)}
                                            className="bg-neutral-950 border-neutral-800 text-neutral-400 font-bold uppercase text-[0.6rem] h-9"
                                            placeholder={t("Category...", "Categoría...")}
                                          />
                                        </div>
                                        <div className="grid grid-cols-[1fr_200px] gap-2">
                                          {showTranslations && (
                                            <Input
                                              value={q.question_es || ''}
                                              onChange={e => handleQuestionChange(q.id, 'question_es', e.target.value)}
                                              className="bg-neutral-950/50 border-neutral-800 text-neutral-300 font-medium italic h-8 border-dashed"
                                              placeholder={t("Spanish translation...", "Traducción al español...")}
                                            />
                                          )}
                                          <Input
                                            value={q.reference || ''}
                                            onChange={e => handleQuestionChange(q.id, 'reference', e.target.value)}
                                            className="bg-neutral-950 border-neutral-800 text-blue-400/70 text-[0.65rem] h-8 border-dashed"
                                            placeholder={t("Biblical Reference (e.g., John 3:16)...", "Referencia (ej., Juan 3:16)...")}
                                          />
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                          <Label className="text-[0.6rem] uppercase text-neutral-500 whitespace-nowrap">Level:</Label>
                                          <Select 
                                            value={q.level_id} 
                                            onValueChange={val => handleQuestionChange(q.id, 'level_id', val)}
                                          >
                                            <SelectTrigger className="bg-neutral-950 border-neutral-800 h-9 text-[0.65rem] w-28">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-neutral-950 border-neutral-800 text-white">
                                              {localLevels.map(l => (
                                                <SelectItem key={l.id} value={l.id} className="text-xs">{l.name}</SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <div className="bg-green-600/20 text-green-400 px-3 h-9 rounded-md border border-green-600/30 flex items-center gap-2 text-[0.6rem] font-bold uppercase w-full">
                                            <Check className="h-3.5 w-3.5" />
                                            {t("Correct Answer: Option A", "Respuesta Correcta: Opción A")}
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-neutral-600 hover:text-red-400 opacity-0 group-hover/q:opacity-100 transition-opacity"
                                            onClick={() => stageQuestionDelete(q.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {(q.options_en as string[]).map((opt, oIdx) => (
                                    <div key={oIdx} className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <span className={`text-[0.6rem] font-bold w-4 h-4 flex items-center justify-center rounded-sm ${oIdx === 0 ? 'bg-green-600 text-white' : 'bg-neutral-800 text-neutral-500'}`}>
                                          {String.fromCharCode(65 + oIdx)}
                                        </span>
                                        <Input
                                          value={opt}
                                          onChange={e => handleOptionChange(q.id, 'en', oIdx, e.target.value)}
                                          className="bg-neutral-950 border-neutral-800 text-xs h-7"
                                          placeholder={t("Option (EN)", "Opción (ING)")}
                                        />
                                      </div>
                                      {showTranslations && (
                                        <Input
                                          value={(q.options_es as string[])[oIdx] || ''}
                                          onChange={e => handleOptionChange(q.id, 'es', oIdx, e.target.value)}
                                          className="bg-neutral-950/30 border-neutral-800/50 text-[0.65rem] h-6 border-dashed ml-6"
                                          placeholder={t("Option (ES)", "Opción (ESP)")}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Quick Add Row */}
                        <div className="bg-red-950/5 border border-dashed border-red-900/30 p-4 rounded-lg space-y-3">
                          <Label className="text-[0.65rem] font-bold uppercase text-red-400/60 block mb-1">{t("Quickly add new question", "Agregar nueva pregunta rápido")}</Label>
                          <div className="flex gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="grid grid-cols-[1fr_200px] gap-2">
                                <Input
                                  value={draft.question_en}
                                  onChange={e => {
                                    updateQuickAddDraft(levelId, 'question_en', e.target.value);
                                    if (!draft.question_es || draft.question_es === draft.question_en) {
                                      updateQuickAddDraft(levelId, 'question_es', e.target.value);
                                    }
                                  }}
                                  className="bg-neutral-950 border-neutral-800 text-white font-medium h-9"
                                  placeholder={t("New question (EN)...", "Nueva pregunta (ING)...")}
                                  onKeyDown={e => e.key === 'Enter' && addLocalQuestion(levelId)}
                                />
                                <Input
                                  value={draft.category || 'General'}
                                  onChange={e => updateQuickAddDraft(levelId, 'category', e.target.value)}
                                  className="bg-neutral-950 border-neutral-800 text-neutral-400 font-bold uppercase text-[0.6rem] h-9"
                                  placeholder={t("Category...", "Categoría...")}
                                />
                              </div>
                              <div className="grid grid-cols-[1fr_200px] gap-2">
                                {showTranslations && (
                                  <Input
                                    value={draft.question_es || ''}
                                    onChange={e => updateQuickAddDraft(levelId, 'question_es', e.target.value)}
                                    className="bg-neutral-950/50 border-neutral-800 text-neutral-300 font-medium italic h-8 border-dashed"
                                    placeholder={t("Spanish translation...", "Traducción al español...")}
                                  />
                                )}
                                <Input
                                  value={draft.reference || ''}
                                  onChange={e => updateQuickAddDraft(levelId, 'reference', e.target.value)}
                                  className="bg-neutral-950 border-neutral-800 text-blue-400/70 text-[0.65rem] h-8 border-dashed"
                                  placeholder={t("Reference (e.g., Genesis 1:1)...", "Referencia (ej., Génesis 1:1)...")}
                                />
                              </div>
                            </div>
                            <Button 
                              onClick={() => addLocalQuestion(levelId)}
                              disabled={!draft.question_en}
                              className="bg-red-600 hover:bg-red-700 h-9"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {t("Add", "Agregar")}
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {(draft.options_en as string[]).map((opt, oIdx) => (
                              <div key={oIdx} className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[0.6rem] font-bold text-neutral-500">{String.fromCharCode(65 + oIdx)}</span>
                                  {oIdx === 0 && (
                                    <span className="text-[0.55rem] font-bold text-green-500 uppercase">{t("Correct", "Correcto")}</span>
                                  )}
                                </div>
                                <Input
                                  value={opt}
                                  onChange={e => updateQuickAddOption(levelId, 'en', oIdx, e.target.value)}
                                  className="bg-neutral-950 border-neutral-800 text-xs h-7"
                                  placeholder={t("Option (EN)", "Opción (ING)")}
                                />
                                {showTranslations && (
                                  <Input
                                    value={(draft.options_es as string[])?.[oIdx] || ''}
                                    onChange={e => updateQuickAddOption(levelId, 'es', oIdx, e.target.value)}
                                    className="bg-neutral-950/30 border-neutral-800/50 text-[0.65rem] h-6 border-dashed"
                                    placeholder={t("Option (ES)", "Opción (ESP)")}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </CardContent>
      </Card>

    </div>
  );
}

