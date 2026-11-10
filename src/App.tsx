/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { TopNav, NavTab } from './components/TopNav';
import { PlaygroundView } from './components/PlaygroundView';
import { SchemaBuilderView } from './components/SchemaBuilderView';
import { ToolsSandboxView } from './components/ToolsSandboxView';
import { BenchmarkView } from './components/BenchmarkView';
import { CodeExportView } from './components/CodeExportView';
import { SavePromptModal } from './components/SavePromptModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { AdvancedAlgorithmsView } from './components/AdvancedAlgorithmsView';
import { AgenticWorkspaceView } from './components/AgenticWorkspaceView';
import { GuardrailsSecurityView } from './components/GuardrailsSecurityView';
import { XaiNeuroSymbolicView } from './components/XaiNeuroSymbolicView';
import { RagRepoIntelligenceView } from './components/RagRepoIntelligenceView';
import {
  ModelName,
  ThinkingLevelOption,
  ExecutionLog,
  FunctionTool,
  SavedPrompt,
  AgentTaskNode,
  GuardrailEvaluation,
  XaiTokenAttribution,
  NeuroSymbolicConstraint,
  ContextualRoutingAnalysis,
} from './types/aiDev';
import { PROMPT_PRESETS } from './data/presets';
import { getSavedPrompts, savePrompt, saveNewPromptVersion, deleteSavedPrompt } from './utils/savedPromptsStorage';
import { AlertCircle, X, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('playground');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Favorites in localStorage state with versioning tracking
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>(() => getSavedPrompts());
  const [currentLoadedPromptId, setCurrentLoadedPromptId] = useState<string | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Playground state
  const defaultPreset = PROMPT_PRESETS[0];
  const [model, setModel] = useState<ModelName>(defaultPreset.model);
  const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevelOption>(defaultPreset.thinkingLevel);
  const [systemInstruction, setSystemInstruction] = useState<string>(defaultPreset.systemInstruction);
  const [prompt, setPrompt] = useState<string>(defaultPreset.userPrompt);
  const [variables, setVariables] = useState<Record<string, string>>(defaultPreset.variables);

  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastLog, setLastLog] = useState<ExecutionLog | undefined>();
  const [history, setHistory] = useState<ExecutionLog[]>([]);

  // Schema builder state
  const [schemaResult, setSchemaResult] = useState<string>('');
  const [currentSchema, setCurrentSchema] = useState<any>(null);

  // Global Error state
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Sync theme with DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Helper to replace {{variables}} in prompt
  const interpolatePrompt = useCallback((template: string, vars: Record<string, string>): string => {
    let result = template;
    for (const [key, val] of Object.entries(vars)) {
      result = result.split(`{{${key}}}`).join(val || '');
    }
    return result;
  }, []);

  // Main execution for Playground
  const handleExecutePlayground = async () => {
    if (isRunning) return;
    setErrorBanner(null);
    setIsRunning(true);

    const interpolatedPrompt = interpolatePrompt(prompt, variables);
    const interpolatedSys = interpolatePrompt(systemInstruction, variables);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: interpolatedPrompt,
          systemInstruction: interpolatedSys,
          thinkingLevel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération avec le modèle');
      }

      setOutput(data.text);

      const newLog: ExecutionLog = {
        id: `run-${Date.now()}`,
        timestamp: new Date().toISOString(),
        model,
        prompt: interpolatedPrompt,
        systemInstruction: interpolatedSys,
        thinkingLevel,
        output: data.text,
        durationMs: data.durationMs,
        ttftMs: data.ttftMs ?? Math.round(data.durationMs * 0.35),
        tokens: {
          prompt: data.usage?.promptTokenCount || 0,
          completion: data.usage?.candidatesTokenCount || 0,
          total: data.usage?.totalTokenCount || 0,
        },
        mode: 'playground',
      };

      setLastLog(newLog);
      setHistory((prev) => [newLog, ...prev.slice(0, 49)]);
    } catch (err: any) {
      setErrorBanner(err.message || 'Impossible de joindre le serveur API');
    } finally {
      setIsRunning(false);
    }
  };

  // Execution for Schema Builder
  const handleExecuteSchema = async (schema: any, testPrompt: string) => {
    if (isRunning) return;
    setErrorBanner(null);
    setIsRunning(true);
    setCurrentSchema(schema);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3.8-flash',
          prompt: testPrompt,
          responseMimeType: 'application/json',
          responseSchema: schema,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la validation du schéma');
      }

      setSchemaResult(data.text);
    } catch (err: any) {
      setErrorBanner(err.message || 'Échec de génération du schéma JSON');
    } finally {
      setIsRunning(false);
    }
  };

  // Execution for Tools / Function Calling
  const handleExecuteTools = async (toolsPrompt: string, tools: FunctionTool[]) => {
    setErrorBanner(null);
    setIsRunning(true);
    try {
      const functionDeclarations = tools.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      }));

      const response = await fetch('/api/gemini/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-3.8-flash',
          prompt: toolsPrompt,
          functionDeclarations,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'appel d'outils");
      }

      return data;
    } catch (err: any) {
      setErrorBanner(err.message || "Erreur d'exécution de la simulation d'outils");
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  // Execution for Benchmark A/B
  const handleRunBenchmark = async (variantA: any, variantB: any) => {
    setErrorBanner(null);
    setIsRunning(true);
    try {
      const response = await fetch('/api/gemini/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantA, variantB }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du benchmark comparatif');
      }

      return data;
    } catch (err: any) {
      setErrorBanner(err.message || 'Impossible d’exécuter le benchmark comparatif');
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  // Favorites Handlers (localStorage persistence with v1, v2... versioning)
  const handleSaveNewFavorite = (meta: {
    title: string;
    description: string;
    category: string;
    changeNote?: string;
  }) => {
    const saved = savePrompt({
      title: meta.title,
      description: meta.description,
      category: meta.category,
      changeNote: meta.changeNote,
      model,
      thinkingLevel,
      systemInstruction,
      prompt,
      variables,
    });
    setSavedPrompts(getSavedPrompts());
    setCurrentLoadedPromptId(saved.id);
    showToast(`Prompt « ${saved.title} » (v1) sauvegardé dans vos favoris !`);
  };

  const handleSavePromptVersion = (
    targetPromptId: string,
    meta: {
      changeNote: string;
      title?: string;
      description?: string;
      category?: string;
    }
  ) => {
    const { updatedPrompts, targetPrompt } = saveNewPromptVersion(targetPromptId, {
      title: meta.title,
      description: meta.description,
      category: meta.category,
      changeNote: meta.changeNote,
      model,
      thinkingLevel,
      systemInstruction,
      prompt,
      variables,
    });
    setSavedPrompts(updatedPrompts);
    setCurrentLoadedPromptId(targetPrompt.id);
    showToast(`Version v${targetPrompt.version} enregistrée pour « ${targetPrompt.title} » !`);
  };

  const handleLoadFavorite = (saved: SavedPrompt) => {
    setModel(saved.model);
    setThinkingLevel(saved.thinkingLevel);
    setSystemInstruction(saved.systemInstruction);
    setPrompt(saved.prompt);
    setVariables(saved.variables || {});
    setCurrentLoadedPromptId(saved.id);
    showToast(`Prompt « ${saved.title} » (v${saved.version || 1}) chargé dans le Playground.`);
  };

  const handleDeleteFavorite = (id: string) => {
    const updated = deleteSavedPrompt(id);
    setSavedPrompts(updated);
    showToast('Prompt favori supprimé.');
  };

  const handleImportFavorites = (imported: SavedPrompt[]) => {
    const current = getSavedPrompts();
    const merged = [...imported, ...current];
    const unique = Array.from(new Map(merged.map((item) => [item.id, item])).values());
    try {
      localStorage.setItem('promptforge_favorite_prompts_v1', JSON.stringify(unique));
      setSavedPrompts(unique);
      showToast(`${imported.length} favori(s) importé(s) avec succès.`);
    } catch (e) {
      setErrorBanner('Erreur lors de l’import des favoris.');
    }
  };

  // 1. Agentic Workspaces & Supervisory Decomposer
  const handleDecomposeMission = async (missionText: string) => {
    setIsRunning(true);
    setErrorBanner(null);
    try {
      const response = await fetch('/api/gemini/agent-decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mission: missionText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur de décomposition');
      showToast('Mission décomposée en graphe de tâches DAG.');
      return data;
    } catch (err: any) {
      setErrorBanner(err.message || 'Échec de la décomposition de mission');
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  // 2. Guardrails & Proactive Security Scanner
  const handleEvaluateSecurity = async (promptText: string) => {
    setIsRunning(true);
    setErrorBanner(null);
    try {
      const response = await fetch('/api/gemini/guardrails-eval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur d’analyse de sécurité');
      showToast('Audit de sécurité et scan PII terminés.');
      return data;
    } catch (err: any) {
      setErrorBanner(err.message || 'Échec de l’évaluation des guardrails');
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  // 3. XAI & Neuro-Symbolic Analysis
  const handleAnalyzeXai = async (xaiPrompt: string) => {
    setIsRunning(true);
    setErrorBanner(null);
    try {
      const response = await fetch('/api/gemini/xai-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: xaiPrompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur d’analyse XAI');
      showToast('Attribution XAI et solveur symbolique calculés.');
      return data;
    } catch (err: any) {
      setErrorBanner(err.message || 'Échec de l’analyse XAI');
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  // 4. Contextual Routing & Repository Intelligence
  const handleAnalyzeRouting = async (routingPrompt: string) => {
    setIsRunning(true);
    setErrorBanner(null);
    try {
      const response = await fetch('/api/gemini/context-routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: routingPrompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur de routage');
      showToast('Routage contextuel et stratégie LLMOps optimisés.');
      return data;
    } catch (err: any) {
      setErrorBanner(err.message || 'Échec du routage contextuel');
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  const handleApplySanitizedToPlayground = (sanitized: string) => {
    setPrompt(sanitized);
    setActiveTab('playground');
    showToast('Prompt assaini injecté dans le Playground.');
  };

  // 5. Advanced Algorithms & Quantum Neuro-Symbolic
  const handleRunAlgorithm = async (mode: string, payload: any) => {
    setIsRunning(true);
    setErrorBanner(null);
    try {
      const response = await fetch('/api/gemini/advanced-algorithms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, payload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors du calcul algorithmique');
      showToast('Calcul algorithmique neuro-symbolique exécuté avec succès.');
      return data;
    } catch (err: any) {
      setErrorBanner(err.message || 'Échec du calcul algorithmique');
      return null;
    } finally {
      setIsRunning(false);
    }
  };

  // Global keydown listener for Ctrl+Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (activeTab === 'playground') {
          handleExecutePlayground();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, prompt, variables, systemInstruction, model, thinkingLevel, isRunning]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Bar following contract */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onExecute={handleExecutePlayground}
        isRunning={isRunning}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xl border border-neutral-700 dark:border-neutral-200 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Error notification banner */}
      {errorBanner && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-mono">{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner(null)}
            className="p-1 hover:bg-red-500/10 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'playground' && (
          <PlaygroundView
            model={model}
            onModelChange={setModel}
            thinkingLevel={thinkingLevel}
            onThinkingLevelChange={setThinkingLevel}
            systemInstruction={systemInstruction}
            onSystemInstructionChange={setSystemInstruction}
            prompt={prompt}
            onPromptChange={setPrompt}
            variables={variables}
            onVariablesChange={setVariables}
            output={output}
            isRunning={isRunning}
            onExecute={handleExecutePlayground}
            lastLog={lastLog}
            history={history}
            onRestoreHistory={(log) => {
              setModel(log.model as ModelName);
              if (log.thinkingLevel) setThinkingLevel(log.thinkingLevel as ThinkingLevelOption);
              if (log.systemInstruction) setSystemInstruction(log.systemInstruction);
              setPrompt(log.prompt);
              setOutput(log.output);
              setLastLog(log);
            }}
            savedPromptsCount={savedPrompts.length}
            onOpenFavorites={() => setIsFavoritesOpen(true)}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
          />
        )}

        {activeTab === 'algo' && (
          <AdvancedAlgorithmsView
            onRunAlgorithm={handleRunAlgorithm}
            isRunning={isRunning}
          />
        )}

        {activeTab === 'agents' && (
          <AgenticWorkspaceView
            onDecomposeMission={handleDecomposeMission}
            isRunning={isRunning}
          />
        )}

        {activeTab === 'guardrails' && (
          <GuardrailsSecurityView
            onEvaluateSecurity={handleEvaluateSecurity}
            onApplySanitizedToPlayground={handleApplySanitizedToPlayground}
            isRunning={isRunning}
          />
        )}

        {activeTab === 'xai' && (
          <XaiNeuroSymbolicView
            onAnalyzeXai={handleAnalyzeXai}
            isRunning={isRunning}
          />
        )}

        {activeTab === 'rag' && (
          <RagRepoIntelligenceView
            onAnalyzeRouting={handleAnalyzeRouting}
            isRunning={isRunning}
          />
        )}

        {activeTab === 'schema' && (
          <SchemaBuilderView
            onExecuteSchema={handleExecuteSchema}
            isRunning={isRunning}
            schemaResult={schemaResult}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsSandboxView
            onExecuteTools={handleExecuteTools}
            isRunning={isRunning}
          />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkView
            onRunBenchmark={handleRunBenchmark}
            isRunning={isRunning}
          />
        )}

        {activeTab === 'export' && (
          <CodeExportView
            model={model}
            systemInstruction={systemInstruction}
            prompt={prompt}
            thinkingLevel={thinkingLevel}
            schema={currentSchema}
          />
        )}
      </main>

      {/* Save Prompt Modal with Versioning */}
      <SavePromptModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSaveNew={handleSaveNewFavorite}
        onSaveVersion={handleSavePromptVersion}
        model={model}
        thinkingLevel={thinkingLevel}
        variableCount={Object.keys(variables).length}
        existingPrompts={savedPrompts}
        currentLoadedPromptId={currentLoadedPromptId}
      />

      {/* Favorites Slide-over Drawer with Version History */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        savedPrompts={savedPrompts}
        onLoadPrompt={handleLoadFavorite}
        onDeletePrompt={handleDeleteFavorite}
        onImportPrompts={handleImportFavorites}
        onOpenNewVersionModal={(targetPrompt) => {
          setCurrentLoadedPromptId(targetPrompt.id);
          setIsSaveModalOpen(true);
        }}
      />
    </div>
  );
}
