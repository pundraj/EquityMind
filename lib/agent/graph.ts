import { END, StateGraph } from "@langchain/langgraph";
import { AgentState, AgentStateType } from "./state";
import { researcherNode } from "./nodes/researcher";
import { synthesizerNode } from "./nodes/synthesizer";

function shouldContinueResearch(state: AgentStateType): string {
  if (state.error) return "synthesizer";
  if (state.researchComplete) return "synthesizer";
  if (state.iterationCount >= state.maxIterations) return "synthesizer";
  return "researcher";
}

const workflow = new StateGraph(AgentState)
  .addNode("researcher", researcherNode)
  .addNode("synthesizer", synthesizerNode)
  .addEdge("__start__", "researcher")
  .addConditionalEdges("researcher", shouldContinueResearch, {
    researcher: "researcher",
    synthesizer: "synthesizer",
  })
  .addEdge("synthesizer", END);

export const investmentAgent = workflow.compile();

export async function runAgent(companyName: string, onLog?: (message: string) => void) {
  const initialState = {
    companyName,
    ticker: null,
    researchNotes: [],
    toolsUsed: [],
    agentLog: [`🚀 Starting research on ${companyName}...`],
    iterationCount: 0,
    maxIterations: 5,
    researchComplete: false,
    verdict: null,
    error: null,
  };

  onLog?.(initialState.agentLog[0]);

  const result = await investmentAgent.invoke(initialState, {
    callbacks: [
      {
        handleLLMNewToken(token) {
          if (token && token.trim()) onLog?.(token);
        },
      },
    ],
  });

  for (const entry of result.agentLog ?? []) {
    onLog?.(entry);
  }

  return result;
}
