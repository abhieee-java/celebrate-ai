import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateInitialBudgetShares,
  buildBudgetBreakdown,
  rebalanceCategories,
  buildContextAwareChecklist,
  buildMilestoneTimeline,
  calculateSpendingHealth,
  formatINR,
  formatINRCompact,
  SAFETY_BUFFER_PERCENT,
} from './plannerLogic';
import { UserConstraints } from '../types/planner';

const baseConstraints: UserConstraints = {
  eventType: 'wedding',
  title: 'Aarav & Meera Palace Wedding Celebration',
  guestCount: 250,
  budgetCap: 3500000, // ₹35 Lakhs
  targetDate: '2027-04-18',
  locationStyle: 'outdoor',
  city: 'Jaipur, Rajasthan',
  priorityFocus: 'culinary_delight',
};

test('Indian Rupee formatting complies with Lakhs & Crores format', () => {
  assert.equal(formatINR(3500000), '₹35,00,000');
  assert.equal(formatINRCompact(3500000), '₹35 Lakh');
  assert.equal(formatINRCompact(15000000), '₹1.5 Cr');
  assert.equal(formatINR(25000), '₹25,000');
});

test('Budget shares sum exactly to 90% (leaving 10% for safety buffer)', () => {
  const shares = calculateInitialBudgetShares(baseConstraints);
  const sum = Object.values(shares).reduce((a, b) => a + b, 0);
  assert.equal(Math.round(sum), 90);
});

test('buildBudgetBreakdown enforces hard budget cap and 10% Shagun safety buffer', () => {
  const breakdown = buildBudgetBreakdown(baseConstraints);
  assert.equal(breakdown.safetyBuffer.percentage, SAFETY_BUFFER_PERCENT);
  assert.equal(breakdown.safetyBuffer.amount, 350000); // 10% of ₹35,00,000

  const categoriesSum = breakdown.categories.reduce((acc, cat) => acc + cat.amount, 0);
  assert.equal(categoriesSum + breakdown.safetyBuffer.amount, 3500000);
  assert.equal(breakdown.hardConstraintEnforced, true);
});

test('Slider rebalancing adjusts remaining categories while keeping 10% buffer and 100% total', () => {
  const initialBreakdown = buildBudgetBreakdown(baseConstraints);
  const updatedCategories = rebalanceCategories(
    initialBreakdown.categories,
    'catering',
    42,
    baseConstraints.budgetCap,
    baseConstraints
  );

  const cateringCat = updatedCategories.find((c) => c.id === 'catering');
  assert.equal(cateringCat?.percentage, 42);

  const totalCatPercentage = updatedCategories.reduce((acc, cat) => acc + cat.percentage, 0);
  assert.equal(Math.round(totalCatPercentage), 90);

  updatedCategories.forEach((cat) => {
    assert.ok(cat.reasoning.length > 20, `Category ${cat.name} must have substantive reasoning`);
  });
});

test('Spending health indicator computes healthy score for balanced Indian allocation', () => {
  const breakdown = buildBudgetBreakdown(baseConstraints);
  const health = calculateSpendingHealth(breakdown.categories, baseConstraints);

  assert.ok(health.score >= 80, `Healthy baseline score should be >= 80, got ${health.score}`);
  assert.equal(health.overallStatus, 'healthy');
  assert.equal(health.highRiskCount, 0);
});

test('Spending health indicator detects high risk when critical categories are distorted', () => {
  const breakdown = buildBudgetBreakdown(baseConstraints);
  // Distort catering to only 15% (dangerous underfunding in India)
  const distortedCategories = rebalanceCategories(
    breakdown.categories,
    'catering',
    15,
    baseConstraints.budgetCap,
    baseConstraints
  );

  const health = calculateSpendingHealth(distortedCategories, baseConstraints);
  assert.ok(health.highRiskCount > 0, 'Should detect at least 1 high-risk category when catering is 15%');
  const cateringStatus = health.categories.find((c) => c.categoryId === 'catering');
  assert.equal(cateringStatus?.status, 'high_risk');
  assert.ok(cateringStatus?.riskMessage?.includes('Critical Risk'));
});

test('Outdoor setting auto-injects weather contingency and 125kVA generator checklist items', () => {
  const checklist = buildContextAwareChecklist({
    ...baseConstraints,
    locationStyle: 'outdoor',
  });

  const tentItem = checklist.find((item) => item.id === 'outdoor-tent-rental');
  assert.ok(tentItem, 'Tent rental must be added for outdoor events');
  assert.ok(tentItem.whyThisWasAdded.includes('Outdoor lawn setting selected'));

  const generatorItem = checklist.find((item) => item.id === 'outdoor-power-generator');
  assert.ok(generatorItem, 'Generator must be added for outdoor events');

  const soundNocItem = checklist.find((item) => item.id === 'outdoor-sound-noc');
  assert.ok(soundNocItem, 'Sound NOC must be added for outdoor Indian events');
});

test('Large guest count (>150) auto-injects crowd valet and extra chaat live stations', () => {
  const checklist = buildContextAwareChecklist({
    ...baseConstraints,
    guestCount: 300,
  });

  const valet = checklist.find((item) => item.id === 'crowd-valet-marshals');
  assert.ok(valet, 'Valet marshals must be included for >150 guests');

  const chaat = checklist.find((item) => item.id === 'extra-chaat-counters');
  assert.ok(chaat, 'Extra chaat counters must be added for high guest count');
});

test('Timeline flags overdue milestones when event date is close', () => {
  const closeEventDate = '2026-12-28';
  const fakeCurrentDate = new Date('2026-10-28T12:00:00Z');

  const timeline = buildMilestoneTimeline(closeEventDate, fakeCurrentDate);

  const t12m = timeline.find((m) => m.id === 't-12m');
  assert.ok(t12m?.isOverdue, 'T-12m milestone must be flagged overdue when event is in 60 days');
  assert.ok(t12m?.leadTimeReasoning.includes('URGENT CATCH-UP'));

  const t6m = timeline.find((m) => m.id === 't-6m');
  assert.ok(t6m?.isOverdue, 'T-6m milestone must be flagged overdue');

  const farEventDate = '2028-05-01';
  const farTimeline = buildMilestoneTimeline(farEventDate, fakeCurrentDate);
  const overdueCount = farTimeline.filter((m) => m.isOverdue).length;
  assert.equal(overdueCount, 0, 'No milestones should be overdue when event is 18 months away');
});
