import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Scale,
  CloudRain,
  Users,
} from 'lucide-react';
import { DynamicReasoning, SafetyBuffer } from '../types/planner';
import { formatINR } from '../utils/plannerLogic';

interface ExplainabilityPanelProps {
  dynamicReasoning: DynamicReasoning;
  safetyBuffer: SafetyBuffer;
  budgetCap: number;
  guestCount: number;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  dynamicReasoning,
  safetyBuffer,
}) => {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-2 border border-border text-accent flex items-center justify-center">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-text-primary">
              Why this plan? Architectural Explainability
            </h3>
            <p className="text-[11px] text-text-muted font-mono mt-0.5">
              Transparent algorithmic trade-offs for every allocated rupee and operational decision
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-mono font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>10% Shagun Locked ({formatINR(safetyBuffer.amount)})</span>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="bg-surface-2/60 p-4 rounded-lg border border-border/70 text-xs sm:text-sm text-text-secondary leading-relaxed">
        <p className="font-semibold text-text-primary mb-1">
          {dynamicReasoning.headline}
        </p>
        <p className="text-xs leading-relaxed text-text-secondary">{dynamicReasoning.summary}</p>
      </div>

      {/* Trade-offs Made Grid */}
      <div>
        <h4 className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold mb-2.5 flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-accent" /> Strategic Trade-Off Decisions
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {dynamicReasoning.tradeoffsMade.map((tradeoff, idx) => (
            <div
              key={idx}
              className="bg-surface-2/40 border border-border/80 p-3.5 rounded-lg flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-semibold text-text-primary mb-1.5 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-accent/10 text-accent flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                    {idx + 1}
                  </span>
                  <span className="line-clamp-1">{tradeoff.decision}</span>
                </div>
                <p className="text-xs text-text-secondary mb-2.5 leading-snug">
                  {tradeoff.why}
                </p>
              </div>
              <div className="pt-2 border-t border-border/60 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 flex items-start gap-1">
                <TrendingUp className="w-3 h-3 shrink-0 mt-0.5" />
                <span>Impact: {tradeoff.impact}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contingency Strategy & Per-Guest Benchmark Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-border/60">
        <div className="p-3.5 rounded-lg bg-surface-2/40 border border-border text-xs">
          <div className="flex items-center gap-1.5 mb-1 text-text-primary font-semibold text-[11px] font-mono uppercase tracking-wider">
            <CloudRain className="w-3.5 h-3.5 text-accent" /> Weather & Monsoon Protocol
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {dynamicReasoning.contingencyStrategy}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-2/40 border border-border text-xs">
          <div className="flex items-center gap-1.5 mb-1 text-text-primary font-semibold text-[11px] font-mono uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-accent" /> Per-Attendee Benchmark Model
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {dynamicReasoning.perGuestBenchmark}
          </p>
        </div>
      </div>

      {/* Inviolable Safety Buffer Notice */}
      <div className="p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-semibold text-emerald-900 dark:text-emerald-300 mb-0.5 text-xs">
            Hard Constraint Guarantee: 10% Inviolable Shagun & Emergency Buffer ({formatINR(safetyBuffer.amount)})
          </div>
          <p className="text-emerald-800/80 dark:text-emerald-400/90 leading-relaxed text-[11px]">
            {safetyBuffer.reasoning}
          </p>
        </div>
      </div>
    </div>
  );
};
