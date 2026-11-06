import { SavedPrompt } from '../types/aiDev';

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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getSavedPrompts(): SavedPrompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed initial favorites for immediate delight
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FAVORITES));
      return INITIAL_FAVORITES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_FAVORITES;
  } catch (err) {
    console.warn('Failed to read saved prompts from localStorage:', err);
    return INITIAL_FAVORITES;
  }
}

export function savePrompt(
  promptData: Omit<SavedPrompt, 'id' | 'createdAt' | 'updatedAt'>
): SavedPrompt {
  const current = getSavedPrompts();
  const newPrompt: SavedPrompt = {
    ...promptData,
    id: `fav-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
