from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from sqlmodel import Session, select, or_
from typing import List
from datetime import datetime
import json
from pydantic import BaseModel

from app.db.session import get_session
from app.models.user import User
from app.models.message import Message
from app.websockets.manager import manager
from app.core.security import verify_token, get_current_user


router = APIRouter()

class MessageResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime
    is_read:bool

@router.get("/history/{friend_id}", response_model=List[MessageResponse])
def get_chat_history(
    friend_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(Message).where(
        or_ (
            (Message.sender_id == current_user.id) & (Message.receiver_id == friend_id),
            (Message.sender_id == friend_id) & (Message.receiver_id == current_user.id)
        )
    ).order_by(Message.timestamp.asc())

    messages = session.exec(statement)
    return messages

@router.websocket("/ws/{token}")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
    session: Session = Depends(get_session)
):
    payload = verify_token(token)
    if not payload:
        await websocket.close(code=4003)
        return
    
    username = payload.get("sub")
    user = session.exec(select(User).where(User.username == username)).first()

    if not user:
        await websocket.close(code=4003)
        return
    
    user_id = user.id
    await manager.connect(user_id, websocket)

    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            receiver_id = message_data.get("receiver_id")
            content = message_data.get("content")

            if not receiver_id or not content:
                continue
            
            new_message = Message(
                sender_id=user_id,
                receiver_id=receiver_id,
                content=content,
                timestamp=datetime.utcnow(),
                is_read=False
            )
            session.add(new_message)
            session.commit()
            session.refresh(new_message)

            response_payload = {
                "id": new_message.id,
                "sender_id": user_id,
                "receiver_id": receiver_id,
                "content": content,
                "timestamp": new_message.timestamp.isoformat(),
                "is_read": False
            }
            # Send to receiever(if online)
            await manager.send_personal_message(response_payload, receiver_id)
            # Send back to sender(to update the UI)
            await manager.send_personal_message(response_payload, user_id)

    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)