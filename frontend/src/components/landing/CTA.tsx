"use client";

import { RevealOnScroll } from "../effects/RevealOnScroll";
import { ArrowRight, Github, BookOpen, Terminal, Sparkles } from "lucide-react";

export function CTA({ onLaunch }: { onLaunch: () => void }) {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-600/20 blur-[150px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6">
        <RevealOnScroll>
          <div className="relative glass-panel rounded-3xl p-12 md:p-16 text-center overflow-hidden hologram">
            <div className="absolute inset-0 grid-bg-fine opacity-30" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-mono text-indigo-300 mb-6">
                <Sparkles className="w-3 h-3" />
                Production-Ready · Open Architecture
              </div>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight leading-[1.05]">
                <span className="text-white">Deploy an </span>
                <span className="text-kinetic">autonomous workforce</span>
                <span className="text-white">.</span>
              </h2>
              <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto">
                Clone the repo. Spin up the cluster with docker-compose. Watch your first multi-agent mission execute in under 90 seconds.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={onLaunch}
                  className="group relative px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-semibold shadow-neon-glow hover:shadow-cyan-glow transition-all flex items-center gap-2.5 text-sm"
                >
                  Open Mission Control
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#"
                  className="px-7 py-3.5 rounded-xl glass-panel text-slate-200 font-semibold hover:border-indigo-500/40 transition flex items-center gap-2.5 text-sm"
                >
                  <Github className="w-4 h-4" />
                  Star on GitHub
                </a>
                <a
                  href="#"
                  className="px-7 py-3.5 rounded-xl glass-panel text-slate-200 font-semibold hover:border-indigo-500/40 transition flex items-center gap-2.5 text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Documentation
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3" />
                  docker-compose up --build
                </span>
                <span>·</span>
                <span>MIT License</span>
                <span>·</span>
                <span>v1.0.0 Stable</span>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
