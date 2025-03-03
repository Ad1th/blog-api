from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
import jwt
import os
import supabase
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

# Initialize Supabase client
supabase_client = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)

SECRET_KEY = "your_secret_key"  # Change this to a strong secret key

app = FastAPI()

# CORS Middleware to allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class User(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    token: str

# Helper function to generate JWT token
def create_token(email):
    return jwt.encode({"email": email}, SECRET_KEY, algorithm="HS256")

# Sign-up Route
@app.post("/signup", response_model=TokenResponse)
def signup(user: User):
    response = supabase_client.auth.sign_up({"email": user.email, "password": user.password})
    if "error" in response:
        raise HTTPException(status_code=400, detail="Signup failed")
    
    token = create_token(user.email)
    return {"token": token}

# Login Route
@app.post("/login", response_model=TokenResponse)
def login(user: User):
    response = supabase_client.auth.sign_in_with_password({"email": user.email, "password": user.password})
    if "error" in response:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    token = create_token(user.email)
    return {"token": token}

# Protected Route - Homepage
@app.get("/home")
def home(token: str):
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"message": f"Welcome {decoded_token['email']}!"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
