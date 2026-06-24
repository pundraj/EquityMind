import { tool } from "@langchain/core/tools";
import { z } from "zod";

async function fetchQuoteSummary(ticker: string) {
  const modules = [
    "price",
    "summaryDetail",
    "financialData",
    "defaultKeyStatistics",
    "assetProfile",
    "calendarEvents",
  ].join(",");

  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=${modules}`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`Market data fetch failed: ${response.status}`);
  return response.json();
}

export const marketDataTool = tool(
  async ({ ticker }) => {
    try {
      const data = await fetchQuoteSummary(ticker);
      const summary = data?.quoteSummary?.result?.[0];

      if (!summary) {
        return `No market data found for ${ticker}.`;
      }

      const price = summary.price ?? {};
      const summaryDetail = summary.summaryDetail ?? {};
      const financialData = summary.financialData ?? {};
      const stats = summary.defaultKeyStatistics ?? {};

      return JSON.stringify(
        {
          ticker,
          currentPrice: price.regularMarketPrice?.raw ?? null,
          marketCap: price.marketCap?.raw ?? null,
          peRatio: summaryDetail.trailingPE?.raw ?? null,
          forwardPE: summaryDetail.forwardPE?.raw ?? null,
          priceToSales: summaryDetail.priceToSalesTrailing12Months?.raw ?? null,
          revenueGrowth: financialData.revenueGrowth?.raw ?? null,
          profitMargin: financialData.profitMargins?.raw ?? null,
          debtToEquity: financialData.debtToEquity?.raw ?? null,
          operatingMargins: financialData.operatingMargins?.raw ?? null,
          analystTargetMean: financialData.targetMeanPrice?.raw ?? null,
          fiftyTwoWeekLow: summaryDetail.fiftyTwoWeekLow?.raw ?? null,
          fiftyTwoWeekHigh: summaryDetail.fiftyTwoWeekHigh?.raw ?? null,
          beta: stats.beta?.raw ?? null,
        },
        null,
        2,
      );
    } catch (error) {
      return `Market data unavailable for ${ticker}: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "market_data",
    description: "Fetch public fundamentals and valuation metrics for a ticker symbol from Yahoo Finance.",
    schema: z.object({
      ticker: z.string().describe("Public stock ticker symbol, such as AAPL or NVDA"),
    }),
  },
);
