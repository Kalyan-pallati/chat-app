from sqlmodel import SQLModel, Field
from typing import Optional
from enum import Enum

class FriendStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECRED = "rejected"

class FriendRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    sender_id: int = Field(foreign_key="user.id")
    receiver_id: int = Field(foreign_key="user.id")

    status: FriendStatus = Field(default=FriendStatus.PENDING)