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

async function fetchFallbackChartData(ticker: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1d&includePrePost=false`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`Chart fallback failed: ${response.status}`);
  const json = await response.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta) throw new Error("No chart data in fallback");
  return {
    ticker,
    currentPrice: meta.regularMarketPrice ?? null,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? null,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? null,
    marketCap: null,
    peRatio: null,
    forwardPE: null,
    priceToSales: null,
    revenueGrowth: null,
    profitMargin: null,
    debtToEquity: null,
    operatingMargins: null,
    analystTargetMean: null,
    beta: null,
    isFallback: true,
  };
}

export const marketDataTool = tool(
  async ({ ticker }) => {
    try {
      let dataObj;
      try {
        const data = await fetchQuoteSummary(ticker);
        const summary = data?.quoteSummary?.result?.[0];

        if (!summary) {
          throw new Error("No summary result found");
        }

        const price = summary.price ?? {};
        const summaryDetail = summary.summaryDetail ?? {};
        const financialData = summary.financialData ?? {};
        const stats = summary.defaultKeyStatistics ?? {};

        dataObj = {
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
          isFallback: false,
        };
      } catch (error) {
        dataObj = await fetchFallbackChartData(ticker);
      }

      if (dataObj.isFallback) {
        return JSON.stringify({
          ...dataObj,
          _notice: "Note: Fundamental metrics like PE, Profit Margin, Debt-to-Equity are unavailable via Yahoo Finance API due to security restrictions. You MUST run a web_search focusing on 'financials' or 'key metrics' to retrieve the missing metrics (e.g. PE ratio, debt-to-equity, profit margins) for this company."
        }, null, 2);
      }

      return JSON.stringify(dataObj, null, 2);
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
