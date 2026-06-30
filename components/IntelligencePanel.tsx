"use client";

import { useEffect, useState } from "react";
import { STOCK_INTELLIGENCE, LATEST_NEWS_ALERTS, StockIntelligence, NewsAlert } from "@/lib/data/intelligence";
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  Activity, 
  PieChart, 
  AlertTriangle, 
  ChevronRight, 
  Info, 
  Search, 
  ArrowUpRight,
  RefreshCw,
  Award,
  ShieldCheck
} from "lucide-react";

interface IntelligencePanelProps {
  onResearch: (ticker: string) => void;
}

type QuoteInfo = {
  price: number;
  change: number;
  changePercent: number;
  name: string;
};

export default function IntelligencePanel({ onResearch }: IntelligencePanelProps) {
  const [quotes, setQuotes] = useState<Record<string, QuoteInfo>>({});
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(true);
  const [selectedStock, setSelectedStock] = useState<StockIntelligence>(STOCK_INTELLIGENCE[0]);
  const [sentimentFilter, setSentimentFilter] = useState<string>("ALL");

  // Fetch live prices for intelligence dashboard stocks
  useEffect(() => {
    async function fetchQuotes() {
      try {
        const allTickers = STOCK_INTELLIGENCE.map((s) => s.ticker).join(",");
        const res = await fetch(`/api/quotes?tickers=${allTickers}`);
        if (res.ok) {
          const data = await res.json();
          if (data.quotes) {
            setQuotes(data.quotes);
          }
        }
      } catch (err) {
        console.error("Failed to fetch quotes for intelligence board", err);
      } finally {
        setIsLoadingQuotes(false);
      }
    }

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate Aggregated Metrics
  const totalStocks = STOCK_INTELLIGENCE.length;
  const averageAIScore = Math.round(
    STOCK_INTELLIGENCE.reduce((acc, curr) => acc + curr.score, 0) / totalStocks
  );
  
  // Market Sentiment is the average of newsSentiment scores
  const averageSentiment = Math.round(
    STOCK_INTELLIGENCE.reduce((acc, curr) => acc + curr.scores.newsSentiment, 0) / totalStocks
  );

  const buyRecommendations = STOCK_INTELLIGENCE.filter(
    (s) => s.recommendation === "STRONG_BUY" || s.recommendation === "BUY"
  ).length;

  const buyRatio = Math.round((buyRecommendations / totalStocks) * 100);

  // Recommendations classes helper
  const getRecStyles = (rec: string) => {
    switch (rec) {
      case "STRONG_BUY":
        return {
          bg: "var(--rec-strong-buy-bg)",
          text: "var(--rec-strong-buy-text)",
          border: "var(--rec-strong-buy-border)"
        };
      case "BUY":
        return {
          bg: "var(--rec-buy-bg)",
          text: "var(--rec-buy-text)",
          border: "var(--rec-buy-border)"
        };
      case "HOLD":
        return {
          bg: "var(--rec-hold-bg)",
          text: "var(--rec-hold-text)",
          border: "var(--rec-hold-border)"
        };
      case "PASS":
        return {
          bg: "var(--rec-pass-bg)",
          text: "var(--rec-pass-text)",
          border: "var(--rec-pass-border)"
        };
      default:
        return {
          bg: "var(--rec-avoid-bg)",
          text: "var(--rec-avoid-text)",
          border: "var(--rec-avoid-border)"
        };
    }
  };

  // SVGs Gauge Math
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  // Arc represents only 180 degrees (semi-circle)
  const semiCircumference = circumference / 2;
  const strokeDashoffset = semiCircumference - (averageSentiment / 100) * semiCircumference;

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in text-text-primary">
      
      {/* 1. TOP ANALYTICAL DASHBOARD HERO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Market Sentiment Gauge Card */}
        <div className="panel p-6 bg-bg-surface border-border-default/60 flex flex-col items-center text-center relative overflow-hidden justify-between h-[250px]">
          <div className="w-full flex items-center justify-between border-b border-border-default/30 pb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
              &gt;_ MARKET_SENTIMENT_INDEX
            </span>
            <span title="Aggregated news sentiment across monitored equities">
              <Info size={12} className="text-text-muted" />
            </span>
          </div>

          <div className="relative flex flex-col items-center justify-center mt-2">
            {/* SVG Arc Gauge */}
            <svg className="w-40 h-24 transform translate-y-2" viewBox="0 0 120 70">
              {/* Background semi-circle */}
              <path
                d="M 10 60 A 50 50 0 0 1 110 60"
                fill="none"
                stroke="var(--border)"
                strokeWidth="10"
                strokeLinecap="round"
              />
              {/* Active semi-circle */}
              <path
                d="M 10 60 A 50 50 0 0 1 110 60"
                fill="none"
                stroke="url(#sentimentGrad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${semiCircumference} ${semiCircumference}`}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
              />
              <defs>
                <linearGradient id="sentimentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--down)" />
                  <stop offset="50%" stopColor="var(--warn)" />
                  <stop offset="100%" stopColor="var(--up)" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Value in Center */}
            <div className="absolute top-[40px] flex flex-col items-center">
              <span className="text-3xl font-mono font-black tracking-tight leading-none text-text-primary">
                {averageSentiment}%
              </span>
              <span className="text-[9px] font-mono font-bold uppercase text-up mt-1 tracking-widest">
                BULLISH STATE
              </span>
            </div>
          </div>

          <p className="text-[11px] font-mono text-text-secondary leading-relaxed">
            Market-wide news volume scores positive. Capital flow favors tech risk.
          </p>
        </div>

        {/* Aggregate Ratings Grid */}
        <div className="panel p-6 bg-bg-surface border-border-default/60 flex flex-col justify-between h-[250px]">
          <div className="w-full flex items-center justify-between border-b border-border-default/30 pb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
              &gt;_ PORTFOLIO_METRIC_SUMMARY
            </span>
            <Activity size={12} className="text-text-muted" />
          </div>

          <div className="grid grid-cols-2 gap-4 py-4 flex-1">
            <div className="border border-border-default bg-bg-elevated/20 p-3 rounded flex flex-col justify-center">
              <span className="text-text-secondary text-[10px] font-mono uppercase tracking-wide">Avg AI Grade</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-mono font-black text-accent">{averageAIScore}</span>
                <span className="text-[10px] font-mono text-text-muted">/100</span>
              </div>
              <span className="text-[9px] font-mono text-text-secondary mt-1 bg-accent-dim text-accent px-1.5 py-0.5 rounded border border-accent/10 w-max">
                BUY BIAS
              </span>
            </div>

            <div className="border border-border-default bg-bg-elevated/20 p-3 rounded flex flex-col justify-center">
              <span className="text-text-secondary text-[10px] font-mono uppercase tracking-wide">Buy Recommendations</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-mono font-black text-up">{buyRatio}%</span>
                <span className="text-[10px] font-mono text-text-muted">Ratio</span>
              </div>
              <span className="text-[9px] font-mono text-text-secondary mt-1 bg-up/10 text-up px-1.5 py-0.5 rounded border border-up/10 w-max">
                {buyRecommendations} / {totalStocks} RUNS
              </span>
            </div>
          </div>

          <p className="text-[10px] font-mono text-text-muted leading-tight">
            Compiled from latest Gemma-4 evaluations across featured tech sectors.
          </p>
        </div>

        {/* Sector Matrix heatmap summary */}
        <div className="panel p-6 bg-bg-surface border-border-default/60 flex flex-col justify-between h-[250px]">
          <div className="w-full flex items-center justify-between border-b border-border-default/30 pb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary">
              &gt;_ SECTOR_RATINGS_MATRIX
            </span>
            <PieChart size={12} className="text-text-muted" />
          </div>

          <div className="flex-1 flex flex-col justify-center gap-2 py-3">
            {/* Tech Sector */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-border-default/30 pb-1.5">
              <span className="font-bold text-text-primary">Semiconductors & AI</span>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">Avg:</span>
                <span className="text-up font-bold bg-up/10 px-1 rounded">78.5</span>
                <span className="text-[9px] text-text-muted">(Top: NVDA)</span>
              </div>
            </div>

            {/* Software Cloud */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-border-default/30 pb-1.5">
              <span className="font-bold text-text-primary">Cloud / Enterprise SW</span>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">Avg:</span>
                <span className="text-up font-bold bg-up/10 px-1 rounded">82.0</span>
                <span className="text-[9px] text-text-muted">(Top: MSFT)</span>
              </div>
            </div>

            {/* Consumer Hardware */}
            <div className="flex items-center justify-between text-xs font-mono border-b border-border-default/30 pb-1.5">
              <span className="font-bold text-text-primary">Consumer Hardware & Ad</span>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">Avg:</span>
                <span className="text-up font-bold bg-up/10 px-1 rounded">78.0</span>
                <span className="text-[9px] text-text-muted">(Top: META)</span>
              </div>
            </div>

            {/* Clean Tech/Auto */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-text-primary">Automotive / Clean Energy</span>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">Avg:</span>
                <span className="text-warn font-bold bg-warn/10 px-1 rounded">55.0</span>
                <span className="text-[9px] text-text-muted">(Top: TSLA)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 2. MIDDLE SPLIT: DYNAMIC NEWS STREAM & TARGET STOCK LIST */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: List of Stocks & Ratings */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-default/50 pb-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-text-secondary">
              &gt;_ TRACKED_STOCK_INTELLIGENCE_LOGS
            </h3>
            <span className="text-[9px] font-mono text-text-muted uppercase">Select Stock For Detailed Breakdown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {STOCK_INTELLIGENCE.map((stock) => {
              const quote = quotes[stock.ticker];
              const price = quote?.price;
              const percentChange = quote?.changePercent ?? 0;
              const isUp = percentChange >= 0;
              const isSelected = selectedStock.ticker === stock.ticker;
              const rec = getRecStyles(stock.recommendation);

              return (
                <div
                  key={stock.ticker}
                  onClick={() => setSelectedStock(stock)}
                  className={`panel p-4 bg-bg-surface hover:bg-bg-elevated/40 transition-all cursor-pointer flex flex-col justify-between h-[155px] ${
                    isSelected ? "border-border-bright ring-1 ring-border-bright" : "border-border-default/60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-bold text-text-primary group-hover:text-accent">
                          {stock.ticker}
                        </span>
                        <span className="text-[10px] font-mono text-text-secondary truncate max-w-[100px]">
                          {stock.name}
                        </span>
                      </div>
                      
                      {/* Price info if available */}
                      <div className="mt-1 flex items-baseline gap-2">
                        {isLoadingQuotes ? (
                          <span className="h-4 w-12 bg-border animate-pulse rounded block"></span>
                        ) : price !== undefined ? (
                          <>
                            <span className="text-xs font-mono font-bold text-text-primary">
                              ${price.toFixed(2)}
                            </span>
                            <span className={`text-[10px] font-mono font-bold flex items-center ${isUp ? "text-up" : "text-down"}`}>
                              {isUp ? "+" : ""}{percentChange.toFixed(2)}%
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-mono text-text-muted">Quote N/A</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <span 
                        className="px-2 py-0.5 text-[9px] font-mono font-bold border rounded uppercase"
                        style={{ backgroundColor: rec.bg, color: rec.text, borderColor: rec.border }}
                      >
                        {stock.recommendation}
                      </span>
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-xs font-mono text-text-secondary">AI:</span>
                        <span className="text-sm font-mono font-bold text-text-primary">{stock.score}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] font-mono text-text-secondary line-clamp-2 mt-2 leading-relaxed">
                    {stock.bullCase}
                  </p>

                  <div className="flex items-center justify-between border-t border-border-default/30 pt-2 mt-2">
                    <span className="text-[9px] font-mono text-text-muted uppercase">
                      CONFIDENCE: {stock.confidenceScore}%
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onResearch(stock.ticker);
                      }}
                      className="flex items-center gap-1 text-[9px] font-mono font-bold text-accent bg-accent-dim hover:bg-accent hover:text-white px-2 py-1 rounded transition-colors border border-accent/20 cursor-pointer"
                    >
                      <Zap size={10} />
                      RUN LIVE RESEARCH
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Live News Alert Feed */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-border-default/50 pb-2">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-text-secondary">
              &gt;_ AI_SENTIMENT_ALERT_FEED
            </h3>
            <span className="text-[9px] font-mono text-text-muted uppercase">REAL-TIME</span>
          </div>

          <div className="panel bg-bg-surface border-border-default/60 p-4 flex flex-col flex-1 h-[375px] xl:h-[490px]">
            {/* Filter buttons */}
            <div className="flex items-center gap-1.5 border-b border-border-default/30 pb-3 mb-3">
              {["ALL", "HIGH", "WARN"].map((filt) => (
                <button
                  key={filt}
                  onClick={() => setSentimentFilter(filt)}
                  className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border uppercase cursor-pointer transition-colors ${
                    sentimentFilter === filt
                      ? "bg-accent border-accent text-white"
                      : "bg-bg-elevated/40 border-border-default text-text-secondary hover:text-accent hover:border-accent"
                  }`}
                >
                  {filt}
                </button>
              ))}
            </div>

            {/* News Lists */}
            <div className="flex-1 overflow-y-auto divide-y divide-border-default/30 pr-1 scrollbar">
              {LATEST_NEWS_ALERTS
                .filter((alert) => {
                  if (sentimentFilter === "HIGH") return alert.sentiment >= 80;
                  if (sentimentFilter === "WARN") return alert.sentiment <= 40;
                  return true;
                })
                .map((alert) => {
                  const isBullish = alert.sentiment >= 75;
                  const isBearish = alert.sentiment <= 40;
                  const scoreColor = isBullish ? "text-up bg-up/10 border-up/20" : isBearish ? "text-down bg-down/10 border-down/20" : "text-warn bg-warn/10 border-warn/20";

                  return (
                    <div key={alert.id} className="py-3 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-accent hover:underline cursor-pointer" onClick={() => onResearch(alert.ticker)}>
                            {alert.ticker}
                          </span>
                          <span className="px-1 text-[8px] border border-border-default rounded bg-bg-elevated text-text-muted uppercase">
                            {alert.category}
                          </span>
                        </div>
                        <span className="text-text-muted text-[9px]">{alert.time}</span>
                      </div>

                      <p className="text-xs font-mono text-text-primary leading-normal">
                        {alert.headline}
                      </p>

                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded ${scoreColor}`}>
                          AI News Sentiment: {alert.sentiment}%
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

      </div>

      {/* 3. BOTTOM EXPANSION: DEEP ANALYSIS OF SELECTED STOCK */}
      {selectedStock && (
        <div className="panel p-6 bg-bg-surface border-border-default/60 flex flex-col gap-6 animate-fade-in">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-default/30 pb-4 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-mono font-black text-text-primary tracking-wider">
                  DEEP_DIVE: {selectedStock.name} ({selectedStock.ticker})
                </h3>
                <span 
                  className="px-2.5 py-0.5 text-xs font-mono font-bold border rounded uppercase"
                  style={(() => {
                    const rec = getRecStyles(selectedStock.recommendation);
                    return { backgroundColor: rec.bg, color: rec.text, borderColor: rec.border };
                  })()}
                >
                  {selectedStock.recommendation}
                </span>
              </div>
              <p className="text-xs font-mono text-text-secondary mt-1">
                Full research dossier synthesized by Gemma-4 reasoning engine.
              </p>
            </div>

            <button
              onClick={() => onResearch(selectedStock.ticker)}
              className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-white bg-accent hover:bg-accent/90 px-4 py-2.5 rounded transition-colors border border-accent/20 cursor-pointer self-start sm:self-center"
            >
              <Zap size={14} />
              DEPLOY ACTIVE AGENT RESEARCH
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Col: Scores & Reasoning */}
            <div className="flex flex-col gap-4">
              <div className="border border-border-default bg-bg-elevated/20 p-4 rounded flex flex-col gap-3">
                <span className="text-xs font-mono font-bold uppercase text-accent tracking-widest border-b border-border-default pb-1">
                  1. DIMENSION_SCORES
                </span>
                
                {/* Score lines */}
                <div className="flex flex-col gap-2.5 font-mono text-xs mt-1">
                  <div>
                    <div className="flex justify-between mb-1 text-text-secondary">
                      <span>Financial Health (30%)</span>
                      <span className="font-bold text-text-primary">{selectedStock.scores.financialHealth}/100</span>
                    </div>
                    <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                      <div className="bg-accent h-full rounded-full" style={{ width: `${selectedStock.scores.financialHealth}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-text-secondary">
                      <span>Valuation (20%)</span>
                      <span className="font-bold text-text-primary">{selectedStock.scores.valuation}/100</span>
                    </div>
                    <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                      <div className="bg-accent h-full rounded-full" style={{ width: `${selectedStock.scores.valuation}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-text-secondary">
                      <span>Market Position (20%)</span>
                      <span className="font-bold text-text-primary">{selectedStock.scores.marketPosition}/100</span>
                    </div>
                    <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                      <div className="bg-accent h-full rounded-full" style={{ width: `${selectedStock.scores.marketPosition}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-text-secondary">
                      <span>News Sentiment (15%)</span>
                      <span className="font-bold text-text-primary">{selectedStock.scores.newsSentiment}/100</span>
                    </div>
                    <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                      <div className="bg-accent h-full rounded-full" style={{ width: `${selectedStock.scores.newsSentiment}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-text-secondary">
                      <span>Growth Signals (15%)</span>
                      <span className="font-bold text-text-primary">{selectedStock.scores.growthSignals}/100</span>
                    </div>
                    <div className="w-full bg-border h-1.5 rounded-full overflow-hidden">
                      <div className="bg-accent h-full rounded-full" style={{ width: `${selectedStock.scores.growthSignals}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="border border-border-default bg-bg-elevated/20 p-4 rounded flex flex-col gap-2">
                <span className="text-xs font-mono font-bold uppercase text-accent tracking-widest border-b border-border-default pb-1">
                  2. KEY_METRICS
                </span>
                <div className="flex flex-col gap-2.5 font-mono text-xs mt-1">
                  {selectedStock.keyMetrics.map((met, idx) => (
                    <div key={idx} className="flex justify-between border-b border-border-default/30 pb-1 text-text-secondary">
                      <span>{met.split(":")[0]}</span>
                      <span className="font-bold text-text-primary">{met.split(":")[1] || ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Col: Bull/Bear & Summary */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              
              <div className="border border-border-default bg-bg-elevated/20 p-4 rounded flex flex-col gap-2">
                <span className="text-xs font-mono font-bold uppercase text-accent tracking-widest border-b border-border-default pb-1 flex items-center gap-1.5">
                  <Award size={12} className="text-accent" />
                  3. SYNTHESIS_SUMMARY
                </span>
                <p className="font-mono text-xs text-text-secondary leading-relaxed mt-1">
                  {selectedStock.reasoning}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Bull Case */}
                <div className="border border-up/20 bg-up/5 p-4 rounded flex flex-col gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-up tracking-widest border-b border-up/20 pb-1 flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-up" />
                    BULL_CASE_CATALYST
                  </span>
                  <p className="font-mono text-xs text-text-secondary leading-relaxed mt-1">
                    {selectedStock.bullCase}
                  </p>
                </div>

                {/* Bear Case */}
                <div className="border border-down/20 bg-down/5 p-4 rounded flex flex-col gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-down tracking-widest border-b border-down/20 pb-1 flex items-center gap-1.5">
                    <TrendingDown size={12} className="text-down" />
                    BEAR_CASE_OVERHANG
                  </span>
                  <p className="font-mono text-xs text-text-secondary leading-relaxed mt-1">
                    {selectedStock.bearCase}
                  </p>
                </div>

              </div>

              {/* Catalysts vs Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Catalysts List */}
                <div className="border border-border-default bg-bg-elevated/10 p-4 rounded flex flex-col gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-text-primary tracking-widest border-b border-border-default pb-1 flex items-center gap-1.5">
                    <ShieldCheck size={12} className="text-up" />
                    KEY_UPWARD_CATALYSTS
                  </span>
                  <ul className="flex flex-col gap-2 font-mono text-xs text-text-secondary mt-1 list-none">
                    {selectedStock.catalysts.map((cat, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="text-up font-bold">✓</span>
                        <span>{cat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks List */}
                <div className="border border-border-default bg-bg-elevated/10 p-4 rounded flex flex-col gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-text-primary tracking-widest border-b border-border-default pb-1 flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-down" />
                    KEY_DOWNWARD_RISKS
                  </span>
                  <ul className="flex flex-col gap-2 font-mono text-xs text-text-secondary mt-1 list-none">
                    {selectedStock.risks.map((risk, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className="text-down font-bold">⚠</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
