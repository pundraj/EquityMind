"use client";

import { useEffect, useRef } from "react";

export default function AgentTrace({ logs, isLoading }: { logs: string[]; isLoading: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-5 shadow-glow backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Agent Trace</p>
        {isLoading && <span className="text-xs text-cyan-300">thinking...</span>}
      </div>
      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
        {logs.map((log, index) => (
          <p key={index} className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 font-mono text-sm text-emerald-300">
            {log}
          </p>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
