from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    sender_id: int = Field(foreign_key="user.id")
    recipient_id: int = Field(foreign_key="user.id") 
    timestamp: datetime = Field(default_factory=datetime.utcnow)