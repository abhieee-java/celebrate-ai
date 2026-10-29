import { CelebrationPlan, UserConstraints } from '../types/planner';

const STORAGE_KEY_CURRENT_PLAN = 'celebrate_ai_current_plan';
const STORAGE_KEY_SAVED_PLANS = 'celebrate_ai_saved_plans';

export function saveCurrentPlan(plan: CelebrationPlan): void {
  try {
    localStorage.setItem(STORAGE_KEY_CURRENT_PLAN, JSON.stringify(plan));
    // Also update in saved list
    const saved = getSavedPlans();
    const existingIndex = saved.findIndex((p) => p.id === plan.id);
    if (existingIndex >= 0) {
      saved[existingIndex] = plan;
    } else {
      saved.unshift(plan);
    }
    localStorage.setItem(STORAGE_KEY_SAVED_PLANS, JSON.stringify(saved.slice(0, 15)));
  } catch (e) {
    console.error('Failed to save plan to localStorage', e);
  }
}

export function getCurrentPlan(): CelebrationPlan | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_CURRENT_PLAN);
    if (!data) return null;
    return JSON.parse(data) as CelebrationPlan;
  } catch (e) {
    console.error('Failed to parse stored plan', e);
    return null;
  }
}

export function getSavedPlans(): CelebrationPlan[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SAVED_PLANS);
    if (!data) return [];
    return JSON.parse(data) as CelebrationPlan[];
  } catch (e) {
    return [];
  }
}

export function deleteSavedPlan(id: string): void {
  try {
    const saved = getSavedPlans().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_SAVED_PLANS, JSON.stringify(saved));
  } catch (e) {}
}

export const DEMO_CONSTRAINTS: UserConstraints = {
  eventType: 'wedding',
  title: 'Aarav & Meera Palace Wedding Celebration',
  guestCount: 250,
  budgetCap: 3500000, // ₹35 Lakhs
  targetDate: getFutureDate(180), // 6 months in future
  locationStyle: 'outdoor',
  city: 'Jaipur, Rajasthan',
  priorityFocus: 'culinary_delight',
  specialNotes: 'Grand Sangeet night with live Punjabi Dhol, royal Rajasthani Mandap on palace lawn, multi-cuisine royal buffet with live chaat counters.',
};

export function getFutureDate(daysInFuture: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysInFuture);
  return d.toISOString().split('T')[0];
}
