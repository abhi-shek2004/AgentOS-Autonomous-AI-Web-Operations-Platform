"use client";

import { useEffect, useState } from "react";

const LOG_LINES = [
  { agent: "PLANNER", color: "text-indigo-300", msg: "Tree-of-Thought plan synthesized: 7 steps, 4 success criteria" },
  { agent: "NAVIGATOR", color: "text-cyan-300", msg: "Accessibility tree scanned. Found 14 actionable selectors at linkedin.com/jobs" },
  { agent: "EXECUTOR", color: "text-emerald-300", msg: "Playwright click: button.jobs-search-box__submit-button [OK 0.42s]" },
  { agent: "VALIDATOR", color: "text-violet-300", msg: "DOM mutation confirmed. Step criterion check — 12 jobs loaded" },
  { agent: "MEMORY", color: "text-amber-300", msg: "Indexed trajectory: hash=a3f7c1, 7 selectors cached" },
  { agent: "RECOVERY", color: "text-rose-300", msg: "Selector drift detected on #__next. Heuristic heal applied." },
  { agent: "SUPERVISOR", color: "text-indigo-300", msg: "State graph advanced to node[3]. Cost: $0.0021 | Tokens: 1240" },
];

export function LiveLogTicker() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setOffset((o) => o + 1), 2500);
    return () => clearInterval(t);
  }, []);
  const visible = LOG_LINES.concat(LOG_LINES).concat(LOG_LINES);

  return (
    <div className="relative overflow-hidden h-[300px] glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono text-emerald-300 uppercase tracking-widest">
            Live Agent Stream
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">/var/log/agentos.log</span>
      </div>
      <div
        className="space-y-2 font-mono text-[11px] transition-transform duration-700 ease-out"
        style={{ transform: `translateY(-${(offset % LOG_LINES.length) * 38}px)` }}
      >
        {visible.map((l, i) => (
          <div key={i} className="flex items-start gap-2 leading-relaxed">
            <span className="text-slate-600 shrink-0">[{String((i + offset) % 99).padStart(2, "0")}]</span>
            <span className={`${l.color} font-bold shrink-0 w-[80px]`}>{l.agent}</span>
            <span className="text-slate-300">{l.msg}</span>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-12 h-16 bg-gradient-to-b from-[#05070F] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#05070F] to-transparent" />
    </div>
  );
}
