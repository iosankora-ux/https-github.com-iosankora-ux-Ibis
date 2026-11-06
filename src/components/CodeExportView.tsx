import React, { useState, useMemo, useEffect } from 'react';
import {
  Copy,
  Check,
  Download,
  Terminal,
  FileCode2,
  ShieldCheck,
  FileText,
  Sparkles,
  Package,
  FolderArchive,
  BookOpen,
  Layers,
  Code2,
  RefreshCw,
  CheckCircle2,
  FolderTree,
  ArrowDownToLine,
  Eye,
  Edit3,
} from 'lucide-react';
import JSZip from 'jszip';
import { ModelName, ThinkingLevelOption } from '../types/aiDev';

interface CodeExportViewProps {
  model: ModelName;
  systemInstruction: string;
  prompt: string;
  thinkingLevel: ThinkingLevelOption;
  schema?: any;
}

export const CodeExportView: React.FC<CodeExportViewProps> = ({
  model,
  systemInstruction,
  prompt,
  thinkingLevel,
  schema,
}) => {
  // Main view tab: 'sdk' | 'readme' | 'full_project'
  const [activeTab, setActiveTab] = useState<'sdk' | 'readme' | 'full_project'>('readme');
  const [lang, setLang] = useState<'typescript' | 'python' | 'curl'>('typescript');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReadme, setCopiedReadme] = useState(false);

  // README state
  const [readmeContent, setReadmeContent] = useState<string>('');
  const [readmeMode, setReadmeMode] = useState<'preview' | 'raw'>('preview');
  const [isGeneratingReadme, setIsGeneratingReadme] = useState<boolean>(false);
  const [readmeSource, setReadmeSource] = useState<'analyzed' | 'ai_enhanced'>('analyzed');

  // ZIP download state
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Generate TypeScript code
  const tsCode = useMemo(() => {
    return `import { GoogleGenAI, ThinkingLevel } from '@google/genai';

// Initialise the client using server environment variable
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function runAI() {
  const response = await ai.models.generateContent({
    model: '${model}',
    contents: ${JSON.stringify(prompt || 'Exemple de requête utilisateur', null, 2)},
    config: {
${systemInstruction ? `      systemInstruction: ${JSON.stringify(systemInstruction)},\n` : ''}      thinkingConfig: {
        thinkingLevel: ThinkingLevel.${thinkingLevel},
      },
${schema ? `      responseMimeType: 'application/json',\n      responseSchema: ${JSON.stringify(schema, null, 6)},\n` : ''}    },
  });

  console.log('AI Output:\\n', response.text);
}

runAI().catch(console.error);
`;
  }, [model, systemInstruction, prompt, thinkingLevel, schema]);

  // Generate Python code
  const pyCode = useMemo(() => {
    return `import os
from google import genai
from google.genai import types

# Initialise client with GEMINI_API_KEY from environment
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

response = client.models.generate_content(
    model="${model}",
    contents=${JSON.stringify(prompt || 'Exemple de requête utilisateur')},
    config=types.GenerateContentConfig(
${systemInstruction ? `        system_instruction=${JSON.stringify(systemInstruction)},\n` : ''}        thinking_config=types.ThinkingConfig(
            thinking_level=types.ThinkingLevel.${thinkingLevel}
        ),
${schema ? `        response_mime_type="application/json",\n` : ''}    )
)

print(response.text)
`;
  }, [model, systemInstruction, prompt, thinkingLevel, schema]);

  // Generate cURL command
  const curlCode = useMemo(() => {
    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt || 'Exemple de requête' }] }],
      ...(systemInstruction
        ? { systemInstruction: { parts: [{ text: systemInstruction }] } }
        : {}),
      generationConfig: {
        ...(schema ? { responseMimeType: 'application/json' } : {}),
      },
    };

    return `curl "https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=\${GEMINI_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(payload, null, 2)}'`;
  }, [model, systemInstruction, prompt, schema]);

  const activeCode = lang === 'typescript' ? tsCode : lang === 'python' ? pyCode : curlCode;

  // Semantic analysis of current systemInstruction
  const systemPromptAnalysis = useMemo(() => {
    const text = systemInstruction || '';
    const length = text.length;
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').filter((l) => l.trim().length > 0);

    // Heuristics to detect persona and key capabilities
    let detectedRole = 'Assistant Intelligent & Moteur de Raisonnement';
    if (/lead|architecte|senior|expert/i.test(text)) {
      detectedRole = 'Lead Architecte & Ingénieur Système';
    } else if (/securit|guardrail|owasp|audit/i.test(text)) {
      detectedRole = 'Auditeur de Sécurité & Garde-Fou Proactif';
    } else if (/symbolique|neuro-symbolic|lean|math/i.test(text)) {
      detectedRole = 'Moteur Neuro-Symbolique & Preuve Formelle';
    } else if (/agent|hitl|supervisor|planner/i.test(text)) {
      detectedRole = 'Orchestrateur Multi-Agents & HITL';
    }

    const hasSecurityDirectives = /sécurité|interdit|jamais|protection|guardrail|ne pas/i.test(text);
    const hasStructuredOutput = /json|schéma|format|type/i.test(text) || !!schema;

    return {
      length,
      wordCount,
      lineCount: lines.length,
      detectedRole,
      hasSecurityDirectives,
      hasStructuredOutput,
      primaryFocus: lines[0] ? lines[0].replace(/^[#\s*-]+/, '') : 'Inférence générale et développement',
    };
  }, [systemInstruction, schema]);

  // Generate default structured README based on analysis
  const defaultGeneratedReadme = useMemo(() => {
    const projectName = systemPromptAnalysis.detectedRole
      .replace(/[^a-zA-Z0-9À-ÿ\s]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    return `# ${systemPromptAnalysis.detectedRole}

[![Modèle](https://img.shields.io/badge/Gemini-3.8_Flash-0284c7.svg)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite_6-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Style-Tailwind_CSS_4-38bdf8.svg)](https://tailwindcss.com/)
[![Licence](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

> Ce projet est un environnement de développement full-stack propulsé par l'IA et configuré autour d'un **Prompt Système** hautement spécialisé avec le modèle **${model}** et le SDK officiel **@google/genai**.

---

## 🎯 1. Analyse & Spécifications du Prompt Système

Le comportement fondamental de l'agent est régi par les directives système suivantes :

\`\`\`text
${systemInstruction || 'Assistant technique et moteur de raisonnement pour développement logiciel.'}
\`\`\`

### Synthèse des directives :
- **Rôle identifié :** ${systemPromptAnalysis.detectedRole}
- **Objectif principal :** ${systemPromptAnalysis.primaryFocus}
- **Contraintes de sécurité :** ${
      systemPromptAnalysis.hasSecurityDirectives
        ? 'Règles strictes de non-divulgation et protection des données sensibles activées'
        : 'Conformité standard de sécurité OWASP'
    }
- **Sortie structurée :** ${
      systemPromptAnalysis.hasStructuredOutput
        ? 'Validation par Schéma JSON typé avec typage strict'
        : 'Génération textuelle standard en Markdown'
    }
- **Niveau de réflexion (Thinking Level) :** \`${thinkingLevel}\` (contrôle du budget de calcul cognitif)

---

## 🏗️ 2. Architecture du Projet

L'application est architecturée pour garantir la séparation stricte entre client et serveur :

\`\`\`
.
├── server.ts               # Serveur proxy Express & middleware Vite (Gestion sécurisée de GEMINI_API_KEY)
├── src/
│   ├── App.tsx             # Composant racine avec navigation par onglets
│   ├── components/         # Modules spécialisés (Playground, Agents HITL, XAI, Benchmark, etc.)
│   │   ├── PlaygroundView.tsx        # Bac à sable avec latence TTFT et graphiques de tokens
│   │   ├── AgenticWorkspaceView.tsx  # Graphe DAG interactif avec glisser-déposer
│   │   ├── CodeExportView.tsx        # Export de code et générateur de documentation
│   │   └── AdvancedAlgorithmsView.tsx# Solveurs neuro-symboliques (Lean 4, AlphaGeometry)
│   ├── types/
│   │   └── aiDev.ts        # Interfaces TypeScript complètes du modèle de données
│   └── main.tsx            # Point d'entrée React 19
├── package.json            # Dépendances (Node >= 18, React 19, @google/genai, Tailwind CSS)
└── README.md               # Documentation complète du projet
\`\`\`

---

## ⚙️ 3. Prérequis Système

- **Node.js** : Version 18.0.0 ou supérieure requise
- **npm** ou **pnpm**
- **Clé d'API Google Gemini** : Obtenez-la gratuitement sur [Google AI Studio](https://aistudio.google.com/)

---

## 🚀 4. Guide d'Installation Pas à Pas

### Étape 1 : Cloner le dépôt et entrer dans le dossier
\`\`\`bash
git clone https://github.com/votre-compte/${projectName.toLowerCase()}.git
cd ${projectName.toLowerCase()}
\`\`\`

### Étape 2 : Installer les dépendances du projet
\`\`\`bash
npm install
\`\`\`

### Étape 3 : Configurer les variables d'environnement
Créez un fichier \`.env\` à la racine du projet à partir du gabarit :
\`\`\`bash
cp .env.example .env
\`\`\`

Éditez le fichier \`.env\` et ajoutez votre clé d'API Google Gemini :
\`\`\`env
# Fichier .env
GEMINI_API_KEY="AIzaSy..."
PORT=3000
NODE_ENV=development
\`\`\`

> ⚠️ **Sécurité :** Ne commitez jamais votre fichier \`.env\` dans Git. La clé doit demeurer exclusivement côté serveur.

---

## 💻 5. Guide d'Utilisation

### Lancer l'environnement de développement
\`\`\`bash
npm run dev
\`\`\`
L'application est accessible sur : [http://localhost:3000](http://localhost:3000)

### Compiler et exécuter en production
\`\`\`bash
npm run build
npm start
\`\`\`

### Exemple d'intégration programmatique (SDK @google/genai)
Vous pouvez directement exécuter le prompt système via le script TypeScript généré :

\`\`\`typescript
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main() {
  const response = await ai.models.generateContent({
    model: '${model}',
    contents: '${prompt ? prompt.replace(/'/g, "\\'") : 'Bonjour, exécute la mission demandée.'}',
    config: {
      systemInstruction: \`${systemInstruction || 'Tu es un assistant de haute précision.'}\`,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.${thinkingLevel},
      },
    },
  });

  console.log(response.text);
}

main();
\`\`\`

---

## 🛡️ 6. Sécurité & Bonnes Pratiques

1. **Proxy Server-Side :** Les appels vers l'API Gemini transitent par les routes \`/api/gemini/*\` dans \`server.ts\`. La clé API n'est jamais exposée au navigateur.
2. **Supervision HITL (Human-in-the-Loop) :** Pour les actions critiques (migrations SQL, scripts d'exécution), une validation humaine explicite est requise.
3. **Guardrails Sémantiques :** Filtrage actif contre les injections de prompt et conformité OWASP Top 10 LLM.

---

## 📄 Licence

Distribué sous la licence **MIT**. Voir \`LICENSE\` pour plus d'informations.
`;
  }, [systemInstruction, systemPromptAnalysis, model, thinkingLevel, prompt, schema]);

  // Initialize readmeContent if empty
  useEffect(() => {
    if (!readmeContent) {
      setReadmeContent(defaultGeneratedReadme);
    }
  }, [defaultGeneratedReadme]);

  // AI-powered README generation
  const handleGenerateAiReadme = async () => {
    setIsGeneratingReadme(true);
    setDownloadError(null);
    try {
      const response = await fetch('/api/gemini/generate-readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction,
          prompt,
          model,
          thinkingLevel,
          schema,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.readme) {
        throw new Error(data.error || 'Erreur de génération');
      }

      setReadmeContent(data.readme);
      setReadmeSource('ai_enhanced');
    } catch (err: any) {
      // Graceful fallback to deterministic analysis
      setReadmeContent(defaultGeneratedReadme);
      setReadmeSource('analyzed');
    } finally {
      setIsGeneratingReadme(false);
    }
  };

  const handleCopyReadme = () => {
    navigator.clipboard.writeText(readmeContent);
    setCopiedReadme(true);
    setTimeout(() => setCopiedReadme(false), 2000);
  };

  const handleDownloadReadme = () => {
    const blob = new Blob([readmeContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadCodeFile = () => {
    const filename =
      lang === 'typescript'
        ? 'generate_gemini.ts'
        : lang === 'python'
        ? 'generate_gemini.py'
        : 'generate_gemini.sh';

    const blob = new Blob([activeCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Full source code ZIP download handler
  const handleDownloadFullProjectZip = async () => {
    setIsZipping(true);
    setDownloadError(null);
    setZipSuccess(false);

    try {
      // 1. Fetch all real source files from server endpoint
      const res = await fetch('/api/export/project-files');
      if (!res.ok) {
        throw new Error('Impossible de récupérer l’arborescence des fichiers du serveur.');
      }
      const data = await res.json();
      const files: Array<{ path: string; content: string }> = data.files || [];

      // 2. Build ZIP archive with JSZip
      const zip = new JSZip();

      // Add all project files
      for (const file of files) {
        zip.file(file.path, file.content);
      }

      // Add or override README.md with the current analyzed/generated README
      zip.file('README.md', readmeContent);

      // Add standalone client script
      zip.file('client_gemini.ts', tsCode);
      zip.file('client_gemini.py', pyCode);

      // 3. Generate binary zip blob
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      // 4. Trigger browser download
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `promptforge-project-${Date.now().toString(36)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 4000);
    } catch (err: any) {
      console.error('ZIP generation error:', err);
      setDownloadError(err.message || 'Échec de création de l’archive ZIP');
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-6xl mx-auto w-full overflow-y-auto">
      {/* Title & Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <FileCode2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <span>Export de Code & Générateur de Documentation</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-200 dark:border-cyan-800">
              SDK & README Automatique
            </span>
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Analyse de prompt système, documentation Markdown automatisée et téléchargement complet du projet source (.ZIP).
          </p>
        </div>

        {/* Global Action: 1-Click Complete Project Download */}
        <button
          onClick={handleDownloadFullProjectZip}
          disabled={isZipping}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-sm shrink-0 disabled:opacity-50"
        >
          {isZipping ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Compression de l'archive ZIP...</span>
            </>
          ) : zipSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>ZIP Téléchargé avec Succès !</span>
            </>
          ) : (
            <>
              <ArrowDownToLine className="w-4 h-4" />
              <span>Télécharger Code Source Complet (.ZIP)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-neutral-200 dark:border-neutral-800 mb-5 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('readme')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
            activeTab === 'readme'
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <FileText className="w-4 h-4 text-cyan-500" />
          <span>Générateur de README.md (Analyse Prompt)</span>
        </button>

        <button
          onClick={() => setActiveTab('sdk')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
            activeTab === 'sdk'
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Code2 className="w-4 h-4 text-cyan-500" />
          <span>Scripts SDK (@google/genai)</span>
        </button>

        <button
          onClick={() => setActiveTab('full_project')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-colors ${
            activeTab === 'full_project'
              ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <FolderArchive className="w-4 h-4 text-cyan-500" />
          <span>Guide de Téléchargement & Déploiement</span>
        </button>
      </div>

      {downloadError && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-600 dark:text-red-400 flex items-center justify-between">
          <span>{downloadError}</span>
          <button onClick={() => setDownloadError(null)} className="font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: README.MD GENERATOR MODULE */}
      {activeTab === 'readme' && (
        <div className="space-y-4">
          {/* Analysis Header Card */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  Analyse Sémantique du Prompt Système Actuel
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  {systemPromptAnalysis.wordCount} mots • {systemPromptAnalysis.lineCount} lignes
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateAiReadme}
                  disabled={isGeneratingReadme}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 shadow-xs"
                >
                  {isGeneratingReadme ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Analyse et Rédaction IA...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Enrichir le README avec l'IA</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Analysis Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Rôle Détecté</span>
                <span className="font-bold text-cyan-700 dark:text-cyan-300 truncate block">
                  {systemPromptAnalysis.detectedRole}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Modèle Ciblé</span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {model} ({thinkingLevel})
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Garde-Fous Détectés</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {systemPromptAnalysis.hasSecurityDirectives ? 'Actifs (Conforme)' : 'Standard'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                <span className="text-[10px] text-neutral-400 block">Format de Sortie</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">
                  {systemPromptAnalysis.hasStructuredOutput ? 'Schéma JSON Typé' : 'Markdown Structuré'}
                </span>
              </div>
            </div>
          </div>

          {/* README Editor / Preview Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setReadmeMode('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  readmeMode === 'preview'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Aperçu Rendu (Markdown)</span>
              </button>
              <button
                onClick={() => setReadmeMode('raw')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  readmeMode === 'raw'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Code Markdown Brut</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-neutral-400 mr-2">
                Source : {readmeSource === 'ai_enhanced' ? 'Gemini 3.8 Flash' : 'Analyseur Local'}
              </span>

              <button
                onClick={handleCopyReadme}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 transition-colors shadow-xs"
              >
                {copiedReadme ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-neutral-400" />
                )}
                <span>{copiedReadme ? 'Copié !' : 'Copier README.md'}</span>
              </button>

              <button
                onClick={handleDownloadReadme}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger README.md</span>
              </button>
            </div>
          </div>

          {/* README Content Canvas */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs min-h-[500px] flex flex-col">
            {readmeMode === 'raw' ? (
              <div className="flex-1 p-4 flex flex-col">
                <textarea
                  value={readmeContent}
                  onChange={(e) => setReadmeContent(e.target.value)}
                  className="flex-1 w-full h-[520px] font-mono text-xs text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-950 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-y leading-relaxed"
                />
              </div>
            ) : (
              <div className="p-6 md:p-8 space-y-5 text-neutral-800 dark:text-neutral-200 text-xs leading-relaxed max-w-4xl overflow-y-auto">
                {/* Styled rendered Markdown simulation */}
                <div className="border-b border-neutral-200 dark:border-neutral-800 pb-4">
                  <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <span>{systemPromptAnalysis.detectedRole}</span>
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 font-mono text-[10px] font-semibold">
                      Gemini 3.8 Flash
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-[10px] font-semibold">
                      TypeScript 5.x
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] font-semibold">
                      Node.js &gt;= 18
                    </span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 font-mono text-[10px] font-semibold">
                      Vite 6 + Express
                    </span>
                  </div>
                </div>

                {/* Section 1 */}
                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                    <span>🎯 1. Analyse & Spécifications du Prompt Système</span>
                  </h2>
                  <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                    {systemInstruction || 'Assistant technique et moteur de raisonnement pour développement logiciel.'}
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    🏗️ 2. Architecture & Séparation des Couches
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Le projet adopte un modèle server-side strict où la clé <code className="font-mono text-cyan-600 dark:text-cyan-400">GEMINI_API_KEY</code> est confinée au processus Node.js Express (<code className="font-mono">server.ts</code>), évitant toute fuite dans les builds frontend ou le localStorage.
                  </p>
                </div>

                {/* Section 3 */}
                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    🚀 3. Guide d'Installation Rapide
                  </h2>
                  <div className="p-3 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-[11px] space-y-1">
                    <p className="text-neutral-400"># 1. Installer les dépendances</p>
                    <p className="text-cyan-400">npm install</p>
                    <p className="text-neutral-400 mt-2"># 2. Configurer la clé d'API</p>
                    <p className="text-cyan-400">echo "GEMINI_API_KEY=votre_cle_ici" &gt; .env</p>
                    <p className="text-neutral-400 mt-2"># 3. Lancer en développement</p>
                    <p className="text-cyan-400">npm run dev</p>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="space-y-2">
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    💻 4. Appel SDK @google/genai Dédié
                  </h2>
                  <div className="p-3 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-[11px] overflow-x-auto">
                    <pre>{tsCode.slice(0, 480)}...</pre>
                  </div>
                </div>

                {/* Footer note */}
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500">
                  Pour obtenir l'intégralité du document prêt à commiter, cliquez sur <strong>"Télécharger README.md"</strong> ou basculez en vue <strong>"Code Markdown Brut"</strong>.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SDK SCRIPTS (TYPESCRIPT, PYTHON, CURL) */}
      {activeTab === 'sdk' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-neutral-200/70 dark:bg-neutral-800/80 p-1 rounded-lg text-xs">
              <button
                onClick={() => setLang('typescript')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  lang === 'typescript'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                TypeScript (Node.js)
              </button>
              <button
                onClick={() => setLang('python')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  lang === 'python'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setLang('curl')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  lang === 'curl'
                    ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                cURL / Bash
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadCodeFile}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger fichier</span>
              </button>

              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shadow-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copié !' : 'Copier le code'}</span>
              </button>
            </div>
          </div>

          {/* Code Box */}
          <div className="rounded-xl border border-neutral-300 dark:border-neutral-800 bg-neutral-900 overflow-hidden shadow-sm flex flex-col">
            <div className="px-4 py-2.5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400 font-mono">
              <span>
                {lang === 'typescript'
                  ? 'client.ts — npm i @google/genai'
                  : lang === 'python'
                  ? 'client.py — pip install google-genai'
                  : 'request.sh'}
              </span>
              <span>UTF-8</span>
            </div>

            <div className="p-4 overflow-x-auto font-mono text-xs text-neutral-100 leading-relaxed">
              <pre>{activeCode}</pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FULL PROJECT DOWNLOAD & SETUP GUIDE */}
      {activeTab === 'full_project' && (
        <div className="space-y-5">
          {/* Main Download Callout */}
          <div className="p-6 rounded-xl border border-cyan-300 dark:border-cyan-800/80 bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-transparent shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Téléchargement Direct du Projet Source Complet (.ZIP)</span>
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
                  Cette action génère une archive ZIP autonome comprenant l'ensemble des fichiers sources du projet : serveur Express (<code className="font-mono">server.ts</code>), composants React, configuration Vite, package.json, types TypeScript et la documentation <code className="font-mono">README.md</code> générée.
                </p>
              </div>

              <button
                onClick={handleDownloadFullProjectZip}
                disabled={isZipping}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shrink-0 disabled:opacity-50"
              >
                {isZipping ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Création de l'archive en cours...</span>
                  </>
                ) : zipSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Archive ZIP Téléchargée !</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Télécharger l'Archive (.ZIP)</span>
                  </>
                )}
              </button>
            </div>

            {/* Checklist of files included */}
            <div className="pt-3 border-t border-cyan-200/60 dark:border-cyan-900/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>server.ts (Backend)</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>src/**/*.tsx (React SPA)</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>README.md (Markdown)</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>package.json & tsconfig</span>
              </div>
            </div>
          </div>

          {/* Three alternative methods to download and clone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-2">
              <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-mono text-[11px]">
                  1
                </span>
                <span>Téléchargement ZIP (1 Clic)</span>
              </div>
              <p className="text-neutral-500 leading-relaxed">
                Utilisez le bouton ci-dessus pour télécharger immédiatement l'archive compressée prête à être dézippée et exécutée sur votre machine locale.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-2">
              <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-mono text-[11px]">
                  2
                </span>
                <span>Export Natif AI Studio</span>
              </div>
              <p className="text-neutral-500 leading-relaxed">
                Dans l'interface de Google AI Studio, vous pouvez également cliquer sur le menu supérieur pour exporter directement le projet vers un dépôt <strong>GitHub</strong> ou télécharger les artefacts.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 space-y-2">
              <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-neutral-100">
                <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 flex items-center justify-center font-mono text-[11px]">
                  3
                </span>
                <span>Déploiement en 3 Lignes</span>
              </div>
              <div className="bg-neutral-100 dark:bg-neutral-950 p-2 rounded font-mono text-[10px] text-neutral-700 dark:text-neutral-300 space-y-1">
                <p>unzip promptforge-*.zip</p>
                <p>npm install</p>
                <p>npm run dev</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
