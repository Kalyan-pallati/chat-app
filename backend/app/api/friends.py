from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select, or_
from typing import List

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