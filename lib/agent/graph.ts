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
  const initialState: AgentStateType = {
    companyName,
    ticker: null,
    researchNotes: [],
    toolsUsed: [],
    agentLog: [`[START] Initiating equity research for ${companyName}`],
    iterationCount: 0,
    maxIterations: Number(process.env.AGENT_MAX_ITERATIONS) || 3,
    researchComplete: false,
    verdict: null,
    error: null,
  };

  onLog?.(initialState.agentLog[0]);

  let finalState = { ...initialState };

  try {
    const stream = await investmentAgent.stream(initialState);
    for await (const chunk of stream) {
      const nodeName = Object.keys(chunk)[0];
      const nodeOutput = chunk[nodeName];
      if (nodeOutput) {
        finalState = {
          ...finalState,
          ...nodeOutput,
          researchNotes: nodeOutput.researchNotes ? [...finalState.researchNotes, ...nodeOutput.researchNotes] : finalState.researchNotes,
          toolsUsed: nodeOutput.toolsUsed ? [...new Set([...finalState.toolsUsed, ...nodeOutput.toolsUsed])] : finalState.toolsUsed,
          agentLog: nodeOutput.agentLog ? [...finalState.agentLog, ...nodeOutput.agentLog] : finalState.agentLog,
        };

        if (nodeOutput.agentLog && Array.isArray(nodeOutput.agentLog)) {
          for (const logLine of nodeOutput.agentLog) {
            onLog?.(logLine);
          }
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errorLog = `[ERROR] Agent execution failed: ${message}`;
    onLog?.(errorLog);
    finalState.error = message;
    finalState.agentLog = [...finalState.agentLog, errorLog];
  }

  return finalState;
}
