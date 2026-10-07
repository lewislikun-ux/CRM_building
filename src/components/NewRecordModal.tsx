import React, { useState } from 'react';
import { X, Plus, DollarSign, Calendar, User, Building, Mail } from 'lucide-react';
import { DealRecord, DealStage, PriorityLevel } from '../types';

interface NewRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDeal: (deal: DealRecord) => void;
  existingCount: number;
}

export const NewRecordModal: React.FC<NewRecordModalProps> = ({
  isOpen,
  onClose,
  onAddDeal,
  existingCount,
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [value, setValue] = useState('125000');
  const [arr, setArr] = useState('100000');
  const [probability, setProbability] = useState('60');
  const [stage, setStage] = useState<DealStage>('in_progress');
  const [owner, setOwner] = useState('Alex Chen');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactTitle, setContactTitle] = useState('VP of Engineering');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [targetClose, setTargetClose] = useState('2026-11-30');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim()) return;

    const newDeal: DealRecord = {
      id: `REC-${1000 + existingCount + 1}`,
      name: name.trim(),
      company: company.trim(),
      stage,
      value: Number(value) || 0,
      arr: Number(arr) || 0,
      probability: Number(probability) || 50,
      owner,
      ownerAvatar: owner.split(' ').map((n) => n[0]).join(''),
      ownerEmail: `${owner.toLowerCase().replace(' ', '.')}@dataengine.io`,
      contactName: contactName.trim() || 'Key Decision Maker',
      contactEmail: contactEmail.trim() || `contact@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      contactTitle: contactTitle.trim(),
      priority,
      healthScore: 85,
      targetClose: targetClose || '2026-12-15',
      createdDate: new Date().toISOString().split('T')[0],
      source: 'Direct Manual Entry',
      tags: ['Enterprise', 'Direct Intake'],
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: 'note',
          title: 'Record Initialized',
          description: `Created deal in ${stage} stage with ${owner}.`,
          author: 'Alex Chen',
          timestamp: 'Just now',
        },
      ],
    };

    onAddDeal(newDeal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b]/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-white border border-[#e4e4e7] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#e4e4e7] flex items-center justify-between bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#2563eb] text-white flex items-center justify-center text-xs">
              <Plus size={14} />
            </div>
            <h3 className="text-sm font-semibold text-[#09090b]">Create Pipeline Record</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717a] hover:text-[#09090b] p-1 rounded hover:bg-[#e4e4e7]"
          >
            <X size={15} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">
                Deal / Project Name *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Enterprise Cloud Deployment"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#e4e4e7] rounded-md text-[#09090b] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">
                Target Company *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Acme Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#e4e4e7] rounded-md text-[#09090b] focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">
                Deal Value ($)
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#e4e4e7] rounded-md text-[#09090b] font-mono focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">
                ARR ($)
              </label>
              <input
                type="number"
                value={arr}
                onChange={(e) => setArr(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#e4e4e7] rounded-md text-[#09090b] font-mono focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">
                Win Probability (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#e4e4e7] rounded-md text-[#09090b] font-mono focus:outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">
                Initial Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as DealStage)}
                className="w-full h-8 px-2 bg-white border border-[#e4e4e7] rounded-md text-[#09090b] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="lead">Lead / Cold</option>
                <option value="in_progress">In Progress / Active</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won / Contract Signed</option>
                <option value="blocked">Blocked / High Alert</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">
                Account Owner
              </label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full h-8 px-2 bg-white border border-[#e4e4e7] rounded-md text-[#09090b] focus:outline-none focus:border-[#2563eb]"
              >
                <option value="Alex Chen">Alex Chen (Senior Partner)</option>
                <option value="Marcus Brody">Marcus Brody (Enterprise AE)</option>
                <option value="Elena Rostova">Elena Rostova (VP Deals)</option>
                <option value="Rachel Zane">Rachel Zane (Commercial Lead)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">
                Contact Name
              </label>
              <input
                type="text"
                placeholder="e.g. Jordan Hayes"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#e4e4e7] rounded-md text-[#09090b] focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">
                Contact Title
              </label>
              <input
                type="text"
                placeholder="e.g. Head of Engineering"
                value={contactTitle}
                onChange={(e) => setContactTitle(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-[#e4e4e7] rounded-md text-[#09090b] focus:outline-none focus:border-[#2563eb]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#52525b] uppercase tracking-wider">
                Target Close Date
              </label>
              <input
                type="date"
                value={targetClose}
                onChange={(e) => setTargetClose(e.target.value)}
                className="w-full h-8 px-2 bg-white border border-[#e4e4e7] rounded-md text-[#09090b] focus:outline-none focus:border-[#2563eb]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f4f4f5]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-[#e4e4e7] text-[#52525b] hover:bg-[#f4f4f5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-[#2563eb] text-white font-medium hover:bg-[#1d4ed8] shadow-xs"
            >
              Create Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
