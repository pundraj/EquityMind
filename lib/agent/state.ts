import { Annotation } from "@langchain/langgraph";
import { z } from "zod";

export const ResearchNoteSchema = z.object({
  tool: z.string(),
  query: z.string(),
  result: z.string(),
  timestamp: z.string(),
  relevanceScore: z.number().min(0).max(10).optional(),
});

export const VerdictSchema = z.object({
  recommendation: z.enum(["STRONG_BUY", "BUY", "HOLD", "PASS", "AVOID"]),
  confidenceScore: z.number().min(0).max(100),
  scores: z.object({
    financialHealth: z.number().min(0).max(100),
    valuation: z.number().min(0).max(100),
    marketPosition: z.number().min(0).max(100),
    newsSentiment: z.number().min(0).max(100),
    growthSignals: z.number().min(0).max(100),
  }),
  bullCase: z.string(),
  bearCase: z.string(),
  keyMetrics: z.array(z.string()),
  reasoning: z.string(),
  dataFreshness: z.string(),
  decisionBreakdown: z.object({
    financialHealthReasoning: z.string(),
    valuationReasoning: z.string(),
    marketPositionReasoning: z.string(),
    newsSentimentReasoning: z.string(),
    growthSignalsReasoning: z.string(),
  }),
  catalysts: z.array(z.string()).min(1).max(5),
  risks: z.array(z.string()).min(1).max(5),
  timeHorizon: z.enum(["SHORT_TERM", "MEDIUM_TERM", "LONG_TERM"]),
  targetPriceRange: z.object({
    low: z.number().nullable(),
    high: z.number().nullable(),
    basis: z.string(),
  }).nullable(),
  comparablePeers: z.array(z.string()).max(3),
});

export const AgentState = Annotation.Root({
  companyName: Annotation<string>({ reducer: (_, next) => next }),
  ticker: Annotation<string | null>({ reducer: (_, next) => next, default: () => null }),
  researchNotes: Annotation<z.infer<typeof ResearchNoteSchema>[]>({
    reducer: (existing, nextNotes) => [...existing, ...nextNotes],
    default: () => [],
  }),
  toolsUsed: Annotation<string[]>({
    reducer: (existing, nextTools) => [...new Set([...existing, ...nextTools])],
    default: () => [],
  }),
  agentLog: Annotation<string[]>({
    reducer: (existing, nextLogs) => [...existing, ...nextLogs],
    default: () => [],
  }),
  iterationCount: Annotation<number>({ reducer: (_, next) => next, default: () => 0 }),
  maxIterations: Annotation<number>({ reducer: (_, next) => next, default: () => 5 }),
  researchComplete: Annotation<boolean>({ reducer: (_, next) => next, default: () => false }),
  verdict: Annotation<z.infer<typeof VerdictSchema> | null>({ reducer: (_, next) => next, default: () => null }),
  error: Annotation<string | null>({ reducer: (_, next) => next, default: () => null }),
});

export type AgentStateType = typeof AgentState.State;
export type ResearchNote = z.infer<typeof ResearchNoteSchema>;
export type Verdict = z.infer<typeof VerdictSchema>;
