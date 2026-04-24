from flask import Blueprint, render_template, request, jsonify
from app.services.claude_client import analyze_ats

ats_bp = Blueprint('ats', __name__)

@ats_bp.route('/ats')
def ats():
    return render_template('ats.html')

@ats_bp.route('/ats/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    jd_text = data.get('jd_text', '').strip()
    resume_text = data.get('resume_text', '').strip()

    if not jd_text or not resume_text:
        return jsonify({"error": "Both JD and resume text are required."}), 400

    if len(jd_text) < 50:
        return jsonify({"error": "JD seems too short. Paste the full description."}), 400

    if len(resume_text) < 50:
        return jsonify({"error": "Resume text seems too short."}), 400

    try:
        result = analyze_ats(jd_text, resume_text)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500