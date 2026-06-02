"use client";

import { Marquee } from "../ui/Marquee";

const BADGES = [
  "LangGraph", "Playwright", "FastAPI", "PostgreSQL", "OpenAI Vision",
  "NVIDIA NIM", "LangChain", "Pinecone", "Redis", "Pydantic",
  "SQLAlchemy", "WebSockets", "AES-256", "Multi-Agent", "Tree-of-Thought",
  "Self-Healing", "Vision DOM", "Streaming State", "A11y Tree",
];

export function LogoTicker() {
  return (
    <section className="relative py-12 border-y border-borderSleek/50 bg-slate-950/40">
      <div className="absolute inset-0 grid-bg-fine opacity-30" />
      <div className="relative max-w-7xl mx-auto px-6 mb-6">
        <p className="text-center text-[10px] font-mono text-slate-500 uppercase tracking-[0.3em]">
          Engineered With Production-Grade Components
        </p>
      </div>
      <Marquee speed={40} direction="left">
        {BADGES.map((b, i) => (
          <div
            key={i}
            className="mx-3 px-5 py-2.5 glass-card rounded-lg text-sm font-mono text-slate-300 hover:text-white transition flex items-center gap-2"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            {b}
          </div>
        ))}
      </Marquee>
    </section>
  );
}
