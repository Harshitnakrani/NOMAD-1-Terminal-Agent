from fastapi import FastAPI
from pydantic import BaseModel, List
from typing import Union
from server.app.db.mongo import mongo_service, HistoryItem, Session
 
app = FastAPI()

class Payload(BaseModel):
    session: Union[Session, None] = None
    messages: List[dict]
@app.post("/api/v1/chat")
def chat(payload: Payload):
    session
    if !payload.session:
        session = mongo_service.create_session(payload.session)

    #TODO brain integration here
    
    #TODO task executor here 



   
