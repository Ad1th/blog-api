import os
from fastapi import APIRouter, HTTPException
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

router = APIRouter()

# User signup
@router.post("/signup")
async def signup(email: str, password: str):
    response = supabase.auth.sign_up({"email": email, "password": password})
    if "error" in response and response["error"]:
        raise HTTPException(status_code=400, detail=response["error"]["message"])
    return {"message": "Signup successful", "user": response["user"]}

# User login
@router.post("/login")
async def login(email: str, password: str):
    response = supabase.auth.sign_in_with_password({"email": email, "password": password})
    if "error" in response and response["error"]:
        raise HTTPException(status_code=400, detail=response["error"]["message"])
    return {"message": "Login successful", "session": response["session"]}
