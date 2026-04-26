from flask import Flask
from flask_cors import CORS
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow React (localhost:5173) to talk to Flask (localhost:5000)
    CORS(app, origins=["http://localhost:5173"])

    from app.routes.auth import auth_bp
    from app.routes.screener import screener_bp
    from app.routes.rewriter import rewriter_bp
    from app.routes.ats import ats_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(screener_bp)
    app.register_blueprint(rewriter_bp)
    app.register_blueprint(ats_bp)

    return app