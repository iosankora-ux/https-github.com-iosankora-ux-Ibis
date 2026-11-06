import React, { useState } from 'react';
import { Play, Clock, Zap, Check, AlertCircle, Copy, Scale, ArrowRightLeft, FileSpreadsheet, Download, BarChart3 } from 'lucide-react';
import { ModelName, ThinkingLevelOption, BenchmarkVariant } from '../types/aiDev';
import { CapacityPerformanceReportModal } from './CapacityPerformanceReportModal';

interface BenchmarkHistoryEntry {
  id: string;
  timestamp: string;
  prompt: string;
  variantA: {
    model: string;
    thinkingLevel: string;
    systemInstruction: string;
    durationMs: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    success: boolean;
    output: string;
  };
  variantB: {
    model: string;
    thinkingLevel: string;
    systemInstruction: string;
    durationMs: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    success: boolean;
    output: string;
  };
}

interface BenchmarkViewProps {
  onRunBenchmark: (variantA: any, variantB: any) => Promise<{ resultA: any; resultB: any }>;
  isRunning: boolean;
}

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({
  onRunBenchmark,
  isRunning,
}) => {
  const [prompt, setPrompt] = useState(
    'Explique la différence entre l’architecture Transformer standard et un modèle Mixture-of-Experts (MoE) en termes de coût d’inférence et de mémoire GPU.'
  );

  // Variant A config
  const [modelA, setModelA] = useState<ModelName>('gemini-3.8-flash');
  const [thinkingA, setThinkingA] = useState<ThinkingLevelOption>('LOW');
  const [sysInstructionA, setSysInstructionA] = useState(
    'Réponds de manière synthétique en 3 puces concises pour un public de développeurs backend.'
  );

  // Variant B config
  const [modelB, setModelB] = useState<ModelName>('gemini-3.8-flash');
  const [thinkingB, setThinkingB] = useState<ThinkingLevelOption>('HIGH');
  const [sysInstructionB, setSysInstructionB] = useState(
    'Fournis une analyse approfondie et mathématique avec équations de complexité et recommandations matérielles.'
  );

  const [benchmarkResult, setBenchmarkResult] = useState<{
    resultA: any;
    resultB: any;
  } | null>(null);

  const [history, setHistory] = useState<BenchmarkHistoryEntry[]>([]);
  const [csvExportSuccess, setCsvExportSuccess] = useState(false);
  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleRun = async () => {
    const varA = {
      model: modelA,
      thinkingLevel: thinkingA,
      systemInstruction: sysInstructionA,
      prompt,
    };
    const varB = {
      model: modelB,
      thinkingLevel: thinkingB,
      systemInstruction: sysInstructionB,
      prompt,
    };

    const res = await onRunBenchmark(varA, varB);
    if (res) {
      setBenchmarkResult(res);

      const entry: BenchmarkHistoryEntry = {
        id: `bench-${Date.now()}`,
        timestamp: new Date().toISOString(),
        prompt,
        variantA: {
          model: varA.model,
          thinkingLevel: varA.thinkingLevel,
          systemInstruction: varA.systemInstruction,
          durationMs: res.resultA?.durationMs || 0,
          promptTokens: res.resultA?.usage?.promptTokenCount || 0,
          completionTokens: res.resultA?.usage?.candidatesTokenCount || 0,
          totalTokens: res.resultA?.usage?.totalTokenCount || 0,
          success: res.resultA?.success ?? true,
          output: res.resultA?.text || res.resultA?.error || '',
        },
        variantB: {
          model: varB.model,
          thinkingLevel: varB.thinkingLevel,
          systemInstruction: varB.systemInstruction,
          durationMs: res.resultB?.durationMs || 0,
          promptTokens: res.resultB?.usage?.promptTokenCount || 0,
          completionTokens: res.resultB?.usage?.candidatesTokenCount || 0,
          totalTokens: res.resultB?.usage?.totalTokenCount || 0,
          success: res.resultB?.success ?? true,
          output: res.resultB?.text || res.resultB?.error || '',
        },
      };

      setHistory((prev) => [entry, ...prev]);
    }
  };

  const copyText = (text: string, setCopied: (v: boolean) => void) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to escape values for CSV
  const escapeCSV = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Export benchmark comparison results as CSV
  const handleExportCSV = () => {
    // If we have history, export all entries, else export current result
    const entriesToExport: BenchmarkHistoryEntry[] =
      history.length > 0
        ? history
        : benchmarkResult
        ? [
            {
              id: `bench-${Date.now()}`,
              timestamp: new Date().toISOString(),
              prompt,
              variantA: {
                model: modelA,
                thinkingLevel: thinkingA,
                systemInstruction: sysInstructionA,
                durationMs: benchmarkResult.resultA?.durationMs || 0,
                promptTokens: benchmarkResult.resultA?.usage?.promptTokenCount || 0,
                completionTokens: benchmarkResult.resultA?.usage?.candidatesTokenCount || 0,
                totalTokens: benchmarkResult.resultA?.usage?.totalTokenCount || 0,
                success: benchmarkResult.resultA?.success ?? true,
                output: benchmarkResult.resultA?.text || benchmarkResult.resultA?.error || '',
              },
              variantB: {
                model: modelB,
                thinkingLevel: thinkingB,
                systemInstruction: sysInstructionB,
                durationMs: benchmarkResult.resultB?.durationMs || 0,
                promptTokens: benchmarkResult.resultB?.usage?.promptTokenCount || 0,
                completionTokens: benchmarkResult.resultB?.usage?.candidatesTokenCount || 0,
                totalTokens: benchmarkResult.resultB?.usage?.totalTokenCount || 0,
                success: benchmarkResult.resultB?.success ?? true,
                output: benchmarkResult.resultB?.text || benchmarkResult.resultB?.error || '',
              },
            },
          ]
        : [];

    if (entriesToExport.length === 0) return;

    const headers = [
      'Date/Heure',
      'ID Benchmark',
      'Prompt de Test',
      'Variante',
      'Modèle',
      'Niveau Raisonnement',
      'Instruction Système',
      'Durée (ms)',
      'Tokens Prompt',
      'Tokens Complétion',
      'Tokens Total',
      'Statut',
      'Sortie Générée',
    ];

    const rows: string[] = [headers.map(escapeCSV).join(',')];

    entriesToExport.forEach((entry) => {
      // Row 1: Variante A
      rows.push(
        [
          escapeCSV(entry.timestamp),
          escapeCSV(entry.id),
          escapeCSV(entry.prompt),
          escapeCSV('Variante A'),
          escapeCSV(entry.variantA.model),
          escapeCSV(entry.variantA.thinkingLevel),
          escapeCSV(entry.variantA.systemInstruction),
          escapeCSV(entry.variantA.durationMs),
          escapeCSV(entry.variantA.promptTokens),
          escapeCSV(entry.variantA.completionTokens),
          escapeCSV(entry.variantA.totalTokens),
          escapeCSV(entry.variantA.success ? 'Succès' : 'Échec'),
          escapeCSV(entry.variantA.output),
        ].join(',')
      );

      // Row 2: Variante B
      rows.push(
        [
          escapeCSV(entry.timestamp),
          escapeCSV(entry.id),
          escapeCSV(entry.prompt),
          escapeCSV('Variante B'),
          escapeCSV(entry.variantB.model),
          escapeCSV(entry.variantB.thinkingLevel),
          escapeCSV(entry.variantB.systemInstruction),
          escapeCSV(entry.variantB.durationMs),
          escapeCSV(entry.variantB.promptTokens),
          escapeCSV(entry.variantB.completionTokens),
          escapeCSV(entry.variantB.totalTokens),
          escapeCSV(entry.variantB.success ? 'Succès' : 'Échec'),
          escapeCSV(entry.variantB.output),
        ].join(',')
      );
    });

    // Add UTF-8 BOM (\uFEFF) so Excel and spreadsheet tools render accents correctly
    const csvContent = '\uFEFF' + rows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `promptforge_benchmark_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCsvExportSuccess(true);
    setTimeout(() => setCsvExportSuccess(false), 2500);
  };

  const hasResults = Boolean(benchmarkResult || history.length > 0);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
      {/* Top Header */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Benchmark & Évaluation Comparative (A/B Testing)</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Compare simultanément deux variantes de modèles, prompts ou niveaux de raisonnement sur la même entrée.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Capacity & Performance Report Modal Trigger */}
          <button
            onClick={() => setIsReportOpen(true)}
            title="Consulter le rapport technique détaillé des capacités et performances"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-xs"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Rapport Capacités & Performances</span>
          </button>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            disabled={!hasResults}
            title={hasResults ? 'Exporter les résultats du benchmark au format CSV' : 'Exécutez un benchmark pour exporter les données'}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors ${
              hasResults
                ? 'bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed'
            }`}
          >
            {csvExportSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">CSV Exporté !</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Exporter en CSV</span>
                {history.length > 0 && (
                  <span className="font-mono text-[10px] text-neutral-400 tabular-nums">
                    ({history.length})
                  </span>
                )}
              </>
            )}
          </button>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={isRunning || !prompt.trim()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 shadow-sm"
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Exécution parallèle A/B...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Lancer le Comparatif A vs B</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Shared Prompt Input */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40">
        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
          Prompt de test commun (exécuté sur les deux variantes)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          className="w-full text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      {/* Side by Side Variants */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-200 dark:divide-neutral-800">
        {/* VARIANT A */}
        <div className="flex flex-col bg-white dark:bg-neutral-900/50">
          <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/90 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Variante A
            </span>
            <div className="flex items-center gap-2">
              <select
                value={modelA}
                onChange={(e) => setModelA(e.target.value as ModelName)}
                className="text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-neutral-900 dark:text-neutral-100"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                <option value="gemini-4-argon">gemini-4-argon</option>
              </select>

              <select
                value={thinkingA}
                onChange={(e) => setThinkingA(e.target.value as ThinkingLevelOption)}
                className="text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-neutral-900 dark:text-neutral-100"
              >
                <option value="LOW">Thinking: LOW</option>
                <option value="MEDIUM">Thinking: MEDIUM</option>
                <option value="HIGH">Thinking: HIGH</option>
              </select>
            </div>
          </div>

          {/* System instruction A */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/30">
            <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
              Instruction système Variante A :
            </label>
            <input
              type="text"
              value={sysInstructionA}
              onChange={(e) => setSysInstructionA(e.target.value)}
              className="w-full text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1.5 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Metrics A */}
          {benchmarkResult?.resultA && (
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-cyan-50/20 dark:bg-cyan-950/10 flex items-center justify-between text-xs font-mono tabular-nums">
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{benchmarkResult.resultA.durationMs} ms</span>
              </span>
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <Zap className="w-3.5 h-3.5 text-neutral-400" />
                <span>{benchmarkResult.resultA.usage?.totalTokenCount || '~'} tokens</span>
              </span>
              <button
                onClick={() => copyText(benchmarkResult.resultA.text, setCopiedA)}
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1"
              >
                {copiedA ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>Copier</span>
              </button>
            </div>
          )}

          {/* Output A */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed">
            {isRunning ? (
              <div className="py-8 flex flex-col items-center justify-center text-neutral-500 space-y-2">
                <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                <span className="text-xs font-sans">Génération A en cours...</span>
              </div>
            ) : benchmarkResult?.resultA ? (
              <div className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                {benchmarkResult.resultA.text}
              </div>
            ) : (
              <p className="text-neutral-400 text-center py-12 font-sans text-xs">
                En attente d'exécution pour la variante A...
              </p>
            )}
          </div>
        </div>

        {/* VARIANT B */}
        <div className="flex flex-col bg-white dark:bg-neutral-900/50">
          <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/90 flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
              Variante B
            </span>
            <div className="flex items-center gap-2">
              <select
                value={modelB}
                onChange={(e) => setModelB(e.target.value as ModelName)}
                className="text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-neutral-900 dark:text-neutral-100"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                <option value="gemini-4-argon">gemini-4-argon</option>
              </select>

              <select
                value={thinkingB}
                onChange={(e) => setThinkingB(e.target.value as ThinkingLevelOption)}
                className="text-xs font-mono bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-neutral-900 dark:text-neutral-100"
              >
                <option value="LOW">Thinking: LOW</option>
                <option value="MEDIUM">Thinking: MEDIUM</option>
                <option value="HIGH">Thinking: HIGH</option>
              </select>
            </div>
          </div>

          {/* System instruction B */}
          <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/30">
            <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
              Instruction système Variante B :
            </label>
            <input
              type="text"
              value={sysInstructionB}
              onChange={(e) => setSysInstructionB(e.target.value)}
              className="w-full text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1.5 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Metrics B */}
          {benchmarkResult?.resultB && (
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-cyan-50/20 dark:bg-cyan-950/10 flex items-center justify-between text-xs font-mono tabular-nums">
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{benchmarkResult.resultB.durationMs} ms</span>
              </span>
              <span className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <Zap className="w-3.5 h-3.5 text-neutral-400" />
                <span>{benchmarkResult.resultB.usage?.totalTokenCount || '~'} tokens</span>
              </span>
              <button
                onClick={() => copyText(benchmarkResult.resultB.text, setCopiedB)}
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1"
              >
                {copiedB ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>Copier</span>
              </button>
            </div>
          )}

          {/* Output B */}
          <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed">
            {isRunning ? (
              <div className="py-8 flex flex-col items-center justify-center text-neutral-500 space-y-2">
                <div className="w-6 h-6 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                <span className="text-xs font-sans">Génération B en cours...</span>
              </div>
            ) : benchmarkResult?.resultB ? (
              <div className="text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                {benchmarkResult.resultB.text}
              </div>
            ) : (
              <p className="text-neutral-400 text-center py-12 font-sans text-xs">
                En attente d'exécution pour la variante B...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Capacity & Performance Report Modal */}
      <CapacityPerformanceReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
};
