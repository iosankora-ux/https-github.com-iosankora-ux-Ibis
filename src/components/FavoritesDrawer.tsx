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
  Calendar,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { SavedPrompt } from '../types/aiDev';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedPrompts: SavedPrompt[];
  onLoadPrompt: (prompt: SavedPrompt) => void;
  onDeletePrompt: (id: string) => void;
  onImportPrompts: (prompts: SavedPrompt[]) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  savedPrompts,
  onLoadPrompt,
  onDeletePrompt,
  onImportPrompts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
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
    downloadAnchor.setAttribute('download', `promptforge_favoris_${new Date().toISOString().slice(0, 10)}.json`);
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
      } catch (err) {
        alert('Fichier JSON invalide pour les favoris');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
                <span>Mes Prompts Favoris</span>
                <span className="text-xs font-mono font-normal text-neutral-400 tabular-nums">
                  ({savedPrompts.length})
                </span>
              </h2>
              <p className="text-xs text-neutral-500">
                Stockés localement dans votre navigateur.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export JSON */}
            <button
              onClick={handleExportJSON}
              title="Exporter tous les favoris en JSON"
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
              placeholder="Rechercher un favori par nom, consigne ou mot-clé..."
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
                  ? 'Pour ajouter un favori, rédigez un prompt dans le Playground puis cliquez sur « Sauvegarder en favori ».'
                  : 'Modifiez les termes de recherche ou sélectionnez une autre catégorie.'}
              </p>
            </div>
          ) : (
            filteredPrompts.map((item) => {
              const varCount = Object.keys(item.variables || {}).length;
              const isConfirming = confirmDeleteId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all space-y-2.5"
                >
                  {/* Top line: title & category */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
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

                  {/* Clean unboxed metadata with bullet separators */}
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono flex-wrap">
                    <span className="text-cyan-700 dark:text-cyan-400">{item.model}</span>
                    <span aria-hidden="true">·</span>
                    <span>Thinking: {item.thinkingLevel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{varCount} variable(s)</span>
                    <span aria-hidden="true">·</span>
                    <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                  </div>

                  {/* Prompt preview */}
                  <div className="p-2 rounded bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800/80 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 max-h-24 overflow-hidden text-ellipsis line-clamp-3">
                    {item.prompt}
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(item.id, item.prompt)}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded transition-colors"
                        title="Copier le prompt"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedId === item.id ? 'Copié' : 'Copier'}</span>
                      </button>

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
                          title="Supprimer des favoris"
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
                      <span>Charger dans le Playground</span>
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
