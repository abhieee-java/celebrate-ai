import {
  UserConstraints,
  BudgetBreakdown,
  BudgetCategory,
  ChecklistItem,
  TimelineMilestone,
  CelebrationPlan,
  DynamicReasoning,
  CategoryHealthStatus,
  SpendingHealthReport,
} from '../types/planner';

export const SAFETY_BUFFER_PERCENT = 10;

/**
 * Formats a number in Indian Rupee format (e.g. ₹25,00,000)
 */
export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Formats a number in compact Indian Rupee format (e.g. ₹25 Lakhs, ₹1.5 Cr, ₹75k)
 */
export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    const cr = (amount / 10000000).toFixed(2).replace(/\.?0+$/, '');
    return `₹${cr} Cr`;
  }
  if (amount >= 100000) {
    const lakh = (amount / 100000).toFixed(2).replace(/\.?0+$/, '');
    return `₹${lakh} Lakh`;
  }
  if (amount >= 1000) {
    return `₹${Math.round(amount / 1000)}k`;
  }
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export const STANDARD_CATEGORIES: Array<{
  id: string;
  name: string;
  defaultShare: number; // Percentage out of 90%
  color: string;
  iconName: string;
}> = [
  { id: 'venue', name: 'Venue, Lawns & Banquets', defaultShare: 26, color: '#c45b24', iconName: 'Building' },
  { id: 'catering', name: 'Catering, Mithai & Live Counters', defaultShare: 36, color: '#d97706', iconName: 'Utensils' },
  { id: 'decor', name: 'Mandap, Floral Styling & Lighting', defaultShare: 13, color: '#b38029', iconName: 'Sparkles' },
  { id: 'entertainment', name: 'Dhol, DJ, Sangeet & Sound', defaultShare: 7, color: '#2563eb', iconName: 'Music' },
  { id: 'media', name: 'Candid Photo & Cinematography', defaultShare: 5, color: '#7c3aed', iconName: 'Camera' },
  { id: 'logistics', name: 'Pandit, Baraat, Valet & Permits', defaultShare: 3, color: '#059669', iconName: 'ClipboardCheck' },
];

/**
 * Industry benchmarks tailored for Indian celebration & wedding cost structures
 */
export const INDUSTRY_BENCHMARKS: Record<
  string,
  {
    name: string;
    targetPercent: number;
    minHealthy: number;
    maxHealthy: number;
    underRisk: string;
    overRisk: string;
  }
> = {
  venue: {
    name: 'Venue, Lawns & Banquets',
    targetPercent: 26,
    minHealthy: 18,
    maxHealthy: 36,
    underRisk: 'Underfunded: May not cover prime lawn hire, mandatory power load, and bridal suite facilities in high-demand Indian cities.',
    overRisk: 'High Risk: Venue takes >36% of total funds, severely squeezing catering and floral/Mandap decor.',
  },
  catering: {
    name: 'Catering, Mithai & Live Counters',
    targetPercent: 36,
    minHealthy: 26,
    maxHealthy: 48,
    underRisk: 'Critical Risk: Food & beverage allowance drops dangerously low per plate; risks inadequate live counters or compromised menu variety.',
    overRisk: 'Overallocated: Catering exceeds 48% of budget, restricting funds for photography, sound, and Mandap styling.',
  },
  decor: {
    name: 'Mandap, Floral Styling & Lighting',
    targetPercent: 13,
    minHealthy: 7,
    maxHealthy: 22,
    underRisk: 'Underfunded: Floral styling and Mandap/stage decor will look sparse compared to Indian celebration standards.',
    overRisk: 'Caution: Decor spend exceeds 22%, risking budget shortfalls in guest catering or video production.',
  },
  entertainment: {
    name: 'Dhol, DJ, Sangeet & Sound',
    targetPercent: 7,
    minHealthy: 4,
    maxHealthy: 14,
    underRisk: 'Underfunded: Insufficient to secure a professional sound console, Baraat Punjabi Dhol troupe, and Sangeet DJ.',
    overRisk: 'Overallocated: Celebrity artist/entertainment package is disproportionate to total gathering scale.',
  },
  media: {
    name: 'Candid Photo & Cinematography',
    targetPercent: 5,
    minHealthy: 3.5,
    maxHealthy: 12,
    underRisk: 'Underfunded: High risk of missing candid coverage, drone angles, or a dedicated 4K cinematic wedding film team.',
    overRisk: 'Overallocated: Media package takes up high percentage of available capital.',
  },
  logistics: {
    name: 'Pandit, Baraat, Valet & Permits',
    targetPercent: 3,
    minHealthy: 2,
    maxHealthy: 8,
    underRisk: 'High Risk: Insufficient budget for Pandit Dakshina, Baraat procession permits, generator diesel backup, or valet marshals.',
    overRisk: 'Overallocated: Administrative logistics take up an elevated percentage of spend.',
  },
};

/**
 * Adjust default shares based on Indian constraints
 */
export function calculateInitialBudgetShares(constraints: UserConstraints): Record<string, number> {
  const shares: Record<string, number> = {
    venue: 26,
    catering: 36,
    decor: 13,
    entertainment: 7,
    media: 5,
    logistics: 3,
  };

  // Outdoor/Lawn settings require more weather contingency (German hanger/shamiana & generators)
  if (constraints.locationStyle === 'outdoor') {
    shares.venue += 2; // Tenting/hanger structure
    shares.logistics += 2; // Silent generators, valet, fogging
    shares.decor -= 2;
    shares.entertainment -= 2;
  } else if (constraints.locationStyle === 'hybrid') {
    shares.logistics += 1;
    shares.decor -= 1;
  }

  // Large Indian gatherings (>250 guests) scale food & logistics
  if (constraints.guestCount > 250) {
    shares.catering += 3;
    shares.logistics += 1;
    shares.decor -= 3;
    shares.media -= 1;
  } else if (constraints.guestCount < 80) {
    shares.catering -= 4;
    shares.media += 2;
    shares.decor += 2;
  }

  // Priority Focus shift
  if (constraints.priorityFocus === 'culinary_delight') {
    shares.catering += 4;
    shares.decor -= 2;
    shares.entertainment -= 2;
  } else if (constraints.priorityFocus === 'visual_aesthetic') {
    shares.decor += 4;
    shares.entertainment -= 2;
    shares.catering -= 2;
  } else if (constraints.priorityFocus === 'music_energy') {
    shares.entertainment += 4;
    shares.decor -= 2;
    shares.media -= 2;
  }

  // Normalize all 6 categories to sum exactly to (100 - SAFETY_BUFFER_PERCENT) = 90%
  const currentTotal = Object.values(shares).reduce((a, b) => a + b, 0);
  const targetTotal = 100 - SAFETY_BUFFER_PERCENT; // 90

  const keys = Object.keys(shares);
  let accumulated = 0;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      shares[key] = Math.round((targetTotal - accumulated) * 10) / 10;
    } else {
      const normalized = Math.round(((shares[key] / currentTotal) * targetTotal) * 10) / 10;
      shares[key] = normalized;
      accumulated += normalized;
    }
  });

  return shares;
}

/**
 * Generates natural language explainability for a category allocation
 */
export function generateCategoryReasoning(
  categoryId: string,
  percentage: number,
  amount: number,
  constraints: UserConstraints
): string {
  const perGuest = Math.round(amount / Math.max(1, constraints.guestCount));
  const loc = constraints.locationStyle;
  const guests = constraints.guestCount;
  const inrStr = formatINR(amount);
  const perGuestStr = formatINR(perGuest);

  switch (categoryId) {
    case 'venue':
      if (loc === 'outdoor') {
        return `Allocates ${percentage}% (${inrStr}) for outdoor wedding lawns/resort grounds in ${constraints.city}, including waterproof German hanger/shamiana structures and wooden stage flooring.`;
      }
      return `Dedicates ${percentage}% (${inrStr}) to secure a banquet hall/hotel ballroom in ${constraints.city} capable of accommodating ${guests} guests with dedicated bridal green rooms and valet parking access.`;
    case 'catering':
      return `Commands ${percentage}% (${inrStr} or ~${perGuestStr}/guest plate) for ${guests} attendees covering welcome drinks, live chaat/mithai stations, multi-cuisine royal buffet, and seasoned service staff.`;
    case 'decor':
      if (loc === 'outdoor') {
        return `Allocates ${percentage}% (${inrStr}) for a traditional Mandap canopy, marigold/exotic floral installations, Sangeet stage backdrop, and fairy light pathway ambient illumination.`;
      }
      return `Dedicates ${percentage}% (${inrStr}) for grand entryway floral arch, stage floral backdrop, themed tablescapes, and ambient LED up-lighting tailored to ${constraints.eventType}.`;
    case 'entertainment':
      return `Secures ${percentage}% (${inrStr}) for a high-energy Baraat Punjabi Dhol team, sound reinforcement console, licensed DJ for Sangeet night, and cordless mics for rituals.`;
    case 'media':
      return `Reserves ${percentage}% (${inrStr}) for a 2-photographer candid team, traditional videographer, 4K cinematic wedding teaser reel, drone coverage, and high-res digital albums.`;
    case 'logistics':
      if (loc === 'outdoor' || loc === 'hybrid') {
        return `Crucial ${percentage}% (${inrStr}) covering silent 125kVA generator diesel backup, Pandit ji honorarium & Samagri, Baraat police sound NOC, and valet parking marshals.`;
      }
      return `Dedicates ${percentage}% (${inrStr}) for Pandit/Priest honorarium, day-of floor coordinators, Safa/Turban tying artists for groom party, and guest luggage assistance.`;
    default:
      return `Allocates ${percentage}% (${inrStr}) to ensure seamless execution for ${guests} guests in ${constraints.city}.`;
  }
}

/**
 * Rebalances other categories when the user changes a single category's percentage slider.
 * Hard constraint: Always preserves 10% safety buffer, and category sum = 90%.
 */
export function rebalanceCategories(
  categories: BudgetCategory[],
  changedId: string,
  newPercentage: number,
  totalBudget: number,
  constraints: UserConstraints
): BudgetCategory[] {
  const maxAllowed = 100 - SAFETY_BUFFER_PERCENT; // 90%
  const clampedVal = Math.max(1, Math.min(newPercentage, maxAllowed - (categories.length - 1)));

  const otherCategories = categories.filter((c) => c.id !== changedId);
  const oldOtherSum = otherCategories.reduce((sum, c) => sum + c.percentage, 0);
  const remainingBudgetForOthers = maxAllowed - clampedVal;

  const updatedOthers = otherCategories.map((cat, index) => {
    let rebalancedPercentage: number;
    if (index === otherCategories.length - 1) {
      const previousAllocated = otherCategories
        .slice(0, index)
        .reduce((sum, c) => {
          const ratio = oldOtherSum > 0 ? c.percentage / oldOtherSum : 1 / otherCategories.length;
          return sum + Math.round(ratio * remainingBudgetForOthers * 10) / 10;
        }, 0);
      rebalancedPercentage = Math.round((remainingBudgetForOthers - previousAllocated) * 10) / 10;
    } else {
      const ratio = oldOtherSum > 0 ? cat.percentage / oldOtherSum : 1 / otherCategories.length;
      rebalancedPercentage = Math.round(ratio * remainingBudgetForOthers * 10) / 10;
    }
    rebalancedPercentage = Math.max(0.5, rebalancedPercentage);
    const amount = Math.round((totalBudget * rebalancedPercentage) / 100);

    return {
      ...cat,
      percentage: rebalancedPercentage,
      amount,
      reasoning: generateCategoryReasoning(cat.id, rebalancedPercentage, amount, constraints),
    };
  });

  const changedAmount = Math.round((totalBudget * clampedVal) / 100);
  const changedCat = categories.find((c) => c.id === changedId)!;
  const updatedChangedCat: BudgetCategory = {
    ...changedCat,
    percentage: clampedVal,
    amount: changedAmount,
    reasoning: generateCategoryReasoning(changedId, clampedVal, changedAmount, constraints),
  };

  return categories.map((cat) => {
    if (cat.id === changedId) return updatedChangedCat;
    return updatedOthers.find((o) => o.id === cat.id) || cat;
  });
}

/**
 * Builds the complete BudgetBreakdown object
 */
export function buildBudgetBreakdown(
  constraints: UserConstraints,
  customShares?: Record<string, number>
): BudgetBreakdown {
  const shares = customShares || calculateInitialBudgetShares(constraints);
  const total = constraints.budgetCap;
  const bufferAmount = Math.round((total * SAFETY_BUFFER_PERCENT) / 100);

  const categories: BudgetCategory[] = STANDARD_CATEGORIES.map((std) => {
    const percentage = shares[std.id] ?? std.defaultShare;
    const amount = Math.round((total * percentage) / 100);
    const reasoning = generateCategoryReasoning(std.id, percentage, amount, constraints);
    const subItems = getStandardSubItems(std.id, amount, constraints);

    return {
      id: std.id,
      name: std.name,
      percentage,
      amount,
      reasoning,
      subItems,
      color: std.color,
      iconName: std.iconName,
    };
  });

  const allocatedCategoriesTotal = categories.reduce((sum, c) => sum + c.amount, 0);
  const perGuestCost = Math.round(total / Math.max(1, constraints.guestCount));

  let budgetHealth: 'balanced' | 'stretched' | 'comfortable' = 'balanced';
  if (perGuestCost < 1200) budgetHealth = 'stretched';
  else if (perGuestCost > 5000) budgetHealth = 'comfortable';

  return {
    totalBudget: total,
    allocatedCategoriesTotal,
    safetyBuffer: {
      percentage: SAFETY_BUFFER_PERCENT,
      amount: bufferAmount,
      reasoning: `Dedicated 10% Shagun & Emergency Reserve (${formatINR(bufferAmount)}) ring-fenced for unannounced relative/guest surges (+15-20% head-count is common in Indian events), extra buffet plates, generator diesel overtime, and monsoon waterproofing.`,
    },
    categories,
    perGuestCost,
    budgetHealth,
    hardConstraintEnforced: true,
  };
}

function getStandardSubItems(
  categoryId: string,
  totalCategoryAmount: number,
  constraints: UserConstraints
): Array<{ name: string; estimatedCost: number; note: string }> {
  switch (categoryId) {
    case 'venue':
      return [
        {
          name: 'Primary Lawn / Banquet Hall Rental',
          estimatedCost: Math.round(totalCategoryAmount * 0.7),
          note: `Base booking in ${constraints.city} for ${constraints.guestCount} capacity`,
        },
        {
          name: constraints.locationStyle === 'outdoor' ? 'Waterproof German Hanger & Platform' : 'Bridal Suite & AC Electricity Load',
          estimatedCost: Math.round(totalCategoryAmount * 0.3),
          note: constraints.locationStyle === 'outdoor' ? 'Weatherproof weather shelter' : 'Green rooms and power load',
        },
      ];
    case 'catering':
      return [
        {
          name: 'Royal Multi-Cuisine Dinner Buffet',
          estimatedCost: Math.round(totalCategoryAmount * 0.65),
          note: `Main course spread for ${constraints.guestCount} guests`,
        },
        {
          name: 'Live Chaat, Dosa & Mithai Halwai Counters',
          estimatedCost: Math.round(totalCategoryAmount * 0.25),
          note: 'Fresh jalebi-rabdi, artisanal chaat, and mocktail bar',
        },
        {
          name: 'Banquet Uniformed Wait Staff & Mineral Water',
          estimatedCost: Math.round(totalCategoryAmount * 0.1),
          note: 'Dedicated table service and hospitality staff',
        },
      ];
    case 'decor':
      return [
        {
          name: 'Traditional Mandap & Ceremony Floral Canopy',
          estimatedCost: Math.round(totalCategoryAmount * 0.55),
          note: 'Fresh marigold, rose, and jasmine floral arrangements',
        },
        {
          name: 'Sangeet Stage, Fairy Lights & Ambience',
          estimatedCost: Math.round(totalCategoryAmount * 0.45),
          note: 'LED wall backdrop, walkway lanterns, and truss lighting',
        },
      ];
    case 'entertainment':
      return [
        {
          name: 'Baraat Punjabi Dhol Troupe & Brass Band',
          estimatedCost: Math.round(totalCategoryAmount * 0.45),
          note: 'High-energy procession music with 4 dholis',
        },
        {
          name: 'DJ, Sangeet Sound Console & Cordless Mics',
          estimatedCost: Math.round(totalCategoryAmount * 0.55),
          note: 'JBL VRX/Line Array sound setup for Sangeet dance night',
        },
      ];
    case 'media':
      return [
        {
          name: 'Candid Lead Photographer & Cinematic Teaser Reel',
          estimatedCost: Math.round(totalCategoryAmount * 0.75),
          note: 'Full day coverage with candid shots and 3-minute 4K teaser',
        },
        {
          name: 'Traditional 4K Video, Drone & Leather Bound Album',
          estimatedCost: Math.round(totalCategoryAmount * 0.25),
          note: 'Full ceremony documentation and printed family albums',
        },
      ];
    case 'logistics':
      return [
        {
          name: constraints.locationStyle === 'outdoor' ? 'Silent 125kVA Generator & Baraat Police NOC' : 'Pandit Ji Dakshina & Pooja Samagri Kit',
          estimatedCost: Math.round(totalCategoryAmount * 0.6),
          note: constraints.locationStyle === 'outdoor' ? 'Continuous power backup and sound permit' : 'Vedic rituals coordination',
        },
        {
          name: 'Safa/Turban Tying Artist & Valet Parking Marshals',
          estimatedCost: Math.round(totalCategoryAmount * 0.4),
          note: 'Matching safas for Baraatis and vehicle parking management',
        },
      ];
    default:
      return [];
  }
}

/**
 * Builds the Context-Aware Vendor Checklist tailored for Indian events
 */
export function buildContextAwareChecklist(constraints: UserConstraints): ChecklistItem[] {
  const items: ChecklistItem[] = [];

  // Core Universal items
  items.push({
    id: 'core-venue-contract',
    category: 'Venue',
    title: 'Finalize & sign venue contract with auspicious Muhurat slots',
    whyThisWasAdded: `Foundational booking in ${constraints.city}; secures Shubh Muhurat date and mandatory sound cut-off window.`,
    isContextSpecific: false,
    priority: 'must_have',
    completed: false,
    timelinePhase: 'T-9 to T-6 Months',
  });

  items.push({
    id: 'core-pandit-booking',
    category: 'Rituals & Coordination',
    title: 'Consult Pandit/Priest to lock Muhurat timings & Pooja Samagri list',
    whyThisWasAdded: `Ensures Vedic rituals (Phere, Varmala, Kanyadaan) align with auspicious astrological planetary windows.`,
    isContextSpecific: false,
    priority: 'must_have',
    completed: false,
    timelinePhase: 'T-6 to T-3 Months',
  });

  items.push({
    id: 'core-catering-tasting',
    category: 'Catering',
    title: 'Menu tasting with Halwai/Caterer & live chaat/mithai selection',
    whyThisWasAdded: `Crucial for ${constraints.guestCount} guests to sample regional specialties, sweet richness, and live stall throughput.`,
    isContextSpecific: false,
    priority: 'must_have',
    completed: false,
    timelinePhase: 'T-6 to T-3 Months',
  });

  items.push({
    id: 'core-media-booking',
    category: 'Photography',
    title: 'Contract candid photography & cinematic wedding film team',
    whyThisWasAdded: `Top wedding cinematographers in ${constraints.city} book out 6-12 months ahead during wedding Saaya season.`,
    isContextSpecific: false,
    priority: 'must_have',
    completed: false,
    timelinePhase: 'T-9 to T-6 Months',
  });

  // Outdoor Context-Aware additions for India
  if (constraints.locationStyle === 'outdoor' || constraints.locationStyle === 'hybrid') {
    items.push({
      id: 'outdoor-tent-rental',
      category: 'Venue & Logistics',
      title: 'Erect waterproof German Hanger / Shamiana with wooden sub-flooring',
      whyThisWasAdded: `Outdoor lawn setting selected: Protects against unexpected rainfall, lawn dew, and provides structural rigging for chandeliers.`,
      isContextSpecific: true,
      contextTag: 'Outdoor Contingency',
      priority: 'must_have',
      completed: false,
      timelinePhase: 'T-6 to T-3 Months',
    });

    items.push({
      id: 'outdoor-power-generator',
      category: 'Logistics',
      title: 'Procure silent 125kVA generator with dedicated diesel backup',
      whyThisWasAdded: `Outdoor Indian venue protocol: Grid power cuts during peak function hours will trip stage AC, catering warmers, and sound.`,
      isContextSpecific: true,
      contextTag: 'Power Backup Contingency',
      priority: 'must_have',
      completed: false,
      timelinePhase: 'T-3 to T-1 Month',
    });

    items.push({
      id: 'outdoor-weather-cooling',
      category: 'Logistics',
      title: 'Install mist cooling fans / desert coolers (or angithis in winter)',
      whyThisWasAdded: `Outdoor climate management: Keeps guests comfortable during long Mandap rituals and open-lawn dining.`,
      isContextSpecific: true,
      contextTag: 'Guest Climate Comfort',
      priority: 'recommended',
      completed: false,
      timelinePhase: 'T-2 Weeks',
    });

    items.push({
      id: 'outdoor-mosquito-fogging',
      category: 'Logistics',
      title: 'Schedule pre-event lawn insect and mosquito fogging (T-2 hours)',
      whyThisWasAdded: `Outdoor lawn protocol: Eliminates insects around dinner buffet and Mandap seating before guest arrival.`,
      isContextSpecific: true,
      contextTag: 'Hygiene & Comfort',
      priority: 'must_have',
      completed: false,
      timelinePhase: 'T-1 Week',
    });

    items.push({
      id: 'outdoor-sound-noc',
      category: 'Logistics',
      title: 'Obtain local police & municipal NOC for 10 PM sound curfew',
      whyThisWasAdded: `Statutory Indian regulation: Required for outdoor DJ music and Baraat procession to prevent municipal disruption.`,
      isContextSpecific: true,
      contextTag: 'Statutory Permit',
      priority: 'must_have',
      completed: false,
      timelinePhase: 'T-1 Month',
    });
  }

  // Large Guest Count Guardrails (>150 guests typical in Indian gatherings)
  if (constraints.guestCount > 150) {
    items.push({
      id: 'crowd-valet-marshals',
      category: 'Logistics',
      title: 'Contract dedicated Valet parking team & traffic marshals',
      whyThisWasAdded: `High guest count (${constraints.guestCount} attendees): Prevents narrow venue access lanes from bottlenecking Baraat arrival.`,
      isContextSpecific: true,
      contextTag: 'High Capacity Guardrail',
      priority: 'must_have',
      completed: false,
      timelinePhase: 'T-1 Month',
    });

    items.push({
      id: 'extra-chaat-counters',
      category: 'Catering',
      title: 'Add secondary live chaat, dosa, and jalebi-rabdi live stations',
      whyThisWasAdded: `At ${constraints.guestCount} guests, a single food counter generates 20+ minute wait queues during dinner rush.`,
      isContextSpecific: true,
      contextTag: 'High Capacity Guardrail',
      priority: 'must_have',
      completed: false,
      timelinePhase: 'T-3 to T-1 Month',
    });

    items.push({
      id: 'traditional-welcome-team',
      category: 'Guest Hospitality',
      title: 'Organize traditional welcoming team (Tilak, rose water sprinkle, flower garlands)',
      whyThisWasAdded: `High-volume Indian reception: Creates an auspicious and respectful greeting experience for arriving family and dignitaries.`,
      isContextSpecific: true,
      contextTag: 'Indian Tradition',
      priority: 'recommended',
      completed: false,
      timelinePhase: 'T-2 Weeks',
    });
  }

  // Cultural Traditions Items
  items.push({
    id: 'safa-turban-artist',
    category: 'Logistics',
    title: 'Book professional Safa / Pheta tying artist team for Baraatis',
    whyThisWasAdded: `Indian celebration standard: Coordinates coordinated Rajasthani/Banarasi turbans for the groom party upon arrival.`,
    isContextSpecific: true,
    contextTag: 'Baraat Custom',
    priority: 'must_have',
    completed: false,
    timelinePhase: 'T-1 Month',
  });

  items.push({
    id: 'sangeet-choreography',
    category: 'Entertainment',
    title: 'Schedule Sangeet dance rehearsals and edit song mashup audio track',
    whyThisWasAdded: `Essential for family Sangeet performances; prevents sound track playback glitches during group dances.`,
    isContextSpecific: true,
    contextTag: 'Sangeet Night',
    priority: 'must_have',
    completed: false,
    timelinePhase: 'T-2 Months',
  });

  items.push({
    id: 'haldi-phoolon-ki-holi',
    category: 'Decor & Rituals',
    title: 'Source organic yellow Haldi paste, floral jewelry & yellow marigold petal cones',
    whyThisWasAdded: `Traditional pre-wedding Haldi: Essential for vibrant photogenic phoolon ki holi celebration.`,
    isContextSpecific: true,
    contextTag: 'Haldi Custom',
    priority: 'recommended',
    completed: false,
    timelinePhase: 'T-2 Weeks',
  });

  // Day-of Core Tasks
  items.push({
    id: 'day-of-vendor-call-times',
    category: 'Logistics',
    title: 'Distribute minute-by-minute vendor master schedule & contact sheet',
    whyThisWasAdded: `Synchronizes Halwai, decorator, DJ, sound engineer, and photographers across ritual milestones.`,
    isContextSpecific: false,
    priority: 'must_have',
    completed: false,
    timelinePhase: 'T-1 Week',
  });

  items.push({
    id: 'day-of-shagun-envelopes',
    category: 'Logistics',
    title: 'Prepare labeled Shagun and vendor balance envelopes with cash denominations',
    whyThisWasAdded: `Eliminates end-of-night payment chaos for Dhol players, Pandit ji, and venue staff gratuities.`,
    isContextSpecific: false,
    priority: 'must_have',
    completed: false,
    timelinePhase: 'T-1 Week',
  });

  return items;
}

/**
 * Builds reverse-engineered timeline milestones from the target event date.
 */
export function buildMilestoneTimeline(
  targetDateStr: string,
  currentDate: Date = new Date()
): TimelineMilestone[] {
  const targetDate = new Date(targetDateStr);
  const diffTime = targetDate.getTime() - currentDate.getTime();
  const daysUntilEvent = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const milestonesConfig: Array<{
    id: string;
    timeframe: string;
    daysBefore: number;
    title: string;
    description: string;
    leadTimeReasoning: string;
    keyTasks: string[];
  }> = [
    {
      id: 't-12m',
      timeframe: 'T-12 Months',
      daysBefore: 365,
      title: 'Shubh Muhurat Dates & Prime Wedding Venue Booking',
      description: 'Consult astrologer/Pandit for auspicious dates and lock in primary lawns/banquet hall.',
      leadTimeReasoning: 'In India, prime venues during peak wedding Saaya dates book 10 to 14 months in advance; locking this secures your Muhurat date.',
      keyTasks: ['Finalize Shubh Muhurat date with family', 'Book wedding lawns & hotel room block', 'Estimate initial VIP guest count'],
    },
    {
      id: 't-6m',
      timeframe: 'T-6 Months',
      daysBefore: 180,
      title: 'Master Caterer/Halwai & Candid Film Team Contract',
      description: 'Lock in high-demand solo creatives (Photographer, Caterer, DJ, Mehndi Artist).',
      leadTimeReasoning: 'Top candid wedding photographers and premier wedding caterers can only take one wedding per date.',
      keyTasks: ['Send Save-the-Date digital cards', 'Finalize catering menu & live stall count', 'Contract candid cinematography & DJ'],
    },
    {
      id: 't-3m',
      timeframe: 'T-3 Months',
      daysBefore: 90,
      title: 'Bridal/Groom Wardrobe Shopping & Mandap Floral Lockdown',
      description: 'Order custom Lehenga/Sherwani, hire Sangeet choreographer, and print physical invitation cards.',
      leadTimeReasoning: 'Bridal couture and custom sherwanis require 60-90 days for hand-embroidery (zardozi/chikankari) and multiple trial fittings.',
      keyTasks: ['Finalize Lehenga & Sherwani couture orders', 'Hire Sangeet choreographer & start rehearsals', 'Print invitation cards with Mithai gift boxes'],
    },
    {
      id: 't-1m',
      timeframe: 'T-1 Month',
      daysBefore: 30,
      title: 'Card Distribution, Headcount Lock & Police Sound NOC',
      description: 'Distribute physical invitations to family, finalize guest list, and secure outdoor sound permits.',
      leadTimeReasoning: 'Indian caterers need a guaranteed minimum plate count 3 weeks prior to source exotic ingredients, ghee, and dairy.',
      keyTasks: ['Distribute wedding cards with dry fruit/mithai', 'Obtain 10 PM sound curfew NOC for Baraat', 'Confirm Safa tying artist & Dhol troupe count'],
    },
    {
      id: 't-2w',
      timeframe: 'T-2 Weeks',
      daysBefore: 14,
      title: 'Sangeet Track Mixing, Weather Contingency & Trial Fits',
      description: 'Finalize audio mix for dance performances, inspect waterproof shamianas, and confirm jewelry.',
      leadTimeReasoning: 'Allows audio engineers to master all family song cues so stage performances run without dead silence.',
      keyTasks: ['Submit master Sangeet audio mashup', 'Confirm generator backup & diesel delivery', 'Final trial of wedding jewelry and outfits'],
    },
    {
      id: 't-1w',
      timeframe: 'T-1 Week',
      daysBefore: 7,
      title: 'Pooja Samagri Check, Haldi Prep & Shagun Cash Envelopes',
      description: 'Review ritual items with Pandit ji, assemble organic Haldi & floral cones, prepare vendor envelopes.',
      leadTimeReasoning: 'Avoids last-minute frenzy on the wedding morning; ensures every ritual item is pre-positioned at the Mandap.',
      keyTasks: ['Verify pooja samagri checklist with Pandit ji', 'Prepare cash envelopes for Shagun and tips', 'Organize family welcome gifts & Safas'],
    },
    {
      id: 't-day',
      timeframe: 'Day-Of',
      daysBefore: 0,
      title: 'Baraat Arrival, Varmala & Auspicious Phere Ceremony',
      description: 'Baraat procession, grand Varmala stage, auspicious Mandap rituals, and royal dinner banquet.',
      leadTimeReasoning: 'All logistical and cultural planning converges; host family focuses fully on blessings, hospitality, and joy.',
      keyTasks: ['Morning venue access & Mandap floral inspection', 'Baraat welcoming with Aarti & Dhol', 'Celebrate unforgettable auspicious memories!'],
    },
  ];

  return milestonesConfig.map((config) => {
    const milestoneDate = new Date(targetDate.getTime() - config.daysBefore * 24 * 60 * 60 * 1000);
    const dateFormatted = milestoneDate.toISOString().split('T')[0];
    const isPast = milestoneDate < currentDate;
    const isOverdue = isPast && config.daysBefore > 0;

    let status: TimelineMilestone['status'] = 'upcoming';
    if (isOverdue) status = 'overdue';
    else if (daysUntilEvent <= config.daysBefore + 7 && daysUntilEvent >= config.daysBefore - 7) status = 'in_progress';
    else if (isPast) status = 'completed';

    let leadReason = config.leadTimeReasoning;
    if (isOverdue) {
      leadReason = `⚠️ URGENT CATCH-UP: Event date is in ${daysUntilEvent} days. Normally planned at ${config.timeframe}, this milestone must be expedited immediately to avoid booking lockouts during peak Saaya season.`;
    }

    return {
      id: config.id,
      timeframe: config.timeframe,
      targetDate: dateFormatted,
      daysRemaining: Math.ceil((milestoneDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)),
      isOverdue,
      title: config.title,
      description: config.description,
      leadTimeReasoning: leadReason,
      keyTasks: config.keyTasks,
      status,
    };
  });
}

/**
 * Builds the explainability panel dynamic reasoning synthesis
 */
export function buildDynamicReasoning(
  constraints: UserConstraints,
  breakdown: BudgetBreakdown
): DynamicReasoning {
  const perGuest = breakdown.perGuestCost;
  const isOutdoor = constraints.locationStyle === 'outdoor';
  const hasBigCrowd = constraints.guestCount > 150;
  const bufferStr = formatINR(breakdown.safetyBuffer.amount);
  const capStr = formatINR(constraints.budgetCap);
  const perGuestStr = formatINR(perGuest);

  const tradeoffs: DynamicReasoning['tradeoffsMade'] = [
    {
      decision: isOutdoor ? 'Enhanced Weatherproof Hanger & Silent Generator (+4%)' : 'Acoustics & Air-conditioned Ballroom Flow',
      why: isOutdoor
        ? 'Open lawns in India encounter high humidity, dew, sudden rain, and grid power fluctuations; funds were prioritized for German hangers and 125kVA diesel generators.'
        : 'Indoor banquet facilities provide built-in central air conditioning, sound proofing, and restrooms, allowing budget transfer into grand floral Mandap design.',
      impact: isOutdoor
        ? 'Guarantees the celebration continues uninterrupted even during inclement weather or local power cuts.'
        : 'Elevates visual aesthetic upon guest entry into the grand hall.',
    },
    {
      decision: hasBigCrowd ? 'High-Throughput Multi-Station Live Chaat & Mithai' : 'Bespoke Curated Plated Experience',
      why: hasBigCrowd
        ? `Serving ${constraints.guestCount} guests requires multiple simultaneous live counters (chaat, dosa, jalebi) to eliminate 20+ minute dinner queue bottlenecks.`
        : `With ${constraints.guestCount} guests, dining pacing is naturally intimate, allowing funds to be invested into higher-tier candid cinematography.`,
      impact: hasBigCrowd
        ? 'Delivers swift culinary satisfaction and prevents crowded buffet lines.'
        : 'Captures intimate family portraits and personalized guest favors.',
    },
    {
      decision: `Protected 10% Shagun & Emergency Buffer (${bufferStr})`,
      why: 'Indian wedding data proves 90% of budget overruns stem from unexpected guest turnout (+15-20% head-count), overtime generator fuel, extra Mithai boxes, and shagun tips.',
      impact: 'Protects the family from high-stress out-of-pocket borrowing while keeping the event strictly within the allocated financial ceiling.',
    },
  ];

  return {
    headline: `Engineered for ${constraints.guestCount} Guests in ${constraints.city} under a Strict ${capStr} Cap`,
    summary: `Every rupee and milestone in this blueprint has been calibrated against Indian celebration benchmarks for a ${constraints.locationStyle} ${constraints.eventType} in ${constraints.city}. We prioritized guest hospitality, culinary excellence, and operational reliability while locking an inviolable 10% (${bufferStr}) contingency reserve.`,
    tradeoffsMade: tradeoffs,
    contingencyStrategy: isOutdoor
      ? 'A waterproof German Hanger shelter with dedicated 125kVA generator backup ensures your rituals and Sangeet night proceed without power or rain disruptions.'
      : 'Contractual cutoff dates with banquet halls and caterers ensure all overtime hour charges and guest plate minimums are frozen 30 days prior.',
    perGuestBenchmark: `At ${perGuestStr}/guest, your spend is in the "${breakdown.budgetHealth}" range for ${constraints.city}, maximizing royal hospitality, vibrant photography, and unforgettable memories.`,
    aiRationaleHighlights: [
      `10% (${bufferStr}) hard-coded Shagun & Emergency reserve untouched.`,
      `${constraints.locationStyle === 'outdoor' ? 'Waterproof German hanger & 125kVA generator backup prioritized.' : 'Indoor air-conditioning & Mandap acoustics optimized.'}`,
      `Reverse lead-times calculated backwards from ${constraints.targetDate} based on Indian wedding Saaya calendar.`,
    ],
  };
}

/**
 * Evaluates spending health against industry event cost benchmarks for India
 * Returns a composite score (0-100), overall status, and per-category health status with simple progress indicators.
 */
export function calculateSpendingHealth(
  categories: BudgetCategory[],
  constraints: UserConstraints
): SpendingHealthReport {
  let score = 100;
  let highRiskCount = 0;
  let cautionCount = 0;

  const categoryStatuses: CategoryHealthStatus[] = categories.map((cat) => {
    const benchmark = INDUSTRY_BENCHMARKS[cat.id] || {
      name: cat.name,
      targetPercent: cat.percentage,
      minHealthy: 2,
      maxHealthy: 50,
      underRisk: 'Outside standard benchmark',
      overRisk: 'Outside standard benchmark',
    };

    const current = cat.percentage;
    const deviation = Math.round((current - benchmark.targetPercent) * 10) / 10;
    let status: 'healthy' | 'caution' | 'high_risk' = 'healthy';
    let riskMessage: string | null = null;

    if (current < benchmark.minHealthy) {
      if (current < benchmark.minHealthy - 3) {
        status = 'high_risk';
        riskMessage = benchmark.underRisk;
        highRiskCount++;
        score -= 18;
      } else {
        status = 'caution';
        riskMessage = `Slightly lean: ${current}% is below standard Indian minimum (${benchmark.minHealthy}%).`;
        cautionCount++;
        score -= 7;
      }
    } else if (current > benchmark.maxHealthy) {
      if (current > benchmark.maxHealthy + 3) {
        status = 'high_risk';
        riskMessage = benchmark.overRisk;
        highRiskCount++;
        score -= 18;
      } else {
        status = 'caution';
        riskMessage = `Elevated: ${current}% exceeds typical ceiling (${benchmark.maxHealthy}%).`;
        cautionCount++;
        score -= 7;
      }
    }

    return {
      categoryId: cat.id,
      categoryName: cat.name,
      currentPercentage: current,
      benchmarkPercentage: benchmark.targetPercent,
      benchmarkRange: [benchmark.minHealthy, benchmark.maxHealthy],
      status,
      deviation,
      riskMessage,
    };
  });

  const finalScore = Math.max(10, Math.min(100, score));

  let overallStatus: 'healthy' | 'moderate_risk' | 'high_risk' = 'healthy';
  let summary = 'Allocation aligns smoothly with Indian celebration cost benchmarks. Financial exposure is healthy and balanced.';

  if (finalScore < 55 || highRiskCount >= 2) {
    overallStatus = 'high_risk';
    summary = `High spending risk detected in ${highRiskCount} category(s). Key categories are distorted compared to typical Indian event costs and may compromise guest experience or cause shortfalls.`;
  } else if (finalScore < 80 || highRiskCount === 1 || cautionCount >= 2) {
    overallStatus = 'moderate_risk';
    summary = `Moderate financial variance in ${cautionCount + highRiskCount} category(s). Review highlighted allocations to balance guest hospitality and decor.`;
  }

  return {
    score: finalScore,
    overallStatus,
    summary,
    highRiskCount,
    cautionCount,
    categories: categoryStatuses,
  };
}

/**
 * Creates a complete CelebrationPlan using the expert rules engine
 */
export function generatePlanFromRules(
  constraints: UserConstraints,
  currentDate: Date = new Date()
): CelebrationPlan {
  const budgetBreakdown = buildBudgetBreakdown(constraints);
  const vendorChecklist = buildContextAwareChecklist(constraints);
  const timeline = buildMilestoneTimeline(constraints.targetDate, currentDate);
  const dynamicReasoning = buildDynamicReasoning(constraints, budgetBreakdown);

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    constraints,
    budgetBreakdown,
    vendorChecklist,
    timeline,
    dynamicReasoning,
    source: 'expert_rules_engine',
  };
}
