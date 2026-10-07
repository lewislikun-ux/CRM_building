import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  ChevronDown,
  MoreHorizontal,
  Trash2,
  ExternalLink,
  Filter,
  DollarSign,
  User,
  Calendar,
  Percent,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DealRecord, DealStage, PriorityLevel } from '../types';
import { formatCurrency, formatDate, getStageConfig, getPriorityBadge } from '../utils/formatters';

interface PipelineTableProps {
  deals: DealRecord[];
  selectedDealId: string | null;
  onSelectDeal: (deal: DealRecord) => void;
  onUpdateDeal: (id: string, updates: Partial<DealRecord>) => void;
  onDeleteDeal: (id: string) => void;
  selectedRowIds: Set<string>;
  onToggleSelectRow: (id: string, e: React.MouseEvent) => void;
  onToggleSelectAll: () => void;
  stageFilter: string;
  onSetStageFilter: (stage: string) => void;
}

type SortField = 'id' | 'name' | 'company' | 'stage' | 'value' | 'arr' | 'probability' | 'owner' | 'targetClose' | 'healthScore';

export const PipelineTable: React.FC<PipelineTableProps> = ({
  deals,
  selectedDealId,
  onSelectDeal,
  onUpdateDeal,
  onDeleteDeal,
  selectedRowIds,
  onToggleSelectRow,
  onToggleSelectAll,
  stageFilter,
  onSetStageFilter,
}) => {
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof DealRecord } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [activeStageDropdownId, setActiveStageDropdownId] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default descending for values
    }
  };

  const sortedDeals = [...deals].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const startInlineEdit = (deal: DealRecord, field: keyof DealRecord, currentValue: any) => {
    setEditingCell({ id: deal.id, field });
    setEditValue(String(currentValue));
  };

  const saveInlineEdit = (id: string, field: keyof DealRecord) => {
    if (!editingCell) return;
    if (field === 'value' || field === 'arr' || field === 'probability' || field === 'healthScore') {
      const num = Number(editValue.replace(/[^0-9.-]+/g, ''));
      onUpdateDeal(id, { [field]: isNaN(num) ? 0 : num });
    } else {
      onUpdateDeal(id, { [field]: editValue });
    }
    setEditingCell(null);
  };

  const stagesList: DealStage[] = ['lead', 'in_progress', 'negotiation', 'won', 'blocked'];

  const allSelected = deals.length > 0 && selectedRowIds.size === deals.length;
  const isIndeterminate = selectedRowIds.size > 0 && selectedRowIds.size < deals.length;

  const totalValue = deals.reduce((acc, d) => acc + d.value, 0);
  const totalARR = deals.reduce((acc, d) => acc + d.arr, 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-white">
      {/* Subheader Filter Bar & Summary Strip */}
      <div className="h-10 px-4 border-b border-[#e4e4e7] flex items-center justify-between text-xs bg-[#fafafa] shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider hidden sm:inline mr-1">
            Stage:
          </span>
          <button
            onClick={() => onSetStageFilter('all')}
            className={`px-2.5 py-1 rounded-[5px] text-xs font-medium transition-colors ${
              stageFilter === 'all'
                ? 'bg-white text-[#09090b] shadow-xs border border-[#e4e4e7]'
                : 'text-[#71717a] hover:text-[#09090b]'
            }`}
          >
            All Stages ({deals.length})
          </button>
          {stagesList.map((stg) => {
            const config = getStageConfig(stg);
            const count = deals.filter((d) => d.stage === stg).length;
            return (
              <button
                key={stg}
                onClick={() => onSetStageFilter(stg)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs font-medium transition-colors ${
                  stageFilter === stg
                    ? 'bg-white text-[#09090b] shadow-xs border border-[#e4e4e7]'
                    : 'text-[#71717a] hover:text-[#09090b]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
                <span>{config.label}</span>
                <span className="font-mono text-[10px] text-[#71717a]">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#52525b] shrink-0 pl-2">
          <div>
            <span className="text-[11px] text-[#71717a] font-sans mr-1">Pipeline:</span>
            <span className="font-semibold text-[#09090b] tabular-nums">{formatCurrency(totalValue)}</span>
          </div>
          <div className="hidden lg:block">
            <span className="text-[11px] text-[#71717a] font-sans mr-1">ARR:</span>
            <span className="font-semibold text-[#09090b] tabular-nums">{formatCurrency(totalARR)}</span>
          </div>
        </div>
      </div>

      {/* Batch Action Toolbar when items selected */}
      {selectedRowIds.size > 0 && (
        <div className="h-9 px-4 bg-[#eff6ff] border-b border-[#bfdbfe] flex items-center justify-between text-xs text-[#1d4ed8] shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-medium">
              {selectedRowIds.size} {selectedRowIds.size === 1 ? 'deal' : 'deals'} selected
            </span>
            <div className="h-3 w-px bg-blue-300" />
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#1d4ed8]/80">Set Stage:</span>
              {stagesList.map((stg) => (
                <button
                  key={stg}
                  onClick={() => {
                    selectedRowIds.forEach((id) => onUpdateDeal(id, { stage: stg }));
                  }}
                  className="px-2 py-0.5 rounded text-[11px] bg-white border border-blue-200 text-[#1d4ed8] hover:bg-blue-50 font-medium"
                >
                  {getStageConfig(stg).label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm(`Delete ${selectedRowIds.size} selected records?`)) {
                  selectedRowIds.forEach((id) => onDeleteDeal(id));
                }
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-medium"
            >
              <Trash2 size={12} />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse select-text">
          {/* Header 32px height */}
          <thead className="sticky top-0 bg-[#fafafa] z-10 border-b border-[#e4e4e7] select-none text-[11px] font-semibold text-[#71717a] uppercase tracking-wider">
            <tr className="h-8">
              <th className="w-9 px-3 text-center border-r border-[#f4f4f5]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={onToggleSelectAll}
                  className="rounded border-[#c4c4c8] text-[#2563eb] focus:ring-[#2563eb] cursor-pointer"
                />
              </th>
              <th
                onClick={() => handleSort('id')}
                className="w-24 px-3 cursor-pointer hover:text-[#09090b] border-r border-[#f4f4f5]"
              >
                <div className="flex items-center gap-1">
                  <span>Record ID</span>
                  {sortField === 'id' && (sortAsc ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('name')}
                className="min-w-[220px] px-3 cursor-pointer hover:text-[#09090b] border-r border-[#f4f4f5]"
              >
                <div className="flex items-center gap-1">
                  <span>Deal / Target</span>
                  {sortField === 'name' && (sortAsc ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('stage')}
                className="w-36 px-3 cursor-pointer hover:text-[#09090b] border-r border-[#f4f4f5]"
              >
                <div className="flex items-center gap-1">
                  <span>Pipeline Stage</span>
                  {sortField === 'stage' && (sortAsc ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('value')}
                className="w-28 px-3 text-right cursor-pointer hover:text-[#09090b] border-r border-[#f4f4f5]"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Deal Value</span>
                  {sortField === 'value' && (sortAsc ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('arr')}
                className="w-24 px-3 text-right cursor-pointer hover:text-[#09090b] border-r border-[#f4f4f5] hidden md:table-cell"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>ARR</span>
                  {sortField === 'arr' && (sortAsc ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('probability')}
                className="w-20 px-3 text-right cursor-pointer hover:text-[#09090b] border-r border-[#f4f4f5] hidden lg:table-cell"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Win %</span>
                  {sortField === 'probability' && (sortAsc ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('owner')}
                className="w-32 px-3 cursor-pointer hover:text-[#09090b] border-r border-[#f4f4f5] hidden sm:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Owner</span>
                  {sortField === 'owner' && (sortAsc ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('targetClose')}
                className="w-28 px-3 cursor-pointer hover:text-[#09090b] border-r border-[#f4f4f5] hidden xl:table-cell"
              >
                <div className="flex items-center gap-1">
                  <span>Close Date</span>
                  {sortField === 'targetClose' && (sortAsc ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                </div>
              </th>
              <th
                onClick={() => handleSort('healthScore')}
                className="w-20 px-3 text-center cursor-pointer hover:text-[#09090b] hidden lg:table-cell"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Health</span>
                  {sortField === 'healthScore' && (sortAsc ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                </div>
              </th>
              <th className="w-10 px-2 text-center"></th>
            </tr>
          </thead>

          {/* Rows: 36px default height */}
          <tbody className="divide-y divide-[#f4f4f5] text-xs">
            {sortedDeals.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-[#71717a]">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-medium text-[#09090b]">No matching records found</p>
                    <p className="text-[11px]">Try adjusting your search criteria or filter stage above.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedDeals.map((deal) => {
                const isSelected = selectedRowIds.has(deal.id);
                const isCurrentActive = selectedDealId === deal.id;
                const stageConfig = getStageConfig(deal.stage);

                return (
                  <tr
                    key={deal.id}
                    onClick={() => onSelectDeal(deal)}
                    className={`h-9 transition-colors group cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#eff6ff] hover:bg-[#e4efff]'
                        : isCurrentActive
                        ? 'bg-[#f4f4f5] hover:bg-[#eeeeee]'
                        : 'hover:bg-[#fafafa]'
                    }`}
                  >
                    {/* Multi-selection left border accent */}
                    {isSelected && (
                      <td className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#2563eb]" />
                    )}

                    {/* Checkbox */}
                    <td
                      onClick={(e) => onToggleSelectRow(deal.id, e)}
                      className="px-3 text-center border-r border-[#f4f4f5]/60"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-[#c4c4c8] text-[#2563eb] focus:ring-[#2563eb] cursor-pointer"
                      />
                    </td>

                    {/* ID */}
                    <td className="px-3 font-mono text-[11px] text-[#52525b] border-r border-[#f4f4f5]/60 whitespace-nowrap">
                      {deal.id}
                    </td>

                    {/* Deal Name & Company */}
                    <td className="px-3 border-r border-[#f4f4f5]/60">
                      {editingCell?.id === deal.id && editingCell?.field === 'name' ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(deal.id, 'name')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveInlineEdit(deal.id, 'name');
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="w-full px-1.5 py-0.5 bg-white border border-[#2563eb] rounded text-xs focus:outline-none"
                        />
                      ) : (
                        <div
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            startInlineEdit(deal, 'name', deal.name);
                          }}
                          className="flex flex-col min-w-0"
                          title="Double-click to edit name"
                        >
                          <span className="font-medium text-[#09090b] truncate">{deal.name}</span>
                          <span className="text-[11px] text-[#71717a] truncate font-normal">
                            {deal.company}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Stage Pill */}
                    <td
                      className="px-3 border-r border-[#f4f4f5]/60 relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setActiveStageDropdownId(
                            activeStageDropdownId === deal.id ? null : deal.id
                          )
                        }
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${stageConfig.badgeBg} ${stageConfig.textColor} ${stageConfig.borderColor}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${stageConfig.dotColor}`} />
                        <span>{stageConfig.label}</span>
                        <ChevronDown size={10} className="opacity-60" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeStageDropdownId === deal.id && (
                        <div className="absolute left-3 top-8 z-30 w-40 bg-white border border-[#e4e4e7] rounded-md shadow-lg py-1">
                          {stagesList.map((stg) => {
                            const cfg = getStageConfig(stg);
                            return (
                              <button
                                key={stg}
                                onClick={() => {
                                  onUpdateDeal(deal.id, { stage: stg });
                                  setActiveStageDropdownId(null);
                                }}
                                className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left hover:bg-[#f4f4f5]"
                              >
                                <span className="flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                                  <span className="text-[#09090b] font-medium">{cfg.label}</span>
                                </span>
                                {deal.stage === stg && <Check size={12} className="text-[#2563eb]" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </td>

                    {/* Value */}
                    <td
                      className="px-3 text-right font-mono tabular-nums text-[#09090b] font-medium border-r border-[#f4f4f5]/60"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        startInlineEdit(deal, 'value', deal.value);
                      }}
                      title="Double-click to edit value"
                    >
                      {editingCell?.id === deal.id && editingCell?.field === 'value' ? (
                        <input
                          autoFocus
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveInlineEdit(deal.id, 'value')}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveInlineEdit(deal.id, 'value');
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                          className="w-24 px-1 py-0.5 text-right bg-white border border-[#2563eb] rounded text-xs focus:outline-none"
                        />
                      ) : (
                        formatCurrency(deal.value)
                      )}
                    </td>

                    {/* ARR */}
                    <td className="px-3 text-right font-mono tabular-nums text-[#52525b] border-r border-[#f4f4f5]/60 hidden md:table-cell">
                      {formatCurrency(deal.arr)}
                    </td>

                    {/* Probability */}
                    <td className="px-3 text-right font-mono tabular-nums text-[#52525b] border-r border-[#f4f4f5]/60 hidden lg:table-cell">
                      {deal.probability}%
                    </td>

                    {/* Owner */}
                    <td className="px-3 border-r border-[#f4f4f5]/60 hidden sm:table-cell">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-5 h-5 rounded-full bg-[#1e293b] text-white flex items-center justify-center text-[9px] font-semibold shrink-0">
                          {deal.ownerAvatar || 'AC'}
                        </div>
                        <span className="text-[#52525b] truncate">{deal.owner}</span>
                      </div>
                    </td>

                    {/* Close Date */}
                    <td className="px-3 font-mono text-[11px] tabular-nums text-[#52525b] border-r border-[#f4f4f5]/60 hidden xl:table-cell">
                      {formatDate(deal.targetClose)}
                    </td>

                    {/* Health Score */}
                    <td className="px-3 text-center hidden lg:table-cell">
                      <span
                        className={`inline-block font-mono text-[11px] font-medium tabular-nums ${
                          deal.healthScore >= 80
                            ? 'text-emerald-700'
                            : deal.healthScore >= 60
                            ? 'text-amber-700'
                            : 'text-red-600'
                        }`}
                      >
                        {deal.healthScore}%
                      </span>
                    </td>

                    {/* Row Action Trigger */}
                    <td className="px-2 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectDeal(deal)}
                        className="p-1 rounded text-[#71717a] hover:text-[#09090b] hover:bg-[#e4e4e7] transition-colors"
                        title="Inspect Record"
                      >
                        <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
