import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  IndianRupee,
  MapPin,
  AlertTriangle,
  TreePine,
  Building2,
  Tent,
  CheckCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { UserConstraints, EventType, LocationStyle, PriorityFocus } from '../types/planner';
import { getFutureDate } from '../utils/storage';
import { formatINR, formatINRCompact } from '../utils/plannerLogic';

interface ConstraintWorkspaceProps {
  onGeneratePlan: (constraints: UserConstraints) => void;
  isLoading: boolean;
  initialConstraints?: UserConstraints | null;
}

const PRESETS: Array<{
  name: string;
  tag: string;
  location: string;
  constraints: UserConstraints;
}> = [
  {
    name: 'Jaipur Royal Palace Destination Wedding',
    tag: 'Outdoor · 250 Guests · ₹45L',
    location: 'Jaipur, Rajasthan',
    constraints: {
      eventType: 'wedding',
      title: 'Aarav & Meera Royal Palace Destination Wedding',
      guestCount: 250,
      budgetCap: 4500000, // ₹45 Lakhs
      targetDate: getFutureDate(180),
      locationStyle: 'outdoor',
      city: 'Jaipur, Rajasthan',
      priorityFocus: 'culinary_delight',
      specialNotes: 'Grand Sangeet night with live Punjabi Dhol, royal Rajasthani Mandap on palace lawn, multi-cuisine royal buffet with live chaat counters.',
    },
  },
  {
    name: 'Delhi NCR Grand Farmhouse Wedding & Sangeet',
    tag: 'Outdoor · 400 Guests · ₹35L',
    location: 'Chattarpur, Delhi NCR',
    constraints: {
      eventType: 'wedding',
      title: 'Kabir & Ananya Farmhouse Celebration',
      guestCount: 400,
      budgetCap: 3500000, // ₹35 Lakhs
      targetDate: getFutureDate(150),
      locationStyle: 'outdoor',
      city: 'Chattarpur, Delhi NCR',
      priorityFocus: 'guest_experience',
      specialNotes: 'Baraat with 51 Baraatis on vintage open car, high-tech German Hanger tenting, and midnight live jalebi-rabdi stalls.',
    },
  },
  {
    name: 'Mumbai Sea-Facing Sangeet & Reception',
    tag: 'Hybrid · 200 Guests · ₹20L',
    location: 'Juhu, Mumbai',
    constraints: {
      eventType: 'birthday',
      title: 'Rohan & Priya Mumbai Coastal Celebration',
      guestCount: 200,
      budgetCap: 2000000, // ₹20 Lakhs
      targetDate: getFutureDate(120),
      locationStyle: 'hybrid',
      city: 'Juhu, Mumbai',
      priorityFocus: 'music_energy',
      specialNotes: 'Open terrace cocktail hour overlooking the Arabian sea, Bollywood Sangeet with celebrity DJ.',
    },
  },
  {
    name: 'Bengaluru Garden 1st Birthday & Naamkaran',
    tag: 'Outdoor · 100 Guests · ₹5L',
    location: 'Bengaluru, Karnataka',
    constraints: {
      eventType: 'community',
      title: 'Little Advik Grand 1st Birthday & Naamkaran',
      guestCount: 100,
      budgetCap: 500000, // ₹5 Lakhs
      targetDate: getFutureDate(60),
      locationStyle: 'outdoor',
      city: 'Bengaluru, Karnataka',
      priorityFocus: 'visual_aesthetic',
      specialNotes: 'Jungle safari yellow theme, live South Indian dosa and filter coffee counters, photo booth.',
    },
  },
];

export const ConstraintWorkspace: React.FC<ConstraintWorkspaceProps> = ({
  onGeneratePlan,
  isLoading,
  initialConstraints,
}) => {
  const [formData, setFormData] = useState<UserConstraints>(
    initialConstraints || {
      eventType: 'wedding',
      title: 'Aarav & Meera Palace Wedding Celebration',
      guestCount: 250,
      budgetCap: 3500000, // ₹35 Lakhs
      targetDate: getFutureDate(180),
      locationStyle: 'outdoor',
      city: 'Jaipur, Rajasthan',
      priorityFocus: 'culinary_delight',
      specialNotes: '',
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.title.trim()) {
      formData.title = `${formData.eventType.charAt(0).toUpperCase() + formData.eventType.slice(1)} Celebration`;
    }

    if (!formData.guestCount || formData.guestCount < 10) {
      errs.guestCount = 'Guest count must be at least 10.';
    } else if (formData.guestCount > 3000) {
      errs.guestCount = 'Guest count exceeds maximum limit (3,000).';
    }

    if (!formData.budgetCap || formData.budgetCap < 50000) {
      errs.budgetCap = 'Strict budget cap must be at least ₹50,000.';
    } else if (formData.budgetCap > 100000000) {
      errs.budgetCap = 'Budget cap exceeds ₹10 Crore limit.';
    }

    if (!formData.targetDate) {
      errs.targetDate = 'Target celebration date is required.';
    } else {
      const selected = new Date(formData.targetDate);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (selected < now) {
        errs.targetDate = 'Event date cannot be in the past.';
      }
    }

    if (!formData.city.trim()) {
      errs.city = 'City or location region is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onGeneratePlan(formData);
    }
  };

  const applyPreset = (preset: (typeof PRESETS)[0]) => {
    setFormData({ ...preset.constraints });
    setErrors({});
  };

  // Live calculations
  const perGuest = Math.round(formData.budgetCap / Math.max(1, formData.guestCount));
  const targetDateObj = new Date(formData.targetDate || new Date());
  const daysAway = Math.ceil((targetDateObj.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isExpressTimeline = daysAway <= 60 && daysAway > 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Editorial Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-surface-2 border border-border text-text-secondary text-[11px] font-mono tracking-wide uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Stage 01 · Constraint Modeling</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-text-primary tracking-tight">
          Celebration Parameters & Financial Envelope
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
          Every rupee, Shagun contingency, and ritual milestone is bound to strict Indian event benchmarks with explainable reasoning.
        </p>
      </div>

      {/* Curated Indian Celebration Presets */}
      <div className="mb-8 bg-surface border border-border rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent" /> Curated Indian Celebration Blueprints
          </span>
          <span className="text-[11px] font-mono text-text-muted">Instant Template</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-left p-3 rounded-lg bg-surface-2/60 border border-border/80 hover:border-accent hover:bg-surface hover:shadow-xs transition-all group"
            >
              <div className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors line-clamp-1">
                {preset.name}
              </div>
              <div className="text-[11px] text-text-muted mt-1 font-mono tabular-nums">
                {preset.tag}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Constraint Form */}
      <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-6 sm:p-8 shadow-xs space-y-7">
        {/* Row 1: Event Type & Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-text-secondary font-medium mb-1.5">
              Celebration Classification
            </label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value as EventType })}
              className="w-full bg-surface-2/60 border border-border rounded-lg px-3.5 py-2.5 text-text-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface transition-all"
            >
              <option value="wedding">Traditional Indian Wedding (Shaadi & Sangeet)</option>
              <option value="birthday">Grand Milestone Birthday / 1st Birthday</option>
              <option value="community">Community Utsav / Diwali / Puja Gathering</option>
              <option value="anniversary">Silver / Golden Wedding Anniversary</option>
              <option value="corporate_gala">Award Gala / Corporate Banquet</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-text-secondary font-medium mb-1.5">
              Celebration Title
            </label>
            <input
              type="text"
              placeholder="e.g. Aarav & Meera Palace Wedding Celebration"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-surface-2/60 border border-border rounded-lg px-3.5 py-2.5 text-text-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface transition-all"
            />
          </div>
        </div>

        {/* Row 2: Guest Count & Budget Cap (Hard Constraints) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-border/60">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-accent" /> Guest Count (Attendees)
              </label>
              <span className="text-xs font-bold font-mono text-accent bg-accent/10 px-2.5 py-0.5 rounded-md border border-accent/20 tabular-nums">
                {formData.guestCount} guests
              </span>
            </div>
            <input
              type="range"
              min="25"
              max="1000"
              step="25"
              value={formData.guestCount}
              onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value, 10) })}
              className="w-full accent-accent cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-text-muted mt-1.5">
              <span>Intimate (25)</span>
              <span>Grand (250)</span>
              <span>Mega Gathering (1,000)</span>
            </div>
            {errors.guestCount && <p className="text-xs text-rose-600 mt-1">{errors.guestCount}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-medium flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" /> Hard Budget Cap (INR)
              </label>
              <span className="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 tabular-nums">
                {formatINR(formData.budgetCap)} ({formatINRCompact(formData.budgetCap)})
              </span>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted text-xs font-mono">
                ₹
              </span>
              <input
                type="number"
                min="50000"
                max="100000000"
                step="50000"
                value={formData.budgetCap}
                onChange={(e) => setFormData({ ...formData, budgetCap: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-surface-2/60 border border-border rounded-lg pl-7 pr-3.5 py-2.5 text-text-primary text-xs sm:text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface"
              />
            </div>
            {/* Quick Budget Cap Presets in Lakhs & Crores */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[
                { label: '₹10L', val: 1000000 },
                { label: '₹20L', val: 2000000 },
                { label: '₹35L', val: 3500000 },
                { label: '₹50L', val: 5000000 },
                { label: '₹1 Cr', val: 10000000 },
                { label: '₹2.5 Cr', val: 25000000 },
              ].map((btn) => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => setFormData({ ...formData, budgetCap: btn.val })}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md border transition-colors tabular-nums ${
                    formData.budgetCap === btn.val
                      ? 'bg-accent text-white border-accent shadow-xs'
                      : 'bg-surface border-border text-text-secondary hover:border-text-muted hover:text-text-primary'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
            {errors.budgetCap && <p className="text-xs text-rose-600 mt-1">{errors.budgetCap}</p>}
          </div>
        </div>

        {/* Live Constraint Diagnostic Banner */}
        <div className="bg-surface-2/70 p-3.5 rounded-lg border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] text-text-secondary">Per-Attendee Plate Allowance:</span>
            <span className="font-mono font-bold text-text-primary px-2 py-0.5 rounded bg-surface border border-border text-xs tabular-nums">
              {formatINR(perGuest)} / attendee
            </span>
            <span className="text-[11px] text-text-muted">
              ({perGuest < 1200 ? 'Value banquet tier' : perGuest > 5000 ? 'Luxury 5-star palace tier' : 'Balanced premium tier'})
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-mono text-[11px]">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span>10% Shagun & Emergency Buffer ring-fenced</span>
          </div>
        </div>

        {/* Row 3: Target Date & City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-border/60">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-text-secondary font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" /> Target Shubh Muhurat Date
              </label>
              {daysAway > 0 && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    isExpressTimeline
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-300 dark:border-amber-800'
                      : 'bg-surface-2 text-text-muted border border-border'
                  }`}
                >
                  {daysAway} days away {isExpressTimeline && '⚡ Express Timeline'}
                </span>
              )}
            </div>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full bg-surface-2/60 border border-border rounded-lg px-3.5 py-2.5 text-text-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface"
            />
            {isExpressTimeline && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Under 60 days: earlier lead-time milestones will be flagged overdue for immediate action.
              </p>
            )}
            {errors.targetDate && <p className="text-xs text-rose-600 mt-1">{errors.targetDate}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-text-secondary font-medium mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-accent" /> Host City / Region in India
            </label>
            <input
              type="text"
              placeholder="e.g. Jaipur, Rajasthan; Delhi NCR; Mumbai; Bengaluru; Udaipur"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full bg-surface-2/60 border border-border rounded-lg px-3.5 py-2.5 text-text-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface"
            />
            {/* Quick Indian Cities */}
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {['Jaipur', 'Delhi NCR', 'Mumbai', 'Bengaluru', 'Udaipur', 'Hyderabad'].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setFormData({ ...formData, city })}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-border text-text-muted hover:text-text-primary hover:border-text-muted transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
            {errors.city && <p className="text-xs text-rose-600 mt-1">{errors.city}</p>}
          </div>
        </div>

        {/* Row 4: Location Style (Context Driver) */}
        <div className="pt-2 border-t border-border/60">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-text-secondary font-medium mb-2.5">
            Location Style (Drives Contingency Automation)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'outdoor' as LocationStyle,
                title: 'Open Lawns / Farmhouse',
                desc: 'Palace gardens, resort lawns, Chattarpur farmhouses',
                icon: Tent,
                badge: 'Auto-injects German hanger, 125kVA generator & fogging',
              },
              {
                id: 'indoor' as LocationStyle,
                title: 'Banquet Hall / Ballroom',
                desc: '5-star hotel ballrooms, air-conditioned banquets',
                icon: Building2,
                badge: 'Maximizes floral Mandap styling & acoustics',
              },
              {
                id: 'hybrid' as LocationStyle,
                title: 'Hybrid (Lawn + Banquet)',
                desc: 'Lawn Varmala & Pheras + AC ballroom dinner',
                icon: TreePine,
                badge: 'Includes indoor/outdoor guest transition team',
              },
            ].map((loc) => {
              const Icon = loc.icon;
              const isSelected = formData.locationStyle === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, locationStyle: loc.id })}
                  className={`text-left p-3.5 rounded-lg border text-xs sm:text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isSelected
                      ? 'bg-surface border-accent ring-1 ring-accent shadow-xs'
                      : 'bg-surface-2/60 border-border hover:border-text-muted/60 hover:bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-accent' : 'text-text-muted'}`} />
                    <span className="font-semibold text-text-primary">{loc.title}</span>
                  </div>
                  <p className="text-xs text-text-secondary mb-2 leading-relaxed">{loc.desc}</p>
                  <span className="inline-block text-[10px] font-mono font-medium text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                    {loc.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 5: Priority Focus */}
        <div className="pt-2 border-t border-border/60">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-text-secondary font-medium mb-2">
            Strategic Priority Focus
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {[
              { id: 'culinary_delight', label: 'Catering & Chaat', tip: '+Royal buffet spend' },
              { id: 'visual_aesthetic', label: 'Mandap & Floral', tip: '+Stage & fairy lights' },
              { id: 'music_energy', label: 'Baraat Dhol & DJ', tip: '+Live talent & sound' },
              { id: 'guest_experience', label: 'Guest Hospitality', tip: 'Valet & welcome team' },
              { id: 'budget_optimized', label: 'Value Maximizer', tip: 'Smart negotiation' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setFormData({ ...formData, priorityFocus: p.id as PriorityFocus })}
                className={`p-2.5 rounded-lg border text-left text-xs transition-colors focus:outline-none ${
                  formData.priorityFocus === p.id
                    ? 'bg-surface border-accent ring-1 ring-accent text-accent font-semibold shadow-xs'
                    : 'bg-surface-2/60 border-border text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                <div>{p.label}</div>
                <div className="text-[10px] text-text-muted mt-0.5 font-mono">{p.tip}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Special Notes */}
        <div className="pt-2 border-t border-border/60">
          <label className="block text-[11px] font-mono uppercase tracking-wider text-text-secondary font-medium mb-1.5">
            Special Notes or Family Traditions (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Pure vegetarian Jain food counters, late-night pheras at 2:00 AM, special safa cloth from Jodhpur, live Shehnai at dawn..."
            value={formData.specialNotes || ''}
            onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
            className="w-full bg-surface-2/60 border border-border rounded-lg px-3.5 py-2 text-text-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:bg-surface resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-text-muted flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="text-[11px]">Coordinates Budget, Checklist & Timeline agents for Indian celebration standards.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium text-xs sm:text-sm shadow-xs transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Synthesizing Blueprint...' : 'Generate Explainable Indian Blueprint'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
