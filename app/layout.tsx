import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "EquityMind — AI Investment Research Terminal",
  description: "An AI-powered equity research terminal that generates evidence-backed stock research verdicts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var savedTheme = localStorage.getItem('theme');
                var systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', initialTheme);
                if (initialTheme === 'light') {
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.remove('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-bg-base text-text-primary">
        {children}
      </body>
    </html>
  );
}
