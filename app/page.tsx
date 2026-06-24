"use client";

import { useState } from "react";
import ResearchInput from "@/components/ResearchInput";
import AgentTrace from "@/components/AgentTrace";
import VerdictCard from "@/components/VerdictCard";

export default function Home() {
  const [logs, setLogs] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResearch(companyName: string) {
    setLogs([]);
    setVerdict(null);
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName }),
      });

      if (!response.ok || !response.body) {
        throw new Error(await response.text());
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        while (buffer.includes("\n\n")) {
          const chunk = buffer.slice(0, buffer.indexOf("\n\n"));
          buffer = buffer.slice(buffer.indexOf("\n\n") + 2);
          const event = chunk
            .split("\n")
            .map((line) => line.trim())
            .find((line) => line.startsWith("event: "))
            ?.slice(7);
          const dataLine = chunk
            .split("\n")
            .map((line) => line.trim())
            .find((line) => line.startsWith("data: "))
            ?.slice(6);

          if (!dataLine) continue;

          try {
            const data = JSON.parse(dataLine);
            if (event === "log" && data.message) setLogs((prev) => [...prev, data.message]);
            if (event === "verdict" && data.verdict) setVerdict(data.verdict);
            if (event === "error" && data.message) setError(data.message);
          } catch {
            continue;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-aurora-radial px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur-xl sm:p-10">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              AI Investment Research Agent
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              Research a company and get a structured invest or pass verdict.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              This build uses LangGraph orchestration, Groq for the main reasoning model, and free/public data sources for research and sentiment.
            </p>
          </div>
        </section>

        <ResearchInput onSubmit={handleResearch} isLoading={isLoading} />

        {(logs.length > 0 || isLoading) && <AgentTrace logs={logs} isLoading={isLoading} />}
        {verdict && <VerdictCard verdict={verdict} />}
        {error && <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
      </div>
    </main>
  );
}
