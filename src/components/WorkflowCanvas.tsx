import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Plus,
  Zap,
  Filter,
  CheckCircle,
  Bell,
  Globe,
  Sliders,
  Trash2,
  Settings,
  Sparkles,
  ArrowRight,
  Maximize2,
  FileCode,
} from 'lucide-react';
import { WorkflowNode, WorkflowEdge } from '../types';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onUpdateNodes: (nodes: WorkflowNode[]) => void;
  onUpdateEdges: (edges: WorkflowEdge[]) => void;
  isSimulating: boolean;
  onRunSimulation: () => void;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  onUpdateNodes,
  onUpdateEdges,
  isSimulating,
  onRunSimulation,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dragging logic
  const handleMouseDownNode = (e: React.MouseEvent, node: WorkflowNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(20, Math.min(2200, e.clientX - canvasRect.left - dragOffset.x));
    const newY = Math.max(20, Math.min(1600, e.clientY - canvasRect.top - dragOffset.y));

    const updated = nodes.map((n) =>
      n.id === draggingNodeId ? { ...n, x: Math.round(newX), y: Math.round(newY) } : n
    );
    onUpdateNodes(updated);
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Node type styling helpers
  const getNodeTypeMeta = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'trigger':
        return {
          icon: Zap,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
          badge: 'TRIGGER',
        };
      case 'condition':
        return {
          icon: Filter,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
          badge: 'FILTER / RULE',
        };
      case 'webhook':
        return {
          icon: Globe,
          color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
          badge: 'WEBHOOK',
        };
      case 'notification':
        return {
          icon: Bell,
          color: 'text-rose-600 bg-rose-50 border-rose-200',
          badge: 'BROADCAST',
        };
      case 'action':
      default:
        return {
          icon: CheckCircle,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
          badge: 'ACTION',
        };
    }
  };

  // Simulation runner effect
  useEffect(() => {
    if (!isSimulating) return;

    setExecutionLogs(['[00:00.02] Initializing event dispatcher on workflow canvas...']);
    const stepTimers: NodeJS.Timeout[] = [];

    nodes.forEach((node, idx) => {
      const timer = setTimeout(() => {
        setExecutionLogs((prev) => [
          ...prev,
          `[+${((idx + 1) * 0.45).toFixed(2)}s] Executing node: "${node.title}" [${node.category}]`,
        ]);
      }, (idx + 1) * 450);
      stepTimers.push(timer);
    });

    const completionTimer = setTimeout(() => {
      setExecutionLogs((prev) => [
        ...prev,
        '✓ Workflow simulation completed successfully. 6 events dispatched.',
      ]);
    }, (nodes.length + 1) * 450);
    stepTimers.push(completionTimer);

    return () => {
      stepTimers.forEach(clearTimeout);
    };
  }, [isSimulating, nodes]);

  // Compute curved cubic-bezier SVG lines
  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 120;

  const getPortCoordinates = (nodeId: string, isSource: boolean) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    if (isSource) {
      // Right port
      return { x: node.x + NODE_WIDTH, y: node.y + NODE_HEIGHT / 2 };
    } else {
      // Left port
      return { x: node.x, y: node.y + NODE_HEIGHT / 2 };
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  const handleAddNode = (type: WorkflowNode['type']) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      title: type === 'trigger' ? 'Custom Webhook Event' : type === 'condition' ? 'Custom Branch Filter' : 'Automated Action Step',
      description: 'Configured automated processor step on pipeline event trigger.',
      status: 'idle',
      category: type.toUpperCase(),
      x: 350 + Math.random() * 200,
      y: 200 + Math.random() * 150,
      config: { enabled: true, timeoutMs: 5000 },
    };

    onUpdateNodes([...nodes, newNode]);
    if (selectedNodeId) {
      // automatically link
      const newEdge: WorkflowEdge = {
        id: `edge-${selectedNodeId}-${newNode.id}`,
        fromNodeId: selectedNodeId,
        toNodeId: newNode.id,
        animated: true,
      };
      onUpdateEdges([...edges, newEdge]);
    }
    setShowAddModal(false);
  };

  const handleDeleteNode = (id: string) => {
    onUpdateNodes(nodes.filter((n) => n.id !== id));
    onUpdateEdges(edges.filter((e) => e.fromNodeId !== id && e.toNodeId !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  };

  return (
    <div
      className="flex-1 relative overflow-auto bg-[#fafafa] canvas-grid-pattern select-none"
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ minHeight: '100%', minWidth: '100%' }}
    >
      {/* Floating Canvas Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-xs border border-[#e4e4e7] p-1.5 rounded-lg shadow-sm">
        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            isSimulating
              ? 'bg-blue-50 text-[#2563eb] border border-blue-200'
              : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
          }`}
        >
          <Play size={12} className={isSimulating ? 'animate-spin' : ''} />
          <span>{isSimulating ? 'Simulating Events...' : 'Run Simulation'}</span>
        </button>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#09090b] bg-white border border-[#e4e4e7] hover:bg-[#f4f4f5] transition-colors"
        >
          <Plus size={13} />
          <span>Add Node</span>
        </button>

        <div className="h-4 w-px bg-[#e4e4e7]" />

        <div className="px-2 text-[11px] text-[#71717a] font-mono">
          {nodes.length} nodes · {edges.length} connections
        </div>
      </div>

      {/* SVG Connections Layer */}
      <svg
        className="absolute inset-0 pointer-events-none z-10"
        style={{ width: '2400px', height: '1600px' }}
      >
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {edges.map((edge) => {
          const start = getPortCoordinates(edge.fromNodeId, true);
          const end = getPortCoordinates(edge.toNodeId, false);

          if (start.x === 0 || end.x === 0) return null;

          // Cubic Bezier curve
          const deltaX = Math.abs(end.x - start.x) * 0.5;
          const cp1x = start.x + deltaX;
          const cp1y = start.y;
          const cp2x = end.x - deltaX;
          const cp2y = end.y;

          const pathD = `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;

          return (
            <g key={edge.id}>
              {/* Glow / Background line */}
              <path
                d={pathD}
                fill="none"
                stroke={isSimulating ? '#bfdbfe' : '#e4e4e7'}
                strokeWidth={isSimulating ? 5 : 2}
                strokeLinecap="round"
              />
              {/* Main Line */}
              <path
                d={pathD}
                fill="none"
                stroke={isSimulating ? '#2563eb' : '#a1a1aa'}
                strokeWidth={2}
                strokeDasharray={isSimulating ? '6 6' : undefined}
                className={isSimulating ? 'animate-flow-dash' : ''}
              />
              {/* Optional Label */}
              {edge.label && (
                <text
                  x={(start.x + end.x) / 2}
                  y={(start.y + end.y) / 2 - 8}
                  fill="#71717a"
                  fontSize="10"
                  fontFamily="Inter"
                  textAnchor="middle"
                  className="bg-white px-1"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Canvas Nodes Layer */}
      <div style={{ width: '2400px', height: '1600px', position: 'relative' }}>
        {nodes.map((node) => {
          const meta = getNodeTypeMeta(node.type);
          const Icon = meta.icon;
          const isSelected = selectedNodeId === node.id;
          const isDragging = draggingNodeId === node.id;

          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleMouseDownNode(e, node)}
              style={{
                transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
                width: `${NODE_WIDTH}px`,
              }}
              className={`absolute z-10 bg-white rounded-lg border transition-shadow cursor-grab select-none ${
                isDragging ? 'cursor-grabbing shadow-xl' : 'shadow-xs'
              } ${
                isSelected
                  ? 'border-[#2563eb] ring-2 ring-[#2563eb]/15 shadow-md'
                  : 'border-[#e4e4e7] hover:border-[#a1a1aa]'
              }`}
            >
              {/* Input Connection Port (Left) */}
              <div
                title="Input Port"
                className={`absolute -left-[5px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 bg-white transition-colors ${
                  isSelected || isSimulating ? 'border-[#2563eb] bg-[#2563eb]' : 'border-[#71717a]'
                }`}
              />

              {/* Node Header */}
              <div className="p-3 pb-2 flex items-center justify-between border-b border-[#f4f4f5]">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center border ${meta.color}`}
                  >
                    <Icon size={13} />
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#71717a]">
                    {node.category}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSimulating
                        ? 'bg-blue-500 animate-pulse'
                        : node.status === 'active'
                        ? 'bg-emerald-500'
                        : 'bg-zinc-400'
                    }`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNode(node.id);
                    }}
                    title="Delete Node"
                    className="p-1 rounded text-[#a1a1aa] hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Node Body */}
              <div className="p-3 pt-2.5">
                <h4 className="text-xs font-semibold text-[#09090b] mb-1">
                  {node.title}
                </h4>
                <p className="text-[11px] text-[#71717a] line-clamp-2 leading-relaxed">
                  {node.description}
                </p>
              </div>

              {/* Output Connection Port (Right) */}
              <div
                title="Output Port"
                className={`absolute -right-[5px] top-1/2 -translate-y-1/2 w-[10px] h-[10px] rounded-full border-2 bg-white transition-colors ${
                  isSelected || isSimulating ? 'border-[#2563eb] bg-[#2563eb]' : 'border-[#71717a]'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Simulation Console Drawer at Bottom */}
      {executionLogs.length > 0 && (
        <div className="fixed bottom-4 left-64 right-12 max-w-3xl z-30 bg-[#09090b] text-white rounded-lg p-3 shadow-2xl border border-zinc-800 font-mono text-[11px]">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-400">
            <div className="flex items-center gap-2">
              <Sparkles size={13} className="text-blue-400" />
              <span className="font-semibold text-zinc-200">Execution Telemetry Dispatch</span>
            </div>
            <button
              onClick={() => setExecutionLogs([])}
              className="text-zinc-500 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="max-h-28 overflow-y-auto pt-2 space-y-1 text-zinc-300">
            {executionLogs.map((log, idx) => (
              <div key={idx} className="leading-snug">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Node Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b]/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-[#e4e4e7] p-5 w-96 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#f4f4f5] pb-3">
              <h3 className="text-sm font-semibold text-[#09090b]">Add Automation Node</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#71717a] hover:text-[#09090b]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#71717a]">
              Select a node archetype to attach to the pipeline event graph:
            </p>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleAddNode('trigger')}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-[#e4e4e7] hover:border-[#2563eb] hover:bg-blue-50/40 text-left transition-all"
              >
                <div className="w-8 h-8 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#09090b]">Event Trigger</div>
                  <div className="text-[11px] text-[#71717a]">Fires on deal updates, thresholds, or webhooks</div>
                </div>
              </button>

              <button
                onClick={() => handleAddNode('condition')}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-[#e4e4e7] hover:border-[#2563eb] hover:bg-blue-50/40 text-left transition-all"
              >
                <div className="w-8 h-8 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Filter size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#09090b]">Condition / Filter</div>
                  <div className="text-[11px] text-[#71717a]">Branch logic based on ARR, probability, or tier</div>
                </div>
              </button>

              <button
                onClick={() => handleAddNode('action')}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-[#e4e4e7] hover:border-[#2563eb] hover:bg-blue-50/40 text-left transition-all"
              >
                <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#09090b]">Automated Action</div>
                  <div className="text-[11px] text-[#71717a]">Assign accounts, update stages, run enrichment</div>
                </div>
              </button>

              <button
                onClick={() => handleAddNode('notification')}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-[#e4e4e7] hover:border-[#2563eb] hover:bg-blue-50/40 text-left transition-all"
              >
                <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Bell size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#09090b]">Alert & Dispatch</div>
                  <div className="text-[11px] text-[#71717a]">Notify Slack channels, send executive summaries</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
