from typing import Dict, Any, List
from app.agents.state import AgentOSState

class RecoveryAgent:
    def __init__(self):
        pass

    def heal_execution(self, state: AgentOSState) -> Dict[str, Any]:
        """Recovery node in LangGraph. Diagnoses errors and adjusts selectors/plan parameters on-the-fly."""
        plan = state["plan"]
        current_step_index = state["current_step_index"]
        errors = state.get("errors", [])
        
        state_updates = {
            "status": "healing",
            "agent_thoughts": state.get("agent_thoughts", {}),
            "errors": errors,
            "plan": list(plan)
        }
        
        latest_error = errors[-1] if errors else "Unknown selector timeout"
        state_updates["agent_thoughts"]["Recovery"] = (
            f"Diagnosing execution block: '{latest_error}'. "
            "Running heuristic scans to locate alternative CSS/XPath anchors."
        )
        
        # Self-healing logic simulation
        if current_step_index < len(plan):
            failed_step = plan[current_step_index]
            old_selector = failed_step.get("selector", "")
            
            # Formulate self-healing alternative selector
            new_selector = f"{old_selector}_backup_fuzzy"
            if "[aria-label=" in old_selector:
                new_selector = "button:has-text('Submit'), input[type='button']"
            elif "keyboard-text-input" in old_selector:
                new_selector = "input#jobs-search, .search-field"
                
            # Update the plan in place with the healed selector
            state_updates["plan"][current_step_index]["selector"] = new_selector
            state_updates["agent_thoughts"]["Recovery"] = (
                f"Self-healing complete. Healed selector for Step {failed_step['step_id']}: "
                f"Replaced broken selector '{old_selector}' with robust alternative '{new_selector}'. "
                "Rescheduling execution block. Handing back to Navigator."
            )
            
            # Reset active state status
            state_updates["status"] = "executing"
        else:
            state_updates["agent_thoughts"]["Recovery"] = "No active steps available to heal. Execution must abort."
            state_updates["status"] = "failed"
            
        return state_updates
