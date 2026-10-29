import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Sparkles,
  Plus,
  Tent,
  Users,
  CheckCircle2,
  Search,
  HelpCircle,
} from 'lucide-react';
import { ChecklistItem, UserConstraints } from '../types/planner';

interface VendorChecklistProps {
  checklist: ChecklistItem[];
  constraints: UserConstraints;
  onToggleItem: (id: string) => void;
  onAddItem: (item: ChecklistItem) => void;
}

export const VendorChecklist: React.FC<VendorChecklistProps> = ({
  checklist,
  constraints,
  onToggleItem,
  onAddItem,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'context' | 'must_have' | 'completed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Venue');
  const [newWhy, setNewWhy] = useState('');
  const [newPriority, setNewPriority] = useState<'must_have' | 'recommended' | 'optional'>('must_have');

  const categories = Array.from(new Set(checklist.map((item) => item.category)));

  // Progress metrics
  const totalTasks = checklist.length;
  const completedTasks = checklist.filter((item) => item.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const contextSpecificCount = checklist.filter((item) => item.isContextSpecific).length;

  // Filtered tasks
  const filteredTasks = checklist.filter((item) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.whyThisWasAdded.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // Tab filter
    if (selectedFilter === 'context') return item.isContextSpecific;
    if (selectedFilter === 'must_have') return item.priority === 'must_have';
    if (selectedFilter === 'completed') return item.completed;
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: ChecklistItem = {
      id: `custom-task-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      whyThisWasAdded: newWhy.trim() || `Host customized task for ${constraints.title || constraints.eventType}`,
      isContextSpecific: false,
      contextTag: 'Host Custom',
      priority: newPriority,
      completed: false,
      timelinePhase: 'T-1 Month',
    };

    onAddItem(newTask);
    setNewTitle('');
    setNewWhy('');
    setIsAddingTask(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-2 border border-border text-text-secondary text-[11px] font-mono tracking-wide uppercase mb-2">
            <CheckSquare className="w-3.5 h-3.5 text-accent" />
            <span>Stage 03 · Contextual Operational Checklist</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary tracking-tight">
            Vendor Execution & Contingency Audit
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
            Every vendor and operational milestone is tied to your event location ({constraints.locationStyle}), guest volume ({constraints.guestCount} attendees), and budget envelope.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingTask(!isAddingTask)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* Progress & Context Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface p-4 sm:p-5 rounded-xl border border-border shadow-xs">
        {/* Completion Progress */}
        <div className="sm:col-span-2 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="font-semibold text-text-primary text-[11px]">Execution Readiness Progress</span>
            <span className="text-accent font-bold tabular-nums text-xs">
              {completedTasks} of {totalTasks} locked ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden border border-border">
            <div
              className="h-full bg-accent rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-text-muted">
            {completedTasks === totalTasks
              ? 'All critical vendor bookings and logistics preparations completed.'
              : `${totalTasks - completedTasks} operational tasks pending confirmation.`}
          </p>
        </div>

        {/* Context Items Counter */}
        <div className="p-3 bg-surface-2/60 rounded-lg border border-border/80 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-text-primary">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>{contextSpecificCount} Context-Injected Tasks</span>
          </div>
          <div className="text-[11px] text-text-secondary mt-1.5 space-y-0.5">
            {constraints.locationStyle === 'outdoor' && (
              <div className="flex items-center gap-1 text-accent font-medium">
                <Tent className="w-3 h-3" /> Outdoor German hanger & generator active
              </div>
            )}
            {constraints.guestCount > 100 && (
              <div className="flex items-center gap-1 text-text-secondary">
                <Users className="w-3 h-3" /> High-volume guest marshals active
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Task Addition Modal / Drawer */}
      {isAddingTask && (
        <form
          onSubmit={handleCreateTask}
          className="bg-surface rounded-xl border border-accent/40 p-4 sm:p-5 shadow-xs space-y-3.5"
        >
          <div className="flex justify-between items-center pb-2 border-b border-border/70">
            <h4 className="text-xs sm:text-sm font-semibold text-text-primary flex items-center gap-2">
              <Plus className="w-4 h-4 text-accent" /> Add Host Custom Task
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="text-xs text-text-muted hover:text-text-primary"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-mono uppercase tracking-wider text-text-secondary mb-1">
                Task Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Confirm heirloom unity candle arrangement"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-surface-2/60 border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-text-secondary mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full bg-surface-2/60 border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Venue">Venue</option>
                <option value="Catering">Catering</option>
                <option value="Decor">Decor</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Photography">Photography</option>
                <option value="Logistics">Logistics</option>
                <option value="Guest Care">Guest Care</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-text-secondary mb-1">
              Why is this required? (Explainable rationale)
            </label>
            <input
              type="text"
              placeholder="e.g. Critical family ritual required before ceremony start"
              value={newWhy}
              onChange={(e) => setNewWhy(e.target.value)}
              className="w-full bg-surface-2/60 border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-3 py-1.5 rounded-md border border-border text-xs text-text-secondary hover:bg-surface-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover"
            >
              Save Task
            </button>
          </div>
        </form>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface p-3 rounded-xl border border-border shadow-xs">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {[
            { id: 'all', label: `All (${totalTasks})` },
            { id: 'context', label: `Context Injected (${contextSpecificCount})` },
            { id: 'must_have', label: 'Must-Have' },
            { id: 'completed', label: `Completed (${completedTasks})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id as any)}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium whitespace-nowrap transition-colors ${
                selectedFilter === tab.id
                  ? 'bg-accent text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search checklist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-2/60 border border-border rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface-2/60 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-xl border border-border p-6">
            <CheckCircle2 className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-text-primary">No tasks matching current filter.</p>
            <p className="text-xs text-text-muted mt-1">Try resetting the category or search query.</p>
          </div>
        ) : (
          filteredTasks.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                item.completed
                  ? 'bg-surface/50 border-border/60 opacity-70'
                  : item.isContextSpecific
                  ? 'bg-surface border-amber-300 dark:border-amber-900/60 shadow-xs'
                  : 'bg-surface border-border shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Toggle Button */}
                <button
                  type="button"
                  onClick={() => onToggleItem(item.id)}
                  className="mt-0.5 text-text-muted hover:text-accent focus:outline-none transition-colors"
                  aria-label={item.completed ? `Mark ${item.title} as incomplete` : `Mark ${item.title} as completed`}
                >
                  {item.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                {/* Task Content */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`text-xs sm:text-sm font-medium transition-all ${
                        item.completed ? 'line-through text-text-muted' : 'text-text-primary'
                      }`}
                    >
                      {item.title}
                    </span>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Context Tag Badge */}
                      {item.isContextSpecific && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                          <span>{item.contextTag || 'Context Specific'}</span>
                        </span>
                      )}

                      {/* Category Tag */}
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-2 text-text-secondary border border-border">
                        {item.category}
                      </span>

                      {/* Timeline Phase */}
                      <span className="text-[10px] font-mono text-text-muted">
                        {item.timelinePhase}
                      </span>
                    </div>
                  </div>

                  {/* Context "Why" Card */}
                  <div className="bg-surface-2/60 p-2.5 rounded-lg border-l-2 border-l-accent/80 border-y border-r border-border/70 text-xs flex items-start gap-2">
                    <HelpCircle className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-text-muted font-semibold mr-1.5">
                        Context Reason:
                      </span>
                      <span className="text-text-secondary font-normal text-xs">{item.whyThisWasAdded}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
