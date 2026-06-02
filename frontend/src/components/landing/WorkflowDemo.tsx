"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RevealOnScroll } from "../effects/RevealOnScroll";
import { Globe, Lock, MousePointer, Search, Sparkles, Activity, ChevronRight } from "lucide-react";

const STEP_PLAN = [
  { id: 1, agent: "PLANNER", color: "indigo", desc: "Decomposing goal: 'Apply to remote React roles on LinkedIn'", detail: "→ Generated 7 steps, 4 success criteria" },
  { id: 2, agent: "NAVIGATOR", color: "cyan", desc: "Scanning accessibility tree of linkedin.com/jobs", detail: "→ 14 actionable selectors identified" },
  { id: 3, agent: "EXECUTOR", color: "emerald", desc: "Navigating to /jobs/search?keywords=React&f_WT=2", detail: "→ 200 OK, page rendered in 412ms" },
  { id: 4, agent: "EXECUTOR", color: "emerald", desc: "Filling search input: 'Senior React Developer'", detail: "→ DOM mutation confirmed" },
  { id: 5, agent: "VALIDATOR", color: "amber", desc: "Verifying 12 result cards match criteria", detail: "→ 12/12 cards contain 'React' keyword" },
  { id: 6, agent: "RECOVERY", color: "rose", desc: "Heuristic heal: button selector drifted to A/B variant", detail: "→ Patched CSS in-memory" },
  { id: 7, agent: "MEMORY", color: "violet", desc: "Indexing successful trajectory to PostgreSQL", detail: "→ 7 selectors cached for future sessions" },
];

export function WorkflowDemo() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setRunning(true);
      setActiveIdx((i) => (i + 1) % STEP_PLAN.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative py-32">
      <div className="absolute inset-0 grid-bg-fine opacity-20" />
      <div className="relative max-w-7xl mx-auto px-6">
        <RevealOnScroll>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block text-[10px] font-mono text-emerald-300 uppercase tracking-[0.4em] mb-4">
              [ 04 / Live Demonstration ]
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight">
              <span className="text-white">From sentence to </span>
              <span className="text-kinetic">completed mission</span>
              <span className="text-white">.</span>
            </h2>
            <p className="mt-6 text-slate-400 text-lg">
              Watch a multi-agent workflow execute in real time. State transitions stream over WebSockets. The browser replays visually.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Browser emulator */}
          <RevealOnScroll className="lg:col-span-3">
            <div className="glass-panel rounded-2xl overflow-hidden border border-borderSleek h-full">
              <div className="bg-slate-900/80 px-4 py-3 border-b border-borderSleek flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex-1 bg-slate-950/80 border border-borderSleek rounded-md px-3 py-1.5 flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span className="truncate">https://www.linkedin.com/jobs/search/?keywords=React&f_WT=2</span>
                </div>
              </div>
              <div className="relative h-[420px] bg-slate-950/60 p-6 overflow-hidden">
                <div className="absolute inset-0 grid-bg-fine opacity-20" />
                {/* Simulated page */}
                <div className="relative space-y-3">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center">
                      <span className="font-bold text-indigo-300 text-sm">in</span>
                    </div>
                    <div>
                      <div className="h-2 w-28 rounded bg-slate-700/60 shimmer" />
                      <div className="h-1.5 w-16 rounded bg-slate-800/60 mt-1.5 shimmer" />
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="relative">
                    <div className="h-10 rounded-lg bg-slate-900/80 border border-indigo-500/40 flex items-center px-3 gap-2">
                      <Search className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-xs font-mono text-slate-300">Senior React Developer</span>
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity }}
                        className="w-0.5 h-3.5 bg-indigo-400 ml-0.5"
                      />
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {[
                      { co: "Stripe", role: "Senior React Engineer", loc: "Remote" },
                      { co: "Vercel", role: "Frontend Engineer", loc: "Remote" },
                      { co: "Linear", role: "React Developer", loc: "Remote" },
                      { co: "Figma", role: "UI Engineer", loc: "Remote" },
                    ].map((job, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i + 0.3 }}
                        className="glass-card rounded-lg p-3 border border-borderSleek"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-slate-700 to-slate-800 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{job.role}</div>
                            <div className="text-[10px] text-slate-400 truncate">{job.co} · {job.loc}</div>
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                                Easy Apply
                              </span>
                              <span className="text-[9px] font-mono text-slate-500">2d ago</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Cursor animation */}
                  <AnimatePresence>
                    {running && (
                      <motion.div
                        key={activeIdx}
                        className="absolute pointer-events-none z-30"
                        initial={{ x: 200, y: 100, opacity: 0 }}
                        animate={{
                          x: [200, 250, 280, 250][activeIdx % 4],
                          y: [100, 130, 150, 130][activeIdx % 4],
                          opacity: 1,
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.6, ease: "easeInOut" }}
                      >
                        <MousePointer className="w-5 h-5 text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] fill-cyan-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Scan line overlay */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                      className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent"
                      animate={{ y: [-100, 500] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* Step list */}
          <RevealOnScroll className="lg:col-span-2" delay={0.2}>
            <div className="glass-panel rounded-2xl p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-white font-semibold text-sm">Agent Reasoning Stream</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-emerald-300">RUNNING</span>
                </div>
              </div>
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {STEP_PLAN.map((step, i) => {
                  const isActive = i === activeIdx;
                  const isDone = i < activeIdx;
                  return (
                    <motion.div
                      key={step.id}
                      animate={{
                        opacity: isActive ? 1 : isDone ? 0.55 : 0.35,
                        scale: isActive ? 1.02 : 1,
                      }}
                      className={`relative p-3 rounded-lg border ${
                        isActive
                          ? "border-indigo-500/50 bg-indigo-500/10 active-glow"
                          : isDone
                          ? "border-slate-800/60 bg-slate-900/30"
                          : "border-borderSleek bg-slate-900/10"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-[10px] font-mono font-bold"
                          style={{
                            color:
                              step.color === "indigo" ? "#A5B4FC" :
                              step.color === "cyan" ? "#67E8F9" :
                              step.color === "emerald" ? "#6EE7B7" :
                              step.color === "amber" ? "#FCD34D" :
                              step.color === "rose" ? "#FDA4AF" :
                              step.color === "violet" ? "#C4B5FD" : "#A5B4FC",
                          }}
                        >
                          {step.agent}
                        </span>
                        {isActive && (
                          <span className="ml-auto text-[9px] font-mono text-indigo-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            ACTIVE
                          </span>
                        )}
                        {isDone && (
                          <ChevronRight className="ml-auto w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-200 leading-snug">{step.desc}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-1">{step.detail}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
