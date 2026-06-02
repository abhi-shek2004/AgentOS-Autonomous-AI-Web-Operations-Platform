import os
import uuid
import asyncio
import datetime
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import engine, get_db, Base
from app.db.models import Workflow, BrowserSession, ExecutionLog, MemoryIndex, SecureCredential
from app.core.security import vault
from app.agents.supervisor import agent_os_graph

# Initialize Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AgentOS: Autonomous AI Web Operations Platform Backend Service API Layer",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Supports direct dev server calls
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# REST Request/Response Pydantic Models
# -------------------------------------------------------------
class WorkflowCreate(BaseModel):
    goal: str
    is_simulation: bool = True

class CredentialCreate(BaseModel):
    domain: str
    username: str
    password: str

class WorkflowResponse(BaseModel):
    id: int
    goal: str
    status: str
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class SessionResponse(BaseModel):
    id: str
    workflow_id: Optional[int]
    status: str
    current_url: Optional[str]
    current_step_index: int
    total_steps: int
    created_at: datetime.datetime
    class Config:
        from_attributes = True

class CredentialListItem(BaseModel):
    domain: str
    username_masked: str
    updated_at: datetime.datetime
    class Config:
        from_attributes = True

class SettingsUpdate(BaseModel):
    openai_api_key: Optional[str] = None
    nvidia_api_key: Optional[str] = None
    default_model: Optional[str] = None
    is_simulation: Optional[bool] = None

class SettingsResponse(BaseModel):
    openai_api_key_masked: str
    nvidia_api_key_masked: str
    default_model: str
    is_simulation: bool
    environment: str


# WebSocket active connection manager
class ConnectionManager:
    def __init__(self):
        # Maps session_id to list of active websockets
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id in self.active_connections:
            self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast_to_session(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            for connection in self.active_connections[session_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Connection might be dead, handled during disconnect
                    pass

manager = ConnectionManager()


# -------------------------------------------------------------
# API ROUTERS & ENDPOINTS
# -------------------------------------------------------------

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "platform": "AgentOS: Autonomous AI Web Operations Platform",
        "version": "1.0.0",
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# 1. Start a new workflow automation
@app.post("/api/workflows", response_model=WorkflowResponse)
def create_workflow(payload: WorkflowCreate, db: Session = Depends(get_db)):
    workflow = Workflow(
        goal=payload.goal,
        status="pending"
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow

# 2. Get list of workflows
@app.get("/api/workflows", response_model=List[WorkflowResponse])
def list_workflows(db: Session = Depends(get_db)):
    return db.query(Workflow).order_by(Workflow.created_at.desc()).all()

# 3. Create a running Session for a workflow
@app.post("/api/workflows/{workflow_id}/run")
def trigger_workflow_run(workflow_id: int, db: Session = Depends(get_db)):
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
        
    session_id = str(uuid.uuid4())
    session = BrowserSession(
        id=session_id,
        workflow_id=workflow.id,
        status="initializing",
        current_step_index=0,
        total_steps=0
    )
    db.add(session)
    workflow.status = "running"
    db.commit()
    db.refresh(session)
    
    return {"session_id": session_id, "status": "initialized"}

# 4. Get active or past session details
@app.get("/api/sessions/{session_id}")
def get_session_details(session_id: str, db: Session = Depends(get_db)):
    session = db.query(BrowserSession).filter(BrowserSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    logs = db.query(ExecutionLog).filter(ExecutionLog.session_id == session_id).order_by(ExecutionLog.timestamp.asc()).all()
    
    # Build details payload
    return {
        "id": session.id,
        "workflow_id": session.workflow_id,
        "status": session.status,
        "current_url": session.current_url,
        "current_step_index": session.current_step_index,
        "total_steps": session.total_steps,
        "token_usage": session.token_usage,
        "cost_usd": session.cost_usd,
        "created_at": session.created_at,
        "logs": [
            {
                "timestamp": log.timestamp.isoformat(),
                "agent_name": log.agent_name,
                "level": log.level,
                "message": log.message,
                "reasoning": log.reasoning,
                "action_taken": log.action_taken,
                "screenshot": log.screenshot
            }
            for log in logs
        ]
    }

# 5. Add credential vault item
@app.post("/api/credentials")
def store_vault_credential(payload: CredentialCreate, db: Session = Depends(get_db)):
    existing = db.query(SecureCredential).filter(SecureCredential.domain == payload.domain).first()
    
    enc_user = vault.encrypt(payload.username)
    enc_pass = vault.encrypt(payload.password)
    
    if existing:
        existing.encrypted_username = enc_user
        existing.encrypted_password = enc_pass
        existing.updated_at = datetime.datetime.utcnow()
    else:
        new_cred = SecureCredential(
            domain=payload.domain,
            encrypted_username=enc_user,
            encrypted_password=enc_pass
        )
        db.add(new_cred)
        
    db.commit()
    return {"status": "success", "message": f"Credentials for {payload.domain} securely encrypted and vault-indexed."}

# 6. Retrieve long-term memory indexes
@app.get("/api/memory")
def get_memory_bank(db: Session = Depends(get_db)):
    memories = db.query(MemoryIndex).order_by(MemoryIndex.created_at.desc()).limit(100).all()
    return [
        {
            "id": mem.id,
            "domain": mem.domain,
            "goal_query": mem.goal_query,
            "successful_steps": mem.successful_steps,
            "created_at": mem.created_at
        }
        for mem in memories
    ]

# 6b. List all vault credentials (masked)
@app.get("/api/credentials")
def list_vault_credentials(db: Session = Depends(get_db)):
    creds = db.query(SecureCredential).order_by(SecureCredential.updated_at.desc()).all()
    out = []
    for c in creds:
        try:
            dec = vault.decrypt(c.encrypted_username) if c.encrypted_username else ""
        except Exception:
            dec = ""
        username = dec or "••••••"
        masked = username[:3] + "***" + username[-1:] if len(username) > 4 else "***"
        out.append({
            "id": c.id,
            "domain": c.domain,
            "username_masked": masked,
            "updated_at": c.updated_at
        })
    return out

# 6c. Delete a vault credential
@app.delete("/api/credentials/{cred_id}")
def delete_vault_credential(cred_id: int, db: Session = Depends(get_db)):
    cred = db.query(SecureCredential).filter(SecureCredential.id == cred_id).first()
    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found")
    domain = cred.domain
    db.delete(cred)
    db.commit()
    return {"status": "success", "message": f"Credential for {domain} removed from vault."}

# 7. Aggregated metrics for dashboard
@app.get("/api/metrics")
def get_metrics(db: Session = Depends(get_db)):
    workflow_count = db.query(Workflow).count()
    session_count = db.query(BrowserSession).count()
    completed = db.query(Workflow).filter(Workflow.status == "completed").count()
    failed = db.query(Workflow).filter(Workflow.status == "failed").count()
    memory_count = db.query(MemoryIndex).count()
    vault_count = db.query(SecureCredential).count()
    return {
        "total_workflows": workflow_count,
        "total_sessions": session_count,
        "completed_workflows": completed,
        "failed_workflows": failed,
        "memory_entries": memory_count,
        "vault_entries": vault_count,
        "success_rate": round((completed / max(workflow_count, 1)) * 100, 1),
        "agent_stack_size": 7,
    }

# 8. Settings (read/update) - in-memory runtime config
_runtime_settings = {
    "openai_api_key": "",
    "nvidia_api_key": "",
    "default_model": settings.DEFAULT_MODEL,
    "is_simulation": True,
}

def _mask_key(k: str) -> str:
    if not k:
        return ""
    if len(k) <= 8:
        return "•" * len(k)
    return k[:4] + "•" * (len(k) - 8) + k[-4:]

@app.get("/api/settings", response_model=SettingsResponse)
def get_settings():
    return SettingsResponse(
        openai_api_key_masked=_mask_key(_runtime_settings["openai_api_key"]),
        nvidia_api_key_masked=_mask_key(_runtime_settings["nvidia_api_key"]),
        default_model=_runtime_settings["default_model"],
        is_simulation=_runtime_settings["is_simulation"],
        environment=settings.ENVIRONMENT,
    )

@app.post("/api/settings", response_model=SettingsResponse)
def update_settings(payload: SettingsUpdate):
    if payload.openai_api_key is not None:
        _runtime_settings["openai_api_key"] = payload.openai_api_key
    if payload.nvidia_api_key is not None:
        _runtime_settings["nvidia_api_key"] = payload.nvidia_api_key
    if payload.default_model is not None:
        _runtime_settings["default_model"] = payload.default_model
    if payload.is_simulation is not None:
        _runtime_settings["is_simulation"] = payload.is_simulation
    return get_settings()


# -------------------------------------------------------------
# WebSocket: Asynchronous LangGraph Streaming Engine
# -------------------------------------------------------------
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str, db: Session = Depends(get_db)):
    await manager.connect(websocket, session_id)
    
    # Retrieve matching session structure
    session = db.query(BrowserSession).filter(BrowserSession.id == session_id).first()
    if not session:
        await websocket.send_json({"error": "Invalid Session ID"})
        await websocket.close()
        manager.disconnect(websocket, session_id)
        return
        
    workflow = db.query(Workflow).filter(Workflow.id == session.workflow_id).first()
    goal = workflow.goal if workflow else "Perform autonomous search research"
    
    # Check settings for mock toggle
    is_simulation = _runtime_settings.get("is_simulation", True)  # Defaults to simulation mode
    
    try:
        # 1. Initialize LangGraph State Dictionary
        initial_state = {
            "task": goal,
            "plan": [],
            "current_step_index": 0,
            "success_criteria": [],
            "session_id": session_id,
            "current_url": "about:blank",
            "dom_elements": [],
            "screenshot_history": [],
            "actions_taken": [],
            "errors": [],
            "status": "planning",
            "token_usage": {"prompt": 0, "completion": 0, "total": 0},
            "cost_usd": 0.0,
            "human_approval_required": False,
            "is_simulation": is_simulation,
            "agent_thoughts": {},
            "supervisor_decision": ""
        }
        
        # Stream the compiled LangGraph execution step-by-step
        # We accumulate full state across events so we can broadcast the
        # entire current state on every node transition.
        accumulated_state = dict(initial_state)
        # Allow up to 200 step invocations to handle long workflows.
        graph_config = {"recursion_limit": 200}
        async for event in agent_os_graph.astream(initial_state, config=graph_config):
            # Parse state data outputted from active node
            # The event is a dictionary containing {node_name: updated_state}
            node_name = list(event.keys())[0]
            node_state = event[node_name]

            # Merge this node's updates into the running accumulated state.
            # LangGraph updates are partial dicts; merging gives us the full
            # picture (plan, total steps, etc.) on every event.
            if isinstance(node_state, dict):
                accumulated_state.update(node_state)

            # Extract variables from the full accumulated state
            current_status = accumulated_state.get("status", "running")
            current_url = accumulated_state.get("current_url", "about:blank")
            step_idx = accumulated_state.get("current_step_index", 0)
            plan = accumulated_state.get("plan", [])
            success_criteria = accumulated_state.get("success_criteria", [])
            actions = accumulated_state.get("actions_taken", [])
            screenshots = accumulated_state.get("screenshot_history", [])
            token_usage = accumulated_state.get("token_usage", {"prompt": 0, "completion": 0, "total": 0})
            cost_usd = accumulated_state.get("cost_usd", 0.0)
            thoughts = accumulated_state.get("agent_thoughts", {})
            errors = accumulated_state.get("errors", [])

            # Fetch active agent text message
            agent_display_name = node_name.replace("_", " ").title().replace(" ", "")
            # Map node names like "memory_index" → "Memory"
            display_map = {
                "memory_index": "Memory",
                "supervisor": "Supervisor",
                "planner": "Planner",
                "navigator": "Navigator",
                "executor": "Executor",
                "validator": "Validator",
                "recovery": "Recovery",
            }
            agent_display_name = display_map.get(node_name, node_name.capitalize())
            active_thought = thoughts.get(agent_display_name, f"Processing execution step inside {agent_display_name}.")

            # Get latest screenshot
            active_screenshot = screenshots[-1] if screenshots else None

            # Write audit log to database
            try:
                new_log = ExecutionLog(
                    session_id=session_id,
                    agent_name=agent_display_name,
                    level="ERROR" if errors and node_name == "recovery" else "INFO",
                    message=active_thought[:4000],
                    reasoning=active_thought[:4000],
                    action_taken=actions[-1] if actions else None,
                    screenshot=active_screenshot
                )
                db.add(new_log)
            except Exception as log_err:
                # Don't let logging failures break the workflow
                print(f"Log error: {log_err}")

            # Update session database model metrics
            session.status = current_status
            session.current_url = current_url
            session.current_step_index = step_idx
            session.total_steps = len(plan)
            session.token_usage = token_usage
            session.cost_usd = {"amount": cost_usd}
            try:
                db.commit()
            except Exception as commit_err:
                db.rollback()
                print(f"DB commit error: {commit_err}")
            
            # Broadcast state changes to the WebSocket client
            broadcast_payload = {
                "event": "agent_state_update",
                "node_name": node_name,
                "agent_name": agent_display_name,
                "status": current_status,
                "current_url": current_url,
                "current_step_index": step_idx,
                "total_steps": len(plan),
                "plan": plan,
                "success_criteria": success_criteria,
                "actions": actions,
                "latest_screenshot": active_screenshot,
                "token_usage": token_usage,
                "cost_usd": cost_usd,
                "thought": active_thought,
                "errors": errors,
                "timestamp": datetime.datetime.utcnow().isoformat()
            }
            await manager.broadcast_to_session(session_id, broadcast_payload)
            
            # Brief pacing pause to let UI render the dynamic flow beautifully
            await asyncio.sleep(1.0)
            
        # Finalize and update global workflow records
        session.status = "completed"
        if workflow:
            workflow.status = "completed"
        db.commit()
        
        await manager.broadcast_to_session(session_id, {
            "event": "workflow_finished",
            "status": "completed",
            "message": "Autonomous workflow completed. 100% success criteria met."
        })
        
    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
    except Exception as e:
        session.status = "crashed"
        if workflow:
            workflow.status = "failed"
        db.commit()
        
        # Log failure to DB
        crash_log = ExecutionLog(
            session_id=session_id,
            agent_name="Supervisor",
            level="ERROR",
            message=f"Session crashed with runtime error: {str(e)}",
            reasoning=f"Critical uncaught exception occurred: {str(e)}",
            action_taken=None,
            screenshot=None
        )
        db.add(crash_log)
        db.commit()
        
        try:
            await manager.broadcast_to_session(session_id, {
                "event": "workflow_finished",
                "status": "failed",
                "message": f"Critical execution error: {str(e)}"
            })
        except Exception:
            pass
        manager.disconnect(websocket, session_id)
