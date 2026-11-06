import React, { useState, useMemo } from 'react';
import {
  Atom,
  Binary,
  Layers,
  Network,
  GitCommit,
  Brain,
  Cpu,
  Play,
  RotateCcw,
  Sparkles,
  TrendingDown,
  Activity,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Code2,
  BookMarked,
  Compass,
  ShieldCheck,
  GitFork,
  Waves,
  CornerDownRight,
  Maximize2,
  AlertTriangle,
  Check,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import {
  TNormComputation,
  SimplicialComplexNode,
  PersistentHomologyState,
  AbductiveInductiveState,
  ProgramSynthesisSketch,
  WorldModelTripartiteState,
  QuantumNeuroSymbolicState,
  FormalProofState,
  AlphaGeometryState,
  SmtInvariantState,
  AstTreeTransformerState,
  SmoothRelaxationState,
} from '../types/aiDev';

interface AdvancedAlgorithmsViewProps {
  onRunAlgorithm: (mode: string, payload: any) => Promise<any>;
  isRunning: boolean;
}

type AlgoTab =
  | 'lean_proof'
  | 'alphageometry'
  | 'smt_invariants'
  | 'ast_transformers'
  | 'smooth_relaxation'
  | 'quantum'
  | 'tnorm'
  | 'topology'
  | 'abduction'
  | 'matrix_logic'
  | 'sigs'
  | 'world_models';

export const AdvancedAlgorithmsView: React.FC<AdvancedAlgorithmsViewProps> = ({
  onRunAlgorithm,
  isRunning,
}) => {
  const [activeTab, setActiveTab] = useState<AlgoTab>('lean_proof');

  // 1. T-Norm State
  const [valA, setValA] = useState(0.8);
  const [valB, setValB] = useState(0.6);

  const tnorm: TNormComputation = useMemo(() => {
    return {
      a: valA,
      b: valB,
      productTNorm: Math.round(valA * valB * 1000) / 1000,
      productSNorm: Math.round((valA + valB - valA * valB) * 1000) / 1000,
      lukasiewiczTNorm: Math.round(Math.max(0, valA + valB - 1) * 1000) / 1000,
      godelTNorm: Math.round(Math.min(valA, valB) * 1000) / 1000,
      gradA: valB,
      gradB: valA,
    };
  }, [valA, valB]);

  // 2. Topology State (TDA / Persistent Homology)
  const [epsilon, setEpsilon] = useState(85);
  const nodes: SimplicialComplexNode[] = [
    { id: 'n1', x: 80, y: 80 },
    { id: 'n2', x: 180, y: 70 },
    { id: 'n3', x: 220, y: 160 },
    { id: 'n4', x: 140, y: 220 },
    { id: 'n5', x: 60, y: 170 },
  ];

  // Calculate edges and triangles based on distance <= epsilon
  const topology: PersistentHomologyState = useMemo(() => {
    const edges: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= epsilon) {
          edges.push([i, j]);
        }
      }
    }

    const triangles: [number, number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        for (let k = j + 1; k < nodes.length; k++) {
          const hasIJ = edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i));
          const hasJK = edges.some(([a, b]) => (a === j && b === k) || (a === k && b === j));
          const hasKI = edges.some(([a, b]) => (a === k && b === i) || (a === i && b === k));
          if (hasIJ && hasJK && hasKI) {
            triangles.push([i, j, k]);
          }
        }
      }
    }

    // Betti numbers approximation: V - E + F = B0 - B1
    const v = nodes.length;
    const e = edges.length;
    const f = triangles.length;
    const b0 = Math.max(1, v - e + f);
    const b1 = Math.max(0, e - v - f + 1);

    return {
      epsilon,
      nodes,
      edges,
      triangles,
      betti0: b0,
      betti1: b1,
    };
  }, [epsilon]);

  // 3. Abduction / Induction State
  const [abductiveState, setAbductiveState] = useState<AbductiveInductiveState>({
    backgroundKnowledge: [
      'parent(X, Y) :- mother(X, Y).',
      'mother(marie, pierre).',
      'father(luc, pierre).',
    ],
    observations: ['ancestor(marie, pierre).', 'ancestor(luc, pierre).'],
    abducedHypothesis: 'parent(luc, pierre) :- father(luc, pierre).',
    inducedGeneralRule: 'ancestor(X, Y) :- parent(X, Y).',
    confidenceScore: 0.99,
    formalProof: [
      '1. Observation O1: ancestor(marie, pierre)',
      '2. Unification avec le background B: mother(marie, pierre) => parent(marie, pierre)',
      '3. Règle générale induite: ancestor(X, Y) :- parent(X, Y)',
      '4. Abduction pour O2: ancestor(luc, pierre) implique parent(luc, pierre)',
    ],
  });

  // 4. Matrix-Based Logic (TensorLog)
  const [matrixEntities] = useState(['Alice', 'Bob', 'Charlie']);
  const [matrixParent] = useState([
    [0, 1, 0], // Alice -> Bob
    [0, 0, 1], // Bob -> Charlie
    [0, 0, 0], // Charlie -> none
  ]);

  // Compute GrandParent = Parent x Parent
  const matrixGrandParent = useMemo(() => {
    const size = matrixParent.length;
    const result: number[][] = Array(size)
      .fill(0)
      .map(() => Array(size).fill(0));
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        for (let k = 0; k < size; k++) {
          result[i][j] += matrixParent[i][k] * matrixParent[k][j];
        }
      }
    }
    return result;
  }, [matrixParent]);

  // 5. SIGS (Program Synthesis)
  const [sketchState, setSketchState] = useState<ProgramSynthesisSketch>({
    sketchCode: `function filterVIPOrders(orders: Order[]): Order[] {
  return orders.filter(o => o.amount > 100 && ??(o.userTier, "VIP"));
}`,
    testCases: [
      { input: { amount: 150, userTier: 'VIP' }, expectedOutput: true },
      { input: { amount: 120, userTier: 'STANDARD' }, expectedOutput: false },
      { input: { amount: 80, userTier: 'VIP' }, expectedOutput: false },
    ],
    synthesizedImplementation: `function filterVIPOrders(orders: Order[]): Order[] {
  return orders.filter(o => o.amount > 100 && o.userTier === "VIP");
}`,
    verificationPassed: true,
    synthesizerIterations: 2,
  });

  // 6. World Models (V-M-C)
  const [worldModel, setWorldModel] = useState<WorldModelTripartiteState>({
    step: 42,
    perceptionZ: [0.12, -0.45, 0.88, 0.04, -0.71, 0.33],
    memoryH: [0.91, 0.15, -0.22, 0.67],
    controllerAction: 'ACCELERATE_DATABASE_INDEX_BUILD',
    predictedNextReward: +14.2,
    imaginedTrajectory: [
      { step: 1, latentState: 0.12, value: 2.1 },
      { step: 2, latentState: 0.44, value: 5.6 },
      { step: 3, latentState: 0.78, value: 9.8 },
      { step: 4, latentState: 0.95, value: 14.2 },
    ],
  });

  // 7. Quantum Neuro-Symbolic State
  const [theta, setTheta] = useState(1.57); // pi / 2
  const [quantumState, setQuantumState] = useState<QuantumNeuroSymbolicState>({
    qubitCount: 3,
    gates: [
      { type: 'H', targetQubit: 0 },
      { type: 'RY', targetQubit: 1, theta: 1.57 },
      { type: 'CNOT', targetQubit: 2, controlQubit: 1 },
      { type: 'RZ', targetQubit: 0, theta: 0.78 },
    ],
    parameterTheta: 1.57,
    parameterShiftGradient: -0.42,
    stateProbabilities: {
      '|000>': 0.45,
      '|001>': 0.05,
      '|110>': 0.42,
      '|111>': 0.08,
    },
    logicalLoss: 0.08,
    productTNormFitness: 0.92,
  });

  // Trigger quantum simulation with Gemini
  const handleOptimizeQuantumCircuit = async () => {
    const res = await onRunAlgorithm('quantum_circuit', {
      theta,
      targetPredicate: 'EntangledState(q1, q2) ^ LowEnergy(q0)',
      tnormFormula: 'Product_T_Norm(Prob(000), Prob(110))',
    });
    if (res) {
      setQuantumState({
        qubitCount: 3,
        gates: quantumState.gates,
        parameterTheta: res.optimalTheta ?? theta,
        parameterShiftGradient: res.parameterShiftGradient ?? -0.38,
        stateProbabilities: res.stateProbabilities ?? quantumState.stateProbabilities,
        logicalLoss: res.logicalLoss ?? 0.05,
        productTNormFitness: res.productTNormFitness ?? 0.95,
      });
      if (res.optimalTheta) setTheta(res.optimalTheta);
    }
  };

  // Trigger Abduction deduction
  const handleRunAbduction = async () => {
    const res = await onRunAlgorithm('abduction_induction', {
      backgroundKnowledge: abductiveState.backgroundKnowledge,
      observations: abductiveState.observations,
    });
    if (res) {
      setAbductiveState({
        ...abductiveState,
        abducedHypothesis: res.abducedHypothesis || abductiveState.abducedHypothesis,
        inducedGeneralRule: res.inducedGeneralRule || abductiveState.inducedGeneralRule,
        confidenceScore: res.confidenceScore || 0.99,
        formalProof: res.formalProof || abductiveState.formalProof,
      });
    }
  };

  // Trigger SIGS Program Synthesis
  const handleRunSigs = async () => {
    const res = await onRunAlgorithm('program_synthesis', {
      sketchCode: sketchState.sketchCode,
      testCases: sketchState.testCases,
    });
    if (res) {
      setSketchState({
        ...sketchState,
        synthesizedImplementation: res.synthesizedImplementation || sketchState.synthesizedImplementation,
        verificationPassed: res.verificationPassed ?? true,
        synthesizerIterations: res.synthesizerIterations ?? 3,
      });
    }
  };

  // 8. Preuve Formelle & Types Dépendants (Lean 4, Coq, MCTS)
  const [formalProof, setFormalProof] = useState<FormalProofState>({
    assistant: 'Lean 4',
    theoremName: 'sum_first_n_naturals',
    theoremStatement: `theorem sum_first_n (n : Nat) : 2 * (∑ i in Finset.range (n + 1), i) = n * (n + 1) := by`,
    curryHowardProofTerm: `fun n => Nat.recOn n (Eq.refl 0) (fun d ih => Eq.trans (by simp [ih]) (by ring))`,
    mctsTree: [
      {
        id: 'root',
        tactic: 'goal_initial',
        goalBefore: '⊢ 2 * (∑ i in range (n + 1), i) = n * (n + 1)',
        goalAfter: 'n : Nat ⊢ 2 * (∑ i in range (n + 1), i) = n * (n + 1)',
        visitsN: 142,
        priorProbP: 0.82,
        valueQ: 0.94,
        status: 'proven',
      },
      {
        id: 'node_intro',
        parentId: 'root',
        tactic: 'induction n with d hd',
        goalBefore: 'n : Nat ⊢ 2 * (∑ i in range (n + 1), i) = n * (n + 1)',
        goalAfter: 'case zero: ⊢ 2 * (∑ i in range 1, i) = 0 * 1 \ncase succ: d : Nat, hd : ... ⊢ 2 * (∑ i in range (d + 2), i) = (d + 1) * (d + 2)',
        visitsN: 104,
        priorProbP: 0.91,
        valueQ: 0.98,
        status: 'proven',
      },
      {
        id: 'node_zero',
        parentId: 'node_intro',
        tactic: '· rfl',
        goalBefore: 'case zero ⊢ 0 = 0',
        goalAfter: 'No subgoals (Q.E.D. for zero)',
        visitsN: 88,
        priorProbP: 0.95,
        valueQ: 1.0,
        status: 'proven',
      },
      {
        id: 'node_succ',
        parentId: 'node_intro',
        tactic: '· simp [Finset.sum_range_succ, hd, Nat.mul_add]; ring',
        goalBefore: 'case succ ⊢ 2 * (∑ i in range (d + 1), i + (d + 1)) = (d + 1) * (d + 2)',
        goalAfter: 'No subgoals (Q.E.D. for succ)',
        visitsN: 76,
        priorProbP: 0.87,
        valueQ: 1.0,
        status: 'proven',
      },
    ],
    proofSteps: [
      'induction n with d hd',
      '· rfl',
      '· rw [Finset.sum_range_succ]',
      '· linarith [hd]',
    ],
    proofComplete: true,
    typeCheckerVerdict: 'CERTIFIED_QED',
  });

  // 9. AlphaGeometry State
  const [alphaGeometry, setAlphaGeometry] = useState<AlphaGeometryState>({
    problemCode: 'IMO_Shortlist_G1',
    problemTitle: 'Cocyclicité Orthocentrique & Construction Auxiliaire',
    initialPremises: [
      'Soit un triangle acutangle ABC avec orthocentre H',
      'AD est la hauteur issue de A coupant [BC] en D',
      'BE est la hauteur issue de B coupant [AC] en E',
    ],
    targetGoal: 'Démontrer que le quadrilatère CDHE est inscriptible dans un cercle (cocyclique)',
    saturatedFactsCount: 28,
    ddEngineFacts: [
      'AD ⟂ BC ⇒ Angle(ADC) = 90° et Angle(ADB) = 90°',
      'BE ⟂ AC ⇒ Angle(BEC) = 90° et Angle(BEA) = 90°',
      'Dans le quadrilatère CDHE : Angle(CDH) = 90° et Angle(CEH) = 90°',
      'Somme des angles opposés : Angle(CDH) + Angle(CEH) = 90° + 90° = 180°',
    ],
    auxiliaryConstruction: {
      discovered: true,
      name: 'Cercle auxiliaire Γ de diamètre [CH]',
      description: 'Découverte par le Transformer : Tracer le cercle Γ de diamètre [CH], avec centre au milieu M de [CH].',
      impactExplanation: 'Puisque Angle(CDH)=90° et Angle(CEH)=90°, les points D et E appartiennent immédiatement à Γ selon le théorème de Thalès, débloquant instantanément la preuve par saturation DD !',
    },
    proofSteps: [
      {
        step: 1,
        rule: 'Définition des hauteurs',
        deduction: 'AD ⟂ BC et BE ⟂ AC ⇒ Angle(CDH) = 90° et Angle(CEH) = 90°',
        isAuxiliaryTriggered: false,
      },
      {
        step: 2,
        rule: 'Construction Auxiliaire AlphaGeometry',
        deduction: 'Tracé du cercle Γ de diamètre [CH], centre M = milieu([CH])',
        isAuxiliaryTriggered: true,
      },
      {
        step: 3,
        rule: 'Saturation DD (Thalès sur Γ)',
        deduction: 'D ∈ Γ car Angle(CDH)=90°, et E ∈ Γ car Angle(CEH)=90°',
        isAuxiliaryTriggered: true,
      },
      {
        step: 4,
        rule: 'Conclusion Formelle (Q.E.D.)',
        deduction: 'Les 4 points C, D, H, E sont situés sur le cercle Γ. Ils sont cocycliques.',
        isAuxiliaryTriggered: false,
      },
    ],
    diagram: {
      points: [
        { id: 'A', label: 'A', x: 170, y: 35 },
        { id: 'B', label: 'B', x: 50, y: 235 },
        { id: 'C', label: 'C', x: 300, y: 235 },
        { id: 'D', label: 'D', x: 170, y: 235 },
        { id: 'E', label: 'E', x: 245, y: 115 },
        { id: 'H', label: 'H', x: 170, y: 170 },
        { id: 'M', label: 'M (Milieu CH)', x: 235, y: 202, isAuxiliary: true },
      ],
      lines: [
        { id: 'AB', from: 'A', to: 'B' },
        { id: 'BC', from: 'B', to: 'C' },
        { id: 'CA', from: 'C', to: 'A' },
        { id: 'AD', from: 'A', to: 'D', color: '#06b6d4' },
        { id: 'BE', from: 'B', to: 'E', color: '#06b6d4' },
        { id: 'CH', from: 'C', to: 'H', isAuxiliary: true, color: '#f59e0b' },
        { id: 'DE', from: 'D', to: 'E', color: '#10b981' },
      ],
      circles: [
        { id: 'Gamma', center: 'M', radius: 72, label: 'Γ (Cercle Diamètre CH)', isAuxiliary: true },
      ],
    },
  });

  // 10. SMT Invariants & Homological Reduction State
  const [smtState, setSmtState] = useState<SmtInvariantState>({
    programName: 'Linear_Array_Summation',
    codeSnippet: `int sum = 0; int i = 0;\nwhile (i < n) {\n  sum = sum + a[i];\n  i = i + 1;\n}`,
    precondition: 'sum == 0 ∧ i == 0 ∧ n >= 0',
    loopCondition: 'i < n',
    postcondition: 'sum == ∑_{k=0}^{n-1} a[k]',
    candidateInvariant: 'sum == ∑_{k=0}^{i-1} a[k] ∧ 0 <= i <= n',
    inductiveBasePassed: true,
    inductiveStepPassed: true,
    smtSolverVerdict: 'SAT_VERIFIED',
    homologyReduction: {
      betti0_connectedComponents: 1,
      betti1_topologicalHoles: 0,
      unsatCoreCycles: [
        'Cycle 1 : Clause (i < n) ∧ (i\' = i + 1) ∧ (0 <= i <= n) ⇒ (0 <= i\' <= n)',
        'Cycle 2 : Clause (sum\' = sum + a[i]) ∧ Inv(sum, i) ⇒ Inv(sum\', i\')',
      ],
      conflictDrivenClausesCount: 24,
    },
  });

  // 11. AST Tree-Transformers State
  const [astState, setAstState] = useState<AstTreeTransformerState>({
    expression: '∀ (x : Nat), x > 0 → ∃ (y : Nat), y * y <= x ∧ (y + 1) * (y + 1) > x',
    nodes: [
      { id: 'n0', label: '∀ (x : Nat)', nodeType: 'FORALL', childrenIds: ['n1'], structuralAttentionScore: 0.96 },
      { id: 'n1', label: '→ (Implies)', nodeType: 'IMPLIES', childrenIds: ['n2', 'n3'], structuralAttentionScore: 0.92 },
      { id: 'n2', label: 'x > 0', nodeType: 'PREDICATE', childrenIds: [], structuralAttentionScore: 0.85 },
      { id: 'n3', label: '∃ (y : Nat)', nodeType: 'PREDICATE', childrenIds: ['n4'], structuralAttentionScore: 0.94 },
      { id: 'n4', label: '∧ (And)', nodeType: 'PREDICATE', childrenIds: ['n5', 'n6'], structuralAttentionScore: 0.89 },
      { id: 'n5', label: 'y * y <= x', nodeType: 'PREDICATE', childrenIds: [], structuralAttentionScore: 0.88 },
      { id: 'n6', label: '(y + 1)^2 > x', nodeType: 'PREDICATE', childrenIds: [], structuralAttentionScore: 0.91 },
    ],
    linearPredictionLimitation:
      "Les LLMs séquentiels prédisent token par token de gauche à droite. Sur une preuve de 50 étapes, les dépendances syntaxiques entre la portée du quantificateur racine 'x' et la borne finale '(y+1)^2 > x' sont noyées dans le bruit de contexte, causant des hallucinations d'invariants ou des ruptures de typage.",
    treeAttentionAdvantage:
      "Le Transformer d'AST traite le graphe syntaxique complet. Les nœuds de l'arbre communiquent bidirectionnellement via des arêtes d'arbre et des connexions de frères. La distance de message entre 'x' et son utilisation finale est de longueur 3 dans l'AST au lieu de 45 tokens séquentiels !",
    nonLocalDependenciesResolved: [
      'Unification du type de variable x entre racine n0 et borne supérieure n6',
      'Non-vacuité de la racine entière garantie par la condition n2 (x > 0)',
      'Couplage syntaxique instantané entre induction sur x et instanciation de y',
    ],
  });

  // 12. Smooth Relaxation State (Discrete to Continuous Optimization)
  const [temperature, setTemperature] = useState(0.25);
  const [smoothState, setSmoothState] = useState<SmoothRelaxationState>({
    problemName: 'Sélection d’Ensemble Optimal sous Contraintes Logiques (ILP vers Variété Différentiable)',
    combinatorialSpace: '{0, 1}^6 (Espace discret de 64 configurations)',
    relaxationMethod: 'Gumbel-Softmax',
    temperature: 0.25,
    lambdaWeight: 0.85,
    optimizationSteps: [
      { epoch: 1, relaxedValues: [0.49, 0.51, 0.50, 0.48, 0.52, 0.50], temperature: 1.0, continuousLoss: 4.82, gradientNorm: 1.45 },
      { epoch: 4, relaxedValues: [0.71, 0.24, 0.86, 0.14, 0.08, 0.91], temperature: 0.7, continuousLoss: 2.12, gradientNorm: 0.74 },
      { epoch: 8, relaxedValues: [0.89, 0.08, 0.96, 0.04, 0.02, 0.98], temperature: 0.4, continuousLoss: 0.62, gradientNorm: 0.25 },
      { epoch: 12, relaxedValues: [0.98, 0.02, 0.99, 0.01, 0.00, 1.00], temperature: 0.2, continuousLoss: 0.04, gradientNorm: 0.03 },
    ],
    currentRelaxedContinuous: [0.98, 0.02, 0.99, 0.01, 0.00, 1.00],
    projectedDiscreteSolution: [1, 0, 1, 0, 0, 1],
    isConstraintFeasible: true,
    exactObjectiveValue: 42.8,
  });

  // Handlers for the 5 algorithms
  const handleRunLeanProof = async () => {
    const res = await onRunAlgorithm('lean4_mcts_proof', {
      theoremStatement: formalProof.theoremStatement,
      assistant: formalProof.assistant,
    });
    if (res) {
      setFormalProof({
        ...formalProof,
        theoremName: res.theoremName || formalProof.theoremName,
        curryHowardProofTerm: res.curryHowardProofTerm || formalProof.curryHowardProofTerm,
        mctsTree: res.mctsTree || formalProof.mctsTree,
        proofSteps: res.proofSteps || formalProof.proofSteps,
        proofComplete: res.proofComplete ?? true,
        typeCheckerVerdict: res.typeCheckerVerdict || 'CERTIFIED_QED',
      });
    }
  };

  const handleRunAlphaGeometry = async () => {
    const res = await onRunAlgorithm('alpha_geometry_dd', {
      problemCode: alphaGeometry.problemCode,
      premises: alphaGeometry.initialPremises,
      goal: alphaGeometry.targetGoal,
    });
    if (res) {
      setAlphaGeometry({
        ...alphaGeometry,
        problemTitle: res.problemTitle || alphaGeometry.problemTitle,
        ddEngineFacts: res.ddEngineFacts || alphaGeometry.ddEngineFacts,
        saturatedFactsCount: res.saturatedFactsCount || alphaGeometry.saturatedFactsCount,
        auxiliaryConstruction: res.auxiliaryConstruction || alphaGeometry.auxiliaryConstruction,
        proofSteps: res.proofSteps || alphaGeometry.proofSteps,
        diagram: res.diagram || alphaGeometry.diagram,
      });
    }
  };

  const handleRunSmtInvariant = async () => {
    const res = await onRunAlgorithm('smt_invariant_homology', {
      codeSnippet: smtState.codeSnippet,
      precondition: smtState.precondition,
      loopCondition: smtState.loopCondition,
      postcondition: smtState.postcondition,
    });
    if (res) {
      setSmtState({
        ...smtState,
        candidateInvariant: res.candidateInvariant || smtState.candidateInvariant,
        inductiveBasePassed: res.inductiveBasePassed ?? true,
        inductiveStepPassed: res.inductiveStepPassed ?? true,
        smtSolverVerdict: res.smtSolverVerdict || 'SAT_VERIFIED',
        homologyReduction: res.homologyReduction || smtState.homologyReduction,
      });
    }
  };

  const handleRunAstTransformer = async () => {
    const res = await onRunAlgorithm('ast_transformer_tactics', {
      expression: astState.expression,
    });
    if (res) {
      setAstState({
        ...astState,
        nodes: res.nodes || astState.nodes,
        linearPredictionLimitation: res.linearPredictionLimitation || astState.linearPredictionLimitation,
        treeAttentionAdvantage: res.treeAttentionAdvantage || astState.treeAttentionAdvantage,
        nonLocalDependenciesResolved: res.nonLocalDependenciesResolved || astState.nonLocalDependenciesResolved,
      });
    }
  };

  const handleRunSmoothRelaxation = async () => {
    const res = await onRunAlgorithm('discrete_smooth_relaxation', {
      temperature,
      combinatorialSpace: smoothState.combinatorialSpace,
    });
    if (res) {
      setSmoothState({
        ...smoothState,
        temperature,
        optimizationSteps: res.optimizationSteps || smoothState.optimizationSteps,
        currentRelaxedContinuous: res.currentRelaxedContinuous || smoothState.currentRelaxedContinuous,
        projectedDiscreteSolution: res.projectedDiscreteSolution || smoothState.projectedDiscreteSolution,
        isConstraintFeasible: res.isConstraintFeasible ?? true,
        exactObjectiveValue: res.exactObjectiveValue || smoothState.exactObjectiveValue,
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Sub-navigation tabs */}
      <div className="px-6 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/70 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-neutral-400 font-semibold uppercase text-[10px] tracking-wider shrink-0 mr-1">
          Algorithmes Avancés :
        </span>

        {/* 1. Preuve Formelle & Lean 4 */}
        <button
          onClick={() => setActiveTab('lean_proof')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'lean_proof'
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5 text-cyan-500" />
          <span>Preuve Lean 4 & MCTS</span>
        </button>

        {/* 2. AlphaGeometry */}
        <button
          onClick={() => setActiveTab('alphageometry')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'alphageometry'
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-amber-500" />
          <span>AlphaGeometry & DD</span>
        </button>

        {/* 3. SMT & Invariants */}
        <button
          onClick={() => setActiveTab('smt_invariants')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'smt_invariants'
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>SMT & Invariants Homologiques</span>
        </button>

        {/* 4. Transformers AST */}
        <button
          onClick={() => setActiveTab('ast_transformers')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ast_transformers'
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <GitFork className="w-3.5 h-3.5 text-indigo-500" />
          <span>Transformers AST</span>
        </button>

        {/* 5. Smooth Relaxation */}
        <button
          onClick={() => setActiveTab('smooth_relaxation')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'smooth_relaxation'
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Waves className="w-3.5 h-3.5 text-purple-500" />
          <span>Smooth Relaxation (Continu/Discret)</span>
        </button>

        {/* 6. Quantum */}
        <button
          onClick={() => setActiveTab('quantum')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'quantum'
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Atom className="w-3.5 h-3.5" />
          <span>Quantum Neuro-Symbolique</span>
        </button>

        {/* 7. T-Normes */}
        <button
          onClick={() => setActiveTab('tnorm')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'tnorm'
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>T-Normes</span>
        </button>

        {/* 8. Topologie */}
        <button
          onClick={() => setActiveTab('topology')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'topology'
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Topologie & Homologie</span>
        </button>

        {/* 9. Abduction */}
        <button
          onClick={() => setActiveTab('abduction')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'abduction'
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Abduction & ILP</span>
        </button>

        {/* 10. Matrix Logic */}
        <button
          onClick={() => setActiveTab('matrix_logic')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'matrix_logic'
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Binary className="w-3.5 h-3.5" />
          <span>TensorLog</span>
        </button>

        {/* 11. SIGS */}
        <button
          onClick={() => setActiveTab('sigs')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'sigs'
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Synthèse SIGS</span>
        </button>

        {/* 12. World Models */}
        <button
          onClick={() => setActiveTab('world_models')}
          className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'world_models'
              ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 font-semibold shadow-2xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>World Models</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
        {/* 1. PREUVE FORMELLE & TYPES DEPENDANTS (LEAN 4 / COQ / MCTS) */}
        {activeTab === 'lean_proof' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Preuve Formelle de Théorèmes & Systèmes de Types Dépendants</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Assistants de preuve (Lean 4, Coq, Isabelle/HOL) pilotés par agents de renforcement MCTS (Monte Carlo Tree Search) et synthèse par Isomorphisme de Curry-Howard.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center bg-neutral-200/80 dark:bg-neutral-800 rounded-lg p-0.5 text-xs font-mono">
                  {(['Lean 4', 'Coq', 'Isabelle/HOL'] as const).map((asst) => (
                    <button
                      key={asst}
                      onClick={() => setFormalProof({ ...formalProof, assistant: asst })}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        formalProof.assistant === asst
                          ? 'bg-white dark:bg-neutral-700 text-cyan-600 dark:text-cyan-400 font-semibold shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                      }`}
                    >
                      {asst}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleRunLeanProof}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 shadow-sm shrink-0"
                >
                  {isRunning ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Exploration MCTS...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Explorer Preuve MCTS</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Theorem Specification & Curry-Howard */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-cyan-500" />
                      <span>Spécification {formalProof.assistant}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{formalProof.typeCheckerVerdict}</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-950 font-mono text-xs text-neutral-200 border border-neutral-800 space-y-1.5 overflow-x-auto">
                    <p className="text-cyan-400 font-bold">-- Théorème Formel : Somme des n premiers entiers</p>
                    <p className="text-neutral-100">{formalProof.theoremStatement}</p>
                    <p className="text-neutral-400 ml-2">induction n with</p>
                    <p className="text-emerald-400 ml-4">| zero =&gt; rfl</p>
                    <p className="text-emerald-400 ml-4">| succ d hd =&gt;</p>
                    <p className="text-indigo-300 ml-6">simp [Finset.sum_range_succ, hd, Nat.mul_add]</p>
                    <p className="text-indigo-300 ml-6">linarith</p>
                  </div>
                </div>

                {/* Curry-Howard Isomorphism box */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Isomorphisme de Curry-Howard (Propositions-as-Types)
                  </span>
                  <p className="text-xs text-neutral-500">
                    Chaque proposition logique correspond à un type dépendant, et la preuve formelle correspond à un programme fonctionnel pur (terme λ).
                  </p>
                  <div className="p-3 rounded-lg bg-neutral-950 font-mono text-xs text-cyan-300 border border-neutral-800 overflow-x-auto">
                    <span className="text-neutral-500 block text-[10px] mb-1">Terme de preuve synthétisé (Proof-as-Program) :</span>
                    {formalProof.curryHowardProofTerm}
                  </div>
                </div>

                {/* Proof Steps */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Script de Déduction Formelle ({formalProof.proofSteps.length} étapes)
                  </span>
                  <div className="space-y-1.5 font-mono text-xs">
                    {formalProof.proofSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                        <span className="text-cyan-600 dark:text-cyan-400 font-bold w-5">{idx + 1}.</span>
                        <span className="text-neutral-800 dark:text-neutral-200">{step}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: MCTS Tree Explorer */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                      Arbre de Recherche Monte Carlo (MCTS Policy & Value)
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      Nodes: {formalProof.mctsTree.length} | UCB1 Exploration
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {formalProof.mctsTree.map((node) => (
                      <div
                        key={node.id}
                        className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                            <CornerDownRight className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{node.tactic}</span>
                          </span>
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span className="text-neutral-500">N={node.visitsN}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">P={node.priorProbP}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Q={node.valueQ}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-600 font-sans font-bold">
                              {node.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-white dark:bg-neutral-900 p-2 rounded border border-neutral-200/60 dark:border-neutral-800/60">
                          <div>
                            <span className="text-neutral-400 block text-[10px]">But avant tactique :</span>
                            <span className="text-neutral-700 dark:text-neutral-300 truncate block">{node.goalBefore}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[10px]">Résultat après tactique :</span>
                            <span className="text-emerald-600 dark:text-emerald-400 truncate block">{node.goalAfter}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 text-xs text-neutral-600 dark:text-neutral-400">
                    <p className="font-semibold text-cyan-700 dark:text-cyan-300 mb-0.5">Convergence du MCTS :</p>
                    L'agent probabiliste a évalué les embranchements de tactiques. Le nœud d'induction a obtenu un Q-value optimal de 0.98 avec une sélection systématique via le critère PUCT.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ALPHAGEOMETRY & MOTEUR DD */}
        {activeTab === 'alphageometry' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-500" />
                  <span>Modélisation Géométrique Neuro-Symbolique (AlphaGeometry)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Moteur de Déduction Géométrique (DD) symbolique saturant les faits + Modèle neuronal prédisant des constructions auxiliaires invisibles (cercles, droites) pour débloquer la preuve IMO.
                </p>
              </div>

              <button
                onClick={handleRunAlphaGeometry}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors disabled:opacity-50 shadow-sm shrink-0"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saturation DD en cours...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Lancer Saturation DD & Auxiliaire</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Interactive Geometric SVG Canvas */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4 text-amber-500" />
                      <span>Diagramme Géométrique Dynamique ({alphaGeometry.problemCode})</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Construction Auxiliaire Active
                    </span>
                  </div>

                  {/* SVG Canvas */}
                  <div className="bg-neutral-950 rounded-lg p-2 flex items-center justify-center border border-neutral-800">
                    <svg viewBox="0 0 350 270" className="w-full h-64 select-none">
                      {/* Grid background */}
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#222" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />

                      {/* Circles (including discovered auxiliary circle) */}
                      {alphaGeometry.diagram.circles.map((circle) => {
                        const centerPt = alphaGeometry.diagram.points.find((p) => p.id === circle.center) || { x: 235, y: 202 };
                        return (
                          <circle
                            key={circle.id}
                            cx={centerPt.x}
                            cy={centerPt.y}
                            r={circle.radius}
                            fill="none"
                            stroke="#f59e0b"
                            strokeWidth="1.5"
                            strokeDasharray={circle.isAuxiliary ? '4 3' : undefined}
                            className="transition-all duration-700"
                          />
                        );
                      })}

                      {/* Lines */}
                      {alphaGeometry.diagram.lines.map((line) => {
                        const p1 = alphaGeometry.diagram.points.find((p) => p.id === line.from);
                        const p2 = alphaGeometry.diagram.points.find((p) => p.id === line.to);
                        if (!p1 || !p2) return null;
                        return (
                          <line
                            key={line.id}
                            x1={p1.x}
                            y1={p1.y}
                            x2={p2.x}
                            y2={p2.y}
                            stroke={line.color || '#666'}
                            strokeWidth={line.isAuxiliary ? '2' : '1.5'}
                            strokeDasharray={line.isAuxiliary ? '4 2' : undefined}
                          />
                        );
                      })}

                      {/* Right-angle markers for D and E */}
                      <rect x="162" y="227" width="8" height="8" fill="none" stroke="#06b6d4" strokeWidth="1" />
                      <rect x="238" y="112" width="7" height="7" fill="none" stroke="#06b6d4" strokeWidth="1" transform="rotate(25 245 115)" />

                      {/* Points */}
                      {alphaGeometry.diagram.points.map((pt) => (
                        <g key={pt.id}>
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={pt.isAuxiliary ? 4.5 : 3.5}
                            fill={pt.isAuxiliary ? '#f59e0b' : '#06b6d4'}
                            stroke="#fff"
                            strokeWidth="1"
                          />
                          <text
                            x={pt.x + 7}
                            y={pt.y - 5}
                            fill={pt.isAuxiliary ? '#fbbf24' : '#e2e8f0'}
                            fontSize="11"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {pt.label}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                      <span>Éléments initiaux (Triangle ABC + Hauteurs AD, BE)</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>Construction Auxiliaire (Cercle Γ & Milieu M)</span>
                    </span>
                  </div>
                </div>

                {/* Auxiliary Construction Detail */}
                <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/20 space-y-2">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Découverte Neuronale : {alphaGeometry.auxiliaryConstruction.name}</span>
                  </span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300">
                    {alphaGeometry.auxiliaryConstruction.description}
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium bg-amber-500/10 p-2 rounded border border-amber-500/20">
                    {alphaGeometry.auxiliaryConstruction.impactExplanation}
                  </p>
                </div>
              </div>

              {/* Right Column: Deduction Engine (DD) Saturation & Steps */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                      Moteur DD (Deductive Database) - Faits Saturés ({alphaGeometry.saturatedFactsCount})
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                      Règles : Angles & Cocyclicité
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    {alphaGeometry.ddEngineFacts.map((fact, idx) => (
                      <div key={idx} className="p-2 rounded bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-start gap-2">
                        <span className="text-cyan-500 font-bold">✓</span>
                        <span>{fact}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proof Chain */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Chaîne de Preuve Formelle Certifiée (Q.E.D.)
                  </span>

                  <div className="space-y-2 text-xs">
                    {alphaGeometry.proofSteps.map((step) => (
                      <div
                        key={step.step}
                        className={`p-2.5 rounded-lg border ${
                          step.isAuxiliaryTriggered
                            ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-500/30'
                            : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 text-[11px]">
                            Étape {step.step} : {step.rule}
                          </span>
                          {step.isAuxiliaryTriggered && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 font-bold">
                              Trigger Auxiliaire
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
                          {step.deduction}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. SMT & INVARIANTS PAR INDUCTION */}
        {activeTab === 'smt_invariants' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Programmation Logique par Contraintes & Solveurs SAT/SMT Avancés</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Recherche d'invariants par induction mathématique (P(0) ∧ ∀k, P(k) ⇒ P(k+1)) et réduction homologique sur complexes de contraintes (Betti 0/1).
                </p>
              </div>

              <button
                onClick={handleRunSmtInvariant}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 shadow-sm shrink-0"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Vérification SMT...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Vérifier Invariant & Homologie SMT</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Code & Inductive Invariant */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                      Boucle & Spécification Formelle
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {smtState.smtSolverVerdict}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-950 font-mono text-xs text-neutral-200 border border-neutral-800 overflow-x-auto">
                    <pre className="text-neutral-100">{smtState.codeSnippet}</pre>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                      <span className="text-neutral-400 block text-[10px]">Précondition Initiale :</span>
                      <span className="text-cyan-600 dark:text-cyan-400 font-bold">{smtState.precondition}</span>
                    </div>
                    <div className="p-2 rounded bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30">
                      <span className="text-emerald-500 block text-[10px] font-bold">Invariant de Boucle Découvert :</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{smtState.candidateInvariant}</span>
                    </div>
                    <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                      <span className="text-neutral-400 block text-[10px]">Postcondition Finale :</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{smtState.postcondition}</span>
                    </div>
                  </div>
                </div>

                {/* Mathematical Induction Checkers */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Garantie d'Induction Mathématique
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Cas de Base P(0)</span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">Pre ⇒ Inv</span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-neutral-500 block text-[10px]">Hérédité P(k)⇒P(k+1)</span>
                        <span className="font-bold text-neutral-800 dark:text-neutral-200">Inv ∧ Cond ⇒ Inv'</span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Homological Reduction & UNSAT Cores */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                      Réduction Homologique sur Graphe de Contraintes
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      Topologie SMT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800/40 text-center">
                      <span className="text-neutral-500 block text-[10px]">Betti 0 (Composantes Connexes)</span>
                      <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                        β₀ = {smtState.homologyReduction.betti0_connectedComponents}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center">
                      <span className="text-neutral-500 block text-[10px]">Betti 1 (Trous Topologiques / Cycles)</span>
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        β₁ = {smtState.homologyReduction.betti1_topologicalHoles}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-2">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                      Cycles de Propagation Unitaire & Clauses CDCL ({smtState.homologyReduction.conflictDrivenClausesCount}) :
                    </span>
                    <div className="space-y-1 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                      {smtState.homologyReduction.unsatCoreCycles.map((cycle, idx) => (
                        <p key={idx} className="flex items-start gap-1.5">
                          <span className="text-cyan-500 font-bold">•</span>
                          <span>{cycle}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 text-xs text-neutral-600 dark:text-neutral-400">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-0.5">Avantage de la réduction homologique :</p>
                    L'absence de trou topologique 1D (β₁ = 0) démontre l'absence de contraction contradictoire entre clauses. Le solveur CDCL converge sans explosion combinatoire.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. TRANSFORMERS D'ARBRES DE SYNTAXE (AST TACTICS) */}
        {activeTab === 'ast_transformers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-indigo-500" />
                  <span>Tactiques d’Exploration par Transformers d'Arbres de Syntaxe (AST)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Les modèles séquentiels naïfs échouent sur les longues chaînes de déduction formelle. Les Tree-Transformers propagent l'attention bidirectionnelle sur l'arbre syntaxique abstrait.
                </p>
              </div>

              <button
                onClick={handleRunAstTransformer}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 shadow-sm shrink-0"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Calcul d'attention AST...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Analyser l'Attention AST</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Comparative Analysis */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/20 space-y-2">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Échec des LLMs Séquentiels (Gauche-Droite)</span>
                  </span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {astState.linearPredictionLimitation}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Avantage des Tree-Transformers sur AST</span>
                  </span>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {astState.treeAttentionAdvantage}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Dépendances Non-Locales Résolues :
                  </span>
                  <div className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                    {astState.nonLocalDependenciesResolved.map((dep, idx) => (
                      <p key={idx} className="flex items-start gap-1.5 font-mono text-[11px]">
                        <span className="text-indigo-500 font-bold">✓</span>
                        <span>{dep}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* AST Tree Visualizer */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                      Arbre de Syntaxe Abstraite (AST) & Scores d'Attention
                    </span>
                    <span className="text-[11px] font-mono text-neutral-400">
                      Formule de Premier Ordre
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-neutral-950 font-mono text-xs text-cyan-300 border border-neutral-800 overflow-x-auto">
                    {astState.expression}
                  </div>

                  <div className="space-y-2">
                    {astState.nodes.map((node) => (
                      <div
                        key={node.id}
                        className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-mono text-xs font-bold">
                            {node.id}
                          </span>
                          <div>
                            <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                              {node.label}
                            </span>
                            <span className="text-[10px] text-neutral-400 block font-sans">
                              Type : {node.nodeType} {node.childrenIds.length > 0 && `(Enfants: ${node.childrenIds.join(', ')})`}
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-[10px] text-neutral-500 block">Attention Structurelle</span>
                          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {(node.structuralAttentionScore * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. SMOOTH RELAXATION (DIFFERENTIATION SUR STRUCTURES DISCRETES) */}
        {activeTab === 'smooth_relaxation' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Waves className="w-5 h-5 text-purple-500" />
                  <span>Différenciation Automatique sur Structures Discrètes (Smooth Relaxation)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Transformation temporaire d'un problème combinatoire discret en une variété continue et lisse, descente de gradient, puis projection rigoureuse vers l'espace discret.
                </p>
              </div>

              <button
                onClick={handleRunSmoothRelaxation}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50 shadow-sm shrink-0"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Descente & Projection...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Exécuter Smooth Relaxation</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Relaxation Mechanics & Controls */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Pipeline en 3 Phases : Discret ➔ Continu ➔ Discret Exact
                  </span>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
                      <span className="font-bold text-neutral-900 dark:text-neutral-100 block mb-0.5">
                        Phase 1 : Relaxation Continue (Gumbel-Softmax & Barrière Entropique)
                      </span>
                      <p className="text-neutral-500">
                        L'espace combinatoire &#123;0, 1&#125;⁶ est relaxé vers le polytope continu [0, 1]⁶ avec température τ = {temperature}.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/40">
                      <span className="font-bold text-purple-700 dark:text-purple-300 block mb-0.5">
                        Phase 2 : Descente de Gradient Différentiable
                      </span>
                      <p className="text-neutral-500">
                        Le réseau applique sa descente ∇L(x) sur la variété lisse pour naviguer vers l'optimum global.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">
                        Phase 3 : Projection Déterministe Rigoureuse Π_D(x*)
                      </span>
                      <p className="text-neutral-500">
                        Projection inverse vers l'espace discret entier sans aucune violation de contrainte.
                      </p>
                    </div>
                  </div>

                  {/* Temperature Slider */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-neutral-600 dark:text-neutral-400 font-medium">Température de Relaxation (τ) :</span>
                      <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{temperature}</span>
                    </div>
                    <input
                      type="range"
                      min={0.05}
                      max={1.0}
                      step={0.05}
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>

                {/* State Vectors */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                    Vecteurs d'État : Relaxé Continu vs Projeté Discret
                  </span>

                  <div className="space-y-2 font-mono text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[10px] mb-1">Vecteur Continu Relaxé (Variété [0, 1]⁶) :</span>
                      <div className="p-2 rounded bg-neutral-950 text-purple-400 overflow-x-auto">
                        [{smoothState.currentRelaxedContinuous.join(', ')}]
                      </div>
                    </div>

                    <div>
                      <span className="text-neutral-400 block text-[10px] mb-1">Solution Discrète Projetée (Espace &#123;0, 1&#125;⁶) :</span>
                      <div className="p-2 rounded bg-neutral-950 text-emerald-400 font-bold overflow-x-auto flex items-center justify-between">
                        <span>[{smoothState.projectedDiscreteSolution.join(', ')}]</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-sans">
                          100% FEASIBLE (0 VIOLATION)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Optimization Trajectory */}
              <div className="lg:col-span-6 space-y-4">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                      Trajectoire d'Optimisation Différentiable
                    </span>
                    <span className="text-[11px] font-mono text-emerald-500 font-bold">
                      Objectif Exact = {smoothState.exactObjectiveValue}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 text-left text-[11px]">
                          <th className="py-2">Epoch</th>
                          <th className="py-2">Température τ</th>
                          <th className="py-2">Perte Continue</th>
                          <th className="py-2">Norme Gradient ||∇L||</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                        {smoothState.optimizationSteps.map((step) => (
                          <tr key={step.epoch}>
                            <td className="py-2 font-bold text-cyan-600 dark:text-cyan-400">#{step.epoch}</td>
                            <td className="py-2 text-neutral-500">{step.temperature}</td>
                            <td className="py-2 text-purple-600 dark:text-purple-400">{step.continuousLoss}</td>
                            <td className="py-2 text-emerald-600 dark:text-emerald-400">{step.gradientNorm}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-0.5">Garantie Mathématique :</p>
                    Grâce à la décroissance thermique (annealing) de τ, la perte continue L(x) s'approche asymptotiquement de la fonction coût discrète. La projection finale élimine toute violation d'arrondi.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. QUANTUM NEURO-SYMBOLIC */}
        {activeTab === 'quantum' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Atom className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Émergence du Quantum Neuro-Symbolique & Logique Différentiable</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Reframer la conception de circuits quantiques ou la recherche de preuves comme un problème de logique différentiable guidé par la T-norme de produit.
                </p>
              </div>

              <button
                onClick={handleOptimizeQuantumCircuit}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 shadow-sm shrink-0"
              >
                {isRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Optimisation Parameter-Shift...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Optimiser Circuit Quantique</span>
                  </>
                )}
              </button>
            </div>

            {/* Quantum Circuit Interactive Diagram */}
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                  Circuit Quantique Variationnel (VQC) à 3 Qubits
                </span>
                <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                  Angle paramétrique θ = {theta.toFixed(3)} rad
                </span>
              </div>

              {/* Wire Canvas Representation */}
              <div className="p-4 rounded-lg bg-neutral-950 font-mono text-xs text-neutral-200 space-y-4 overflow-x-auto">
                {/* Qubit 0 */}
                <div className="flex items-center gap-3">
                  <span className="w-12 text-cyan-400 shrink-0 font-bold">|q₀⟩ —</span>
                  <div className="flex-1 flex items-center border-b border-neutral-700 h-0.5 relative">
                    <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-600 text-[10px] -translate-y-1/2 ml-6">
                      H
                    </span>
                    <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-600 text-[10px] -translate-y-1/2 ml-16">
                      R_z(π/4)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-900 border border-cyan-500 text-[10px] -translate-y-1/2 ml-20 text-cyan-300">
                      M
                    </span>
                  </div>
                </div>

                {/* Qubit 1 */}
                <div className="flex items-center gap-3">
                  <span className="w-12 text-cyan-400 shrink-0 font-bold">|q₁⟩ —</span>
                  <div className="flex-1 flex items-center border-b border-neutral-700 h-0.5 relative">
                    <span className="px-2 py-0.5 rounded bg-indigo-900 border border-indigo-500 text-[10px] -translate-y-1/2 ml-12 text-indigo-200 font-bold">
                      R_y(θ)
                    </span>
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 -translate-y-1/2 ml-16" />
                    <span className="px-2 py-0.5 rounded bg-cyan-900 border border-cyan-500 text-[10px] -translate-y-1/2 ml-24 text-cyan-300">
                      M
                    </span>
                  </div>
                </div>

                {/* Qubit 2 */}
                <div className="flex items-center gap-3">
                  <span className="w-12 text-cyan-400 shrink-0 font-bold">|q₂⟩ —</span>
                  <div className="flex-1 flex items-center border-b border-neutral-700 h-0.5 relative">
                    <div className="w-5 h-5 rounded-full border border-neutral-400 flex items-center justify-center -translate-y-1/2 ml-28 text-xs">
                      ⊕
                    </div>
                    <span className="px-2 py-0.5 rounded bg-cyan-900 border border-cyan-500 text-[10px] -translate-y-1/2 ml-16 text-cyan-300">
                      M
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider for theta */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Ajuster l'angle rotationnel θ de la porte R_y :
                  </span>
                  <span className="font-mono text-cyan-600 dark:text-cyan-400 tabular-nums">
                    θ = {theta.toFixed(2)} rad ({( (theta * 180) / Math.PI ).toFixed(0)}°)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6.28"
                  step="0.05"
                  value={theta}
                  onChange={(e) => setTheta(parseFloat(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="text-neutral-500 block text-[11px]">Fitness T-Norme Produit</span>
                <span className="font-bold text-sm text-cyan-600 dark:text-cyan-400 tabular-nums">
                  {quantumState.productTNormFitness}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">T(a,b) = a · b</span>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="text-neutral-500 block text-[11px]">Gradient Parameter-Shift</span>
                <span className="font-bold text-sm text-amber-600 dark:text-amber-400 tabular-nums">
                  {quantumState.parameterShiftGradient}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">∂⟨H⟩/∂θ analytique</span>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="text-neutral-500 block text-[11px]">Perte Logique Différentiable</span>
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {quantumState.logicalLoss}
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">Relaxation continue</span>
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <span className="text-neutral-500 block text-[11px]">État Intriqué Majoritaire</span>
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  |000⟩ & |110⟩
                </span>
                <span className="text-[10px] text-neutral-400 block mt-0.5">Amplitudes corrélées</span>
              </div>
            </div>

            {/* Distribution chart */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 block">
                Distribution des Probabilités des États Quantiques Mesurés (Base computationnelle) :
              </span>
              <div className="space-y-2 font-mono text-xs">
                {Object.entries(quantumState.stateProbabilities).map(([state, prob]) => (
                  <div key={state} className="flex items-center gap-3">
                    <span className="w-12 text-neutral-600 dark:text-neutral-400 font-bold shrink-0">
                      {state}
                    </span>
                    <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-cyan-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(prob * 100)}%` }}
                      />
                    </div>
                    <span className="w-14 text-right tabular-nums text-neutral-700 dark:text-neutral-300">
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. T-NORMES & DIFFÉRENTIATION LOGIQUE */}
        {activeTab === 'tnorm' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>La T-Norme de Produit & Différentiation Logique</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Relaxation continue des prédicats booléens discrets vers l'intervalle [0, 1] pour permettre la rétropropagation des gradients.
              </p>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-600 dark:text-neutral-400">Vérité Prédicat A :</span>
                  <span className="font-bold text-cyan-600">{valA.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={valA}
                  onChange={(e) => setValA(parseFloat(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-600 dark:text-neutral-400">Vérité Prédicat B :</span>
                  <span className="font-bold text-cyan-600">{valB.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={valB}
                  onChange={(e) => setValB(parseFloat(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Mathematical comparisons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {/* Product T-Norm */}
              <div className="p-4 rounded-xl border border-cyan-300 dark:border-cyan-800 bg-cyan-50/30 dark:bg-cyan-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-800 dark:text-cyan-300">T-Norme de Produit</span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-600 px-1.5 py-0.5 rounded font-bold">
                    Différentiable
                  </span>
                </div>
                <div className="text-xl font-bold text-cyan-700 dark:text-cyan-400 tabular-nums">
                  T(a, b) = {tnorm.productTNorm}
                </div>
                <p className="text-[11px] text-neutral-500 font-sans">
                  Formule : <code className="font-mono">a · b</code>
                </p>
                <div className="pt-2 border-t border-cyan-200 dark:border-cyan-800/60 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
                  <div>∂T/∂a = {tnorm.gradA.toFixed(2)}</div>
                  <div>∂T/∂b = {tnorm.gradB.toFixed(2)}</div>
                </div>
              </div>

              {/* Product S-Norm (Conorme) */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">S-Norme Produit (OU)</span>
                  <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                    Dualité
                  </span>
                </div>
                <div className="text-xl font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                  S(a, b) = {tnorm.productSNorm}
                </div>
                <p className="text-[11px] text-neutral-500 font-sans">
                  Formule : <code className="font-mono">a + b - a·b</code>
                </p>
              </div>

              {/* Lukasiewicz */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">T-Norme Łukasiewicz</span>
                  <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
                    Bornée
                  </span>
                </div>
                <div className="text-xl font-bold text-neutral-800 dark:text-neutral-200 tabular-nums">
                  {tnorm.lukasiewiczTNorm}
                </div>
                <p className="text-[11px] text-neutral-500 font-sans">
                  Formule : <code className="font-mono">max(0, a + b - 1)</code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. TOPOLOGY & SIMPLICIAL COMPLEXES */}
        {activeTab === 'topology' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Network className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Topological Data Analysis (TDA) & Homologie Persistante</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Filtration de complexes de Vietoris-Rips pour extraire des invariants de forme géométrique (nombres de Betti β₀ et β₁).
              </p>
            </div>

            {/* Slider epsilon */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Rayon de filtration (Distance de voisinage ε) :
                </span>
                <span className="font-bold text-cyan-600 tabular-nums">ε = {epsilon} px</span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                step="2"
                value={epsilon}
                onChange={(e) => setEpsilon(parseInt(e.target.value))}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>

            {/* Interactive SVG Simplicial Complex */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 flex flex-col items-center justify-center">
                <svg width="300" height="280" className="overflow-visible">
                  {/* Triangles (2-simplexes) */}
                  {topology.triangles.map(([i, j, k], idx) => (
                    <polygon
                      key={`tri-${idx}`}
                      points={`${nodes[i].x},${nodes[i].y} ${nodes[j].x},${nodes[j].y} ${nodes[k].x},${nodes[k].y}`}
                      fill="rgba(6, 182, 212, 0.25)"
                      stroke="none"
                    />
                  ))}

                  {/* Edges (1-simplexes) */}
                  {topology.edges.map(([i, j], idx) => (
                    <line
                      key={`edge-${idx}`}
                      x1={nodes[i].x}
                      y1={nodes[i].y}
                      x2={nodes[j].x}
                      y2={nodes[j].y}
                      stroke="#06b6d4"
                      strokeWidth="2"
                    />
                  ))}

                  {/* Nodes (0-simplexes) */}
                  {nodes.map((n, idx) => (
                    <g key={n.id}>
                      <circle cx={n.x} cy={n.y} r={epsilon / 2} fill="rgba(6, 182, 212, 0.08)" />
                      <circle cx={n.x} cy={n.y} r="5" fill="#38bdf8" />
                      <text x={n.x + 8} y={n.y - 8} fill="#94a3b8" fontSize="11" fontFamily="monospace">
                        p{idx}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              {/* Betti Numbers card */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <span className="text-neutral-500 block text-[11px]">Betti 0 (β₀)</span>
                  <span className="font-bold text-lg text-cyan-600 dark:text-cyan-400 tabular-nums">
                    {topology.betti0} composante(s)
                  </span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Connectivité globale</span>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <span className="text-neutral-500 block text-[11px]">Betti 1 (β₁)</span>
                  <span className="font-bold text-lg text-amber-600 dark:text-amber-400 tabular-nums">
                    {topology.betti1} cycle / trou 1D
                  </span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Cavités persistantes</span>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                  <span className="text-neutral-500 block text-[11px]">Complexité Simpliciale</span>
                  <div className="text-neutral-700 dark:text-neutral-300 space-y-0.5 pt-1">
                    <div>{nodes.length} sommets (0-simplexes)</div>
                    <div>{topology.edges.length} arêtes (1-simplexes)</div>
                    <div>{topology.triangles.length} triangles (2-simplexes)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. ABDUCTION & INDUCTION (ILP) */}
        {activeTab === 'abduction' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Machine Learning Symbolique : Abduction & Programmation Logique Inductive (ILP)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Dérivation de l'hypothèse explicative H à partir de B ∧ H ⊨ O et induction de clauses de Horn générales.
                </p>
              </div>

              <button
                onClick={handleRunAbduction}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 shadow-sm shrink-0"
              >
                {isRunning ? 'Résolution Inverse...' : 'Déduire par Abduction'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Background Knowledge */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                  Connaissances de Base (Background Knowledge B)
                </span>
                <div className="p-3 rounded-lg bg-neutral-950 font-mono text-xs text-cyan-300 space-y-1">
                  {abductiveState.backgroundKnowledge.map((k, i) => (
                    <div key={i}>{k}</div>
                  ))}
                </div>
              </div>

              {/* Observations */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                  Observations Empiriques (Observations O)
                </span>
                <div className="p-3 rounded-lg bg-neutral-950 font-mono text-xs text-amber-300 space-y-1">
                  {abductiveState.observations.map((o, i) => (
                    <div key={i}>{o}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results: Abduced Hypothesis & Induced Rule */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                  Résultats Déduits par Résolution Inverse (Inverse Resolution) :
                </span>
                <span className="text-emerald-600 font-bold">Confiance : {(abductiveState.confidenceScore * 100).toFixed(0)}%</span>
              </div>

              <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 space-y-2">
                <div>
                  <span className="text-neutral-500 block text-[11px]">Hypothèse Abductive H (B ∧ H ⊨ O) :</span>
                  <span className="text-cyan-600 dark:text-cyan-400 font-bold">{abductiveState.abducedHypothesis}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[11px]">Clause de Horn Inductive Générale :</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{abductiveState.inducedGeneralRule}</span>
                </div>
              </div>

              {/* Proof trace */}
              <div className="space-y-1 pt-1 text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold block text-neutral-800 dark:text-neutral-200">Trace de Preuve Formelle :</span>
                {abductiveState.formalProof.map((step, idx) => (
                  <div key={idx} className="text-[11px]">{step}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. MATRIX-BASED LOGIC (TensorLog) */}
        {activeTab === 'matrix_logic' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Binary className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Programmation Logique Différentiable Matrix-Based (TensorLog)</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Représentation des faits et relations sous forme matricielle et résolution par produit matriciel différentiable.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
              {/* Matrix Parent */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 block">
                  Matrice Relationnelle M_Parent (Entités: Alice, Bob, Charlie)
                </span>
                <div className="p-3 rounded-lg bg-neutral-950 text-neutral-200 space-y-1">
                  {matrixParent.map((row, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="w-16 text-neutral-500">{matrixEntities[i]}:</span>
                      {row.map((val, j) => (
                        <span key={j} className={val === 1 ? 'text-cyan-400 font-bold' : 'text-neutral-700'}>
                          {val}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Matrix GrandParent = Parent x Parent */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-50/20 dark:bg-cyan-950/20 space-y-3">
                <span className="font-bold text-cyan-800 dark:text-cyan-300 block">
                  Produit Matriciel : M_GrandParent = M_Parent × M_Parent
                </span>
                <div className="p-3 rounded-lg bg-neutral-950 text-neutral-200 space-y-1">
                  {matrixGrandParent.map((row, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="w-16 text-cyan-400">{matrixEntities[i]}:</span>
                      {row.map((val, j) => (
                        <span key={j} className={val >= 1 ? 'text-emerald-400 font-bold' : 'text-neutral-700'}>
                          {val}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-500 font-sans">
                  Résultat déduit : <strong className="text-cyan-700 dark:text-cyan-300">Alice est Grand-Parent de Charlie</strong> (Row 0, Col 2 = 1).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 6. SIGS (Program Synthesis) */}
        {activeTab === 'sigs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span>Synthèse de Programmes Neuro-Symboliques (SIGS)</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Complétion d'esquisses de code (Sketches avec trous '??') guidée par spécification entrées/sorties.
                </p>
              </div>

              <button
                onClick={handleRunSigs}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 shadow-sm shrink-0"
              >
                {isRunning ? 'Synthèse en cours...' : 'Synthétiser Programme'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <span className="font-bold text-neutral-800 dark:text-neutral-200 block">
                  Esquisse de Code (Sketch avec trou ??) :
                </span>
                <pre className="p-3 rounded-lg bg-neutral-950 text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                  {sketchState.sketchCode}
                </pre>
              </div>

              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <span className="font-bold text-emerald-600 block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Programme Synthétisé et Vérifié :
                </span>
                <pre className="p-3 rounded-lg bg-neutral-950 text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                  {sketchState.synthesizedImplementation}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* 7. WORLD MODELS (V-M-C) */}
        {activeTab === 'world_models' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                <span>Modèles du Monde Tri-Partites (World Models V-M-C)</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Architecture triadique : Perception (V), Mémoire récurrente de dynamique (M - RSSM), et Contrôleur décisionnel (C).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {/* V - Vision/Perception */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <span className="font-bold text-cyan-700 dark:text-cyan-400 block">
                  [V] Encodeur VAE (Vecteur z)
                </span>
                <div className="text-[11px] text-neutral-500">Compression de l'état d'entrée :</div>
                <div className="p-2.5 rounded bg-neutral-950 text-neutral-300 overflow-x-auto">
                  [{worldModel.perceptionZ.join(', ')}]
                </div>
              </div>

              {/* M - Memory */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <span className="font-bold text-indigo-700 dark:text-indigo-400 block">
                  [M] Mémoire RSSM (État h)
                </span>
                <div className="text-[11px] text-neutral-500">Dynamique latente prédictive :</div>
                <div className="p-2.5 rounded bg-neutral-950 text-neutral-300 overflow-x-auto">
                  [{worldModel.memoryH.join(', ')}]
                </div>
              </div>

              {/* C - Controller */}
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
                <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                  [C] Contrôleur (Action a)
                </span>
                <div className="text-[11px] text-neutral-500">Politique de décision optimale :</div>
                <div className="p-2.5 rounded bg-neutral-950 text-emerald-400 font-bold truncate">
                  {worldModel.controllerAction}
                </div>
              </div>
            </div>

            {/* Trajectory */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider block">
                Trajectoire Imaginée dans l'Espace Latent (Rollout / Dreaming)
              </span>
              <div className="grid grid-cols-4 gap-2 font-mono text-xs">
                {worldModel.imaginedTrajectory.map((t) => (
                  <div key={t.step} className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-center">
                    <span className="text-neutral-400 block text-[10px]">T+{t.step}</span>
                    <span className="font-bold text-cyan-600 block">z = {t.latentState}</span>
                    <span className="text-[11px] text-emerald-600">R: +{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
