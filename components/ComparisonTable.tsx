"use client";

import { useEffect, useState } from "react";
import { X, RefreshCw, BarChart2 } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import CompanyLogo from "./CompanyLogo";


interface ComparisonTableProps {
  comparedStocks: Array<{
    companyName: string;
    ticker: string;
    verdict: any;
  }>;
  onRemove: (ticker: string) => void;
  onClearAll: () => void;
  onResearch: (ticker: string) => void;
}

const RECOMMENDATION_COLORS: Record<string, { text: string; bg: string }> = {
  STRONG_BUY: { text: "text-rec-sb-text", bg: "bg-rec-sb-bg border-rec-sb-border" },
  BUY: { text: "text-rec-b-text", bg: "bg-rec-b-bg border-rec-b-border" },
  HOLD: { text: "text-rec-h-text", bg: "bg-rec-h-bg border-rec-h-border" },
  PASS: { text: "text-rec-p-text", bg: "bg-rec-p-bg border-rec-p-border" },
  AVOID: { text: "text-rec-a-text", bg: "bg-rec-a-bg border-rec-a-border" },
};

const CHART_LINE_COLORS = ["var(--accent)", "var(--rec-buy-text)", "var(--warn)", "var(--rec-avoid-text)"];

export default function ComparisonTable({
  comparedStocks,
  onRemove,
  onClearAll,
  onResearch,
}: ComparisonTableProps) {
  const [range, setRange] = useState<string>("1mo");
  const [chartDataList, setChartDataList] = useState<any[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  // Fetch charts for all compared stocks for the overlay line chart
  useEffect(() => {
    if (comparedStocks.length < 2) return;

    async function fetchAllCharts() {
      setIsChartLoading(true);
      setChartError(null);
      try {
        const promises = comparedStocks.map((stock) =>
          fetch(`/api/chart?ticker=${encodeURIComponent(stock.ticker)}&range=${range}`).then((res) => {
            if (!res.ok) throw new Error(`Failed to load ${stock.ticker}`);
            return res.json();
          })
        );
        const results = await Promise.all(promises);
        setChartDataList(results);
      } catch (err) {
        setChartError("Could not load comparison chart overlay data.");
      } finally {
        setIsChartLoading(false);
      }
    }

    fetchAllCharts();
  }, [comparedStocks, range]);

  if (comparedStocks.length === 0) return null;

  // Calculate composite scores for easier mapping
  const stocksWithScore = comparedStocks.map((stock) => {
    const v = stock.verdict;
    const compositeScore = Math.round(
      v.scores.financialHealth * 0.3 +
        v.scores.valuation * 0.2 +
        v.scores.marketPosition * 0.2 +
        v.scores.newsSentiment * 0.15 +
        v.scores.growthSignals * 0.15
    );
    return { ...stock, compositeScore };
  });

  // Highlight highest numeric score helper
  const getIsHighest = (metricPath: string, currentVal: number) => {
    const values = stocksWithScore.map((stock) => {
      if (metricPath === "compositeScore") return stock.compositeScore;
      if (metricPath === "confidenceScore") return stock.verdict.confidenceScore;
      // path looks like "scores.financialHealth"
      const scoreKey = metricPath.split(".")[1];
      return stock.verdict.scores[scoreKey] ?? 0;
    });
    const maxVal = Math.max(...values);
    return currentVal === maxVal && values.filter((v) => v === maxVal).length < values.length;
  };

  // Build combined data array for normalised overlay line chart
  // Normalise each price at time T: % change = ((price_t - price_start) / price_start) * 100
  let combinedChartData: any[] = [];
  if (chartDataList.length >= 2 && !isChartLoading && !chartError) {
    const minLength = Math.min(...chartDataList.map((d) => d.closes.length));
    if (minLength > 0) {
      combinedChartData = Array.from({ length: minLength }).map((_, idx) => {
        const timestamp = chartDataList[0].timestamps[idx];
        const dataPoint: any = {
          time: timestamp * 1000,
          dateStr: new Date(timestamp * 1000).toLocaleDateString([], { month: "short", day: "numeric" }),
        };

        chartDataList.forEach((cData) => {
          const closes = cData.closes;
          const firstClose = closes[0];
          const currentClose = closes[idx];
          if (firstClose && currentClose !== null && currentClose !== undefined) {
            const pctChange = ((currentClose - firstClose) / firstClose) * 100;
            dataPoint[cData.ticker] = Number(pctChange.toFixed(2));
          }
        });
        return dataPoint;
      });
    }
  }

  const formatXAxis = (tickItem: number) => {
    return new Date(tickItem).toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      {/* Header and buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-mono font-bold text-text-primary flex items-center gap-2">
            <span>COMPARE SURFACES</span>
            <span className="text-xs bg-accent-dim text-accent px-2 py-0.5 rounded font-bold border border-accent/20">
              {comparedStocks.length} STOCKS
            </span>
          </h2>
          <p className="text-xs text-text-secondary">Side-by-side terminal comparison report</p>
        </div>
        <button
          onClick={onClearAll}
          className="px-3 py-1.5 text-xs font-mono panel border-border-default hover:border-down text-down hover:bg-down/5 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <X size={12} />
          Clear All
        </button>
      </div>

      {/* Comparison Grid Table */}
      <div className="panel overflow-hidden border-border-default bg-bg-surface font-mono text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg-elevated/40 border-b border-border-default">
                <th className="p-3.5 text-xs text-text-secondary uppercase tracking-wider font-bold w-48 border-r border-border-default/50">
                  METRIC FIELD
                </th>
                {stocksWithScore.map((stock, idx) => (
                  <th key={stock.ticker} className="p-3.5 relative border-r border-border-default/50 last:border-r-0">
                    <div className="flex items-center justify-between pr-6 min-w-[170px]">
                      <div className="flex items-center gap-2">
                        <CompanyLogo ticker={stock.ticker} name={stock.companyName} size={28} className="w-7 h-7 flex-shrink-0" />
                        <div>
                          <button
                            onClick={() => onResearch(stock.ticker)}
                            className="font-bold text-text-primary hover:text-accent transition-colors text-left line-clamp-1"
                          >
                            {stock.companyName}
                          </button>
                          <div className="text-xs text-text-secondary">{stock.ticker}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemove(stock.ticker)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-down transition-colors cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/50">
              {/* Recommendation */}
              <tr>
                <td className="p-3.5 font-bold text-text-secondary bg-bg-elevated/10 border-r border-border-default/50">
                  RECOMMENDATION
                </td>
                {stocksWithScore.map((stock) => {
                  const rec = stock.verdict.recommendation;
                  const colors = RECOMMENDATION_COLORS[rec] || RECOMMENDATION_COLORS.PASS;
                  return (
                    <td key={stock.ticker} className="p-3.5 border-r border-border-default/50 last:border-r-0">
                      <span className={`px-2 py-1 text-xs font-bold rounded border ${colors.bg} ${colors.text}`}>
                        {rec}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Confidence */}
              <tr>
                <td className="p-3.5 font-bold text-text-secondary bg-bg-elevated/10 border-r border-border-default/50">
                  CONFIDENCE
                </td>
                {stocksWithScore.map((stock) => {
                  const val = stock.verdict.confidenceScore;
                  const isHighest = getIsHighest("confidenceScore", val);
                  return (
                    <td
                      key={stock.ticker}
                      className={`p-3.5 border-r border-border-default/50 last:border-r-0 ${
                        isHighest ? "font-bold text-accent underline decoration-accent decoration-2 underline-offset-4" : "text-text-primary"
                      }`}
                    >
                      {val}%
                    </td>
                  );
                })}
              </tr>

              {/* Composite Score */}
              <tr className="bg-accent/5">
                <td className="p-3.5 font-bold text-text-secondary bg-bg-elevated/20 border-r border-border-default/50">
                  COMPOSITE SCORE
                </td>
                {stocksWithScore.map((stock) => {
                  const val = stock.compositeScore;
                  const isHighest = getIsHighest("compositeScore", val);
                  return (
                    <td
                      key={stock.ticker}
                      className={`p-3.5 border-r border-border-default/50 last:border-r-0 ${
                        isHighest ? "font-bold text-accent underline decoration-accent decoration-2 underline-offset-4" : "text-text-primary"
                      }`}
                    >
                      {val} / 100
                    </td>
                  );
                })}
              </tr>

              {/* Financial Health */}
              <tr>
                <td className="p-3.5 font-bold text-text-secondary bg-bg-elevated/10 border-r border-border-default/50">
                  FINANCIAL HEALTH
                </td>
                {stocksWithScore.map((stock) => {
                  const val = stock.verdict.scores.financialHealth;
                  const isHighest = getIsHighest("scores.financialHealth", val);
                  return (
                    <td
                      key={stock.ticker}
                      className={`p-3.5 border-r border-border-default/50 last:border-r-0 ${
                        isHighest ? "font-bold text-accent underline decoration-accent decoration-2 underline-offset-4" : "text-text-primary"
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>

              {/* Valuation */}
              <tr>
                <td className="p-3.5 font-bold text-text-secondary bg-bg-elevated/10 border-r border-border-default/50">
                  VALUATION
                </td>
                {stocksWithScore.map((stock) => {
                  const val = stock.verdict.scores.valuation;
                  const isHighest = getIsHighest("scores.valuation", val);
                  return (
                    <td
                      key={stock.ticker}
                      className={`p-3.5 border-r border-border-default/50 last:border-r-0 ${
                        isHighest ? "font-bold text-accent underline decoration-accent decoration-2 underline-offset-4" : "text-text-primary"
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>

              {/* Market Position */}
              <tr>
                <td className="p-3.5 font-bold text-text-secondary bg-bg-elevated/10 border-r border-border-default/50">
                  MARKET POSITION
                </td>
                {stocksWithScore.map((stock) => {
                  const val = stock.verdict.scores.marketPosition;
                  const isHighest = getIsHighest("scores.marketPosition", val);
                  return (
                    <td
                      key={stock.ticker}
                      className={`p-3.5 border-r border-border-default/50 last:border-r-0 ${
                        isHighest ? "font-bold text-accent underline decoration-accent decoration-2 underline-offset-4" : "text-text-primary"
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>

              {/* News Sentiment */}
              <tr>
                <td className="p-3.5 font-bold text-text-secondary bg-bg-elevated/10 border-r border-border-default/50">
                  NEWS SENTIMENT
                </td>
                {stocksWithScore.map((stock) => {
                  const val = stock.verdict.scores.newsSentiment;
                  const isHighest = getIsHighest("scores.newsSentiment", val);
                  return (
                    <td
                      key={stock.ticker}
                      className={`p-3.5 border-r border-border-default/50 last:border-r-0 ${
                        isHighest ? "font-bold text-accent underline decoration-accent decoration-2 underline-offset-4" : "text-text-primary"
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>

              {/* Growth Signals */}
              <tr>
                <td className="p-3.5 font-bold text-text-secondary bg-bg-elevated/10 border-r border-border-default/50">
                  GROWTH SIGNALS
                </td>
                {stocksWithScore.map((stock) => {
                  const val = stock.verdict.scores.growthSignals;
                  const isHighest = getIsHighest("scores.growthSignals", val);
                  return (
                    <td
                      key={stock.ticker}
                      className={`p-3.5 border-r border-border-default/50 last:border-r-0 ${
                        isHighest ? "font-bold text-accent underline decoration-accent decoration-2 underline-offset-4" : "text-text-primary"
                      }`}
                    >
                      {val}
                    </td>
                  );
                })}
              </tr>

              {/* Time Horizon */}
              <tr>
                <td className="p-3.5 font-bold text-text-secondary bg-bg-elevated/10 border-r border-border-default/50">
                  TIME HORIZON
                </td>
                {stocksWithScore.map((stock) => (
                  <td
                    key={stock.ticker}
                    className="p-3.5 border-r border-border-default/50 last:border-r-0 text-text-primary font-bold text-xs"
                  >
                    {stock.verdict.timeHorizon || "MEDIUM_TERM"}
                  </td>
                ))}
              </tr>

              {/* Bull Case */}
              <tr>
                <td className="p-3.5 font-bold text-text-secondary bg-bg-elevated/10 border-r border-border-default/50 align-top">
                  BULL CASE
                </td>
                {stocksWithScore.map((stock) => (
                  <td
                    key={stock.ticker}
                    className="p-3.5 border-r border-border-default/50 last:border-r-0 text-xs leading-relaxed text-text-primary min-w-[200px]"
                  >
                    {stock.verdict.bullCase}
                  </td>
                ))}
              </tr>

              {/* Bear Case */}
              <tr>
                <td className="p-3.5 font-bold text-text-secondary bg-bg-elevated/10 border-r border-border-default/50 align-top">
                  BEAR CASE
                </td>
                {stocksWithScore.map((stock) => (
                  <td
                    key={stock.ticker}
                    className="p-3.5 border-r border-border-default/50 last:border-r-0 text-xs leading-relaxed text-text-primary min-w-[200px]"
                  >
                    {stock.verdict.bearCase}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Normalised performance line chart overlay (Stretch Goal) */}
      {comparedStocks.length >= 2 && (
        <div className="panel p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold font-mono text-text-primary flex items-center gap-1.5">
                <BarChart2 size={16} className="text-accent" />
                NORMALISED PERFORMANCE COMPARISON (%)
              </h3>
              <p className="text-xs text-text-secondary font-mono">
                Comparative performance normalised to 0% at start of range
              </p>
            </div>
            {/* Chart range selectors */}
            <div className="flex gap-1 bg-bg-elevated/50 p-0.5 rounded border border-border-default">
              {["1d", "5d", "1mo", "3mo", "6mo", "1y", "5y"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded uppercase transition-colors cursor-pointer ${
                    range === r
                      ? "bg-accent/15 text-accent border border-accent/20"
                      : "text-text-secondary hover:text-text-primary border border-transparent"
                  }`}
                >
                  {r === "1mo" ? "1M" : r === "3mo" ? "3M" : r === "6mo" ? "6M" : r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[250px] w-full text-xs font-mono">
            {isChartLoading ? (
              <div className="h-full flex items-center justify-center text-text-muted animate-pulse">
                Loading comparative charts...
              </div>
            ) : chartError || combinedChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-down">
                {chartError || "No comparative data points available."}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedChartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={formatXAxis} stroke="var(--text-muted)" />
                  <YAxis orientation="right" stroke="var(--text-muted)" unit="%" />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-surface)", borderColor: "var(--border-bright)", fontFamily: "var(--font-mono)" }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: "11px" }} />
                  {comparedStocks.map((stock, idx) => (
                    <Line
                      key={stock.ticker}
                      type="monotone"
                      dataKey={stock.ticker}
                      name={`${stock.companyName} (${stock.ticker})`}
                      stroke={CHART_LINE_COLORS[idx % CHART_LINE_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
