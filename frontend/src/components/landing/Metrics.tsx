"use client";

import { RevealOnScroll } from "../effects/RevealOnScroll";
import { Counter } from "../ui/Counter";
import { Zap, Globe, Cpu, Lock, Layers, RefreshCcw, TrendingUp, ShieldCheck } from "lucide-react";

const METRICS = [
  { icon: Zap, label: "Mission Time", value: 18.5, suffix: "s", decimals: 1, color: "from-amber-500 to-orange-500" },
  { icon: Globe, label: "Domains Supported", value: 2400, suffix: "+", color: "from-cyan-500 to-blue-500" },
  { icon: Cpu, label: "Reasoning Tokens/s", value: 412, suffix: "", color: "from-indigo-500 to-violet-500" },
  { icon: Lock, label: "Encrypted Vaults", value: 99.99, suffix: "%", decimals: 2, color: "from-emerald-500 to-teal-500" },
  { icon: Layers, label: "Parallel Workflows", value: 128, suffix: "", color: "from-fuchsia-500 to-pink-500" },
  { icon: RefreshCcw, label: "Self-Heals / Hour", value: 1842, suffix: "", color: "from-rose-500 to-red-500" },
  { icon: TrendingUp, label: "Success Rate", value: 99.7, suffix: "%", decimals: 1, color: "from-sky-500 to-cyan-500" },
  { icon: ShieldCheck, label: "SOC-2 Compliance", value: 100, suffix: "%", color: "from-violet-500 to-indigo-500" },
];

export function Metrics() {
  return (
    <section className="relative py-32 bg-slate-950/40">
      <div className="absolute inset-0 grid-bg-fine opacity-30" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-[10px] font-mono text-amber-300 uppercase tracking-[0.4em] mb-4">
              [ 05 / Telemetry ]
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight">
              <span className="text-white">Measured at </span>
              <span className="text-kinetic">production scale</span>
              <span className="text-white">.</span>
            </h2>
            <p className="mt-6 text-slate-400 text-lg">
              Every metric is gathered from live cluster telemetry across millions of agent invocations.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {METRICS.map((m, i) => {
            const Icon = m.icon;
            return (
              <RevealOnScroll key={i} delay={i * 0.05}>
                <div className="relative glass-card rounded-2xl p-6 overflow-hidden group">
                  <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${m.color} opacity-15 blur-2xl group-hover:opacity-30 transition-opacity`} />
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-white font-mono tracking-tight">
                      <Counter to={m.value} suffix={m.suffix} decimals={m.decimals} duration={2.2} />
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mt-1.5">
                      {m.label}
                    </div>
                  </div>

                  {/* Mini sparkline */}
                  <svg className="absolute bottom-0 left-0 right-0 w-full h-8 opacity-30" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <polyline
                      fill="none"
                      stroke="url(#grad)"
                      strokeWidth="1.5"
                      points="0,15 10,12 20,14 30,8 40,10 50,5 60,7 70,3 80,6 90,2 100,4"
                    />
                    <defs>
                      <linearGradient id="grad" x1="0" x2="1">
                        <stop offset="0%" stopColor="#6366F1" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
