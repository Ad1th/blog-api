from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
import jwt
import os
import json
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import supabase
import datetime
import uuid

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

# Initialize Supabase client
supabase_client = supabase.create_client(SUPABASE_URL, SUPABASE_KEY)

# Change this to a strong secret key!
SECRET_KEY = os.getenv("SECRET_KEY")

app = FastAPI()

# CORS Middleware: adjust allow_origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change to specific domains in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# ============================
# Authentication Models & Endpoints
# ============================

class User(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    token: str

# Helper function to generate JWT token based on user email
def create_token(email: str):
    expiry = datetime.datetime.utcnow() + datetime.timedelta(hours=2)  # Expires in 2 hours
    return jwt.encode({"email": email, "exp": expiry}, SECRET_KEY, algorithm="HS256")


@app.post("/signup", response_model=TokenResponse)
def signup(user: User):
    response = supabase_client.auth.sign_up({"email": user.email, "password": user.password})
    
    if response.get("error"):  # Proper error checking
        raise HTTPException(status_code=400, detail=response["error"]["message"])
    
    token = create_token(user.email)
    return {"token": token}

@app.post("/login", response_model=TokenResponse)
def login(user: User):
    response = supabase_client.auth.sign_in_with_password({"email": user.email, "password": user.password})
    
    if response.get("error"):  # Proper error checking
        raise HTTPException(status_code=400, detail=response["error"]["message"])
    
    token = create_token(user.email)
    return {"token": token}


# Protected Route - Homepage (token provided as query parameter)
@app.get("/home")
def home(token: str):
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"message": f"Welcome {decoded_token['email']}!"}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============================
# Blog Post Endpoints
# ============================

# File used for storing blog posts
POSTS_FILE = "posts.json"

# Initialize POSTS_FILE if it doesn't exist
if not os.path.exists(POSTS_FILE):
    with open(POSTS_FILE, "w") as f:
        json.dump([], f)

# Helper functions for reading and writing posts data
def read_posts():
    with open(POSTS_FILE, "r") as f:
        return json.load(f)

def write_posts(data):
    with open(POSTS_FILE, "w") as f:
        json.dump(data, f)

# Pydantic models for blog posts
class BlogPostCreate(BaseModel):
    title: str
    content: str

class BlogPost(BaseModel):
    id: str
    title: str
    content: str
    author: str

# Dependency to obtain the current user's email from the header token.
# Expect the token to be sent as a header (e.g., token: <your_jwt_token>)
def get_current_user(token: str = Header(...)):
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded_token["email"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Endpoint to retrieve all blog posts (public)
@app.get("/posts", response_model=list[BlogPost])

def get_all_posts():
    posts_data = read_posts()
    print(posts_data)  # Log posts to check if they are loaded correctly
    return posts_data


# Endpoint to create a new blog post (requires authentication)
@app.post("/posts", response_model=BlogPost)
def create_blog_post(blog_post: BlogPostCreate, current_user: str = Depends(get_current_user)):
    posts_data = read_posts()
    new_id = str(uuid.uuid4())
    new_post = {
        "id": new_id,
        "title": blog_post.title,
        "content": blog_post.content,
        "author": current_user
    }
    posts_data.append(new_post)
    write_posts(posts_data)
    return new_post
