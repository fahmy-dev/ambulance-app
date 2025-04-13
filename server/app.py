from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, RideHistory, ContactUs, Favorite, RideStatusEnum
from flask_migrate import Migrate
from datetime import timedelta, datetime
from functools import wraps
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
import sqlalchemy
from sqlalchemy.exc import IntegrityError
import os
from flask import send_from_directory

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ambulance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Configure CORS to allow requests from your React app
CORS(app, resources={
    r"/*": {
        "origins": "*",  # Allow all origins temporarily for debugging
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True
    }
})

# Use a fixed secret key for development
app.config['JWT_SECRET_KEY'] = 'dev-secret-key'  # Replace with a secure key in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)
db.init_app(app)
migrate = Migrate(app, db)

# Add this to create tables if they don't exist
with app.app_context():
    db.create_all()

# ---------------- VALIDATION DECORATOR ----------------
def validate_json(required_fields=None, optional_fields=None):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            data = request.get_json()

            if required_fields:
                for field in required_fields:
                    if field not in data:
                        return jsonify({"error": f"Missing required field: {field}"}), 400

            if optional_fields:
                for field in optional_fields:
                    if field in data and data[field] == "":
                        return jsonify({"error": f"Field '{field}' cannot be empty"}), 400

            # Validate 'status' for RideHistory
            if 'status' in data and data['status'] not in [status.name for status in RideStatusEnum]:
                return jsonify({"error": f"Invalid status value: {data['status']}"}), 400

            return f(*args, **kwargs)
        return wrapped
    return decorator

# ---------------- GENERAL ERROR HANDLING ----------------
@app.errorhandler(Exception)
def handle_general_error(error):
    # Specific error handling for database-related issues
    if isinstance(error, sqlalchemy.exc.SQLAlchemyError):
        return jsonify({"error": "Database error", "details": str(error)}), 500
    return jsonify({"error": "An unexpected error occurred", "details": str(error)}), 500

# Remove this route as it conflicts with the frontend serving route
# @app.route('/')
# def index():
#     return {"message": "Ambulance API is running!"}

# --------------------- USER ROUTES ---------------------
@app.route('/users', methods=['POST'])
@validate_json(required_fields=['name', 'email', 'password'])
def create_user():
    data = request.get_json()
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"error": "Email already in use"}), 400

    user = User(
        name=data['name'],
        email=data['email']
    )
    user.set_password(data['password'])

    try:
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/user', methods=['GET'])
@jwt_required()
def get_users():
    search_query = request.args.get('search', '', type=str)
    
    query = User.query
    
    if search_query:
        query = query.filter(User.name.contains(search_query))
    
    users = query.all()
    
    if not users:
        return jsonify({"error": "No users found matching the search criteria"}), 404
    
    return jsonify([u.to_dict() for u in users])

# --------------------- AUTH ROUTES ---------------------
@app.route('/login', methods=['POST'])
@validate_json(required_fields=['email', 'password'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({"error": "Invalid email or password"}), 401
    
    # Create access token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        "access_token": access_token,
        "user": user.to_dict()
    }), 200

@app.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify(user.to_dict()), 200

@app.route('/signup', methods=['POST'])
@validate_json(required_fields=['name', 'email', 'password'])
def signup():
    data = request.get_json()
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"error": "Email already in use"}), 400
    
    # Create new user
    user = User(
        name=data['name'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    try:
        db.session.add(user)
        db.session.commit()
        
        # Create access token for the new user
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            "access_token": access_token,
            "user": user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --------------------- RIDE HISTORY ROUTES ---------------------
@app.route('/ride_history', methods=['POST'])
@jwt_required()
@validate_json(required_fields=['hospital_name', 'payment', 'status'])
def create_ride_history():
    data = request.get_json()
    user_id = get_jwt_identity()

    ride_history = RideHistory(
        user_id=user_id,
        hospital_name=data['hospital_name'],
        payment_method=data['payment'],
        status=data['status']
    )
    
    try:
        db.session.add(ride_history)
        db.session.commit()
        return jsonify(ride_history.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/ride_history', methods=['GET'])
@jwt_required()
def get_ride_history():
    user_id = get_jwt_identity()
    history = RideHistory.query.filter_by(user_id=user_id).all()

    # Return empty array instead of error when no history found
    return jsonify([h.to_dict() for h in history])

# --------------------- FAVORITES ROUTES ---------------------

# Add a hospital to favorites
@app.route('/favorites', methods=['POST'])
@jwt_required()
@validate_json(required_fields=['hospital_name'])
def add_favorite():
    data = request.get_json()
    user_id = get_jwt_identity()

    # Check if the hospital is already in the favorites
    existing_favorite = Favorite.query.filter_by(user_id=user_id, hospital_name=data['hospital_name']).first()
    if existing_favorite:
        return jsonify({"error": "Hospital already in favorites"}), 400

    favorite = Favorite(
        user_id=user_id,
        hospital_name=data['hospital_name']
    )
    
    try:
        db.session.add(favorite)
        db.session.commit()
        return jsonify(favorite.to_dict()), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Database integrity error, could not add favorite"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Get all favorites for the logged-in user
@app.route('/favorites', methods=['GET'])
@jwt_required()
def get_favorites():
    user_id = get_jwt_identity()
    favorites = Favorite.query.filter_by(user_id=user_id).all()

    # Return empty array instead of error when no favorites found
    return jsonify([f.to_dict() for f in favorites])

# Remove a hospital from favorites
@app.route('/favorites', methods=['DELETE'])
@jwt_required()
@validate_json(required_fields=['hospital_name'])
def remove_favorite():
    data = request.get_json()
    user_id = get_jwt_identity()

    # Find the favorite to be removed
    favorite_to_remove = Favorite.query.filter_by(
        user_id=user_id, 
        hospital_name=data['hospital_name']
    ).first()

    if not favorite_to_remove:
        return jsonify({"error": "Hospital not found in favorites"}), 404

    try:
        db.session.delete(favorite_to_remove)
        db.session.commit()
        return jsonify({"message": "Favorite hospital removed successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# --------------------- CONTACT US ROUTES ---------------------
@app.route('/contact_us', methods=['POST'])
@validate_json(required_fields=['name', 'email', 'message'])
def contact_us():
    data = request.get_json()

    contact_message = ContactUs(
        name=data['name'],
        email=data['email'],
        phone_number=data['phone_number'],
        message=data['message']  
    )
    
    try:
        db.session.add(contact_message)
        db.session.commit()
        return jsonify(contact_message.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/contact_us', methods=['GET'])
def get_contact_messages():
    contact_messages = ContactUs.query.all()

    # Return empty array instead of error when no contact messages found
    return jsonify([c.to_dict() for c in contact_messages])

# Add this new route to handle ambulance requests
@app.route('/request-ambulance', methods=['POST'])
@jwt_required()
@validate_json(required_fields=['hospital_name', 'payment_method'])
def request_ambulance():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    # Create a new ride history entry
    ride_history = RideHistory(
        user_id=user_id,
        hospital_name=data['hospital_name'],
        payment_method=data['payment_method']
    )
    
    try:
        db.session.add(ride_history)
        db.session.commit()
        return jsonify(ride_history.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# Update the app.run configuration
@app.route('/')
def serve():
    return send_from_directory('../client/dist', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if path != "" and os.path.exists("../client/dist/" + path):
        return send_from_directory('../client/dist', path)
    else:
        return send_from_directory('../client/dist', 'index.html')

# Keep this at the bottom of the file
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
    # Remove the second app.run call
    # app.run(debug=True)
