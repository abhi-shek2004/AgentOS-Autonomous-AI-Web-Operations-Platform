"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ArrowRight, Cpu, Globe, Database, ShieldCheck, Activity, Settings } from "lucide-react";

const COMMANDS = [
  { id: "overview", label: "Operations Overview", icon: Activity, section: "Navigate" },
  { id: "monitor", label: "Agent Monitor", icon: Cpu, section: "Navigate" },
  { id: "replay", label: "Browser Replay", icon: Globe, section: "Navigate" },
  { id: "memory", label: "Memory Bank", icon: Database, section: "Navigate" },
  { id: "vault", label: "Credentials Vault", icon: ShieldCheck, section: "Navigate" },
  { id: "settings", label: "System Settings", icon: Settings, section: "Navigate" },
];

export function CommandPalette({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setActiveIdx(0);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const filtered = COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIdx]) {
      onSelect(filtered[activeIdx].id);
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="w-[580px] max-w-[90vw] glass-panel rounded-2xl cmdk-shadow overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4 border-b border-borderSleek">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIdx(0);
                }}
                onKeyDown={handleKey}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-500 text-sm"
              />
              <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded border border-borderSleek">
                ESC
              </span>
            </div>

            <div className="max-h-[300px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No commands found.
                </div>
              ) : (
                filtered.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelect(c.id);
                        setOpen(false);
                      }}
                      onMouseEnter={() => setActiveIdx(i)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                        i === activeIdx
                          ? "bg-indigo-500/15 text-white border border-indigo-500/30"
                          : "text-slate-300 border border-transparent"
                      }`}
                    >
                      <Icon className="w-4 h-4 text-indigo-400" />
                      <span className="flex-1 text-left">{c.label}</span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase">
                        {c.section}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-borderSleek text-[10px] font-mono text-slate-500 flex justify-between">
              <span>↑↓ Navigate</span>
              <span>↵ Open</span>
              <span>⌘K Toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
