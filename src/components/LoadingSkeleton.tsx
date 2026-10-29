import React, { useState, useEffect } from 'react';
import { Sparkles, BrainCircuit, ShieldCheck, CalendarCheck } from 'lucide-react';

export const LoadingSkeleton: React.FC = () => {
  const [stage, setStage] = useState(0);

  const stages = [
    { text: 'Budget Agent: Distributing spend & locking 10% Shagun buffer...', icon: ShieldCheck },
    { text: 'Checklist Agent: Auditing German hanger, weather, generator & guest logistics...', icon: BrainCircuit },
    { text: 'Timeline Agent: Reverse-engineering lead-times & checking overdue milestones...', icon: CalendarCheck },
    { text: 'Multi-Agent Orchestrator: Synthesizing explainable trade-offs...', icon: Sparkles },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [stages.length]);

  const CurrentIcon = stages[stage].icon;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Central Orchestrator Pulse */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-2 border border-border text-accent mb-3 shadow-xs">
          <CurrentIcon className="w-6 h-6 animate-pulse" />
        </div>
        <h2 className="text-xl font-display font-semibold text-text-primary mb-1">
          Synthesizing Indian Celebration Blueprint
        </h2>
        <p className="text-xs text-text-secondary max-w-md mx-auto h-5 font-mono">
          {stages[stage].text}
        </p>

        {/* Mini progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {stages.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === stage ? 'w-6 bg-accent' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Shimmer skeleton grid */}
      <div className="space-y-4 animate-pulse">
        {/* Top metrics skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-surface rounded-xl p-4 border border-border">
              <div className="h-3 bg-surface-2 rounded w-20 mb-2.5" />
              <div className="h-6 bg-surface-2 rounded w-32 mb-1.5" />
              <div className="h-2.5 bg-surface-2 rounded w-40" />
            </div>
          ))}
        </div>

        {/* Main card skeleton */}
        <div className="bg-surface rounded-xl p-5 border border-border space-y-3">
          <div className="h-5 bg-surface-2 rounded w-1/4" />
          <div className="h-3.5 bg-surface-2 rounded w-full" />
          <div className="h-3.5 bg-surface-2 rounded w-4/5" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-surface-2 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
