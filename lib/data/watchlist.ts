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

export interface StockSuggestion {
  name: string;
  ticker: string;
}

export const STOCK_DATABASE: StockSuggestion[] = [
  { name: "NVIDIA", ticker: "NVDA" },
  { name: "Tesla", ticker: "TSLA" },
  { name: "Apple", ticker: "AAPL" },
  { name: "Microsoft", ticker: "MSFT" },
  { name: "Amazon", ticker: "AMZN" },
  { name: "Meta Platforms", ticker: "META" },
  { name: "Alphabet", ticker: "GOOGL" },
  { name: "AMD", ticker: "AMD" },
  { name: "Palantir", ticker: "PLTR" },
  { name: "Netflix", ticker: "NFLX" },
  { name: "Berkshire Hathaway", ticker: "BRK-B" },
  { name: "Johnson & Johnson", ticker: "JNJ" },
  { name: "Visa", ticker: "V" },
  { name: "UnitedHealth", ticker: "UNH" },
  { name: "Mastercard", ticker: "MA" },
  { name: "Costco", ticker: "COST" },
  { name: "Home Depot", ticker: "HD" },
  { name: "NextEra Energy", ticker: "NEE" },
  { name: "Amphenol", ticker: "APH" },
  { name: "Accenture", ticker: "ACN" },
  { name: "Intel", ticker: "INTC" },
  { name: "Broadcom", ticker: "AVGO" },
  { name: "Qualcomm", ticker: "QCOM" },
  { name: "Salesforce", ticker: "CRM" },
  { name: "ExxonMobil", ticker: "XOM" },
  { name: "JPMorgan Chase", ticker: "JPM" },
  { name: "Pfizer", ticker: "PFE" },
  { name: "Walmart", ticker: "WMT" },
  { name: "Eli Lilly", ticker: "LLY" },
  { name: "Oracle", ticker: "ORCL" },
  { name: "Adobe", ticker: "ADBE" },
  { name: "Disney", ticker: "DIS" },
  { name: "Nike", ticker: "NKE" },
  { name: "Coca-Cola", ticker: "KO" },
  { name: "PepsiCo", ticker: "PEP" },
  { name: "McDonald's", ticker: "MCD" },
  { name: "Chevron", ticker: "CVX" },
  { name: "Cisco Systems", ticker: "CSCO" },
  { name: "Abbott Laboratories", ticker: "ABT" },
  { name: "T-Mobile", ticker: "TMUS" },
];
