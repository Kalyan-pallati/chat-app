from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select, or_, desc
from typing import List, Optional
from app.models.message import Message

from app.db.session import get_session
from app.models.user import User
from app.models.friend import FriendRequest, FriendStatus
from app.core.security import get_current_user

router = APIRouter()

class FriendRequestWithSender(BaseModel):
    id: int
    sender_id: int
    sender_username: str
    status: str

class Friend(BaseModel):
    id: int
    username: str
    email: str

class FriendResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    gender: Optional[str] = None
    profile_picture: Optional[str] = None
    allow_stranger_dms: bool
    last_message_time: Optional[str] = None     #Used for sorting friends by recent activity
    last_message_content: Optional[str] = None  #Used to show a preview of last msg in chatsidebar
    
@router.post("/request/{username}")
def send_friend_request(username: str, 
                        session: Session = Depends(get_session),
                        current_user: User = Depends(get_current_user)):
    if current_user.username == username:
        raise HTTPException(status_code=400, detail="You cannot send a friend request to yourself")
    target_user = session.exec(select(User).where(User.username == username)).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User Not Found")
    
    existing_request = session.exec(select(FriendRequest).where(
        or_(
            (FriendRequest.sender_id == current_user.id) & (FriendRequest.receiver_id == target_user.id),
            (FriendRequest.sender_id == target_user.id) & (FriendRequest.receiver_id == current_user.id)
        )
    )).first()

    if existing_request:
        if existing_request.status == FriendStatus.ACCEPTED:
            raise HTTPException(status_code=400, detail="You are already Friends.")
        raise HTTPException(status_code=400, detail="Your Friend Request is Pending")
    
    new_request = FriendRequest(
        sender_id=current_user.id,
        receiver_id=target_user.id,
        status=FriendStatus.PENDING,
    )
    session.add(new_request)
    session.commit()
    return {"message": "Friend Request Sent"}

@router.get("/requests/pending", response_model=List[FriendRequestWithSender])
def get_pending_requests(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(FriendRequest, User).join(User, FriendRequest.sender_id == User.id).where(
        (FriendRequest.receiver_id == current_user.id) & 
        (FriendRequest.status == FriendStatus.PENDING)
    )
    requests = session.exec(statement).all()

    response_data = []
    for request, sender in requests:
        response_data.append(
            FriendRequestWithSender(
                id=request.id,
                sender_id= sender.id,
                sender_username=sender.username,
                status=request.status
            )
        )

    return response_data

@router.post("/accept/{request_id}")
def accept_friend_request(
    request_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    friend_request = session.get(FriendRequest, request_id)

    if not friend_request:
        raise HTTPException(status_code=404, detail="Request Not Found")
    
    if friend_request.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="This request does not belong to you")
    
    friend_request.status = FriendStatus.ACCEPTED
    session.add(friend_request)
    session.commit()

    return {"message": "Friend Request Accepted! You can chat now."}

@router.post("/reject/{request_id}")
def reject_friend_request(
    request_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(FriendRequest).where(
        FriendRequest.id == request_id
    )
    friend_request = session.exec(statement).first()

    if not friend_request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if friend_request.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not Authorized")
    
    session.delete(friend_request)
    session.commit()

    return {"message": "Friend request rejected and removed"}

@router.get("/list", response_model=List[Friend])
def get_friends_list(
    session : Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(FriendRequest).where(
        (FriendRequest.status == FriendStatus.ACCEPTED) & (
                                            (FriendRequest.sender_id == current_user.id) | 
                                            (FriendRequest.receiver_id == current_user.id) )
                                            )
    
    connections = session.exec(statement).all()

    friend_ids = []
    for conn in connections:
        if conn.sender_id == current_user.id:
            friend_ids.append(conn.receiver_id)
        else:
            friend_ids.append(conn.sender_id)
    
    if not friend_ids:
        return []
    
    friends = session.exec(select(User).where(User.id.in_(friend_ids))).all()

    return [
        Friend(id=f.id, username=f.username, email=f.email)
        for f in friends
    ]

@router.get("/friends", response_model=List[FriendResponse]) 
def get_my_friends(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    query = select(FriendRequest).where(
        (FriendRequest.status == FriendStatus.ACCEPTED) &
        (
            (FriendRequest.sender_id == current_user.id) | 
            (FriendRequest.receiver_id == current_user.id)
        )
    )
    connections = session.exec(query).all()

    friend_ids = []
    for conn in connections:
        if conn.sender_id == current_user.id:
            friend_ids.append(conn.receiver_id)
        else:
            friend_ids.append(conn.sender_id)

    if not friend_ids:
        return []

    friends = session.exec(select(User).where(User.id.in_(friend_ids))).all()

    friend_responses = []

    for f in friends:
        stmt = select(Message).where(
            or_(
                (Message.sender_id == current_user.id) & (Message.receiver_id == f.id),
                (Message.sender_id == f.id) & (Message.receiver_id == current_user.id)
            )
        ).order_by(desc(Message.timestamp)).limit(1)

        last_msg = session.exec(stmt).first()
        friend_responses.append(
            FriendResponse(
                id=f.id,
                username=f.username,
                email=f.email,
                full_name=f.full_name,
                bio=f.bio,
                gender=f.gender,
                profile_picture=f.profile_picture,
                allow_stranger_dms=f.allow_stranger_dms,
                last_message_content=str(last_msg.content) if last_msg else None,
                last_message_time=str(last_msg.timestamp) if last_msg else None
            )
        )
    friend_responses.sort(
        key=lambda x: x.last_message_time or datetime.min,
        reverse=True
    )
    return friend_responses
