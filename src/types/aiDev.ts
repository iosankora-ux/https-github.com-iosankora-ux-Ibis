export type ModelName = 'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon';

export type ThinkingLevelOption = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PromptVariable {
  name: string;
  value: string;
  description?: string;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  model: string;
  prompt: string;
  systemInstruction?: string;
  thinkingLevel?: string;
  output: string;
  durationMs: number;
  ttftMs?: number; // Time-to-first-token in milliseconds
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  isError?: boolean;
  errorMessage?: string;
  mode: 'playground' | 'schema' | 'tool' | 'benchmark';
}

export interface JsonSchemaProperty {
  id: string;
  name: string;
  type: 'STRING' | 'NUMBER' | 'INTEGER' | 'BOOLEAN' | 'ARRAY' | 'OBJECT';
  description: string;
  required: boolean;
  itemType?: 'STRING' | 'NUMBER' | 'INTEGER' | 'BOOLEAN' | 'OBJECT';
}

export interface FunctionTool {
  id: string;
  name: string;
  description: string;
  parameters: {
    type: 'OBJECT';
    properties: Record<string, { type: string; description: string }>;
    required: string[];
  };
  mockHandler?: (args: any) => any;
}

export interface PromptPreset {
  id: string;
  title: string;
  category: 'code' | 'architecture' | 'extraction' | 'reasoning' | 'creative';
  description: string;
  systemInstruction: string;
  userPrompt: string;
  variables: Record<string, string>;
  model: ModelName;
  thinkingLevel: ThinkingLevelOption;
}

export interface BenchmarkVariant {
  id: string;
  label: string;
  model: ModelName;
  systemInstruction: string;
  prompt: string;
  thinkingLevel: ThinkingLevelOption;
  responseMimeType?: string;
}

export interface BenchmarkResult {
  variantId: string;
  output: string;
  durationMs: number;
  tokens?: {
    prompt: number;
    completion: number;
    total: number;
  };
  success: boolean;
  error?: string;
}

export interface SavedPrompt {
  id: string;
  title: string;
  description?: string;
  category?: string;
  model: ModelName;
  thinkingLevel: ThinkingLevelOption;
  systemInstruction: string;
  prompt: string;
  variables: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// 1. Agentic Workspaces & Supervisory Engineering
export type AgentRole = 'planner' | 'coder' | 'critic' | 'executor' | 'supervisor';

export interface AgentTaskNode {
  id: string;
  role: AgentRole;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'waiting_hitl_approval' | 'completed' | 'rejected' | 'failed';
  toolInvocation?: {
    name: string;
    args: Record<string, any>;
    isRisky: boolean;
  };
  output?: string;
  approvalComment?: string;
  executionTimeMs?: number;
  dependencies?: string[];
}

export interface AgenticWorkspaceState {
  mission: string;
  activeAgents: AgentRole[];
  tasks: AgentTaskNode[];
  virtualScratchpad: string;
  environmentVariables: Record<string, string>;
}

// 2. Guardrails & Proactive Security
export interface PiiEntity {
  type: 'EMAIL' | 'PHONE' | 'CREDIT_CARD' | 'API_KEY' | 'IP_ADDRESS' | 'SSN' | 'PERSON_NAME';
  text: string;
  start: number;
  end: number;
  masked: string;
}

export interface GuardrailEvaluation {
  promptInjectionRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  promptInjectionScore: number; // 0 to 100
  jailbreakPatternsDetected: string[];
  piiEntitiesFound: PiiEntity[];
  sanitizedPrompt: string;
  systemPolicyViolations: string[];
  safeToExecute: boolean;
  recommendedAction: 'ALLOW' | 'REDACT_AND_ALLOW' | 'BLOCK';
  mitigationAdvice: string;
}

// 3. XAI & Neuro-Symbolic Hybrid AI
export interface XaiTokenAttribution {
  token: string;
  weight: number; // -1 to 1
  category: 'intent_keyword' | 'constraint' | 'entity' | 'punctuation' | 'bias';
  justification: string;
}

export interface NeuroSymbolicConstraint {
  id: string;
  ruleName: string;
  expression: string;
  description: string;
  passed: boolean;
  errorDetail?: string;
}

export interface NeuroSymbolicVerification {
  neuralDraft: string;
  symbolicPassed: boolean;
  constraintsEvaluated: NeuroSymbolicConstraint[];
  repairedOutput: string;
  proofLog: string[];
}

// 4. Repository Intelligence & Contextual Routing
export interface RepoSymbol {
  id: string;
  name: string;
  kind: 'function' | 'class' | 'interface' | 'endpoint' | 'db_schema';
  filePath: string;
  line: number;
  dependencies: string[];
  callers: string[];
  docstring?: string;
}

export interface ContextChunk {
  id: string;
  filePath: string;
  content: string;
  similarityScore: number;
  tokenCount: number;
  isIncludedInWindow: boolean;
}

export interface ContextualRoutingAnalysis {
  detectedIntent: 'simple_qa' | 'complex_reasoning' | 'code_generation' | 'structured_data' | 'agentic_planning';
  recommendedModel: ModelName;
  recommendedThinkingLevel: ThinkingLevelOption;
  complexityScore: number; // 0 to 100
  contextWindowFitTokens: number;
  estimatedCostReductionPct: number;
  routingRationale: string;
}

// 5. Algorithmes Avancés & Quantum Neuro-Symbolique
export interface TNormComputation {
  a: number;
  b: number;
  productTNorm: number; // a * b
  productSNorm: number; // a + b - a * b
  lukasiewiczTNorm: number; // max(0, a + b - 1)
  godelTNorm: number; // min(a, b)
  gradA: number; // d(T)/da = b
  gradB: number; // d(T)/db = a
}

export interface SimplicialComplexNode {
  id: string;
  x: number;
  y: number;
}

export interface PersistentHomologyState {
  epsilon: number;
  nodes: SimplicialComplexNode[];
  edges: [number, number][];
  triangles: [number, number, number][];
  betti0: number; // connected components
  betti1: number; // 1D topological holes
}

export interface AbductiveInductiveState {
  backgroundKnowledge: string[];
  observations: string[];
  abducedHypothesis: string;
  inducedGeneralRule: string;
  confidenceScore: number;
  formalProof: string[];
}

export interface ProgramSynthesisSketch {
  sketchCode: string;
  testCases: Array<{ input: any; expectedOutput: any }>;
  synthesizedImplementation?: string;
  verificationPassed: boolean;
  synthesizerIterations: number;
}

export interface WorldModelTripartiteState {
  step: number;
  perceptionZ: number[]; // V - VAE latent vector
  memoryH: number[]; // M - Recurrent hidden state (RSSM)
  controllerAction: string; // C - Policy decision
  predictedNextReward: number;
  imaginedTrajectory: Array<{ step: number; latentState: number; value: number }>;
}

export interface QuantumCircuitGate {
  type: 'H' | 'RY' | 'CNOT' | 'RZ' | 'MEASURE';
  targetQubit: number;
  controlQubit?: number;
  theta?: number;
}

export interface QuantumNeuroSymbolicState {
  qubitCount: number;
  gates: QuantumCircuitGate[];
  parameterTheta: number;
  parameterShiftGradient: number;
  stateProbabilities: Record<string, number>;
  logicalLoss: number;
  productTNormFitness: number;
}

// 6. Preuve Formelle de Théorèmes & Systèmes de Types Dépendants (Lean 4, Coq, MCTS)
export interface MctsProofNode {
  id: string;
  parentId?: string;
  tactic: string;
  goalBefore: string;
  goalAfter: string;
  visitsN: number;
  priorProbP: number;
  valueQ: number;
  status: 'proven' | 'unproven' | 'backtracked' | 'frontier';
}

export interface FormalProofState {
  assistant: 'Lean 4' | 'Coq' | 'Isabelle/HOL';
  theoremName: string;
  theoremStatement: string;
  curryHowardProofTerm: string;
  mctsTree: MctsProofNode[];
  proofSteps: string[];
  proofComplete: boolean;
  typeCheckerVerdict: 'CERTIFIED_QED' | 'TYPE_CHECK_RUNNING' | 'OPEN_GOAL';
}

// 7. Modélisation Géométrique Neuro-Symbolique (AlphaGeometry)
export interface GeometricPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  isAuxiliary?: boolean;
}

export interface GeometricLine {
  id: string;
  from: string;
  to: string;
  isAuxiliary?: boolean;
  color?: string;
}

export interface GeometricCircle {
  id: string;
  center: string;
  radius: number;
  label?: string;
  isAuxiliary?: boolean;
}

export interface AlphaGeometryState {
  problemCode: string;
  problemTitle: string;
  initialPremises: string[];
  targetGoal: string;
  saturatedFactsCount: number;
  ddEngineFacts: string[];
  auxiliaryConstruction: {
    discovered: boolean;
    name: string;
    description: string;
    impactExplanation: string;
  };
  proofSteps: Array<{
    step: number;
    rule: string;
    deduction: string;
    isAuxiliaryTriggered: boolean;
  }>;
  diagram: {
    points: GeometricPoint[];
    lines: GeometricLine[];
    circles: GeometricCircle[];
  };
}

// 8. Programmation Logique par Contraintes, SMT & Réduction Homologique
export interface SmtInvariantState {
  programName: string;
  codeSnippet: string;
  precondition: string;
  loopCondition: string;
  postcondition: string;
  candidateInvariant: string;
  inductiveBasePassed: boolean;
  inductiveStepPassed: boolean;
  smtSolverVerdict: 'SAT_VERIFIED' | 'COUNTEREXAMPLE_FOUND' | 'INVARIANT_HOLD';
  homologyReduction: {
    betti0_connectedComponents: number;
    betti1_topologicalHoles: number;
    unsatCoreCycles: string[];
    conflictDrivenClausesCount: number;
  };
}

// 9. Tactiques d’Exploration par Transformers d'Arbres de Syntaxe (AST)
export interface AstTreeNode {
  id: string;
  label: string;
  nodeType: 'ROOT' | 'FORALL' | 'IMPLIES' | 'PREDICATE' | 'TACTIC_APPLY' | 'VARIABLE';
  childrenIds: string[];
  structuralAttentionScore: number;
}

export interface AstTreeTransformerState {
  expression: string;
  nodes: AstTreeNode[];
  linearPredictionLimitation: string;
  treeAttentionAdvantage: string;
  nonLocalDependenciesResolved: string[];
}

// 10. Différenciation Automatique sur Structures Discrètes (Smooth Relaxation)
export interface SmoothRelaxationStep {
  epoch: number;
  relaxedValues: number[];
  temperature: number;
  continuousLoss: number;
  gradientNorm: number;
}

export interface SmoothRelaxationState {
  problemName: string;
  combinatorialSpace: string;
  relaxationMethod: 'Gumbel-Softmax' | 'Frank-Wolfe Barrier' | 'Entropic Regularized';
  temperature: number;
  lambdaWeight: number;
  optimizationSteps: SmoothRelaxationStep[];
  currentRelaxedContinuous: number[];
  projectedDiscreteSolution: number[];
  isConstraintFeasible: boolean;
  exactObjectiveValue: number;
}


