from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(index=True, unique=True)
    hashed_password: str
    full_name: str = Field(default="")
    bio: str = Field(default="Hey there! I'm ready to chat Anytime")
    gender: str = Field(default="other")
    profile_picture: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    allow_stranger_dms: bool = Field(default=False)