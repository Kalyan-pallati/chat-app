from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, or_
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_session
from app.models.user import User
from app.models.friend import FriendRequest, FriendStatus
from app.core.security import get_current_user
from app.models.user import User
class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str         
    bio: str               
    gender: str            
    profile_picture: Optional[str] = None 
    allow_stranger_dms: bool
    friendship_status: str

router = APIRouter()

@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    return UserProfileResponse(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        bio=current_user.bio,
        gender=current_user.gender,
        profile_picture=current_user.profile_picture,
        allow_stranger_dms=current_user.allow_stranger_dms,
        friendship_status="self" # Special status for yourself
    )

@router.get("/{username}", response_model=UserProfileResponse)
def get_user_profile(
    username: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    target_user = session.exec(select(User).where(User.username == username)).first()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="User Not Found")

    if target_user.id == current_user.id:
        raise HTTPException(status_code=404, detail="User Not Found")

    # Check Friendship Status
    statement = select(FriendRequest).where(
        or_(
            (FriendRequest.sender_id == current_user.id) & (FriendRequest.receiver_id == target_user.id),
            (FriendRequest.sender_id == target_user.id) & (FriendRequest.receiver_id == current_user.id)
        )
    )
    friend_request = session.exec(statement).first()

    status = "stranger"

    if friend_request:
        if friend_request.status == FriendStatus.ACCEPTED:
            status = "friends"
        elif friend_request.status == FriendStatus.PENDING:
            if friend_request.sender_id == current_user.id:
                status = "request_sent"
            else:
                status = "request_received"

    return UserProfileResponse(
        id=target_user.id,
        username=target_user.username,
        email=target_user.email,
        full_name=target_user.full_name, 
        bio=target_user.bio,             
        gender=target_user.gender,      
        profile_picture=target_user.profile_picture, 
        allow_stranger_dms=target_user.allow_stranger_dms,
        friendship_status=status
    )

