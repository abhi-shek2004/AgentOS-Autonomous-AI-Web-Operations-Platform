"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Terminal, Play, Cpu, ShieldCheck, Database, Settings as SettingsIcon,
  Layers, AlertTriangle, CheckCircle2, Hourglass, Search, Globe, TrendingUp,
  Lock, RefreshCw, ArrowLeft, Eye, ChevronRight, Network, Trash2, Server, CheckCircle,
} from "lucide-react";
import { Counter } from "../ui/Counter";
import { WaveBars } from "../ui/WaveBars";
import { api, API, MemoryEntry, Credential, Settings as ServerSettings, Metrics } from "@/lib/api";

type Tab = "overview" | "monitor" | "replay" | "memory" | "vault" | "settings";

interface Step {
  step_id: number;
  description: string;
  action: string;
  selector: string;
  value: string;
}

interface ActionLog {
  step_id: number;
  description: string;
  action: string;
  selector: string;
  value: string;
  status: string;
  timestamp: number;
}

interface AuditLog {
  agent_name: string;
  level: string;
  message: string;
  timestamp: string;
}

const AGENT_DEFS = [
  { name: "Planner", desc: "Tree-of-thought strategy", color: "from-indigo-500 to-violet-500" },
  { name: "Navigator", desc: "Visual DOM locator extraction", color: "from-cyan-500 to-blue-500" },
  { name: "Executor", desc: "Playwright action executions", color: "from-emerald-500 to-teal-500" },
  { name: "Validator", desc: "Assertion criteria check", color: "from-violet-500 to-fuchsia-500" },
  { name: "Memory", desc: "PostgreSQL success indexer", color: "from-amber-500 to-orange-500" },
  { name: "Recovery", desc: "Selector timeout self-healer", color: "from-rose-500 to-pink-500" },
  { name: "Supervisor", desc: "Graph orchestrator", color: "from-sky-500 to-indigo-500" },
];

export function Dashboard({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [goal, setGoal] = useState("");
  const [isSimulation, setIsSimulation] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState("");

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState("idle");
  const [currentUrl, setCurrentUrl] = useState("about:blank");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [plan, setPlan] = useState<Step[]>([]);
  const [successCriteria, setSuccessCriteria] = useState<string[]>([]);
  const [actionsTaken, setActionsTaken] = useState<ActionLog[]>([]);
  const [latestScreenshot, setLatestScreenshot] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState({ prompt: 0, completion: 0, total: 0 });
  const [costUsd, setCostUsd] = useState(0);
  const [activeAgent, setActiveAgent] = useState("Supervisor");
  const [activeThought, setActiveThought] = useState(
    "AgentOS system idle. Provide a natural language goal to initialize the multi-agent swarm."
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [launching, setLaunching] = useState(false);

  // Real backend data
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [serverMetrics, setServerMetrics] = useState<Metrics | null>(null);
  const [serverSettings, setServerSettings] = useState<ServerSettings | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  // Form state
  const [vaultDomain, setVaultDomain] = useState("");
  const [vaultUser, setVaultUser] = useState("");
  const [vaultPass, setVaultPass] = useState("");
  const [keysOpenAI, setKeysOpenAI] = useState("");
  const [keysNVIDIA, setKeysNVIDIA] = useState("");
  const [defaultModel, setDefaultModel] = useState("gpt-4o");
  const [serverSimMode, setServerSimMode] = useState(true);

  const wsRef = useRef<WebSocket | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const samplePrompts = [
    { label: "LinkedIn Automation", value: "Apply to software engineering jobs on LinkedIn matching 'Remote React Developer'" },
    { label: "Market Intelligence", value: "Scrape pricing models and transaction fees from Stripe and compare with Braintree" },
    { label: "Autonomous Search", value: "Research the architecture details of OpenAI Operator vs Claude Computer Use" },
  ];

  // Scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [auditLogs]);

  // Close WS on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // Health check + initial load
  const refreshBackend = useCallback(async () => {
    setLoadingData(true);
    try {
      const h = await api.health();
      setBackendOnline(h.status === "healthy");
      const [mem, creds, m, s] = await Promise.all([
        api.listMemory().catch(() => []),
        api.listCredentials().catch(() => []),
        api.getMetrics().catch(() => null),
        api.getSettings().catch(() => null),
      ]);
      setMemories(mem);
      setCredentials(creds);
      setServerMetrics(m);
      setServerSettings(s);
      if (s) {
        setServerSimMode(s.is_simulation);
        setDefaultModel(s.default_model);
      }
    } catch (e) {
      setBackendOnline(false);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    refreshBackend();
  }, [refreshBackend]);

  // Refresh backend data periodically
  useEffect(() => {
    const t = setInterval(() => {
      if (backendOnline) {
        api.listMemory().then(setMemories).catch(() => {});
        api.listCredentials().then(setCredentials).catch(() => {});
        api.getMetrics().then(setServerMetrics).catch(() => {});
      }
    }, 8000);
    return () => clearInterval(t);
  }, [backendOnline]);

  const handleSelectPrompt = (val: string) => {
    setSelectedPrompt(val);
    setGoal(val);
  };

  // Cleanup WS helper
  const cleanupWS = () => {
    if (wsRef.current) {
      try { wsRef.current.close(); } catch {}
      wsRef.current = null;
    }
  };

  const handleLaunchWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || launching) return;
    setLaunching(true);

    // Reset
    setSessionStatus("initializing");
    setActiveSessionId(null);
    setPlan([]);
    setSuccessCriteria([]);
    setActionsTaken([]);
    setLatestScreenshot(null);
    setTokenUsage({ prompt: 0, completion: 0, total: 0 });
    setCostUsd(0);
    setActiveAgent("Supervisor");
    setErrors([]);
    setAuditLogs([{
      agent_name: "Supervisor",
      level: "INFO",
      message: `Initializing LangGraph swarm for goal: "${goal.slice(0, 80)}${goal.length > 80 ? '…' : ''}"`,
      timestamp: new Date().toLocaleTimeString(),
    }]);
    setCurrentStepIndex(0);
    setCurrentUrl("about:blank");
    setActiveThought("Supervisor spawning Planner to perform goal analysis & workflow generation...");
    setActiveTab("monitor");
    cleanupWS();

    try {
      // Create workflow
      const workflow = await api.createWorkflow({ goal, is_simulation: serverSimMode });
      setAuditLogs((prev) => [...prev, {
        agent_name: "Supervisor",
        level: "INFO",
        message: `Workflow #${workflow.id} persisted to database. Triggering run.`,
        timestamp: new Date().toLocaleTimeString(),
      }]);

      // Start session
      const run = await api.runWorkflow(workflow.id);
      const sid = run.session_id;
      setActiveSessionId(sid);

      // Open WebSocket
      const ws = api.openWorkflowSocket(sid);
      wsRef.current = ws;

      ws.onopen = () => {
        setAuditLogs((prev) => [...prev, {
          agent_name: "Supervisor",
          level: "INFO",
          message: `WebSocket established. Streaming LangGraph state transitions.`,
          timestamp: new Date().toLocaleTimeString(),
        }]);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "agent_state_update") {
            setSessionStatus(data.status);
            setCurrentUrl(data.current_url);
            setCurrentStepIndex(data.current_step_index);
            setTotalSteps(data.total_steps);
            setPlan(data.plan || []);
            setSuccessCriteria(data.success_criteria || []);
            setActionsTaken(data.actions || []);
            setLatestScreenshot(data.latest_screenshot);
            setTokenUsage(data.token_usage);
            setCostUsd(data.cost_usd);
            setActiveAgent(data.agent_name);
            setActiveThought(data.thought);
            setErrors(data.errors || []);
            setAuditLogs((prev) => [...prev, {
              agent_name: data.agent_name,
              level: (data.errors && data.errors.length > 0 && data.node_name === "recovery") ? "ERROR" : "INFO",
              message: data.thought,
              timestamp: new Date().toLocaleTimeString(),
            }]);
          } else if (data.event === "workflow_finished") {
            setSessionStatus(data.status);
            setActiveAgent("Supervisor");
            setActiveThought(data.message);
            setAuditLogs((prev) => [...prev, {
              agent_name: "Supervisor",
              level: data.status === "completed" ? "SUCCESS" : "ERROR",
              message: data.message,
              timestamp: new Date().toLocaleTimeString(),
            }]);
            // Refresh memory bank
            setTimeout(() => {
              api.listMemory().then(setMemories).catch(() => {});
              api.getMetrics().then(setServerMetrics).catch(() => {});
            }, 500);
            cleanupWS();
          }
        } catch (err) {
          console.error("WS message parse error", err);
        }
      };

      ws.onerror = () => {
        setAuditLogs((prev) => [...prev, {
          agent_name: "Supervisor",
          level: "ERROR",
          message: "WebSocket connection error. Backend may be unreachable.",
          timestamp: new Date().toLocaleTimeString(),
        }]);
        cleanupWS();
      };

      ws.onclose = () => {
        // No-op, the workflow_finished event is the source of truth
      };
    } catch (err: any) {
      setAuditLogs((prev) => [...prev, {
        agent_name: "Supervisor",
        level: "ERROR",
        message: `Failed to start mission: ${err.message || err}. Is the backend running at ${API.base}?`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
      setSessionStatus("failed");
      setBackendOnline(false);
    } finally {
      setLaunching(false);
    }
  };

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultDomain || !vaultUser || !vaultPass) return;
    try {
      const res = await api.addCredential({ domain: vaultDomain, username: vaultUser, password: vaultPass });
      setAuditLogs((prev) => [...prev, {
        agent_name: "Supervisor",
        level: "SUCCESS",
        message: res.message,
        timestamp: new Date().toLocaleTimeString(),
      }]);
      setVaultDomain(""); setVaultUser(""); setVaultPass("");
      const creds = await api.listCredentials();
      setCredentials(creds);
    } catch (err: any) {
      setAuditLogs((prev) => [...prev, {
        agent_name: "Supervisor",
        level: "ERROR",
        message: `Failed to encrypt & index credential: ${err.message || err}`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    }
  };

  const handleDeleteCredential = async (id: number) => {
    try {
      const res = await api.deleteCredential(id);
      setAuditLogs((prev) => [...prev, {
        agent_name: "Supervisor",
        level: "INFO",
        message: res.message,
        timestamp: new Date().toLocaleTimeString(),
      }]);
      const creds = await api.listCredentials();
      setCredentials(creds);
    } catch (err: any) {
      alert(`Delete failed: ${err.message || err}`);
    }
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { default_model: defaultModel, is_simulation: serverSimMode };
      // Only send keys if the user typed something
      if (keysOpenAI.trim()) payload.openai_api_key = keysOpenAI;
      if (keysNVIDIA.trim()) payload.nvidia_api_key = keysNVIDIA;
      const s = await api.updateSettings(payload);
      setServerSettings(s);
      setKeysOpenAI("");
      setKeysNVIDIA("");
      setAuditLogs((prev) => [...prev, {
        agent_name: "Supervisor",
        level: "SUCCESS",
        message: `Platform configuration saved. Model: ${s.default_model}, Simulation: ${s.is_simulation ? "ON" : "OFF"}.`,
        timestamp: new Date().toLocaleTimeString(),
      }]);
    } catch (err: any) {
      alert(`Save failed: ${err.message || err}`);
    }
  };

  const navItems: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "monitor", label: "Agent Monitor", icon: Cpu },
    { id: "replay", label: "Browser Replay", icon: Globe },
    { id: "memory", label: "Memory Bank", icon: Database },
    { id: "vault", label: "Credentials Vault", icon: ShieldCheck },
    { id: "settings", label: "System Settings", icon: SettingsIcon },
  ];

  const isRunning = !["idle", "completed", "failed", "crashed"].includes(sessionStatus);

  return (
    <div className="relative min-h-screen w-full bg-background text-slate-200 flex">
      <aside className="w-64 border-r border-borderSleek glass-panel flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div>
          <div className="p-5 border-b border-borderSleek flex items-center gap-3">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 blur-md opacity-60" />
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-neon-soft">
                <Layers className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide">AgentOS</h1>
              <p className="text-[10px] text-slate-400 font-mono">v1.0.0 Mission Control</p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-[calc(100%-1rem)] mx-2 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white border border-borderSleek hover:border-indigo-500/40 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Landing
          </button>

          <nav className="p-3 space-y-1">
            {navItems.map((it) => {
              const Icon = it.icon;
              const isActive = activeTab === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => setActiveTab(it.id)}
                  data-tab={it.id}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600/30 to-cyan-500/10 text-white border border-indigo-500/30 shadow-neon-soft"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {it.label}
                  {it.id === "monitor" && isRunning && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-borderSleek bg-slate-950/40 font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Backend:</span>
            <span className={`font-semibold flex items-center gap-1 ${backendOnline ? "text-emerald-400" : "text-rose-400"}`}>
              {backendOnline ? <><CheckCircle className="w-3 h-3" /> ONLINE</> : <><AlertTriangle className="w-3 h-3" /> OFFLINE</>}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Run Costs:</span>
            <span className="text-slate-100 font-semibold">${costUsd.toFixed(4)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Tokens:</span>
            <span className="text-indigo-400">{tokenUsage.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Vault:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> AES-256
            </span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-background relative">
        <div className="absolute inset-0 grid-bg-fine opacity-30 pointer-events-none" />

        <header className="h-16 border-b border-borderSleek glass-panel px-8 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-semibold text-lg">
              {activeTab === "overview" && "Operations Overview"}
              {activeTab === "monitor" && "Multi-Agent State Network"}
              {activeTab === "replay" && "Browser Replay & Timelines"}
              {activeTab === "memory" && "Long-term Memory Bank"}
              {activeTab === "vault" && "AES Vault Manager"}
              {activeTab === "settings" && "Platform Configuration"}
            </h2>
            {sessionStatus !== "idle" && (
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono capitalize border ${
                sessionStatus === "completed"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : sessionStatus === "failed" || sessionStatus === "crashed"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 animate-pulse"
              }`}>
                {sessionStatus}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right font-mono text-xs">
              <span className="text-slate-500">ACTIVE: </span>
              <span className="text-indigo-400 font-semibold">{activeAgent} Agent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10B981] animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
            </div>
            <button
              onClick={refreshBackend}
              disabled={loadingData}
              className="ml-2 p-1.5 rounded-md border border-borderSleek hover:border-indigo-500/40 text-slate-400 hover:text-white transition disabled:opacity-50"
              title="Refresh from backend"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        <section className="flex-1 p-6 z-10 space-y-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === "overview" && (
                <OverviewTab
                  goal={goal} setGoal={setGoal} isSimulation={serverSimMode} setIsSimulation={setServerSimMode}
                  selectedPrompt={selectedPrompt} handleSelectPrompt={handleSelectPrompt}
                  handleLaunchWorkflow={handleLaunchWorkflow} samplePrompts={samplePrompts}
                  sessionStatus={sessionStatus} auditLogs={auditLogs} terminalEndRef={terminalEndRef}
                  successCriteria={successCriteria} currentStepIndex={currentStepIndex}
                  memories={memories} activeSessionId={activeSessionId}
                  launching={launching} serverMetrics={serverMetrics} backendOnline={backendOnline}
                />
              )}
              {activeTab === "monitor" && (
                <MonitorTab activeAgent={activeAgent} activeThought={activeThought}
                  sessionStatus={sessionStatus} errors={errors} />
              )}
              {activeTab === "replay" && (
                <ReplayTab currentUrl={currentUrl} latestScreenshot={latestScreenshot}
                  plan={plan} currentStepIndex={currentStepIndex} sessionStatus={sessionStatus} />
              )}
              {activeTab === "memory" && <MemoryTab memories={memories} loading={loadingData} onRefresh={refreshBackend} />}
              {activeTab === "vault" && (
                <VaultTab credentials={credentials} vaultDomain={vaultDomain} setVaultDomain={setVaultDomain}
                  vaultUser={vaultUser} setVaultUser={setVaultUser} vaultPass={vaultPass} setVaultPass={setVaultPass}
                  handleAddCredential={handleAddCredential} handleDeleteCredential={handleDeleteCredential} />
              )}
              {activeTab === "settings" && (
                <SettingsTab
                  keysOpenAI={keysOpenAI} setKeysOpenAI={setKeysOpenAI}
                  keysNVIDIA={keysNVIDIA} setKeysNVIDIA={setKeysNVIDIA}
                  defaultModel={defaultModel} setDefaultModel={setDefaultModel}
                  isSimulation={serverSimMode} setIsSimulation={setServerSimMode}
                  handleSaveKeys={handleSaveKeys} serverSettings={serverSettings} />
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        <footer className="h-10 border-t border-borderSleek glass-panel px-6 flex justify-between items-center text-[10px] text-slate-500 font-mono z-10 shrink-0">
          <span className="flex items-center gap-3">
            AgentOS Mission Control
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1">
              <Server className="w-3 h-3" />
              {API.base.replace(/^https?:\/\//, '')}
            </span>
          </span>
          <span>Build 2026.05.30 · {serverSettings?.environment?.toUpperCase() || "DEV"}</span>
        </footer>
      </main>
    </div>
  );
}

// ================== OVERVIEW ==================
function OverviewTab({ goal, setGoal, isSimulation, setIsSimulation, selectedPrompt, handleSelectPrompt,
  handleLaunchWorkflow, samplePrompts, sessionStatus, auditLogs, terminalEndRef, successCriteria,
  currentStepIndex, memories, activeSessionId, launching, serverMetrics, backendOnline }: any) {
  const metrics = serverMetrics;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "System Status", value: backendOnline === false ? "OFFLINE" : backendOnline === null ? "CHECKING" : "OPERATIONAL",
            icon: Cpu, color: backendOnline === false ? "text-rose-400" : "text-emerald-400" },
          { label: "Workflows Run", value: metrics?.total_workflows ?? memories.length + (activeSessionId ? 1 : 0),
            icon: Activity, color: "text-indigo-400", isCount: true },
          { label: "Success Rate", value: metrics ? `${metrics.success_rate}%` : "—",
            icon: TrendingUp, color: "text-cyan-400" },
          { label: "Memory Entries", value: metrics?.memory_entries ?? memories.length,
            icon: Layers, color: "text-violet-400", isCount: true },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">{s.label}</p>
                  <h3 className={`text-xl font-bold mt-1 ${s.color}`}>
                    {s.isCount && typeof s.value === "number" ? <Counter to={s.value} duration={1.2} /> : s.value}
                  </h3>
                </div>
                <Icon className={`w-7 h-7 ${s.color} opacity-60`} />
              </div>
              <div className="mt-3 h-1 rounded-full bg-slate-800/60 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${70 + i * 7}%` }}
                  transition={{ duration: 1.5, delay: i * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-panel rounded-2xl p-6 hologram">
        <div className="flex items-center gap-2 mb-4">
          <Play className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-semibold text-base">Launch New Mission</h3>
          {!backendOnline && (
            <span className="ml-auto text-[10px] font-mono text-rose-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Backend unreachable
            </span>
          )}
        </div>
        <form onSubmit={handleLaunchWorkflow} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Find and compare Stripe and Braintree rates..."
                className="w-full bg-slate-950/80 border border-borderSleek focus:border-indigo-500 rounded-lg px-4 py-3.5 pr-10 text-slate-100 focus:outline-none transition text-sm disabled:opacity-50"
                disabled={launching || (sessionStatus !== "idle" && sessionStatus !== "completed" && sessionStatus !== "failed" && sessionStatus !== "crashed")}
              />
              <Search className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white font-semibold px-6 py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-neon-glow transition shrink-0 text-sm"
              disabled={!goal.trim() || launching || !backendOnline || (sessionStatus !== "idle" && sessionStatus !== "completed" && sessionStatus !== "failed" && sessionStatus !== "crashed")}
            >
              {launching ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Launching…</>
              ) : (
                <><Play className="w-4 h-4 fill-white" /> Execute Mission</>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p: any, idx: number) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPrompt(p.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition ${
                    selectedPrompt === p.value
                      ? "bg-indigo-600/30 text-indigo-300 border-indigo-500/40"
                      : "bg-slate-800/40 text-slate-400 border-borderSleek hover:text-slate-200 hover:border-slate-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSimulation}
                  onChange={(e) => setIsSimulation(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Simulation Mode</span>
              </label>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Globe className="w-3.5 h-3.5" />
                <span>Chrome (Headless)</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h4 className="text-white font-semibold text-sm">Live Agent Operations Logger</h4>
            </div>
            <div className="flex items-center gap-2">
              <WaveBars bars={16} className="h-5" />
              {sessionStatus !== "idle" && <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />}
            </div>
          </div>
          <div className="bg-slate-950/70 border border-borderSleek rounded-lg p-4 h-52 overflow-y-auto font-mono text-xs text-slate-300 space-y-1.5">
            <div className="text-slate-600">[SYSTEM] AgentOS kernel v1.0.0 — 7 agents online.</div>
            {auditLogs.map((log: AuditLog, idx: number) => (
              <div key={idx} className="flex gap-2 leading-relaxed">
                <span className="text-slate-600">[{log.timestamp}]</span>
                <span className={`font-semibold shrink-0 w-[80px] ${
                  log.level === "ERROR" ? "text-rose-400" : log.level === "SUCCESS" ? "text-emerald-400" : "text-indigo-400"
                }`}>{log.agent_name}:</span>
                <span className="text-slate-200">{log.message}</span>
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Success Checkpoints
          </h4>
          <div className="space-y-2.5 font-mono text-[11px]">
            {successCriteria.length === 0 ? (
              <div className="text-slate-500 text-center py-8 text-xs">
                No active workflow. Launch goal to synthesize checklist.
              </div>
            ) : (
              successCriteria.map((c: string, idx: number) => {
                const isDone = currentStepIndex > idx || sessionStatus === "completed";
                return (
                  <div key={idx} className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${
                    isDone ? "bg-emerald-500/5 border-emerald-500/20" : "bg-slate-900/40 border-borderSleek"
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Hourglass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                    )}
                    <span className={isDone ? "text-slate-400 line-through" : "text-slate-200"}>
                      {c}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================== MONITOR ==================
function MonitorTab({ activeAgent, activeThought, sessionStatus, errors }: any) {
  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-2xl p-6 hologram">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-400" />
              Multi-Agent Communication Network
            </h3>
            <p className="text-xs text-slate-500 mt-1">Live state graph — LangGraph node routing</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Active</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-700" /> Standby</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Error</span>
          </div>
        </div>

        <div className="relative min-h-[460px] border border-borderSleek bg-slate-950/40 rounded-2xl p-6 overflow-hidden">
          <div className="absolute inset-0 grid-bg-fine opacity-40" />

          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {AGENT_DEFS.slice(0, -1).map((_, i) => {
              const y1 = `${15 + i * 12.5}%`;
              const y2 = `${15 + (i + 1) * 12.5}%`;
              return (
                <line key={i} x1="20%" y1={y1} x2="80%" y2={y2} stroke="url(#line-grad)" strokeWidth="1" />
              );
            })}
          </svg>

          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3">
            {AGENT_DEFS.map((ag, i) => {
              const isActive = activeAgent.toLowerCase().includes(ag.name.toLowerCase());
              return (
                <motion.div
                  key={ag.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`relative p-4 rounded-2xl text-center flex flex-col items-center border transition-all duration-300 ${
                    isActive
                      ? `border-indigo-500/60 bg-gradient-to-br from-indigo-500/15 to-cyan-500/10 active-glow shadow-neon-glow`
                      : "border-borderSleek bg-slate-900/40"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ag.color} flex items-center justify-center mb-2 shadow-lg ${isActive ? "animate-pulse" : ""}`}>
                    <span className="text-white font-bold">{ag.name[0]}</span>
                  </div>
                  <h4 className="text-white font-bold text-sm">{ag.name} Agent</h4>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono leading-tight">{ag.desc}</p>
                  {isActive && (
                    <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-[8px] font-mono bg-indigo-500 text-white shadow-neon-soft animate-pulse">
                      ACTIVE
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
          <h4 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-indigo-400" />
            Active Node Reasoning Stream
          </h4>
          <div className="p-5 bg-slate-950/60 border border-borderSleek rounded-xl text-slate-100 font-mono text-sm leading-relaxed">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                {activeAgent.toUpperCase()} AGENT
              </span>
              <span className="text-[10px] text-slate-500">streaming...</span>
              <span className="ml-auto text-emerald-400 text-[10px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE</span>
              </span>
            </div>
            <p className="text-slate-200 italic">&quot;{activeThought}&quot;</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h4 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Error Log
          </h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto font-mono text-[11px]">
            {errors.length === 0 ? (
              <div className="text-slate-500 text-center py-6 text-xs">No errors. All agents nominal.</div>
            ) : (
              errors.map((e: string, i: number) => (
                <div key={i} className="p-2.5 rounded bg-rose-500/5 border border-rose-500/20 text-rose-300">
                  {e}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <h4 className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-indigo-400" />
          Session Status
        </h4>
        <div className="font-mono text-xs text-slate-300">
          <div className="text-slate-500">Current state: <span className="text-indigo-300">{sessionStatus}</span></div>
        </div>
      </div>
    </div>
  );
}

// ================== REPLAY ==================
function ReplayTab({ currentUrl, latestScreenshot, plan, currentStepIndex, sessionStatus }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="glass-panel rounded-2xl lg:col-span-2 overflow-hidden border border-borderSleek">
        <div className="bg-slate-900/80 px-4 py-3 border-b border-borderSleek flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex-1 bg-slate-950 border border-borderSleek rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="truncate">{currentUrl}</span>
          </div>
        </div>
        <div className="flex-1 min-h-[480px] bg-slate-950 flex items-center justify-center relative p-1">
          {latestScreenshot ? (
            <img
              src={`data:image/png;base64,${latestScreenshot}`}
              alt="live visualization"
              className="w-full h-full object-contain max-h-[500px] border border-slate-900 rounded-lg shadow-2xl"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-500 font-mono text-xs text-center py-24 select-none">
              <Globe className="w-16 h-16 text-slate-700 animate-pulse" />
              <div>
                <p>Browser frame offline.</p>
                <p className="text-[10px] text-slate-600 mt-1">Launch mission to trigger image synthesis streams.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-white font-semibold text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" />
            Execution Plan
          </h4>
          <span className="text-[10px] font-mono text-slate-500">Steps: {plan.length}</span>
        </div>
        <div className="space-y-2.5 overflow-y-auto max-h-[480px] pr-1">
          {plan.length === 0 ? (
            <div className="text-slate-500 font-mono text-xs text-center py-20">
              No plan synthesized yet.
            </div>
          ) : (
            plan.map((step: Step, idx: number) => {
              const isActive = idx === currentStepIndex;
              const isPast = idx < currentStepIndex || sessionStatus === "completed";
              return (
                <div
                  key={step.step_id}
                  className={`p-3 rounded-lg border transition-all ${
                    isActive
                      ? "border-indigo-500 bg-indigo-500/10 active-glow"
                      : isPast
                      ? "border-slate-800 bg-slate-900/30 text-slate-400"
                      : "border-borderSleek bg-slate-900/10 text-slate-500"
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="font-bold text-indigo-300">STEP #{step.step_id}</span>
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-800/80">{step.action}</span>
                  </div>
                  <p className="text-xs font-semibold mt-1.5 text-slate-200">{step.description}</p>
                  {step.selector && (
                    <div className="text-[9px] font-mono bg-slate-950/50 p-1.5 rounded mt-1 truncate">
                      <span className="text-slate-500">target:</span> {step.selector}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ================== MEMORY ==================
function MemoryTab({ memories, loading, onRefresh }: { memories: MemoryEntry[]; loading: boolean; onRefresh: () => void }) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Long-Term Memory Bank
          </h3>
          <p className="text-slate-400 text-xs mt-1">Learned web interface structures and pre-optimized selectors.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">PERSISTED</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{memories.length} entries</span>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="ml-2 p-1.5 rounded-md border border-borderSleek hover:border-indigo-500/40 text-slate-400 hover:text-white transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {memories.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Database className="w-12 h-12 mx-auto mb-3 text-slate-700" />
          <p className="text-sm">No memory entries yet.</p>
          <p className="text-xs mt-1 text-slate-600">Complete a mission to populate the memory bank.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-borderSleek text-slate-500 uppercase">
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Origin Goal</th>
                <th className="py-3 px-4 text-center">Steps</th>
                <th className="py-3 px-4">Indexed</th>
                <th className="py-3 px-4 text-right">Recall</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {memories.map((mem) => {
                const stepCount = typeof mem.successful_steps === "number"
                  ? mem.successful_steps
                  : Array.isArray(mem.successful_steps) ? mem.successful_steps.length : 0;
                return (
                  <tr key={mem.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-indigo-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      {mem.domain}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{mem.goal_query}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-100">{stepCount}</td>
                    <td className="py-3.5 px-4 text-slate-500">{new Date(mem.created_at).toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 ml-auto">
                        Recall <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ================== VAULT ==================
function VaultTab({ credentials, vaultDomain, setVaultDomain, vaultUser, setVaultUser, vaultPass, setVaultPass, handleAddCredential, handleDeleteCredential }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="glass-panel rounded-2xl p-6 hologram">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Index New Encrypted Account</h3>
        </div>

        <form onSubmit={handleAddCredential} className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-slate-500 block mb-1.5">Target Domain</label>
            <input
              type="text" required value={vaultDomain} onChange={(e) => setVaultDomain(e.target.value)}
              placeholder="e.g. linkedin.com"
              className="w-full bg-slate-950/80 border border-borderSleek focus:border-indigo-500 rounded-lg p-2.5 text-slate-200 outline-none"
            />
          </div>
          <div>
            <label className="text-slate-500 block mb-1.5">Username / Email</label>
            <input
              type="text" required value={vaultUser} onChange={(e) => setVaultUser(e.target.value)}
              placeholder="candidate@agentos.ai"
              className="w-full bg-slate-950/80 border border-borderSleek focus:border-indigo-500 rounded-lg p-2.5 text-slate-200 outline-none"
            />
          </div>
          <div>
            <label className="text-slate-500 block mb-1.5">Password</label>
            <input
              type="password" required value={vaultPass} onChange={(e) => setVaultPass(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950/80 border border-borderSleek focus:border-indigo-500 rounded-lg p-2.5 text-slate-200 outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold py-2.5 rounded-lg shadow-neon-soft transition flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            Encrypt & Index
          </button>
        </form>
      </div>

      <div className="glass-panel rounded-2xl p-6 md:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Vault-Secured Accounts
          </h3>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            AES-256 SYMMETRIC
          </span>
        </div>

        {credentials.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Lock className="w-10 h-10 mx-auto mb-3 text-slate-700" />
            <p className="text-sm">No credentials indexed.</p>
            <p className="text-xs mt-1 text-slate-600">Add a domain to encrypt & store with Fernet AES-256.</p>
          </div>
        ) : (
          <div className="overflow-x-auto font-mono text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-borderSleek text-slate-500">
                  <th className="py-2 px-2">Domain</th>
                  <th className="py-2 px-2">Identity (masked)</th>
                  <th className="py-2 px-2">Updated</th>
                  <th className="py-2 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {credentials.map((cred: Credential) => (
                  <tr key={cred.id} className="hover:bg-slate-900/30">
                    <td className="py-3 px-2 font-bold text-indigo-300">{cred.domain}</td>
                    <td className="py-3 px-2 text-slate-300">{cred.username_masked}</td>
                    <td className="py-3 px-2 text-slate-500 text-[10px]">{new Date(cred.updated_at).toLocaleString()}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDeleteCredential(cred.id)}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                        title="Delete credential"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ================== SETTINGS ==================
function SettingsTab({ keysOpenAI, setKeysOpenAI, keysNVIDIA, setKeysNVIDIA, defaultModel, setDefaultModel, isSimulation, setIsSimulation, handleSaveKeys, serverSettings }: any) {
  return (
    <div className="glass-panel rounded-2xl p-6 max-w-3xl">
      <h3 className="text-white font-semibold text-lg flex items-center gap-2 mb-2">
        <SettingsIcon className="w-5 h-5 text-indigo-400" />
        Platform Configuration
      </h3>
      <p className="text-slate-400 text-xs mb-6">Configure external API links, toggle model engines, and modify vault encryption keys.</p>

      {serverSettings && (
        <div className="mb-6 p-3 rounded-lg bg-slate-950/40 border border-borderSleek text-[11px] font-mono text-slate-400 flex flex-wrap gap-x-6 gap-y-1">
          <span>ENV: <span className="text-indigo-300">{serverSettings.environment}</span></span>
          <span>Model: <span className="text-cyan-300">{serverSettings.default_model}</span></span>
          <span>Mode: <span className="text-emerald-300">{serverSettings.is_simulation ? "Simulation" : "Live"}</span></span>
          <span>OpenAI: <span className="text-slate-300">{serverSettings.openai_api_key_masked || "(empty)"}</span></span>
          <span>NVIDIA: <span className="text-slate-300">{serverSettings.nvidia_api_key_masked || "(empty)"}</span></span>
        </div>
      )}

      <form onSubmit={handleSaveKeys} className="space-y-4 font-mono text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-500 block mb-1.5">OpenAI API Key</label>
            <input
              type="password" value={keysOpenAI} onChange={(e) => setKeysOpenAI(e.target.value)}
              placeholder="sk-or-proj-••••••••••••"
              className="w-full bg-slate-950/80 border border-borderSleek focus:border-indigo-500 rounded-lg p-2.5 text-slate-200 outline-none"
            />
          </div>
          <div>
            <label className="text-slate-500 block mb-1.5">NVIDIA NIM API Key</label>
            <input
              type="password" value={keysNVIDIA} onChange={(e) => setKeysNVIDIA(e.target.value)}
              placeholder="nvapi-••••••••••••"
              className="w-full bg-slate-950/80 border border-borderSleek focus:border-indigo-500 rounded-lg p-2.5 text-slate-200 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-slate-500 block mb-1.5">Default Multi-Agent Model Engine</label>
          <select
            value={defaultModel}
            onChange={(e) => setDefaultModel(e.target.value)}
            className="w-full bg-slate-950/80 border border-borderSleek focus:border-indigo-500 rounded-lg p-2.5 text-slate-200 outline-none"
          >
            <option value="gpt-4o">GPT-4o (OpenAI Vision Master)</option>
            <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</option>
            <option value="mixtral-8x22b">NVIDIA Mixtral NIM (8x22B)</option>
            <option value="llama-3-vision">Llama-3-Vision (Local)</option>
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-slate-300">
          <input
            type="checkbox"
            checked={isSimulation}
            onChange={(e) => setIsSimulation(e.target.checked)}
            className="rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-indigo-500 w-4 h-4"
          />
          <span>Use Simulation Mode (recommended unless you have API keys + a live browser target)</span>
        </label>

        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-lg leading-relaxed text-[11px] flex gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-bold mb-1">SECURE CONTEXT WARNING</h5>
            API keys are stored inside encrypted environment envelopes. They are not transmitted outwards. Empty keys trigger default AgentOS Simulator Mode.
          </div>
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold px-5 py-2.5 rounded-lg shadow-neon-soft transition"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
}
