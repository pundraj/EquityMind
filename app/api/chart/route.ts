import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get("ticker");
    const range = searchParams.get("range") ?? "1mo";

    if (!ticker) {
      return NextResponse.json({ error: "Ticker parameter is required" }, { status: 400 });
    }

    const interval = rangeToInterval(range);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=${interval}&includePrePost=false`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Yahoo chart fetch failed with status: ${res.status}`);
    }

    const json = await res.json();
    const result = json.chart?.result?.[0];

    if (!result) {
      throw new Error("No chart data found for this ticker");
    }

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const meta = result.meta || {};

    const currentPrice = meta.regularMarketPrice ?? closes[closes.length - 1] ?? 0;
    const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? currentPrice;
    const change = currentPrice - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;
    const volume = meta.regularMarketVolume ?? 0;

    return NextResponse.json({
      ticker,
      timestamps,
      closes,
      currentPrice,
      change,
      changePercent,
      volume,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function rangeToInterval(range: string): string {
  const map: Record<string, string> = {
    "1d": "5m",
    "5d": "30m",
    "1mo": "1d",
    "3mo": "1d",
    "6mo": "1wk",
    "1y": "1wk",
    "2y": "1mo",
    "5y": "1mo",
  };
  return map[range] ?? "1d";
}
