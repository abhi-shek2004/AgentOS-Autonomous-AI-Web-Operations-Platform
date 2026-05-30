import json
from typing import Dict, Any, List
from app.agents.state import AgentOSState
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.config import settings

class PlannerAgent:
    def __init__(self):
        self.model_name = settings.DEFAULT_MODEL
        self.api_key = settings.OPENAI_API_KEY or settings.NVIDIA_API_KEY
        
    def analyze_goal(self, state: AgentOSState) -> Dict[str, Any]:
        """Planner node inside LangGraph. Computes workflow plan & validation metrics."""
        task = state["task"]
        is_simulation = state.get("is_simulation", True)
        
        # Initialize token tracker
        state_updates = {
            "status": "planning",
            "agent_thoughts": state.get("agent_thoughts", {}),
            "plan": [],
            "success_criteria": [],
            "token_usage": state.get("token_usage", {"prompt": 0, "completion": 0, "total": 0})
        }
        
        state_updates["agent_thoughts"]["Planner"] = f"Analyzing goal: '{task}'. Conducting Tree-of-Thought decomposition to formulate strategic interaction plan."
        
        if is_simulation or not self.api_key:
            # High-fidelity Simulation Engine for recruiters to test instantly
            plan, criteria = self._generate_simulated_plan(task)
            state_updates["plan"] = plan
            state_updates["success_criteria"] = criteria
            state_updates["token_usage"]["total"] += 350 # simulated token counts
        else:
            # Live Mode LLM-based Planning
            try:
                plan, criteria = self._generate_live_plan(task)
                state_updates["plan"] = plan
                state_updates["success_criteria"] = criteria
            except Exception as e:
                # Dynamic fallback on API failures to maintain system resilience
                plan, criteria = self._generate_simulated_plan(task)
                state_updates["plan"] = plan
                state_updates["success_criteria"] = criteria
                state_updates["errors"] = state.get("errors", []) + [f"LLM Planning failed, fallback active. Error: {str(e)}"]

        state_updates["agent_thoughts"]["Planner"] = f"Plan successfully constructed. Formulated {len(state_updates['plan'])} granular interactive steps with {len(state_updates['success_criteria'])} validation criteria."
        return state_updates

    def _generate_live_plan(self, task: str) -> tuple[List[Dict[str, Any]], List[str]]:
        """Invokes OpenAI GPT models for live zero-shot plan generation."""
        llm = ChatOpenAI(temperature=0, openai_api_key=self.api_key, model=self.model_name)
        
        system_prompt = (
            "You are the Planner Agent of AgentOS, a highly advanced autonomous browser platform.\n"
            "Decompose the user goal into a list of structured steps and define criteria to verify completion.\n"
            "Respond ONLY with a JSON object containing keys: 'plan' (list of steps) and 'success_criteria' (list of assertions).\n"
            "Each step in the plan must have:\n"
            "  - 'step_id' (int)\n"
            "  - 'description' (str)\n"
            "  - 'action' (str: navigate, click, type, scroll, select, scrape, upload)\n"
            "  - 'selector' (str: descriptive target locator e.g. input[type=email])\n"
            "  - 'value' (str: text to enter or details, optional)\n"
            "Do not return markdown, just raw JSON."
        )
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"User Goal: {task}")
        ]
        
        response = llm.invoke(messages)
        res_json = json.loads(response.content.strip().replace("```json", "").replace("```", ""))
        return res_json.get("plan", []), res_json.get("success_criteria", [])

    def _generate_simulated_plan(self, task: str) -> tuple[List[Dict[str, Any]], List[str]]:
        """Constructs rich dynamic mock plans for typical automation goals."""
        task_lower = task.lower()
        
        if "linkedin" in task_lower or "job" in task_lower:
            plan = [
                {"step_id": 1, "description": "Navigate to LinkedIn jobs page", "action": "navigate", "selector": "https://www.linkedin.com/jobs", "value": ""},
                {"step_id": 2, "description": "Input 'Software Engineer' in search box", "action": "type", "selector": "input.jobs-search-box__keyboard-text-input[aria-label='Search jobs']", "value": "Software Engineer"},
                {"step_id": 3, "description": "Click 'Search' button", "action": "click", "selector": "button.jobs-search-box__submit-button", "value": ""},
                {"step_id": 4, "description": "Apply filters (Past 24 hours, Remote)", "action": "click", "selector": "button[aria-label='Filter by Date Posted: Past 24 hours']", "value": ""},
                {"step_id": 5, "description": "Select the first matching job entry", "action": "click", "selector": "li.jobs-search-results__list-item:nth-child(1)", "value": ""},
                {"step_id": 6, "description": "Extract job requirements, description, and compensation details", "action": "scrape", "selector": "div.jobs-description__container", "value": "description"}
            ]
            criteria = [
                "LinkedIn jobs page is loaded",
                "Jobs matching 'Software Engineer' are retrieved",
                "Remote filters are active",
                "Details are parsed and extracted"
            ]
        elif "stripe" in task_lower or "competit" in task_lower or "braintree" in task_lower:
            plan = [
                {"step_id": 1, "description": "Navigate to Stripe documentation page", "action": "navigate", "selector": "https://stripe.com/docs", "value": ""},
                {"step_id": 2, "description": "Locate search button and type 'pricing plans'", "action": "type", "selector": "input[type='search']", "value": "pricing"},
                {"step_id": 3, "description": "Scrape pricing details and transaction fees", "action": "scrape", "selector": "table.pricing-grid", "value": "pricing_metrics"},
                {"step_id": 4, "description": "Navigate to Braintree payments pricing page", "action": "navigate", "selector": "https://www.braintreedayments.com/pricing", "value": ""},
                {"step_id": 5, "description": "Extract Braintree rates for comparison", "action": "scrape", "selector": "div.pricing-rate-card", "value": "braintree_metrics"}
            ]
            criteria = [
                "Stripe fees extracted",
                "Braintree fees extracted",
                "Comparison data compiles without gaps"
            ]
        else:
            # Generic smart planner fallback
            plan = [
                {"step_id": 1, "description": "Open search engine homepage", "action": "navigate", "selector": "https://www.google.com", "value": ""},
                {"step_id": 2, "description": f"Search for: '{task}'", "action": "type", "selector": "textarea[name='q']", "value": task},
                {"step_id": 3, "description": "Submit search query", "action": "click", "selector": "input[name='btnK']", "value": ""},
                {"step_id": 4, "description": "Scrape first page of search results", "action": "scrape", "selector": "div#search", "value": "results"}
            ]
            criteria = [
                "Search engine loaded",
                f"Results page matching '{task}' is rendered",
                "Knowledge details parsed"
            ]
            
        return plan, criteria
