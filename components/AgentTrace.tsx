"use client";

import { useEffect, useRef } from "react";

interface AgentTraceProps {
  logs: string[];
  isLoading: boolean;
}

export default function AgentTrace({ logs, isLoading }: AgentTraceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, isLoading]);

  const getLineColor = (log: string) => {
    if (log.includes("✅") || log.toLowerCase().includes("complete") || log.toLowerCase().includes("verdict generated")) {
      return "text-up";
    }
    if (log.includes("❌") || log.toLowerCase().includes("failed") || log.toLowerCase().includes("error")) {
      return "text-down";
    }
    if (log.includes("🔍") || log.toLowerCase().includes("starting")) {
      return "text-warn";
    }
    return "text-text-primary";
  };

  return (
    <div className="panel p-5 bg-bg-surface border-border-default/80">
      <div className="mb-4 flex items-center justify-between border-b border-border-default/50 pb-2">
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary">
          &gt;_ AGENT_RESEARCH_TRACE.LOG
        </p>
        {isLoading && (
          <span className="text-xs font-mono text-accent animate-pulse">
            [RUNNING_AGENT]
          </span>
        )}
      </div>

      <div className="max-h-72 space-y-1.5 overflow-y-auto pr-1 font-mono text-sm leading-relaxed scrollbar">
        {logs.map((log, index) => (
          <p key={index} className={getLineColor(log)}>
            &gt; {log}
          </p>
        ))}
        {isLoading && (
          <p className="text-accent">
            &gt; <span className="animate-pulse font-black">_</span>
          </p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
