from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Union, List
import uuid

try:
    from server.app.db.mongo import mongo_service, Session
    from server.app.agent.loop import Loop
except ModuleNotFoundError:
    from db.mongo import mongo_service, Session
    from agent.loop import Loop

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent_loop = Loop()

class Payload(BaseModel):
    session: Union[Session, None] = None
    messages: List[dict]
    cwd: Union[str, None] = None

@app.post("/api/v1/chat")
def chat(payload: Payload):
    session = payload.session
    user_input = payload.messages[-1].get("content", "") if payload.messages else ""
    
    if not session:
        new_session = Session(
            sessionId=str(uuid.uuid4()),
            goal=user_input,
            cwd=payload.cwd
        )
        session = mongo_service.create_session(new_session)

    # Run the agent loop
    updated_session = agent_loop.run(session, user_input)
    
    return {"session": updated_session}
