import React from 'react';
import { Play, Sun, Moon } from 'lucide-react';

export type NavTab =
  | 'playground'
  | 'algo'
  | 'agents'
  | 'guardrails'
  | 'xai'
  | 'rag'
  | 'schema'
  | 'tools'
  | 'benchmark'
  | 'export';

interface TopNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onExecute: () => void;
  isRunning: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onExecute,
  isRunning,
  theme,
  onToggleTheme,
}) => {
  const tabs: { id: NavTab; label: string }[] = [
    { id: 'playground', label: 'Playground' },
    { id: 'algo', label: 'Quantum & Algos' },
    { id: 'agents', label: 'Agents & HITL' },
    { id: 'guardrails', label: 'Guardrails' },
    { id: 'xai', label: 'XAI & Hybride' },
    { id: 'rag', label: 'RAG & Repo' },
    { id: 'schema', label: 'Schémas' },
    { id: 'tools', label: 'Outils' },
    { id: 'benchmark', label: 'Benchmark' },
    { id: 'export', label: 'Export Code' },
  ];

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Zone 1: Single element Brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('playground');
          }}
          className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-7 h-7 rounded-md bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white text-xs font-mono font-bold shadow-sm">
            AI
          </span>
          <span>PromptForge</span>
        </a>
      </div>

      {/* Zone 2: Concise single-line nav links with horizontal scroll on small viewports */}
      <nav className="flex items-center gap-1 text-xs font-medium overflow-x-auto py-0.5 max-w-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action + theme toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Basculer en mode clair' : 'Basculer en mode sombre'}
          className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={onExecute}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white transition-all whitespace-nowrap shrink-0 shadow-sm ${
            isRunning
              ? 'bg-neutral-700 cursor-not-allowed opacity-80'
              : 'bg-cyan-600 hover:bg-cyan-500 active:scale-95'
          }`}
        >
          {isRunning ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Exécuter (Ctrl+Entrée)</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
