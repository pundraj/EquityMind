# Day 1 — Architecture Review
Date: 2026-06-24

## Prompt 1
**Me:** Build the investment research agent using free APIs instead of paid ones.

**AI:** Use Groq for the main LLM, Hugging Face for sentiment, and public/free data sources for company lookup, market data, and web search.

## What I took from this
I replaced the Claude/Tavily/RapidAPI plan with a Groq-first runtime and public Yahoo Finance plus DuckDuckGo sources so the app can run without paid services.
