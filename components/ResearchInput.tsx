"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

interface ResearchInputProps {
  onSubmit: (name: string) => void;
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
}

export default function ResearchInput({ onSubmit, isLoading, value, setValue }: ResearchInputProps) {
  const [error, setError] = useState<string | null>(null);

  // Validate value when it changes
  useEffect(() => {
    if (!value) {
      setError(null);
      return;
    }

    if (value.trim().length < 2) {
      setError("Search query must be at least 2 characters long.");
      return;
    }

    if (/^\d+$/.test(value.trim())) {
      setError("Query cannot contain only numbers.");
      return;
    }

    if (/[^a-zA-Z0-9.\-\s]/.test(value)) {
      setError("Special characters are not allowed except '.' and '-'.");
      return;
    }

    setError(null);
  }, [value]);

  const handleSearchSubmit = () => {
    if (error || !value.trim() || isLoading) return;
    onSubmit(value.trim());
  };

  return (
    <div className="panel p-4 bg-bg-surface border-border-default/60">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            className={`w-full font-sans text-sm rounded border bg-bg-base/50 px-4 py-3 text-text-primary outline-none placeholder:text-text-muted focus:ring-1 focus:ring-accent/30 transition-all ${
              error ? "border-down focus:border-down" : "border-border-default focus:border-accent"
            }`}
            placeholder="Enter company name or ticker symbol, e.g. Apple, TSLA"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSearchSubmit}
          disabled={isLoading || !value.trim() || !!error}
          className="inline-flex items-center justify-center gap-2 rounded bg-accent px-6 py-3 font-mono text-xs font-black tracking-wider uppercase text-bg-base transition-colors hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <Search size={14} />
          {isLoading ? "RESEARCHING..." : "RESEARCH"}
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-xs font-mono text-down">{error}</p>
      ) : (
        <p className="mt-2 text-xs font-mono text-text-secondary">
          Enter a company name or ticker symbol, e.g. <span className="text-accent">Apple</span>, <span className="text-accent">TSLA</span>
        </p>
      )}
    </div>
  );
}
