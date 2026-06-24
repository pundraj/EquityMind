import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Investment Research Agent",
  description: "An AI investment research agent powered by LangGraph, Groq, and free data sources.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
