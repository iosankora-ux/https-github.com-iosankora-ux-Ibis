import { SavedPrompt, PromptVersionSnapshot } from '../types/aiDev';

const STORAGE_KEY = 'promptforge_favorite_prompts_v1';

export const INITIAL_FAVORITES: SavedPrompt[] = [
  {
    id: 'fav-dev-unit-tests',
    title: 'Générateur de Tests Unitaires Jest / Vitest',
    description: 'Crée une suite de tests unitaires complète avec cas limites, mocks et assertions strictes.',
    category: 'Qualité & Test',
    model: 'gemini-3.8-flash',
    thinkingLevel: 'MEDIUM',
    systemInstruction: `Tu es un Ingénieur QA et Développeur Senior spécialisé dans le TDD (Test Driven Development).
Pour le code fourni, génère une suite de tests unitaires complète utilisant Vitest/Jest :
- Couvre le happy path et les cas d'erreur/limites (edge cases, valeurs nulles, timeouts).
- Utilise des mocks réalistes et des assertions descriptives.
- Respecte le pattern Arrange-Act-Assert (AAA).`,
    prompt: `Écris les tests unitaires pour la fonction suivante en {{language}} :

\`\`\`{{language}}
{{source_code}}
\`\`\``,
    variables: {
      language: 'typescript',
      source_code: `export async function calculateTieredDiscount(userTier: string, orderTotal: number): Promise<number> {
  if (orderTotal < 0) throw new Error('Order total cannot be negative');
  let discountRate = 0;
  if (userTier === 'VIP') discountRate = 0.20;
  else if (userTier === 'PRO') discountRate = 0.10;
  else if (orderTotal > 100) discountRate = 0.05;
  return Math.round(orderTotal * (1 - discountRate) * 100) / 100;
}`,
    },
    version: 2,
    changeNote: 'Migration vers Vitest avec couverture stricte des edge cases et pattern AAA',
    versions: [
      {
        version: 1,
        updatedAt: '2026-11-01T10:00:00.000Z',
        changeNote: 'Version initiale avec assertions Jest basiques',
        model: 'gemini-3.8-flash',
        thinkingLevel: 'LOW',
        systemInstruction: 'Tu es un développeur. Génère des tests unitaires simples avec Jest.',
        prompt: `Écris des tests Jest simples pour ce code :
{{source_code}}`,
        variables: {
          language: 'typescript',
          source_code: `export function calculateDiscount(tier: string, total: number) { return total * 0.9; }`,
        },
      },
    ],
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fav-dev-git-commit',
    title: 'Rédacteur de Messages Conventional Commits',
    description: 'Génère un message git commit conforme aux spécifications Conventional Commits à partir d’un diff.',
    category: 'Productivité Git',
    model: 'gemini-3.8-flash',
    thinkingLevel: 'LOW',
    systemInstruction: `Tu es un assistant Git automatisé.
Génère un message de commit concis et percutant suivant la spécification Conventional Commits (ex: feat(auth): ..., fix(api): ...).
Inclus :
1. Une ligne de titre de moins de 60 caractères en impératif présent.
2. Une description succincte en puces expliquant le pourquoi des changements.
3. Le tag BREAKING CHANGE si applicable.`,
    prompt: `Voici le git diff des modifications :
\`\`\`diff
{{git_diff}}
\`\`\`

Rédige le message de commit idéal.`,
    variables: {
      git_diff: `--- a/src/services/auth.ts
+++ b/src/services/auth.ts
@@ -14,6 +14,8 @@ export async function verifyToken(token: string) {
+  if (!token || token.trim() === '') {
+    throw new UnauthorizedError('Missing bearer token');
+  }
   const payload = await jwt.verify(token, secret);
+  await redis.set(\`token_seen:\${payload.sub}\`, '1', 'EX', 3600);
   return payload;`,
    },
    version: 1,
    changeNote: 'Version initiale conforme Conventional Commits v1.0',
    versions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getSavedPrompts(): SavedPrompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FAVORITES));
      return INITIAL_FAVORITES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return INITIAL_FAVORITES;

    // Migrate any legacy entries without version
    return parsed.map((item) => ({
      ...item,
      version: typeof item.version === 'number' && item.version >= 1 ? item.version : 1,
      changeNote: item.changeNote || (item.version > 1 ? `Itération v${item.version}` : 'Version initiale (v1)'),
      versions: Array.isArray(item.versions) ? item.versions : [],
    }));
  } catch (err) {
    console.warn('Failed to read saved prompts from localStorage:', err);
    return INITIAL_FAVORITES;
  }
}

export function savePrompt(
  promptData: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'versions'> & {
    version?: number;
    changeNote?: string;
  }
): SavedPrompt {
  const current = getSavedPrompts();
  const newPrompt: SavedPrompt = {
    ...promptData,
    id: `fav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    version: promptData.version || 1,
    changeNote: promptData.changeNote || 'Version initiale (v1)',
    versions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [newPrompt, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save prompt to localStorage:', err);
  }
  return newPrompt;
}

export function saveNewPromptVersion(
  targetPromptId: string,
  versionData: {
    model: SavedPrompt['model'];
    thinkingLevel: SavedPrompt['thinkingLevel'];
    systemInstruction: string;
    prompt: string;
    variables: Record<string, string>;
    changeNote?: string;
    title?: string;
    description?: string;
    category?: string;
  }
): { updatedPrompts: SavedPrompt[]; targetPrompt: SavedPrompt } {
  const current = getSavedPrompts();
  const targetIndex = current.findIndex((p) => p.id === targetPromptId);

  if (targetIndex === -1) {
    // If target not found, fallback to creating a new prompt
    const created = savePrompt({
      title: versionData.title || 'Prompt Sans Titre',
      description: versionData.description || '',
      category: versionData.category || 'Général',
      model: versionData.model,
      thinkingLevel: versionData.thinkingLevel,
      systemInstruction: versionData.systemInstruction,
      prompt: versionData.prompt,
      variables: versionData.variables,
      version: 1,
      changeNote: versionData.changeNote,
    });
    return { updatedPrompts: getSavedPrompts(), targetPrompt: created };
  }

  const existing = current[targetIndex];
  const currentVersionNumber = existing.version || 1;
  const newVersionNumber = currentVersionNumber + 1;

  // Create a snapshot of the state before this iteration
  const previousSnapshot: PromptVersionSnapshot = {
    version: currentVersionNumber,
    updatedAt: existing.updatedAt || existing.createdAt,
    changeNote: existing.changeNote || `Version v${currentVersionNumber}`,
    model: existing.model,
    thinkingLevel: existing.thinkingLevel,
    systemInstruction: existing.systemInstruction,
    prompt: existing.prompt,
    variables: existing.variables || {},
  };

  const updatedPrompt: SavedPrompt = {
    ...existing,
    title: versionData.title ? versionData.title.trim() : existing.title,
    description: versionData.description !== undefined ? versionData.description.trim() : existing.description,
    category: versionData.category ? versionData.category.trim() : existing.category,
    model: versionData.model,
    thinkingLevel: versionData.thinkingLevel,
    systemInstruction: versionData.systemInstruction,
    prompt: versionData.prompt,
    variables: versionData.variables,
    version: newVersionNumber,
    changeNote: versionData.changeNote?.trim() || `Itération v${newVersionNumber}`,
    versions: [previousSnapshot, ...(existing.versions || [])],
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...current];
  updatedList[targetIndex] = updatedPrompt;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to save new prompt version to localStorage:', err);
  }

  return { updatedPrompts: updatedList, targetPrompt: updatedPrompt };
}

export function updateSavedPrompt(
  id: string,
  updates: Partial<Omit<SavedPrompt, 'id' | 'createdAt'>>
): SavedPrompt[] {
  const current = getSavedPrompts();
  const updated = current.map((p) =>
    p.id === id
      ? {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      : p
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update prompt in localStorage:', err);
  }
  return updated;
}

export function deleteSavedPrompt(id: string): SavedPrompt[] {
  const current = getSavedPrompts();
  const updated = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete prompt from localStorage:', err);
  }
  return updated;
}
