import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  UserConstraints,
  CelebrationPlan,
  BudgetBreakdown,
  ChecklistItem,
  TimelineMilestone,
  DynamicReasoning
} from './src/types/planner';
import {
  generatePlanFromRules,
  rebalanceCategories,
  formatINR,
  SAFETY_BUFFER_PERCENT
} from './src/utils/plannerLogic';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '5mb' }));

// Initialize GoogleGenAI client (Server-side only)
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(apiKey),
    region: 'India',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Multi-Agent Orchestrator Route for Indian Celebrations
 */
app.post('/api/plan', async (req: Request, res: Response) => {
  const constraints = req.body as UserConstraints;

  // Validate required fields
  if (
    !constraints ||
    !constraints.eventType ||
    !constraints.guestCount ||
    !constraints.budgetCap ||
    !constraints.targetDate
  ) {
    res.status(400).json({ error: 'Missing required event constraints.' });
    return;
  }

  // Sanitize numeric constraints for Indian events
  constraints.guestCount = Math.max(10, Math.min(3000, Number(constraints.guestCount)));
  constraints.budgetCap = Math.max(50000, Math.min(100000000, Number(constraints.budgetCap)));

  if (!ai) {
    console.log('[Orchestrator] No GEMINI_API_KEY detected. Using expert Indian rules engine.');
    const fallbackPlan = generatePlanFromRules(constraints);
    res.json(fallbackPlan);
    return;
  }

  try {
    const prompt = `
You are an expert, proactive Indian Event Planning AI Agent coordinating three specialized sub-agents for an Indian celebration in ${constraints.city || 'India'}:
1. BUDGET AGENT: Distribute the strict hard budget cap of ₹${constraints.budgetCap.toLocaleString('en-IN')} (INR) for ${constraints.guestCount} guests at a ${constraints.locationStyle} ${constraints.eventType} in ${constraints.city}. Hard constraint: Exactly 10% must be reserved as the safetyBuffer (10% Shagun & Emergency Buffer = ₹${Math.round(constraints.budgetCap * 0.1).toLocaleString('en-IN')}), and the remaining 90% distributed across exactly 6 Indian celebration categories:
   - "venue" (Venue, Lawns & Banquets)
   - "catering" (Catering, Mithai & Live Counters)
   - "decor" (Mandap, Floral Styling & Lighting)
   - "entertainment" (Dhol, DJ, Sangeet & Sound)
   - "media" (Candid Photo & Cinematography)
   - "logistics" (Pandit, Baraat, Valet & Permits)
   The sum of percentages MUST equal exactly 90%. For EVERY category, provide a rich "reasoning" string explaining trade-offs based on Indian wedding dynamics, live chaat stalls, and vendor lead times.

2. CHECKLIST AGENT: Generate 8-12 actionable items tailored to India. For outdoor lawns: include waterproof German Hanger/shamiana, silent 125kVA generator with diesel, and 10 PM sound curfew police NOC. For >150 guests: include valet parking marshals and extra chaat live stations. Include Pandit ji pooja booking, Safa tying artist, Sangeet choreography, Haldi floral holi.

3. TIMELINE AGENT: Reverse-engineer milestones from target date ${constraints.targetDate} (T-12M auspicious Shubh Muhurat lawn booking, T-6M Halwai & candid film, T-3M Lehenga/Sherwani trials, T-1M card distribution with Mithai boxes, T-2W, T-1W, Day-Of). Flag overdue items if date is close.

4. DYNAMIC REASONING: Synthesize key trade-offs made, contingency strategy, and per-guest benchmark.

Return strictly a JSON object:
{
  "budgetBreakdown": {
    "totalBudget": ${constraints.budgetCap},
    "allocatedCategoriesTotal": ${Math.round(constraints.budgetCap * 0.9)},
    "safetyBuffer": { "percentage": 10, "amount": ${Math.round(constraints.budgetCap * 0.1)}, "reasoning": "10% Shagun & Emergency Reserve ring-fenced for unannounced relative turnout, extra buffet plates, and generator diesel overtime." },
    "categories": [
      {
        "id": "venue" | "catering" | "decor" | "entertainment" | "media" | "logistics",
        "name": string,
        "percentage": number,
        "amount": number,
        "reasoning": string,
        "color": string,
        "iconName": string,
        "subItems": [{ "name": string, "estimatedCost": number, "note": string }]
      }
    ],
    "perGuestCost": ${Math.round(constraints.budgetCap / constraints.guestCount)},
    "budgetHealth": "balanced",
    "hardConstraintEnforced": true
  },
  "vendorChecklist": [
    {
      "id": string,
      "category": string,
      "title": string,
      "whyThisWasAdded": string,
      "isContextSpecific": boolean,
      "contextTag": string,
      "priority": "must_have" | "recommended" | "optional",
      "completed": false,
      "timelinePhase": string
    }
  ],
  "timeline": [
    {
      "id": string,
      "timeframe": string,
      "targetDate": string,
      "daysRemaining": number,
      "isOverdue": boolean,
      "title": string,
      "description": string,
      "leadTimeReasoning": string,
      "keyTasks": [string],
      "status": "upcoming" | "overdue" | "in_progress" | "completed"
    }
  ],
  "dynamicReasoning": {
    "headline": string,
    "summary": string,
    "tradeoffsMade": [{ "decision": string, "why": string, "impact": string }],
    "contingencyStrategy": string,
    "perGuestBenchmark": string,
    "aiRationaleHighlights": [string]
  }
}
`;

    const generatePromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert, proactive Indian Event Planning AI Agent. For every budget allocation and checklist category you MUST provide a "reasoning" string explaining trade-offs based on user constraints and Indian celebration standards. Ensure all numbers sum exactly to the hard cap.',
        responseMimeType: 'application/json',
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },
        temperature: 0.3,
      },
    });

    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('AI generation timed out after 12s')), 12000)
    );

    const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

    if (response && response.text) {
      const parsedData = JSON.parse(response.text.trim());

      if (
        parsedData.budgetBreakdown &&
        parsedData.vendorChecklist &&
        parsedData.timeline &&
        parsedData.dynamicReasoning
      ) {
        parsedData.budgetBreakdown.totalBudget = constraints.budgetCap;
        parsedData.budgetBreakdown.safetyBuffer.percentage = SAFETY_BUFFER_PERCENT;
        parsedData.budgetBreakdown.safetyBuffer.amount = Math.round(
          (constraints.budgetCap * SAFETY_BUFFER_PERCENT) / 100
        );
        parsedData.budgetBreakdown.hardConstraintEnforced = true;

        const completePlan: CelebrationPlan = {
          id: `plan-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          constraints,
          budgetBreakdown: parsedData.budgetBreakdown,
          vendorChecklist: parsedData.vendorChecklist,
          timeline: parsedData.timeline,
          dynamicReasoning: parsedData.dynamicReasoning,
          source: 'ai_orchestrated',
        };

        res.json(completePlan);
        return;
      }
    }
  } catch (err: any) {
    console.warn('[Orchestrator] AI generation notice, utilizing expert engine fallback:', err?.message || err);
  }

  // Expert rules engine fallback
  const fallbackPlan = generatePlanFromRules(constraints);
  res.json(fallbackPlan);
});

/**
 * Live Rebalance Reasoning Endpoint
 */
app.post('/api/rebalance-reasoning', async (req: Request, res: Response) => {
  const { categories, changedCategoryId, newPercentage, constraints } = req.body;

  if (!categories || !changedCategoryId || newPercentage === undefined || !constraints) {
    res.status(400).json({ error: 'Missing parameters for rebalance.' });
    return;
  }

  const updatedCategories = rebalanceCategories(
    categories,
    changedCategoryId,
    newPercentage,
    constraints.budgetCap,
    constraints
  );

  res.json({ categories: updatedCategories });
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Celebrate AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
