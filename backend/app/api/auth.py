from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlmodel import Session, select
from pydantic import BaseModel
from app.db.session import get_session
from app.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from app.core.cloudinary import upload_profile_picture

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

router = APIRouter()

@router.post("/signup", response_model=Token)
def signup(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(...),
    gender: str = Form("other"),
    file: UploadFile = File(None), # Optional: User might not upload a pic
    session: Session = Depends(get_session)):
    existing = session.exec(
        select(User).where(User.username == username)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Username Already Taken")
    
    existing_email = session.exec(select(User).where(User.email == email)).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email Already Registered")
    
    image_url = None
    if file:
        image_url = upload_profile_picture(file.file)

    new_user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
        gender=gender,
        profile_picture=image_url,
        bio="Hey there! I'm ready to chat anytime"
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)
    
    token = create_access_token({"sub": new_user.username})
    return {"access_token": token}

@router.post("/login", response_model=Token)
def login(user: UserLogin, session: Session = Depends(get_session)):
    db_user = session.exec(
        select(User).where(User.username == user.username)
    ).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid Credentials")
    
    token = create_access_token({"sub": db_user.username})
    return {"access_token": token}