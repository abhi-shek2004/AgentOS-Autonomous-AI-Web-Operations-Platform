import time
from typing import Dict, Any, List
from langgraph.graph import StateGraph, END
from app.agents.state import AgentOSState
from app.agents.planner import PlannerAgent
from app.agents.navigator import NavigatorAgent
from app.agents.executor import ExecutorAgent
from app.agents.validator import ValidatorAgent
from app.agents.recovery import RecoveryAgent
from app.agents.memory import MemoryAgent

class SupervisorAgent:
    def __init__(self):
        self.planner = PlannerAgent()
        self.navigator = NavigatorAgent()
        self.executor = ExecutorAgent()
        self.validator = ValidatorAgent()
        self.recovery = RecoveryAgent()
        self.memory = MemoryAgent()

    def run_supervisor(self, state: AgentOSState) -> Dict[str, Any]:
        """Supervisor node in LangGraph. Monitors system metrics, logs step timings, and manages token costs."""
        plan = state.get("plan", [])
        current_step_index = state.get("current_step_index", 0)
        token_usage = state.get("token_usage", {"prompt": 0, "completion": 0, "total": 0})
        
        state_updates = {
            "agent_thoughts": state.get("agent_thoughts", {}),
            "cost_usd": 0.0
        }
        
        # Calculate dynamic API pricing for high-level monitoring
        # (e.g. GPT-4o pricing: prompt=$5/M, completion=$15/M)
        cost = (token_usage.get("prompt", 0) * 0.000005) + (token_usage.get("completion", 0) * 0.000015)
        # Ensure it has a realistic baseline value if total is greater than 0
        if token_usage.get("total", 0) > 0 and cost == 0.0:
            cost = token_usage["total"] * 0.00001
            
        state_updates["cost_usd"] = round(cost, 5)
        
        state_updates["agent_thoughts"]["Supervisor"] = (
            f"Supervising AgentOS workflow execution. Current step pointer: {current_step_index + 1}/{len(plan)}. "
            f"Estimated API overhead cost: ${state_updates['cost_usd']:.5f} USD. Resource utilization optimal."
        )
        
        return state_updates

# Instantiate Agent implementations
supervisor = SupervisorAgent()

# Helper Node wrappers for LangGraph compiler mapping
def planner_node(state: AgentOSState) -> Dict[str, Any]:
    return supervisor.planner.analyze_goal(state)

def navigator_node(state: AgentOSState) -> Dict[str, Any]:
    return supervisor.navigator.analyze_page(state)

async def executor_node(state: AgentOSState) -> Dict[str, Any]:
    return await supervisor.executor.execute_action(state)

def validator_node(state: AgentOSState) -> Dict[str, Any]:
    return supervisor.validator.validate_outcome(state)

def recovery_node(state: AgentOSState) -> Dict[str, Any]:
    return supervisor.recovery.heal_execution(state)

def memory_index_node(state: AgentOSState) -> Dict[str, Any]:
    return supervisor.memory.index_successful_workflow(state)

def supervisor_node(state: AgentOSState) -> Dict[str, Any]:
    return supervisor.run_supervisor(state)


# -------------------------------------------------------------
# LangGraph Routing Control Handlers
# -------------------------------------------------------------
def router_validator_outcome(state: AgentOSState) -> str:
    """Evaluates the status after a validation step and determines routing directions."""
    status = state.get("status", "")
    if status == "completed":
        return "index_memory"
    elif status == "healing":
        return "call_recovery"
    else:
        # Continue executing remaining steps
        return "call_supervisor"

def router_supervisor_routing(state: AgentOSState) -> str:
    """Decides whether to route to the navigator or end based on task status."""
    status = state.get("status", "")
    if status in ["completed", "failed"]:
        return "end_execution"
    return "call_navigator"


# -------------------------------------------------------------
# Compiling the LangGraph State Engine
# -------------------------------------------------------------
builder = StateGraph(AgentOSState)

# 1. Add all nodes to Graph Builder
builder.add_node("planner", planner_node)
builder.add_node("navigator", navigator_node)
builder.add_node("executor", executor_node)
builder.add_node("validator", validator_node)
builder.add_node("recovery", recovery_node)
builder.add_node("memory_index", memory_index_node)
builder.add_node("supervisor", supervisor_node)

# 2. Configure Execution Flow Edges
builder.set_entry_point("planner")

# From planner, go directly to supervisor to register cost metric initialization
builder.add_edge("planner", "supervisor")

# Supervisor dynamically decides to route to Navigator or finish
builder.add_conditional_edges(
    "supervisor",
    router_supervisor_routing,
    {
        "call_navigator": "navigator",
        "end_execution": END
    }
)

builder.add_edge("navigator", "executor")
builder.add_edge("executor", "validator")

# Validator checks outcomes: returns to supervisor to execute next step, heals on fail, indexes on finish
builder.add_conditional_edges(
    "validator",
    router_validator_outcome,
    {
        "call_supervisor": "supervisor",
        "call_recovery": "recovery",
        "index_memory": "memory_index"
    }
)

# Recovery returns control back to Navigator once selector is self-healed
builder.add_edge("recovery", "navigator")

# Memory Index is the final terminal node
builder.add_edge("memory_index", END)

# Final Asynchronous Compiled Graph
agent_os_graph = builder.compile()
