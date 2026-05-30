from typing import Dict, List, Any, TypedDict, Optional

class AgentOSState(TypedDict):
    # Core Task & Plan Info
    task: str                          # Original user natural language goal
    plan: List[Dict[str, Any]]         # Plan steps: [{'step_id': 1, 'description': '...', 'status': 'pending', 'action': '...', 'selector': '...', 'value': '...'}]
    current_step_index: int            # Currently executing step (0-indexed)
    success_criteria: List[str]        # List of criteria verifying goal completion
    
    # Session State
    session_id: str                    # Unique session UUID
    current_url: str                   # Active browser URL
    dom_elements: List[Dict[str, Any]] # Extracted visible DOM elements
    screenshot_history: List[str]      # Base64-encoded screenshots for playback
    actions_taken: List[Dict[str, Any]]# Record of execution steps completed
    errors: List[str]                  # Error history/logs for recovery
    
    # System Status & Variables
    status: str                        # "planning", "navigating", "executing", "validating", "healing", "completed", "failed"
    token_usage: Dict[str, int]        # Dynamic API cost tracking
    cost_usd: float                    # Calculated dollar values
    human_approval_required: bool      # Lock for Semi-Autonomous mode
    is_simulation: bool                # Toggle between live playwright and mock simulation
    
    # Diagnostic Reasoning
    supervisor_decision: str           # Next routing decision made by supervisor
    agent_thoughts: Dict[str, str]     # Real-time messages representing what each agent is thinking
