import { GoogleGenAI } from "@google/genai";
import { AgentStateType, VerdictSchema } from "../state";
import { SYNTHESIZER_SYSTEM_PROMPT, buildSynthesizerMessage } from "../../prompts/synthesizer";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY,
});
const GEMMA_MODEL = process.env.GEMMA_MODEL || "gemma-4-31b";

export async function synthesizerNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  if (state.error) {
    return {
      error: state.error,
    };
  }
  try {
    const response = await ai.models.generateContent({
      model: GEMMA_MODEL,
      contents: buildSynthesizerMessage(state),
      config: {
        systemInstruction: SYNTHESIZER_SYSTEM_PROMPT,
      },
    });

    const content = response.text || "";
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const verdict = VerdictSchema.parse(parsed);

    return {
      verdict,
      agentLog: [`[SUCCESS] Investment verdict generated: ${verdict.recommendation} (${verdict.confidenceScore}% confidence)`],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      error: `Synthesis failed: ${message}`,
      agentLog: [`[ERROR] Synthesis step failed: ${message}`],
    };
  }
}
