"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Search, Command, Github, ArrowRight } from "lucide-react";

export function TopNav({
  onLaunch,
  onCommand,
  scrolled,
}: {
  onLaunch: () => void;
  onCommand: () => void;
  scrolled: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div
          className={`flex items-center justify-between gap-4 px-5 py-3 rounded-2xl transition-all duration-500 ${
            scrolled
              ? "glass-panel shadow-depth"
              : "bg-transparent border border-transparent"
          }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 opacity-80 blur-md group-hover:opacity-100 transition" />
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-neon-soft">
                <Layers className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm leading-none tracking-wide">AgentOS</div>
              <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                v1.0.0 · Stable
              </div>
            </div>
          </a>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {[
              { label: "Features", href: "#features" },
              { label: "Architecture", href: "#architecture" },
              { label: "Telemetry", href: "#metrics" },
              { label: "Security", href: "#security" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition font-medium"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCommand}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card text-xs text-slate-400 hover:text-slate-200 transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Quick Search</span>
              <span className="flex items-center gap-0.5 ml-2">
                <span className="px-1 rounded bg-slate-800 text-slate-500 font-mono text-[10px]">⌘</span>
                <span className="px-1 rounded bg-slate-800 text-slate-500 font-mono text-[10px]">K</span>
              </span>
            </button>

            <a
              href="#"
              className="hidden sm:flex w-9 h-9 rounded-lg glass-card items-center justify-center text-slate-400 hover:text-white transition"
            >
              <Github className="w-4 h-4" />
            </a>

            <button
              onClick={onLaunch}
              className="relative group px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-semibold text-sm shadow-neon-soft hover:shadow-neon-glow transition-all flex items-center gap-1.5"
            >
              Launch
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
