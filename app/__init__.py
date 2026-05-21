from flask import Flask
from flask_cors import CORS
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, origins=[
        "http://localhost:5173",           # local dev
        "https://jobsearchsucks-ai.com",   # production
        "https://www.jobsearchsucks-ai.com",
        "https://*.vercel.app",            # Vercel preview deploys
    ])

    from app.routes.auth import auth_bp
    from app.routes.screener import screener_bp
    from app.routes.rewriter import rewriter_bp
    from app.routes.outreach import outreach_bp
    from app.routes.resume import resume_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(screener_bp)
    app.register_blueprint(rewriter_bp)
    app.register_blueprint(outreach_bp)
    app.register_blueprint(resume_bp)

    return app