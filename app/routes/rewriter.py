from flask import Blueprint, render_template, request, jsonify
from app.services.claude_client import rewrite_bullet

rewriter_bp = Blueprint('rewriter', __name__)

@rewriter_bp.route('/rewriter')
def rewriter():
    return render_template('rewriter.html')

@rewriter_bp.route('/rewriter/rewrite', methods=['POST'])
def rewrite():
    data = request.get_json()
    weak_bullet = data.get('weak_bullet', '').strip()
    writing_style = data.get('writing_style', '').strip()

    if not weak_bullet:
        return jsonify({"error": "Paste a bullet point first."}), 400

    if len(weak_bullet) < 10:
        return jsonify({"error": "Bullet is too short."}), 400

    if not writing_style:
        return jsonify({"error": "Describe your writing style first."}), 400

    try:
        result = rewrite_bullet(weak_bullet, writing_style)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Rewrite failed: {str(e)}"}), 500