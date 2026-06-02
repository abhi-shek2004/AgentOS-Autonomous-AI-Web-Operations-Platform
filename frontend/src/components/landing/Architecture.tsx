"use client";

import { RevealOnScroll } from "../effects/RevealOnScroll";
import { LiveLogTicker } from "../ui/LiveLogTicker";
import { Workflow, ShieldCheck, Cpu, Database, Lock } from "lucide-react";

const STAGES = [
  { name: "Goal", desc: "Natural language", color: "#6366F1", from: "#6366F1", to: "#4338CA" },
  { name: "Plan", desc: "Tree-of-Thought", color: "#8B5CF6", from: "#8B5CF6", to: "#6D28D9" },
  { name: "Locate", desc: "A11y Coordinates", color: "#06B6D4", from: "#06B6D4", to: "#0E7490" },
  { name: "Execute", desc: "Playwright Action", color: "#10B981", from: "#10B981", to: "#047857" },
  { name: "Validate", desc: "DOM Assertions", color: "#F59E0B", from: "#F59E0B", to: "#B45309" },
  { name: "Heal", desc: "Self-Recovery", color: "#F43F5E", from: "#F43F5E", to: "#BE123C" },
  { name: "Index", desc: "Postgres Memory", color: "#6366F1", from: "#6366F1", to: "#4338CA" },
];

export function Architecture() {
  return (
    <section id="architecture" className="relative py-32 bg-slate-950/30">
      <div className="absolute inset-0 grid-bg-fine opacity-20" />
      <div className="absolute -left-40 top-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[120px]" />
      <div className="absolute -right-40 bottom-1/3 w-[500px] h-[500px] rounded-full bg-violet-500/10 blur-[120px]" />

      <div className="relative max-w-7xl mx-auto px-6">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-[10px] font-mono text-cyan-300 uppercase tracking-[0.4em] mb-4">
              [ 03 / State Graph ]
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight">
              <span className="text-white">A continuous </span>
              <span className="text-aurora">reasoning pipeline</span>
              <span className="text-white">.</span>
            </h2>
            <p className="mt-6 text-slate-400 text-lg">
              Each step passes through a compiled LangGraph StateGraph. Failures route backwards to the Recovery Agent. Success routes forward to Memory.
            </p>
          </div>
        </RevealOnScroll>

        {/* Flow diagram */}
        <RevealOnScroll>
          <div className="relative glass-panel rounded-3xl p-8 md:p-12 overflow-hidden hologram">
            <div className="absolute inset-0 grid-bg-fine opacity-30" />
            <div className="relative flex flex-wrap items-center justify-center gap-3">
              {STAGES.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3">
                  <div className="group relative">
                    <div
                      className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl glass-card flex flex-col items-center justify-center text-center transition-all hover:scale-105`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg mb-1.5 flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
                      >
                        {i + 1}
                      </div>
                      <span className="text-[11px] font-bold text-white">{s.name}</span>
                      <span className="text-[9px] font-mono text-slate-400 leading-none mt-0.5">{s.desc}</span>
                    </div>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className="hidden md:block w-6 lg:w-10 h-[1px] bg-gradient-to-r from-indigo-500/60 to-cyan-500/60 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Workflow className="w-3.5 h-3.5 text-indigo-400" />
                <span>Compiled DAG</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Self-Healing Loops</span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Async Streaming</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-violet-400" />
                <span>PostgreSQL State</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>AES-256 Vault</span>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        {/* Live log ticker */}
        <RevealOnScroll delay={0.2} className="mt-12 max-w-4xl mx-auto">
          <LiveLogTicker />
        </RevealOnScroll>
      </div>
    </section>
  );
}
