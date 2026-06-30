"use client";

import React, { useState } from "react";
import { 
  Terminal, 
  BookOpen, 
  Cpu, 
  Layers, 
  Code, 
  Globe, 
  Server
} from "lucide-react";

interface DocumentationPanelProps {
  initialTab?: "guide" | "api";
  onResearch?: (ticker: string) => void;
}

export default function DocumentationPanel({ initialTab = "guide", onResearch }: DocumentationPanelProps) {
  const [activeTab, setActiveTab] = useState<"guide" | "api" | "decisions">(
    initialTab === "api" ? "api" : "guide"
  );

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in text-text-primary">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-default/50 pb-4 gap-4">
        <div>
          <h2 className="text-lg font-mono font-black uppercase text-accent tracking-wider leading-none">
            DEVELOPER_CENTER
          </h2>
          <p className="text-xs font-mono text-text-secondary mt-1">
            Technical Architecture, Build Guides & API Specifications
          </p>
        </div>
        <button
          onClick={() => {
            if (onResearch) {
              const navBtn = document.querySelector('nav button:first-child') as HTMLButtonElement;
              if (navBtn) navBtn.click();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-accent-dim hover:bg-accent-dim/60 text-accent border border-accent/20 hover:border-accent/40 rounded transition-all cursor-pointer uppercase select-none self-start sm:self-center"
        >
          <Terminal size={12} />
          Go to Terminal
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border-default/30 pb-3 font-mono text-xs font-bold">
        <button
          onClick={() => setActiveTab("guide")}
          className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-all cursor-pointer ${
            activeTab === "guide"
              ? "bg-accent text-white border-accent"
              : "bg-bg-surface hover:bg-bg-elevated border-border-default text-text-secondary hover:text-text-primary"
          }`}
        >
          <BookOpen size={13} />
          SYSTEM GUIDE
        </button>

        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-all cursor-pointer ${
            activeTab === "api"
              ? "bg-accent text-white border-accent"
              : "bg-bg-surface hover:bg-bg-elevated border-border-default text-text-secondary hover:text-text-primary"
          }`}
        >
          <Code size={13} />
          API REFERENCE
        </button>
        <button
          onClick={() => setActiveTab("decisions")}
          className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-all cursor-pointer ${
            activeTab === "decisions"
              ? "bg-accent text-white border-accent"
              : "bg-bg-surface hover:bg-bg-elevated border-border-default text-text-secondary hover:text-text-primary"
          }`}
        >
          <Layers size={13} />
          DECISIONS & TRADE-OFFS
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full">
        {/* Tab 1: System Guide */}
        {activeTab === "guide" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Intro Panel */}
            <div className="panel p-6 bg-bg-surface border-border-default/60">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-2">
                <Cpu size={16} /> 01 // OVERVIEW & ARCHITECTURE
              </h3>
              <p className="text-xs font-mono text-text-secondary leading-relaxed mt-3">
                EquityMind is an autonomous AI agent engineered to perform complex, multi-stage equity research. Guided by <strong>Gemma-4</strong> via the Google GenAI SDK, it replaces manual analyst queries by autonomously fetching key metrics, scraping real-time market narratives, and evaluating sentiment indicators to score target companies.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-4 border-t border-border-default/20">
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-mono font-bold uppercase text-text-primary">
                    The Agent Execution Cycle
                  </h4>
                  <p className="text-xs font-mono text-text-secondary leading-relaxed">
                    Rather than a linear pipeline, the agent coordinates two principal nodes using <strong>LangGraph</strong>: a cyclic StateGraph that feeds tool inputs dynamically based on previous execution logs:
                  </p>
                  <ul className="text-xs font-mono text-text-secondary space-y-2 list-disc list-inside mt-1">
                    <li><strong className="text-text-primary">Researcher Node:</strong> Handles tool calls (Yahoo Finance, DuckDuckGo web scraping, CardiffNLP sentiment API).</li>
                    <li><strong className="text-text-primary">Synthesizer Node:</strong> Combines notes, verifies schema structures via Zod, and issues recommendations.</li>
                    <li><strong className="text-text-primary">Loop Controller:</strong> Halts execution after completing the scoring modules (max 6 iterations).</li>
                  </ul>
                </div>

                <div className="bg-bg-elevated/40 p-4 border border-border-default rounded flex flex-col justify-center items-center font-mono">
                  {/* CSS Flowchart Representing Graph */}
                  <div className="text-[10px] w-full max-w-xs space-y-2.5">
                    <div className="text-center font-bold text-accent border border-accent/30 rounded p-1.5 bg-accent-dim">
                      START
                    </div>
                    <div className="text-center text-text-muted">↓</div>
                    <div className="flex justify-between items-center bg-bg-surface border border-border-default rounded p-1.5">
                      <span className="font-bold text-text-primary">Researcher Node</span>
                      <span className="text-[8px] text-text-muted">Queries Tools</span>
                    </div>
                    <div className="text-center text-text-muted">↓</div>
                    <div className="bg-bg-surface border border-border-default rounded p-2 flex flex-col items-center">
                      <span className="font-bold text-text-primary">shouldContinueResearch?</span>
                      <div className="flex justify-between w-full mt-1.5 text-[8px] border-t border-border-default/30 pt-1 text-text-secondary">
                        <span>[Loop ≤ 6] → Researcher</span>
                        <span>[Completed] → Synth</span>
                      </div>
                    </div>
                    <div className="text-center text-text-muted">↓</div>
                    <div className="text-center font-bold text-text-primary border border-border-default rounded p-1.5 bg-bg-surface">
                      Synthesizer Node (Zod Verdict)
                    </div>
                    <div className="text-center text-text-muted">↓</div>
                    <div className="text-center text-green-500 font-bold border border-green-500/20 rounded p-1.5 bg-green-500/5">
                      END (Verdict Output)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scoring Rubric Panel */}
            <div className="panel p-6 bg-bg-surface border-border-default/60">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-2">
                <Layers size={16} /> 02 // SCORING MODEL & METRIC WEIGHTS
              </h3>
              <p className="text-xs font-mono text-text-secondary leading-relaxed mt-3">
                The Synthesizer node evaluates the target company out of 100 points. The weighted overall scorecard consists of the following 5 dimensions:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="p-3 bg-bg-elevated border border-border-default rounded flex flex-col justify-between h-28">
                  <div>
                    <span className="text-[10px] font-mono text-text-muted uppercase">Weight: 30%</span>
                    <h4 className="text-xs font-mono font-bold uppercase text-text-primary mt-1">Financial Health</h4>
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary leading-tight mt-1">PE, margins, cash flow, liquidity.</span>
                </div>
                <div className="p-3 bg-bg-elevated border border-border-default rounded flex flex-col justify-between h-28">
                  <div>
                    <span className="text-[10px] font-mono text-text-muted uppercase">Weight: 20%</span>
                    <h4 className="text-xs font-mono font-bold uppercase text-text-primary mt-1">Valuation</h4>
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary leading-tight mt-1">Historical multiples relative to peers.</span>
                </div>
                <div className="p-3 bg-bg-elevated border border-border-default rounded flex flex-col justify-between h-28">
                  <div>
                    <span className="text-[10px] font-mono text-text-muted uppercase">Weight: 20%</span>
                    <h4 className="text-xs font-mono font-bold uppercase text-text-primary mt-1">Market Moat</h4>
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary leading-tight mt-1">Pricing power, market share, competition.</span>
                </div>
                <div className="p-3 bg-bg-elevated border border-border-default rounded flex flex-col justify-between h-28">
                  <div>
                    <span className="text-[10px] font-mono text-text-muted uppercase">Weight: 15%</span>
                    <h4 className="text-xs font-mono font-bold uppercase text-text-primary mt-1">Sentiment</h4>
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary leading-tight mt-1">Headline analysis of 30-day headlines.</span>
                </div>
                <div className="p-3 bg-bg-elevated border border-border-default rounded flex flex-col justify-between h-28">
                  <div>
                    <span className="text-[10px] font-mono text-text-muted uppercase">Weight: 15%</span>
                    <h4 className="text-xs font-mono font-bold uppercase text-text-primary mt-1">Growth Signals</h4>
                  </div>
                  <span className="text-[10px] font-mono text-text-secondary leading-tight mt-1">TAM expansion, raised guidance, metrics.</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-accent-dim/35 border border-accent/25 rounded text-xs font-mono flex flex-col gap-2">
                <span className="font-bold text-accent font-bold">RECOMMENDATION CATEGORIES:</span>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-1">
                  <div className="px-2.5 py-1 text-center bg-green-500/10 text-green-400 border border-green-500/20 rounded font-bold">STRONG_BUY (80+)</div>
                  <div className="px-2.5 py-1 text-center bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-bold">BUY (65 - 79)</div>
                  <div className="px-2.5 py-1 text-center bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded font-bold">HOLD (45 - 64)</div>
                  <div className="px-2.5 py-1 text-center bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-bold">PASS (25 - 44)</div>
                  <div className="px-2.5 py-1 text-center bg-red-500/10 text-red-400 border border-red-500/20 rounded font-bold">AVOID (0 - 24)</div>
                </div>
              </div>
            </div>
          </div>
        )}



        {/* Tab 3: API Reference */}
        {activeTab === "api" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Global API config */}
            <div className="panel p-6 bg-bg-surface border-border-default/60">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-2">
                <Server size={16} /> SERVER ENDPOINTS & SSE INTEGRATION
              </h3>
              <p className="text-xs font-mono text-text-secondary leading-relaxed mt-3">
                EquityMind exposes core REST and Streaming Server-Sent Events (SSE) interfaces to drive the analytics charts and live researcher execution logs in the client terminal.
              </p>
            </div>

            {/* Endpoint 1 */}
            <div className="border border-border-default rounded-lg bg-bg-surface overflow-hidden">
              <div className="p-4 bg-bg-elevated/65 flex items-center justify-between border-b border-border-default font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded font-black text-[10px]">
                    POST
                  </span>
                  <span className="font-bold text-text-primary">/api/research</span>
                </div>
                <span className="text-[10px] text-text-muted">SSE Stream (Event Stream)</span>
              </div>
              <div className="p-4 text-xs font-mono text-text-secondary space-y-4 leading-relaxed">
                <p>
                  Triggers the LangGraph cyclic research agent on the requested company name. Responses are streamed as they occur using chunked transport, providing a step-by-step insight trace.
                </p>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-text-primary">Request Schema:</span>
                  <pre className="p-3 bg-bg-elevated border border-border-default rounded font-mono text-[10px] text-text-primary">
{`{
  "companyName": "Tesla Inc"
}`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-text-primary">SSE Event Outputs:</span>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-bg-elevated/40 border border-border-default/50 rounded">
                      <strong className="text-accent text-[10px]">event: start</strong>
                      <p className="text-[11px] text-text-secondary mt-0.5">Dispatched when the researcher agent is instantiated. Contains startup logs.</p>
                    </div>
                    <div className="p-2.5 bg-bg-elevated/40 border border-border-default/50 rounded">
                      <strong className="text-yellow-500 text-[10px]">event: log</strong>
                      <p className="text-[11px] text-text-secondary mt-0.5">Dispatched for every action, tool execution, or reasoning step. E.g., calling <code>stock_data</code>, scraping search arrays, sentiment counts.</p>
                    </div>
                    <div className="p-2.5 bg-bg-elevated/40 border border-border-default/50 rounded">
                      <strong className="text-green-500 text-[10px]">event: verdict</strong>
                      <p className="text-[11px] text-text-secondary mt-0.5">Dispatched upon graph conclusion. Yields the final compiled analytical JSON schema validated by Zod.</p>
                    </div>
                    <div className="p-2.5 bg-bg-elevated/40 border border-border-default/50 rounded">
                      <strong className="text-red-500 text-[10px]">event: error</strong>
                      <p className="text-[11px] text-text-secondary mt-0.5">Dispatched if any pipeline crashes or synthesizer fails to parsing logs.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Endpoint 2 */}
            <div className="border border-border-default rounded-lg bg-bg-surface overflow-hidden">
              <div className="p-4 bg-bg-elevated/65 flex items-center justify-between border-b border-border-default font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-black text-[10px]">
                    GET
                  </span>
                  <span className="font-bold text-text-primary">/api/chart</span>
                </div>
                <span className="text-[10px] text-text-muted">JSON Quote Proxy</span>
              </div>
              <div className="p-4 text-xs font-mono text-text-secondary space-y-3 leading-relaxed">
                <p>
                  Fetches standard historic chart ticks for the provided stock ticker. Primarily used to load charts dynamically upon verdict resolutions.
                </p>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-text-primary">Query Parameters:</span>
                  <ul className="list-disc list-inside text-text-muted">
                    <li><strong className="text-text-secondary">ticker</strong> (Required): public symbol e.g., <code>NVDA</code>.</li>
                    <li><strong className="text-text-secondary">range</strong> (Optional): <code>1d</code>, <code>5d</code>, <code>1mo</code> (default), <code>1y</code>.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Endpoint 3 */}
            <div className="border border-border-default rounded-lg bg-bg-surface overflow-hidden">
              <div className="p-4 bg-bg-elevated/65 flex items-center justify-between border-b border-border-default font-mono text-xs">
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-black text-[10px]">
                    GET
                  </span>
                  <span className="font-bold text-text-primary">/api/quotes</span>
                </div>
                <span className="text-[10px] text-text-muted">JSON Spark Proxy</span>
              </div>
              <div className="p-4 text-xs font-mono text-text-secondary space-y-3 leading-relaxed">
                <p>
                  Proxies spark finance nodes to retrieve high-speed market snapshots (price, previous close, percentage change) for the Intelligence Board and watchlists.
                </p>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-text-primary">Query Parameters:</span>
                  <ul className="list-disc list-inside text-text-muted">
                    <li><strong className="text-text-secondary">tickers</strong> (Required): Comma-separated public symbols, e.g., <code>AAPL,TSLA,MSFT</code>.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Decisions */}
        {activeTab === "decisions" && (
          <div className="flex flex-col gap-6 animate-fade-in">
            {/* Global Decisions Card */}
            <div className="panel p-6 bg-bg-surface border-border-default/60 space-y-4">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-accent flex items-center gap-2">
                <Globe size={16} /> SYSTEM DECISIONS & TRADE-OFFS
              </h3>
              <p className="text-xs font-mono text-text-secondary leading-relaxed">
                Building an autonomous hedge fund research agent requires several balance choices. Below is a comprehensive look at why we chose specific solutions over alternatives.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-bg-surface border border-border-default rounded-lg space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Gemma 4 via Google GenAI SDK
                </h4>
                <p className="text-xs font-mono text-text-secondary leading-relaxed">
                  <strong>Choice:</strong> Native Google GenAI SDK running <code>gemma-4-31b-it</code> as the primary engine.
                  <br className="my-2" />
                  <strong>Trade-off:</strong> Highly accurate structured outputs, native tool-calling, and high throughput. Although Sonnet/GPT models have marginally superior context comprehension, the free development tiers and fast execution speeds make Gemma the logical decision.
                </p>
              </div>

              <div className="p-5 bg-bg-surface border border-border-default rounded-lg space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Cheerio-based DDG Scraping
                </h4>
                <p className="text-xs font-mono text-text-secondary leading-relaxed">
                  <strong>Choice:</strong> Web scraping via DuckDuckGo HTML parser instead of Tavily or Google custom search engine.
                  <br className="my-2" />
                  <strong>Trade-off:</strong> Cheerio parsing is free, requires zero credentials/setup, and has zero request quotas. The trade-off is vulnerability to DOM changes on DuckDuckGo search pages, which could block fetches.
                </p>
              </div>

              <div className="p-5 bg-bg-surface border border-border-default rounded-lg space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Resilient Yahoo Finance Fallback
                </h4>
                <p className="text-xs font-mono text-text-secondary leading-relaxed">
                  <strong>Choice:</strong> Automated chart queries fallback when the detailed Yahoo Finance <code>quoteSummary</code> modules fail.
                  <br className="my-2" />
                  <strong>Trade-off:</strong> Prevents API blocker crashes. When detailed quotes fail, the agent fetches basic charts data and prompts itself to perform a <code>web_search</code> specifically for key missing metrics.
                </p>
              </div>

              <div className="p-5 bg-bg-surface border border-border-default rounded-lg space-y-3">
                <h4 className="text-xs font-mono font-bold uppercase text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Server-Sent Events (SSE)
                </h4>
                <p className="text-xs font-mono text-text-secondary leading-relaxed">
                  <strong>Choice:</strong> Streaming traces to the client using SSE instead of persistent WebSockets.
                  <br className="my-2" />
                  <strong>Trade-off:</strong> SSE is natively supported by Next.js edge runtimes and is lightweight. It runs on HTTP, avoiding complex WebSocket Handshake procedures. The drawback is it only supports one-directional streaming.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


