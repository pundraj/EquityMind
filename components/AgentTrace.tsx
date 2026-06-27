"use client";

import { useEffect, useRef, useState } from "react";

interface AgentTraceProps {
  logs: string[];
  isLoading: boolean;
}

export default function AgentTrace({ logs, isLoading }: AgentTraceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs, isLoading]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isLoading) {
      setSeconds(0);
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const getLineColor = (log: string) => {
    if (log.startsWith("[SUCCESS]") || log.toLowerCase().includes("complete") || log.toLowerCase().includes("verdict generated")) {
      return "text-up font-semibold";
    }
    if (log.startsWith("[ERROR]") || log.toLowerCase().includes("failed") || log.toLowerCase().includes("error")) {
      return "text-down font-semibold";
    }
    if (log.startsWith("[CALL]") || log.startsWith("[START]") || log.toLowerCase().includes("starting")) {
      return "text-warn";
    }
    if (log.startsWith("[INFO]")) {
      return "text-text-secondary";
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

      {isLoading && (
        <div className="mb-4 p-3.5 rounded border border-accent/20 bg-accent-dim flex items-center gap-3">
          {/* Spinner */}
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-text-primary font-bold">
              Synthesizing market intelligence ({seconds}s elapsed)
            </p>
            <p className="text-[10px] font-mono text-text-secondary mt-0.5 leading-normal">
              Running evidence-backed deep research. This takes 25-45 seconds to synthesize all data points.
            </p>
          </div>
        </div>
      )}

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
