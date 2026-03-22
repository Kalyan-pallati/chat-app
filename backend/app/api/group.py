from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from pydantic import BaseModel
from app.db.session import get_session
from app.models.user import User
from app.core.security import get_current_user
from app.models.group import Group, GroupMember 

import uuid
import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    member_ids: Optional[List[int]] = None

class GroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    avatar_url: Optional[str] = None
    creator_id: int
    created_at: str
    member_count: int

@router.post("/create", response_model=GroupResponse)
async def create_group(
    group_data: GroupCreate, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)):
    
    if not group_data.name.strip():
        raise HTTPException(status_code=400, detail="Group name cannot be empty")
    
    # 1. Use the DB Model, not the Pydantic schema
    new_group = Group(
        name=group_data.name,
        description=group_data.description,
        avatar_url=group_data.avatar_url,
        creator_id=current_user.id 
    )
    session.add(new_group)
    session.commit()
    session.refresh(new_group)
    
    # 2. Actually add the creator to the group!
    admin_member = GroupMember(
        group_id=new_group.id, 
        User_id=current_user.id, 
        role="admin"
    )
    session.add(admin_member)
    
    valid_member_count = 1 

    # 3. Add the rest of the members
    if group_data.member_ids:
        unique_member_id = set(group_data.member_ids)
        unique_member_id.discard(current_user.id)

        for user_id in unique_member_id:
            new_member = GroupMember(
                group_id=new_group.id, 
                User_id=user_id,
                role="member"
            )
            session.add(new_member)
            valid_member_count += 1
    
    session.commit()

    return GroupResponse(
        id=new_group.id,
        name=new_group.name,
        description=new_group.description,
        avatar_url=new_group.avatar_url,
        creator_id=new_group.creator_id,
        created_at=str(new_group.created_at),
        member_count=valid_member_count
    )

@router.post("/upload-avatar")
async def upload_group_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    try:
        custom_filename = f"group_avatar_{uuid.uuid4().hex[:10]}"

        result = cloudinary.uploader.upload(
            file.file,
            folder="chat_app_group_avatars",
            public_id=custom_filename,
            transformation=[
                {"width": 500, "height": 500, "crop": "fill"},
                {"quality": "auto"}
            ]
        )
        
        return {"url": result.get("secure_url")}
        
    except Exception as e:
        print(f"Cloudinary Error : {e}")
        raise HTTPException(status_code=500, detail="Failed to upload image")