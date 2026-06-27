import { GoogleGenAI, Type } from "@google/genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { AgentStateType, ResearchNote } from "../state";
import { RESEARCHER_SYSTEM_PROMPT, buildResearcherMessage } from "../../prompts/researcher";
import { companyLookupTool, marketDataTool, sentimentTool, webSearchTool } from "../tools";

interface ResearchTool {
  name: string;
  invoke(input: Record<string, unknown>): Promise<unknown>;
}

const researchTools: ResearchTool[] = [companyLookupTool, marketDataTool, webSearchTool, sentimentTool];

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY,
});
const GEMMA_MODEL = process.env.GEMMA_MODEL || "gemma-4-31b";

const noTool = tool(async () => "No tool requested.", {
  name: "no_op",
  description: "A no-op tool for unsupported actions.",
  schema: z.object({}),
});

export async function researcherNode(state: AgentStateType): Promise<Partial<AgentStateType>> {
  const systemPrompt = RESEARCHER_SYSTEM_PROMPT;
  const humanMessage = buildResearcherMessage(state);

  const response = await ai.models.generateContent({
    model: GEMMA_MODEL,
    contents: humanMessage,
    config: {
      systemInstruction: systemPrompt,
      tools: [
        {
          functionDeclarations: [
            {
              name: "company_lookup",
              description: "Resolve a company name to a public ticker symbol and exchange using Yahoo Finance search.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  companyName: {
                    type: Type.STRING,
                    description: "Company name such as Apple, NVIDIA, Tesla",
                  },
                },
                required: ["companyName"],
              },
            },
            {
              name: "market_data",
              description: "Fetch public fundamentals and valuation metrics for a ticker symbol from Yahoo Finance.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  ticker: {
                    type: Type.STRING,
                    description: "Public stock ticker symbol, such as AAPL or NVDA",
                  },
                },
                required: ["ticker"],
              },
            },
            {
              name: "web_search",
              description: "Search public web pages for recent earnings, headlines, analyst commentary, and market position.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  query: {
                    type: Type.STRING,
                    description: "Main search query",
                  },
                  focus: {
                    type: Type.STRING,
                    description: "Optional focus such as earnings, guidance, analyst ratings, moat",
                  },
                },
                required: ["query"],
              },
            },
            {
              name: "sentiment",
              description: "Score the tone of public headlines for a company using Hugging Face or a keyword fallback.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  headlines: {
                    type: Type.STRING,
                    description: "News headlines separated by newlines",
                  },
                  companyName: {
                    type: Type.STRING,
                    description: "Company name for context",
                  },
                },
                required: ["headlines", "companyName"],
              },
            },
          ],
        },
      ],
    },
  });

  const content = response.text || "";
  const researchComplete = content.toLowerCase().includes("researchcomplete = true") || state.iterationCount >= state.maxIterations - 1;

  const notes: ResearchNote[] = [];
  const log: string[] = [];
  const toolsUsedThisRound: string[] = [];

  const functionCalls = response.functionCalls || [];
  const toolCalls = functionCalls
    .filter((call) => !!call.name)
    .map((call) => ({
      name: call.name as string,
      args: call.args as Record<string, unknown>,
    }));

  if (toolCalls.length === 0) {
    log.push(`[INFO] ${content.substring(0, 200)}`);
  }

  let updatedTicker = state.ticker;
  let stateError = state.error;
  let finalResearchComplete = researchComplete;

  for (const call of toolCalls) {
    const toolName = call.name;
    const args = call.args;
    const toolInstance = researchTools.find((item) => item.name === toolName) ?? noTool;
    log.push(`[CALL] ${toolName}: ${JSON.stringify(args)}`);
    
    let result = "";
    try {
      const res = await toolInstance.invoke(args);
      result = String(res);
      
      let detail = "";
      if (toolName === "company_lookup") {
        try {
          const parsed = JSON.parse(result);
          detail = parsed.ticker ? `Resolved ticker ${parsed.ticker}` : `No ticker found`;
        } catch {
          detail = `Resolved ticker search`;
        }
      } else if (toolName === "market_data") {
        try {
          const parsed = JSON.parse(result);
          if (parsed.error) {
            detail = `Metrics unavailable: ${parsed.error}`;
          } else {
            const priceVal = parsed.price !== undefined ? parsed.price : (parsed.currentPrice !== undefined ? parsed.currentPrice : null);
            const priceStr = priceVal !== null ? `Price: $${priceVal}` : "Price: N/A";
            const peStr = parsed.peRatio ? `, P/E: ${parsed.peRatio}` : "";
            const capStr = parsed.marketCap ? `, Cap: ${parsed.marketCap}` : "";
            detail = `Fetched financials (${priceStr}${peStr}${capStr})`;
          }
        } catch {
          detail = `Fetched financial metrics`;
        }
      } else if (toolName === "web_search") {
        try {
          const parsed = JSON.parse(result);
          const count = parsed.results ? parsed.results.length : 0;
          detail = `Retrieved ${count} relevant web sources`;
        } catch {
          detail = `Retrieved web search results`;
        }
      } else if (toolName === "sentiment") {
        try {
          const parsed = JSON.parse(result);
          detail = parsed.score !== undefined ? `Computed sentiment score of ${parsed.score}% (${parsed.overallSentiment})` : `Analyzed news sentiment`;
        } catch {
          detail = `Analyzed news sentiment`;
        }
      } else {
        detail = `Execution completed`;
      }
      
      log.push(`[SUCCESS] ${toolName} - ${detail}`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      result = JSON.stringify({ error: errMsg });
      log.push(`[ERROR] ${toolName} failed: ${errMsg}`);
    }

    notes.push({
      tool: toolName,
      query: JSON.stringify(args),
      result: result,
      timestamp: new Date().toISOString(),
    });

    if (toolName === "company_lookup") {
      try {
        const parsed = JSON.parse(result);
        if (parsed.ticker) {
          updatedTicker = parsed.ticker;
        } else if (parsed.error === "NOT_FOUND") {
          stateError = result;
          finalResearchComplete = true;
        }
      } catch (e) {
        // Fallback if not JSON
      }
    }

    toolsUsedThisRound.push(toolName);
  }

  return {
    researchNotes: notes,
    toolsUsed: toolsUsedThisRound,
    agentLog: log,
    iterationCount: state.iterationCount + 1,
    ticker: updatedTicker,
    researchComplete: finalResearchComplete,
    error: stateError,
  };
}
