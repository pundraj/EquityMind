"use client";

import { useState } from "react";
import { TrendingUp, Award, Clock, Plus, Check, ShieldAlert, Sparkles, AlertTriangle, ArrowUpRight, X } from "lucide-react";
import ComparisonTable from "./ComparisonTable";

interface VerdictCardProps {
  verdict: any;
  onResearch: (ticker: string) => void;
  comparedStocks: Array<{
    companyName: string;
    ticker: string;
    verdict: any;
  }>;
  onToggleCompare: () => void;
  onRemoveCompare: (ticker: string) => void;
  onClearCompare: () => void;
}

const COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  STRONG_BUY: { bg: "bg-rec-sb-bg", text: "text-rec-sb-text", border: "border-rec-sb-border", accent: "var(--rec-strong-buy-text)" },
  BUY: { bg: "bg-rec-b-bg", text: "text-rec-b-text", border: "border-rec-b-border", accent: "var(--rec-buy-text)" },
  HOLD: { bg: "bg-rec-h-bg", text: "text-rec-h-text", border: "border-rec-h-border", accent: "var(--rec-hold-text)" },
  PASS: { bg: "bg-rec-p-bg", text: "text-rec-p-text", border: "border-rec-p-border", accent: "var(--rec-pass-text)" },
  AVOID: { bg: "bg-rec-a-bg", text: "text-rec-a-text", border: "border-rec-a-border", accent: "var(--rec-avoid-text)" },
};

export default function VerdictCard({
  verdict,
  onResearch,
  comparedStocks,
  onToggleCompare,
  onRemoveCompare,
  onClearCompare,
}: VerdictCardProps) {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "DEEP_DIVE" | "COMPARISON">("OVERVIEW");

  const rec = verdict.recommendation || "PASS";
  const c = COLORS[rec] || COLORS.PASS;
  
  const scores = verdict.scores || {
    financialHealth: 50,
    valuation: 50,
    marketPosition: 50,
    newsSentiment: 50,
    growthSignals: 50,
  };

  const weightedScore = Math.round(
    scores.financialHealth * 0.3 +
      scores.valuation * 0.2 +
      scores.marketPosition * 0.2 +
      scores.newsSentiment * 0.15 +
      scores.growthSignals * 0.15
  );

  const breakdown = verdict.decisionBreakdown || {};
  const getBreakdownReasoning = (key: string, label: string) => {
    return breakdown[key] || `No specific ${label} analytical reasoning has been returned in the research verdict.`;
  };

  const getScoreColor = (val: number) => {
    if (val >= 70) return "bg-up";
    if (val >= 50) return "bg-warn";
    return "bg-down";
  };

  const getScoreTextClass = (val: number) => {
    if (val >= 70) return "text-up";
    if (val >= 50) return "text-warn";
    return "text-down";
  };

  // Check if stock is already added to comparison
  const isCompared = comparedStocks.some((s) => s.ticker.toUpperCase() === (verdict.ticker || "").toUpperCase());
  const canAddMore = comparedStocks.length < 4;

  const catalysts = verdict.catalysts || [];
  const risks = verdict.risks || [];
  const keyMetrics = verdict.keyMetrics || [];
  const target = verdict.targetPriceRange || { low: null, high: null, basis: "N/A" };
  const peers = verdict.comparablePeers || [];
  const timeHorizonStr = (verdict.timeHorizon || "MEDIUM_TERM").replace("_", " ");

  // Format reasoning paragraph block splitting by newlines
  const reasoningParagraphs = (verdict.reasoning || "")
    .split("\n")
    .map((p: string) => p.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Tab Selectors */}
      <div className="flex border-b border-border-default bg-bg-surface p-1 rounded-t-lg">
        {["OVERVIEW", "DEEP_DIVE", "COMPARISON"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-xs font-mono font-bold tracking-wider rounded transition-colors cursor-pointer uppercase ${
              activeTab === tab
                ? "bg-bg-elevated text-accent border border-border-bright"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {activeTab === "OVERVIEW" && (
        <div className={`panel p-6 border border-border-default bg-bg-surface space-y-6`}>
          {/* Header Row */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between border-b border-border-default/50 pb-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-text-secondary font-mono">VERDICT REPORT</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-bg-elevated text-text-primary rounded border border-border-bright">
                  {verdict.ticker || "EQUITY"}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono bg-bg-elevated text-text-primary rounded border border-border-bright">
                  <Clock size={10} className="text-accent" />
                  {timeHorizonStr}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <h2 className={`text-4xl font-mono font-black tracking-tight ${c.text}`}>{rec}</h2>
                <div className="bg-bg-elevated px-3 py-1.5 rounded border border-border-bright flex items-center gap-1.5 font-mono text-xs">
                  <Award size={14} className="text-accent" />
                  <span>CONFIDENCE: <strong className="text-text-primary">{verdict.confidenceScore}%</strong></span>
                </div>
              </div>
            </div>

            {/* Compare Action Button */}
            <div className="self-start md:self-center">
              <button
                disabled={!isCompared && !canAddMore}
                onClick={onToggleCompare}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-mono font-bold uppercase transition-all border cursor-pointer ${
                  isCompared
                    ? "bg-down/10 text-down border-down/25 hover:bg-down/20"
                    : !canAddMore
                    ? "bg-bg-elevated text-text-muted border-border-default cursor-not-allowed"
                    : "bg-accent text-bg-base border-accent hover:bg-accent/80"
                }`}
              >
                {isCompared ? (
                  <>
                    <X size={12} />
                    Remove Compare
                  </>
                ) : (
                  <>
                    <Plus size={12} />
                    Add to Compare
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Scores Overview Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Weighted Composite score */}
            <div className="panel p-5 bg-bg-elevated/20 space-y-4">
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-text-secondary font-bold">COMPOSITE TERM SCORE</span>
                <span className={`text-xl font-bold ${getScoreTextClass(weightedScore)}`}>{weightedScore}/100</span>
              </div>
              <div className="w-full bg-border-bright/40 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${getScoreColor(weightedScore)}`}
                  style={{ width: `${weightedScore}%` }}
                />
              </div>
              <p className="text-xs text-text-secondary font-sans leading-relaxed">
                The composite rating is a weighted calculation reflecting fundamentals (30%), valuation (20%), market position (20%), sentiment (15%), and growth vectors (15%).
              </p>
            </div>

            {/* Dimensional scores progress bars */}
            <div className="panel p-5 bg-bg-elevated/20 space-y-3.5">
              <h3 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider mb-2">
                SCORING MATRIX (HOVER FOR ANALYSIS)
              </h3>
              {Object.entries(scores).map(([key, val]: any) => {
                const label = key.replace(/([A-Z])/g, " $1");
                const reasoningText = getBreakdownReasoning(key + "Reasoning", label);
                const colorClass = getScoreColor(val);
                const textClass = getScoreTextClass(val);

                return (
                  <div key={key} className="space-y-1 relative group cursor-help">
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-text-primary font-bold uppercase text-[11px] tracking-wide">{label}</span>
                      <span className={`font-bold ${textClass}`}>{val}</span>
                    </div>
                    <div className="w-full bg-border-bright/40 rounded h-2 overflow-hidden">
                      <div className={`h-full rounded transition-all duration-700 ${colorClass}`} style={{ width: `${val}%` }} />
                    </div>

                    {/* Rich absolute CSS tooltip on hover */}
                    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-bg-elevated text-xs text-text-primary rounded border border-border-bright shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 leading-relaxed font-sans normal-case font-normal">
                      <div className="font-bold font-mono text-[10px] text-accent uppercase mb-1 border-b border-border-default/50 pb-0.5">
                        {label} Analysis
                      </div>
                      {reasoningText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bull Case & Bear Case */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="panel p-5 border-l-4 border-l-up bg-bg-elevated/10">
              <div className="flex items-center gap-1.5 text-up font-mono text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles size={14} />
                Bull Thesis
              </div>
              <p className="text-sm leading-relaxed text-text-primary">{verdict.bullCase}</p>
            </div>
            <div className="panel p-5 border-l-4 border-l-down bg-bg-elevated/10">
              <div className="flex items-center gap-1.5 text-down font-mono text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldAlert size={14} />
                Bear Risks
              </div>
              <p className="text-sm leading-relaxed text-text-primary">{verdict.bearCase}</p>
            </div>
          </div>

          {/* Catalysts and Risks lists */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Catalysts list */}
            <div className="panel p-5 space-y-3 bg-bg-elevated/10">
              <h3 className="text-xs font-mono font-bold text-up uppercase tracking-wider border-b border-border-default/50 pb-1.5">
                UPCOMING BULL CATALYSTS (6-12M)
              </h3>
              {catalysts.length === 0 ? (
                <p className="text-xs text-text-muted">No catalysts specified.</p>
              ) : (
                <ol className="space-y-2 text-xs font-mono">
                  {catalysts.map((cat: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-text-primary">
                      <span className="text-up font-bold shrink-0">{idx + 1}.</span>
                      <span className="font-sans leading-relaxed">{cat}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Risks list */}
            <div className="panel p-5 space-y-3 bg-bg-elevated/10">
              <h3 className="text-xs font-mono font-bold text-down uppercase tracking-wider border-b border-border-default/50 pb-1.5">
                CRITICAL BEAR RISKS & TRIGGERS
              </h3>
              {risks.length === 0 ? (
                <p className="text-xs text-text-muted">No risk factors specified.</p>
              ) : (
                <ol className="space-y-2 text-xs font-mono">
                  {risks.map((risk: string, idx: number) => (
                    <li key={idx} className="flex gap-2 text-text-primary">
                      <span className="text-down font-bold shrink-0">{idx + 1}.</span>
                      <span className="font-sans leading-relaxed">{risk}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>

          {/* Target Price and Peers */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Target price card */}
            <div className="panel p-5 bg-bg-elevated/10 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider border-b border-border-default/50 pb-1.5 mb-3">
                  TARGET VALUATION RANGE
                </h3>
                {target.low !== null || target.high !== null ? (
                  <div className="flex items-baseline gap-2 font-mono">
                    <span className="text-2xl font-bold text-text-primary">
                      {target.low !== null ? `$${target.low.toFixed(2)}` : "N/A"}
                    </span>
                    <span className="text-text-muted font-bold">-</span>
                    <span className="text-2xl font-bold text-text-primary">
                      {target.high !== null ? `$${target.high.toFixed(2)}` : "N/A"}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm font-mono text-text-secondary">Undetermined price target range.</p>
                )}
              </div>
              <div className="mt-3 text-xs text-text-secondary leading-relaxed">
                Basis: <span className="text-text-primary font-mono">{target.basis || "N/A"}</span>
              </div>
            </div>

            {/* Comparable peers */}
            <div className="panel p-5 bg-bg-elevated/10">
              <h3 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider border-b border-border-default/50 pb-1.5 mb-3">
                COMPARABLE SECTOR PEERS
              </h3>
              {peers.length === 0 ? (
                <p className="text-xs text-text-muted font-mono">No sector peers listed.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {peers.map((peer: string) => (
                    <button
                      key={peer}
                      onClick={() => onResearch(peer)}
                      className="px-3 py-2 text-xs font-mono font-bold panel border-border-default hover:border-accent hover:bg-accent-dim text-accent transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>{peer.toUpperCase()}</span>
                      <ArrowUpRight size={10} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics Pills */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
              HIGHLIGHTED RESEARCH KEY METRICS
            </h3>
            <div className="flex flex-wrap gap-2">
              {keyMetrics.length === 0 ? (
                <span className="text-xs text-text-muted font-mono">No metrics highlighted.</span>
              ) : (
                keyMetrics.map((metric: string, index: number) => (
                  <span
                    key={index}
                    className="font-mono text-xs px-2.5 py-1 bg-bg-elevated border border-border-default rounded text-text-primary"
                  >
                    {metric}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Freshness Footer */}
          <div className="flex items-center justify-between border-t border-border-default/50 pt-4 font-mono text-xs text-text-secondary">
            <span>DATA INTEGRITY SECURE</span>
            <span>{verdict.dataFreshness || "Data timestamp N/A"}</span>
          </div>
        </div>
      )}

      {activeTab === "DEEP_DIVE" && (
        <div className="panel p-6 bg-bg-surface space-y-6">
          {/* Summary thesis block */}
          <div className="space-y-3 pb-5 border-b border-border-default/50">
            <h2 className="text-base font-mono font-bold text-accent uppercase tracking-wider">
              COMPREHENSIVE CIO INVESTMENT THESIS
            </h2>
            <div className="space-y-4 text-sm leading-relaxed text-text-primary font-sans">
              {reasoningParagraphs.map((para: string, idx: number) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>

          {/* Scoring reasoning cards */}
          <div className="space-y-5">
            <h2 className="text-sm font-mono font-bold text-text-secondary uppercase tracking-wider">
              DETAILED SCORING RUBRIC BREAKDOWN
            </h2>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(scores).map(([key, val]: any) => {
                const label = key.replace(/([A-Z])/g, " $1");
                const reasoningText = getBreakdownReasoning(key + "Reasoning", label);
                const colorClass = getScoreColor(val);
                const textClass = getScoreTextClass(val);

                return (
                  <div key={key} className="panel p-4 bg-bg-elevated/20 flex flex-col justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wide text-text-primary">
                          {label}
                        </h4>
                        <span className={`font-mono font-bold text-sm ${textClass}`}>{val}</span>
                      </div>
                      <div className="w-full bg-border-bright/40 rounded h-1.5 overflow-hidden">
                        <div className={`h-full rounded ${colorClass}`} style={{ width: `${val}%` }} />
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed font-sans flex-1">
                      {reasoningText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "COMPARISON" && (
        <div className="panel p-6 bg-bg-surface">
          <ComparisonTable
            comparedStocks={comparedStocks}
            onRemove={onRemoveCompare}
            onClearAll={onClearCompare}
            onResearch={onResearch}
          />
        </div>
      )}
    </div>
  );
}
