export interface WatchItem {
  ticker: string;
  name: string;
}

export const TOP_10_ACTIVE: WatchItem[] = [
  { ticker: "NVDA", name: "NVIDIA" },
  { ticker: "TSLA", name: "Tesla" },
  { ticker: "AAPL", name: "Apple" },
  { ticker: "MSFT", name: "Microsoft" },
  { ticker: "AMZN", name: "Amazon" },
  { ticker: "META", name: "Meta Platforms" },
  { ticker: "GOOGL", name: "Alphabet" },
  { ticker: "AMD", name: "AMD" },
  { ticker: "PLTR", name: "Palantir" },
  { ticker: "NFLX", name: "Netflix" },
];

export const TOP_10_LONG_TERM: WatchItem[] = [
  { ticker: "BRK-B", name: "Berkshire Hathaway" },
  { ticker: "JNJ", name: "Johnson & Johnson" },
  { ticker: "V", name: "Visa" },
  { ticker: "UNH", name: "UnitedHealth" },
  { ticker: "MA", name: "Mastercard" },
  { ticker: "COST", name: "Costco" },
  { ticker: "HD", name: "Home Depot" },
  { ticker: "NEE", name: "NextEra Energy" },
  { ticker: "APH", name: "Amphenol" },
  { ticker: "ACN", name: "Accenture" },
];
