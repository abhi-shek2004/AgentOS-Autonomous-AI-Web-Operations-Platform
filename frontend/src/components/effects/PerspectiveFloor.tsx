"use client";

import { motion } from "framer-motion";

export function PerspectiveFloor() {
  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      <motion.div
        className="absolute inset-x-0 bottom-0 h-full"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.35) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          transform: "perspective(800px) rotateX(65deg)",
          transformOrigin: "center top",
          maskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 75%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 30%, black 75%, transparent 100%)",
        }}
        animate={{ backgroundPosition: ["0px 0px", "0px 60px"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      {/* Glow horizon */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-sm" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[80px] bg-gradient-radial from-indigo-500/30 to-transparent blur-2xl" />
    </div>
  );
}
