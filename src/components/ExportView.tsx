import React, { useState } from 'react';
import {
  Printer,
  Copy,
  Download,
  Upload,
  Check,
  FileText,
  ShieldCheck,
  MapPin,
  Calendar,
  Users,
} from 'lucide-react';
import { CelebrationPlan } from '../types/planner';
import { formatINR } from '../utils/plannerLogic';

interface ExportViewProps {
  plan: CelebrationPlan;
  onImportPlan: (plan: CelebrationPlan) => void;
}

export const ExportView: React.FC<ExportViewProps> = ({ plan, onImportPlan }) => {
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const { constraints, budgetBreakdown, vendorChecklist, timeline, dynamicReasoning } = plan;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = async () => {
    const summaryText = `
CELEBRATE AI — EXPLAINABLE INDIAN BLUEPRINT
========================================
Event: ${constraints.title || constraints.eventType}
Event Type: ${constraints.eventType.toUpperCase()}
Location: ${constraints.city} (${constraints.locationStyle})
Target Date: ${constraints.targetDate}
Guest Count: ${constraints.guestCount} guests
Hard Budget Cap: ${formatINR(constraints.budgetCap)}
10% Inviolable Shagun Buffer: ${formatINR(budgetBreakdown.safetyBuffer.amount)}
Per-Attendee Allowance: ${formatINR(budgetBreakdown.perGuestCost)}/attendee

BUDGET BREAKDOWN & EXPLAINABILITY
--------------------------------
${budgetBreakdown.categories
  .map(
    (c) =>
      `• ${c.name}: ${c.percentage}% (${formatINR(c.amount)})\n  Why: ${c.reasoning}`
  )
  .join('\n\n')}
• Shagun & Emergency Buffer: 10% (${formatINR(budgetBreakdown.safetyBuffer.amount)})\n  Why: ${budgetBreakdown.safetyBuffer.reasoning}

CRITICAL CONTEXT TASKS & CONTINGENCIES
-------------------------------------
${vendorChecklist
  .filter((i) => i.isContextSpecific)
  .map((i) => `• [${i.contextTag || 'Context'}] ${i.title}\n  Why added: ${i.whyThisWasAdded}`)
  .join('\n')}

COUNTDOWN MILESTONES & LEAD TIMES
---------------------------------
${timeline
  .map(
    (m) =>
      `• ${m.timeframe} (${m.targetDate}): ${m.title}${m.isOverdue ? ' [OVERDUE]' : ''}\n  Lead-time rationale: ${m.leadTimeReasoning}`
  )
  .join('\n')}

DYNAMIC TRADE-OFF SUMMARY
------------------------
${dynamicReasoning.headline}
${dynamicReasoning.summary}

Trade-offs Made:
${dynamicReasoning.tradeoffsMade
  .map((t, idx) => `${idx + 1}. ${t.decision}\n   Why: ${t.why}\n   Impact: ${t.impact}`)
  .join('\n')}
`.trim();

    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `celebrate-ai-plan-${constraints.eventType}-${constraints.targetDate}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.constraints && parsed.budgetBreakdown && parsed.vendorChecklist && parsed.timeline) {
          onImportPlan(parsed);
        } else {
          setImportError('Invalid plan file structure.');
        }
      } catch (err) {
        setImportError('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Action Header (Hidden during actual print) */}
      <div className="no-print bg-surface p-5 sm:p-6 rounded-xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-2 border border-border text-text-secondary text-[11px] font-mono tracking-wide uppercase mb-2">
            <Printer className="w-3.5 h-3.5 text-accent" />
            <span>Stage 05 · Archival Documentation Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-text-primary tracking-tight">
            Print, Share or Backup Your Blueprint
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-1 max-w-xl">
            Generate an executive printable brief, copy an explainable summary, or backup as portable JSON.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Brief</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-2 text-xs font-mono font-medium text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-accent" />}
            <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-2 text-xs font-mono font-medium text-text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>Download JSON</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface hover:bg-surface-2 text-xs font-mono font-medium text-text-primary cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-accent">
            <Upload className="w-3.5 h-3.5 text-accent" />
            <span>Restore Plan</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {importError && (
        <div className="no-print p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {importError}
        </div>
      )}

      {/* Printable Master Document */}
      <div className="bg-surface rounded-xl border border-border p-6 sm:p-10 shadow-xs space-y-7 print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b border-border pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-bold text-xl tracking-tight text-text-primary">
                Celebrate<span className="text-accent italic font-medium ml-0.5">AI</span>
              </span>
              <span className="text-[9px] font-mono uppercase tracking-widest text-text-muted border border-border px-1.5 py-0.2 rounded">
                Master Blueprint
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-text-primary">
              {constraints.title || `${constraints.eventType} Celebration`}
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              Generated: {new Date(plan.createdAt).toLocaleDateString()} · Engine: {plan.source === 'ai_orchestrated' ? 'AI Orchestrated' : 'Domain Rules Engine'}
            </p>
          </div>

          <div className="text-left sm:text-right font-mono text-xs space-y-1">
            <div className="text-text-muted text-[10px] uppercase tracking-wider">Hard Budget Cap:</div>
            <div className="text-xl font-bold text-accent tabular-nums">
              {formatINR(constraints.budgetCap)}
            </div>
            <div className="text-emerald-700 dark:text-emerald-400 font-medium text-[11px]">
              Includes {formatINR(budgetBreakdown.safetyBuffer.amount)} (10%) Shagun Buffer
            </div>
          </div>
        </div>

        {/* Constraints Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-surface-2/60 border border-border text-xs">
          <div>
            <span className="font-mono uppercase tracking-wider text-[9px] text-text-muted block">Event Type</span>
            <strong className="text-text-primary capitalize">{constraints.eventType}</strong>
          </div>
          <div>
            <span className="font-mono uppercase tracking-wider text-[9px] text-text-muted block">Guest Count</span>
            <strong className="text-text-primary tabular-nums">{constraints.guestCount} attendees</strong>
          </div>
          <div>
            <span className="font-mono uppercase tracking-wider text-[9px] text-text-muted block">Location Style</span>
            <strong className="text-text-primary capitalize">{constraints.locationStyle}</strong>
          </div>
          <div>
            <span className="font-mono uppercase tracking-wider text-[9px] text-text-muted block">Target Date</span>
            <strong className="text-text-primary">{constraints.targetDate}</strong>
          </div>
        </div>

        {/* Section 1: Explainable Budget Allocations */}
        <div className="space-y-3 break-inside-avoid">
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <h3 className="font-display font-bold text-sm sm:text-base text-text-primary">
              1. Explainable Budget Allocations
            </h3>
            <span className="text-xs font-mono text-text-muted tabular-nums">
              Total: {formatINR(constraints.budgetCap)}
            </span>
          </div>

          <div className="space-y-2">
            {budgetBreakdown.categories.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border border-border/80 bg-surface-2/30 text-xs space-y-1">
                <div className="flex justify-between items-center font-semibold text-text-primary">
                  <span>{c.name}</span>
                  <span className="font-mono text-accent tabular-nums">
                    {c.percentage}% · {formatINR(c.amount)}
                  </span>
                </div>
                <p className="text-text-secondary leading-relaxed font-normal text-xs">
                  <strong className="font-mono text-[9px] uppercase text-text-muted">Why: </strong>
                  {c.reasoning}
                </p>
              </div>
            ))}

            <div className="p-3 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs space-y-1">
              <div className="flex justify-between items-center font-semibold text-emerald-900 dark:text-emerald-200">
                <span>10% Shagun & Emergency Buffer (Inviolable Reserve)</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
                  10% · {formatINR(budgetBreakdown.safetyBuffer.amount)}
                </span>
              </div>
              <p className="text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed font-normal text-xs">
                {budgetBreakdown.safetyBuffer.reasoning}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Context-Aware Vendor Checklist */}
        <div className="space-y-3 break-inside-avoid">
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <h3 className="font-display font-bold text-sm sm:text-base text-text-primary">
              2. Context-Aware Vendor Checklist & Contingency Audit
            </h3>
            <span className="text-xs font-mono text-text-muted">
              {vendorChecklist.filter((i) => i.isContextSpecific).length} Contextual Items
            </span>
          </div>

          <div className="space-y-2">
            {vendorChecklist.map((item) => (
              <div key={item.id} className="p-2.5 rounded-lg border border-border/80 bg-surface-2/30 text-xs space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-text-primary">
                    [{item.completed ? 'COMPLETED' : 'PENDING'}] {item.title}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.isContextSpecific && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-accent/10 text-accent font-semibold">
                        {item.contextTag || 'Context Specific'}
                      </span>
                    )}
                    <span className="text-[10px] font-mono text-text-muted">
                      {item.timelinePhase}
                    </span>
                  </div>
                </div>
                <p className="text-text-secondary text-[11px] leading-relaxed">
                  <strong className="font-mono text-[9px] text-text-muted uppercase">Why added: </strong>
                  {item.whyThisWasAdded}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Reverse Countdown Timeline */}
        <div className="space-y-3 break-inside-avoid">
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <h3 className="font-display font-bold text-sm sm:text-base text-text-primary">
              3. Reverse-Engineered Timeline & Lead Times
            </h3>
            <span className="text-xs font-mono text-text-muted">
              Lead times from {constraints.targetDate}
            </span>
          </div>

          <div className="space-y-2">
            {timeline.map((m) => (
              <div
                key={m.id}
                className={`p-2.5 rounded-lg border text-xs space-y-0.5 ${
                  m.isOverdue
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20'
                    : 'border-border/80 bg-surface-2/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary">
                    {m.timeframe} ({m.targetDate}): {m.title}
                  </span>
                  {m.isOverdue && (
                    <span className="text-[9px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.2 rounded">
                      ⚠️ OVERDUE ACTION
                    </span>
                  )}
                </div>
                <p className="text-text-secondary text-[11px]">
                  <strong className="font-mono text-[9px] text-text-muted uppercase">Lead-Time Rationale: </strong>
                  {m.leadTimeReasoning}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Sign-Off Acceptance Block for Events */}
        <div className="pt-6 border-t border-border grid grid-cols-2 gap-8 text-xs break-inside-avoid">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-6">
              Client & Host Acceptance
            </div>
            <div className="border-b border-border/80 w-3/4 mb-1" />
            <div className="text-[11px] text-text-muted font-mono">Date / Signature</div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-6">
              Lead Event Architect Acceptance
            </div>
            <div className="border-b border-border/80 w-3/4 mb-1" />
            <div className="text-[11px] text-text-muted font-mono">Date / Signature</div>
          </div>
        </div>
      </div>
    </div>
  );
};
