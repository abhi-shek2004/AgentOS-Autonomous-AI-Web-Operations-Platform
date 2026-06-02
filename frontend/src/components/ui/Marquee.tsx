"use client";

import { ReactNode } from "react";

export function Marquee({
  children,
  speed = 30,
  direction = "left",
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden mask-fade ${className}`}>
      <div
        className="ticker-track"
        style={{
          animation: `${direction === "left" ? "marquee" : "ticker"} ${speed}s linear infinite`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {children}
        {children}
      </div>
      <style jsx>{`
        .mask-fade {
          mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
        }
      `}</style>
    </div>
  );
}
