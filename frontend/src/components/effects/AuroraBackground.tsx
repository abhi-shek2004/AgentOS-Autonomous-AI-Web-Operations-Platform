"use client";

import { motion } from "framer-motion";

export function AuroraBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep base radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(40,30,90,0.45),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,80,120,0.35),transparent_55%)]" />

      {/* Animated orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-40"
        style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 60%)", filter: "blur(80px)" }}
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 -right-60 w-[700px] h-[700px] rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, #06B6D4 0%, transparent 60%)", filter: "blur(100px)" }}
        animate={{ x: [0, -80, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 w-[800px] h-[800px] rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, #8B5CF6 0%, transparent 60%)", filter: "blur(110px)" }}
        animate={{ x: [0, 50, -50, 0], y: [0, -40, 40, 0], scale: [1, 1.05, 0.95, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-2/3 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #10B981 0%, transparent 60%)", filter: "blur(100px)" }}
        animate={{ x: [0, 80, -40, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg-fine opacity-50" />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}
