import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart,
  Target,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DealRecord, DealStage } from '../types';
import { formatCurrency, getStageConfig } from '../utils/formatters';

interface AnalyticsViewProps {
  deals: DealRecord[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ deals }) => {
  const [forecastMultiplier, setForecastMultiplier] = useState<number>(1.0);

  const totalValue = deals.reduce((acc, d) => acc + d.value, 0);
  const totalARR = deals.reduce((acc, d) => acc + d.arr, 0);
  const weightedPipeline = deals.reduce((acc, d) => acc + (d.value * d.probability) / 100, 0);

  const wonDeals = deals.filter((d) => d.stage === 'won');
  const wonARR = wonDeals.reduce((acc, d) => acc + d.arr, 0);
  const winRate = deals.length > 0 ? Math.round((wonDeals.length / deals.length) * 100) : 0;

  const avgDealSize = deals.length > 0 ? Math.round(totalValue / deals.length) : 0;
  const avgHealth = deals.length > 0 ? Math.round(deals.reduce((a, b) => a + b.healthScore, 0) / deals.length) : 0;

  const stageCounts: Record<DealStage, { count: number; value: number }> = {
    lead: { count: 0, value: 0 },
    in_progress: { count: 0, value: 0 },
    negotiation: { count: 0, value: 0 },
    won: { count: 0, value: 0 },
    blocked: { count: 0, value: 0 },
  };

  deals.forEach((d) => {
    stageCounts[d.stage].count += 1;
    stageCounts[d.stage].value += d.value;
  });

  // Group by owner
  const ownersMap = new Map<string, { dealsCount: number; totalARR: number; avgHealth: number }>();
  deals.forEach((d) => {
    const existing = ownersMap.get(d.owner) || { dealsCount: 0, totalARR: 0, avgHealth: 0 };
    ownersMap.set(d.owner, {
      dealsCount: existing.dealsCount + 1,
      totalARR: existing.totalARR + d.arr,
      avgHealth: Math.round((existing.avgHealth * existing.dealsCount + d.healthScore) / (existing.dealsCount + 1)),
    });
  });

  const projectedARR = Math.round(weightedPipeline * forecastMultiplier);

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
      {/* Top Velocity Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#fafafa] border border-[#e4e4e7] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
              Total Pipeline Value
            </span>
            <DollarSign size={15} className="text-[#2563eb]" />
          </div>
          <div className="text-xl font-semibold font-mono tabular-nums text-[#09090b] mt-2">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-[11px] text-[#71717a] mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-medium">+18.4%</span>
            <span>vs previous quarter</span>
          </div>
        </div>

        <div className="bg-[#fafafa] border border-[#e4e4e7] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
              Weighted Expected ARR
            </span>
            <Target size={15} className="text-purple-600" />
          </div>
          <div className="text-xl font-semibold font-mono tabular-nums text-[#09090b] mt-2">
            {formatCurrency(weightedPipeline)}
          </div>
          <div className="text-[11px] text-[#71717a] mt-1">
            Calculated across probability weights
          </div>
        </div>

        <div className="bg-[#fafafa] border border-[#e4e4e7] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
              Win Velocity Rate
            </span>
            <TrendingUp size={15} className="text-emerald-600" />
          </div>
          <div className="text-xl font-semibold font-mono tabular-nums text-[#09090b] mt-2">
            {winRate}%
          </div>
          <div className="text-[11px] text-[#71717a] mt-1">
            {wonDeals.length} deals closed won ({formatCurrency(wonARR)} ARR)
          </div>
        </div>

        <div className="bg-[#fafafa] border border-[#e4e4e7] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71717a] uppercase tracking-wider">
              Avg Portfolio Health
            </span>
            <ShieldCheck size={15} className="text-blue-600" />
          </div>
          <div className="text-xl font-semibold font-mono tabular-nums text-[#09090b] mt-2">
            {avgHealth}%
          </div>
          <div className="text-[11px] text-[#71717a] mt-1">
            Avg deal size: <span className="font-mono">{formatCurrency(avgDealSize)}</span>
          </div>
        </div>
      </div>

      {/* Funnel Stage Breakdown & Forecast Simulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Funnel Matrix */}
        <div className="border border-[#e4e4e7] rounded-lg p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#09090b] uppercase tracking-wider">
              Pipeline Stage Conversion Funnel
            </h3>
            <span className="text-[11px] font-mono text-[#71717a]">
              {deals.length} active records
            </span>
          </div>

          <div className="space-y-3">
            {(['lead', 'in_progress', 'negotiation', 'won', 'blocked'] as DealStage[]).map((stage) => {
              const data = stageCounts[stage];
              const percent = totalValue > 0 ? Math.round((data.value / totalValue) * 100) : 0;
              const config = getStageConfig(stage);

              return (
                <div key={stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-[#09090b]">
                      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                      <span>{config.label}</span>
                      <span className="text-[#71717a] font-normal font-mono">
                        ({data.count})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[#52525b] tabular-nums">
                      <span>{formatCurrency(data.value)}</span>
                      <span className="text-[#71717a] text-[11px]">({percent}%)</span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-[#f4f4f5] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        stage === 'won'
                          ? 'bg-emerald-500'
                          : stage === 'negotiation'
                          ? 'bg-amber-500'
                          : stage === 'blocked'
                          ? 'bg-red-500'
                          : stage === 'in_progress'
                          ? 'bg-blue-600'
                          : 'bg-zinc-400'
                      }`}
                      style={{ width: `${Math.max(percent, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Projection & Scenario Modeling */}
        <div className="border border-[#e4e4e7] rounded-lg p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#09090b] uppercase tracking-wider">
              Interactive ARR Forecast Engine
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-[#1d4ed8] font-mono font-medium">
              Simulation Mode
            </span>
          </div>

          <p className="text-xs text-[#71717a] leading-relaxed">
            Adjust the deal velocity coefficient to project Q4 closed revenue outcomes based on historical conversion velocity.
          </p>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#71717a]">Velocity Multiplier:</span>
              <span className="font-mono font-semibold text-[#09090b]">
                {forecastMultiplier.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={forecastMultiplier}
              onChange={(e) => setForecastMultiplier(parseFloat(e.target.value))}
              className="w-full accent-[#2563eb] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#71717a] font-mono">
              <span>0.5x (Conservative)</span>
              <span>1.0x (Baseline)</span>
              <span>1.5x (Aggressive)</span>
            </div>
          </div>

          <div className="p-3.5 bg-[#fafafa] border border-[#e4e4e7] rounded-md space-y-2 mt-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#71717a]">Model Output ARR:</span>
              <span className="text-lg font-bold font-mono text-[#09090b] tabular-nums">
                {formatCurrency(projectedARR)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#52525b]">
              <span>Coverage Ratio:</span>
              <span className="font-mono font-medium text-emerald-700">
                {(forecastMultiplier * 2.4).toFixed(1)}x of target
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Executive / Rep Performance Matrix */}
      <div className="border border-[#e4e4e7] rounded-lg bg-white overflow-hidden">
        <div className="px-5 py-3 border-b border-[#e4e4e7] bg-[#fafafa] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[#09090b] uppercase tracking-wider">
            Dealmaker & Partner Portfolio Breakdown
          </h3>
          <span className="text-[11px] text-[#71717a]">4 Active Partners</span>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-[#fafafa] border-b border-[#e4e4e7] text-[11px] font-semibold text-[#71717a] uppercase tracking-wider">
            <tr className="h-8">
              <th className="px-4">Partner Name</th>
              <th className="px-4 text-center">Active Deals</th>
              <th className="px-4 text-right">Managed ARR</th>
              <th className="px-4 text-center">Portfolio Health</th>
              <th className="px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f4f4f5]">
            {Array.from(ownersMap.entries()).map(([owner, stats]) => (
              <tr key={owner} className="h-9 hover:bg-[#fafafa]">
                <td className="px-4 font-medium text-[#09090b] flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#1e293b] text-white flex items-center justify-center text-[9px] font-semibold">
                    {owner.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <span>{owner}</span>
                </td>
                <td className="px-4 text-center font-mono tabular-nums text-[#52525b]">
                  {stats.dealsCount}
                </td>
                <td className="px-4 text-right font-mono tabular-nums font-semibold text-[#09090b]">
                  {formatCurrency(stats.totalARR)}
                </td>
                <td className="px-4 text-center font-mono tabular-nums">
                  <span
                    className={`font-semibold ${
                      stats.avgHealth >= 80 ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {stats.avgHealth}%
                  </span>
                </td>
                <td className="px-4 text-right">
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                    On Pace
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
