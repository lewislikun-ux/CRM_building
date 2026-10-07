import React from 'react';
import {
  Table2,
  Workflow,
  BarChart3,
  Database,
  ChevronLeft,
  ChevronRight,
  Command,
  Plus,
  Layers,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { ViewTab } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
  onOpenNewRecordModal: () => void;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  totalDealsCount: number;
  blockedCount: number;
  wonCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  onOpenCommandPalette,
  onOpenNewRecordModal,
  selectedFilter,
  onSelectFilter,
  totalDealsCount,
  blockedCount,
  wonCount,
}) => {
  const mainNavItems = [
    {
      id: 'table' as ViewTab,
      label: 'Pipeline Matrix',
      icon: Table2,
      badge: totalDealsCount,
    },
    {
      id: 'workflow' as ViewTab,
      label: 'Workflow Canvas',
      icon: Workflow,
      badge: 'Active',
      isLive: true,
    },
    {
      id: 'analytics' as ViewTab,
      label: 'Velocity & Forecast',
      icon: BarChart3,
    },
    {
      id: 'integrations' as ViewTab,
      label: 'Data Sources & Feeds',
      icon: Database,
      badge: '4 live',
    },
  ];

  const smartFilters = [
    { id: 'all', label: 'All Deals', count: totalDealsCount, icon: Layers },
    { id: 'high_value', label: 'Enterprise (> $150k)', count: 4, icon: Zap },
    { id: 'blocked', label: 'Blocked / Alerts', count: blockedCount, icon: AlertTriangle, isAlert: true },
    { id: 'won', label: 'Won Contracts', count: wonCount, icon: CheckCircle2 },
  ];

  return (
    <aside
      className={`relative flex flex-col shrink-0 bg-[#fafafa] border-r border-[#e4e4e7] transition-all duration-200 select-none ${
        collapsed ? 'w-14' : 'w-60'
      }`}
      style={{ minHeight: '100vh' }}
    >
      {/* Workspace Header */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-[#e4e4e7]">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-md bg-[#2563eb] text-white flex items-center justify-center font-semibold text-xs tracking-wider shadow-xs shrink-0">
              DE
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#09090b] tracking-tight truncate">
                Data Engine
              </span>
              <span className="text-[11px] text-[#71717a] truncate font-normal">
                Apex Platform · v2.4
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-7 h-7 rounded-md bg-[#2563eb] text-white flex items-center justify-center font-semibold text-xs shrink-0">
            DE
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1 rounded-md text-[#71717a] hover:text-[#09090b] hover:bg-[#f4f4f5] transition-colors"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Quick Action Button */}
      <div className="p-2 border-b border-[#e4e4e7]/60">
        <button
          onClick={onOpenNewRecordModal}
          className={`w-full flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-md bg-[#2563eb] text-white text-xs font-medium hover:bg-[#1d4ed8] active:scale-[0.99] transition-all shadow-xs ${
            collapsed ? 'px-0' : ''
          }`}
          title="Create New Record"
        >
          <Plus size={15} className="shrink-0" />
          {!collapsed && <span className="truncate">New Record</span>}
        </button>
      </div>

      {/* Main Views Nav */}
      <div className="p-2 space-y-1">
        {!collapsed && (
          <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-[#71717a] uppercase">
            Workspace Views
          </div>
        )}

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={item.label}
              className={`w-full flex items-center gap-2.5 px-2.5 h-8 rounded-[6px] text-xs transition-all ${
                isActive
                  ? 'bg-white border border-[#e4e4e7] text-[#09090b] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#f4f4f5]'
              }`}
            >
              <Icon
                size={16}
                className={`shrink-0 ${isActive ? 'text-[#2563eb]' : 'text-[#71717a]'}`}
              />
              {!collapsed && (
                <>
                  <span className="truncate flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded font-mono tabular-nums ${
                        item.isLive
                          ? 'bg-emerald-50 text-emerald-700 font-semibold'
                          : 'text-[#71717a] bg-[#f4f4f5]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Pinned Smart Filters */}
      {!collapsed && (
        <div className="p-2 pt-3 border-t border-[#e4e4e7]/60 space-y-1">
          <div className="px-2 py-1 flex items-center justify-between text-[10px] font-semibold tracking-wider text-[#71717a] uppercase">
            <span>Saved Filters</span>
            <Filter size={11} className="text-[#a1a1aa]" />
          </div>

          {smartFilters.map((sf) => {
            const Icon = sf.icon;
            const isFilterActive = currentTab === 'table' && selectedFilter === sf.id;
            return (
              <button
                key={sf.id}
                onClick={() => {
                  onSelectTab('table');
                  onSelectFilter(sf.id);
                }}
                className={`w-full flex items-center gap-2 px-2.5 h-7 rounded-[6px] text-xs transition-colors ${
                  isFilterActive
                    ? 'bg-blue-50/80 text-[#1d4ed8] font-medium'
                    : 'text-[#52525b] hover:text-[#09090b] hover:bg-[#f4f4f5]'
                }`}
              >
                <Icon
                  size={14}
                  className={`shrink-0 ${
                    sf.isAlert
                      ? 'text-red-500'
                      : isFilterActive
                      ? 'text-[#2563eb]'
                      : 'text-[#71717a]'
                  }`}
                />
                <span className="truncate flex-1 text-left">{sf.label}</span>
                <span className="text-[11px] font-mono tabular-nums text-[#71717a]">
                  {sf.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Bottom Footer Section */}
      <div className="mt-auto p-2 border-t border-[#e4e4e7] space-y-1">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className={`w-full flex items-center gap-2 px-2.5 h-8 rounded-[6px] text-xs text-[#52525b] hover:text-[#09090b] hover:bg-[#f4f4f5] transition-colors border border-transparent hover:border-[#e4e4e7] ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="Open Command Palette (Cmd + K)"
        >
          <Command size={14} className="text-[#71717a] shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-xs">Command Bar</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-[#e4e4e7] rounded text-[#71717a] font-mono">
                ⌘K
              </kbd>
            </>
          )}
        </button>

        {/* User Profile */}
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#f4f4f5] transition-colors cursor-pointer ${
            collapsed ? 'justify-center px-0' : ''
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-[#1e293b] text-white flex items-center justify-center text-[10px] font-semibold shrink-0">
            AC
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-[#09090b] truncate">
                Alex Chen
              </span>
              <span className="text-[10px] text-[#71717a] truncate">
                Senior Partner
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
