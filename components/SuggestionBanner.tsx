"use client";

interface SuggestionBannerProps {
  input: string;
  suggestions: Array<{ ticker: string; name: string }>;
  onSelect: (name: string) => void;
}

export default function SuggestionBanner({ input, suggestions, onSelect }: SuggestionBannerProps) {
  if (suggestions.length === 0) {
    return (
      <div className="panel p-4 border-down/30 bg-down/5 text-down text-sm">
        We couldn&apos;t find any companies matching <span className="font-mono font-bold">&quot;{input}&quot;</span>. Please try another search.
      </div>
    );
  }

  return (
    <div className="panel p-4 border-warn/30 bg-warn/5">
      <p className="text-sm text-text-primary mb-3">
        We couldn&apos;t find <span className="font-mono font-bold">&quot;{input}&quot;</span>. Did you mean one of these?
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s.ticker}
            onClick={() => onSelect(s.ticker)}
            className="px-3 py-1.5 text-xs font-mono panel border-border-default hover:border-accent hover:bg-accent-dim text-accent transition-colors flex items-center gap-1.5"
          >
            <span className="font-bold">{s.name}</span>
            <span className="text-text-secondary">({s.ticker})</span>
          </button>
        ))}
      </div>
    </div>
  );
}
