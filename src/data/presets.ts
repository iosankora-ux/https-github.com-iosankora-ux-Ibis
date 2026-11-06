import { PromptPreset, FunctionTool, JsonSchemaProperty } from '../types/aiDev';

export const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'code-review',
    title: 'Réviseur de Code & Détection de Failles',
    category: 'code',
    description: 'Analyse rigoureuse de la sécurité, performance, complexité algorithmique et bonnes pratiques.',
    systemInstruction: `Tu es un Tech Lead Senior et Auditeur de Sécurité Logicielle.
Pour chaque extrait de code fourni :
1. Identifie les vulnérabilités de sécurité potentielles (injections, race conditions, memory leaks).
2. Propose des optimisations de performance et de complexité temporelle/spatiale.
3. Rédige une version refactorisée propre, typée et commentée.
4. Conclus avec un résumé pragmatique en puces.`,
    userPrompt: `Analyse et optimise la fonction suivante en {{language}} :

\`\`\`{{language}}
{{code_snippet}}
\`\`\``,
    variables: {
      language: 'typescript',
      code_snippet: `export async function fetchUserOrders(userId: string) {
  const user = await db.query('SELECT * FROM users WHERE id = ' + userId);
  const orders = [];
  for (const oId of user.orderIds) {
    const order = await db.query('SELECT * FROM orders WHERE id = ' + oId);
    orders.push(order);
  }
  return orders;
}`,
    },
    model: 'gemini-3.8-flash',
    thinkingLevel: 'MEDIUM',
  },
  {
    id: 'api-architect',
    title: 'Architecte d’API REST & OpenAPI Spec',
    category: 'architecture',
    description: 'Génération de contrat d’API propre avec endpoints, codes HTTP, idempotence et schémas d’erreur.',
    systemInstruction: `Tu es un Principal Software Architect spécialisé dans la conception de plateformes d'API RESTful et GraphQL résilientes.
Génère une spécification d'API claire, cohérente et suivant les RFC standards (codes d'état HTTP précis, pagination par curseur, gestion des erreurs RFC 7807).`,
    userPrompt: `Conçois la spécification d'API pour le service suivant :
Service : {{service_name}}
Besoins métier : {{business_requirements}}
Contraintes techniques : {{constraints}}`,
    variables: {
      service_name: 'Service de Facturation & Abonnements SaaS',
      business_requirements: 'Gestion des plans mensuels/annuels, prélèvement automatique, calcul de TVA multi-pays, factures PDF téléchargeables, webhooks Stripe.',
      constraints: 'Idempotence stricte sur les paiements, pagination par curseur, conformité RGPD.',
    },
    model: 'gemini-3.8-flash',
    thinkingLevel: 'HIGH',
  },
  {
    id: 'sql-optimizer',
    title: 'Générateur & Optimiseur de Requêtes SQL',
    category: 'code',
    description: 'Conception de requêtes SQL PostgreSQL complexes avec EXPLAIN ANALYZE et indexation recommandée.',
    systemInstruction: `Tu es un DBA (Database Administrator) et expert PostgreSQL.
Écris la requête SQL la plus optimale pour le besoin décrit.
Ajoute l'explication du plan d'exécution, les index B-tree ou GiST recommandés, et les pièges de locking à éviter.`,
    userPrompt: `Schéma de la base :
{{schema_definition}}

Besoin de requête :
{{query_goal}}`,
    variables: {
      schema_definition: `CREATE TABLE users (id UUID PRIMARY KEY, email TEXT, created_at TIMESTAMPTZ);
CREATE TABLE orders (id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), amount_cents INT, status TEXT, created_at TIMESTAMPTZ);
CREATE TABLE order_items (id UUID PRIMARY KEY, order_id UUID REFERENCES orders(id), product_id UUID, quantity INT);`,
      query_goal: 'Calculer la valeur moyenne du panier (AOV), le taux de réachat à 30 jours et les 5 clients les plus dépensiers du dernier trimestre.',
    },
    model: 'gemini-3.8-flash',
    thinkingLevel: 'MEDIUM',
  },
  {
    id: 'structured-extractor',
    title: 'Extracteur de Données Non-Structurées',
    category: 'extraction',
    description: 'Extraction de données clés à partir de texte brut, emails ou factures vers un format structuré.',
    systemInstruction: `Tu es un pipeline ETL automatisé. Extrais les métadonnées clés du document fourni sans inventer d'information.
Si une donnée est manquante, indique null. Sois exhaustif et fidèle au texte source.`,
    userPrompt: `Texte source à analyser :
"""
{{raw_document}}
"""

Extrais les informations sous forme de liste structurée : Entités, Dates, Montants, Actions requises et Personnes de contact.`,
    variables: {
      raw_document: `Objet: Confirmation de renouvellement licence Cloud - Entreprise TechCorp
Bonjour Marc,
Suite à notre échange du 14 octobre 2026, nous confirmons le renouvellement du cluster Kubernetes pour 12 mois à compter du 1er novembre 2026.
Montant total facturé : 42 500,00 € HT (TVA 20% applicable).
Veuillez retourner le bon de commande signé à comptabilite@cloud-services.eu avant le 25 octobre.
Contact technique: Sarah Martin (support@cloud-services.eu - +33 1 42 68 00 00).`,
    },
    model: 'gemini-3.8-flash',
    thinkingLevel: 'LOW',
  },
  {
    id: 'react-agent',
    title: 'Planificateur d’Agent ReAct (Reason + Act)',
    category: 'reasoning',
    description: 'Génération de chaîne de pensée et de décisions d’appels d’outils pour un agent autonome.',
    systemInstruction: `Tu fonctionnes selon le pattern ReAct (Reasoning and Acting).
Face à un objectif complexe :
1. Thought : Analyse l'état actuel et ce qui manque.
2. Action : Nom de l'outil et paramètres JSON requis.
3. Observation attendue.
4. Répète jusqu'à la conclusion finale.`,
    userPrompt: `Objectif de l'agent : {{agent_goal}}
Outils disponibles : [search_web(query), get_stock_price(ticker), send_slack_notification(channel, message)]`,
    variables: {
      agent_goal: 'Vérifier la performance boursière de NVIDIA sur les 7 derniers jours et notifier le canal #finance si la variation dépasse 5%.',
    },
    model: 'gemini-3.8-flash',
    thinkingLevel: 'HIGH',
  },
];

export const DEFAULT_SCHEMA_PROPERTIES: JsonSchemaProperty[] = [
  {
    id: 'prop-1',
    name: 'summary',
    type: 'STRING',
    description: 'Résumé concis de la requête ou du problème en 1-2 phrases',
    required: true,
  },
  {
    id: 'prop-2',
    name: 'sentiment',
    type: 'STRING',
    description: 'Sentiment global (positif, neutre, négatif)',
    required: true,
  },
  {
    id: 'prop-3',
    name: 'confidenceScore',
    type: 'NUMBER',
    description: 'Indice de confiance du modèle entre 0.0 et 1.0',
    required: true,
  },
  {
    id: 'prop-4',
    name: 'actionItems',
    type: 'ARRAY',
    description: 'Liste des étapes opérationnelles à effectuer',
    required: true,
    itemType: 'STRING',
  },
];

export const DEFAULT_FUNCTION_TOOLS: FunctionTool[] = [
  {
    id: 'tool-weather',
    name: 'get_current_weather',
    description: 'Renvoie les données météorologiques actuelles (température, humidité, conditions) pour une ville donnée.',
    parameters: {
      type: 'OBJECT',
      properties: {
        city: { type: 'STRING', description: 'Nom de la ville (ex: Paris, Tokyo, San Francisco)' },
        unit: { type: 'STRING', description: 'Unité de température (celsius ou fahrenheit)' },
      },
      required: ['city'],
    },
    mockHandler: (args: any) => ({
      city: args.city || 'Paris',
      temperature: 18.5,
      unit: args.unit || 'celsius',
      condition: 'Partiellement nuageux',
      humidityPercentage: 62,
      windSpeedKmh: 14,
    }),
  },
  {
    id: 'tool-db',
    name: 'query_customer_records',
    description: 'Recherche des informations clients et transactions dans la base de données interne.',
    parameters: {
      type: 'OBJECT',
      properties: {
        customerId: { type: 'STRING', description: 'Identifiant unique du client (ex: CUST-8492)' },
        includeOrderHistory: { type: 'BOOLEAN', description: 'Inclure la liste des commandes récentes' },
      },
      required: ['customerId'],
    },
    mockHandler: (args: any) => ({
      customerId: args.customerId,
      name: 'Claire Dumont',
      tier: 'Enterprise VIP',
      accountAgeMonths: 34,
      openTickets: 0,
      totalSpendEur: 14250,
      recentOrders: [
        { id: 'ORD-9821', date: '2026-10-28', status: 'LIVRÉ', amountEur: 1200 },
        { id: 'ORD-9755', date: '2026-09-15', status: 'LIVRÉ', amountEur: 3450 },
      ],
    }),
  },
  {
    id: 'tool-sandbox',
    name: 'execute_python_code',
    description: 'Exécute un script Python dans un bac à sable sécurisé et renvoie stdout.',
    parameters: {
      type: 'OBJECT',
      properties: {
        code: { type: 'STRING', description: 'Le code Python à exécuter' },
      },
      required: ['code'],
    },
    mockHandler: (args: any) => ({
      executed: true,
      stdout: `[SANDBOX OUTPUT]\nCalcul terminé avec succès.\nRésultat: [1.414, 2.718, 3.1415]`,
      exitCode: 0,
      executionDurationMs: 42,
    }),
  },
];
