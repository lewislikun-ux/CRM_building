import React, { useState } from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Code,
  Shield,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { DataSource } from '../types';

interface IntegrationsViewProps {
  sources: DataSource[];
  onTriggerTestEvent: (sourceName: string) => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  sources,
  onTriggerTestEvent,
}) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedSourceForPayload, setSelectedSourceForPayload] = useState<DataSource | null>(null);

  const handleSyncNow = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
    }, 1200);
  };

  const samplePayloads: Record<string, any> = {
    'Segment Event Stream': {
      event: 'deal_qualification_scored',
      userId: 'usr_89218a',
      properties: {
        companyDomain: 'hyperionlogistics.com',
        intentScore: 0.94,
        trafficTier: 'enterprise',
        estimatedARR: 148000,
      },
      timestamp: new Date().toISOString(),
    },
    'Stripe Billing & Subscriptions': {
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          customer: 'cus_NV98129',
          amount_paid: 28500000,
          currency: 'usd',
          status: 'paid',
        },
      },
      livemode: true,
    },
    'HubSpot CRM Webhook Feed': {
      subscriptionType: 'deal.propertyChange',
      propertyName: 'dealstage',
      propertyValue: 'contract_sent',
      objectId: 7892149,
      occurredAt: Date.now(),
    },
    'Clearbit Enrichment Engine': {
      person: {
        name: { fullName: 'Evelyn Vane' },
        employment: { title: 'CTO', seniorLevel: 'C-Suite' },
      },
      company: {
        legalName: 'Starlight Dynamics Inc.',
        metrics: { employees: 850, raised: 45000000 },
      },
    },
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4e4e7]">
        <div>
          <h2 className="text-base font-semibold text-[#09090b]">
            Data Sources & Ingestion Mesh
          </h2>
          <p className="text-xs text-[#71717a] mt-0.5">
            Real-time webhook relays, enrichment pipelines, and bidirectional CRM syncing.
          </p>
        </div>

        <button
          onClick={() => onTriggerTestEvent('Global Test Webhook')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563eb] text-white rounded-md text-xs font-medium hover:bg-[#1d4ed8] shadow-xs"
        >
          <Play size={12} />
          <span>Dispatch Inbound Event</span>
        </button>
      </div>

      {/* Grid of Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => {
          const isSyncing = syncingId === src.id;
          return (
            <div
              key={src.id}
              className="bg-[#fafafa] border border-[#e4e4e7] rounded-lg p-4 space-y-3 hover:border-[#a1a1aa] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-white border border-[#e4e4e7] flex items-center justify-center text-[#2563eb] font-semibold text-xs shadow-xs">
                    <Database size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#09090b]">{src.name}</h3>
                    <span className="text-[11px] text-[#71717a] font-mono">
                      Rate: {src.rateLimit}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 size={11} />
                  <span>Active</span>
                </span>
              </div>

              <div className="text-[11px] font-mono text-[#52525b] bg-white p-2 rounded border border-[#e4e4e7] truncate">
                {src.endpoint}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#f4f4f5] text-xs">
                <div className="text-[#71717a] text-[11px]">
                  <span>Last sync: </span>
                  <span className="font-mono text-[#09090b] font-medium">{src.lastSync}</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-mono">{src.recordsSynced.toLocaleString()} records</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedSourceForPayload(src)}
                    className="p-1 rounded text-[#71717a] hover:text-[#09090b] hover:bg-[#e4e4e7]"
                    title="Inspect Schema / Payload"
                  >
                    <Code size={13} />
                  </button>

                  <button
                    onClick={() => handleSyncNow(src.id)}
                    disabled={isSyncing}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-[#e4e4e7] text-[11px] text-[#09090b] hover:bg-[#f4f4f5] transition-colors"
                  >
                    <RefreshCw size={11} className={isSyncing ? 'animate-spin text-[#2563eb]' : ''} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payload Modal */}
      {selectedSourceForPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b]/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl border border-[#e4e4e7] p-5 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#f4f4f5] pb-3">
              <div className="flex items-center gap-2">
                <Code size={15} className="text-[#2563eb]" />
                <h3 className="text-sm font-semibold text-[#09090b]">
                  {selectedSourceForPayload.name} · Raw Payload
                </h3>
              </div>
              <button
                onClick={() => setSelectedSourceForPayload(null)}
                className="text-[#71717a] hover:text-[#09090b]"
              >
                ✕
              </button>
            </div>

            <pre className="bg-[#09090b] text-[#f4f4f5] p-3 rounded-lg text-xs font-mono overflow-auto max-h-72 leading-relaxed">
              {JSON.stringify(samplePayloads[selectedSourceForPayload.name] || {}, null, 2)}
            </pre>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  onTriggerTestEvent(selectedSourceForPayload.name);
                  setSelectedSourceForPayload(null);
                }}
                className="px-3 py-1.5 bg-[#2563eb] text-white rounded text-xs font-medium hover:bg-[#1d4ed8]"
              >
                Send Test Ingestion Payload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
