import React, { useState } from 'react';
import {
  Building,
  Utensils,
  Sparkles,
  Music,
  Camera,
  ClipboardCheck,
  ShieldCheck,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp,
  PieChart as PieIcon,
  BarChart3,
  HeartPulse,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { BudgetBreakdown, BudgetCategory, UserConstraints } from '../types/planner';
import {
  rebalanceCategories,
  calculateSpendingHealth,
  formatINR,
  formatINRCompact,
  INDUSTRY_BENCHMARKS,
} from '../utils/plannerLogic';

interface BudgetAllocatorProps {
  budgetBreakdown: BudgetBreakdown;
  constraints: UserConstraints;
  onUpdateCategories: (categories: BudgetCategory[]) => void;
  onResetBaseline: () => void;
}

export const BudgetAllocator: React.FC<BudgetAllocatorProps> = ({
  budgetBreakdown,
  constraints,
  onUpdateCategories,
  onResetBaseline,
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [expandedSubItems, setExpandedSubItems] = useState<Record<string, boolean>>({});
  const [showAllBenchmarks, setShowAllBenchmarks] = useState(false);
  const [, setIsRebalancing] = useState(false);

  const categories = budgetBreakdown.categories;
  const safetyBuffer = budgetBreakdown.safetyBuffer;
  const totalBudget = constraints.budgetCap;

  // Calculate live spending health against Indian celebration benchmarks
  const healthReport = calculateSpendingHealth(categories, constraints);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Building':
        return <Building className="w-4 h-4" />;
      case 'Utensils':
        return <Utensils className="w-4 h-4" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Music':
        return <Music className="w-4 h-4" />;
      case 'Camera':
        return <Camera className="w-4 h-4" />;
      case 'ClipboardCheck':
        return <ClipboardCheck className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const handleSliderChange = async (catId: string, newPercentage: number) => {
    setIsRebalancing(true);
    const updated = rebalanceCategories(
      categories,
      catId,
      newPercentage,
      totalBudget,
      constraints
    );
    onUpdateCategories(updated);

    try {
      fetch('/api/rebalance-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories,
          changedCategoryId: catId,
          newPercentage,
          constraints,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.categories) {
            onUpdateCategories(data.categories);
          }
        })
        .catch(() => {})
        .finally(() => setIsRebalancing(false));
    } catch (e) {
      setIsRebalancing(false);
    }
  };

  const toggleSubItems = (id: string) => {
    setExpandedSubItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compute SVG Donut Chart Slices
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const allChartSegments = [
    ...categories.map((c) => ({
      id: c.id,
      name: c.name,
      percentage: c.percentage,
      amount: c.amount,
      color: c.color,
    })),
    {
      id: 'buffer',
      name: '10% Shagun & Emergency Buffer',
      percentage: safetyBuffer.percentage,
      amount: safetyBuffer.amount,
      color: '#059669', // Emerald
    },
  ];

  const activeCategory = categories.find((c) => c.id === activeCategoryId);

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-2 border border-border text-text-secondary text-[11px] font-mono tracking-wide uppercase mb-2">
            <PieIcon className="w-3.5 h-3.5 text-accent" />
            <span>Stage 02 · Explainable Financial Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight">
            Interactive Budget & Spending Health Audit
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
            Drag any slider to test trade-offs. The allocator enforces the strict {formatINR(totalBudget)} cap, auto-rebalances remaining categories, and audits variance against Indian benchmarks.
          </p>
        </div>

        <button
          onClick={onResetBaseline}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-2 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors shrink-0 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <RotateCcw className="w-3.5 h-3.5 text-accent" />
          <span>Reset AI Allocations</span>
        </button>
      </div>

      {/* SPENDING HEALTH INDICATOR CARD - FINTECH AUDIT GRADE */}
      <div className="bg-surface rounded-xl border border-border p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 ${
                healthReport.overallStatus === 'healthy'
                  ? 'bg-emerald-600'
                  : healthReport.overallStatus === 'moderate_risk'
                  ? 'bg-amber-600'
                  : 'bg-rose-600'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-sm sm:text-base text-text-primary">
                  Spending Health Indicator
                </h3>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    healthReport.overallStatus === 'healthy'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : healthReport.overallStatus === 'moderate_risk'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  }`}
                >
                  {healthReport.overallStatus === 'healthy'
                    ? 'Safe Benchmark'
                    : healthReport.overallStatus === 'moderate_risk'
                    ? 'Moderate Risk'
                    : 'High Overextension'}
                </span>
              </div>
              <p className="text-[11px] text-text-muted font-mono mt-0.5">
                Real-time statistical variance against Indian wedding and celebration averages
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Health Index</div>
            <div className="text-xl font-bold font-mono text-text-primary tabular-nums">
              {healthReport.score} <span className="text-xs text-text-muted font-normal">/ 100</span>
            </div>
          </div>
        </div>

        {/* Progress Bar Indicator with Benchmark Zones */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-text-secondary text-[11px]">Allocation Risk Analysis</span>
            <span className="text-[11px] font-semibold">
              {healthReport.highRiskCount > 0 ? (
                <span className="text-rose-600 dark:text-rose-400">
                  {healthReport.highRiskCount} High Risk Category Flagged
                </span>
              ) : healthReport.cautionCount > 0 ? (
                <span className="text-amber-600 dark:text-amber-400">
                  {healthReport.cautionCount} Caution Flag(s)
                </span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400">
                  All 6 Categories Aligned to Safe Benchmarks
                </span>
              )}
            </span>
          </div>

          {/* Clean Segmented Progress Bar */}
          <div className="relative w-full h-2.5 bg-surface-2 rounded-full overflow-hidden border border-border">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                healthReport.score >= 80
                  ? 'bg-emerald-600'
                  : healthReport.score >= 55
                  ? 'bg-amber-500'
                  : 'bg-rose-600'
              }`}
              style={{ width: `${healthReport.score}%` }}
            />
          </div>

          <p className="text-xs text-text-secondary leading-relaxed pt-1">
            {healthReport.summary}
          </p>
        </div>

        {/* High Risk / Caution Alerts */}
        {(healthReport.highRiskCount > 0 || healthReport.cautionCount > 0) && (
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">
              Identified Category Deviations:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {healthReport.categories
                .filter((cat) => cat.status !== 'healthy')
                .map((cat) => (
                  <div
                    key={cat.categoryId}
                    className={`p-3 rounded-lg border text-xs flex flex-col justify-between ${
                      cat.status === 'high_risk'
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300/80 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                        : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/80 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span className="flex items-center gap-1.5">
                          {cat.status === 'high_risk' ? (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          )}
                          <span className="text-xs">{cat.categoryName}</span>
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface/80 border border-current/20 tabular-nums">
                          {cat.currentPercentage}% (Safe: {cat.benchmarkRange[0]}–{cat.benchmarkRange[1]}%)
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90 mt-1">
                        {cat.riskMessage}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-current/20 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSliderChange(cat.categoryId, cat.benchmarkPercentage)}
                        className="text-[10px] font-mono font-semibold underline hover:no-underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Auto-Align to Safe Benchmark ({cat.benchmarkPercentage}%)</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Expandable Benchmark Comparison Progress Indicators */}
        <div className="pt-2 border-t border-border/60">
          <button
            type="button"
            onClick={() => setShowAllBenchmarks(!showAllBenchmarks)}
            className="flex items-center gap-1.5 text-xs font-mono text-accent hover:underline font-semibold focus:outline-none"
          >
            {showAllBenchmarks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showAllBenchmarks ? 'Hide' : 'Inspect'} 6 categories vs. Indian Industry Benchmarks</span>
          </button>

          {showAllBenchmarks && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {healthReport.categories.map((cat) => {
                const isSafe = cat.status === 'healthy';
                const min = cat.benchmarkRange[0];
                const max = cat.benchmarkRange[1];

                return (
                  <div
                    key={cat.categoryId}
                    className="p-3 rounded-lg bg-surface-2/60 border border-border text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-text-primary text-xs">{cat.categoryName}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          cat.status === 'healthy'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : cat.status === 'caution'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {cat.status === 'healthy' ? 'Healthy' : cat.status === 'caution' ? 'Caution' : 'Overweight'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-text-muted">
                        <span>Current: <strong className="text-text-primary tabular-nums">{cat.currentPercentage}%</strong></span>
                        <span>Avg: {cat.benchmarkPercentage}% ({min}%–{max}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-border relative">
                        <div
                          className={`h-full rounded-full ${
                            isSafe ? 'bg-emerald-500' : cat.status === 'caution' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, (cat.currentPercentage / 55) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Visual Chart Grid: Donut Chart + Stacked Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface p-6 rounded-xl border border-border shadow-xs">
        {/* Left: Donut Chart (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-2">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {allChartSegments.map((segment) => {
                const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                accumulatedPercent += segment.percentage;

                const isHovered = activeCategoryId === segment.id;

                return (
                  <circle
                    key={segment.id}
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth={isHovered ? 24 : 18}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setActiveCategoryId(segment.id)}
                    onMouseLeave={() => setActiveCategoryId(null)}
                  />
                );
              })}
            </svg>

            {/* Central Donut Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
              {activeCategory ? (
                <>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted truncate max-w-[120px]">
                    {activeCategory.name}
                  </span>
                  <span className="text-xl font-bold font-mono text-text-primary tabular-nums">
                    {formatINR(activeCategory.amount)}
                  </span>
                  <span className="text-xs font-mono text-accent font-semibold tabular-nums">
                    {activeCategory.percentage}% of total
                  </span>
                </>
              ) : activeCategoryId === 'buffer' ? (
                <>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Shagun Buffer
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {formatINR(safetyBuffer.amount)}
                  </span>
                  <span className="text-xs font-mono text-text-muted">10% Locked</span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
                    Total Budget Cap
                  </span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-text-primary tabular-nums">
                    {formatINR(totalBudget)}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-medium">
                    100% Balanced ({formatINRCompact(totalBudget)})
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="text-[10px] font-mono text-text-muted mt-2 text-center">
            Hover or tap segments to inspect financial weighting
          </div>
        </div>

        {/* Right: Stacked Bar Chart & Category Legend (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-text-secondary mb-1.5">
              <span className="flex items-center gap-1.5 font-medium text-[11px]">
                <BarChart3 className="w-3.5 h-3.5 text-accent" /> Proportional Allocation Bar
              </span>
              <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-mono">
                90% Vendors + 10% Shagun Buffer = 100%
              </span>
            </div>

            <div className="w-full h-6 rounded-lg overflow-hidden flex bg-surface-2 p-0.5 border border-border">
              {allChartSegments.map((seg) => (
                <div
                  key={seg.id}
                  style={{
                    width: `${seg.percentage}%`,
                    backgroundColor: seg.color,
                  }}
                  onMouseEnter={() => setActiveCategoryId(seg.id)}
                  onMouseLeave={() => setActiveCategoryId(null)}
                  className={`h-full cursor-pointer transition-opacity relative ${
                    activeCategoryId && activeCategoryId !== seg.id ? 'opacity-40' : 'opacity-100'
                  }`}
                  title={`${seg.name}: ${seg.percentage}% (${formatINR(seg.amount)})`}
                />
              ))}
            </div>
          </div>

          {/* Quick Legend Tags */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onMouseEnter={() => setActiveCategoryId(c.id)}
                onMouseLeave={() => setActiveCategoryId(null)}
                className={`p-2 rounded-lg text-left border text-xs transition-all ${
                  activeCategoryId === c.id
                    ? 'border-accent bg-accent/5 ring-1 ring-accent'
                    : 'border-border/80 bg-surface-2/60 hover:bg-surface'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="font-semibold text-text-primary text-[11px] truncate">{c.name}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] font-mono tabular-nums">
                  <span className="text-text-muted">{c.percentage}%</span>
                  <span className="font-bold text-text-primary">{formatINR(c.amount)}</span>
                </div>
              </button>
            ))}

            {/* Inviolable 10% Shagun Buffer Badge */}
            <div className="p-2 rounded-lg text-left border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs">
              <div className="flex items-center gap-1.5 mb-0.5 text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="font-semibold text-[11px]">Shagun Buffer</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono tabular-nums">
                <span className="text-emerald-700 dark:text-emerald-400">10% locked</span>
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  {formatINR(safetyBuffer.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Sliders List with Live Explainability */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-display font-bold text-text-primary">
            Category Allocation Sliders & Explainability
          </h3>
          <span className="text-[11px] font-mono text-text-muted">
            Categories auto-rebalance to 90% (leaving 10% Shagun reserve)
          </span>
        </div>

        {categories.map((cat) => {
          const isExpanded = expandedSubItems[cat.id];
          const isSelected = activeCategoryId === cat.id;
          const catHealth = healthReport.categories.find((c) => c.categoryId === cat.id);

          return (
            <div
              key={cat.id}
              className={`bg-surface rounded-xl border p-4 sm:p-5 transition-all shadow-xs ${
                isSelected
                  ? 'border-accent ring-1 ring-accent/30'
                  : catHealth?.status === 'high_risk'
                  ? 'border-rose-300 dark:border-rose-900/60'
                  : catHealth?.status === 'caution'
                  ? 'border-amber-300 dark:border-amber-900/60'
                  : 'border-border'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: cat.color }}
                  >
                    {getIcon(cat.iconName)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-primary text-xs sm:text-sm flex items-center gap-2">
                      <span>{cat.name}</span>
                      {catHealth && catHealth.status !== 'healthy' && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                            catHealth.status === 'high_risk'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {catHealth.status === 'high_risk' ? '🚨 High Risk' : '⚠️ Caution'}
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] font-mono text-text-muted tabular-nums">
                      ~{formatINR(Math.round(cat.amount / Math.max(1, constraints.guestCount)))} / attendee plate
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base sm:text-lg font-bold font-mono text-text-primary tabular-nums">
                      {formatINR(cat.amount)}
                    </span>
                    <span className="ml-2 text-xs font-bold font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-md tabular-nums">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider Input */}
              <div className="space-y-1 mb-3">
                <input
                  type="range"
                  min="2"
                  max="65"
                  step="0.5"
                  value={cat.percentage}
                  onChange={(e) => handleSliderChange(cat.id, parseFloat(e.target.value))}
                  className="w-full accent-accent cursor-pointer h-1.5 bg-surface-2 rounded-lg"
                  aria-label={`${cat.name} percentage allocation`}
                />
                <div className="flex justify-between text-[10px] font-mono text-text-muted">
                  <span>Lean (2%)</span>
                  <span>Indian Benchmark ({INDUSTRY_BENCHMARKS[cat.id]?.targetPercent || 25}%)</span>
                  <span>Heavy Priority (65%)</span>
                </div>
              </div>

              {/* Contextual "Why" Reasoning Box */}
              <div className="bg-surface-2/60 p-3 rounded-lg border-l-2 border-l-accent border-y border-r border-border text-xs flex items-start gap-2.5">
                <Info className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-mono uppercase tracking-wider text-[9px] text-text-muted font-semibold block">
                    Strategic Trade-Off Rationale:
                  </span>
                  <p className="text-text-secondary leading-relaxed font-normal text-xs">
                    {cat.reasoning}
                  </p>
                </div>
              </div>

              {/* Expandable Sub-items Breakdown */}
              {cat.subItems && cat.subItems.length > 0 && (
                <div className="mt-2.5 pt-2.5 border-t border-border/60">
                  <button
                    type="button"
                    onClick={() => toggleSubItems(cat.id)}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{isExpanded ? 'Hide' : 'Inspect'} line-item cost model ({cat.subItems.length} items)</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {cat.subItems.map((sub, idx) => (
                        <div
                          key={idx}
                          className="bg-surface-2/60 p-2.5 rounded-lg border border-border/80 text-xs flex justify-between items-start"
                        >
                          <div>
                            <div className="font-semibold text-text-primary text-[11px]">{sub.name}</div>
                            <div className="text-[10px] text-text-muted mt-0.5">{sub.note}</div>
                          </div>
                          <span className="font-mono font-bold text-text-primary shrink-0 ml-2 tabular-nums">
                            {formatINR(sub.estimatedCost)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Inviolable 10% Shagun & Emergency Reserve Card */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-300 dark:border-emerald-800 p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2">
                  <span>10% Shagun & Emergency Contingency Reserve</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200">
                    Hard Constraint Locked
                  </span>
                </h4>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  Ring-fenced against unannounced relative surges, extra buffet plates, generator diesel overtime, and monsoon waterproofing
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-900 dark:text-emerald-200 tabular-nums">
                {formatINR(safetyBuffer.amount)}
              </span>
              <span className="ml-2 text-xs font-bold font-mono text-emerald-800 dark:text-emerald-300 bg-emerald-200/50 dark:bg-emerald-800/50 px-2 py-0.5 rounded-md tabular-nums">
                10% Fixed
              </span>
            </div>
          </div>
          <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 mt-2 leading-relaxed">
            {safetyBuffer.reasoning}
          </p>
        </div>
      </div>
    </div>
  );
};
