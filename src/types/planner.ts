export type EventType =
  | 'wedding'
  | 'birthday'
  | 'community'
  | 'anniversary'
  | 'corporate_gala';

export type LocationStyle = 'indoor' | 'outdoor' | 'hybrid';

export type PriorityFocus =
  | 'guest_experience'
  | 'culinary_delight'
  | 'visual_aesthetic'
  | 'budget_optimized'
  | 'music_energy';

export interface UserConstraints {
  eventType: EventType;
  title: string;
  guestCount: number;
  budgetCap: number; // Hard ceiling
  targetDate: string; // YYYY-MM-DD
  locationStyle: LocationStyle;
  city: string;
  priorityFocus: PriorityFocus;
  specialNotes?: string;
}

export interface BudgetSubItem {
  name: string;
  estimatedCost: number;
  note: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  percentage: number; // e.g. 35 for 35%
  amount: number;
  reasoning: string;
  subItems: BudgetSubItem[];
  color: string;
  iconName: string;
}

export interface SafetyBuffer {
  percentage: number; // Always 10%
  amount: number;
  reasoning: string;
}

export interface CategoryHealthStatus {
  categoryId: string;
  categoryName: string;
  currentPercentage: number;
  benchmarkPercentage: number;
  benchmarkRange: [number, number];
  status: 'healthy' | 'caution' | 'high_risk';
  deviation: number;
  riskMessage: string | null;
}

export interface SpendingHealthReport {
  score: number; // 0 to 100
  overallStatus: 'healthy' | 'moderate_risk' | 'high_risk';
  summary: string;
  highRiskCount: number;
  cautionCount: number;
  categories: CategoryHealthStatus[];
}

export interface BudgetBreakdown {
  totalBudget: number;
  allocatedCategoriesTotal: number;
  safetyBuffer: SafetyBuffer;
  categories: BudgetCategory[];
  perGuestCost: number;
  budgetHealth: 'balanced' | 'stretched' | 'comfortable';
  hardConstraintEnforced: boolean;
}

export interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  whyThisWasAdded: string; // The explicit "Why"
  isContextSpecific: boolean;
  contextTag?: string; // e.g. "Outdoor Contingency", "High Capacity Guardrail", "City Permit"
  priority: 'must_have' | 'recommended' | 'optional';
  completed: boolean;
  estimatedCost?: number;
  timelinePhase: string;
}

export interface TimelineMilestone {
  id: string;
  timeframe: string; // e.g. "T-12 Months", "T-6 Months", "T-1 Month", "Day-Of"
  targetDate: string; // YYYY-MM-DD
  daysRemaining: number;
  isOverdue: boolean;
  title: string;
  description: string;
  leadTimeReasoning: string; // Explainable lead-time why
  keyTasks: string[];
  status: 'completed' | 'in_progress' | 'upcoming' | 'overdue';
}

export interface Tradeoff {
  decision: string;
  why: string;
  impact: string;
}

export interface DynamicReasoning {
  headline: string;
  summary: string;
  tradeoffsMade: Tradeoff[];
  contingencyStrategy: string;
  perGuestBenchmark: string;
  aiRationaleHighlights: string[];
}

export interface CelebrationPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  constraints: UserConstraints;
  budgetBreakdown: BudgetBreakdown;
  vendorChecklist: ChecklistItem[];
  timeline: TimelineMilestone[];
  dynamicReasoning: DynamicReasoning;
  source: 'ai_orchestrated' | 'expert_rules_engine';
}
