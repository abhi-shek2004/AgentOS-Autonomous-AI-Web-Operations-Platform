"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const STEPS = [
  "Initializing AgentOS kernel v1.0.0",
  "Bootstrapping LangGraph orchestrator",
  "Spawning 7-agent swarm",
  "Loading AES-256 cryptographic vault",
  "Establishing WebSocket mesh topology",
  "Compiling neural policy graph",
  "System online.",
];

export function BootLoader({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const totalDuration = 2400;
    const stepDuration = totalDuration / STEPS.length;
    const startTime = Date.now();

    const stepInterval = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, stepDuration);

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / totalDuration, 1);
      setProgress(p * 100);
      if (p >= 1) {
        clearInterval(progressInterval);
        clearInterval(stepInterval);
        setTimeout(() => {
          setDone(true);
          setTimeout(onFinish, 700);
        }, 300);
      }
    }, 30);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [onFinish]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="boot-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 grid-bg-fine opacity-40" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-[480px] max-w-[90vw] glass-panel rounded-2xl p-8 hologram"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10">
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500"
                  animate={{ rotate: [0, 90, 180, 270, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{ filter: "blur(2px)", opacity: 0.6 }}
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg tracking-wide">AgentOS</h2>
                <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">
                  Autonomous Web Operations
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-900/80 rounded-full overflow-hidden mb-4 border border-borderSleek">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-violet-500"
                style={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
              />
            </div>

            {/* Logs */}
            <div className="font-mono text-[11px] text-slate-300 space-y-1.5 min-h-[180px]">
              {STEPS.slice(0, step + 1).map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-emerald-400">[OK]</span>
                  <span className={i === step ? "text-cyan-300" : "text-slate-400"}>{s}</span>
                  {i === step && i < STEPS.length - 1 && (
                    <motion.span
                      className="inline-block w-1.5 h-3 bg-cyan-300 ml-0.5"
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex justify-between text-[10px] font-mono text-slate-500">
              <span>BUILD 2026.05.30</span>
              <span>{Math.floor(progress)}%</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
