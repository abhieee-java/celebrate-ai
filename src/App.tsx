/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, NavigationTab } from './components/Navbar';
import { ConstraintWorkspace } from './components/ConstraintWorkspace';
import { BlueprintSummary } from './components/BlueprintSummary';
import { BudgetAllocator } from './components/BudgetAllocator';
import { VendorChecklist } from './components/VendorChecklist';
import { MilestoneTimeline } from './components/MilestoneTimeline';
import { ExportView } from './components/ExportView';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import {
  CelebrationPlan,
  UserConstraints,
  BudgetCategory,
  ChecklistItem
} from './types/planner';
import {
  getCurrentPlan,
  saveCurrentPlan,
  DEMO_CONSTRAINTS
} from './utils/storage';
import { generatePlanFromRules } from './utils/plannerLogic';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export default function App() {
  const [currentPlan, setCurrentPlan] = useState<CelebrationPlan | null>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>('workspace');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dark mode setup
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('celebrate_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('celebrate_theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('celebrate_theme', 'light');
    }
  }, [isDark]);

  // Load stored plan on mount, or seed demo plan if first visit
  useEffect(() => {
    const saved = getCurrentPlan();
    if (saved) {
      setCurrentPlan(saved);
      setActiveTab('blueprint');
    } else {
      // First visit: create initial demo plan so users can immediately experience the app
      const initialPlan = generatePlanFromRules(DEMO_CONSTRAINTS);
      setCurrentPlan(initialPlan);
      saveCurrentPlan(initialPlan);
      setActiveTab('blueprint');
    }
  }, []);

  // Generate Plan Handler via Orchestrator
  const handleGeneratePlan = async (constraints: UserConstraints) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(constraints),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const plan: CelebrationPlan = await response.json();
      setCurrentPlan(plan);
      saveCurrentPlan(plan);
      setActiveTab('blueprint');
    } catch (err: any) {
      console.warn('API error, falling back to expert rules engine:', err);
      // Defensive fallback
      const fallbackPlan = generatePlanFromRules(constraints);
      setCurrentPlan(fallbackPlan);
      saveCurrentPlan(fallbackPlan);
      setActiveTab('blueprint');
    } finally {
      setIsLoading(false);
    }
  };

  // Rebalance Budget Category Allocations
  const handleUpdateCategories = (categories: BudgetCategory[]) => {
    if (!currentPlan) return;

    const allocatedSum = categories.reduce((sum, c) => sum + c.amount, 0);
    const updatedPlan: CelebrationPlan = {
      ...currentPlan,
      updatedAt: new Date().toISOString(),
      budgetBreakdown: {
        ...currentPlan.budgetBreakdown,
        categories,
        allocatedCategoriesTotal: allocatedSum,
      },
    };

    setCurrentPlan(updatedPlan);
    saveCurrentPlan(updatedPlan);
  };

  // Reset to AI Baseline
  const handleResetBaseline = () => {
    if (!currentPlan) return;
    const freshPlan = generatePlanFromRules(currentPlan.constraints);
    setCurrentPlan(freshPlan);
    saveCurrentPlan(freshPlan);
  };

  // Toggle Checklist Item Completion
  const handleToggleChecklistItem = (id: string) => {
    if (!currentPlan) return;

    const updatedChecklist = currentPlan.vendorChecklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );

    const updatedPlan: CelebrationPlan = {
      ...currentPlan,
      updatedAt: new Date().toISOString(),
      vendorChecklist: updatedChecklist,
    };

    setCurrentPlan(updatedPlan);
    saveCurrentPlan(updatedPlan);
  };

  // Add Custom Checklist Item
  const handleAddChecklistItem = (item: ChecklistItem) => {
    if (!currentPlan) return;

    const updatedChecklist = [item, ...currentPlan.vendorChecklist];
    const updatedPlan: CelebrationPlan = {
      ...currentPlan,
      updatedAt: new Date().toISOString(),
      vendorChecklist: updatedChecklist,
    };

    setCurrentPlan(updatedPlan);
    saveCurrentPlan(updatedPlan);
  };

  // Import JSON Plan
  const handleImportPlan = (importedPlan: CelebrationPlan) => {
    setCurrentPlan(importedPlan);
    saveCurrentPlan(importedPlan);
    setActiveTab('blueprint');
  };

  // Start New Event
  const handleNewPlan = () => {
    setActiveTab('workspace');
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col transition-colors duration-200">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPlan={currentPlan}
        onNewPlan={handleNewPlan}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Main Content Area */}
      <main className="flex-1 py-4 sm:py-6">
        {errorMessage && (
          <div className="max-w-4xl mx-auto px-4 mb-6">
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="font-mono underline text-xs ml-4"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {activeTab === 'workspace' && (
              <ConstraintWorkspace
                onGeneratePlan={handleGeneratePlan}
                isLoading={isLoading}
                initialConstraints={currentPlan?.constraints}
              />
            )}

            {activeTab === 'blueprint' && currentPlan && (
              <BlueprintSummary
                plan={currentPlan}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'budget' && currentPlan && (
              <BudgetAllocator
                budgetBreakdown={currentPlan.budgetBreakdown}
                constraints={currentPlan.constraints}
                onUpdateCategories={handleUpdateCategories}
                onResetBaseline={handleResetBaseline}
              />
            )}

            {activeTab === 'checklist' && currentPlan && (
              <VendorChecklist
                checklist={currentPlan.vendorChecklist}
                constraints={currentPlan.constraints}
                onToggleItem={handleToggleChecklistItem}
                onAddItem={handleAddChecklistItem}
              />
            )}

            {activeTab === 'timeline' && currentPlan && (
              <MilestoneTimeline
                timeline={currentPlan.timeline}
                constraints={currentPlan.constraints}
              />
            )}

            {activeTab === 'export' && currentPlan && (
              <ExportView
                plan={currentPlan}
                onImportPlan={handleImportPlan}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-border/80 py-6 text-center text-xs text-text-muted transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>Celebrate AI · Explainable GenAI Celebration & Event Planner</span>
          </div>
          <div className="text-[11px] font-mono">
            Strict Budget Enforcement · Context Contingencies · Reverse Timelines
          </div>
        </div>
      </footer>
    </div>
  );
}
