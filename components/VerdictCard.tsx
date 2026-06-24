"use client";

const COLORS: Record<string, { bg: string; text: string; border: string }> = {
  STRONG_BUY: { bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-400/40" },
  BUY: { bg: "bg-sky-500/10", text: "text-sky-300", border: "border-sky-400/40" },
  HOLD: { bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-400/40" },
  PASS: { bg: "bg-orange-500/10", text: "text-orange-300", border: "border-orange-400/40" },
  AVOID: { bg: "bg-rose-500/10", text: "text-rose-300", border: "border-rose-400/40" },
};

export default function VerdictCard({ verdict }: { verdict: any }) {
  const c = COLORS[verdict.recommendation] || COLORS.PASS;
  const weightedScore = Math.round(
    verdict.scores.financialHealth * 0.3 +
      verdict.scores.valuation * 0.2 +
      verdict.scores.marketPosition * 0.2 +
      verdict.scores.newsSentiment * 0.15 +
      verdict.scores.growthSignals * 0.15,
  );

  return (
    <div className={`rounded-[24px] border ${c.border} ${c.bg} p-6 shadow-glow backdrop-blur-xl`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Recommendation</p>
          <h2 className={`text-4xl font-semibold ${c.text}`}>{verdict.recommendation}</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Confidence</p>
          <p className={`text-2xl font-semibold ${c.text}`}>{verdict.confidenceScore}%</p>
          <p className="text-sm text-slate-400">Score: {weightedScore}/100</p>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-5">
        {Object.entries(verdict.scores).map(([key, value]: any) => (
          <div key={key} className="rounded-2xl border border-white/10 bg-slate-950/50 p-3 text-center">
            <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">{key.replace(/([A-Z])/g, " $1")}</p>
            <p className="text-xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Bull Case</p>
          <p className="text-sm leading-6 text-slate-200">{verdict.bullCase}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">Bear Case</p>
          <p className="text-sm leading-6 text-slate-200">{verdict.bearCase}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Reasoning</p>
        <p className="text-sm leading-6 text-slate-200">{verdict.reasoning}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {verdict.keyMetrics.map((metric: string, index: number) => (
          <span key={index} className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-xs text-slate-300">
            {metric}
          </span>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-400">{verdict.dataFreshness}</p>
    </div>
  );
}
