import os 
from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, Driver, Hospital, Ambulance, AmbulanceRequest, RideHistory
from flask_migrate import Migrate
from datetime import datetime
from functools import wraps
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ambulance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.urandom(24) # use a secure key in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
jwt = JWTManager(app)

CORS(app)
db.init_app(app)
migrate = Migrate(app, db)

# Validation decorator
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

            return f(*args, **kwargs)
        return wrapped
    return decorator

# General error handling
@app.errorhandler(Exception)
def handle_general_error(error):
    return jsonify({"error": "An unexpected error occurred", "details": str(error)}), 500

@app.route('/')
def index():
    return {"message": "Ambulance API is running!"}

# --------------------- USER ROUTES ---------------------
@app.route('/users', methods=['POST'])
@validate_json(required_fields=['name', 'email'])
def create_user():
    data = request.get_json()
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"error": "Email already in use"}), 400

    user = User(
        name=data['name'],
        email=data['email'],
        location_lat=data.get('location_lat'),
        location_lng=data.get('location_lng')
    )
    try:
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        return jsonify([u.to_dict() for u in users])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --------------------- HOSPITAL ROUTES ---------------------
@app.route('/hospitals', methods=['POST'])
@validate_json(required_fields=['name', 'location_lat', 'location_lng'])
def create_hospital():
    data = request.get_json()
    existing_hospital = Hospital.query.filter_by(name=data['name']).first()
    if existing_hospital:
        return jsonify({"error": "Hospital already exists"}), 400

    hospital = Hospital(
        name=data['name'],
        location_lat=data['location_lat'],
        location_lng=data['location_lng'],
        availability=data.get('availability', True),
        contact_info=data.get('contact_info')
    )
    try:
        db.session.add(hospital)
        db.session.commit()
        return jsonify(hospital.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/hospitals', methods=['GET'])
def get_hospitals():
    try:
        hospitals = Hospital.query.all()
        return jsonify([h.to_dict() for h in hospitals])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/hospitals/<int:id>', methods=['PATCH'])
@validate_json(optional_fields=['location_lat', 'location_lng'])
def update_hospital(id):
    hospital = Hospital.query.get_or_404(id)
    data = request.get_json()
    for key in data:
        setattr(hospital, key, data[key])
    try:
        db.session.commit()
        return jsonify(hospital.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/hospitals/<int:id>', methods=['DELETE'])
def delete_hospital(id):
    hospital = Hospital.query.get_or_404(id)
    try:
        db.session.delete(hospital)
        db.session.commit()
        return {"message": "Hospital deleted"}
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --------------------- DRIVER ROUTES ---------------------
@app.route('/drivers', methods=['POST'])
@validate_json(required_fields=['name', 'contact'])
def create_driver():
    data = request.get_json()
    existing_driver = Driver.query.filter_by(contact=data['contact']).first()
    if existing_driver:
        return jsonify({"error": "Driver already exists with this contact"}), 400

    driver = Driver(
        name=data['name'],
        contact=data['contact'],
        license_number=data.get('license_number'),
        is_available=data.get('is_available', True)
    )
    try:
        db.session.add(driver)
        db.session.commit()
        return jsonify(driver.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/drivers', methods=['GET'])
def get_drivers():
    try:
        drivers = Driver.query.all()
        return jsonify([d.to_dict() for d in drivers])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/drivers/<int:id>', methods=['PATCH'])
@validate_json(optional_fields=['is_available'])
def update_driver(id):
    driver = Driver.query.get_or_404(id)
    data = request.get_json()
    for key in data:
        setattr(driver, key, data[key])
    try:
        db.session.commit()
        return jsonify(driver.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/drivers/<int:id>', methods=['DELETE'])
def delete_driver(id):
    driver = Driver.query.get_or_404(id)
    try:
        db.session.delete(driver)
        db.session.commit()
        return {"message": "Driver deleted"}
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# --------------------- AMBULANCE ROUTES ---------------------
@app.route('/ambulances', methods=['POST'])
@validate_json(required_fields=['vehicle_no', 'hospital_id'])
def create_ambulance():
    data = request.get_json()
    hospital = Hospital.query.get(data['hospital_id'])
    if not hospital:
        return jsonify({"error": "Hospital not found"}), 404

    ambulance = Ambulance(
        vehicle_no=data['vehicle_no'],
        is_available=data.get('is_available', True),
        location_lat=data.get('location_lat'),
        location_lng=data.get('location_lng'),
        hospital_id=data['hospital_id']
    )
    try:
        db.session.add(ambulance)
        db.session.commit()
        return jsonify(ambulance.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/ambulances', methods=['GET'])
def get_ambulances():
    try:
        ambulances = Ambulance.query.all()
        return jsonify([a.to_dict() for a in ambulances])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --------------------- AMBULANCE REQUEST ROUTES ---------------------
@app.route('/requests', methods=['POST'])
@validate_json(required_fields=['patient_id', 'hospital_id'])
def create_request():
    data = request.get_json()
    request_obj = AmbulanceRequest(
        patient_id=data['patient_id'],
        hospital_id=data['hospital_id'],
        ambulance_id=data.get('ambulance_id'),
        patient_location_lat=data.get('patient_location_lat'),
        patient_location_lng=data.get('patient_location_lng'),
        payment_method=data.get('payment_method'),
        estimated_cost=data.get('estimated_cost'),
        status=data.get('status', "Pending")
    )
    try:
        db.session.add(request_obj)
        db.session.commit()
        return jsonify(request_obj.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/requests', methods=['GET'])
def get_requests():
    try:
        requests = AmbulanceRequest.query.all()
        return jsonify([r.to_dict() for r in requests])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --------------------- RIDE HISTORY ROUTES ---------------------
@app.route('/ride_history', methods=['POST'])
@validate_json(required_fields=['request_id', 'patient_id', 'hospital_id'])
def create_ride_history():
    data = request.get_json()
    try:
        ride = RideHistory(
            request_id=data['request_id'],
            patient_id=data['patient_id'],
            hospital_id=data['hospital_id'],
            ambulance_id=data['ambulance_id'],
            driver_id=data.get('driver_id'),
            start_time=datetime.strptime(data['start_time'], '%Y-%m-%d %H:%M:%S'),
            end_time=datetime.strptime(data['end_time'], '%Y-%m-%d %H:%M:%S'),
            total_duration=data['total_duration'],
            total_cost=data['total_cost'],
            payment_method=data['payment_method'],
            rating=data.get('rating'),
            feedback=data.get('feedback')
        )
        db.session.add(ride)
        db.session.commit() #save them to db
        return jsonify(ride.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/ride_history', methods=['GET'])
def get_ride_histories():
    try:
        rides = RideHistory.query.all()
        return jsonify([r.to_dict() for r in rides])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
@validate_json(required_fields=['email'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if not user:
        return jsonify({"error": "Invalid email"}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({"access_token": access_token, "user": user.to_dict()}), 200

if __name__ == '__main__':
    app.run(port=5555, debug=True)
