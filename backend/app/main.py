from fastapi import FastAPI
from sqlmodel import SQLModel
from fastapi.middleware.cors import CORSMiddleware

from app.models.user import User
from app.models.friend import FriendRequest
from app.models.message import Message

from app.db.session import engine
from app.api.auth import router as auth_router
from app.api.users import router as user_router
from app.api.friends import router as friend_router
from app.api.chat import router as chat_router

app = FastAPI(title="Chat Application")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")
app.include_router(user_router, prefix="/users")
app.include_router(friend_router, prefix="/users/friends")
app.include_router(chat_router,prefix="/chat",tags=["chat"])

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

@app.get("/")
def home():
    return {"message": "Chat Application"};
