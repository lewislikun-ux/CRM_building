import React from 'react';
import {
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  Workflow,
  Sparkles,
} from 'lucide-react';
import { ViewTab } from '../types';

interface TopHeaderProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onExportCSV: () => void;
  onOpenNewRecord: () => void;
  onRunWorkflowTest?: () => void;
  isTestingWorkflow?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  onExportCSV,
  onOpenNewRecord,
  onRunWorkflowTest,
  isTestingWorkflow,
}) => {
  const getBreadcrumbTitle = () => {
    switch (currentTab) {
      case 'table':
        return 'Pipeline Matrix';
      case 'workflow':
        return 'Workflow Automation Builder';
      case 'analytics':
        return 'Velocity & Revenue Forecast';
      case 'integrations':
        return 'Data Sources & Ingestion Hub';
    }
  };

  return (
    <header className="h-14 bg-white border-b border-[#e4e4e7] px-4 flex items-center justify-between gap-4 shrink-0 z-10">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs min-w-0">
        <span className="text-[#71717a] font-normal hover:text-[#09090b] cursor-pointer">
          Workspace
        </span>
        <span className="text-[#c4c4c8]">/</span>
        <span className="text-[#71717a] font-normal hover:text-[#09090b] cursor-pointer hidden sm:inline">
          Apex Engine
        </span>
        <span className="text-[#c4c4c8] hidden sm:inline">/</span>
        <span className="text-[#09090b] font-medium truncate">
          {getBreadcrumbTitle()}
        </span>
      </div>

      {/* Middle: Fast Search Input */}
      <div className="flex-1 max-w-md relative hidden md:block">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#71717a]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search deals, companies, contacts, owners (Press '/' or ⌘K)..."
            className="w-full h-[34px] pl-8 pr-16 text-xs bg-white border border-[#e4e4e7] rounded-md text-[#09090b] placeholder-[#a1a1aa] focus:outline-none focus:border-[#2563eb] focus:ring-3 focus:ring-[#2563eb]/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#71717a] hover:text-[#09090b]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {currentTab === 'workflow' && onRunWorkflowTest && (
          <button
            onClick={onRunWorkflowTest}
            disabled={isTestingWorkflow}
            className={`flex items-center gap-1.5 h-[32px] px-3 rounded-md text-xs font-medium border border-[#e4e4e7] transition-all ${
              isTestingWorkflow
                ? 'bg-blue-50 text-[#2563eb] border-blue-200'
                : 'bg-white text-[#09090b] hover:bg-[#f4f4f5]'
            }`}
            title="Simulate Event Execution Flow"
          >
            <Sparkles
              size={13}
              className={isTestingWorkflow ? 'animate-spin text-[#2563eb]' : 'text-amber-500'}
            />
            <span className="hidden sm:inline">
              {isTestingWorkflow ? 'Testing Graph...' : 'Test Flow'}
            </span>
          </button>
        )}

        <button
          onClick={onExportCSV}
          className="flex items-center gap-1.5 h-[32px] px-2.5 rounded-md text-xs font-medium text-[#09090b] bg-white border border-[#e4e4e7] hover:bg-[#f4f4f5] transition-colors"
          title="Export CSV data"
        >
          <Download size={13} className="text-[#71717a]" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        <button
          onClick={onOpenNewRecord}
          className="flex items-center gap-1.5 h-[32px] px-3 rounded-md text-xs font-medium text-white bg-[#2563eb] hover:bg-[#1d4ed8] active:scale-[0.99] transition-all shadow-xs"
        >
          <Plus size={14} />
          <span>New Record</span>
        </button>
      </div>
    </header>
  );
};
