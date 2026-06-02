"use client";

import { Layers, Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-borderSleek bg-slate-950/60">
      <div className="absolute inset-0 grid-bg-fine opacity-20" />
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-neon-glow">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">AgentOS</h3>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Autonomous Web Operations
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              An autonomous multi-agent system that understands, plans, executes, and self-heals complex browser workflows. Built for production scale.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Github, Twitter, Linkedin, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg glass-card flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/40 transition"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: "Product",
              links: ["Mission Control", "Agent Stack", "Vault", "Memory Bank", "Pricing"],
            },
            {
              title: "Developers",
              links: ["Documentation", "API Reference", "LangGraph SDK", "Examples", "Changelog"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Contact", "Press Kit"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 hover:text-indigo-300 transition"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-borderSleek flex flex-wrap justify-between items-center gap-4 text-xs font-mono text-slate-500">
          <span>© 2026 AgentOS · All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              All Systems Operational
            </span>
            <span>·</span>
            <span>BUILD 2026.05.30</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
