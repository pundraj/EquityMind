"use client";

import { useCallback, useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

interface StockChartProps {
  ticker: string;
}

type ChartData = {
  ticker: string;
  timestamps: number[];
  closes: number[];
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
};

export default function StockChart({ ticker }: StockChartProps) {
  const [range, setRange] = useState<string>("1mo");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ranges = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y"];

  const fetchChart = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/chart?ticker=${encodeURIComponent(ticker)}&range=${range}`);
      if (!res.ok) {
        throw new Error(`Chart data request failed: ${res.status}`);
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setChartData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load chart data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [ticker, range]);

  useEffect(() => {
    fetchChart();
  }, [fetchChart]);

  // Price polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChart(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchChart]);

  if (isLoading) {
    return (
      <div className="panel p-6 h-[400px] flex flex-col justify-between animate-pulse">
        <div className="space-y-3">
          <div className="h-4 w-24 bg-border-bright rounded" />
          <div className="h-8 w-44 bg-border-bright rounded" />
          <div className="h-4 w-32 bg-border-bright rounded" />
        </div>
        <div className="h-[250px] w-full bg-border-bright/50 rounded" />
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div className="panel p-6 h-[400px] flex flex-col items-center justify-center text-center">
        <p className="text-down font-mono mb-4">Error: {error || "Unable to load chart data"}</p>
        <button
          onClick={() => fetchChart()}
          className="px-4 py-2 text-xs font-mono panel border-border-default hover:border-accent text-accent transition-colors cursor-pointer flex items-center gap-2"
        >
          <RefreshCw size={12} />
          Retry Load
        </button>
      </div>
    );
  }

  const { closes, timestamps, currentPrice, change, changePercent, volume } = chartData;

  const points = timestamps
    .map((ts, idx) => ({
      time: ts * 1000,
      price: closes[idx] !== null && closes[idx] !== undefined ? Number(closes[idx].toFixed(2)) : null,
    }))
    .filter((item): item is { time: number; price: number } => item.price !== null);

  const startPrice = points[0]?.price ?? currentPrice;
  const isUpFromStart = points.length >= 2 ? points[points.length - 1].price >= startPrice : true;
  const strokeColor = isUpFromStart ? "var(--up)" : "var(--down)";
  const gradientId = `chartGradient_${ticker}_${range}`;

  const formatXAxis = (tickItem: number) => {
    const date = new Date(tickItem);
    if (range === "1d" || range === "5d") {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const dateStr = new Date(item.time).toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: range === "1d" || range === "5d" ? "2-digit" : undefined,
        minute: range === "1d" || range === "5d" ? "2-digit" : undefined,
      });
      const pctChange = (((item.price - startPrice) / startPrice) * 100).toFixed(2);
      const isTooltipUp = item.price >= startPrice;

      return (
        <div className="panel bg-bg-elevated/95 p-3 border-border-bright text-xs font-mono">
          <p className="text-text-secondary mb-1">{dateStr}</p>
          <p className="font-bold text-text-primary text-sm">${item.price.toFixed(2)}</p>
          <p className={isTooltipUp ? "text-up font-semibold" : "text-down font-semibold"}>
            {isTooltipUp ? "+" : ""}
            {pctChange}% from start
          </p>
        </div>
      );
    }
    return null;
  };

  const minPrice = Math.min(...points.map((p) => p.price)) * 0.99;
  const maxPrice = Math.max(...points.map((p) => p.price)) * 1.01;

  const isDailyUp = change >= 0;

  return (
    <div className="panel p-6 flex flex-col gap-6">
      {/* Live price header & range selectors */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-black text-text-primary">{ticker}</span>
            <span className="text-xs text-text-secondary font-mono truncate">Live Market Tracker</span>
            {isRefreshing && <span className="text-[10px] text-accent font-mono animate-pulse">updating...</span>}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-mono font-bold tracking-tight text-text-primary">
              ${currentPrice.toFixed(2)}
            </span>
            <span
              className={`inline-flex items-center gap-1 font-mono text-sm font-bold ${
                isDailyUp ? "text-up" : "text-down"
              }`}
            >
              {isDailyUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {isDailyUp ? "+" : ""}
              {change.toFixed(2)} ({isDailyUp ? "+" : ""}
              {changePercent.toFixed(2)}%)
            </span>
          </div>

          <div className="text-xs text-text-secondary font-mono">
            Volume: <span className="text-text-primary">{volume.toLocaleString()}</span>
          </div>
        </div>

        {/* Range selectors */}
        <div className="flex flex-wrap gap-1.5 self-start bg-bg-elevated/50 p-1 rounded-lg border border-border-default/60">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-mono font-bold tracking-wider rounded uppercase transition-colors cursor-pointer ${
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

      {/* Chart container */}
      <div className="h-[280px] w-full font-mono text-xs">
        {points.length === 0 ? (
          <div className="h-full flex items-center justify-center text-text-muted">No pricing points in range.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={formatXAxis} stroke="var(--text-muted)" />
              <YAxis domain={[minPrice, maxPrice]} orientation="right" stroke="var(--text-muted)" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={1.5}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
