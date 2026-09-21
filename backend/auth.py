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
    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {
        "message": "Login successful",
        "user": {
            "username": db_user["username"],
            "email": db_user["email"]
        },
        "token": "mock-jwt-token"
    }
