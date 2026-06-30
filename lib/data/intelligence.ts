export interface StockIntelligence {
  ticker: string;
  name: string;
  recommendation: "STRONG_BUY" | "BUY" | "HOLD" | "PASS" | "AVOID";
  score: number;
  confidenceScore: number;
  bullCase: string;
  bearCase: string;
  reasoning: string;
  keyMetrics: string[];
  catalysts: string[];
  risks: string[];
  scores: {
    financialHealth: number;
    valuation: number;
    marketPosition: number;
    newsSentiment: number;
    growthSignals: number;
  };
}

export const STOCK_INTELLIGENCE: StockIntelligence[] = [
  {
    ticker: "NVDA",
    name: "NVIDIA",
    recommendation: "STRONG_BUY",
    score: 95,
    confidenceScore: 92,
    bullCase: "Rubin architecture triggers a second wave of AI spending focused on agentic AI, while the new Arm-based PC chips capture 10-15% of the laptop market by 2027. This combination drives the stock toward the $240-$260 range.",
    bearCase: "Aggressive China export restrictions permanently sever a primary revenue stream, and hyperscalers successfully transition to internal silicon (TPUs/Trainium), compressing margins and driving the price back to the $150 support level.",
    reasoning: "NVIDIA is currently operating at a scale and efficiency rarely seen in semiconductor history. The company's financial performance is accelerating, as evidenced by the revenue beat. The sheer magnitude of the Data Center segment underscores a dominant market position protected by the CUDA software moat. From a valuation perspective, the market is surprisingly conservative given the growth trajectory.",
    keyMetrics: [
      "Revenue Growth: 85% YoY",
      "Net Profit Margin: 55%",
      "Forward P/E Ratio: 23x",
      "Free Cash Flow: $97B",
      "CUDA Developers: 5.5M+"
    ],
    catalysts: [
      "Full-scale rollout of Rubin superchips for Agentic AI",
      "First shipment of Arm-based AI PC laptops from Dell and HP",
      "Execution of the $80B share buyback program"
    ],
    risks: [
      "Geopolitical instability and US-China trade sanctions",
      "Potential cyclical peak in AI infrastructure spending",
      "Competitive pressure from in-house hyperscaler silicon"
    ],
    scores: {
      financialHealth: 98,
      valuation: 82,
      marketPosition: 96,
      newsSentiment: 92,
      growthSignals: 97
    }
  },
  {
    ticker: "MSFT",
    name: "Microsoft",
    recommendation: "BUY",
    score: 84,
    confidenceScore: 90,
    bullCase: "Azure AI growth continues to run at >30% and CoPilot monetization gains massive enterprise adoption (reaching 40%+ active seat penetration), raising margins and driving multiple expansion.",
    bearCase: "CapEx spending on AI datacenters exceeds cloud revenue margins for longer than anticipated, leading to capital inefficiency, while commercial Office 365 growth slows down to single digits.",
    reasoning: "Microsoft remains the primary beneficiary of enterprise software integration of generative AI. Azure is capturing market share from AWS, and its hybrid cloud strategy is highly resilient. While CapEx remains elevated, their core commercial business provides exceptionally stable cash flows.",
    keyMetrics: [
      "Azure Revenue Growth: 33% YoY",
      "Operating Margin: 43%",
      "Forward P/E Ratio: 32x",
      "Free Cash Flow: $74B",
      "Commercial Cloud ARR: $140B+"
    ],
    catalysts: [
      "Enterprise expansion of Microsoft 365 Copilot",
      "Azure market share gains in AI cloud workloads",
      "Acquisition integration synergies (Activision Blizzard)"
    ],
    risks: [
      "Prolonged high AI infrastructure CapEx impacting near-term FCF margins",
      "FTC and international antitrust scrutiny",
      "Slowing corporate spending on standard non-AI software suites"
    ],
    scores: {
      financialHealth: 92,
      valuation: 70,
      marketPosition: 94,
      newsSentiment: 85,
      growthSignals: 88
    }
  },
  {
    ticker: "AAPL",
    name: "Apple",
    recommendation: "BUY",
    score: 78,
    confidenceScore: 88,
    bullCase: "Apple Intelligence launches a massive iPhone supercycle, driving upgrade rates in China and North America, combined with strong double-digit growth in high-margin Services revenue.",
    bearCase: "Weak innovation in device hardware fails to drive upgrade cycles, and regulatory changes in the EU/US force changes to the App Store commission structure, hurting Services growth.",
    reasoning: "Apple's ecosystem remains the most loyal consumer network in the world. Apple Intelligence provides a natural upgrade catalyst for an aging installed base of smartphones. Services segment expansion provides excellent margin protection, offset slightly by flat hardware units in non-smartphone divisions.",
    keyMetrics: [
      "Services Revenue Growth: 12% YoY",
      "Gross Margin: 46.2%",
      "Forward P/E Ratio: 28x",
      "Cash Balance: $162B",
      "Active Devices: 2.2B"
    ],
    catalysts: [
      "Widespread rollout of localized Apple Intelligence features",
      "Accelerated iPhone upgrade cycle",
      "Expansion of financial and health services"
    ],
    risks: [
      "Regulatory antitrust pressure on App Store fees and search deals",
      "Soft consumer electronics demand in key Asian markets",
      "Supply chain dependency on Taiwan and China assembly"
    ],
    scores: {
      financialHealth: 94,
      valuation: 65,
      marketPosition: 90,
      newsSentiment: 78,
      growthSignals: 75
    }
  },
  {
    ticker: "AMZN",
    name: "Amazon",
    recommendation: "BUY",
    score: 82,
    confidenceScore: 86,
    bullCase: "AWS acceleration peaks above 20% on generative AI model training workloads, retail margins expand via automated robotics distribution hubs, and ad network continues to capture digital market share.",
    bearCase: "Consumer retail demand falls on macro headwinds, and rising wage inflation forces higher warehouse operating costs, squeezing e-commerce margins.",
    reasoning: "Amazon's three growth engines (AWS, Digital Ads, and Retail Efficiency) are executing in unison. AWS is showing re-acceleration, and digital advertising is high-margin. Retail automation is beginning to pay off, structurally elevating domestic e-commerce profit margins.",
    keyMetrics: [
      "AWS Growth Rate: 19% YoY",
      "Operating Cash Flow: $98B",
      "Forward P/E Ratio: 29x",
      "Advertising Growth: 24% YoY",
      "Capital Expenditure: $55B"
    ],
    catalysts: [
      "AWS Bedrock AI model adoption by enterprise clients",
      "Expansion of Prime Video ad tiers globally",
      "Broader deployment of humanoid robotics in fulfillment centers"
    ],
    risks: [
      "Antitrust lawsuit from FTC targeting Prime bundling",
      "Intensified retail competition from low-cost Chinese marketplaces",
      "Labor unionization struggles in key US shipping centers"
    ],
    scores: {
      financialHealth: 88,
      valuation: 75,
      marketPosition: 92,
      newsSentiment: 80,
      growthSignals: 86
    }
  },
  {
    ticker: "GOOGL",
    name: "Alphabet",
    recommendation: "BUY",
    score: 76,
    confidenceScore: 84,
    bullCase: "Google Gemini successfully maintains search market share while Gemini-enabled cloud API workloads expand AWS-style cloud margins. YouTube subscriptions and premium ad growth continues.",
    bearCase: "AI search engines (e.g. OpenAI Search/Perplexity) start eroding Search volumes, while DOJ antitrust rulings force a breakup or prohibit lucrative defaults with Apple and Android.",
    reasoning: "Google has unmatched datasets and AI capability, but faces key regulatory overhangs. Search is proving resilient against early AI disruptors, and Google Cloud is highly profitable now. The stock is historically cheap compared to peers, pricing in regulatory and AI-disruption fears.",
    keyMetrics: [
      "Search Revenue Growth: 11% YoY",
      "Google Cloud Margin: 12.5%",
      "Forward P/E Ratio: 19.5x",
      "Cash from Operations: $101B",
      "YouTube Active Users: 2.7B"
    ],
    catalysts: [
      "Enterprise rollout of Gemini 1.5 Ultra workloads",
      "Legal wins in search dominance appeals",
      "Aggressive capital return program via buybacks and dividends"
    ],
    risks: [
      "DOJ antitrust remedy phase targeting Google's search distribution agreements",
      "Rising cost per AI query compressing search gross margins",
      "Ad dollar migration to retail networks (Amazon/Walmart)"
    ],
    scores: {
      financialHealth: 90,
      valuation: 82,
      marketPosition: 85,
      newsSentiment: 68,
      growthSignals: 76
    }
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    recommendation: "BUY",
    score: 80,
    confidenceScore: 85,
    bullCase: "Llama 4 models establish open-source developer dominance, AI recommendation algorithms drive double-digit increases in Reels/Threads ad impressions, and Reality Labs losses begin to taper.",
    bearCase: "Regulatory constraints on ad targeting in EU/US impact CPM prices, while heavy CapEx on Nvidia GPUs fails to translate into direct revenue drivers, leading to margin compression.",
    reasoning: "Meta has built an incredibly efficient AI monetization engine. AI-curated content loops are successfully keeping users engaged. Their digital advertising margin structure is highly robust, and open-sourcing Llama commoditizes the underlying foundation models of their competitors.",
    keyMetrics: [
      "Ad Impression Growth: 17% YoY",
      "Operating Margin: 38%",
      "Forward P/E Ratio: 22x",
      "Daily Active Apps: 3.24B",
      "CapEx Guidance: $37B - $40B"
    ],
    catalysts: [
      "Ad conversion improvement via AI-generated creatives",
      "Monetization of WhatsApp Business messaging and Threads",
      "Release of new consumer smart glasses in partnership with EssilorLuxottica"
    ],
    risks: [
      "Heavy infrastructure expenditures with long-term payoff cycles",
      "Adolescent safety lawsuits and government regulation in the US/EU",
      "Reliance on third-party mobile OS rules for tracking consent"
    ],
    scores: {
      financialHealth: 86,
      valuation: 78,
      marketPosition: 88,
      newsSentiment: 76,
      growthSignals: 82
    }
  },
  {
    ticker: "TSLA",
    name: "Tesla",
    recommendation: "HOLD",
    score: 55,
    confidenceScore: 82,
    bullCase: "Successful mass production of Robotaxis and widespread regulatory approval of FSD by 2027, coupled with the 16GW energy storage rollout, could drive the stock toward the $500+ range.",
    bearCase: "Continued erosion of EV market share and a regulatory crackdown on FSD/Autopilot following crash probes could trigger a re-valuation as a standard auto company, potentially dropping the price toward $290.",
    reasoning: "Tesla is in a transitional phase between its second-generation vehicle platform and its future autonomous taxi fleet. Near-term margins are impacted by EV price cuts, but their energy storage business represents a significant, highly-profitable growth engine.",
    keyMetrics: [
      "EV Deliveries Growth: Flat YoY",
      "Energy Storage Growth: 120% YoY",
      "Forward P/E Ratio: 78x",
      "Operating Margin: 8.5%",
      "Free Cash Flow: $3.2B"
    ],
    catalysts: [
      "Regulatory approval and rollout of unsupervised FSD in major markets",
      "Production start of the sub-$25K next-gen electric vehicle",
      "Megapack facility scaling to full 40GWh capacity in Shanghai"
    ],
    risks: [
      "Declining margins due to hyper-competition in China EV market",
      "NHTSA recalls or software locks on Autopilot system",
      "High valuation multiple susceptibility to interest rates and macro slows"
    ],
    scores: {
      financialHealth: 78,
      valuation: 32,
      marketPosition: 70,
      newsSentiment: 48,
      growthSignals: 85
    }
  },
  {
    ticker: "AMD",
    name: "AMD",
    recommendation: "HOLD",
    score: 62,
    confidenceScore: 80,
    bullCase: "MI300/MI350 series accelerators exceed $8B in annual sales as cloud providers diversify from Nvidia, while client PC recovery continues with AI-enabled Ryzen processors.",
    bearCase: "Nvidia's rapid chip cadence (Blackwell/Rubin) widening the performance gap, leading to pricing pressure on AMD accelerators and capping cloud customer adoption.",
    reasoning: "AMD is the primary alternative to Nvidia's accelerator monopoly, which gives them a high growth premium. However, they must build a software ecosystem comparable to CUDA to capture enterprise market share. Valuation is rich relative to current margins, demanding near-perfect execution in datacenters.",
    keyMetrics: [
      "Data Center Segment Growth: 80% YoY",
      "Gross Margin: 47%",
      "Forward P/E Ratio: 34x",
      "AI Accelerator Sales: $5.4B",
      "Client CPU Growth: 12% YoY"
    ],
    catalysts: [
      "Customer validation of the MI325X and MI350X architectures",
      "Expansion of ROCm software framework developer adoption",
      "Server CPU market share gains against Intel"
    ],
    risks: [
      "Slower software optimization compared to Nvidia's ecosystem",
      "TSMC packaging capacity constraints limiting product supply",
      "Cyclical gaming console segment downturn"
    ],
    scores: {
      financialHealth: 82,
      valuation: 50,
      marketPosition: 75,
      newsSentiment: 72,
      growthSignals: 78
    }
  }
];

export interface NewsAlert {
  id: string;
  ticker: string;
  headline: string;
  sentiment: number; // 0-100
  time: string;
  category: "earnings" | "product" | "regulatory" | "sentiment";
}

export const LATEST_NEWS_ALERTS: NewsAlert[] = [
  {
    id: "a1",
    ticker: "NVDA",
    headline: "NVIDIA Rubin architecture schedule finalized; pilot shipments to cloud partners begin ahead of forecast.",
    sentiment: 95,
    time: "10m ago",
    category: "product"
  },
  {
    id: "a2",
    ticker: "TSLA",
    headline: "Federal safety regulators launch safety probe into latest FSD version after driver logs near-miss report.",
    sentiment: 32,
    time: "25m ago",
    category: "regulatory"
  },
  {
    id: "a3",
    ticker: "AAPL",
    headline: "Apple Intelligence updates rolled out to all EU users as compliance discussions with Brussels show progress.",
    sentiment: 82,
    time: "45m ago",
    category: "regulatory"
  },
  {
    id: "a4",
    ticker: "MSFT",
    headline: "Microsoft introduces Copilot Pages to expand collaborative AI workspaces for large enterprise clients.",
    sentiment: 78,
    time: "1h ago",
    category: "product"
  },
  {
    id: "a5",
    ticker: "AMZN",
    headline: "AWS launches Bedrock custom model imports, allowing enterprise clients to upload proprietary weights.",
    sentiment: 88,
    time: "2h ago",
    category: "product"
  },
  {
    id: "a6",
    ticker: "GOOGL",
    headline: "DOJ trial remedies draft leaks, suggesting potential restrictions on browser defaults but no immediate breakup request.",
    sentiment: 58,
    time: "3h ago",
    category: "regulatory"
  },
  {
    id: "a7",
    ticker: "META",
    headline: "Meta releases Llama 3.1 lightweight versions tailored for direct running on mobile devices, capturing developer interest.",
    sentiment: 84,
    time: "4h ago",
    category: "product"
  },
  {
    id: "a8",
    ticker: "AMD",
    headline: "Major cloud client switches secondary cluster orders to AMD MI325X accelerators, citing Nvidia queue delay.",
    sentiment: 76,
    time: "5h ago",
    category: "earnings"
  }
];
