try:
    from server.app.planner.planner import Planner
    from server.app.db.mongo import mongo_service, Session, Task
    from server.app.executer.shell import ShellExecutor
    from server.app.executer.file_ops import FileExecutor
    from server.app.safety.validator import Validator
    from server.app.memory.memory import LongTermMemory
    from server.app.brain.llm_client import LLMClient
    from server.app.brain.brain import SYSTEM_PROMPT
    from server.app.utils.dir_context import get_directory_context
except ModuleNotFoundError:
    from planner.planner import Planner
    from db.mongo import mongo_service, Session, Task
    from executer.shell import ShellExecutor
    from executer.file_ops import FileExecutor
    from safety.validator import Validator
    from memory.memory import LongTermMemory
    from brain.llm_client import LLMClient
    from brain.brain import SYSTEM_PROMPT
    from utils.dir_context import get_directory_context

class Loop:
    def __init__(self):
        self.planMaker = Planner()
        self.executor = ShellExecutor()
        self.file_executor = FileExecutor()
        self.validator = Validator()
        self.llm_client = LLMClient()

    def run(self, session: Session, user_input: str) -> dict:
        memory = LongTermMemory(session.sessionId)
        dir_context = get_directory_context(session.cwd)
        
        if not session.todo_list:
            plan_result = self.planMaker.generate_plan(user_input, session.cwd)
            if plan_result.get("success"):
                todo_items = plan_result["response"].get("todo", [])
                new_tasks = []
                for item in todo_items:
                    task = Task(
                        id=item.get("id"),
                        task=item.get("task"),
                        tool=item.get("tool", "shell"),
                        status="pending"
                    )
                    new_tasks.append(task)
                session.todo_list.extend(new_tasks)
                mongo_service.update_session(session.sessionId, {"todo_list": [t.model_dump() for t in session.todo_list]})
            else:
                return session.model_dump()

        for task in session.todo_list:
            if task.status == "pending":
                executor_prompt = f"[EXECUTOR MODE] Goal: {session.goal}. Current Task ID: {task.id}, Task: {task.task}.\n{dir_context}\nGenerate the command."
                exec_response = self.llm_client.generate(SYSTEM_PROMPT, executor_prompt)
                
                if exec_response.get("type") == "execute_task" and "command" in exec_response:
                    cmd_obj = exec_response["command"]
                    cmd_type = cmd_obj.get("type", "shell")
                    
                    if cmd_type == "shell":
                        cmd_str = cmd_obj.get("command", "")
                        if not self.validator.is_safe(cmd_str):
                            task.status = "failed"
                            mongo_service.update_session(session.sessionId, {"todo_list": [t.model_dump() for t in session.todo_list]})
                            continue
                        exec_result = self.executor.execute(cmd_str, cwd=session.cwd)
                        cmd_run_str = cmd_str
                    elif cmd_type == "file":
                        exec_result = self.file_executor.execute(cmd_obj, cwd=session.cwd)
                        cmd_run_str = f"FileOp: {cmd_obj.get('action')} on {cmd_obj.get('target')}"
                    else:
                        task.status = "failed"
                        mongo_service.update_session(session.sessionId, {"todo_list": [t.model_dump() for t in session.todo_list]})
                        continue
                    
                    memory.save_history(task.id, cmd_obj, exec_result)
                    
                    eval_prompt = f"[EVALUATION MODE] Task: {task.task}. Command run: {cmd_run_str}. Output: {exec_result['stdout']} | Error: {exec_result['stderr']}.\n{dir_context}"
                    self.llm_client.generate(SYSTEM_PROMPT, eval_prompt)
                    
                    if exec_result["success"]:
                        task.status = "completed"
                    else:
                        task.status = "failed"
                        
                    mongo_service.update_session(session.sessionId, {"todo_list": [t.model_dump() for t in session.todo_list]})
                    
        return session.model_dump()
