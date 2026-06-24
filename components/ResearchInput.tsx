"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function ResearchInput({
  onSubmit,
  isLoading,
}: {
  onSubmit: (name: string) => void;
  isLoading: boolean;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4 shadow-glow backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
          placeholder="Enter company name, e.g. NVIDIA, Tesla, Apple"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isLoading && onSubmit(value)}
          disabled={isLoading}
        />
        <button
          onClick={() => onSubmit(value)}
          disabled={isLoading || !value.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Search size={18} />
          {isLoading ? "Researching..." : "Research"}
        </button>
      </div>
    </div>
  );
}
