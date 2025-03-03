import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Environment variables for database and JWT
DATABASE_URL = os.getenv("SUPABASE_DB_URL")  # Use the correct DB URL
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
