"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ResearchInput from "@/components/ResearchInput";
import AgentTrace from "@/components/AgentTrace";
import VerdictCard from "@/components/VerdictCard";
import WatchlistPanel from "@/components/WatchlistPanel";
import SuggestionBanner from "@/components/SuggestionBanner";
import ComparisonTable from "@/components/ComparisonTable";
import { Layers, Sun, Moon } from "lucide-react";

// Dynamic import for StockChart to avoid Next.js SSR hydration errors
const StockChart = dynamic(() => import("@/components/StockChart"), {
  ssr: false,
});

const Lightfall = dynamic(() => import("@/components/Lightfall"), {
  ssr: false,
});

type ComparedStock = {
  companyName: string;
  ticker: string;
  verdict: any;
};

type SuggestionItem = {
  ticker: string;
  name: string;
};

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [comparedStocks, setComparedStocks] = useState<ComparedStock[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const initialTheme = savedTheme || "light";
    setTheme(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    if (initialTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const handleResearch = async (companyName: string) => {
    setInputValue(companyName);
    setSuggestions([]);
    setLogs([]);
    setVerdict(null);
    setError(null);
    setIsLoading(true);
    setShowLogs(true);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName }),
      });

      if (!response.ok || !response.body) {
        throw new Error(await response.text());
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        while (buffer.includes("\n\n")) {
          const chunk = buffer.slice(0, buffer.indexOf("\n\n"));
          buffer = buffer.slice(buffer.indexOf("\n\n") + 2);
          
          const event = chunk
            .split("\n")
            .map((line) => line.trim())
            .find((line) => line.startsWith("event: "))
            ?.slice(7);
            
          const dataLine = chunk
            .split("\n")
            .map((line) => line.trim())
            .find((line) => line.startsWith("data: "))
            ?.slice(6);

          if (!dataLine) continue;

          try {
            const data = JSON.parse(dataLine);
            if (event === "log" && data.message) {
              setLogs((prev) => [...prev, data.message]);
            }
            if (event === "suggestions" && data.suggestions) {
              setSuggestions(data.suggestions);
            }
            if (event === "verdict" && data.verdict) {
              setVerdict(data.verdict);
              setShowLogs(false);
            }
            if (event === "error" && data.message) {
              setError(data.message);
            }
          } catch {
            continue;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research execution failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCompare = (stock: ComparedStock) => {
    setComparedStocks((prev) => {
      const exists = prev.some((s) => s.ticker.toUpperCase() === stock.ticker.toUpperCase());
      if (exists) {
        return prev.filter((s) => s.ticker.toUpperCase() !== stock.ticker.toUpperCase());
      } else {
        if (prev.length >= 4) return prev; // cap at 4 compared stocks
        return [...prev, stock];
      }
    });
  };

  const handleRemoveCompare = (ticker: string) => {
    setComparedStocks((prev) => prev.filter((s) => s.ticker.toUpperCase() !== ticker.toUpperCase()));
  };

  const handleClearCompare = () => {
    setComparedStocks([]);
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary flex flex-col selection:bg-accent selection:text-bg-base relative overflow-hidden">
      {/* Lightfall background */}
      <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity ${theme === 'dark' ? 'opacity-10' : 'opacity-[0.04]'}`}>
        <Lightfall
          colors={theme === 'dark' ? ['#A6C8FF', '#5227FF', '#FF9FFC'] : ['#5A8EFF', '#4F1FFF', '#FF66F9']}
          backgroundColor={theme === 'dark' ? '#0A0B0E' : '#E2E5E9'}
          speed={0.5}
          streakCount={2}
          streakWidth={1}
          streakLength={1}
          glow={1}
          density={0.6}
          twinkle={1}
          zoom={3}
          backgroundGlow={0.5}
          opacity={1}
          mouseInteraction
          mouseStrength={0.5}
          mouseRadius={1}
        />
      </div>

      {/* Pill-shaped floating header */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-4 sm:px-6 z-20 relative">
        <header className="rounded-full border border-border-default glass-header px-6 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            {/* Small Hexagon Logo Mark */}
            <button 
              onClick={() => {
                setVerdict(null);
                setLogs([]);
                setIsLoading(false);
                setError(null);
                setInputValue("");
              }}
              className="w-6 h-6 flex items-center justify-center bg-accent-dim text-accent border border-accent/20 rounded font-mono font-black text-sm hover:border-accent hover:bg-accent-dim/45 transition-colors cursor-pointer"
            >
              ⬡
            </button>
            <div>
              <h1 className="text-base font-mono font-black tracking-wider text-text-primary uppercase leading-none">
                EquityMind
              </h1>
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest leading-none">
                AI Equity Research Terminal
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[10px] font-mono text-text-primary uppercase font-bold">
            <button 
              onClick={() => {
                setVerdict(null);
                setLogs([]);
                setIsLoading(false);
                setError(null);
                setInputValue("");
              }}
              className="hover:text-accent transition-colors cursor-pointer"
            >
              Terminal
            </button>
            <span className="text-border-default/40">|</span>
            <span className="text-text-secondary cursor-not-allowed">Intelligence</span>
            <span className="text-border-default/40">|</span>
            <span className="text-text-secondary cursor-not-allowed">Documentation</span>
            <span className="text-border-default/40">|</span>
            <span className="text-text-secondary cursor-not-allowed">API Docs</span>
          </nav>

          <div className="flex items-center gap-3">
            {comparedStocks.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold bg-accent-dim text-accent rounded-full border border-accent/20 animate-pulse">
                <Layers size={12} />
                COMPARING {comparedStocks.length}/4 STOCKS
              </span>
            )}
            
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full border border-border-default bg-bg-surface hover:border-accent hover:text-accent text-text-secondary transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
          </div>
        </header>
      </div>

      {/* Main Content Layout */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 z-10 relative flex flex-col gap-6">
        {!(isLoading || verdict || logs.length > 0) ? (
          /* LANDING PAGE LAYOUT */
          <div className="flex flex-col gap-10 py-10 animate-fade-in w-full">
            {/* Landing Hero Section */}
            <section className="text-center space-y-6 max-w-3xl mx-auto py-6">
              <h2 className="text-3xl sm:text-5xl font-mono font-black tracking-tight text-text-primary uppercase leading-tight">
                Institutional-Grade <br />
                <span className="text-accent">
                  Equity Intelligence
                </span>
              </h2>
              <p className="text-sm sm:text-base font-mono text-text-secondary leading-relaxed max-w-2xl mx-auto">
                Deep-dive stock analysis guided by Gemma-4. We query market data, crawl web headlines, evaluate sentiment scores, and reason step-by-step to produce clear, evidence-backed equity verdicts.
              </p>
              
              <div className="pt-4 max-w-xl mx-auto">
                <ResearchInput
                  value={inputValue}
                  setValue={setInputValue}
                  onSubmit={handleResearch}
                  isLoading={isLoading}
                />
              </div>
            </section>

            {/* Featured Watchlists Section */}
            <section className="space-y-4 w-full">
              <div className="flex items-center justify-between border-b border-border-default/50 pb-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-text-secondary">
                  &gt;_ FEATURED_MARKET_WATCHLISTS
                </h3>
                <span className="text-[10px] font-mono text-text-muted">60s Auto Refresh</span>
              </div>
              <WatchlistPanel onResearch={handleResearch} />
            </section>
          </div>
        ) : (
          /* WORKSPACE MODE LAYOUT */
          <div className="flex flex-col gap-6 animate-fade-in w-full">
            {/* Top Workspace Header & Search Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border-default/50 pb-4">
              <div>
                <h2 className="text-lg font-mono font-black uppercase text-accent tracking-wider leading-none">
                  RESEARCH_WORKSPACE
                </h2>
                <p className="text-xs font-mono text-text-secondary mt-1">
                  Analyzing stock dynamics for: <span className="font-bold text-text-primary">{inputValue}</span>
                </p>
              </div>
              <div className="w-full sm:w-96">
                <ResearchInput
                  value={inputValue}
                  setValue={setInputValue}
                  onSubmit={handleResearch}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Suggestions Banner (Spelling suggestions) */}
            {suggestions.length > 0 && (
              <SuggestionBanner
                input={inputValue}
                suggestions={suggestions}
                onSelect={(ticker) => {
                  setInputValue(ticker);
                  handleResearch(ticker);
                }}
              />
            )}

            {/* Error Banner */}
            {error && (
              <div className="panel p-6 border-down/30 bg-down/5 text-down font-mono text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <p className="font-bold text-sm uppercase tracking-wider">&gt;_ RESEARCH_EXECUTION_FAILED</p>
                  <p className="text-text-secondary leading-normal">{error}</p>
                </div>
                <button
                  onClick={() => handleResearch(inputValue)}
                  className="px-4 py-2 bg-accent hover:bg-accent/90 text-white font-bold uppercase rounded transition-colors cursor-pointer select-none self-start sm:self-center"
                >
                  Retry Research
                </button>
              </div>
            )}

            {/* Workspace Content Stack */}
            <div className="flex flex-col gap-6 w-full animate-fade-in">
              {/* Accordion to toggle logs */}
              {(logs.length > 0 || isLoading) && (
                <div className="w-full">
                  <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="w-full flex items-center justify-between px-5 py-3 rounded border border-border-default bg-bg-surface hover:border-accent hover:text-accent font-mono text-xs uppercase transition-colors cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-2 font-bold">
                      <span>{showLogs ? "▼" : "▶"}</span>
                      <span>Show Agent Execution Trace Logs</span>
                    </span>
                    <span className="text-[10px] text-text-secondary bg-bg-elevated px-2 py-0.5 rounded border border-border-default">
                      {logs.length} Log entries
                    </span>
                  </button>
                  {showLogs && (
                    <div className="mt-3 animate-fade-in w-full">
                      <AgentTrace logs={logs} isLoading={isLoading} />
                    </div>
                  )}
                </div>
              )}

              {/* Live stock chart */}
              {verdict && verdict.ticker && !isLoading && (
                <StockChart ticker={verdict.ticker} />
              )}

              {/* Structured Verdict Report */}
              {verdict && !isLoading && (
                <VerdictCard
                  verdict={verdict}
                  onResearch={(ticker) => {
                    setInputValue(ticker);
                    handleResearch(ticker);
                  }}
                  comparedStocks={comparedStocks}
                  onToggleCompare={() =>
                    handleToggleCompare({
                      companyName: verdict.companyName || inputValue,
                      ticker: verdict.ticker || inputValue,
                      verdict,
                    })
                  }
                  onRemoveCompare={handleRemoveCompare}
                  onClearCompare={handleClearCompare}
                />
              )}

              {/* Standalone Comparison Panel */}
              {comparedStocks.length >= 2 && !verdict && (
                <div className="panel p-6 bg-bg-surface border-border-default/60">
                  <ComparisonTable
                    comparedStocks={comparedStocks}
                    onRemove={handleRemoveCompare}
                    onClearAll={handleClearCompare}
                    onResearch={handleResearch}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Clean Developer Details Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 mt-auto border-t border-border-default/30 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-text-muted">
        <div>
          <span>© {new Date().getFullYear()} EQUITYMIND. ALL RIGHTS RESERVED.</span>
        </div>
        <div className="flex items-center gap-4">
          <span>DEVELOPER DETAILS:</span>
          <a
            href="https://github.com/pundraj"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-accent transition-colors font-bold underline decoration-dotted"
          >
            GITHUB.COM/PUNDRAJ
          </a>
          <span className="opacity-30">|</span>
          <a
            href="https://rajz.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-accent transition-colors font-bold underline decoration-dotted"
          >
            RAJZ.VERCEL.APP
          </a>
        </div>
      </footer>
    </div>
  );
}
