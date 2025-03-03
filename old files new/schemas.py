from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserLogin(BaseModel):
    username: str
    password: str

class UserCreate(UserLogin):
    name: str
    email: Optional[str] = None

class PostCreate(BaseModel):
    title: str
    content: str

class Post(BaseModel):
    post_id: int
    title: str
    content: str
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

    class Config:
        orm_mode = True

class UserLogin(BaseModel):
    username: str
    password: str

    class Config:
        orm_mode = True
