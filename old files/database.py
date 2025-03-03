from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import DATABASE_URL
from dotenv import load_dotenv
import os

load_dotenv()  # This loads environment variables from a .env file

DATABASE_URL = os.getenv("SUPABASE_DB_URL")  # Use the correct DB URL

if DATABASE_URL is None:
    raise ValueError("DATABASE_URL is not set in the environment variables")

# Set up database connection
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

