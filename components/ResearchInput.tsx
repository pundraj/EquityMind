"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { STOCK_DATABASE, StockSuggestion } from "@/lib/data/watchlist";

interface ResearchInputProps {
  onSubmit: (name: string) => void;
  isLoading: boolean;
  value: string;
  setValue: (value: string) => void;
}

export default function ResearchInput({ onSubmit, isLoading, value, setValue }: ResearchInputProps) {
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<StockSuggestion[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [typeAheadText, setTypeAheadText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<StockSuggestion | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Update suggestions, active match, and type-ahead suffix
  useEffect(() => {
    if (!value || value.trim().length === 0) {
      setSuggestions([]);
      setTypeAheadText("");
      setActiveSuggestion(null);
      setActiveSuggestionIndex(0);
      return;
    }

    const query = value.toLowerCase();

    // Prioritized match filters:
    // 1. Starts with name
    const startsWithName = STOCK_DATABASE.filter((s) => s.name.toLowerCase().startsWith(query));
    // 2. Starts with ticker
    const startsWithTicker = STOCK_DATABASE.filter((s) => s.ticker.toLowerCase().startsWith(query));
    // 3. Contains name (excluding prefix matches)
    const containsName = STOCK_DATABASE.filter(
      (s) => s.name.toLowerCase().includes(query) && !s.name.toLowerCase().startsWith(query)
    );
    // 4. Contains ticker (excluding prefix matches)
    const containsTicker = STOCK_DATABASE.filter(
      (s) => s.ticker.toLowerCase().includes(query) && !s.ticker.toLowerCase().startsWith(query)
    );

    const combined = [...startsWithName, ...startsWithTicker, ...containsName, ...containsTicker];

    // Remove duplicates
    const uniqueMatches: StockSuggestion[] = [];
    const seen = new Set<string>();
    for (const item of combined) {
      if (!seen.has(item.ticker)) {
        seen.add(item.ticker);
        uniqueMatches.push(item);
      }
    }

    const sliced = uniqueMatches.slice(0, 5);
    setSuggestions(sliced);
    setActiveSuggestionIndex(0);

    if (uniqueMatches.length > 0) {
      const match = uniqueMatches[0];
      setActiveSuggestion(match);

      if (match.name.toLowerCase().startsWith(query)) {
        const typedLen = query.length;
        setTypeAheadText(match.name.substring(typedLen));
      } else if (match.ticker.toLowerCase().startsWith(query)) {
        const typedLen = query.length;
        setTypeAheadText(match.ticker.substring(typedLen));
      } else {
        setTypeAheadText("");
      }
    } else {
      setTypeAheadText("");
      setActiveSuggestion(null);
    }
  }, [value]);

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = () => {
    if (error || !value.trim() || isLoading) return;
    setShowSuggestions(false);
    onSubmit(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      if (typeAheadText && activeSuggestion) {
        e.preventDefault();
        setValue(activeSuggestion.name);
        setTypeAheadText("");
        setShowSuggestions(false);
        return;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (
        showSuggestions &&
        suggestions.length > 0 &&
        activeSuggestionIndex >= 0 &&
        activeSuggestionIndex < suggestions.length
      ) {
        const selected = suggestions[activeSuggestionIndex];
        setValue(selected.name);
        setSuggestions([]);
        setShowSuggestions(false);
        onSubmit(selected.name);
      } else {
        handleSearchSubmit();
      }
      return;
    }

    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    }
  };

  return (
    <div className="panel p-4 bg-bg-surface border-border-default/60" ref={containerRef}>
      <div className="flex flex-col gap-3 sm:flex-row relative">
        <div className="relative flex-1">
          {/* Ghost text autocomplete overlay */}
          {typeAheadText && showSuggestions && !isLoading && (
            <div className="absolute inset-y-0 left-0 flex items-center px-4 font-sans text-sm pointer-events-none select-none">
              <span className="text-transparent">{value}</span>
              <span className="text-text-muted opacity-40">{typeAheadText}</span>
            </div>
          )}
          
          <input
            className={`w-full font-sans text-sm rounded border bg-bg-base/50 px-4 py-3 text-text-primary outline-none placeholder:text-text-secondary focus:ring-1 focus:ring-accent/30 transition-all ${
              error ? "border-down focus:border-down" : "border-border-default focus:border-accent"
            }`}
            placeholder="Enter company name or ticker symbol, e.g. Apple, TSLA"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          {/* Autocomplete Dropdown List */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 z-50 rounded border border-border-default bg-bg-surface/95 backdrop-blur-md shadow-lg max-h-60 overflow-y-auto font-mono text-xs divide-y divide-border-default/50">
              {suggestions.map((s, index) => (
                <div
                  key={s.ticker}
                  className={`flex justify-between items-center px-4 py-3 cursor-pointer transition-colors ${
                    index === activeSuggestionIndex
                      ? "bg-accent/15 text-accent font-bold"
                      : "text-text-primary hover:bg-border-default/20"
                  }`}
                  onClick={() => {
                    setValue(s.name);
                    setSuggestions([]);
                    setShowSuggestions(false);
                    onSubmit(s.name);
                  }}
                  onMouseEnter={() => setActiveSuggestionIndex(index)}
                >
                  <span>{s.name}</span>
                  <span className="text-[10px] bg-border-default/60 px-1.5 py-0.5 rounded text-text-secondary">
                    {s.ticker}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleSearchSubmit}
          disabled={isLoading || !value.trim() || !!error}
          className="inline-flex items-center justify-center gap-2 rounded bg-accent px-6 py-3 font-mono text-xs font-black tracking-wider uppercase text-white hover:text-white transition-colors hover:bg-accent/80 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer animate-fade-in"
        >
          <Search size={14} />
          {isLoading ? "RESEARCHING..." : "RESEARCH"}
        </button>
      </div>

      {typeAheadText && activeSuggestion && showSuggestions && !error ? (
        <p className="mt-2 text-xs font-mono text-accent">
          &gt; Press <kbd className="bg-border-default px-1 py-0.5 rounded font-sans font-bold text-[10px] text-text-secondary border border-border-default">Tab</kbd> to autocomplete to <span className="underline">{activeSuggestion.name} ({activeSuggestion.ticker})</span>
        </p>
      ) : error ? (
        <p className="mt-2 text-xs font-mono text-down">{error}</p>
      ) : (
        <p className="mt-2 text-xs font-mono text-text-secondary">
          Enter a company name or ticker symbol, e.g. <span className="text-accent">Apple</span>, <span className="text-accent">TSLA</span>
        </p>
      )}
    </div>
  );
}
