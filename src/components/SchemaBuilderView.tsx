import React, { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, AlertTriangle, Code, Play, Copy, Check, Sparkles } from 'lucide-react';
import { JsonSchemaProperty } from '../types/aiDev';
import { DEFAULT_SCHEMA_PROPERTIES } from '../data/presets';

interface SchemaBuilderViewProps {
  onExecuteSchema: (schema: any, prompt: string) => Promise<void>;
  isRunning: boolean;
  schemaResult: string;
}

export const SchemaBuilderView: React.FC<SchemaBuilderViewProps> = ({
  onExecuteSchema,
  isRunning,
  schemaResult,
}) => {
  const [properties, setProperties] = useState<JsonSchemaProperty[]>(DEFAULT_SCHEMA_PROPERTIES);
  const [testInput, setTestInput] = useState(
    "J'ai testé votre nouvelle version du dashboard ce matin. L'interface est remarquablement fluide et le temps de réponse est top ! Par contre le bouton d'export CSV ne réagit pas sur Firefox, et la documentation manque d'exemples en Python."
  );
  const [copied, setCopied] = useState(false);

  // Add a property
  const handleAddProperty = () => {
    const newProp: JsonSchemaProperty = {
      id: `prop-${Date.now()}`,
      name: `field_${properties.length + 1}`,
      type: 'STRING',
      description: 'Description du champ',
      required: true,
    };
    setProperties([...properties, newProp]);
  };

  // Remove a property
  const handleRemoveProperty = (id: string) => {
    setProperties(properties.filter((p) => p.id !== id));
  };

  // Update a property
  const handleUpdateProperty = (id: string, updates: Partial<JsonSchemaProperty>) => {
    setProperties(properties.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  // Construct JSON Schema object
  const generatedSchema = useMemo(() => {
    const propsObj: Record<string, any> = {};
    const requiredList: string[] = [];

    properties.forEach((p) => {
      if (p.name.trim()) {
        const fieldName = p.name.trim();
        if (p.type === 'ARRAY') {
          propsObj[fieldName] = {
            type: 'ARRAY',
            description: p.description,
            items: {
              type: p.itemType || 'STRING',
            },
          };
        } else {
          propsObj[fieldName] = {
            type: p.type,
            description: p.description,
          };
        }

        if (p.required) {
          requiredList.push(fieldName);
        }
      }
    });

    return {
      type: 'OBJECT',
      properties: propsObj,
      required: requiredList,
    };
  }, [properties]);

  // Validate parsed JSON output
  const validationStatus = useMemo(() => {
    if (!schemaResult) return null;
    try {
      const parsed = JSON.parse(schemaResult);
      // Check required fields
      const missing = generatedSchema.required.filter((key) => !(key in parsed));
      if (missing.length > 0) {
        return {
          valid: false,
          message: `Champs requis manquants : ${missing.join(', ')}`,
        };
      }
      return { valid: true, message: 'JSON 100% conforme au schéma strict' };
    } catch (err: any) {
      return { valid: false, message: 'Erreur de syntaxe JSON renvoyée' };
    }
  }, [schemaResult, generatedSchema]);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(JSON.stringify(generatedSchema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Left Column: Visual Schema Editor */}
      <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-y-auto">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/90">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Générateur de Schémas Structurés (JSON Schema)
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Garantit des réponses conformes au format typé via <code className="text-cyan-600 dark:text-cyan-400 font-mono">responseSchema</code> de l'API Gemini.
            </p>
          </div>
          <button
            onClick={handleAddProperty}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter champ</span>
          </button>
        </div>

        {/* Schema Properties Table */}
        <div className="p-4 space-y-3">
          {properties.map((prop, idx) => (
            <div
              key={prop.id}
              className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 space-y-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-neutral-400 w-5">#{idx + 1}</span>
                <input
                  type="text"
                  value={prop.name}
                  onChange={(e) => handleUpdateProperty(prop.id, { name: e.target.value })}
                  placeholder="nom_du_champ"
                  className="flex-1 text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />

                <select
                  value={prop.type}
                  onChange={(e) =>
                    handleUpdateProperty(prop.id, {
                      type: e.target.value as any,
                      ...(e.target.value === 'ARRAY' ? { itemType: 'STRING' } : {}),
                    })
                  }
                  className="text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="STRING">STRING</option>
                  <option value="NUMBER">NUMBER</option>
                  <option value="INTEGER">INTEGER</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                  <option value="ARRAY">ARRAY</option>
                  <option value="OBJECT">OBJECT</option>
                </select>

                <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={prop.required}
                    onChange={(e) => handleUpdateProperty(prop.id, { required: e.target.checked })}
                    className="rounded border-neutral-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Requis</span>
                </label>

                <button
                  onClick={() => handleRemoveProperty(prop.id)}
                  disabled={properties.length <= 1}
                  className="p-1 text-neutral-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {prop.type === 'ARRAY' && (
                <div className="flex items-center gap-2 pl-7 text-xs">
                  <span className="text-neutral-500">Type des éléments du tableau :</span>
                  <select
                    value={prop.itemType || 'STRING'}
                    onChange={(e) => handleUpdateProperty(prop.id, { itemType: e.target.value as any })}
                    className="text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 text-neutral-900 dark:text-neutral-100"
                  >
                    <option value="STRING">STRING</option>
                    <option value="NUMBER">NUMBER</option>
                    <option value="INTEGER">INTEGER</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="OBJECT">OBJECT</option>
                  </select>
                </div>
              )}

              <div className="pl-7">
                <input
                  type="text"
                  value={prop.description}
                  onChange={(e) => handleUpdateProperty(prop.id, { description: e.target.value })}
                  placeholder="Description sémantique pour guider le modèle..."
                  className="w-full text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1 text-neutral-700 dark:text-neutral-300 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Test Prompt Input */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/40">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block mb-1.5">
            Texte source de test (Prompt)
          </label>
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            rows={3}
            placeholder="Texte source à faire extraire et structurer..."
            className="w-full text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />

          <div className="mt-3 flex justify-end">
            <button
              onClick={() => onExecuteSchema(generatedSchema, testInput)}
              disabled={isRunning || !testInput.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validation du schéma...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Tester l'extraction structurée</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Generated Schema & Live Model Output */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-neutral-950 overflow-hidden">
        {/* Schema Definition Code Preview */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Spécification JSON Schema générée
            </span>
          </div>
          <button
            onClick={handleCopySchema}
            className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié' : 'Copier Schéma'}</span>
          </button>
        </div>

        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 max-h-40 overflow-y-auto bg-neutral-900 text-neutral-200 font-mono text-[11px] leading-relaxed">
          <pre>{JSON.stringify(generatedSchema, null, 2)}</pre>
        </div>

        {/* Live Output & Validation Badge */}
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/40">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Résultat JSON vérifié du modèle
          </span>

          {validationStatus && (
            <div
              className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded ${
                validationStatus.valid
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
              }`}
            >
              {validationStatus.valid ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>{validationStatus.message}</span>
            </div>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed">
          {isRunning ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
              <p className="text-xs font-sans text-neutral-600 dark:text-neutral-400">
                Extraction et validation stricte du schéma en cours...
              </p>
            </div>
          ) : schemaResult ? (
            <pre className="text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">
              {schemaResult}
            </pre>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-neutral-400 dark:text-neutral-600 space-y-2 font-sans">
              <Sparkles className="w-10 h-10 opacity-40 stroke-1" />
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Aucune sortie pour le moment
              </p>
              <p className="text-xs max-w-sm text-neutral-500">
                Configure les champs du schéma ci-contre, puis clique sur "Tester l'extraction structurée" pour tester la conformité JSON.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
