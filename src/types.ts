export type DealStage = 'lead' | 'in_progress' | 'negotiation' | 'won' | 'blocked';

export type PriorityLevel = 'high' | 'medium' | 'low';

export interface TimelineEvent {
  id: string;
  type: 'note' | 'stage_change' | 'meeting' | 'email' | 'system_alert' | 'contract';
  title: string;
  description?: string;
  author: string;
  timestamp: string;
}

export interface DealRecord {
  id: string; // e.g. "REC-8492"
  name: string;
  company: string;
  stage: DealStage;
  value: number; // in USD
  arr: number; // recurring annual
  probability: number; // percentage 0-100
  owner: string;
  ownerAvatar?: string;
  ownerEmail: string;
  contactName: string;
  contactEmail: string;
  contactTitle: string;
  priority: PriorityLevel;
  healthScore: number; // 0-100
  targetClose: string; // YYYY-MM-DD
  createdDate: string;
  source: string;
  tags: string[];
  timeline: TimelineEvent[];
}

export type ViewTab = 'table' | 'workflow' | 'analytics' | 'integrations';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'webhook' | 'notification';
  title: string;
  description: string;
  status: 'active' | 'idle' | 'running' | 'completed' | 'error';
  category: string;
  x: number;
  y: number;
  config: Record<string, string | number | boolean>;
}

export interface WorkflowEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  animated?: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  iconType: string;
  status: 'connected' | 'syncing' | 'paused' | 'error';
  lastSync: string;
  recordsSynced: number;
  endpoint: string;
  rateLimit: string;
}
