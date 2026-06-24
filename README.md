# AI Investment Research Agent

An autonomous AI agent that researches a public company and returns a structured invest-or-pass verdict with reasoning. This version uses Next.js, LangGraph, Groq for the main reasoning model, Hugging Face for sentiment fallback, and free/public data sources instead of paid APIs.

## How It Works

The agent uses a LangGraph StateGraph with three stages:

1. Researcher - gathers company ticker, fundamentals, news, and sentiment.
2. Tools - public Yahoo Finance endpoints, DuckDuckGo search scraping, and Hugging Face sentiment.
3. Synthesizer - scores the evidence and returns a final verdict JSON.

Scoring model:

| Dimension | Weight |
| --- | --- |
| Financial Health | 30% |
| Valuation | 20% |
| Market Position | 20% |
| News Sentiment | 15% |
| Growth Signals | 15% |

Final mapping:

- 80-100 = STRONG_BUY
- 65-79 = BUY
- 45-64 = HOLD / PASS
- 25-44 = PASS
- 0-24 = AVOID

## How to Run

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Fill in the values in `.env.local` before running. Recommended minimum key:

- `GROQ_API_KEY`

`HF_TOKEN` is optional because the sentiment tool has a keyword fallback.

## Key Decisions & Trade-offs

- Groq replaces Claude to avoid paid model dependence.
- Hugging Face sentiment is optional, with a local fallback for reliability.
- Yahoo Finance public endpoints reduce setup overhead, but they can change without notice.
- DuckDuckGo HTML search is free, but it is less stable than a paid search API.
- SSE is used for live logs because it is simple and works well with Next.js route handlers.
- The agent is capped at five loops to avoid runaway tool usage.

## Example Runs

To be filled after live runs.

## What I Would Improve With More Time

- Add SEC filing parsing.
- Add cached research results.
- Add sector comparison baselines.
- Add better ticker disambiguation.
