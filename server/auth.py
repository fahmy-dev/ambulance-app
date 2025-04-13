from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

# ------------------ Register Route ------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Validate input
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    # Check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User with this email already exists'}), 409

    # Hash the password and create new user
    try:
        hashed_password = generate_password_hash(password, method='sha256')
        new_user = User(email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'An error occurred while registering the user'}), 500

# ------------------ Login Route ------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=1)
        )
        return jsonify({'access_token': access_token}), 200

    return jsonify({'error': 'Invalid email or password'}), 401

# ------------------ Protected Route ------------------
@auth_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    return jsonify({'logged_in_as': user_id}), 200

# ------------------ Logout Route (Client-side only) ------------------
@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # JWTs are stateless; logout is handled client-side by deleting the token
    return jsonify({'message': 'Successfully logged out'}), 200
