import React from 'react';
import {
  PieChart,
  CheckSquare,
  MapPin,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { CelebrationPlan } from '../types/planner';
import { ExplainabilityPanel } from './ExplainabilityPanel';
import { NavigationTab } from './Navbar';
import { formatINR } from '../utils/plannerLogic';

interface BlueprintSummaryProps {
  plan: CelebrationPlan;
  onNavigateTab: (tab: NavigationTab) => void;
}

export const BlueprintSummary: React.FC<BlueprintSummaryProps> = ({
  plan,
  onNavigateTab,
}) => {
  const { constraints, budgetBreakdown, vendorChecklist, timeline, dynamicReasoning } = plan;

  const targetDateObj = new Date(constraints.targetDate);
  const daysAway = Math.max(
    0,
    Math.ceil((targetDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  );

  const completedTasks = vendorChecklist.filter((i) => i.completed).length;
  const overdueMilestones = timeline.filter((m) => m.isOverdue);
  const contextSpecificTasks = vendorChecklist.filter((i) => i.isContextSpecific);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Title & Celebration Header Banner - Architectural Restraint */}
      <div className="bg-surface rounded-xl border border-border p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded border border-accent/20">
              {constraints.eventType.toUpperCase()} BLUEPRINT
            </span>
            <span className="text-xs font-mono text-text-muted flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-accent" /> {constraints.city}
            </span>
            <span className="text-xs font-mono text-text-muted flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-accent" /> {constraints.targetDate} ({daysAway} days away)
            </span>
            {plan.source === 'ai_orchestrated' ? (
              <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI Multi-Agent Synthesized
              </span>
            ) : (
              <span className="text-[10px] font-mono text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-300 dark:border-blue-800">
                🎯 Expert Domain Engine
              </span>
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight">
              {constraints.title || `${constraints.eventType} Celebration`}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
              Engineered for {constraints.guestCount} attendees in an Indian {constraints.locationStyle} setting under an inviolable {formatINR(constraints.budgetCap)} cap.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-surface-2/60 p-3 rounded-lg border border-border/80">
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                Hard Budget Cap
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-text-primary mt-0.5 tabular-nums">
                {formatINR(constraints.budgetCap)}
              </div>
              <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                100% hard enforced
              </div>
            </div>

            <div className="bg-surface-2/60 p-3 rounded-lg border border-border/80">
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                10% Shagun Buffer
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 tabular-nums">
                {formatINR(budgetBreakdown.safetyBuffer.amount)}
              </div>
              <div className="text-[10px] font-mono text-text-muted mt-0.5">
                Ring-fenced contingency
              </div>
            </div>

            <div className="bg-surface-2/60 p-3 rounded-lg border border-border/80">
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                Per-Attendee Plate
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-text-primary mt-0.5 tabular-nums">
                {formatINR(budgetBreakdown.perGuestCost)}
              </div>
              <div className="text-[10px] font-mono text-text-muted mt-0.5">
                {constraints.guestCount} attendees
              </div>
            </div>

            <div className="bg-surface-2/60 p-3 rounded-lg border border-border/80">
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                Overdue Milestones
              </div>
              <div
                className={`text-base sm:text-lg font-bold font-mono mt-0.5 tabular-nums ${
                  overdueMilestones.length > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-text-primary'
                }`}
              >
                {overdueMilestones.length}
              </div>
              <div className="text-[10px] font-mono text-text-muted mt-0.5">
                {daysAway} days until event
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explainability Panel Card */}
      <ExplainabilityPanel
        dynamicReasoning={dynamicReasoning}
        safetyBuffer={budgetBreakdown.safetyBuffer}
        budgetCap={constraints.budgetCap}
        guestCount={constraints.guestCount}
      />

      {/* Two Column Grid: Budget Highlights & Operational Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Budget Allocation Summary */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-accent" />
                <h3 className="font-display font-bold text-sm sm:text-base text-text-primary">
                  Budget Allocations
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('budget')}
                className="text-xs font-mono font-medium text-accent hover:underline flex items-center gap-1 focus:outline-none"
              >
                <span>Interactive Sliders</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-text-secondary mb-3">
              90% distributed across core vendors + 10% protected Shagun reserve.
            </p>

            {/* Category breakdown bars */}
            <div className="space-y-2">
              {budgetBreakdown.categories.map((c) => (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-text-primary flex items-center gap-1.5 text-xs">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      {c.name}
                    </span>
                    <span className="font-mono text-text-secondary text-xs tabular-nums">
                      {c.percentage}% · <strong className="text-text-primary">{formatINR(c.amount)}</strong>
                    </span>
                  </div>
                  <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(c.percentage / 50) * 100}%`, backgroundColor: c.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('budget')}
            className="w-full mt-3 py-2 rounded-lg border border-border bg-surface-2/60 hover:bg-surface-2 text-xs font-medium text-text-primary transition-colors flex items-center justify-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span>Modify Sliders & Rebalance</span>
            <ArrowRight className="w-3.5 h-3.5 text-accent" />
          </button>
        </div>

        {/* Right Column: Context Tasks & Overdue Milestones */}
        <div className="bg-surface rounded-xl border border-border p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-accent" />
                <h3 className="font-display font-bold text-sm sm:text-base text-text-primary">
                  Contextual Contingency & Timing
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('checklist')}
                className="text-xs font-mono font-medium text-accent hover:underline flex items-center gap-1 focus:outline-none"
              >
                <span>All Tasks</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-text-secondary mb-3">
              Context-injected tasks triggered by your {constraints.locationStyle} setting and guest volume:
            </p>

            <div className="space-y-2">
              {contextSpecificTasks.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-surface-2/60 border border-border/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-text-primary text-xs truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent/10 text-accent shrink-0">
                      {item.contextTag}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary line-clamp-1">{item.whyThisWasAdded}</p>
                </div>
              ))}

              {overdueMilestones.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-200 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{overdueMilestones.length} Overdue Milestones Require Action</span>
                  </div>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                    Earlier vendor booking windows elapsed due to the {daysAway}-day celebration date.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => onNavigateTab('checklist')}
              className="flex-1 py-2 rounded-lg border border-border bg-surface-2/60 hover:bg-surface-2 text-xs font-medium text-text-primary transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Checklist ({completedTasks}/{vendorChecklist.length})</span>
            </button>
            <button
              onClick={() => onNavigateTab('timeline')}
              className="flex-1 py-2 rounded-lg border border-border bg-surface-2/60 hover:bg-surface-2 text-xs font-medium text-text-primary transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Timeline ({timeline.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
