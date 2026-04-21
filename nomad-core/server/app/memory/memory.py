try:
    from server.app.db.mongo import mongo_service, HistoryItem, Session
except ModuleNotFoundError:
    from db.mongo import mongo_service, HistoryItem, Session
from typing import List, Optional, Any

class LongTermMemory:

    def __init__(self, session_id: str):
        self.session_id = session_id
        self.db_service = mongo_service

    def save_history(self, task_id: int, command: dict, output: Any):
        history_item = HistoryItem(
            task_id=task_id,
            command=command,
            output=output
        )
        self.db_service.add_history(self.session_id, history_item)

    def get_full_history(self) -> List[dict]:
       
        session = self.db_service.get_session(self.session_id)
        if session:
            return session.get("history", [])
        return []

    def get_session_status(self) -> str:
    
        session = self.db_service.get_session(self.session_id)
        if session:
            return session.get("status", "unknown")
        return "not_found"

class ShortTermMemory:
   
    def __init__(self):
        self.current_task = None
        self.last_output = None
        self.errors = []

    def update(self, task: Any, output: Any, error: Optional[str] = None):
        self.current_task = task
        self.last_output = output
        if error:
            self.errors.append(error)
