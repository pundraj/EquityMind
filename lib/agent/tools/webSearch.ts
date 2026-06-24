import { tool } from "@langchain/core/tools";
import { load } from "cheerio";
import { z } from "zod";

async function ddgSearch(query: string) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!response.ok) throw new Error(`Search failed: ${response.status}`);
  const html = await response.text();
  const $ = load(html);
  const results: Array<{ title: string; url: string; snippet: string }> = [];

  $(".result").slice(0, 5).each((_, element) => {
    const title = $(element).find(".result__title a").text().trim();
    const href = $(element).find(".result__title a").attr("href") ?? "";
    const snippet = $(element).find(".result__snippet").text().trim();
    if (title) {
      results.push({ title, url: href, snippet });
    }
  });

  return results;
}

export const webSearchTool = tool(
  async ({ query, focus }) => {
    try {
      const searchQuery = focus ? `${query} ${focus}` : query;
      const results = await ddgSearch(searchQuery);
      if (results.length === 0) return `No web results found for ${searchQuery}.`;

      return JSON.stringify(
        {
          query: searchQuery,
          results,
        },
        null,
        2,
      );
    } catch (error) {
      return `Search failed for ${query}: ${error instanceof Error ? error.message : String(error)}`;
    }
  },
  {
    name: "web_search",
    description: "Search public web pages for recent earnings, headlines, analyst commentary, and market position.",
    schema: z.object({
      query: z.string().describe("Main search query"),
      focus: z.string().optional().describe("Optional focus such as earnings, guidance, analyst ratings, moat"),
    }),
  },
);
