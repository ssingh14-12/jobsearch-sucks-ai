import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("FLASK_SECRET_KEY", "dev-key-change-this")
    ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
    YOUR_EMAIL = os.getenv("YOUR_EMAIL")
    RESUME_FOLDER = os.path.join(os.path.dirname(__file__), "resumes")
    DATA_FOLDER = os.path.join(os.path.dirname(__file__), "data")