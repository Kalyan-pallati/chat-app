from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, or_
from pydantic import BaseModel
from typing import Optional, List

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

@router.get("/search", response_model=List[UserProfileResponse])
def get_user_profile(
    q: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    target_users = session.exec(select(User).where(
        User.username.ilike(f"%{q}%"),
        User.id != current_user.id).limit(10)
    ).all()
    
    if not target_users:
        raise HTTPException(status_code=404, detail="User Not Found")

    results = []

    for user in target_users:
        # Check Friendship Status
        statement = select(FriendRequest).where(
            or_(
                (FriendRequest.sender_id == current_user.id) & (FriendRequest.receiver_id == user.id),
                (FriendRequest.sender_id == user.id) & (FriendRequest.receiver_id == current_user.id)
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

        results.append( UserProfileResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name, 
            bio=user.bio,             
            gender=user.gender,      
            profile_picture=user.profile_picture, 
            allow_stranger_dms=user.allow_stranger_dms,
            friendship_status=status
            )
        )
    return results

