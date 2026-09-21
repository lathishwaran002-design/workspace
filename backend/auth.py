from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Mock Database
users_db = {}

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLogin(BaseModel):
    email: str
    username: str
    id_token: str | None = None
    photo_url: str | None = None

@router.post("/register")
async def register(user: UserRegister):
    if user.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    users_db[user.email] = {
        "username": user.username,
        "email": user.email,
        "password": user.password
    }
    return {"message": "User registered successfully"}

@router.post("/login")
async def login(user: UserLogin):
    db_user = users_db.get(user.email)
    if not db_user or db_user.get("password") != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "message": "Login successful",
        "user": {
            "username": db_user["username"],
            "email": db_user["email"]
        },
        "token": "mock-jwt-token"
    }

@router.post("/google")
async def google_login(data: GoogleLogin):
    if data.email not in users_db:
        users_db[data.email] = {
            "username": data.username,
            "email": data.email,
            "photo_url": data.photo_url,
            "provider": "google"
        }
    else:
        users_db[data.email]["username"] = data.username
        if data.photo_url:
            users_db[data.email]["photo_url"] = data.photo_url

    return {
        "message": "Google authentication successful",
        "user": {
            "username": users_db[data.email]["username"],
            "email": data.email,
            "photo_url": users_db[data.email].get("photo_url")
        },
        "token": "mock-google-jwt-token"
    }

