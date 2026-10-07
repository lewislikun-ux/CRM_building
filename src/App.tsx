import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { PipelineTable } from './components/PipelineTable';
import { RecordInspector } from './components/RecordInspector';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { AnalyticsView } from './components/AnalyticsView';
import { IntegrationsView } from './components/IntegrationsView';
import { CommandPalette } from './components/CommandPalette';
import { NewRecordModal } from './components/NewRecordModal';
import { INITIAL_DEALS, INITIAL_NODES, INITIAL_EDGES, INITIAL_SOURCES } from './mockData';
import { DealRecord, ViewTab, WorkflowNode, WorkflowEdge, DataSource } from './types';
import { exportDealsToCSV } from './utils/csv';

export default function App() {
  const [deals, setDeals] = useState<DealRecord[]>(() => {
    const saved = localStorage.getItem('dataengine_deals');
    return saved ? JSON.parse(saved) : INITIAL_DEALS;
  });

  const [nodes, setNodes] = useState<WorkflowNode[]>(() => {
    const saved = localStorage.getItem('dataengine_nodes');
    return saved ? JSON.parse(saved) : INITIAL_NODES;
  });

  const [edges, setEdges] = useState<WorkflowEdge[]>(() => {
    const saved = localStorage.getItem('dataengine_edges');
    return saved ? JSON.parse(saved) : INITIAL_EDGES;
  });

  const [sources, setSources] = useState<DataSource[]>(INITIAL_SOURCES);

  const [currentTab, setCurrentTab] = useState<ViewTab>('table');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [isSimulatingWorkflow, setIsSimulatingWorkflow] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dataengine_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('dataengine_nodes', JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem('dataengine_edges', JSON.stringify(edges));
  }, [edges]);

  // Global Keyboard shortcuts: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
        else if (isNewRecordModalOpen) setIsNewRecordModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, isNewRecordModalOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filter deals based on search, smart sidebar filter, and stage filter
  const filteredDeals = deals.filter((deal) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        deal.name.toLowerCase().includes(q) ||
        deal.company.toLowerCase().includes(q) ||
        deal.id.toLowerCase().includes(q) ||
        deal.owner.toLowerCase().includes(q) ||
        deal.contactName.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // Sidebar Smart Filter
    if (selectedFilter === 'high_value' && deal.value < 150000) return false;
    if (selectedFilter === 'blocked' && deal.stage !== 'blocked') return false;
    if (selectedFilter === 'won' && deal.stage !== 'won') return false;

    // Subheader Stage Filter
    if (stageFilter !== 'all' && deal.stage !== stageFilter) return false;

    return true;
  });

  const handleUpdateDeal = (id: string, updates: Partial<DealRecord>) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const handleDeleteDeal = (id: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== id));
    if (selectedDealId === id) setSelectedDealId(null);
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    showToast('Record deleted');
  };

  const handleAddDeal = (newDeal: DealRecord) => {
    setDeals((prev) => [newDeal, ...prev]);
    setSelectedDealId(newDeal.id);
    showToast(`Created record ${newDeal.id} successfully`);
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedRowIds.size === filteredDeals.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredDeals.map((d) => d.id)));
    }
  };

  const handleExportCSV = () => {
    const dealsToExport =
      selectedRowIds.size > 0
        ? deals.filter((d) => selectedRowIds.has(d.id))
        : filteredDeals;
    exportDealsToCSV(dealsToExport, 'data_engine_pipeline_export.csv');
    showToast(`Exported ${dealsToExport.length} records to CSV`);
  };

  const handleRunSimulation = () => {
    setIsSimulatingWorkflow(true);
    showToast('Simulating live graph pipeline events...');
    setTimeout(() => {
      setIsSimulatingWorkflow(false);
      showToast('Automation workflow execution verified');
    }, 3800);
  };

  const handleTriggerTestEvent = (sourceName: string) => {
    showToast(`Inbound event dispatched from ${sourceName}`);
    // Simulate updating a source
    setSources((prev) =>
      prev.map((s) =>
        s.name === sourceName
          ? { ...s, lastSync: 'Just now', recordsSynced: s.recordsSynced + 1 }
          : s
      )
    );
  };

  const selectedDeal = deals.find((d) => d.id === selectedDealId) || null;
  const blockedCount = deals.filter((d) => d.stage === 'blocked').length;
  const wonCount = deals.filter((d) => d.stage === 'won').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#fafafa] font-sans antialiased text-[#09090b]">
      {/* Three-zone horizontal layout:
          Zone 1: Collapsible Primary Sidebar (240px -> 56px) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'table') setSelectedDealId(null);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenNewRecordModal={() => setIsNewRecordModalOpen(true)}
        selectedFilter={selectedFilter}
        onSelectFilter={(f) => {
          setSelectedFilter(f);
          setStageFilter('all');
        }}
        totalDealsCount={deals.length}
        blockedCount={blockedCount}
        wonCount={wonCount}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <TopHeader
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onExportCSV={handleExportCSV}
          onOpenNewRecord={() => setIsNewRecordModalOpen(true)}
          onRunWorkflowTest={handleRunSimulation}
          isTestingWorkflow={isSimulatingWorkflow}
        />

        {/* Viewport Content Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {currentTab === 'table' && (
            <PipelineTable
              deals={filteredDeals}
              selectedDealId={selectedDealId}
              onSelectDeal={(deal) => setSelectedDealId(deal.id)}
              onUpdateDeal={handleUpdateDeal}
              onDeleteDeal={handleDeleteDeal}
              selectedRowIds={selectedRowIds}
              onToggleSelectRow={handleToggleSelectRow}
              onToggleSelectAll={handleToggleSelectAll}
              stageFilter={stageFilter}
              onSetStageFilter={setStageFilter}
            />
          )}

          {currentTab === 'workflow' && (
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onUpdateNodes={setNodes}
              onUpdateEdges={setEdges}
              isSimulating={isSimulatingWorkflow}
              onRunSimulation={handleRunSimulation}
            />
          )}

          {currentTab === 'analytics' && <AnalyticsView deals={deals} />}

          {currentTab === 'integrations' && (
            <IntegrationsView
              sources={sources}
              onTriggerTestEvent={handleTriggerTestEvent}
            />
          )}

          {/* Contextual Side Panel / Record Inspector (420px drawer) */}
          {currentTab === 'table' && selectedDeal && (
            <RecordInspector
              deal={selectedDeal}
              onClose={() => setSelectedDealId(null)}
              onUpdateDeal={handleUpdateDeal}
              onDeleteDeal={handleDeleteDeal}
            />
          )}
        </div>
      </div>

      {/* Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setCurrentTab}
        onOpenNewRecord={() => setIsNewRecordModalOpen(true)}
        onExportCSV={handleExportCSV}
        onRunWorkflowTest={handleRunSimulation}
        deals={deals}
        onSelectDeal={(d) => {
          setSelectedDealId(d.id);
          setCurrentTab('table');
        }}
      />

      {/* New Record Modal */}
      <NewRecordModal
        isOpen={isNewRecordModalOpen}
        onClose={() => setIsNewRecordModalOpen(false)}
        onAddDeal={handleAddDeal}
        existingCount={deals.length}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#09090b] text-white text-xs px-3.5 py-2 rounded-lg shadow-xl border border-zinc-800 transition-all">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
