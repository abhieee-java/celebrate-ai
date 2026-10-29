import React from 'react';
import {
  Sparkles,
  PieChart,
  CheckSquare,
  Clock,
  FileText,
  Sliders,
  Moon,
  Sun,
  Printer,
  PlusCircle,
  ShieldCheck,
} from 'lucide-react';
import { CelebrationPlan } from '../types/planner';
import { formatINR } from '../utils/plannerLogic';

export type NavigationTab =
  | 'workspace'
  | 'blueprint'
  | 'budget'
  | 'checklist'
  | 'timeline'
  | 'export';

interface NavbarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  currentPlan: CelebrationPlan | null;
  onNewPlan: () => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentPlan,
  onNewPlan,
  isDark,
  setIsDark,
}) => {
  const tabs: Array<{ id: NavigationTab; label: string; shortLabel: string; icon: React.ReactNode; disabled?: boolean }> = [
    { id: 'workspace', label: 'Constraints', shortLabel: 'Inputs', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'blueprint', label: 'Blueprint', shortLabel: 'Overview', icon: <FileText className="w-3.5 h-3.5" />, disabled: !currentPlan },
    { id: 'budget', label: 'Explainable Budget', shortLabel: 'Budget', icon: <PieChart className="w-3.5 h-3.5" />, disabled: !currentPlan },
    { id: 'checklist', label: 'Vendor Checklist', shortLabel: 'Checklist', icon: <CheckSquare className="w-3.5 h-3.5" />, disabled: !currentPlan },
    { id: 'timeline', label: 'Countdown', shortLabel: 'Timeline', icon: <Clock className="w-3.5 h-3.5" />, disabled: !currentPlan },
    { id: 'export', label: 'Export & Share', shortLabel: 'Export', icon: <Printer className="w-3.5 h-3.5" />, disabled: !currentPlan },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur-md border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('workspace')}
              className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg p-0.5"
              aria-label="Celebrate AI Home"
            >
              <div className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center font-display font-semibold text-sm shadow-sm group-hover:opacity-90 transition-opacity">
                C
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-display font-bold text-lg text-text-primary tracking-tight">
                    Celebrate
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-accent bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded tracking-wide uppercase">
                    AI
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted tracking-tight mt-0.5 hidden sm:block">
                  Architectural Event Intelligence · India
                </span>
              </div>
            </button>
          </div>

          {/* Center: Quick Plan Spec / Cap Pill (Desktop) */}
          {currentPlan && (
            <div className="hidden xl:flex items-center gap-3 text-xs font-mono text-text-secondary bg-surface-2/80 px-3 py-1 rounded-md border border-border">
              <span className="font-medium text-text-primary truncate max-w-[150px]">
                {currentPlan.constraints.title || currentPlan.constraints.eventType}
              </span>
              <span className="text-border">/</span>
              <span className="tabular-nums">{currentPlan.constraints.guestCount} guests</span>
              <span className="text-border">/</span>
              <span className="font-semibold text-text-primary tabular-nums">
                {formatINR(currentPlan.constraints.budgetCap)}
              </span>
              <span className="text-border">/</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> 10% Shagun Locked
              </span>
            </div>
          )}

          {/* Right Actions: New Event + Theme Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {currentPlan && (
              <button
                onClick={onNewPlan}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-border bg-surface hover:bg-surface-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                title="Create a new celebration plan"
              >
                <PlusCircle className="w-3.5 h-3.5 text-accent" />
                <span className="hidden sm:inline">New Event</span>
              </button>
            )}

            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
            </button>
          </div>
        </div>

        {/* Segmented Control Navigation Bar */}
        <div className="border-t border-border/60 py-2">
          <nav
            className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 bg-surface-2/60 rounded-lg border border-border/60"
            aria-label="Planning steps"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? 'bg-surface text-text-primary shadow-xs border border-border/80 font-semibold'
                      : tab.disabled
                      ? 'text-text-muted/40 cursor-not-allowed opacity-40'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className={isActive ? 'text-accent' : 'text-text-muted'}>
                    {tab.icon}
                  </span>
                  <span className="hidden md:inline">{tab.label}</span>
                  <span className="md:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
