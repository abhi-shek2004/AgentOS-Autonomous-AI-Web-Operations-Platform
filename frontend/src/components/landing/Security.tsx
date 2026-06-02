"use client";

import { RevealOnScroll } from "../effects/RevealOnScroll";
import { Lock, Eye, KeyRound, FileKey, ShieldCheck, AlertTriangle } from "lucide-react";

const SECURITY = [
  {
    icon: KeyRound,
    title: "Fernet AES-256",
    desc: "Symmetric encryption with cryptographically derived SHA-256 secrets. RFC-compliant.",
  },
  {
    icon: Eye,
    title: "In-Memory Decryption",
    desc: "Credentials decrypted strictly during execution frames. Never written to logs or databases in plaintext.",
  },
  {
    icon: ShieldCheck,
    title: "Multi-Tenant Isolation",
    desc: "Per-domain vault keys. Account credentials never leak across concurrent workflow contexts.",
  },
  {
    icon: FileKey,
    title: "Encrypted at Rest",
    desc: "Vault database rows encrypted with envelope encryption. KDF-derived keys never persist to disk.",
  },
  {
    icon: Lock,
    title: "Zero Plaintext Logging",
    desc: "Audit logs scrub sensitive fields. Display names masked, password fields redacted at source.",
  },
  {
    icon: AlertTriangle,
    title: "Human-in-the-Loop",
    desc: "Sensitive actions (payments, deletions) trigger approval gates. Supervisor pauses for review.",
  },
];

export function Security() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-rose-500/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <RevealOnScroll>
            <span className="inline-block text-[10px] font-mono text-rose-300 uppercase tracking-[0.4em] mb-4">
              [ 06 / Security ]
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight">
              <span className="text-white">Built </span>
              <span className="text-kinetic">zero-trust</span>
              <span className="text-white"> from the kernel up.</span>
            </h2>
            <p className="mt-6 text-slate-400 text-lg leading-relaxed">
              Credentials are the most sensitive surface in browser automation. We treat them as radioactive material — encrypted at rest, decrypted only at the moment of need, and never logged.
            </p>

            <div className="mt-8 glass-panel rounded-2xl p-6 hologram">
              <div className="text-[10px] font-mono text-rose-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Lock className="w-3 h-3" />
                Vault encryption pipeline
              </div>
              <div className="space-y-3 font-mono text-xs">
                {[
                  { label: "Master Secret", val: "env://AGENTOS_MASTER_KEY", color: "text-rose-300" },
                  { label: "KDF", val: "PBKDF2-HMAC-SHA256 (480k iter)", color: "text-amber-300" },
                  { label: "Cipher", val: "AES-256-CBC + HMAC", color: "text-emerald-300" },
                  { label: "Token", val: "Fernet (URL-safe base64)", color: "text-cyan-300" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <span className="text-slate-500 shrink-0">{row.label}</span>
                    <span className={`${row.color} truncate`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.2}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SECURITY.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="glass-card rounded-2xl p-5 hover:border-rose-500/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-rose-300" />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1.5">{s.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
