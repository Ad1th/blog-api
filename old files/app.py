from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from crud import create_user, get_user_by_username, create_post, get_posts
from schemas import UserLogin, PostCreate, Post
from utils import verify_password
import jwt
from config import JWT_SECRET_KEY

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Login endpoint
@app.post("/login")
async def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = get_user_by_username(db, user.username)
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Create JWT token
    token = jwt.encode({"sub": db_user.username}, JWT_SECRET_KEY, algorithm="HS256")
    
    # Redirect to homepage.html
    return HTMLResponse(content=open("templates/homepage.html").read(), status_code=200)


# Home endpoint to get all posts
@app.get("/posts", response_model=list[Post])
async def read_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = get_posts(db, skip=skip, limit=limit)
    return posts

# Create post endpoint
@app.post("/posts")
async def create_new_post(post: PostCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    user_data = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
    db_user = get_user_by_username(db, user_data["sub"])
    
    if not db_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    
    db_post = create_post(db, post, db_user.user_id)
    return db_post
