import os
from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

MONGO_URL = os.getenv('MONGODB_URL')
DB_NAME = os.getenv('MONGODB_NAME', 'NOMAD-cluster')

class Task(BaseModel):
    
    id: int
    task: str
    status: str = "pending"
    tool: str

class HistoryItem(BaseModel):
    task_id: int
    command: Dict[str, Any]
    output: Any
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Session(BaseModel):

    sessionId: str
    goal: str
    todo_list: List[Task] = []
    current_step: int = 0
    history: List[HistoryItem] = []
    status: str = "running"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MongoDbService:
   
    def __init__(self):
        if not MONGO_URL:
            
            self.client = None
            self.db = None
            self.sessions_collection = None
            print("Warning: MONGODB_URL not found in environment variables.")
            return

        self.client = MongoClient(MONGO_URL)
        self.db = self.client[DB_NAME]
        self.sessions_collection = self.db['sessions']
        print(f"Connected to MongoDB: {DB_NAME}")

    def get_db(self):
        return self.db

    def create_session(self, session: Session) -> Session:
      
        if self.sessions_collection is not None:
            self.sessions_collection.insert_one(session.dict())
        return session

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
   
        if self.sessions_collection is not None:
            return self.sessions_collection.find_one({"sessionId": session_id})
        return None

    def update_session(self, session_id: str, updates: Dict[str, Any]):
   
        if self.sessions_collection is not None:
            updates['updated_at'] = datetime.utcnow()
            self.sessions_collection.update_one({"sessionId": session_id}, {"$set": updates})

    def add_history(self, session_id: str, history_item: HistoryItem):
      
        if self.sessions_collection is not None:
            self.sessions_collection.update_one(
                {"sessionId": session_id},
                {
                    "$push": {"history": history_item.dict()},
                    "$set": {"updated_at": datetime.utcnow()}
                }
            )

class DbService:

    def __init__(self):
        self.mongo_service = MongoDbService()

    def get_db(self):
        return self.mongo_service.get_db()
    
    def get_sessions_collection(self):
        if self.mongo_service.sessions_collection is not None:
            return self.mongo_service.sessions_collection
        return None

mongo_service = MongoDbService()

def get_db_service():
 
    return mongo_service
