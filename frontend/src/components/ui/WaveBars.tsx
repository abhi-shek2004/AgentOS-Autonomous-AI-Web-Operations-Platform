"use client";

import { useEffect, useState } from "react";

export function WaveBars({ bars = 24, className = "" }: { bars?: number; className?: string }) {
  const [heights, setHeights] = useState<number[]>(Array(bars).fill(20));

  useEffect(() => {
    const interval = setInterval(() => {
      setHeights(
        Array.from({ length: bars }, () => 20 + Math.random() * 80)
      );
    }, 220);
    return () => clearInterval(interval);
  }, [bars]);

  return (
    <div className={`flex items-center justify-center gap-[2px] h-12 ${className}`}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{
            height: `${h}%`,
            animationDelay: `${i * 0.05}s`,
            background: `linear-gradient(180deg, hsl(${(i * 360) / bars} 90% 65%), #6366F1)`,
            transition: "height 0.3s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      ))}
    </div>
  );
}
