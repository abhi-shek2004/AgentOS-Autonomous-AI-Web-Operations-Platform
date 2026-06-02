"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { AuroraBackground } from "@/components/effects/AuroraBackground";
import { Noise } from "@/components/effects/Noise";
import { CustomCursor } from "@/components/effects/CustomCursor";
import { BootLoader } from "@/components/effects/BootLoader";
import { CommandPalette } from "@/components/effects/CommandPalette";

import { TopNav } from "@/components/landing/TopNav";
import { Hero } from "@/components/landing/Hero";
import { LogoTicker } from "@/components/landing/LogoTicker";
import { Features } from "@/components/landing/Features";
import { Architecture } from "@/components/landing/Architecture";
import { WorkflowDemo } from "@/components/landing/WorkflowDemo";
import { Metrics } from "@/components/landing/Metrics";
import { Security } from "@/components/landing/Security";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

import { Dashboard } from "@/components/dashboard/Dashboard";

type View = "landing" | "dashboard";

export default function Home() {
  const [booting, setBooting] = useState(true);
  const [view, setView] = useState<View>("landing");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (view !== "landing") return;
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [view]);

  const handleLaunch = () => {
    setView("dashboard");
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const handleBack = () => {
    setView("landing");
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  return (
    <>
      <AuroraBackground />
      <Noise />
      <CustomCursor />
      <BootLoader onFinish={() => setBooting(false)} />

      <CommandPalette
        onSelect={(id) => {
          if (id === "settings" || id === "vault" || id === "memory" || id === "replay" || id === "monitor" || id === "overview") {
            if (view !== "dashboard") setView("dashboard");
            // Brief delay to let Dashboard mount
            setTimeout(() => {
              const target = document.querySelector(`[data-tab="${id}"]`) as HTMLButtonElement | null;
              target?.click();
            }, 200);
          }
        }}
      />

      <AnimatePresence mode="wait">
        {!booting && view === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <TopNav onLaunch={handleLaunch} onCommand={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
            }} scrolled={scrolled} />
            <main>
              <Hero onLaunch={handleLaunch} />
              <LogoTicker />
              <Features />
              <Architecture />
              <WorkflowDemo />
              <Metrics />
              <Security />
              <CTA onLaunch={handleLaunch} />
              <Footer />
            </main>
          </motion.div>
        )}

        {!booting && view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <Dashboard onBack={handleBack} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
