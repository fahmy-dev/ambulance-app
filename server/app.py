from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, Driver, Hospital, Ambulance, AmbulanceRequest, RideHistory
from flask_migrate import Migrate
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI']= 'sqlite:///ambulance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS']= False

CORS(app)
db.init_app(app)
migrate= Migrate(app, db)


@app.route('/')
def index():
    return {"message": "Ambulance API is running!"}


# --------------------- USER ROUTES ---------------------

@app.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    user = User(
        name=data['name'],
        email=data['email'],
        location_lat=data.get('location_lat'),
        location_lng=data.get('location_lng')
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])


# --------------------- HOSPITAL ROUTES ---------------------

@app.route('/hospitals', methods=['POST'])
def create_hospital():
    data = request.get_json()
    hospital = Hospital(
        name=data['name'],
        location_lat=data.get('location_lat'),
        location_lng=data.get('location_lng'),
        availability=data.get('availability', True),
        contact_info=data.get('contact_info')
    )
    db.session.add(hospital)
    db.session.commit()
    return jsonify(hospital.to_dict()), 201

@app.route('/hospitals', methods=['GET'])
def get_hospitals():
    hospitals = Hospital.query.all()
    return jsonify([h.to_dict() for h in hospitals])

@app.route('/hospitals/<int:id>', methods=['PATCH'])
def update_hospital(id):
    hospital = Hospital.query.get_or_404(id)
    data = request.get_json()
    for key in data:
        setattr(hospital, key, data[key])
    db.session.commit()
    return jsonify(hospital.to_dict())

@app.route('/hospitals/<int:id>', methods=['DELETE'])
def delete_hospital(id):
    hospital = Hospital.query.get_or_404(id)
    db.session.delete(hospital)
    db.session.commit()
    return {"message": "Hospital deleted"}


# --------------------- DRIVER ROUTES ---------------------

@app.route('/drivers', methods=['POST'])
def create_driver():
    data = request.get_json()
    driver = Driver(
        name=data['name'],
        contact=data['contact'],
        license_number=data.get('license_number'),
        is_available=data.get('is_available', True)
    )
    db.session.add(driver)
    db.session.commit()
    return jsonify(driver.to_dict()), 201

@app.route('/drivers', methods=['GET'])
def get_drivers():
    drivers = Driver.query.all()
    return jsonify([d.to_dict() for d in drivers])

@app.route('/drivers/<int:id>', methods=['PATCH'])
def update_driver(id):
    driver = Driver.query.get_or_404(id)
    data = request.get_json()
    for key in data:
        setattr(driver, key, data[key])
    db.session.commit()
    return jsonify(driver.to_dict())

@app.route('/drivers/<int:id>', methods=['DELETE'])
def delete_driver(id):
    driver = Driver.query.get_or_404(id)
    db.session.delete(driver)
    db.session.commit()
    return {"message": "Driver deleted"}


# --------------------- AMBULANCE ROUTES ---------------------

@app.route('/ambulances', methods=['POST'])
def create_ambulance():
    data = request.get_json()
    ambulance = Ambulance(
        vehicle_no=data['vehicle_no'],
        is_available=data.get('is_available', True),
        location_lat=data.get('location_lat'),
        location_lng=data.get('location_lng'),
        hospital_id=data['hospital_id']
    )
    db.session.add(ambulance)
    db.session.commit()
    return jsonify(ambulance.to_dict()), 201

@app.route('/ambulances', methods=['GET'])
def get_ambulances():
    ambulances = Ambulance.query.all()
    return jsonify([a.to_dict() for a in ambulances])


# --------------------- AMBULANCE REQUEST ROUTES ---------------------

@app.route('/requests', methods=['POST'])
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
    db.session.add(request_obj)
    db.session.commit()
    return jsonify(request_obj.to_dict()), 201

@app.route('/requests', methods=['GET'])
def get_requests():
    requests = AmbulanceRequest.query.all()
    return jsonify([r.to_dict() for r in requests])

@app.route('/requests/<int:id>', methods=['PATCH'])
def update_request(id):
    req = AmbulanceRequest.query.get_or_404(id)
    data = request.get_json()
    for key in data:
        setattr(req, key, data[key])
    db.session.commit()
    return jsonify(req.to_dict())

@app.route('/requests/<int:id>', methods=['DELETE'])
def delete_request(id):
    req = AmbulanceRequest.query.get_or_404(id)
    db.session.delete(req)
    db.session.commit()
    return {"message": "Request deleted"}


# --------------------- RIDE HISTORY ROUTES ---------------------

@app.route('/ride_history', methods=['POST'])
def create_ride_history():
    data = request.get_json()
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

@app.route('/ride_history', methods=['GET'])
def get_ride_histories():
    rides = RideHistory.query.all()
    return jsonify([r.to_dict() for r in rides])


# --------------------- DB INIT ---------------------

@app.cli.command('create')
def create_db():
    db.create_all()
    print("Database tables created.")




if __name__ == '__main__':
    app.run(port=5555, debug=True)