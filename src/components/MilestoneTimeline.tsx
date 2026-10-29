import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  Info,
  Check,
} from 'lucide-react';
import { TimelineMilestone, UserConstraints } from '../types/planner';

interface MilestoneTimelineProps {
  timeline: TimelineMilestone[];
  constraints: UserConstraints;
}

export const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  timeline,
  constraints,
}) => {
  const [filter, setFilter] = useState<'all' | 'overdue' | 'upcoming'>('all');
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const targetDateObj = new Date(constraints.targetDate);
  const now = new Date();
  const daysUntilCelebration = Math.max(
    0,
    Math.ceil((targetDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  const overdueCount = timeline.filter((m) => m.isOverdue).length;

  const filteredTimeline = timeline.filter((m) => {
    if (filter === 'overdue') return m.isOverdue;
    if (filter === 'upcoming') return !m.isOverdue;
    return true;
  });

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-2 border border-border text-text-secondary text-[11px] font-mono tracking-wide uppercase mb-2">
            <Clock className="w-3.5 h-3.5 text-accent" />
            <span>Stage 04 · Lead-Time Reverse Schedule</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight">
            Reverse-Engineered Countdown Timeline
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
            Calculated backwards from {constraints.targetDate}. Every milestone provides explicit vendor lead-time justifications, booking buffers, and overdue alerts.
          </p>
        </div>

        {/* Hero Countdown Counter */}
        <div className="bg-surface border border-border px-4 py-3 rounded-xl flex items-center gap-3.5 shadow-xs self-start sm:self-auto">
          <div className="w-9 h-9 rounded-lg bg-accent text-white flex items-center justify-center font-bold font-mono">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold font-mono text-text-primary tabular-nums">
              {daysUntilCelebration} Days
            </div>
            <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              Until Celebration
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Warning Alert if any */}
      {overdueCount > 0 && (
        <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-xs">
              {overdueCount} Milestone{overdueCount > 1 ? 's' : ''} Flagged for Urgent Catch-Up
            </h4>
            <p className="text-amber-800/90 dark:text-amber-300/90 mt-1 leading-relaxed text-xs">
              Because your celebration is scheduled in {daysUntilCelebration} days, standard 12-month and 6-month vendor booking windows have already elapsed. Focus on these highlighted items immediately to lock remaining vendor availability.
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-border w-fit shadow-xs">
        {[
          { id: 'all', label: `All Milestones (${timeline.length})` },
          { id: 'overdue', label: `Overdue (${overdueCount})` },
          { id: 'upcoming', label: 'Upcoming' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
              filter === tab.id
                ? 'bg-accent text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l border-border space-y-6 ml-3 sm:ml-4">
        {filteredTimeline.map((milestone) => {
          const isOverdue = milestone.isOverdue;

          return (
            <div key={milestone.id} className="relative group">
              {/* Timeline Marker Node */}
              <div
                className={`absolute -left-[30px] sm:-left-[38px] top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isOverdue
                    ? 'bg-amber-500 border-amber-600 text-white'
                    : milestone.daysRemaining <= 0
                    ? 'bg-emerald-600 border-emerald-700 text-white'
                    : 'bg-surface border-accent text-accent'
                }`}
              >
                {isOverdue ? (
                  <AlertTriangle className="w-2.5 h-2.5" />
                ) : milestone.daysRemaining <= 0 ? (
                  <Check className="w-2.5 h-2.5" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </div>

              {/* Milestone Card */}
              <div
                className={`bg-surface rounded-xl border p-4 sm:p-5 transition-all shadow-xs ${
                  isOverdue
                    ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/15 dark:bg-amber-950/10'
                    : 'border-border'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                      {milestone.timeframe}
                    </span>

                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                        <AlertTriangle className="w-2.5 h-2.5" /> OVERDUE
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-text-muted">
                      Target: {milestone.targetDate}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-text-secondary tabular-nums">
                    {milestone.daysRemaining > 0
                      ? `${milestone.daysRemaining} days remaining`
                      : milestone.daysRemaining === 0
                      ? 'Today'
                      : `${Math.abs(milestone.daysRemaining)} days past scheduled marker`}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm sm:text-base font-bold text-text-primary mb-1">
                  {milestone.title}
                </h3>
                <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                  {milestone.description}
                </p>

                {/* Lead Time "Why" Box */}
                <div className="bg-surface-2/60 p-2.5 rounded-lg border-l-2 border-l-accent/80 border-y border-r border-border text-xs flex items-start gap-2 mb-3">
                  <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted font-semibold mr-1.5">
                      Lead-Time Rationale:
                    </span>
                    <span className="text-text-secondary font-normal text-xs">
                      {milestone.leadTimeReasoning}
                    </span>
                  </div>
                </div>

                {/* Key Action Tasks */}
                {milestone.keyTasks && milestone.keyTasks.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-border/60">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-text-muted font-semibold block mb-1">
                      Action Deliverables:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {milestone.keyTasks.map((task, tIdx) => {
                        const taskId = `${milestone.id}-task-${tIdx}`;
                        const isDone = completedTasks[taskId];

                        return (
                          <button
                            key={tIdx}
                            type="button"
                            onClick={() => toggleTask(taskId)}
                            className={`p-2 rounded-lg text-left border text-xs flex items-start gap-2 transition-all ${
                              isDone
                                ? 'bg-surface-2/40 border-border/50 line-through text-text-muted'
                                : 'bg-surface border-border hover:border-accent text-text-primary'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                                isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-border'
                              }`}
                            >
                              {isDone && <Check className="w-2.5 h-2.5" />}
                            </span>
                            <span className="text-[11px] font-medium leading-tight">{task}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
