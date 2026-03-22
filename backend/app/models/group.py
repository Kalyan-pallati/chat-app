from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional

class Group(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = Field(default=None)
    avatar_url: Optional[str] = Field(default=None)
    creator_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GroupMember(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key="group.id")
    User_id: int = Field(foreign_key="user.id")
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    role: str = Field(default="member")  # roles: member, admin