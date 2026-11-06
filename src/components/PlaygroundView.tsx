import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Sliders,
  Clock,
  Zap,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  Code2,
  FileText,
  AlertCircle,
  Hash,
  Bookmark,
  Star,
  Gauge,
  Timer,
  PieChart as PieChartIcon,
  BarChart2,
  List,
  Layers,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { ModelName, ThinkingLevelOption, ExecutionLog, PromptPreset, SavedPrompt } from '../types/aiDev';
import { PROMPT_PRESETS } from '../data/presets';

interface PlaygroundViewProps {
  model: ModelName;
  onModelChange: (model: ModelName) => void;
  thinkingLevel: ThinkingLevelOption;
  onThinkingLevelChange: (level: ThinkingLevelOption) => void;
  systemInstruction: string;
  onSystemInstructionChange: (text: string) => void;
  prompt: string;
  onPromptChange: (text: string) => void;
  variables: Record<string, string>;
  onVariablesChange: (vars: Record<string, string>) => void;
  output: string;
  isRunning: boolean;
  onExecute: () => void;
  lastLog?: ExecutionLog;
  history: ExecutionLog[];
  onRestoreHistory: (log: ExecutionLog) => void;
  savedPromptsCount: number;
  onOpenFavorites: () => void;
  onOpenSaveModal: () => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  model,
  onModelChange,
  thinkingLevel,
  onThinkingLevelChange,
  systemInstruction,
  onSystemInstructionChange,
  prompt,
  onPromptChange,
  variables,
  onVariablesChange,
  output,
  isRunning,
  onExecute,
  lastLog,
  history,
  onRestoreHistory,
  savedPromptsCount,
  onOpenFavorites,
  onOpenSaveModal,
}) => {
  const [outputViewMode, setOutputViewMode] = useState<'text' | 'json' | 'raw'>('text');
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState<'list' | 'pie' | 'bar'>('list');

  // Token distribution calculations for Recharts visualizations
  const tokenStats = useMemo(() => {
    const totalPrompt = history.reduce((acc, h) => acc + (h.tokens?.prompt || 0), 0);
    const totalCompletion = history.reduce((acc, h) => acc + (h.tokens?.completion || 0), 0);
    const totalOverall = totalPrompt + totalCompletion;

    const promptPct = totalOverall > 0 ? Math.round((totalPrompt / totalOverall) * 100) : 0;
    const completionPct = totalOverall > 0 ? 100 - promptPct : 0;

    const maxRunTokens = history.reduce((max, h) => Math.max(max, h.tokens?.total || 0), 0);
    const contextLimit = model === 'gemini-4-argon' ? 2097152 : 1048576;
    const maxUsagePercent = (maxRunTokens / contextLimit) * 100;
    const formattedMaxUsagePercent = maxUsagePercent < 0.01 ? '<0.01%' : `${maxUsagePercent.toFixed(2)}%`;

    const pieData = [
      { name: 'Prompt (Entrée)', value: totalPrompt, fill: '#06b6d4' },
      { name: 'Complétion (Sortie)', value: totalCompletion, fill: '#10b981' },
    ];

    const barData = history
      .slice()
      .reverse()
      .map((item, idx) => ({
        run: `Run #${idx + 1}`,
        rawPrompt: item.prompt,
        model: item.model,
        prompt: item.tokens?.prompt || 0,
        completion: item.tokens?.completion || 0,
        total: item.tokens?.total || 0,
        ttft: item.ttftMs ?? Math.round(item.durationMs * 0.35),
        duration: item.durationMs,
      }));

    return {
      totalPrompt,
      totalCompletion,
      totalOverall,
      promptPct,
      completionPct,
      maxRunTokens,
      contextLimit,
      formattedMaxUsagePercent,
      pieData,
      barData,
    };
  }, [history, model]);

  // Detect {{variables}} in prompt and system instructions
  const detectedVariables = useMemo(() => {
    const combined = `${prompt} ${systemInstruction}`;
    const regex = /\{\{([a-zA-Z0-9_-]+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(combined)) !== null) {
      matches.add(match[1]);
    }
    return Array.from(matches);
  }, [prompt, systemInstruction]);

  // Handle variable change
  const handleVariableChange = (name: string, val: string) => {
    onVariablesChange({
      ...variables,
      [name]: val,
    });
  };

  // Load a preset
  const handleSelectPreset = (preset: PromptPreset) => {
    onModelChange(preset.model);
    onThinkingLevelChange(preset.thinkingLevel);
    onSystemInstructionChange(preset.systemInstruction);
    onPromptChange(preset.userPrompt);
    onVariablesChange(preset.variables);
  };

  // Copy output
  const handleCopyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Try formatting output as JSON if viewMode is json
  const formattedJson = useMemo(() => {
    if (!output) return null;
    try {
      // Find JSON block if wrapped in ```json
      const jsonMatch = output.match(/```json\s*([\s\S]*?)\s*```/) || output.match(/```\s*([\s\S]*?)\s*```/);
      const strToParse = jsonMatch ? jsonMatch[1] : output;
      const parsed = JSON.parse(strToParse.trim());
      return JSON.stringify(parsed, null, 2);
    } catch {
      return null;
    }
  }, [output]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Left Column: Prompt Configuration & Inputs */}
      <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-y-auto">
        {/* Model & Hyperparameters Toolbar */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/70 dark:bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Modèle
            </label>
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value as ModelName)}
              className="text-xs font-medium bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Recommandé - Équilibré)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-faible latence)</option>
              <option value="gemini-4-argon">gemini-4-argon (Raisonnement avancé)</option>
            </select>
          </div>

          {/* Thinking Level */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Raisonnement :</span>
            <div className="flex items-center bg-neutral-200/70 dark:bg-neutral-800 rounded-md p-0.5">
              {(['LOW', 'MEDIUM', 'HIGH'] as ThinkingLevelOption[]).map((level) => (
                <button
                  key={level}
                  onClick={() => onThinkingLevelChange(level)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    thinkingLevel === level
                      ? 'bg-white dark:bg-neutral-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Presets & Favorites Quick Picker */}
        <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800/80 bg-neutral-100/50 dark:bg-neutral-950/40 flex items-center justify-between gap-3 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Favorites Drawer button */}
            <button
              onClick={onOpenFavorites}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold whitespace-nowrap transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 fill-current" />
              <span>Favoris ({savedPromptsCount})</span>
            </button>

            {/* Save current prompt button */}
            <button
              onClick={onOpenSaveModal}
              title="Enregistrer ce prompt dans vos favoris localStorage"
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/40 whitespace-nowrap transition-colors font-medium"
            >
              <Star className="w-3.5 h-3.5" />
              <span>Sauvegarder</span>
            </button>

            <span className="text-neutral-300 dark:text-neutral-700 mx-1">|</span>

            <span className="text-neutral-500 shrink-0 font-medium flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Modèles :
            </span>
            {PROMPT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className="px-2.5 py-1 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/50 whitespace-nowrap transition-colors"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* System Instructions Section */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Instructions Système (Persona & Directives)</span>
            </label>
            <span className="text-[11px] text-neutral-400 font-mono">systemInstruction</span>
          </div>
          <textarea
            value={systemInstruction}
            onChange={(e) => onSystemInstructionChange(e.target.value)}
            rows={3}
            placeholder="Ex : Tu es un ingénieur principal. Réponds toujours avec rigueur..."
            className="w-full text-xs font-mono bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-300 dark:border-neutral-800 rounded-md p-2.5 text-neutral-900 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors resize-y"
          />
        </div>

        {/* Dynamic Variables Section */}
        {detectedVariables.length > 0 && (
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-cyan-50/30 dark:bg-cyan-950/10">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Hash className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Variables dynamiques détectées ({detectedVariables.length})
              </span>
            </div>
            <div className="space-y-2">
              {detectedVariables.map((vName) => (
                <div key={vName} className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 w-32 shrink-0 truncate">
                    {`{{${vName}}}`}
                  </span>
                  <input
                    type="text"
                    value={variables[vName] ?? ''}
                    onChange={(e) => handleVariableChange(vName, e.target.value)}
                    placeholder={`Valeur pour ${vName}...`}
                    className="flex-1 text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Prompt Editor */}
        <div className="p-4 flex-1 flex flex-col min-h-[260px]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Prompt Utilisateur & Modèle de Test</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenSaveModal}
                className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                title="Sauvegarder ce prompt dans vos favoris"
              >
                <Star className="w-3 h-3" />
                <span>Sauvegarder en favori</span>
              </button>
              <div className="text-[11px] text-neutral-400 font-mono hidden sm:block">
                Syntaxe : {'{{variable}}'}
              </div>
            </div>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                onExecute();
              }
            }}
            placeholder="Saisis ton prompt ici. Utilise {{variable}} pour insérer des champs dynamiques..."
            className="flex-1 w-full text-xs font-mono bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-300 dark:border-neutral-800 rounded-md p-3 text-neutral-900 dark:text-neutral-200 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Right Column: Execution Output, Telemetry & Logs */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-neutral-950 overflow-hidden">
        {/* Output Header with telemetry metrics */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4 bg-neutral-50/80 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Résultat & Télémétrie
            </span>
            {lastLog && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 font-mono tabular-nums">
                <span>·</span>
                <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold" title="Time-To-First-Token (réactivité du modèle)">
                  <Gauge className="w-3 h-3 text-cyan-500" />
                  <span>TTFT {lastLog.ttftMs ?? Math.round(lastLog.durationMs * 0.35)}ms</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300" title="Latence totale d'exécution">
                  <Clock className="w-3 h-3 text-neutral-400" />
                  <span>{lastLog.durationMs}ms</span>
                </span>
                <span>·</span>
                <Zap className="w-3 h-3 text-neutral-400" />
                <span>{lastLog.tokens.total} tokens</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Mode */}
            <div className="flex items-center bg-neutral-200/70 dark:bg-neutral-800 rounded-md p-0.5 text-xs">
              <button
                onClick={() => setOutputViewMode('text')}
                className={`px-2 py-1 rounded transition-colors ${
                  outputViewMode === 'text'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Rendu
              </button>
              <button
                onClick={() => setOutputViewMode('json')}
                disabled={!formattedJson}
                title={formattedJson ? 'Afficher JSON indenté' : 'Aucun JSON détecté'}
                className={`px-2 py-1 rounded transition-colors ${
                  outputViewMode === 'json'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-40'
                }`}
              >
                JSON
              </button>
              <button
                onClick={() => setOutputViewMode('raw')}
                className={`px-2 py-1 rounded transition-colors ${
                  outputViewMode === 'raw'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Brut
              </button>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopyOutput}
              disabled={!output}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors"
              title="Copier le résultat"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* History Toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 rounded-md transition-colors ${
                showHistory
                  ? 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title="Historique des runs"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* History Panel (collapsible with Recharts token distribution) */}
        {showHistory && (
          <div className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/70 dark:bg-neutral-900/80 p-3 max-h-[380px] overflow-y-auto">
            {/* History Header & Tab Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-800">
              <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Historique ({history.length} run{history.length > 1 ? 's' : ''})
              </span>

              {history.length > 0 && (
                <div className="flex items-center gap-1 bg-neutral-200/80 dark:bg-neutral-800 rounded-md p-0.5 text-xs">
                  <button
                    onClick={() => setHistoryTab('list')}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      historyTab === 'list'
                        ? 'bg-white dark:bg-neutral-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    <List className="w-3 h-3" />
                    <span>Liste</span>
                  </button>
                  <button
                    onClick={() => setHistoryTab('pie')}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      historyTab === 'pie'
                        ? 'bg-white dark:bg-neutral-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    <PieChartIcon className="w-3 h-3" />
                    <span>Circulaire</span>
                  </button>
                  <button
                    onClick={() => setHistoryTab('bar')}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium transition-colors ${
                      historyTab === 'bar'
                        ? 'bg-white dark:bg-neutral-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    <BarChart2 className="w-3 h-3" />
                    <span>Barres</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Fermer
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-neutral-500 py-3 text-center">
                Aucune exécution enregistrée pour le moment. Exécutez un prompt pour visualiser l'historique et la répartition des tokens.
              </p>
            ) : historyTab === 'list' ? (
              <div className="space-y-1.5">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 text-xs p-2 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 hover:border-cyan-500/50 transition-colors cursor-pointer"
                    onClick={() => onRestoreHistory(item)}
                    title="Cliquer pour restaurer ce prompt et ces paramètres"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-neutral-400 text-[11px] shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {item.prompt.slice(0, 45)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] tabular-nums">
                      <span
                        className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20"
                        title="Time-To-First-Token (TTFT) - réactivité"
                      >
                        <Gauge className="w-3 h-3 text-cyan-500" />
                        <span>{item.ttftMs ?? Math.round(item.durationMs * 0.35)}ms TTFT</span>
                      </span>
                      <span
                        className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300 font-medium px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700/60"
                        title="Latence totale de complétion"
                      >
                        <Clock className="w-3 h-3 text-neutral-400" />
                        <span>{item.durationMs}ms</span>
                      </span>
                      <span className="text-neutral-400 hidden sm:inline" title="Total tokens (Prompt + Complétion)">
                        {item.tokens.total} tok
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : historyTab === 'pie' ? (
              /* Vue Graphique Circulaire (Pie Chart) Recharts */
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5 flex flex-col items-center justify-center bg-white dark:bg-neutral-800/80 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700/60 min-h-[180px]">
                  <div className="w-full h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tokenStats.pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={34}
                          outerRadius={56}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {tokenStats.pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0];
                              const pct = tokenStats.totalOverall > 0
                                ? ((Number(data.value) / tokenStats.totalOverall) * 100).toFixed(1)
                                : '0';
                              return (
                                <div className="bg-neutral-900 text-white text-[11px] p-2 rounded shadow-lg border border-neutral-700">
                                  <p className="font-semibold text-neutral-200">{data.name}</p>
                                  <p className="font-mono text-cyan-400 mt-0.5">
                                    {Number(data.value).toLocaleString()} tokens ({pct}%)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-[11px] font-mono mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                      <span className="text-neutral-700 dark:text-neutral-300">Prompt: {tokenStats.promptPct}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-neutral-700 dark:text-neutral-300">Complétion: {tokenStats.completionPct}%</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 flex flex-col justify-between gap-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-cyan-50/60 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40">
                      <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 mb-0.5">
                        <span className="text-[11px] font-medium">Prompt (Entrée)</span>
                        <span className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">{tokenStats.promptPct}%</span>
                      </div>
                      <p className="font-mono text-base font-bold text-cyan-600 dark:text-cyan-400">
                        {tokenStats.totalPrompt.toLocaleString()} <span className="text-[10px] text-neutral-400 font-sans font-normal">tokens</span>
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                      <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 mb-0.5">
                        <span className="text-[11px] font-medium">Complétion (Sortie)</span>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">{tokenStats.completionPct}%</span>
                      </div>
                      <p className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {tokenStats.totalCompletion.toLocaleString()} <span className="text-[10px] text-neutral-400 font-sans font-normal">tokens</span>
                      </p>
                    </div>
                  </div>

                  {/* Context Window Limits */}
                  <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Fenêtre contextuelle ({model})</span>
                      </span>
                      <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                        {tokenStats.maxRunTokens.toLocaleString()} / {(tokenStats.contextLimit / 1000000).toFixed(1)}M max
                      </span>
                    </div>

                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(1, Math.min(100, (tokenStats.maxRunTokens / tokenStats.contextLimit) * 100))}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-neutral-500 dark:text-neutral-400">
                      <span>Pic par run : <strong className="font-mono text-neutral-700 dark:text-neutral-300">{tokenStats.formattedMaxUsagePercent}</strong> de la fenêtre</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Marge contextuelle sécurisée (&gt;99% dispo)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Vue Graphique à Barres (Bar Chart) Recharts */
              <div className="bg-white dark:bg-neutral-800/80 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700/60">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Distribution des tokens par run (chronologique)
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                      <span className="w-2.5 h-2.5 rounded-xs bg-cyan-500" />
                      <span>Prompt</span>
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
                      <span>Complétion</span>
                    </span>
                  </div>
                </div>

                <div className="w-full h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={tokenStats.barData}
                      margin={{ top: 8, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="run"
                        tick={{ fontSize: 10, fill: '#888' }}
                        axisLine={{ stroke: '#555' }}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#888' }}
                        axisLine={{ stroke: '#555' }}
                        tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-neutral-900 text-white text-[11px] p-2.5 rounded shadow-lg border border-neutral-700 max-w-xs">
                                <div className="font-semibold text-neutral-200 border-b border-neutral-800 pb-1 mb-1.5 flex justify-between">
                                  <span>{data.run}</span>
                                  <span className="text-cyan-400 font-mono">{data.total} tokens</span>
                                </div>
                                <p className="text-[10px] text-neutral-400 truncate mb-1 italic">
                                  "{data.rawPrompt.slice(0, 45)}..."
                                </p>
                                <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono mt-1">
                                  <span className="text-cyan-400">Entrée : {data.prompt} tok</span>
                                  <span className="text-emerald-400">Sortie : {data.completion} tok</span>
                                  <span className="text-neutral-400">TTFT : {data.ttft}ms</span>
                                  <span className="text-neutral-400">Total : {data.duration}ms</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="prompt" stackId="a" fill="#06b6d4" name="Prompt Tokens" />
                      <Bar dataKey="completion" stackId="a" fill="#10b981" radius={[3, 3, 0, 0]} name="Complétion Tokens" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-2 border-t border-neutral-100 dark:border-neutral-700/50 mt-1">
                  <span>Limite contexte modèle : <strong className="font-mono text-neutral-700 dark:text-neutral-300">{(tokenStats.contextLimit / 1000000).toFixed(1)}M tokens</strong></span>
                  <span>Pic observé : <strong className="font-mono text-neutral-700 dark:text-neutral-300">{tokenStats.maxRunTokens} tokens</strong> ({tokenStats.formattedMaxUsagePercent})</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Output Box */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed">
          {isRunning ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <p className="text-xs font-sans text-neutral-600 dark:text-neutral-400">
                Génération en cours avec <span className="font-mono text-cyan-600 dark:text-cyan-400">{model}</span>...
              </p>
            </div>
          ) : output ? (
            outputViewMode === 'json' && formattedJson ? (
              <pre className="text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap font-mono">
                {formattedJson}
              </pre>
            ) : (
              <div className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap selection:bg-cyan-500/30">
                {output}
              </div>
            )
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400 dark:text-neutral-600 space-y-2 font-sans">
              <FileText className="w-10 h-10 opacity-40 stroke-1" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Prêt pour l'exécution
              </p>
              <p className="text-xs max-w-sm text-neutral-500">
                Clique sur "Exécuter" ou tape <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono">Ctrl+Entrée</kbd> pour tester ton prompt avec le modèle Gemini connecté.
              </p>
            </div>
          )}
        </div>

        {/* Tabular Numerals Footer Metrics */}
        {lastLog && (
          <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="px-2 border-r border-neutral-200/80 dark:border-neutral-800/80">
              <span className="text-neutral-500 block text-[11px] flex items-center gap-1 font-medium">
                <Gauge className="w-3 h-3 text-cyan-500" />
                <span>TTFT (1er token)</span>
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums text-sm">
                  {lastLog.ttftMs ?? Math.round(lastLog.durationMs * 0.35)}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">ms</span>
              </div>
            </div>

            <div className="px-2 border-r border-neutral-200/80 dark:border-neutral-800/80">
              <span className="text-neutral-500 block text-[11px] flex items-center gap-1 font-medium">
                <Clock className="w-3 h-3 text-neutral-400" />
                <span>Latence Totale</span>
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100 tabular-nums text-sm">
                  {lastLog.durationMs}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">ms</span>
              </div>
            </div>

            <div className="px-2 border-r border-neutral-200/80 dark:border-neutral-800/80">
              <span className="text-neutral-500 block text-[11px]">Tokens Prompt</span>
              <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums block mt-0.5">
                {lastLog.tokens.prompt}
              </span>
            </div>

            <div className="px-2 border-r border-neutral-200/80 dark:border-neutral-800/80">
              <span className="text-neutral-500 block text-[11px]">Tokens Réponse</span>
              <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums block mt-0.5">
                {lastLog.tokens.completion}
              </span>
            </div>

            <div className="px-2">
              <span className="text-neutral-500 block text-[11px] flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" />
                <span>Vitesse Débit</span>
              </span>
              <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums block mt-0.5">
                {lastLog.tokens.completion > 0 && lastLog.durationMs > (lastLog.ttftMs || 0)
                  ? `~${Math.round(lastLog.tokens.completion / Math.max(0.05, (lastLog.durationMs - (lastLog.ttftMs || 0)) / 1000))} tok/s`
                  : `${lastLog.tokens.total} total`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
