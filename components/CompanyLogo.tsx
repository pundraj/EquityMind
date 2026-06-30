"use client";

import React, { useState, useEffect } from "react";

interface CompanyLogoProps {
  ticker: string;
  name?: string;
  className?: string;
  size?: number;
}

export default function CompanyLogo({ ticker, name, className = "w-6 h-6", size = 24 }: CompanyLogoProps) {
  const cleanTicker = ticker ? ticker.trim().toUpperCase() : "";
  const clientId = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID;

  // Track error state / stages
  // 0: Brandfetch (if clientId is present)
  // 1: Clearbit (using mapped domain or lowercase ticker domain guess)
  // 2: Google Favicon (fallback query)
  // 3: Text Avatar (ultimate fallback)
  const [stage, setStage] = useState(clientId ? 0 : 1);

  // Reset stage when ticker changes
  useEffect(() => {
    setStage(clientId ? 0 : 1);
  }, [cleanTicker, clientId]);

  if (!cleanTicker) {
    return <DefaultAvatar name={name || "?"} className={className} size={size} />;
  }

  // Common stock tickers to official domains mapping for reliable Clearbit/Google fallbacks
  const getDomainFromTicker = (t: string): string => {
    const map: Record<string, string> = {
      AAPL: "apple.com",
      MSFT: "microsoft.com",
      GOOG: "google.com",
      GOOGL: "google.com",
      AMZN: "amazon.com",
      TSLA: "tesla.com",
      META: "meta.com",
      NFLX: "netflix.com",
      NVDA: "nvidia.com",
      AMD: "amd.com",
      INTC: "intel.com",
      MS: "morganstanley.com",
      GS: "goldmansachs.com",
      JPM: "jpmorganchase.com",
      BAC: "bankofamerica.com",
      WMT: "walmart.com",
      DIS: "disney.com",
      NKE: "nike.com",
      SBUX: "starbucks.com",
      COF: "capitalone.com",
      PYPL: "paypal.com",
      CRM: "salesforce.com",
      ORCL: "oracle.com",
      CSCO: "cisco.com",
      ADBE: "adobe.com",
      IBM: "ibm.com",
      QCOM: "qualcomm.com",
      TXN: "ti.com",
      AVGO: "broadcom.com",
      PEP: "pepsico.com",
      KO: "cocacola.com",
    };
    return map[t] || `${t.toLowerCase()}.com`;
  };

  const domain = getDomainFromTicker(cleanTicker);

  let src = "";
  if (stage === 0 && clientId) {
    src = `https://cdn.brandfetch.io/ticker/${cleanTicker}?c=${clientId}`;
  } else if (stage === 1) {
    src = `https://logo.clearbit.com/${domain}`;
  } else if (stage === 2) {
    src = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
  }

  const handleError = () => {
    // Advance to next fallback stage
    setStage((prev) => prev + 1);
  };

  if (stage >= 3 || !src) {
    return <DefaultAvatar name={cleanTicker} className={className} size={size} />;
  }

  return (
    <img
      src={src}
      alt={name || `${cleanTicker} logo`}
      width={size}
      height={size}
      className={`${className} rounded object-contain bg-white p-0.5 border border-border-default/50`}
      onError={handleError}
    />
  );
}

function DefaultAvatar({ name, className, size }: { name: string; className: string; size: number }) {
  const char = name ? name.substring(0, 2).toUpperCase() : "?";
  return (
    <div
      style={{ width: size, height: size }}
      className={`${className} rounded flex items-center justify-center bg-accent-dim text-accent border border-accent/20 text-[9px] font-mono font-bold select-none`}
      title={name}
    >
      {char}
    </div>
  );
}
