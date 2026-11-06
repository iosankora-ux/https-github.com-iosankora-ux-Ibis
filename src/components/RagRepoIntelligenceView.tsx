import React, { useState } from 'react';
import {
  FolderTree,
  GitBranch,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Code,
  FileText,
  Zap,
  TrendingDown,
  Gauge,
  Play,
} from 'lucide-react';
import { RepoSymbol, ContextChunk, ContextualRoutingAnalysis } from '../types/aiDev';

interface RagRepoIntelligenceViewProps {
  onAnalyzeRouting: (prompt: string) => Promise<ContextualRoutingAnalysis>;
  isRunning: boolean;
}

const REPO_SYMBOLS: RepoSymbol[] = [
  {
    id: 'sym-1',
    name: 'generateWithRetry',
    kind: 'function',
    filePath: 'server.ts',
    line: 82,
    dependencies: ['ai.models.generateContent', 'setTimeout'],
    callers: ['/api/gemini/generate', '/api/gemini/tools', '/api/gemini/compare'],
    docstring: 'Exécute les appels Gemini avec backoff exponentiel pour 503/429.',
  },
  {
    id: 'sym-2',
    name: 'convertSchemaTypes',
    kind: 'function',
    filePath: 'server.ts',
    line: 45,
    dependencies: ['@google/genai Type'],
    callers: ['/api/gemini/generate', '/api/gemini/tools'],
    docstring: 'Convertit les schémas JSON standard en enum Type du SDK GoogleGenAI.',
  },
  {
    id: 'sym-3',
    name: 'SavedPrompt',
    kind: 'interface',
    filePath: 'src/types/aiDev.ts',
    line: 86,
    dependencies: ['ModelName', 'ThinkingLevelOption'],
    callers: ['savedPromptsStorage.ts', 'App.tsx', 'FavoritesDrawer.tsx'],
    docstring: 'Définition des structures de prompts favoris persistés dans localStorage.',
  },
  {
    id: 'sym-4',
    name: 'db_orders_schema',
    kind: 'db_schema',
    filePath: 'src/db/schema.ts',
    line: 12,
    dependencies: ['pgTable', 'uuid', 'timestamp'],
    callers: ['fetchUserOrders()', 'api/orders.ts'],
    docstring: 'Schéma relationnel PostgreSQL pour les transactions et commandes e-commerce.',
  },
];

const SAMPLE_CHUNKS: ContextChunk[] = [
  {
    id: 'chunk-1',
    filePath: 'server.ts',
    content: 'async function generateWithRetry(params: { model: string; contents: any }, maxRetries = 2) { ... }',
    similarityScore: 0.94,
    tokenCount: 140,
    isIncludedInWindow: true,
  },
  {
    id: 'chunk-2',
    filePath: 'src/types/aiDev.ts',
    content: 'export interface SavedPrompt { id: string; title: string; model: ModelName; ... }',
    similarityScore: 0.88,
    tokenCount: 95,
    isIncludedInWindow: true,
  },
  {
    id: 'chunk-3',
    filePath: 'src/utils/savedPromptsStorage.ts',
    content: 'export function getSavedPrompts(): SavedPrompt[] { localStorage.getItem(...) }',
    similarityScore: 0.79,
    tokenCount: 110,
    isIncludedInWindow: true,
  },
  {
    id: 'chunk-4',
    filePath: 'vite.config.ts',
    content: 'export default defineConfig({ plugins: [react(), tailwindcss()] })',
    similarityScore: 0.35,
    tokenCount: 65,
    isIncludedInWindow: false,
  },
];

export const RagRepoIntelligenceView: React.FC<RagRepoIntelligenceViewProps> = ({
  onAnalyzeRouting,
  isRunning,
}) => {
  const [query, setQuery] = useState(
    'Où est implémenté le mécanisme de retry avec backoff exponentiel et quelles sont ses dépendances dans le backend ?'
  );
  const [routingAnalysis, setRoutingAnalysis] = useState<ContextualRoutingAnalysis | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<RepoSymbol>(REPO_SYMBOLS[0]);

  const handleRunRouting = async () => {
    if (!query.trim()) return;
    const res = await onAnalyzeRouting(query);
    if (res) {
      setRoutingAnalysis(res);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Left Column: Repository Intelligence & AST Symbol Graph */}
      <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-y-auto">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/90 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Intelligence Référentielle Profonde (Repository Intelligence)</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Graphe de symboles AST, résolution de dépendances et ancrage contextuel du codebase.
            </p>
          </div>
        </div>

        {/* Symbols list */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <span>Symboles et Déclarations Indexés ({REPO_SYMBOLS.length})</span>
            <span className="text-[11px] font-mono text-neutral-400">AST parser TypeScript</span>
          </div>

          <div className="space-y-2">
            {REPO_SYMBOLS.map((sym) => {
              const isSelected = selectedSymbol.id === sym.id;
              return (
                <div
                  key={sym.id}
                  onClick={() => setSelectedSymbol(sym)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50/20 dark:bg-cyan-950/20 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>{sym.name}</span>
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                      {sym.kind}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-500 mt-1">
                    {sym.filePath}:{sym.line}
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-1">
                    {sym.docstring}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Selected Symbol Inspector */}
          {selectedSymbol && (
            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/80 text-xs space-y-2">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                Détails du symbole sélectionné :
              </span>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="text-neutral-600 dark:text-neutral-400">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">Dépendances :</span>{' '}
                  {selectedSymbol.dependencies.join(', ')}
                </div>
                <div className="text-neutral-600 dark:text-neutral-400">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">Appelants (Callers) :</span>{' '}
                  {selectedSymbol.callers.join(', ')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: RAG Chunks & Dynamic Contextual Router */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-neutral-950 overflow-hidden">
        {/* Router Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Ingénierie Contextuelle & Routage Dynamique (LLMOps)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">Optimisation Coût / Latence</span>
        </div>

        {/* Query Input */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/30">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
            Requête développeur (Routage dynamique & RAG retrieval)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
              onClick={handleRunRouting}
              disabled={isRunning || !query.trim()}
              className="px-3.5 py-2 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 shrink-0"
            >
              {isRunning ? 'Analyse...' : 'Router'}
            </button>
          </div>
        </div>

        {/* Dynamic Routing Output */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {routingAnalysis ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-cyan-50/30 dark:bg-cyan-950/20">
                  <span className="text-neutral-500 block text-[11px]">Modèle Recommandé</span>
                  <span className="font-bold text-sm text-cyan-600 dark:text-cyan-400">
                    {routingAnalysis.recommendedModel}
                  </span>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                    Thinking: {routingAnalysis.recommendedThinkingLevel}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-emerald-50/30 dark:bg-emerald-950/20">
                  <span className="text-neutral-500 block text-[11px]">Gain de Coût Estimé</span>
                  <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" />
                    <span>-{routingAnalysis.estimatedCostReductionPct}%</span>
                  </span>
                  <span className="text-[11px] text-neutral-400 block mt-0.5">
                    Complexité : {routingAnalysis.complexityScore}/100
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                  Stratégie de routage contextuel :
                </span>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {routingAnalysis.routingRationale}
                </p>
              </div>

              {/* RAG Chunks Retrieved */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  <span>Chunks RAG Récupérés par Similarité Sémantique</span>
                  <span className="text-[11px] font-mono text-neutral-400">Context Recall</span>
                </div>

                {SAMPLE_CHUNKS.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="p-2.5 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-neutral-500">{chunk.filePath}</span>
                      <span
                        className={`font-bold tabular-nums ${
                          chunk.similarityScore > 0.8
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-neutral-400'
                        }`}
                      >
                        Cosine Sim: {(chunk.similarityScore * 100).toFixed(0)}% · {chunk.tokenCount} tok
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-700 dark:text-neutral-300 truncate">
                      {chunk.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <span>Simulation de Découpage Vectoriel & Fenêtre de Contexte</span>
                <span className="text-[11px] font-mono text-neutral-400">Top-4 Chunks</span>
              </div>

              {SAMPLE_CHUNKS.map((chunk) => (
                <div
                  key={chunk.id}
                  className="p-2.5 rounded border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-mono space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-cyan-700 dark:text-cyan-400 font-semibold">{chunk.filePath}</span>
                    <span className="text-neutral-500 tabular-nums">
                      Sim: {(chunk.similarityScore * 100).toFixed(0)}% · {chunk.tokenCount} tokens
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 dark:text-neutral-300 truncate">
                    {chunk.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
