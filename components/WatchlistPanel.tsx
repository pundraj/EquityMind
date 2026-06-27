"use client";

import { useEffect, useState } from "react";
import { TOP_10_ACTIVE, TOP_10_LONG_TERM, WatchItem } from "@/lib/data/watchlist";
import { TrendingUp, TrendingDown } from "lucide-react";

interface WatchlistPanelProps {
  onResearch: (ticker: string) => void;
}

type QuoteInfo = {
  price: number;
  change: number;
  changePercent: number;
  name: string;
};

export default function WatchlistPanel({ onResearch }: WatchlistPanelProps) {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "LONG_TERM">("ACTIVE");
  const [quotes, setQuotes] = useState<Record<string, QuoteInfo>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const allTickers = [...TOP_10_ACTIVE, ...TOP_10_LONG_TERM].map((t) => t.ticker).join(",");
        const res = await fetch(`/api/quotes?tickers=${allTickers}`);
        if (res.ok) {
          const data = await res.json();
          if (data.quotes) {
            setQuotes(data.quotes);
          }
        }
      } catch (err) {
        console.error("Watchlist quotes fetch failed", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuotes();
    // Refresh quotes every 60 seconds
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentList = activeTab === "ACTIVE" ? TOP_10_ACTIVE : TOP_10_LONG_TERM;

  return (
    <div className="panel flex flex-col h-full overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-border-default bg-bg-elevated/40">
        <button
          onClick={() => setActiveTab("ACTIVE")}
          className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider transition-colors border-b-2 uppercase ${
            activeTab === "ACTIVE"
              ? "border-accent text-accent bg-bg-surface/50"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Active / Momentum
        </button>
        <button
          onClick={() => setActiveTab("LONG_TERM")}
          className={`flex-1 py-3 text-xs font-mono font-bold tracking-wider transition-colors border-b-2 uppercase ${
            activeTab === "LONG_TERM"
              ? "border-accent text-accent bg-bg-surface/50"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
        >
          Long-Term Picks
        </button>
      </div>

      {/* List Body */}
      <div className="flex-1 overflow-y-auto font-mono text-sm divide-y divide-border-default/50">
        {isLoading ? (
          // Shimmer loading skeleton
          Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between p-3.5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-border-bright rounded" />
                <div className="h-4 w-20 bg-border-bright rounded" />
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-12 bg-border-bright rounded" />
                <div className="h-4 w-14 bg-border-bright rounded" />
              </div>
            </div>
          ))
        ) : (
          currentList.map((item, index) => {
            const quote = quotes[item.ticker];
            const price = quote?.price;
            const changePercent = quote?.changePercent ?? 0;
            const isUp = changePercent >= 0;

            return (
              <button
                key={item.ticker}
                onClick={() => onResearch(item.ticker)}
                className="w-full text-left flex items-center justify-between p-3.5 hover:bg-bg-elevated/50 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 overflow-hidden min-w-0">
                  <span className="text-text-muted text-xs font-bold w-4">{(index + 1).toString().padStart(2, "0")}</span>
                  <div className="overflow-hidden min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-text-primary group-hover:text-accent transition-colors">
                        {item.ticker}
                      </span>
                      <span className="px-1 py-0.5 text-[9px] bg-bg-elevated text-text-secondary border border-border-default rounded">
                        EQUITY
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary truncate">{item.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-bold">
                  {price !== undefined ? (
                    <>
                      <span className="text-text-primary">${price.toFixed(2)}</span>
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-1 rounded text-xs leading-none ${
                          isUp ? "bg-up/10 text-up" : "bg-down/10 text-down"
                        }`}
                      >
                        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {isUp ? "+" : ""}
                        {changePercent.toFixed(2)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-text-muted text-xs">--</span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
