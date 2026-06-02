"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AgentOrbit } from "../effects/AgentOrbit";
import { Counter } from "../ui/Counter";
import { WaveBars } from "../ui/WaveBars";
import { Sparkles, ArrowRight, Play, Zap, Cpu } from "lucide-react";

export function Hero({ onLaunch }: { onLaunch: () => void }) {
  const [typed, setTyped] = useState("");
  const goal = "Find software engineering jobs on LinkedIn and submit tailored applications";
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setTyped(goal.slice(0, i));
      if (i >= goal.length) clearInterval(t);
    }, 35);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-24 pb-12">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <AgentOrbit />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg-fine opacity-30 z-10 pointer-events-none" />

      {/* Radial gradient mask */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,7,15,0.85)_100%)] z-10 pointer-events-none" />

      <div className="relative z-20 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-7 rounded-full glass-panel border-indigo-500/30 text-xs font-mono"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300">v1.0.0 — Now powered by</span>
          <span className="text-kinetic font-bold">LangGraph Multi-Agent</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-display leading-[0.95] tracking-tight"
        >
          <span className="block text-white">The Autonomous</span>
          <span className="block text-kinetic text-glow-indigo">Web Operations</span>
          <span className="block text-white">Operating System</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-7 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          A production-grade multi-agent swarm that{" "}
          <span className="text-slate-200">understands, plans, executes, and self-heals</span>{" "}
          complex browser workflows — without human intervention. Built on LangGraph state charts, Playwright vision, and AES-256 credential isolation.
        </motion.p>

        {/* Live prompt demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-9 max-w-2xl mx-auto"
        >
          <div className="glass-panel rounded-2xl p-1 hologram">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-borderSleek text-xs font-mono text-slate-500">
              <span className="w-2 h-2 rounded-full bg-rose-500/80" />
              <span className="w-2 h-2 rounded-full bg-amber-500/80" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-slate-400">~/agentos/goal.sh</span>
            </div>
            <div className="p-4 font-mono text-sm text-left">
              <div className="flex items-start gap-2 text-emerald-400">
                <span>$</span>
                <span className="text-slate-200">
                  agentos run &quot;<span className="text-cyan-300">{typed}</span>
                  <span className="animate-blink text-indigo-400">▍</span>
                  &quot;
                </span>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <WaveBars bars={28} className="h-6" />
                <span>agents spinning up...</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            onClick={onLaunch}
            className="group relative px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-semibold shadow-neon-glow hover:shadow-cyan-glow transition-all duration-300 flex items-center gap-2.5 text-sm"
          >
            <Zap className="w-4 h-4" />
            Launch Mission Control
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
          </button>
          <a
            href="#architecture"
            className="px-7 py-3.5 rounded-xl glass-panel text-slate-200 font-semibold hover:border-indigo-500/40 transition flex items-center gap-2.5 text-sm"
          >
            <Cpu className="w-4 h-4" />
            See Architecture
          </a>
        </motion.div>

        {/* Live metrics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto"
        >
          {[
            { label: "Workflows Executed", value: 487293, suffix: "" },
            { label: "Selectors Self-Healed", value: 12842, suffix: "" },
            { label: "Avg. Task Time", value: 18.5, suffix: "s", decimals: 1 },
            { label: "Agent Uptime", value: 99.97, suffix: "%", decimals: 2 },
          ].map((m, i) => (
            <div
              key={i}
              className="glass-card rounded-xl px-4 py-3.5 text-left"
            >
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                {m.label}
              </div>
              <div className="mt-1 text-2xl font-bold text-white font-mono">
                <Counter
                  to={m.value}
                  duration={2.4}
                  decimals={m.decimals}
                  suffix={m.suffix}
                />
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Scroll
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-indigo-500 to-transparent" />
      </motion.div>
    </section>
  );
}
