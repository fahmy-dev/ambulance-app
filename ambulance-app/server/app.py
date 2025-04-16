from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, Driver, Hospital, Ambulance, AmbulanceRequest, RideHistory
from flask_migrate import Migrate
from datetime import datetime
from functools import wraps

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///ambulance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)
db.init_app(app)
migrate = Migrate(app, db)

# Validation decorator
def validate_json(required_fields=None, optional_fields=None):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            data = request.get_json()

            # Check for missing required fields
            if required_fields:
                for field in required_fields:
                    if field not in data:
                        return jsonify({"error": f"Missing required field: {field}"}), 400

            # Optionally, check if optional fields are empty
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

    # Check if the user already exists
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
    search_query = request.args.get('search', '', type=str)
    lat_filter = request.args.get('lat', None, type=float)
    lng_filter = request.args.get('lng', None, type=float)
    
    query = User.query
    
    if search_query:
        query = query.filter(User.name.contains(search_query))
    
    if lat_filter and lng_filter:
        query = query.filter(User.location_lat == lat_filter, User.location_lng == lng_filter)
    
    users = query.all()
    
    # Error handling: If no users are found
    if not users:
        return jsonify({"error": "No users found matching the search criteria"}), 404
    
    return jsonify([u.to_dict() for u in users])


# --------------------- HOSPITAL ROUTES ---------------------

@app.route('/hospitals', methods=['POST'])
@validate_json(required_fields=['name', 'location_lat', 'location_lng'])
def create_hospital():
    data = request.get_json()

    # Check if the hospital already exists
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
    search_query = request.args.get('search', '', type=str)
    lat_filter = request.args.get('lat', None, type=float)
    lng_filter = request.args.get('lng', None, type=float)
    
    query = Hospital.query
    
    if search_query:
        query = query.filter(Hospital.name.contains(search_query))
    
    if lat_filter and lng_filter:
        query = query.filter(Hospital.location_lat == lat_filter, Hospital.location_lng == lng_filter)
    
    hospitals = query.all()
    
    # Error handling: If no hospitals are found
    if not hospitals:
        return jsonify({"error": "No hospitals found matching the search criteria"}), 404
    
    return jsonify([h.to_dict() for h in hospitals])


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

    # Check if the driver already exists
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
    search_query = request.args.get('search', '', type=str)
    availability_filter = request.args.get('is_available', None, type=bool)
    
    query = Driver.query
    
    if search_query:
        query = query.filter(Driver.name.contains(search_query))
    
    if availability_filter is not None:
        query = query.filter(Driver.is_available == availability_filter)
    
    drivers = query.all()
    
    # Error handling: If no drivers are found
    if not drivers:
        return jsonify({"error": "No drivers found matching the search criteria"}), 404
    
    return jsonify([d.to_dict() for d in drivers])


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

    # Ensure the hospital exists
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
    search_query = request.args.get('search', '', type=str)
    is_available_filter = request.args.get('is_available', None, type=bool)
    hospital_filter = request.args.get('hospital_id', None, type=int)
    
    query = Ambulance.query
    
    if search_query:
        query = query.filter(Ambulance.vehicle_no.contains(search_query))
    
    if is_available_filter is not None:
        query = query.filter(Ambulance.is_available == is_available_filter)
    
    if hospital_filter:
        query = query.filter(Ambulance.hospital_id == hospital_filter)
    
    ambulances = query.all()
    
    # Error handling: If no ambulances are found
    if not ambulances:
        return jsonify({"error": "No ambulances found matching the search criteria"}), 404
    
    return jsonify([a.to_dict() for a in ambulances])

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
    search_query = request.args.get('search', '', type=str)
    status_filter = request.args.get('status', None, type=str)
    
    query = AmbulanceRequest.query
    
    if search_query:
        query = query.filter(AmbulanceRequest.patient.has(User.name.contains(search_query)))
    
    if status_filter:
        query = query.filter(AmbulanceRequest.status == status_filter)
    
    requests = query.all()
    
    # Error handling: If no requests are found
    if not requests:
        return jsonify({"error": "No requests found matching the search criteria"}), 404
    
    return jsonify([r.to_dict() for r in requests])


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
        db.session.commit()
        return jsonify(ride.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/ride_history', methods=['GET'])
def get_ride_histories():
    search_query = request.args.get('search', '', type=str)
    start_time_filter = request.args.get('start_time', None, type=str)
    end_time_filter = request.args.get('end_time', None, type=str)
    patient_filter = request.args.get('patient_id', None, type=int)
    hospital_filter = request.args.get('hospital_id', None, type=int)
    status_filter = request.args.get('status', None, type=str)
    
    query = RideHistory.query
    
    # Search by request_id or patient_id or feedback
    if search_query:
        query = query.filter(
            (RideHistory.request_id.like(f"%{search_query}%")) |
            (RideHistory.patient_id.like(f"%{search_query}%")) |
            (RideHistory.feedback.like(f"%{search_query}%"))
        )
    
    # Filter by start_time
    if start_time_filter:
        try:
            start_time = datetime.strptime(start_time_filter, '%Y-%m-%d %H:%M:%S')
            query = query.filter(RideHistory.start_time >= start_time)
        except ValueError:
            return jsonify({"error": "Invalid start_time format. Please use YYYY-MM-DD HH:MM:SS"}), 400
    
    # Filter by end_time
    if end_time_filter:
        try:
            end_time = datetime.strptime(end_time_filter, '%Y-%m-%d %H:%M:%S')
            query = query.filter(RideHistory.end_time <= end_time)
        except ValueError:
            return jsonify({"error": "Invalid end_time format. Please use YYYY-MM-DD HH:MM:SS"}), 400
    
    # Filter by patient_id
    if patient_filter:
        query = query.filter(RideHistory.patient_id == patient_filter)
    
    # Filter by hospital_id
    if hospital_filter:
        query = query.filter(RideHistory.hospital_id == hospital_filter)
    
    # Filter by ride status (if available)
    if status_filter:
        query = query.filter(RideHistory.status == status_filter)
    
    # Get the filtered ride histories
    ride_histories = query.all()
    
    # Error handling: If no ride histories are found
    if not ride_histories:
        return jsonify({"error": "No ride histories found matching the search criteria"}), 404
    
    return jsonify([r.to_dict() for r in ride_histories])



if __name__ == '__main__':
    app.run(port=5555, debug=True)
