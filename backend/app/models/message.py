from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    content: str
    message_type: Optional[str] = Field(default="text")  # text, image, file
    media_url: Optional[str] = Field(default=None)  # for images/files

    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_read: bool = Field(default=False)

    sender_id: int = Field(foreign_key="user.id")

    receiver_id: Optional[int] = Field(foreign_key="user.id")
    group_id: Optional[int] = Field(default=None, foreign_key="group.id")

    reply_to_id: Optional[int] = Field(default=None, foreign_key="message.id") #For reply preview
