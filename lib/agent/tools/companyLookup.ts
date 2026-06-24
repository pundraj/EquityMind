import { tool } from "@langchain/core/tools";
import { z } from "zod";

async function lookupCompany(query: string) {
  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=5&newsCount=0`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`Yahoo lookup failed: ${response.status}`);
  return response.json();
}

export const companyLookupTool = tool(
  async ({ companyName }) => {
    try {
      const data = await lookupCompany(companyName);
      const quote = data?.quotes?.find((item: any) => item.symbol && item.quoteType === "EQUITY");

      if (!quote) {
        return `No public ticker found for ${companyName}.`;
      }

      return JSON.stringify(
        {
          companyName,
          ticker: quote.symbol,
          shortName: quote.shortname ?? quote.longname ?? companyName,
          exchange: quote.exchange ?? "unknown",
          score: quote.score,
        },
        null,
        2,
      );
    } catch (error) {
      return `Ticker lookup failed for ${companyName}: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "company_lookup",
    description: "Resolve a company name to a public ticker symbol and exchange using Yahoo Finance search.",
    schema: z.object({
      companyName: z.string().describe("Company name such as Apple, NVIDIA, Tesla"),
    }),
  },
);
