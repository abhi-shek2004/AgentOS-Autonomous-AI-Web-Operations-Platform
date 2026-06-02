import io
import base64
import time
from typing import Dict, Any, List
from PIL import Image, ImageDraw, ImageFont
from app.agents.state import AgentOSState
from app.core.config import settings

class ExecutorAgent:
    def __init__(self):
        # Playwright instances are launched on-demand to maintain isolated clean scopes in live runs.
        pass

    async def execute_action(self, state: AgentOSState) -> Dict[str, Any]:
        """Executor node in LangGraph. Runs playwright browser operations or PIL-based visual dashboard simulations."""
        plan = state["plan"]
        current_step_index = state["current_step_index"]
        is_simulation = state.get("is_simulation", True)
        
        state_updates = {
            "status": "executing",
            "agent_thoughts": state.get("agent_thoughts", {}),
            "screenshot_history": state.get("screenshot_history", []),
            "actions_taken": state.get("actions_taken", []),
            "errors": state.get("errors", [])
        }
        
        if current_step_index >= len(plan):
            state_updates["agent_thoughts"]["Executor"] = "Sequence complete. Handing control to Validator."
            return state_updates
            
        current_step = plan[current_step_index]
        description = current_step.get("description", "")
        action = current_step.get("action", "")
        selector = current_step.get("selector", "")
        value = current_step.get("value", "")
        
        state_updates["agent_thoughts"]["Executor"] = f"Executing: {description} [Action: {action}, Selector: {selector}]"
        
        if is_simulation:
            # Dynamically synthesize a beautiful mock webpage image
            mock_url = selector if action == "navigate" else state.get("current_url", "https://agentos.ai")
            if action == "navigate":
                state_updates["current_url"] = selector
                mock_url = selector

            # Brief async wait to simulate network latency (non-blocking)
            import asyncio as _aio
            await _aio.sleep(0.4)

            # Generate the mock image
            screenshot_b64 = self._draw_beautiful_browser_mockup(
                url=mock_url,
                step_idx=current_step_index + 1,
                action_desc=description,
                step_action=action,
                selector_target=selector,
                input_value=value
            )
            
            state_updates["screenshot_history"] = state_updates["screenshot_history"] + [screenshot_b64]
            state_updates["actions_taken"] = state_updates["actions_taken"] + [{
                "step_id": current_step["step_id"],
                "description": description,
                "action": action,
                "selector": selector,
                "value": value,
                "status": "success",
                "timestamp": time.time()
            }]
            
            state_updates["agent_thoughts"]["Executor"] = f"Interactive action completed successfully. Screenshot captured. Action logged."
            
        else:
            # LIVE MODE: Playwright implementation
            # For recruiters testing live browser workflows (Playwright)
            try:
                from playwright.async_api import async_playwright
                screenshot_b64, final_url = await self._run_live_playwright_action(
                    action, selector, value, state.get("current_url", "")
                )
                state_updates["current_url"] = final_url
                state_updates["screenshot_history"] = state_updates["screenshot_history"] + [screenshot_b64]
                state_updates["actions_taken"] = state_updates["actions_taken"] + [{
                    "step_id": current_step["step_id"],
                    "description": description,
                    "action": action,
                    "selector": selector,
                    "value": value,
                    "status": "success",
                    "timestamp": time.time()
                }]
                state_updates["agent_thoughts"]["Executor"] = f"Live action '{action}' on locator '{selector}' succeeded."
            except Exception as e:
                state_updates["errors"] = state_updates["errors"] + [f"Playwright step {current_step['step_id']} failed: {str(e)}"]
                state_updates["agent_thoughts"]["Executor"] = f"Execution failed: {str(e)}. Handover to Recovery Agent triggered."
                state_updates["status"] = "healing"
                
        return state_updates

    async def _run_live_playwright_action(self, action: str, selector: str, value: str, current_url: str) -> tuple[str, str]:
        """Runs the actual Playwright automated session in a clean sandbox context."""
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            # Launch chromium sandbox
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1280, "height": 800})
            page = await context.new_page()
            
            # Restore current url state
            if current_url:
                await page.goto(current_url, wait_until="load", timeout=15000)
                
            final_url = current_url
            if action == "navigate":
                await page.goto(selector, wait_until="load", timeout=20000)
                final_url = selector
            elif action == "click":
                await page.wait_for_selector(selector, timeout=8000)
                await page.click(selector)
                final_url = page.url
            elif action == "type":
                await page.wait_for_selector(selector, timeout=8000)
                await page.fill(selector, value)
                final_url = page.url
            elif action == "scroll":
                await page.evaluate("window.scrollBy(0, 400)")
                final_url = page.url
            
            # Take visual snapshot
            screenshot_bytes = await page.screenshot(type="png")
            screenshot_b64 = base64.b64encode(screenshot_bytes).decode()
            
            await browser.close()
            return screenshot_b64, final_url

    def _draw_beautiful_browser_mockup(self, url: str, step_idx: int, action_desc: str, step_action: str, selector_target: str, input_value: str) -> str:
        """Synthesizes high-fidelity, fully responsive browser screenshots using PIL."""
        # 1. Create a 1200x800 base canvas with an ultra-sleek dark background
        img = Image.new("RGB", (1200, 800), color="#0F172A") # slate-900
        draw = ImageDraw.Draw(img)
        
        # 2. Draw standard macOS Chrome top header
        draw.rectangle([(0, 0), (1200, 75)], fill="#1E293B") # slate-800
        # Red, Yellow, Green mock window dots
        draw.ellipse([(15, 30), (27, 42)], fill="#EF4444")
        draw.ellipse([(35, 30), (47, 42)], fill="#F59E0B")
        draw.ellipse([(55, 30), (67, 42)], fill="#10B981")
        
        # 3. URL Bar
        draw.rounded_rectangle([(100, 20), (1100, 55)], radius=6, fill="#0F172A")
        # SSL Lock icon (green dot)
        draw.ellipse([(115, 34), (123, 42)], fill="#10B981")
        
        # Draw URL Text (using default font as backup)
        draw.text((135, 30), url, fill="#94A3B8")
        
        # 4. Canvas Content: Glassmorphic Cards & Grid Lines
        # Let's paint dashboard elements based on the URL context
        if "linkedin" in url.lower():
            # LinkedIn simulated dashboard
            draw.rectangle([(20, 95), (1180, 780)], fill="#0B132B")
            # Left sidebar profile card
            draw.rounded_rectangle([(50, 120), (280, 350)], radius=8, fill="#1C2541")
            draw.ellipse([(125, 140), (205, 220)], fill="#3A506B") # profile circle
            draw.rectangle([(70, 240), (260, 255)], fill="#5BC0BE") # name
            draw.rectangle([(90, 270), (240, 280)], fill="#4A526D") # job title
            
            # Central Feed Panel
            draw.rounded_rectangle([(310, 120), (850, 750)], radius=8, fill="#1C2541")
            
            # Header jobs search bar inside LinkedIn
            draw.rounded_rectangle([(340, 140), (820, 190)], radius=6, fill="#0B132B")
            
            # Add dynamic search values if typed
            search_text = input_value if step_idx >= 2 and "search" in selector_target.lower() else "Software Engineer"
            draw.text((360, 155), search_text, fill="#F8FAFC")
            
            # Draw Job listings
            for i in range(3):
                y_offset = 220 + i * 160
                draw.rounded_rectangle([(330, y_offset), (830, y_offset + 140)], radius=6, fill="#111B35")
                draw.rectangle([(350, y_offset + 20), (430, y_offset + 100)], fill="#3A506B") # logo
                draw.text((455, y_offset + 25), f"Senior Systems Engineer - AI Platform (Job #{i+1})", fill="#10B981")
                draw.text((455, y_offset + 50), "OpenAI  ·  San Francisco, CA (Hybrid)", fill="#94A3B8")
                draw.text((455, y_offset + 75), "$240,000/yr - $380,000/yr  ·  Easy Apply", fill="#F59E0B")
                
                # Apply selector highlights
                if step_idx >= 5 and i == 0:
                    # Highlight first job
                    draw.rectangle([(330, y_offset), (830, y_offset + 140)], outline="#EF4444", width=3)
                    
            # Right Panel
            draw.rounded_rectangle([(880, 120), (1150, 400)], radius=8, fill="#1C2541")
            
        elif "stripe" in url.lower() or "braintree" in url.lower():
            # Stripe Payments comparison view
            draw.rectangle([(20, 95), (1180, 780)], fill="#0F172A")
            # Draw gradient dashboard lines
            draw.text((50, 120), "AgentOS competitive Intelligence Dashboard", fill="#818CF8")
            draw.text((50, 145), "Source Page: Stripe & Braintree APIs API Fees Scrape", fill="#94A3B8")
            
            # Pricing grids
            draw.rounded_rectangle([(80, 200), (550, 600)], radius=12, fill="#1E293B", outline="#4F46E5", width=2)
            draw.text((120, 240), "STRIPE PRICING MODEL", fill="#6366F1")
            draw.text((120, 300), "Standard Rate: 2.9% + 30¢", fill="#10B981")
            draw.text((120, 340), "International Cards: +1.5%", fill="#94A3B8")
            draw.text((120, 380), "Instant Payouts: 1.0%", fill="#94A3B8")
            
            draw.rounded_rectangle([(650, 200), (1120, 600)], radius=12, fill="#1E293B", outline="#EC4899", width=2)
            draw.text((690, 240), "BRAINTREE PRICING MODEL", fill="#EC4899")
            draw.text((690, 300), "Standard Rate: 2.59% + 49¢", fill="#10B981")
            draw.text((690, 340), "Alternative Methods: Custom", fill="#94A3B8")
            draw.text((690, 380), "ACH Transfers: 0.75%", fill="#94A3B8")
            
        else:
            # Generic beautifully formatted web screen (Search engine)
            draw.rectangle([(20, 95), (1180, 780)], fill="#090D16")
            # Google / generic logo
            draw.text((500, 220), "AgentOS Search", fill="#38BDF8")
            # Search Input bar
            draw.rounded_rectangle([(300, 300), (900, 360)], radius=30, fill="#1E293B", outline="#4B5563")
            draw.text((330, 322), input_value or "https://github.com/langgraph", fill="#F1F5F9")
            
            # Draw search results if step_idx >= 3
            if step_idx >= 3:
                draw.text((100, 420), f"Search Results for: '{input_value}'", fill="#94A3B8")
                for j in range(3):
                    y_pos = 460 + j * 90
                    draw.text((100, y_pos), f"Verified AI Agent Automation - Source #{j+1}", fill="#38BDF8")
                    draw.text((100, y_pos + 20), f"https://agentos.ai/docs/reference/node-{j}", fill="#10B981")
                    draw.text((100, y_pos + 40), "Multi-agent autonomous systems scale standard browser selectors natively...", fill="#94A3B8")

        # 5. Overlays: Agent HUD display, cursor, selector target box
        # Red coordinate box overlay highlighting the selector target
        if selector_target and step_idx > 0:
            # Let's draw an target overlay
            draw.rectangle([(420, 300), (780, 480)] if "btn" in selector_target else [(280, 130), (850, 210)], outline="#EF4444", width=3)
            # Label
            draw.rectangle([(420, 275), (550, 300)] if "btn" in selector_target else [(280, 105), (410, 130)], fill="#EF4444")
            draw.text((430, 280) if "btn" in selector_target else (290, 110), f"SELECTOR: {selector_target[:12]}...", fill="#FFFFFF")

        # Draw red mouse arrow pointer targeting elements
        draw.polygon([(460, 340), (460, 375), (473, 363), (485, 385), (493, 380), (480, 358), (495, 355)], fill="#EF4444")

        # HUD display at bottom right representing executing agent parameters
        draw.rounded_rectangle([(880, 680), (1170, 770)], radius=8, fill="#111827", outline="#10B981", width=1)
        draw.text((900, 695), f"AGENT ACTIVE: Executor", fill="#10B981")
        draw.text((900, 715), f"TASK STEP: {step_idx}", fill="#F59E0B")
        draw.text((900, 735), f"ACTION: {step_action.upper()}", fill="#EF4444")

        # Save buffer & transform to Base64
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)
        img_b64 = base64.b64encode(buf.getvalue()).decode()
        return img_b64
