import { ChatGroq } from "@langchain/groq";
import { AgentStateType, VerdictSchema } from "../state";
import { SYNTHESIZER_SYSTEM_PROMPT, buildSynthesizerMessage } from "../../prompts/synthesizer";

const llm = new ChatGroq({
  model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  temperature: 0,
  apiKey: process.env.GROQ_API_KEY,
});

export async function synthesizerNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  try {
    const response = await llm.invoke([
      { role: "system", content: SYNTHESIZER_SYSTEM_PROMPT },
      { role: "user", content: buildSynthesizerMessage(state) },
    ]);

    const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const verdict = VerdictSchema.parse(parsed);

    return {
      verdict,
      agentLog: [`✅ Verdict generated: ${verdict.recommendation} (${verdict.confidenceScore}% confidence)`],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      error: `Synthesis failed: ${message}`,
      agentLog: [`❌ Synthesis error: ${message}`],
    };
  }
}
