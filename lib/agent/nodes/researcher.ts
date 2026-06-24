import { ChatGroq } from "@langchain/groq";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { AgentStateType, ResearchNote } from "../state";
import { RESEARCHER_SYSTEM_PROMPT, buildResearcherMessage } from "../../prompts/researcher";
import { companyLookupTool, marketDataTool, sentimentTool, webSearchTool } from "../tools";

const llm = new ChatGroq({
  model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  temperature: 0.1,
  apiKey: process.env.GROQ_API_KEY,
}).bindTools([companyLookupTool, marketDataTool, webSearchTool, sentimentTool]);

const noTool = tool(async () => "No tool requested.", {
  name: "no_op",
  description: "A no-op tool for unsupported actions.",
  schema: z.object({}),
});

export async function researcherNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const systemPrompt = RESEARCHER_SYSTEM_PROMPT;
  const humanMessage = buildResearcherMessage(state);
  const response = await llm.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: humanMessage },
  ]);

  const content = typeof response.content === "string" ? response.content : JSON.stringify(response.content);
  const researchComplete = content.toLowerCase().includes("researchcomplete = true") || state.iterationCount >= state.maxIterations - 1;

  const notes: ResearchNote[] = [];
  const log: string[] = [];
  const toolsUsedThisRound: string[] = [];
  const toolCalls = response.tool_calls ?? [];

  if (toolCalls.length === 0) {
    log.push(`ℹ️ ${content.substring(0, 200)}`);
  }

  for (const call of toolCalls) {
    const toolName = call.name;
    const args = call.args ?? {};
    const toolInstance = [companyLookupTool, marketDataTool, webSearchTool, sentimentTool].find((item) => item.name === toolName) ?? noTool;
    log.push(`🔍 ${toolName}: ${JSON.stringify(args)}`);
    const result = await toolInstance.invoke(args);
    notes.push({
      tool: toolName,
      query: JSON.stringify(args),
      result: String(result),
      timestamp: new Date().toISOString(),
    });
    toolsUsedThisRound.push(toolName);
    log.push(`✅ ${toolName} complete`);
  }

  return {
    researchNotes: notes,
    toolsUsed: toolsUsedThisRound,
    agentLog: log,
    iterationCount: state.iterationCount + 1,
    ticker: state.ticker,
    researchComplete,
  };
}
