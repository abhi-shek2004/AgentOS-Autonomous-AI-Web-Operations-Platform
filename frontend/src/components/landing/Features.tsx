"use client";

import {
  Brain, Eye, MousePointerClick, ShieldCheck, Database, Wrench, Activity, Lock,
} from "lucide-react";
import { RevealOnScroll } from "../effects/RevealOnScroll";
import { TiltCard } from "../ui/TiltCard";

const FEATURES = [
  {
    icon: Brain,
    color: "from-indigo-500 to-violet-500",
    glow: "shadow-indigo-500/40",
    title: "Planner Agent",
    desc: "Zero-shot Tree-of-Thought decomposition. Translates a single sentence into granular action graphs with success criteria.",
    tag: "Reasoning",
  },
  {
    icon: Eye,
    color: "from-cyan-500 to-blue-500",
    glow: "shadow-cyan-500/40",
    title: "Navigator Agent",
    desc: "Visual DOM coordinate grids. Computes accessibility pathways, A11y trees, and pixel-perfect selector coordinates.",
    tag: "Perception",
  },
  {
    icon: MousePointerClick,
    color: "from-emerald-500 to-teal-500",
    glow: "shadow-emerald-500/40",
    title: "Executor Agent",
    desc: "Sandboxed Playwright context. Synthesizes visual replays via Pillow canvas drawing for forensic analysis.",
    tag: "Action",
  },
  {
    icon: ShieldCheck,
    color: "from-rose-500 to-pink-500",
    glow: "shadow-rose-500/40",
    title: "Recovery Agent",
    desc: "Heuristic self-healing. Detects selector drift, A/B tests, layout mutations and patches CSS in-memory on the fly.",
    tag: "Resilience",
  },
  {
    icon: Activity,
    color: "from-violet-500 to-fuchsia-500",
    glow: "shadow-violet-500/40",
    title: "Validator Agent",
    desc: "Outcome auditor. Cross-references executed state against success criteria before releasing the step pointer.",
    tag: "Governance",
  },
  {
    icon: Lock,
    color: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/40",
    title: "AES-256 Vault",
    desc: "Fernet symmetric encryption with derived SHA-256 secrets. Credentials never touch logs or databases in plaintext.",
    tag: "Security",
  },
  {
    icon: Database,
    color: "from-sky-500 to-indigo-500",
    glow: "shadow-sky-500/40",
    title: "Memory Agent",
    desc: "PostgreSQL trajectory indexing. Stores successful selector paths for instant retrieval on future sessions.",
    tag: "Persistence",
  },
  {
    icon: Wrench,
    color: "from-teal-500 to-cyan-500",
    glow: "shadow-teal-500/40",
    title: "Supervisor",
    desc: "LangGraph state router. Token-bounded orchestration, multi-tab threads, and Human-in-the-Loop safety gates.",
    tag: "Orchestration",
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-32">
      <div className="absolute inset-0 grid-bg-fine opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-[10px] font-mono text-indigo-300 uppercase tracking-[0.4em] mb-4">
              [ 02 / Core Capabilities ]
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight">
              <span className="text-white">A swarm of </span>
              <span className="text-kinetic">7 specialized agents</span>
              <span className="text-white">.</span>
            </h2>
            <p className="mt-6 text-slate-400 text-lg">
              Every browser gesture is decomposed, audited, and self-healed by an isolated agent running on a shared LangGraph state chart.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <RevealOnScroll key={i} delay={i * 0.05}>
                <TiltCard>
                  <div className="glass-card rounded-2xl p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center shadow-lg ${f.glow}`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest border border-borderSleek rounded-full px-2 py-0.5">
                        {f.tag}
                      </span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>

                    <div className="mt-5 pt-4 border-t border-borderSleek/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>0x0{i.toString(16).toUpperCase()}</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        ONLINE
                      </span>
                    </div>
                  </div>
                </TiltCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
