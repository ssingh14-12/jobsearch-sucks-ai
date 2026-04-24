from flask import Blueprint, render_template, request, jsonify
from app.services.claude_client import analyze_job_fit

screener_bp = Blueprint('screener', __name__)

@screener_bp.route('/screener')
def screener():
    return render_template('screener.html')

@screener_bp.route('/screener/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    jd_text = data.get('jd_text', '').strip()
    company_name = data.get('company_name', 'Unknown Company').strip()

    if not jd_text:
        return jsonify({"error": "Paste a job description first."}), 400

    if len(jd_text) < 50:
        return jsonify({"error": "JD is too short. Paste the full job description."}), 400

    try:
        result = analyze_job_fit(jd_text, company_name)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500