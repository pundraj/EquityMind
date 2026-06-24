import { tool } from "@langchain/core/tools";
import { z } from "zod";

type SentimentResult = {
  overallSentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  score: number;
  bullishSignals: string[];
  bearishSignals: string[];
  summary: string;
};

function fallbackSentiment(headlines: string): SentimentResult {
  const positiveWords = ["beat", "growth", "record", "raise", "up", "strong", "surge", "profit", "buy"];
  const negativeWords = ["miss", "down", "loss", "cut", "fall", "lawsuit", "probe", "weak", "debt"];
  const text = headlines.toLowerCase();

  const positiveScore = positiveWords.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);
  const negativeScore = negativeWords.reduce((score, word) => score + (text.includes(word) ? 1 : 0), 0);
  const net = positiveScore - negativeScore;

  const overallSentiment = net > 0 ? "POSITIVE" : net < 0 ? "NEGATIVE" : "NEUTRAL";
  const score = Math.max(0, Math.min(100, 50 + net * 15));

  return {
    overallSentiment,
    score,
    bullishSignals: positiveWords.filter((word) => text.includes(word)).slice(0, 3),
    bearishSignals: negativeWords.filter((word) => text.includes(word)).slice(0, 3),
    summary: `Fallback sentiment analysis from headline keywords indicates ${overallSentiment.toLowerCase()} tone.`,
  };
}

export const sentimentTool = tool(
  async ({ headlines, companyName }) => {
    const token = process.env.HF_TOKEN;
    const model = process.env.HF_SENTIMENT_MODEL || "cardiffnlp/twitter-roberta-base-sentiment-latest";

    if (!token) {
      return JSON.stringify(fallbackSentiment(headlines), null, 2);
    }

    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: headlines }),
      });

      const data = await response.json();

      if (!response.ok) {
        return JSON.stringify({
          ...fallbackSentiment(headlines),
          summary: `Hugging Face sentiment fallback for ${companyName} because the API returned an error.`,
        }, null, 2);
      }

      const labels = Array.isArray(data) ? data[0] : data;
      const mapping = new Map<string, number>();

      if (Array.isArray(labels)) {
        for (const item of labels) {
          mapping.set(String(item.label).toUpperCase(), Number(item.score));
        }
      }

      const positive = mapping.get("POSITIVE") ?? 0;
      const neutral = mapping.get("NEUTRAL") ?? 0;
      const negative = mapping.get("NEGATIVE") ?? 0;
      const score = Math.round(Math.max(0, Math.min(100, positive * 100 - negative * 80 + neutral * 50)));
      const overallSentiment = positive > negative ? "POSITIVE" : negative > positive ? "NEGATIVE" : "NEUTRAL";

      return JSON.stringify(
        {
          overallSentiment,
          score,
          bullishSignals: [`Positive probability: ${positive.toFixed(2)}`],
          bearishSignals: [`Negative probability: ${negative.toFixed(2)}`],
          summary: `Hugging Face sentiment analysis for ${companyName}.`,
        },
        null,
        2,
      );
    } catch (error) {
      return JSON.stringify(
        {
          ...fallbackSentiment(headlines),
          summary: `Sentiment analysis failed for ${companyName}: ${error instanceof Error ? error.message : String(error)}`,
        },
        null,
        2,
      );
    }
  },
  {
    name: "sentiment",
    description: "Score the tone of public headlines for a company using Hugging Face or a keyword fallback.",
    schema: z.object({
      headlines: z.string().describe("News headlines separated by newlines"),
      companyName: z.string().describe("Company name for context"),
    }),
  },
);
