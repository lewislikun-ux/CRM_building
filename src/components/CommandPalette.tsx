import React, { useState, useEffect } from 'react';
import {
  Search,
  Table2,
  Workflow,
  BarChart3,
  Database,
  Plus,
  Download,
  Play,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { DealRecord, ViewTab } from '../types';
import { formatCurrency, getStageConfig } from '../utils/formatters';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ViewTab) => void;
  onOpenNewRecord: () => void;
  onExportCSV: () => void;
  onRunWorkflowTest: () => void;
  deals: DealRecord[];
  onSelectDeal: (deal: DealRecord) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenNewRecord,
  onExportCSV,
  onRunWorkflowTest,
  deals,
  onSelectDeal,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'new-record',
      category: 'Actions',
      title: 'Create New Record',
      icon: Plus,
      run: () => {
        onOpenNewRecord();
        onClose();
      },
    },
    {
      id: 'export-csv',
      category: 'Actions',
      title: 'Export Pipeline Data (CSV)',
      icon: Download,
      run: () => {
        onExportCSV();
        onClose();
      },
    },
    {
      id: 'sim-workflow',
      category: 'Actions',
      title: 'Run Workflow Automation Simulation',
      icon: Play,
      run: () => {
        onSelectTab('workflow');
        onRunWorkflowTest();
        onClose();
      },
    },
    {
      id: 'tab-table',
      category: 'Navigation',
      title: 'Go to Pipeline Matrix',
      icon: Table2,
      run: () => {
        onSelectTab('table');
        onClose();
      },
    },
    {
      id: 'tab-workflow',
      category: 'Navigation',
      title: 'Go to Workflow Canvas',
      icon: Workflow,
      run: () => {
        onSelectTab('workflow');
        onClose();
      },
    },
    {
      id: 'tab-analytics',
      category: 'Navigation',
      title: 'Go to Velocity & Forecast',
      icon: BarChart3,
      run: () => {
        onSelectTab('analytics');
        onClose();
      },
    },
    {
      id: 'tab-integrations',
      category: 'Navigation',
      title: 'Go to Data Sources & Feeds',
      icon: Database,
      run: () => {
        onSelectTab('integrations');
        onClose();
      },
    },
  ];

  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase())
  );

  const matchedDeals = deals.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.company.toLowerCase().includes(query.toLowerCase()) ||
      d.id.toLowerCase().includes(query.toLowerCase())
  );

  const totalItems = filteredActions.length + matchedDeals.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (totalItems || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + totalItems) % (totalItems || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredActions.length) {
        filteredActions[selectedIndex].run();
      } else {
        const deal = matchedDeals[selectedIndex - filteredActions.length];
        if (deal) {
          onSelectDeal(deal);
          onSelectTab('table');
          onClose();
        }
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#09090b]/30 backdrop-blur-xs select-none p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white border border-[#e4e4e7] rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.04)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-[#e4e4e7]">
          <Search size={16} className="text-[#71717a] shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search deals..."
            className="w-full h-12 px-3 text-xs text-[#09090b] placeholder-[#a1a1aa] bg-transparent focus:outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] bg-[#fafafa] border border-[#e4e4e7] rounded text-[#71717a] font-mono">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
          {filteredActions.length > 0 && (
            <div className="px-2 py-1 text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
              Quick Commands
            </div>
          )}

          {filteredActions.map((action, idx) => {
            const Icon = action.icon;
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={action.id}
                onClick={action.run}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                  isSelected ? 'bg-[#eff6ff] text-[#1d4ed8]' : 'text-[#09090b] hover:bg-[#fafafa]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon size={14} className={isSelected ? 'text-[#2563eb]' : 'text-[#71717a]'} />
                  <span className="font-medium">{action.title}</span>
                </div>
                <ArrowRight size={12} className="opacity-40" />
              </button>
            );
          })}

          {matchedDeals.length > 0 && (
            <div className="px-2 py-1 pt-2 text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">
              Matching Pipeline Deals
            </div>
          )}

          {matchedDeals.map((deal, idx) => {
            const dealIndex = filteredActions.length + idx;
            const isSelected = selectedIndex === dealIndex;
            const stageConfig = getStageConfig(deal.stage);

            return (
              <button
                key={deal.id}
                onClick={() => {
                  onSelectDeal(deal);
                  onSelectTab('table');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                  isSelected ? 'bg-[#eff6ff] text-[#1d4ed8]' : 'text-[#09090b] hover:bg-[#fafafa]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="font-mono text-[11px] text-[#71717a]">{deal.id}</span>
                  <span className="font-medium truncate">{deal.name}</span>
                  <span className="text-[11px] text-[#71717a]">· {deal.company}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[11px] font-semibold">
                    {formatCurrency(deal.value)}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full border ${stageConfig.badgeBg} ${stageConfig.textColor} ${stageConfig.borderColor}`}
                  >
                    {stageConfig.label}
                  </span>
                </div>
              </button>
            );
          })}

          {totalItems === 0 && (
            <div className="py-8 text-center text-[#71717a]">
              No actions or deals match &quot;{query}&quot;
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-[#f4f4f5] bg-[#fafafa] flex items-center justify-between text-[11px] text-[#71717a]">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>Data Engine Command Mesh</span>
        </div>
      </div>
    </div>
  );
};
