try:
    from server.app.planner.planner import Planner
    from server.app.db.mongo import mongo_service, Session, Task
except ModuleNotFoundError:
    from planner.planner import Planner
    from db.mongo import mongo_service, Session, Task

class Loop:
    def __init__(self):
        self.planMaker = Planner()

    def run(self, session: Session, user_input: str) -> dict:
        if not session.todo_list:
            print("No TODO list found. Engaging Planner...")
            plan_result = self.planMaker.generate_plan(user_input)
            
            if plan_result.get("success"):
                llm_response = plan_result["response"]
                todo_items = llm_response.get("todo", [])
                
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
                print(f"Generated {len(new_tasks)} tasks.")
            else:
                print("Failed to generate plan:", plan_result.get("error"))
                return session.model_dump()

        # Phase 3 Stub: Executor Logic
        # Here we would iterate over session.todo_list where status == "pending"
        # and pass them to the Executor module.
        # For now, we just return the session with the generated plan.
        print("Plan generated. Execution is stubbed out for Phase 3.")

        return session.model_dump()
