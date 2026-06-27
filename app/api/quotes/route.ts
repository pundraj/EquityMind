import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tickers = searchParams.get("tickers");

    if (!tickers) {
      return NextResponse.json({ error: "Tickers parameter is required" }, { status: 400 });
    }

    const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${encodeURIComponent(tickers)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Yahoo Spark fetch failed with status: ${res.status}`);
    }

    const json = await res.json();
    const sparkResults = json.spark?.result || [];

    const quotes: Record<string, { price: number; change: number; changePercent: number; name: string }> = {};

    for (const item of sparkResults) {
      const symbol = item.symbol;
      const responseObj = item.response?.[0] || {};
      const meta = responseObj.meta || {};

      const price = meta.regularMarketPrice ?? 0;
      const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price;
      const change = price - prevClose;
      const changePercent = prevClose ? (change / prevClose) * 100 : 0;
      const name = meta.shortName ?? meta.longName ?? symbol;

      quotes[symbol] = {
        price,
        change,
        changePercent,
        name,
      };
    }

    return NextResponse.json({ quotes });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
