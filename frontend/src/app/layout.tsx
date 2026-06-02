import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentOS — Autonomous Web Operations Platform",
  description:
    "An autonomous multi-agent system that understands, plans, executes, and self-heals complex browser workflows without human intervention. Powered by LangGraph state charts and Playwright vision.",
  keywords: [
    "AgentOS", "Autonomous AI", "Multi-Agent", "LangGraph", "Playwright",
    "Browser Automation", "Self-Healing", "Vision AI", "Web Operations",
  ],
  openGraph: {
    title: "AgentOS — Autonomous Web Operations Platform",
    description: "A production-grade 7-agent LangGraph orchestrator for browser automation.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-slate-100">
        {children}
      </body>
    </html>
  );
}
