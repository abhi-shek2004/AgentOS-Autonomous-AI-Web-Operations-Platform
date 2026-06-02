// Centralized API client for AgentOS
// Reads NEXT_PUBLIC_API_URL and NEXT_PUBLIC_WS_URL at build/runtime.
// Falls back to localhost defaults so the UI works out of the box.

const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
  "http://localhost:8000";

const WS_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WS_URL) ||
  "ws://localhost:8000";

export const API = {
  base: API_BASE,
  wsBase: WS_BASE,
};

export interface Workflow {
  id: number;
  goal: string;
  status: string;
  created_at: string;
}

export interface WorkflowCreatePayload {
  goal: string;
  is_simulation: boolean;
}

export interface MemoryEntry {
  id: number;
  domain: string;
  goal_query: string;
  successful_steps: number | any[];
  created_at: string;
}

export interface Credential {
  id: number;
  domain: string;
  username_masked: string;
  updated_at: string;
}

export interface Metrics {
  total_workflows: number;
  total_sessions: number;
  completed_workflows: number;
  failed_workflows: number;
  memory_entries: number;
  vault_entries: number;
  success_rate: number;
  agent_stack_size: number;
}

export interface Settings {
  openai_api_key_masked: string;
  nvidia_api_key_masked: string;
  default_model: string;
  is_simulation: boolean;
  environment: string;
}

export interface SettingsUpdate {
  openai_api_key?: string;
  nvidia_api_key?: string;
  default_model?: string;
  is_simulation?: boolean;
}

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch {}
    throw new Error(`API ${res.status}: ${detail}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  // Workflows
  listWorkflows: () => http<Workflow[]>(`/api/workflows`),
  createWorkflow: (payload: WorkflowCreatePayload) =>
    http<Workflow>(`/api/workflows`, { method: "POST", body: JSON.stringify(payload) }),
  runWorkflow: (id: number) =>
    http<{ session_id: string; status: string }>(`/api/workflows/${id}/run`, { method: "POST" }),
  getSession: (sessionId: string) => http<any>(`/api/sessions/${sessionId}`),

  // Memory
  listMemory: () => http<MemoryEntry[]>(`/api/memory`),

  // Credentials
  listCredentials: () => http<Credential[]>(`/api/credentials`),
  addCredential: (payload: { domain: string; username: string; password: string }) =>
    http<{ status: string; message: string }>(`/api/credentials`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteCredential: (id: number) =>
    http<{ status: string; message: string }>(`/api/credentials/${id}`, { method: "DELETE" }),

  // Metrics
  getMetrics: () => http<Metrics>(`/api/metrics`),

  // Settings
  getSettings: () => http<Settings>(`/api/settings`),
  updateSettings: (payload: SettingsUpdate) =>
    http<Settings>(`/api/settings`, { method: "POST", body: JSON.stringify(payload) }),

  // Health
  health: () => http<{ status: string; platform: string; version: string }>(`/`),

  // WebSocket
  openWorkflowSocket: (sessionId: string): WebSocket =>
    new WebSocket(`${WS_BASE}/ws/${sessionId}`),
};
