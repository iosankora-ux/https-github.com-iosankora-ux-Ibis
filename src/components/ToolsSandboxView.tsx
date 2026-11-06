import React, { useState } from 'react';
import { Wrench, Play, CheckCircle, ArrowRight, RotateCcw, Plus, Trash2, Terminal, Code2 } from 'lucide-react';
import { FunctionTool } from '../types/aiDev';
import { DEFAULT_FUNCTION_TOOLS } from '../data/presets';

interface ToolsSandboxViewProps {
  onExecuteTools: (prompt: string, tools: FunctionTool[]) => Promise<any>;
  isRunning: boolean;
}

export const ToolsSandboxView: React.FC<ToolsSandboxViewProps> = ({
  onExecuteTools,
  isRunning,
}) => {
  const [tools, setTools] = useState<FunctionTool[]>(DEFAULT_FUNCTION_TOOLS);
  const [prompt, setPrompt] = useState(
    "Quel temps fait-il actuellement à Paris ? Et recherche le dossier du client CUST-8492 pour vérifier ses dépenses récentes."
  );
  const [executionResult, setExecutionResult] = useState<{
    text: string;
    functionCalls: Array<{ name: string; args: any }>;
    durationMs: number;
  } | null>(null);

  const [simulatedResponses, setSimulatedResponses] = useState<Record<string, any>>({});

  // Toggle active tools
  const [activeToolIds, setActiveToolIds] = useState<Set<string>>(
    new Set(DEFAULT_FUNCTION_TOOLS.map((t) => t.id))
  );

  const toggleTool = (id: string) => {
    const next = new Set(activeToolIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setActiveToolIds(next);
  };

  const handleRun = async () => {
    const selectedTools = tools.filter((t) => activeToolIds.has(t.id));
    setSimulatedResponses({});
    const res = await onExecuteTools(prompt, selectedTools);
    if (res) {
      setExecutionResult(res);
      // Auto-simulate tool responses based on mockHandler
      if (res.functionCalls && res.functionCalls.length > 0) {
        const mocked: Record<string, any> = {};
        res.functionCalls.forEach((fc: any, index: number) => {
          const matchedTool = tools.find((t) => t.name === fc.name);
          if (matchedTool && matchedTool.mockHandler) {
            mocked[`${fc.name}_${index}`] = matchedTool.mockHandler(fc.args);
          } else {
            mocked[`${fc.name}_${index}`] = { status: 'success', mockData: true, calledWith: fc.args };
          }
        });
        setSimulatedResponses(mocked);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Left Column: Registered Tools & Prompt Input */}
      <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-y-auto">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/90">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Simulateur d'Appels d'Outils (Function Calling)</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Déclare des fonctions avec leurs schémas de paramètres. Le modèle décide en autonomie de les invoquer en générant des arguments structurés.
          </p>
        </div>

        {/* Tools declarations list */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <span>Outils disponibles pour le modèle ({tools.length})</span>
            <span className="text-neutral-400 font-normal">Active ou désactive chaque outil</span>
          </div>

          {tools.map((t) => {
            const isActive = activeToolIds.has(t.id);
            return (
              <div
                key={t.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  isActive
                    ? 'border-neutral-300 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-900/50'
                    : 'border-neutral-200 dark:border-neutral-800/60 opacity-60 bg-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={() => toggleTool(t.id)}
                      className="rounded border-neutral-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                      {t.name}()
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {Object.keys(t.parameters.properties).length} param(s)
                  </span>
                </div>

                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 pl-6">
                  {t.description}
                </p>

                {isActive && (
                  <div className="mt-2.5 pl-6">
                    <pre className="text-[11px] font-mono p-2 rounded bg-neutral-100 dark:bg-neutral-950/80 text-neutral-700 dark:text-neutral-300 overflow-x-auto">
                      {JSON.stringify(t.parameters.properties, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Prompt Input */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
            Consigne de l'agent (Test Prompt)
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Pose une question nécessitant d'interroger un des outils ci-dessus..."
            className="w-full text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleRun}
              disabled={isRunning || activeToolIds.size === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyse & Décision d'Outils...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Exécuter la simulation d'outils</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Function Invocations & Synthetic Trace */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-neutral-950 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Traces d'Invocations & Décisions de l'Agent
            </span>
          </div>

          {executionResult && (
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 tabular-nums">
              {executionResult.durationMs}ms
            </span>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isRunning ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <p className="text-xs font-sans text-neutral-600 dark:text-neutral-400">
                Le modèle analyse la consigne et évalue les fonctions à appeler...
              </p>
            </div>
          ) : executionResult ? (
            <div className="space-y-4">
              {/* Function Calls detected */}
              {executionResult.functionCalls && executionResult.functionCalls.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>
                      {executionResult.functionCalls.length} appel(s) de fonction généré(s) :
                    </span>
                  </div>

                  {executionResult.functionCalls.map((fc: any, index: number) => {
                    const mockKey = `${fc.name}_${index}`;
                    const mockOutput = simulatedResponses[mockKey];

                    return (
                      <div
                        key={index}
                        className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/50 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                            <span className="text-neutral-400">Appel #{index + 1}:</span>
                            <span className="text-cyan-600 dark:text-cyan-400">{fc.name}</span>
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] font-semibold text-neutral-500 block mb-1">
                            Arguments générés par Gemini :
                          </span>
                          <pre className="text-xs font-mono p-2 rounded bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 overflow-x-auto">
                            {JSON.stringify(fc.args, null, 2)}
                          </pre>
                        </div>

                        {mockOutput && (
                          <div className="pt-1">
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
                              <ArrowRight className="w-3 h-3" /> Réponse simulée de l'outil injectée :
                            </span>
                            <pre className="text-xs font-mono p-2 rounded bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 overflow-x-auto">
                              {JSON.stringify(mockOutput, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-900 text-xs text-neutral-600 dark:text-neutral-400">
                  Le modèle n'a pas jugé nécessaire d'invoquer un outil pour cette requête et a répondu directement par texte.
                </div>
              )}

              {/* Text answer if present */}
              {executionResult.text && (
                <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1.5">
                  <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                    Réponse textuelle de l'agent :
                  </span>
                  <div className="text-xs font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                    {executionResult.text}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400 dark:text-neutral-600 space-y-2 font-sans">
              <Code2 className="w-10 h-10 opacity-40 stroke-1" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Aucune simulation d'outil lancée
              </p>
              <p className="text-xs max-w-sm text-neutral-500">
                Choisis les fonctions à activer, rédige une consigne et lance la simulation pour voir les arguments générés par Gemini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
