import os
from flask import Blueprint, request, jsonify
from supabase import create_client

admin_bp = Blueprint('admin', __name__)

def _admin_client():
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_KEY')
    if not url or not key:
        raise RuntimeError('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env')
    return create_client(url, key)


@admin_bp.route('/auth/signup', methods=['POST'])
def signup_user():
    data     = request.get_json()
    email    = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name     = data.get('name', '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    try:
        sb = _admin_client()
        from supabase_auth import AdminUserAttributes
        res = sb.auth.admin.create_user(AdminUserAttributes(
            email=email,
            password=password,
            email_confirm=True,
            user_metadata={'name': name},
        ))
        return jsonify({'id': res.user.id})
    except Exception as e:
        error_msg = str(e)
        if 'already' in error_msg.lower() or 'exists' in error_msg.lower():
            return jsonify({'error': 'already_exists'}), 409
        return jsonify({'error': error_msg}), 500


@admin_bp.route('/admin/invite', methods=['POST'])
def invite_user():
    data  = request.get_json()
    email = data.get('email', '').strip().lower()
    name  = data.get('name', '').strip()

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    try:
        sb = _admin_client()
        sb.auth.admin.invite_user_by_email(email, {'data': {'name': name}})
        return jsonify({'ok': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/admin/users', methods=['GET'])
def list_users():
    try:
        sb = _admin_client()
        response = sb.auth.admin.list_users()
        users = [
            {
                'id':             u.id,
                'email':          u.email,
                'created_at':     str(u.created_at),
                'last_sign_in_at': str(u.last_sign_in_at) if u.last_sign_in_at else None,
            }
            for u in response
        ]
        return jsonify(users)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@admin_bp.route('/admin/user/<user_id>', methods=['DELETE'])
def remove_user(user_id):
    try:
        sb = _admin_client()
        sb.auth.admin.delete_user(user_id)
        sb.table('profiles').delete().eq('id', user_id).execute()
        return jsonify({'ok': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
