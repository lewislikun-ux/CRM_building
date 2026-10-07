import { DealStage, PriorityLevel } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getStageConfig(stage: DealStage): {
  label: string;
  badgeBg: string;
  textColor: string;
  dotColor: string;
  borderColor: string;
} {
  switch (stage) {
    case 'lead':
      return {
        label: 'Lead / Cold',
        badgeBg: 'bg-[#f4f4f5]',
        textColor: 'text-[#52525b]',
        dotColor: 'bg-[#71717a]',
        borderColor: 'border-[#e4e4e7]',
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        badgeBg: 'bg-[#eff6ff]',
        textColor: 'text-[#1d4ed8]',
        dotColor: 'bg-[#2563eb]',
        borderColor: 'border-[#bfdbfe]',
      };
    case 'won':
      return {
        label: 'Won / Active',
        badgeBg: 'bg-[#ecfdf5]',
        textColor: 'text-[#047857]',
        dotColor: 'bg-[#10b981]',
        borderColor: 'border-[#a7f3d0]',
      };
    case 'blocked':
      return {
        label: 'Blocked / Alert',
        badgeBg: 'bg-[#fef2f2]',
        textColor: 'text-[#b91c1c]',
        dotColor: 'bg-[#ef4444]',
        borderColor: 'border-[#fecaca]',
      };
    case 'negotiation':
      return {
        label: 'Negotiation',
        badgeBg: 'bg-[#fffbeb]',
        textColor: 'text-[#b45309]',
        dotColor: 'bg-[#f59e0b]',
        borderColor: 'border-[#fde68a]',
      };
  }
}

export function getPriorityBadge(priority: PriorityLevel): {
  label: string;
  color: string;
} {
  switch (priority) {
    case 'high':
      return { label: 'High', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    case 'medium':
      return { label: 'Med', color: 'text-slate-700 bg-slate-100 border-slate-200' };
    case 'low':
      return { label: 'Low', color: 'text-zinc-500 bg-zinc-50 border-zinc-200' };
  }
}
