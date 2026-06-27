import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'border-default': 'var(--border)',
        'border-bright': 'var(--border-bright)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'accent': 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',
        'up': 'var(--up)',
        'down': 'var(--down)',
        'warn': 'var(--warn)',
        'rec-sb-bg': 'var(--rec-strong-buy-bg)',
        'rec-sb-text': 'var(--rec-strong-buy-text)',
        'rec-sb-border': 'var(--rec-strong-buy-border)',
        'rec-b-bg': 'var(--rec-buy-bg)',
        'rec-b-text': 'var(--rec-buy-text)',
        'rec-b-border': 'var(--rec-buy-border)',
        'rec-h-bg': 'var(--rec-hold-bg)',
        'rec-h-text': 'var(--rec-hold-text)',
        'rec-h-border': 'var(--rec-hold-border)',
        'rec-p-bg': 'var(--rec-pass-bg)',
        'rec-p-text': 'var(--rec-pass-text)',
        'rec-p-border': 'var(--rec-pass-border)',
        'rec-a-bg': 'var(--rec-avoid-bg)',
        'rec-a-text': 'var(--rec-avoid-text)',
        'rec-a-border': 'var(--rec-avoid-border)',
      },
    },
  },
  plugins: [],
};

export default config;
