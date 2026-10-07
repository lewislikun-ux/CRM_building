import React, { useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Calendar,
  Clock,
  Send,
  Sparkles,
  ChevronDown,
  Trash2,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Zap,
} from 'lucide-react';
import { DealRecord, DealStage, PriorityLevel, TimelineEvent } from '../types';
import { formatCurrency, formatDate, getStageConfig, getPriorityBadge } from '../utils/formatters';

interface RecordInspectorProps {
  deal: DealRecord | null;
  onClose: () => void;
  onUpdateDeal: (id: string, updates: Partial<DealRecord>) => void;
  onDeleteDeal: (id: string) => void;
}

export const RecordInspector: React.FC<RecordInspectorProps> = ({
  deal,
  onClose,
  onUpdateDeal,
  onDeleteDeal,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'details'>('timeline');
  const [newNoteText, setNewNoteText] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  if (!deal) return null;

  const stageConfig = getStageConfig(deal.stage);
  const priorityConfig = getPriorityBadge(deal.priority);
  const stagesList: DealStage[] = ['lead', 'in_progress', 'negotiation', 'won', 'blocked'];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsSubmittingNote(true);
    const newEvent: TimelineEvent = {
      id: `t-${Date.now()}`,
      type: 'note',
      title: 'Update Logged by Alex Chen',
      description: newNoteText.trim(),
      author: 'Alex Chen',
      timestamp: 'Just now',
    };

    const updatedTimeline = [newEvent, ...(deal.timeline || [])];
    onUpdateDeal(deal.id, { timeline: updatedTimeline });
    setNewNoteText('');
    setIsSubmittingNote(false);
  };

  const getTimelineIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'stage_change':
        return <Zap size={12} className="text-[#2563eb]" />;
      case 'meeting':
        return <Calendar size={12} className="text-purple-600" />;
      case 'email':
        return <Mail size={12} className="text-amber-600" />;
      case 'contract':
        return <CheckCircle2 size={12} className="text-emerald-600" />;
      case 'system_alert':
        return <AlertCircle size={12} className="text-red-600" />;
      default:
        return <FileText size={12} className="text-[#52525b]" />;
    }
  };

  return (
    <aside className="w-[420px] bg-white border-l border-[#e4e4e7] flex flex-col shrink-0 h-full z-20 shadow-[-4px_0_12px_rgba(0,0,0,0.03)] select-text">
      {/* Top Header */}
      <div className="h-14 px-4 border-b border-[#e4e4e7] flex items-center justify-between shrink-0 bg-[#fafafa]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[#52525b] bg-[#f4f4f5] px-2 py-0.5 rounded border border-[#e4e4e7]">
            {deal.id}
          </span>
          <span className="text-[11px] text-[#71717a]">·</span>
          <span className="text-xs text-[#71717a] truncate max-w-[170px]">{deal.company}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (confirm(`Delete record ${deal.id} (${deal.name})?`)) {
                onDeleteDeal(deal.id);
                onClose();
              }
            }}
            title="Delete Record"
            className="p-1 rounded text-[#71717a] hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onClose}
            title="Close Inspector"
            className="p-1 rounded text-[#71717a] hover:text-[#09090b] hover:bg-[#e4e4e7] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Title & Stage Row */}
      <div className="p-4 border-b border-[#e4e4e7] space-y-3 bg-white">
        <div>
          <h2 className="text-sm font-semibold text-[#09090b] leading-snug">
            {deal.name}
          </h2>
          <p className="text-xs text-[#71717a] mt-0.5">{deal.company} · {deal.contactTitle}</p>
        </div>

        {/* Quick Stage Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717a]">
            Stage:
          </span>
          <select
            value={deal.stage}
            onChange={(e) => onUpdateDeal(deal.id, { stage: e.target.value as DealStage })}
            className={`text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 ${stageConfig.badgeBg} ${stageConfig.textColor} ${stageConfig.borderColor}`}
          >
            {stagesList.map((stg) => (
              <option key={stg} value={stg}>
                {getStageConfig(stg).label}
              </option>
            ))}
          </select>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#f4f4f5]">
          <div className="bg-[#fafafa] border border-[#e4e4e7] rounded-md p-2">
            <span className="text-[10px] uppercase font-semibold text-[#71717a] tracking-wider block">
              Value
            </span>
            <span className="font-mono text-xs font-semibold text-[#09090b] tabular-nums mt-0.5 block truncate">
              {formatCurrency(deal.value)}
            </span>
          </div>

          <div className="bg-[#fafafa] border border-[#e4e4e7] rounded-md p-2">
            <span className="text-[10px] uppercase font-semibold text-[#71717a] tracking-wider block">
              ARR
            </span>
            <span className="font-mono text-xs font-semibold text-[#09090b] tabular-nums mt-0.5 block truncate">
              {formatCurrency(deal.arr)}
            </span>
          </div>

          <div className="bg-[#fafafa] border border-[#e4e4e7] rounded-md p-2">
            <span className="text-[10px] uppercase font-semibold text-[#71717a] tracking-wider block">
              Win %
            </span>
            <span className="font-mono text-xs font-semibold text-[#09090b] tabular-nums mt-0.5 block">
              {deal.probability}%
            </span>
          </div>

          <div className="bg-[#fafafa] border border-[#e4e4e7] rounded-md p-2">
            <span className="text-[10px] uppercase font-semibold text-[#71717a] tracking-wider block">
              Health
            </span>
            <span
              className={`font-mono text-xs font-semibold tabular-nums mt-0.5 block ${
                deal.healthScore >= 80
                  ? 'text-emerald-700'
                  : deal.healthScore >= 60
                  ? 'text-amber-700'
                  : 'text-red-600'
              }`}
            >
              {deal.healthScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e4e4e7] bg-[#fafafa] px-4 text-xs font-medium shrink-0">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'timeline'
              ? 'border-[#2563eb] text-[#2563eb] font-semibold bg-white'
              : 'border-transparent text-[#71717a] hover:text-[#09090b]'
          }`}
        >
          Activity Timeline ({deal.timeline?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('details')}
          className={`py-2 px-3 border-b-2 transition-colors ${
            activeTab === 'details'
              ? 'border-[#2563eb] text-[#2563eb] font-semibold bg-white'
              : 'border-transparent text-[#71717a] hover:text-[#09090b]'
          }`}
        >
          Properties & Contact
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'timeline' ? (
          <div>
            {/* Quick Add Note Form */}
            <form onSubmit={handleAddNote} className="mb-5">
              <div className="border border-[#e4e4e7] rounded-md p-2 bg-white focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/10 transition-all">
                <textarea
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Log activity, executive note, or meeting follow-up..."
                  rows={2}
                  className="w-full text-xs text-[#09090b] placeholder-[#a1a1aa] bg-transparent resize-none focus:outline-none"
                />
                <div className="flex items-center justify-between pt-1.5 border-t border-[#f4f4f5]">
                  <span className="text-[10px] text-[#71717a]">Press enter or click post</span>
                  <button
                    type="submit"
                    disabled={!newNoteText.trim() || isSubmittingNote}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#2563eb] text-white text-[11px] font-medium rounded hover:bg-[#1d4ed8] disabled:opacity-40 transition-colors"
                  >
                    <Send size={11} />
                    <span>Post Note</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Timeline Stream with 1px continuous line and 24px circular event nodes */}
            <div className="relative pl-6 space-y-5">
              {/* 1px continuous vertical line in #e4e4e7 */}
              <div className="absolute left-3 top-2 bottom-2 w-px bg-[#e4e4e7]" />

              {deal.timeline && deal.timeline.length > 0 ? (
                deal.timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    {/* 24px circular event node seated over the line with white border mask */}
                    <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-white border border-[#e4e4e7] flex items-center justify-center shadow-xs">
                      {getTimelineIcon(event.type)}
                    </div>

                    <div className="pl-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-[#09090b]">
                          {event.title}
                        </span>
                        <span className="text-[11px] font-mono text-[#71717a] tabular-nums">
                          {event.timestamp}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-xs text-[#52525b] mt-1 bg-[#fafafa] p-2 rounded border border-[#f4f4f5] leading-relaxed">
                          {event.description}
                        </p>
                      )}

                      <span className="text-[10px] text-[#a1a1aa] block mt-1">
                        By {event.author}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#71717a] py-6 text-center">
                  No activity logged yet. Add your first note above.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Properties & Contact Tab */
          <div className="space-y-4 text-xs">
            <div className="space-y-3 bg-[#fafafa] p-3 rounded-md border border-[#e4e4e7]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a] block">
                Primary Contact
              </span>
              <div className="flex items-center gap-2">
                <User size={14} className="text-[#71717a]" />
                <span className="font-medium text-[#09090b]">{deal.contactName}</span>
                <span className="text-[#71717a]">({deal.contactTitle})</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#71717a]" />
                <a
                  href={`mailto:${deal.contactEmail}`}
                  className="text-[#2563eb] hover:underline"
                >
                  {deal.contactEmail}
                </a>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a] block">
                Record Details
              </span>

              <div className="flex items-center justify-between py-1.5 border-b border-[#f4f4f5]">
                <span className="text-[#71717a]">Deal Owner:</span>
                <span className="font-medium text-[#09090b]">{deal.owner}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#f4f4f5]">
                <span className="text-[#71717a]">Priority:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium border ${priorityConfig.color}`}
                >
                  {priorityConfig.label}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#f4f4f5]">
                <span className="text-[#71717a]">Target Close:</span>
                <span className="font-mono text-[#09090b] tabular-nums">
                  {formatDate(deal.targetClose)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#f4f4f5]">
                <span className="text-[#71717a]">Created On:</span>
                <span className="font-mono text-[#09090b] tabular-nums">
                  {formatDate(deal.createdDate)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-[#f4f4f5]">
                <span className="text-[#71717a]">Source:</span>
                <span className="text-[#09090b] font-medium">{deal.source}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="pt-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a] block mb-2">
                Pipeline Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {deal.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-[#f4f4f5] border border-[#e4e4e7] text-[11px] text-[#52525b]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
