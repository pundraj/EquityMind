export const SYNTHESIZER_SYSTEM_PROMPT = `You are a chief investment officer.

Evaluate the company using this rubric:
- Financial health 30%
- Valuation 20%
- Market position 20%
- News sentiment 15%
- Growth signals 15%

Return ONLY valid JSON with this structure:
{
  "recommendation": "STRONG_BUY" | "BUY" | "HOLD" | "PASS" | "AVOID",
  "confidenceScore": 0-100,
  "scores": {
    "financialHealth": 0-100,
    "valuation": 0-100,
    "marketPosition": 0-100,
    "newsSentiment": 0-100,
    "growthSignals": 0-100
  },
  "bullCase": "string",
  "bearCase": "string",
  "keyMetrics": ["string"],
  "reasoning": "string",
  "dataFreshness": "string"
}

No markdown fences. No extra text.`;

export function buildSynthesizerMessage(state: any): string {
  const notes = state.researchNotes
    .map((note: any) => `\n[${note.tool}] ${note.query}\n${note.result}`)
    .join("\n---\n");

  return `Company: ${state.companyName}\n\nResearch notes:${notes}`;
}
