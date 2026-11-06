import React, { useState } from 'react';
import {
  BrainCircuit,
  Sliders,
  CheckCircle,
  XCircle,
  Play,
  Layers,
  ArrowRight,
  Info,
  Code2,
  FileCheck,
} from 'lucide-react';
import { XaiTokenAttribution, NeuroSymbolicConstraint } from '../types/aiDev';

interface XaiNeuroSymbolicViewProps {
  onAnalyzeXai: (prompt: string) => Promise<{
    tokenAttributions: XaiTokenAttribution[];
    symbolicConstraints: NeuroSymbolicConstraint[];
    reasoningPath: string;
  }>;
  isRunning: boolean;
}

const DEFAULT_XAI_PROMPT =
  "Génère une structure de réponse pour un ordre d'achat d'actions financières. Le montant total doit être strictement supérieur à zéro, le code ISIN doit comporter 12 caractères alphanumériques et la devise doit être soit EUR soit USD.";

export const XaiNeuroSymbolicView: React.FC<XaiNeuroSymbolicViewProps> = ({
  onAnalyzeXai,
  isRunning,
}) => {
  const [prompt, setPrompt] = useState(DEFAULT_XAI_PROMPT);
  const [xaiResult, setXaiResult] = useState<{
    tokenAttributions: XaiTokenAttribution[];
    symbolicConstraints: NeuroSymbolicConstraint[];
    reasoningPath: string;
  } | null>(null);

  const [activeToken, setActiveToken] = useState<XaiTokenAttribution | null>(null);

  const handleRun = async () => {
    if (!prompt.trim()) return;
    const res = await onAnalyzeXai(prompt);
    if (res) {
      setXaiResult(res);
      if (res.tokenAttributions?.length > 0) {
        setActiveToken(res.tokenAttributions[0]);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Left Column: Input Prompt & Explainability Attribution Map */}
      <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-y-auto">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/90 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Visualisation XAI & Raisonnement Neuro-Symbolique</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Transparence des décisions de l'IA (attribution des tokens) et vérification formelle par solveur symbolique.
            </p>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/30">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
            Prompt à inspecter (Analyse des poids d'attention & contraintes formelles)
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />

          <div className="mt-3 flex justify-end">
            <button
              onClick={handleRun}
              disabled={isRunning || !prompt.trim()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 shadow-xs"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Calcul d'attribution XAI...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Calculer l'Explicabilité XAI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Token Attribution Heatmap */}
        <div className="p-4 flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            <span>Carte de Chaleur d'Attribution des Tokens (Feature Importance)</span>
            <span className="text-[11px] font-mono text-neutral-400">Cliquez sur un mot pour voir l'impact</span>
          </div>

          {xaiResult ? (
            <div className="space-y-4">
              {/* Words pills */}
              <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-wrap gap-2 text-xs font-mono">
                {xaiResult.tokenAttributions.map((item, idx) => {
                  const isPositive = item.weight >= 0;
                  const intensity = Math.min(Math.abs(item.weight), 1);
                  const isSelected = activeToken?.token === item.token;

                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveToken(item)}
                      style={{
                        backgroundColor: isPositive
                          ? `rgba(6, 182, 212, ${0.1 + intensity * 0.4})`
                          : `rgba(244, 63, 94, ${0.1 + intensity * 0.4})`,
                      }}
                      className={`px-2.5 py-1 rounded transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-cyan-500 font-bold scale-105 shadow-xs'
                          : 'hover:brightness-110'
                      } ${
                        isPositive
                          ? 'text-cyan-900 dark:text-cyan-200'
                          : 'text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      <span>{item.token}</span>
                      <span className="text-[10px] opacity-75 tabular-nums">
                        {(item.weight > 0 ? '+' : '') + item.weight.toFixed(2)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Token Inspector */}
              {activeToken && (
                <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Token : "{activeToken.token}"</span>
                    </span>
                    <span className="text-cyan-600 font-semibold tabular-nums">
                      Poids : {activeToken.weight.toFixed(3)}
                    </span>
                  </div>
                  <div className="text-neutral-500 font-mono text-[11px]">
                    Catégorie : <span className="uppercase text-neutral-700 dark:text-neutral-300">{activeToken.category}</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs leading-relaxed">
                    {activeToken.justification}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 py-8 text-center">
              Exécutez le calcul pour visualiser l'attribution des tokens et les vecteurs d'influence du prompt.
            </p>
          )}
        </div>
      </div>

      {/* Right Column: Neuro-Symbolic Constraint Solver & Proof Trace */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-neutral-950 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Solveur Symbolique Hybride & Validation Formelle
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">Modèle Neural + Règles Déterministes</span>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {isRunning ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <p className="text-xs font-sans text-neutral-600 dark:text-neutral-400">
                Vérification des prédicats logiques et des invariants...
              </p>
            </div>
          ) : xaiResult ? (
            <div className="space-y-4">
              {/* Formal Constraints List */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
                  Contraintes Logiques & Mathématiques Évaluées
                </span>

                {xaiResult.symbolicConstraints.map((constraint) => (
                  <div
                    key={constraint.id}
                    className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                        {constraint.passed ? (
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <span>{constraint.ruleName}</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        PROVED VALID
                      </span>
                    </div>

                    <div className="font-mono text-[11px] text-cyan-700 dark:text-cyan-400 bg-white dark:bg-neutral-950 p-1.5 rounded border border-neutral-200 dark:border-neutral-800">
                      {constraint.expression}
                    </div>

                    <p className="text-xs text-neutral-500">
                      {constraint.description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reasoning Path Trace */}
              {xaiResult.reasoningPath && (
                <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-200 space-y-1.5">
                  <span className="text-xs font-semibold text-cyan-400 block font-mono">
                    Trace de Déduction Logique (Inference Path) :
                  </span>
                  <p className="text-xs font-mono leading-relaxed text-neutral-300">
                    {xaiResult.reasoningPath}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400 space-y-2">
              <FileCheck className="w-10 h-10 opacity-40 stroke-1" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Solveur symbolique en attente
              </p>
              <p className="text-xs max-w-sm text-neutral-500">
                L'IA hybride combine la puissance générative des LLM avec la vérification formelle de contraintes logiques strictes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
