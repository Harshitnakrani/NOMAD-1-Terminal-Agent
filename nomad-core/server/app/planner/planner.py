try:
    from server.app.brain.llm_client import LLMClient
    from server.app.brain.brain import SYSTEM_PROMPT
except ModuleNotFoundError:
    from brain.llm_client import LLMClient
    from brain.brain import SYSTEM_PROMPT

class Planner:
    def __init__(self):
        self.llmClient = LLMClient()

    def generate_plan(self, user_input: str, cwd: str = None) -> dict:
        if not user_input:
            return {
                 "success": False,
                 "error": "No user input provided."
            }

        try:
            from server.app.utils.dir_context import get_directory_context
        except ModuleNotFoundError:
            from utils.dir_context import get_directory_context
            
        dir_context = get_directory_context(cwd)
        planner_prompt = f"[PLANNER MODE] The user's goal is: '{user_input}'.\n\n{dir_context}\n\nPlease break this down into a structured TODO list following the required JSON format."

        response = self.llmClient.generate(SYSTEM_PROMPT, planner_prompt)
        
        # Validate the response
        if response.get("type") == "create_todo" and "todo" in response:
            return {
                "success": True,
                "response": response
            }
        
        return {
            "success": False,
            "error": "Invalid response format from LLM.",
            "raw": response
        }
