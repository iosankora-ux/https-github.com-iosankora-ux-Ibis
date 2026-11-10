import React, { useState, useEffect } from 'react';
import { X, Bookmark, Check, GitBranch, Plus, History, Tag, Layers } from 'lucide-react';
import { ModelName, ThinkingLevelOption, SavedPrompt } from '../types/aiDev';

interface SavePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNew: (data: {
    title: string;
    description: string;
    category: string;
    changeNote?: string;
  }) => void;
  onSaveVersion: (
    targetPromptId: string,
    data: {
      changeNote: string;
      title?: string;
      description?: string;
      category?: string;
    }
  ) => void;
  model: ModelName;
  thinkingLevel: ThinkingLevelOption;
  variableCount: number;
  existingPrompts: SavedPrompt[];
  currentLoadedPromptId?: string | null;
}

export const SavePromptModal: React.FC<SavePromptModalProps> = ({
  isOpen,
  onClose,
  onSaveNew,
  onSaveVersion,
  model,
  thinkingLevel,
  variableCount,
  existingPrompts,
  currentLoadedPromptId,
}) => {
  // Mode: 'new' (creates a fresh v1) or 'version' (creates v2, v3... of an existing prompt)
  const [mode, setMode] = useState<'new' | 'version'>('new');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');

  // Form fields for New Prompt
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Général');

  // Form field for Version
  const [changeNote, setChangeNote] = useState('');

  // Auto-detect if user is iterating on an already loaded prompt
  useEffect(() => {
    if (isOpen) {
      if (currentLoadedPromptId && existingPrompts.some((p) => p.id === currentLoadedPromptId)) {
        setMode('version');
        setSelectedTargetId(currentLoadedPromptId);
        const target = existingPrompts.find((p) => p.id === currentLoadedPromptId);
        if (target) {
          setTitle(target.title);
          setDescription(target.description || '');
          setCategory(target.category || 'Général');
          setChangeNote(`Itération v${(target.version || 1) + 1} : ajustement du prompt et des paramètres`);
        }
      } else {
        setMode('new');
        setTitle('');
        setDescription('');
        setCategory('Général');
        setChangeNote('Version initiale (v1)');
        if (existingPrompts.length > 0) {
          setSelectedTargetId(existingPrompts[0].id);
        }
      }
    }
  }, [isOpen, currentLoadedPromptId, existingPrompts]);

  if (!isOpen) return null;

  const targetPrompt = existingPrompts.find((p) => p.id === selectedTargetId);
  const nextVersionNumber = targetPrompt ? (targetPrompt.version || 1) + 1 : 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'version' && selectedTargetId) {
      onSaveVersion(selectedTargetId, {
        changeNote: changeNote.trim() || `Itération v${nextVersionNumber}`,
        title: title.trim() || targetPrompt?.title,
        description: description.trim(),
        category: category.trim(),
      });
    } else {
      if (!title.trim()) return;
      onSaveNew({
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || 'Général',
        changeNote: changeNote.trim() || 'Version initiale (v1)',
      });
    }

    onClose();
  };

  const predefinedCategories = [
    'Général',
    'Code & Refactoring',
    'Architecture',
    'Extraction',
    'Tests',
    'Productivité',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>Enregistrer dans les Favoris</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800">
                  Système de Versioning
                </span>
              </h3>
              <p className="text-xs text-neutral-500">
                Sauvegarde locale avec suivi chronologique des itérations (v1, v2, etc.).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs (New Prompt vs New Version) */}
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-950/40">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-neutral-200/60 dark:bg-neutral-800/80 text-xs">
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-semibold transition-all ${
                mode === 'new'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nouveau Favori (v1)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (existingPrompts.length === 0) return;
                setMode('version');
              }}
              disabled={existingPrompts.length === 0}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md font-semibold transition-all disabled:opacity-40 ${
                mode === 'version'
                  ? 'bg-white dark:bg-neutral-700 text-cyan-600 dark:text-cyan-300 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-cyan-500" />
              <span>Nouvelle Version (v2, v3...)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {mode === 'version' && (
            <div className="p-3 rounded-lg border border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/50 dark:bg-cyan-950/20 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Prompt cible à itérer</span>
                </label>
                {targetPrompt && (
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-cyan-600 text-white font-bold">
                    v{targetPrompt.version || 1} &rarr; v{nextVersionNumber}
                  </span>
                )}
              </div>

              <select
                value={selectedTargetId}
                onChange={(e) => {
                  setSelectedTargetId(e.target.value);
                  const p = existingPrompts.find((item) => item.id === e.target.value);
                  if (p) {
                    setTitle(p.title);
                    setDescription(p.description || '');
                    setCategory(p.category || 'Général');
                    setChangeNote(`Itération v${(p.version || 1) + 1} : mise à jour du prompt`);
                  }
                }}
                className="w-full text-xs font-medium bg-white dark:bg-neutral-900 border border-cyan-300 dark:border-cyan-700/80 rounded-md p-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                {existingPrompts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} (actuellement v{p.version || 1})
                  </option>
                ))}
              </select>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Note de version (Changelog de l'itération) <span className="text-cyan-600 dark:text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                  placeholder="Ex : Ajout de la gestion des erreurs et typage strict..."
                  className="w-full text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              {mode === 'version' ? 'Titre du prompt (modifiable)' : 'Titre du prompt favori'}{' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus={mode === 'new'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Optimiseur de requêtes PostgreSQL"
              className="w-full text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
              Description ou notes (optionnel)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Courte description de l'objectif et des directives clés..."
              className="w-full text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-md px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
              Catégorie
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {predefinedCategories.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    category === cat
                      ? 'bg-cyan-600 text-white font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ou saisir une catégorie personnalisée..."
              className="w-full text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Quick config reminder */}
          <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between font-mono">
            <span>Modèle : {model}</span>
            <span>·</span>
            <span>Thinking : {thinkingLevel}</span>
            <span>·</span>
            <span>{variableCount} variable(s)</span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={mode === 'new' ? !title.trim() : !selectedTargetId}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 shadow-xs"
            >
              {mode === 'version' ? (
                <>
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>Enregistrer Version v{nextVersionNumber}</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Créer Favori (v1)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
