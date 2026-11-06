import React, { useState, useMemo, useRef } from 'react';
import {
  Bot,
  Play,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Cpu,
  Clock,
  Terminal,
  UserCheck,
  XCircle,
  Plus,
  GripVertical,
  Network,
  GitBranch,
  ArrowRight,
  ArrowDown,
  Layers,
  ChevronUp,
  ChevronDown,
  Trash2,
  Sparkles,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Workflow,
  List,
  Columns,
  RefreshCw,
} from 'lucide-react';
import { AgentTaskNode, AgentRole } from '../types/aiDev';

interface AgenticWorkspaceViewProps {
  onDecomposeMission: (mission: string) => Promise<{ tasks: AgentTaskNode[]; initialScratchpad?: string }>;
  isRunning: boolean;
}

const DEFAULT_MISSION =
  'Auditer la sécurité des routes API, corriger les injections SQL détectées, générer les tests unitaires et préparer la PR de déploiement.';

const INITIAL_TASKS: AgentTaskNode[] = [
  {
    id: 'task-1',
    role: 'planner',
    title: 'Analyse du référentiel et cartographie des vulnérabilités',
    description: 'Scanne les contrôleurs REST et identifie les concaténations SQL non paramétrées.',
    status: 'completed',
    toolInvocation: {
      name: 'ast_grep_symbols',
      args: { query: 'query("SELECT * FROM " + input)' },
      isRisky: false,
    },
    output: 'Trouvé 2 requêtes vulnérables dans /src/api/orders.ts (lignes 42 et 88).',
    executionTimeMs: 420,
    dependencies: [],
  },
  {
    id: 'task-2',
    role: 'coder',
    title: 'Refactorisation vers requêtes préparées paramétrées',
    description: 'Remplace les concaténations brutes par des placeholders $1, $2 avec typage strict.',
    status: 'completed',
    toolInvocation: {
      name: 'code_patch',
      args: { file: 'src/api/orders.ts', diffType: 'unified' },
      isRisky: false,
    },
    output: 'Requêtes refactorisées avec parameterized queries et validation Zod.',
    executionTimeMs: 650,
    dependencies: ['task-1'],
  },
  {
    id: 'task-3',
    role: 'critic',
    title: 'Vérification formelle et audit de non-régression',
    description: 'Contrôle la conformité OWASP Top 10 et analyse la couverture de tests.',
    status: 'completed',
    output: 'Audit validé : 0 vulnérabilité résiduelle. 100% conforme OWASP A03:2021.',
    executionTimeMs: 380,
    dependencies: ['task-2'],
  },
  {
    id: 'task-4',
    role: 'executor',
    title: 'Exécution des migrations SQL en base de staging',
    description: 'Applique la migration DDL sur l’instance PostgreSQL de pré-production.',
    status: 'waiting_hitl_approval',
    toolInvocation: {
      name: 'db_migrate_apply',
      args: { targetEnv: 'staging-cluster-01', destructive: false },
      isRisky: true,
    },
    executionTimeMs: 0,
    dependencies: ['task-2'],
  },
  {
    id: 'task-5',
    role: 'supervisor',
    title: 'Création de la Pull Request et déclenchement du pipeline CI/CD',
    description: 'Ouvre la PR sur GitHub et notifie l’équipe DevOps sur Slack.',
    status: 'pending',
    toolInvocation: {
      name: 'git_create_pull_request',
      args: { branch: 'fix/sql-injection-orders', reviewers: ['sec-team'] },
      isRisky: true,
    },
    dependencies: ['task-3', 'task-4'],
  },
];

export const AgenticWorkspaceView: React.FC<AgenticWorkspaceViewProps> = ({
  onDecomposeMission,
  isRunning,
}) => {
  const [mission, setMission] = useState(DEFAULT_MISSION);
  const [tasks, setTasks] = useState<AgentTaskNode[]>(INITIAL_TASKS);
  const [scratchpad, setScratchpad] = useState(
    '### Espace Mémoire Partagé de l’Agent (Scratchpad)\n- Cible : API Orders & Payments\n- Statut d’avancement : 3/5 étapes franchies\n- En attente de validation humaine pour migration DB.'
  );

  // View state: 'graph' (DAG visual canvas), 'list' (reorderable cards), 'split' (both)
  const [viewMode, setViewMode] = useState<'graph' | 'list' | 'split'>('graph');
  const [dagOrientation, setDagOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>('task-4');

  // Drag-and-drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null);

  // Modal for adding a new DAG task
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskRole, setNewTaskRole] = useState<AgentRole>('coder');
  const [newTaskTool, setNewTaskTool] = useState('');

  // Graph canvas container ref
  const canvasRef = useRef<HTMLDivElement>(null);

  const roleColors: Record<
    AgentRole,
    { bg: string; text: string; border: string; glow: string; darkBg: string }
  > = {
    planner: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      darkBg: 'dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-300 dark:border-indigo-700',
      glow: 'shadow-indigo-500/20',
    },
    coder: {
      bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      darkBg: 'dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-300 dark:border-cyan-700',
      glow: 'shadow-cyan-500/20',
    },
    critic: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      darkBg: 'dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-300 dark:border-amber-700',
      glow: 'shadow-amber-500/20',
    },
    executor: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      darkBg: 'dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-300 dark:border-emerald-700',
      glow: 'shadow-emerald-500/20',
    },
    supervisor: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      darkBg: 'dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-300 dark:border-purple-700',
      glow: 'shadow-purple-500/20',
    },
  };

  const handleRunDecomposition = async () => {
    if (!mission.trim()) return;
    const res = await onDecomposeMission(mission);
    if (res && res.tasks) {
      setTasks(res.tasks);
      if (res.initialScratchpad) {
        setScratchpad(res.initialScratchpad);
      }
    }
  };

  const handleApproveTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'completed',
              approvalComment: 'Validé par l’ingénieur superviseur (HITL)',
              output: 'Action autorisée et exécutée avec succès dans l’environnement cible.',
              executionTimeMs: 480,
            }
          : t
      )
    );
  };

  const handleRejectTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'rejected',
              approvalComment: 'Action refusée par l’ingénieur superviseur',
              output: 'Exécution interrompue pour des raisons de conformité.',
            }
          : t
      )
    );
  };

  // Reordering helpers
  const moveTask = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= tasks.length) return;
    const updated = [...tasks];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setTasks(updated);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(id);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (targetId !== draggedTaskId && targetId !== dragOverTaskId) {
      setDragOverTaskId(targetId);
      // Determine if cursor is in top/left or bottom/right half
      const rect = e.currentTarget.getBoundingClientRect();
      const isBefore =
        dagOrientation === 'horizontal'
          ? e.clientX < rect.left + rect.width / 2
          : e.clientY < rect.top + rect.height / 2;
      setDropPosition(isBefore ? 'before' : 'after');
    }
  };

  const handleDragLeave = () => {
    setDragOverTaskId(null);
    setDropPosition(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!sourceId || sourceId === targetId) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      setDropPosition(null);
      return;
    }

    const fromIdx = tasks.findIndex((t) => t.id === sourceId);
    let toIdx = tasks.findIndex((t) => t.id === targetId);

    if (fromIdx !== -1 && toIdx !== -1) {
      if (dropPosition === 'after' && fromIdx < toIdx) {
        // already relative
      } else if (dropPosition === 'after' && fromIdx > toIdx) {
        toIdx += 1;
      }
      moveTask(fromIdx, toIdx);
    }

    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDropPosition(null);
  };

  const handleResetDAG = () => {
    setTasks(INITIAL_TASKS);
    setSelectedTaskId('task-4');
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: AgentTaskNode = {
      id: `task-${Date.now().toString(36)}`,
      role: newTaskRole,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || 'Étape définie manuellement par le superviseur.',
      status: 'pending',
      toolInvocation: newTaskTool.trim()
        ? {
            name: newTaskTool.trim(),
            args: { scope: 'custom_step' },
            isRisky: newTaskRole === 'executor',
          }
        : undefined,
      dependencies: tasks.length > 0 ? [tasks[tasks.length - 1].id] : [],
    };
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskTool('');
    setIsAddModalOpen(false);
    setSelectedTaskId(newTask.id);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
    if (selectedTaskId === id) {
      setSelectedTaskId(null);
    }
  };

  // Topological / Level calculation for DAG visual layout
  const { nodeCoordinates, edges } = useMemo(() => {
    const nodeMap = new Map<string, AgentTaskNode>(tasks.map((t) => [t.id, t]));
    const levels: Map<string, number> = new Map();

    // Compute topological ranks based on dependencies or sequential fallback
    const computeLevel = (taskId: string, visited = new Set<string>()): number => {
      if (visited.has(taskId)) return 0;
      if (levels.has(taskId)) return levels.get(taskId)!;
      visited.add(taskId);

      const task = nodeMap.get(taskId);
      if (!task || !task.dependencies || task.dependencies.length === 0) {
        // Default: If no explicit dependencies, check relative position
        const idx = tasks.findIndex((t) => t.id === taskId);
        levels.set(taskId, idx);
        return idx;
      }

      let maxDepLevel = -1;
      for (const depId of task.dependencies) {
        if (nodeMap.has(depId)) {
          const depLevel = computeLevel(depId, new Set(visited));
          if (depLevel > maxDepLevel) maxDepLevel = depLevel;
        }
      }
      const lvl = maxDepLevel + 1;
      levels.set(taskId, lvl);
      return lvl;
    };

    tasks.forEach((t) => computeLevel(t.id));

    // Group tasks by level to assign secondary coordinate
    const levelGroups: Record<number, AgentTaskNode[]> = {};
    tasks.forEach((t) => {
      const lvl = levels.get(t.id) ?? 0;
      if (!levelGroups[lvl]) levelGroups[lvl] = [];
      levelGroups[lvl].push(t);
    });

    const coords: Record<
      string,
      { x: number; y: number; level: number; indexInLevel: number; totalInLevel: number }
    > = {};

    const nodeWidth = 270;
    const nodeHeight = 160;
    const horizontalGap = 80;
    const verticalGap = 40;

    Object.entries(levelGroups).forEach(([lvlStr, groupTasks]) => {
      const lvl = parseInt(lvlStr, 10);
      const totalInLevel = groupTasks.length;

      groupTasks.forEach((task, idx) => {
        if (dagOrientation === 'horizontal') {
          // Horizontal pipeline: X increases with level, Y spreads within level
          const x = 40 + lvl * (nodeWidth + horizontalGap);
          const y = 50 + idx * (nodeHeight + verticalGap);
          coords[task.id] = { x, y, level: lvl, indexInLevel: idx, totalInLevel };
        } else {
          // Vertical hierarchy: Y increases with level, X spreads within level
          const y = 40 + lvl * (nodeHeight + verticalGap);
          const x = 50 + idx * (nodeWidth + horizontalGap);
          coords[task.id] = { x, y, level: lvl, indexInLevel: idx, totalInLevel };
        }
      });
    });

    // Compute directed edges
    const computedEdges: Array<{
      sourceId: string;
      targetId: string;
      sourceCoord: { x: number; y: number };
      targetCoord: { x: number; y: number };
      status: 'completed' | 'active' | 'pending' | 'rejected';
    }> = [];

    tasks.forEach((task, idx) => {
      const targetCoord = coords[task.id];
      if (!targetCoord) return;

      const deps =
        task.dependencies && task.dependencies.length > 0
          ? task.dependencies
          : idx > 0
          ? [tasks[idx - 1].id]
          : [];

      deps.forEach((depId) => {
        const sourceCoord = coords[depId];
        const sourceNode = nodeMap.get(depId);
        if (sourceCoord && sourceNode) {
          let edgeStatus: 'completed' | 'active' | 'pending' | 'rejected' = 'pending';
          if (sourceNode.status === 'completed' && task.status === 'completed') {
            edgeStatus = 'completed';
          } else if (sourceNode.status === 'completed' && task.status === 'waiting_hitl_approval') {
            edgeStatus = 'active';
          } else if (task.status === 'rejected' || sourceNode.status === 'rejected') {
            edgeStatus = 'rejected';
          }

          computedEdges.push({
            sourceId: depId,
            targetId: task.id,
            sourceCoord,
            targetCoord,
            status: edgeStatus,
          });
        }
      });
    });

    return { nodeCoordinates: coords, edges: computedEdges };
  }, [tasks, dagOrientation]);

  // Compute bounding canvas size to allow scrolling
  const canvasSize = useMemo(() => {
    let maxX = 850;
    let maxY = 450;
    Object.values(nodeCoordinates).forEach((c) => {
      if (c.x + 320 > maxX) maxX = c.x + 320;
      if (c.y + 220 > maxY) maxY = c.y + 220;
    });
    return { width: maxX, height: maxY };
  }, [nodeCoordinates]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Left/Main Column: DAG Graph Canvas & Task Sequence */}
      <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden">
        {/* Header Toolbar */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Décomposition de Mission en Graphe DAG & HITL
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-800">
                  {tasks.length} Nœuds DAG
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Visualisation interactive des dépendances causales et réorganisation par glisser-déposer (Drag & Drop).
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0.5">
              <button
                onClick={() => setViewMode('graph')}
                title="Afficher la vue Graphe DAG interactif"
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'graph'
                    ? 'bg-cyan-600 text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <Workflow className="w-3.5 h-3.5" />
                <span>Graphe DAG</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="Afficher la vue Liste ordonnée détaillée"
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-cyan-600 text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Liste</span>
              </button>
              <button
                onClick={() => setViewMode('split')}
                title="Afficher la vue combinée Graphe + Liste"
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'split'
                    ? 'bg-cyan-600 text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Scindée</span>
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Ajouter Étape</span>
            </button>

            <button
              onClick={handleResetDAG}
              title="Réinitialiser l'ordonnancement par défaut"
              className="p-1.5 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleRunDecomposition}
              disabled={isRunning || !mission.trim()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors disabled:opacity-50 shadow-xs"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Planification DAG...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Orchestrer Mission</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mission Input Prompt */}
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-950/30">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Mission globale décomposée en graphe acyclique dirigé (DAG)</span>
            </label>
            <span className="text-[11px] text-neutral-400">Éditable avant orchestration</span>
          </div>
          <textarea
            rows={2}
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            className="w-full text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-md p-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Interactive Reordering Helper Banner */}
        <div className="px-3.5 py-2 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <GripVertical className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
            <span>
              <strong>Glisser-déposer actif :</strong> Prenez un nœud par sa poignée ou son en-tête et déposez-le pour modifier l’ordonnancement et les dépendances du DAG.
            </span>
          </div>
          {draggedTaskId && (
            <span className="px-2 py-0.5 rounded bg-cyan-600 text-white font-mono text-[10px] font-semibold animate-pulse">
              Déplacement en cours : {tasks.find((t) => t.id === draggedTaskId)?.title.slice(0, 24)}...
            </span>
          )}
        </div>

        {/* Main Workspace Canvas / List Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* VIEW: GRAPH DAG CANVAS */}
          {(viewMode === 'graph' || viewMode === 'split') && (
            <div
              className={`flex-1 flex flex-col relative overflow-hidden bg-neutral-50/60 dark:bg-neutral-950/90 ${
                viewMode === 'split' ? 'border-b border-neutral-200 dark:border-neutral-800 max-h-[50vh]' : ''
              }`}
            >
              {/* DAG Controls Floating Bar */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 p-1 rounded-lg bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 shadow-sm text-xs">
                <span className="px-2 py-0.5 text-[10px] font-mono text-neutral-400 font-semibold uppercase">
                  Orientation :
                </span>
                <button
                  onClick={() => setDagOrientation('horizontal')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    dagOrientation === 'horizontal'
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-800'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>Pipeline (L-R)</span>
                </button>
                <button
                  onClick={() => setDagOrientation('vertical')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    dagOrientation === 'vertical'
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-semibold border border-cyan-200 dark:border-cyan-800'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  <ArrowDown className="w-3 h-3" />
                  <span>Flux (H-B)</span>
                </button>

                <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />

                {/* Zoom */}
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.1))}
                  title="Zoom arrière"
                  className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-semibold text-neutral-600 dark:text-neutral-400 w-8 text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
                  title="Zoom avant"
                  className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  title="Réinitialiser zoom"
                  className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status legend */}
              <div className="absolute top-3 right-3 z-20 hidden sm:flex items-center gap-2 p-1.5 rounded-lg bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 text-[10px] font-mono shadow-sm">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Validé</span>
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
                  <span>HITL</span>
                </span>
                <span className="flex items-center gap-1 text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-neutral-400 inline-block" />
                  <span>Attente</span>
                </span>
              </div>

              {/* Scrollable DAG Area */}
              <div
                ref={canvasRef}
                className="flex-1 overflow-auto p-8 relative min-h-[380px]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, rgba(100,116,139,0.15) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              >
                <div
                  className="relative transition-transform duration-150 origin-top-left"
                  style={{
                    width: `${canvasSize.width}px`,
                    height: `${canvasSize.height}px`,
                    transform: `scale(${zoomLevel})`,
                  }}
                >
                  {/* SVG Layer for Directed Acyclic Graph Edges */}
                  <svg
                    className="absolute inset-0 pointer-events-none w-full h-full overflow-visible"
                    style={{ zIndex: 1 }}
                  >
                    <defs>
                      {/* Arrowhead definitions */}
                      <marker
                        id="dag-arrow-completed"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
                      </marker>
                      <marker
                        id="dag-arrow-active"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 9 5 L 0 9 z" fill="#f59e0b" />
                      </marker>
                      <marker
                        id="dag-arrow-pending"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 9 5 L 0 9 z" fill="#94a3b8" />
                      </marker>
                      <marker
                        id="dag-arrow-rejected"
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 1 L 9 5 L 0 9 z" fill="#ef4444" />
                      </marker>
                    </defs>

                    {edges.map((edge, idx) => {
                      const isHoriz = dagOrientation === 'horizontal';
                      const startX = isHoriz
                        ? edge.sourceCoord.x + 270
                        : edge.sourceCoord.x + 135;
                      const startY = isHoriz
                        ? edge.sourceCoord.y + 70
                        : edge.sourceCoord.y + 140;

                      const endX = isHoriz ? edge.targetCoord.x : edge.targetCoord.x + 135;
                      const endY = isHoriz ? edge.targetCoord.y + 70 : edge.targetCoord.y;

                      // Cubic Bezier curve control points
                      let pathD = '';
                      if (isHoriz) {
                        const midX = (startX + endX) / 2;
                        pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
                      } else {
                        const midY = (startY + endY) / 2;
                        pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
                      }

                      const strokeColor =
                        edge.status === 'completed'
                          ? '#10b981'
                          : edge.status === 'active'
                          ? '#f59e0b'
                          : edge.status === 'rejected'
                          ? '#ef4444'
                          : '#94a3b8';

                      const markerEnd = `url(#dag-arrow-${edge.status})`;

                      return (
                        <g key={`edge-${edge.sourceId}-${edge.targetId}-${idx}`}>
                          {/* Glow background for active/completed paths */}
                          {(edge.status === 'completed' || edge.status === 'active') && (
                            <path
                              d={pathD}
                              fill="none"
                              stroke={strokeColor}
                              strokeWidth={6}
                              strokeOpacity={0.2}
                              strokeLinecap="round"
                            />
                          )}
                          <path
                            d={pathD}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={2}
                            strokeDasharray={edge.status === 'pending' ? '5,5' : undefined}
                            markerEnd={markerEnd}
                            strokeLinecap="round"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Render Draggable Task Nodes */}
                  {tasks.map((task, idx) => {
                    const coord = nodeCoordinates[task.id] || { x: 50 + idx * 300, y: 50 };
                    const roleStyle = roleColors[task.role] || roleColors.planner;
                    const isSelected = selectedTaskId === task.id;
                    const isDragging = draggedTaskId === task.id;
                    const isDragTarget = dragOverTaskId === task.id;
                    const isWaitingHITL = task.status === 'waiting_hitl_approval';

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragOver={(e) => handleDragOver(e, task.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, task.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedTaskId(task.id)}
                        style={{
                          position: 'absolute',
                          left: `${coord.x}px`,
                          top: `${coord.y}px`,
                          width: '270px',
                          zIndex: isDragging ? 50 : isSelected ? 30 : 10,
                        }}
                        className={`group cursor-grab active:cursor-grabbing rounded-xl border transition-all duration-200 select-none bg-white dark:bg-neutral-900 shadow-md ${
                          isSelected
                            ? 'ring-2 ring-cyan-500 shadow-lg'
                            : 'hover:shadow-lg hover:border-neutral-400 dark:hover:border-neutral-600'
                        } ${
                          isDragTarget
                            ? 'ring-2 ring-indigo-500 border-indigo-500 scale-105'
                            : ''
                        } ${
                          isDragging ? 'opacity-40 scale-95 border-dashed border-cyan-400' : ''
                        } ${
                          isWaitingHITL
                            ? 'border-amber-400 dark:border-amber-500/80 ring-1 ring-amber-400/40'
                            : 'border-neutral-200 dark:border-neutral-800'
                        }`}
                      >
                        {/* Drag indicator bar when targeted */}
                        {isDragTarget && (
                          <div
                            className={`absolute left-0 right-0 h-1.5 bg-indigo-500 rounded-full shadow-sm z-40 ${
                              dropPosition === 'before' ? '-top-2' : '-bottom-2'
                            }`}
                          />
                        )}

                        {/* Card Header with drag handle and role */}
                        <div className="p-2.5 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-1 bg-neutral-50/70 dark:bg-neutral-900/60 rounded-t-xl">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <span
                              title="Glisser pour réordonner dans le DAG"
                              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-grab"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400 font-bold">
                              #{idx + 1}
                            </span>
                            <span
                              className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${roleStyle.bg} ${roleStyle.darkBg}`}
                            >
                              {task.role}
                            </span>
                          </div>

                          {/* Status Pill */}
                          <div className="shrink-0 text-[10px] font-mono font-medium">
                            {task.status === 'completed' && (
                              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>OK</span>
                              </span>
                            )}
                            {task.status === 'waiting_hitl_approval' && (
                              <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold animate-pulse">
                                <ShieldAlert className="w-3 h-3" />
                                <span>HITL</span>
                              </span>
                            )}
                            {task.status === 'pending' && (
                              <span className="text-neutral-400">Attente</span>
                            )}
                            {task.status === 'rejected' && (
                              <span className="flex items-center gap-0.5 text-red-500">
                                <XCircle className="w-3 h-3" />
                                <span>Rejeté</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-3 space-y-2">
                          <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-tight">
                            {task.title}
                          </h4>

                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-snug">
                            {task.description}
                          </p>

                          {/* Tool invocation pill */}
                          {task.toolInvocation && (
                            <div className="flex items-center justify-between text-[10px] font-mono bg-neutral-100 dark:bg-neutral-950 px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800">
                              <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-400 truncate">
                                <Terminal className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">{task.toolInvocation.name}()</span>
                              </span>
                              {task.toolInvocation.isRisky && (
                                <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold px-1 rounded bg-amber-500/10">
                                  Risqué
                                </span>
                              )}
                            </div>
                          )}

                          {/* Fast HITL Action buttons on Node */}
                          {isWaitingHITL && (
                            <div className="pt-1 flex items-center justify-between gap-1 border-t border-amber-200/60 dark:border-amber-800/40">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectTask(task.id);
                                }}
                                className="px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
                              >
                                Refuser
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveTask(task.id);
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors shadow-xs"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Valider HITL</span>
                              </button>
                            </div>
                          )}

                          {/* Reordering Controls accessible from card */}
                          <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800/60 text-[10px] text-neutral-400">
                            <span className="font-mono">
                              {task.executionTimeMs ? `${task.executionTimeMs}ms` : 'Prêt'}
                            </span>
                            <div className="flex items-center gap-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTask(idx, idx - 1);
                                }}
                                disabled={idx === 0}
                                title="Monter dans le DAG"
                                className="p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-20"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveTask(idx, idx + 1);
                                }}
                                disabled={idx === tasks.length - 1}
                                title="Descendre dans le DAG"
                                className="p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-20"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SEQUENTIAL LIST VIEW */}
          {(viewMode === 'list' || viewMode === 'split') && (
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <List className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Séquence ordonnée des étapes ({tasks.length} nœuds)</span>
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  Glisser-déposer sur les poignées pour réorganiser
                </span>
              </div>

              {tasks.map((task, idx) => {
                const roleStyle = roleColors[task.role] || roleColors.planner;
                const isWaitingHITL = task.status === 'waiting_hitl_approval';
                const isSelected = selectedTaskId === task.id;
                const isDragging = draggedTaskId === task.id;
                const isDragTarget = dragOverTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragOver={(e) => handleDragOver(e, task.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'ring-2 ring-cyan-500 dark:ring-cyan-400'
                        : ''
                    } ${
                      isWaitingHITL
                        ? 'border-amber-400 dark:border-amber-600 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40'
                    } ${
                      isDragTarget
                        ? 'ring-2 ring-indigo-500 border-indigo-500 scale-[1.01]'
                        : ''
                    } ${isDragging ? 'opacity-40 border-dashed border-cyan-400' : ''}`}
                  >
                    {/* Visual insert marker */}
                    {isDragTarget && (
                      <div
                        className={`absolute left-0 right-0 h-1 bg-indigo-500 rounded z-30 ${
                          dropPosition === 'before' ? '-top-1' : '-bottom-1'
                        }`}
                      />
                    )}

                    {/* Task Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          title="Glisser-déposer pour réordonner"
                          className="cursor-grab text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          <GripVertical className="w-4 h-4" />
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400 w-5">
                          #{idx + 1}
                        </span>
                        <span
                          className={`text-[11px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}
                        >
                          {task.role}
                        </span>
                        <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                          {task.title}
                        </h3>
                      </div>

                      {/* Status and reorder buttons */}
                      <div className="shrink-0 flex items-center gap-2 text-xs font-mono">
                        <div className="flex items-center gap-1 border border-neutral-200 dark:border-neutral-800 rounded bg-white dark:bg-neutral-900 p-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveTask(idx, idx - 1);
                            }}
                            disabled={idx === 0}
                            title="Monter"
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded disabled:opacity-20 text-neutral-500"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveTask(idx, idx + 1);
                            }}
                            disabled={idx === tasks.length - 1}
                            title="Descendre"
                            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded disabled:opacity-20 text-neutral-500"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>

                        {task.status === 'completed' && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Terminé</span>
                          </span>
                        )}
                        {task.status === 'waiting_hitl_approval' && (
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold animate-pulse">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Validation (HITL)</span>
                          </span>
                        )}
                        {task.status === 'pending' && (
                          <span className="text-neutral-400">En attente</span>
                        )}
                        {task.status === 'rejected' && (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rejeté</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2 pl-7 leading-relaxed">
                      {task.description}
                    </p>

                    {/* Tool Invocation Details */}
                    {task.toolInvocation && (
                      <div className="mt-2.5 pl-7">
                        <div className="p-2 rounded bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-mono space-y-1">
                          <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                            <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-400">
                              <Terminal className="w-3 h-3" />
                              <span>Outil : {task.toolInvocation.name}()</span>
                            </span>
                            {task.toolInvocation.isRisky && (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                                Action à risque élevé
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500 overflow-x-auto">
                            Args : {JSON.stringify(task.toolInvocation.args)}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* HITL Action Gate */}
                    {isWaitingHITL && (
                      <div className="mt-3 pl-7 pt-2 border-t border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3">
                        <div className="text-xs text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Cette action modifie des ressources. Autoriser l'agent à poursuivre ?</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectTask(task.id);
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded transition-colors"
                          >
                            Refuser
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveTask(task.id);
                            }}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors shadow-xs"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Approuver (HITL)</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Output if completed */}
                    {task.output && (
                      <div className="mt-2.5 pl-7 text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded border border-emerald-200/50 dark:border-emerald-800/40">
                        {task.output}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Node Inspector & Virtual Scratchpad */}
      <div className="w-full lg:w-2/5 flex flex-col bg-white dark:bg-neutral-950 overflow-y-auto border-t lg:border-t-0">
        {/* Node Inspector Drawer */}
        {selectedTask && (
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  Inspecteur de Nœud
                </span>
                <span
                  className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${
                    roleColors[selectedTask.role]?.bg
                  } ${roleColors[selectedTask.role]?.text} ${
                    roleColors[selectedTask.role]?.border
                  }`}
                >
                  {selectedTask.role}
                </span>
              </div>
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                title="Supprimer ce nœud du DAG"
                className="text-neutral-400 hover:text-red-500 transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mb-1">
              {selectedTask.title}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
              {selectedTask.description}
            </p>

            {/* Direct HITL Action Gate in Inspector */}
            {selectedTask.status === 'waiting_hitl_approval' && (
              <div className="p-3 mb-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
                <div className="text-xs text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse" />
                  <span>Point de contrôle HITL en attente de validation</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleRejectTask(selectedTask.id)}
                    className="flex-1 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded transition-colors"
                  >
                    Refuser l'action
                  </button>
                  <button
                    onClick={() => handleApproveTask(selectedTask.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded bg-amber-600 hover:bg-amber-500 text-white transition-colors shadow-xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Approuver</span>
                  </button>
                </div>
              </div>
            )}

            {selectedTask.toolInvocation && (
              <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono space-y-1 mb-2">
                <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300">
                  <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                    <Terminal className="w-3 h-3" />
                    <span>{selectedTask.toolInvocation.name}()</span>
                  </span>
                  {selectedTask.toolInvocation.isRisky && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold px-1.5 rounded bg-amber-500/10 border border-amber-500/20">
                      Critique
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-500 overflow-x-auto">
                  {JSON.stringify(selectedTask.toolInvocation.args, null, 2)}
                </div>
              </div>
            )}

            {selectedTask.output && (
              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/40 text-xs font-mono text-emerald-800 dark:text-emerald-300">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">
                  Résultat d'exécution :
                </span>
                {selectedTask.output}
              </div>
            )}
          </div>
        )}

        {/* Workspace Toolbar */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Mémoire de Travail Partagée (Virtual Scratchpad)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">Context Synchronisé</span>
        </div>

        {/* Scratchpad Editor */}
        <div className="p-4 flex-1 flex flex-col min-h-[220px]">
          <p className="text-xs text-neutral-500 mb-2">
            Mémoire vive partagée entre les agents (Planner, Coder, Critic) pour maintenir l'état d'avancement sans hallucination.
          </p>
          <textarea
            value={scratchpad}
            onChange={(e) => setScratchpad(e.target.value)}
            className="flex-1 w-full text-xs font-mono bg-neutral-50 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed min-h-[160px]"
          />
        </div>

        {/* Supervision & Telemetry Panel */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 space-y-2">
          <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
            <span>Télémétrie de Supervision Ingénieur</span>
            <span className="text-[10px] font-mono text-neutral-400">DAG Acyclique Validé</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-neutral-400 block text-[10px]">Tâches Finies</span>
              <span className="font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {tasks.filter((t) => t.status === 'completed').length} / {tasks.length}
              </span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-neutral-400 block text-[10px]">Points de Contrôle</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {tasks.filter((t) => t.status === 'waiting_hitl_approval').length} en attente
              </span>
            </div>
            <div className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
              <span className="text-neutral-400 block text-[10px]">Temps Total</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
                {tasks.reduce((acc, t) => acc + (t.executionTimeMs || 0), 0)} ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add New DAG Task */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Ajouter une étape au graphe DAG</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Rôle de l'Agent
                </label>
                <select
                  value={newTaskRole}
                  onChange={(e) => setNewTaskRole(e.target.value as AgentRole)}
                  className="w-full p-2 rounded-md bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="planner">Planner (Stratégie & Décomposition)</option>
                  <option value="coder">Coder (Implémentation & Refactor)</option>
                  <option value="critic">Critic (Audit de Sécurité & Non-Régression)</option>
                  <option value="executor">Executor (Déploiement & Migration)</option>
                  <option value="supervisor">Supervisor (Validation & PR GitHub)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Titre de l'étape
                </label>
                <input
                  type="text"
                  placeholder="Ex : Exécution des tests de pénétration OWASP..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2 rounded-md bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Description détaillée
                </label>
                <textarea
                  rows={2}
                  placeholder="Objectif opérationnel et contraintes..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full p-2 rounded-md bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Outil invoqué (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex : security_scanner_run, docker_compose_up..."
                  value={newTaskTool}
                  onChange={(e) => setNewTaskTool(e.target.value)}
                  className="w-full p-2 rounded-md font-mono bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
              >
                Annuler
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50 transition-colors shadow-xs"
              >
                Ajouter au DAG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
