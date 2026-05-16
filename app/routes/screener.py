from flask import Blueprint, render_template, request, jsonify
from app.services.claude_client import analyze_job_fit, check_visa_sponsorship

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


@screener_bp.route('/screener/visa-check', methods=['POST'])
def visa_check():
    """
    Live H1B sponsorship lookup.
    Hits h1bdata.info directly then falls back to DuckDuckGo.
    Returns petition count, recent year, and a clear verdict.
    """
    data = request.get_json()
    company_name = (data.get('company_name') or '').strip()

    if not company_name:
        return jsonify({'error': 'company_name is required'}), 400

    try:
        result = check_visa_sponsorship(company_name)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f'Visa check failed: {str(e)}'}), 500