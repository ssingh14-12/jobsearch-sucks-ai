from flask import Blueprint, request, jsonify
from app.services.claude_client import generate_outreach_targets, generate_outreach_message, search_linkedin_people

outreach_bp = Blueprint('outreach', __name__)


@outreach_bp.route('/outreach/targets', methods=['POST'])
def get_targets():
    data = request.get_json()
    jd_text = data.get('jd_text', '').strip()
    company = data.get('company', '').strip()
    role = data.get('role', '').strip()

    if not jd_text:
        return jsonify({"error": "No JD provided"}), 400

    try:
        result = generate_outreach_targets(jd_text, company, role)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@outreach_bp.route('/outreach/people', methods=['POST'])
def find_people():
    data = request.get_json()
    company      = data.get('company', '').strip()
    role         = data.get('role', '').strip()
    target_type  = data.get('target_type', '').strip()
    target_label = data.get('target_label', '').strip()

    if not company:
        return jsonify({
            "people": [],
            "note": "Company name not detected from JD. Paste the JD again and make sure it includes the company name, or use the LinkedIn search string below."
        })

    try:
        result = search_linkedin_people(company, role, target_type, target_label)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@outreach_bp.route('/outreach/generate', methods=['POST'])
def generate():
    data = request.get_json()
    jd_text = data.get('jd_text', '').strip()
    company = data.get('company', '').strip()
    role = data.get('role', '').strip()
    target_type = data.get('target_type', '').strip()
    message_type = data.get('message_type', '').strip()
    recipient_name = data.get('recipient_name', '').strip()
    recipient_context = data.get('recipient_context', '').strip()

    if not jd_text or not target_type or not message_type:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        result = generate_outreach_message(
            jd_text, company, role, target_type, message_type,
            recipient_name, recipient_context
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
