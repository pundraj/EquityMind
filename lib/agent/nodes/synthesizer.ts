import { GoogleGenAI } from "@google/genai";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { AgentStateType, VerdictSchema } from "../state";
import { SYNTHESIZER_SYSTEM_PROMPT, buildSynthesizerMessage } from "../../prompts/synthesizer";


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY,
});
const SYNTHESIZER_MODEL = process.env.SYNTHESIZER_MODEL || process.env.GEMMA_MODEL || "gemma-4-31b";

export async function synthesizerNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  if (state.error) {
    return {
      error: state.error,
    };
  }
  try {
    const isGroq = SYNTHESIZER_MODEL.toLowerCase().includes("llama") || 
                    SYNTHESIZER_MODEL.toLowerCase().includes("groq") || 
                    SYNTHESIZER_MODEL.toLowerCase().includes("mixtral");

    let content = "";

    if (isGroq) {
      const model = new ChatGroq({
        apiKey: process.env.GROQ_API_KEY,
        model: SYNTHESIZER_MODEL,
        temperature: 0,
      });

      const result = await model.invoke([
        new SystemMessage(SYNTHESIZER_SYSTEM_PROMPT),
        new HumanMessage(buildSynthesizerMessage(state)),
      ]);

      content = typeof result.content === "string" ? result.content : JSON.stringify(result.content);
    } else {
      const response = await ai.models.generateContent({
        model: SYNTHESIZER_MODEL,
        contents: buildSynthesizerMessage(state),
        config: {
          systemInstruction: SYNTHESIZER_SYSTEM_PROMPT,
        },
      });
      content = response.text || "";
    }
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
