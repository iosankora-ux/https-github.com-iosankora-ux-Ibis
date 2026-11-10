import React, { useState, useMemo } from 'react';
import {
  X,
  Bookmark,
  Search,
  Trash2,
  Play,
  Copy,
  Check,
  Download,
  Upload,
  GitBranch,
  History,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Plus,
} from 'lucide-react';
import { SavedPrompt, PromptVersionSnapshot } from '../types/aiDev';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPrompts: SavedPrompt[];
  onLoadPrompt: (prompt: SavedPrompt) => void;
  onDeletePrompt: (id: string) => void;
  onImportPrompts: (prompts: SavedPrompt[]) => void;
  onOpenNewVersionModal?: (targetPrompt: SavedPrompt) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  savedPrompts,
  onLoadPrompt,
  onDeletePrompt,
  onImportPrompts,
  onOpenNewVersionModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Expanded version history by prompt ID
  const [expandedHistoryIds, setExpandedHistoryIds] = useState<Record<string, boolean>>({});

  const toggleHistory = (promptId: string) => {
    setExpandedHistoryIds((prev) => ({
      ...prev,
      [promptId]: !prev[promptId],
    }));
  };

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    savedPrompts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [savedPrompts]);

  // Filtered prompts
  const filteredPrompts = useMemo(() => {
    return savedPrompts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.changeNote && p.changeNote.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [savedPrompts, searchTerm, selectedCategory]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedPrompts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `promptforge_favoris_versionnes_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportPrompts(parsed);
        }
      } catch {
        alert('Fichier JSON invalide pour les favoris');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Helper to load a past version snapshot into the Playground
  const handleLoadSnapshot = (parent: SavedPrompt, snapshot: PromptVersionSnapshot) => {
    const virtualPrompt: SavedPrompt = {
      ...parent,
      model: snapshot.model,
      thinkingLevel: snapshot.thinkingLevel,
      systemInstruction: snapshot.systemInstruction,
      prompt: snapshot.prompt,
      variables: snapshot.variables || {},
      version: snapshot.version,
      changeNote: snapshot.changeNote,
    };
    onLoadPrompt(virtualPrompt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl h-full bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <span>Prompts Favoris & Versions</span>
                <span className="text-xs font-mono font-normal text-neutral-400 tabular-nums">
                  ({savedPrompts.length})
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Suivi chronologique des itérations de prompts (v1, v2, etc.).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              title="Exporter tous les favoris avec leur historique de versions en JSON"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Import JSON */}
            <label
              title="Importer des favoris depuis un fichier JSON"
              className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
          {/* Search input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom, mot-clé, changelog ou version..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Category tabs */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Tous ({savedPrompts.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Prompts list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {filteredPrompts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400 space-y-2">
              <Bookmark className="w-10 h-10 opacity-30 stroke-1" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                {savedPrompts.length === 0 ? 'Aucun prompt favori enregistré' : 'Aucun résultat trouvé'}
              </p>
              <p className="text-xs max-w-xs text-neutral-500">
                {savedPrompts.length === 0
                  ? 'Pour ajouter un favori, rédigez un prompt dans le Playground puis cliquez sur « Sauvegarder ».'
                  : 'Modifiez les termes de recherche ou sélectionnez une autre catégorie.'}
              </p>
            </div>
          ) : (
            filteredPrompts.map((item) => {
              const varCount = Object.keys(item.variables || {}).length;
              const isConfirming = confirmDeleteId === item.id;
              const historyCount = item.versions?.length || 0;
              const isHistoryOpen = !!expandedHistoryIds[item.id];

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all space-y-2.5"
                >
                  {/* Top line: title, version badge & category */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-100 dark:bg-cyan-950/80 px-2 py-0.5 rounded text-[11px] font-bold border border-cyan-200 dark:border-cyan-800 shadow-2xs">
                          v{item.version || 1}
                        </span>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                          {item.title}
                        </h4>
                      </div>
                      {item.description && (
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {item.category && (
                      <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-200/60 dark:bg-neutral-800 px-2 py-0.5 rounded shrink-0">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Version Changelog Note if present */}
                  {item.changeNote && (
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-800 dark:text-cyan-300 bg-cyan-500/10 dark:bg-cyan-500/15 px-2.5 py-1 rounded border border-cyan-500/20 font-sans">
                      <GitBranch className="w-3 h-3 text-cyan-600 dark:text-cyan-400 shrink-0" />
                      <span className="truncate">
                        <strong>v{item.version} :</strong> {item.changeNote}
                      </span>
                    </div>
                  )}

                  {/* Metadata line */}
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono flex-wrap">
                    <span className="text-cyan-700 dark:text-cyan-400">{item.model}</span>
                    <span aria-hidden="true">·</span>
                    <span>Thinking: {item.thinkingLevel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{varCount} var(s)</span>
                    <span aria-hidden="true">·</span>
                    <span>Mis à jour : {new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Prompt preview */}
                  <div className="p-2 rounded bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 max-h-24 overflow-hidden text-ellipsis line-clamp-3">
                    {item.prompt}
                  </div>

                  {/* Version History Toggle Button if multiple versions exist */}
                  {historyCount > 0 && (
                    <div className="pt-1">
                      <button
                        onClick={() => toggleHistory(item.id)}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        <History className="w-3.5 h-3.5 text-cyan-500" />
                        <span>
                          {isHistoryOpen ? 'Masquer l’historique des itérations' : `Historique des versions (${historyCount} version${historyCount > 1 ? 's' : ''} antérieure${historyCount > 1 ? 's' : ''})`}
                        </span>
                        {isHistoryOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {/* Expandable Version Timeline */}
                      {isHistoryOpen && (
                        <div className="mt-2.5 pl-3 border-l-2 border-cyan-500/30 space-y-2 py-1">
                          {item.versions?.map((snap) => (
                            <div
                              key={`snap-${item.id}-v${snap.version}`}
                              className="p-2.5 rounded-md bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                                    v{snap.version}
                                  </span>
                                  <span className="font-mono text-[10px] text-neutral-400">
                                    {new Date(snap.updatedAt).toLocaleDateString()} {new Date(snap.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                                  {snap.model}
                                </span>
                              </div>

                              {snap.changeNote && (
                                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic">
                                  « {snap.changeNote} »
                                </p>
                              )}

                              <p className="text-[10px] font-mono text-neutral-500 line-clamp-1 truncate bg-neutral-50 dark:bg-neutral-900/60 p-1 rounded">
                                {snap.prompt}
                              </p>

                              <div className="pt-1 flex items-center justify-between gap-2">
                                <button
                                  onClick={() => handleCopy(`${item.id}-v${snap.version}`, snap.prompt)}
                                  className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1"
                                >
                                  {copiedId === `${item.id}-v${snap.version}` ? (
                                    <Check className="w-3 h-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  <span>Copier v{snap.version}</span>
                                </button>

                                <button
                                  onClick={() => handleLoadSnapshot(item, snap)}
                                  className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
                                  title={`Charger la version v${snap.version} dans le Playground`}
                                >
                                  <RotateCcw className="w-2.5 h-2.5 text-cyan-500" />
                                  <span>Restaurer v{snap.version}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Actions Bar */}
                  <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800/80">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(item.id, item.prompt)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded transition-colors"
                        title="Copier le prompt actif"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === item.id ? 'Copié' : 'Copier'}</span>
                      </button>

                      {onOpenNewVersionModal && (
                        <button
                          onClick={() => {
                            onOpenNewVersionModal(item);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded transition-colors"
                          title="Créer une nouvelle itération (v+1) de ce prompt"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Nouvelle version</span>
                        </button>
                      )}

                      {isConfirming ? (
                        <div className="flex items-center gap-1 text-xs">
                          <button
                            onClick={() => {
                              onDeletePrompt(item.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-0.5 text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                          title="Supprimer ce favori et toutes ses versions"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        onLoadPrompt(item);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-xs"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Charger v{item.version || 1}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
