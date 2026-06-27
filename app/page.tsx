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
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (systemPrefersDark ? "dark" : "light");
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
      <div className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-opacity ${theme === 'dark' ? 'opacity-20' : 'opacity-[0.08]'}`}>
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

      {/* Bloomberg Header Bar */}
      <header className="border-b border-border-default bg-bg-surface px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-7xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            {/* Small Hexagon Logo Mark */}
            <div className="w-6 h-6 flex items-center justify-center bg-accent-dim text-accent border border-accent/20 rounded font-mono font-black text-sm">
              ⬡
            </div>
            <div>
              <h1 className="text-base font-mono font-black tracking-wider text-text-primary uppercase leading-none">
                EquityMind
              </h1>
              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest leading-none">
                AI Equity Research Terminal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {comparedStocks.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold bg-accent-dim text-accent rounded border border-accent/20 animate-pulse">
                <Layers size={12} />
                COMPARING {comparedStocks.length}/4 STOCKS
              </span>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 rounded border border-border-default bg-bg-surface hover:border-accent hover:text-accent text-text-secondary transition-colors cursor-pointer flex items-center justify-center"
              aria-label="Toggle Theme"
              title={theme === "dark" ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-6 sm:px-6 grid gap-6 md:grid-cols-12 items-start">
        {/* Left Column (Watchlist Sidebar) */}
        <aside className="md:col-span-4 h-full min-h-[350px] md:min-h-[500px]">
          <WatchlistPanel onResearch={handleResearch} />
        </aside>

        {/* Right Column (Search and Content) */}
        <section className="md:col-span-8 space-y-6">
          {/* Search Inputs */}
          <ResearchInput
            value={inputValue}
            setValue={setInputValue}
            onSubmit={handleResearch}
            isLoading={isLoading}
          />

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
            <div className="panel p-4 border-down/30 bg-down/5 text-down font-mono text-xs">
              &gt; ERROR: {error}
            </div>
          )}

          {/* Live stock chart */}
          {verdict && verdict.ticker && !isLoading && (
            <StockChart ticker={verdict.ticker} />
          )}

          {/* Log trace output */}
          {(logs.length > 0 || isLoading) && (
            <AgentTrace logs={logs} isLoading={isLoading} />
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

          {/* Standalone Comparison Panel (Renders when comparing multiple stocks) */}
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
        </section>
      </main>
    </div>
  );
}
