from flask import Blueprint, redirect
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/')
def index():
    return redirect('/screener')