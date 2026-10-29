# Celebrate AI — Explainable GenAI Celebration & Event Planner

Celebrate AI is a production-grade, explainable event planning application for weddings, milestone birthdays, and community gatherings. Every financial figure, vendor contract deliverable, and countdown milestone comes with an explicit **"why"** derived from user constraints.

---

## Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │          React SPA (Vite + Tailwind)   │
                      │  - Dynamic Constraint Workspace        │
                      │  - Explainable Budget Allocator (Donut)│
                      │  - Context-Aware Vendor Checklist      │
                      │  - Reverse Milestone Countdown         │
                      │  - Print & PDF Export Hub              │
                      └──────────────────┬─────────────────────┘
                                         │ JSON HTTP /api/plan
                                         ▼
                      ┌────────────────────────────────────────┐
                      │          Express Backend Server        │
                      │               (server.ts)              │
                      └──────────────────┬─────────────────────┘
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        │                                                                 │
        ▼ (When GEMINI_API_KEY is present)                                ▼ (Offline / Fallback)
┌──────────────────────────────────────┐                ┌───────────────────────────────────┐
│     Multi-Agent Gemini Orchestrator  │                │      Deterministic Domain Engine  │
│          (@google/genai SDK)         │                │        (src/utils/plannerLogic.ts)│
│                                      │                │                                   │
│  ├─ Budget Agent (10% Buffer Lock)   │                │  ├─ 10% Hard Safety Buffer Calc   │
│  ├─ Checklist Agent (Weather & Crowd)│                │  ├─ Proportional Slider Rebalancer│
│  ├─ Timeline Agent (Lead-Time Dates) │                │  ├─ Context Contingency Rules     │
│  └─ Dynamic Reasoning Synthesizer    │                │  └─ Overdue Milestone Detection   │
└──────────────────────────────────────┘                └───────────────────────────────────┘
```

---

## Core Features

1. **Dynamic Constraint Workspace**:
   - Form inputs for event type, guest count, strict budget cap, date, location style (indoor/outdoor/hybrid), and city.
   - Enforces the budget cap as a hard ceiling.
   - Live per-head diagnostics and timeline proximity detection.

2. **Explainable Budget Allocator**:
   - Percentage and amount per category (*Venue, Catering, Decor, Entertainment, Photography, Logistics*).
   - Inviolable **10% Safety Buffer** ring-fenced for unexpected overtime or weather changes.
   - Interactive SVG Donut and proportional Bar charts.
   - Live category slider rebalancer: dragging one category proportionally adjusts others while preserving 100% total (90% categories + 10% buffer) and dynamically regenerates category reasoning.

3. **Context-Aware Vendor Checklist**:
   - Outdoor events auto-inject tent rental, generator power, and 48-hour weather trigger tasks.
   - Events with >100 guests auto-inject crowd traffic signage and secondary satellite bars.
   - Every task features an explicit "why this was added" explanation card.
   - Progress bar, filter tags, and custom task creation.

4. **Milestone Timeline Generator**:
   - Reverse-engineered countdown from event date (*T-12M, T-6M, T-3M, T-1M, T-2W, T-1W, Day-Of*).
   - Explains vendor lead-time availability.
   - Dynamically flags milestones as **OVERDUE** with urgent catch-up notices if the event date is close.

5. **Explainability Panel ("Why this plan?")**:
   - Synthesizes key trade-offs made, contingency strategy, and per-guest benchmark.

6. **Export & Share Hub**:
   - PDF-ready print stylesheet (`window.print()`).
   - One-click text summary copy.
   - Portable JSON backup and restore.

---

## Prompt Orchestration Design

The system coordinates three specialized sub-agents:
- **Budget Agent**: Mathematically partitions the spend into 6 categories strictly summing to 90%, preserving the 10% safety buffer.
- **Checklist Agent**: Receives the user constraints and budget allocation to generate context-driven vendor and safety tasks.
- **Timeline Agent**: Projects countdown lead-times backwards from the target date and flags overdue items.
- **Dynamic Reasoning**: Synthesizes the holistic trade-offs and contingency strategy.

### Fallback & Defensive Parsing
If `GEMINI_API_KEY` is not configured, or if the model response encounters rate limits or malformed JSON, the application seamlessly activates its deterministic expert domain engine (`generatePlanFromRules`), guaranteeing zero crashes and consistent high quality.

---

## Development & Testing

```bash
# Install dependencies
npm install

# Run unit tests (Node.js test runner)
npx tsx --test src/utils/plannerLogic.test.ts

# Start full-stack development server
npm run dev
```
