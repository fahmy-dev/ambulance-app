from app import app, db
from models import User, Driver, Hospital, Ambulance, AmbulanceRequest, RideHistory
from datetime import datetime


with app.app_context():
    db.drop_all()
    db.create_all()

# Create some sample users, drivers, hospitals, and ambulances
def seed_data():
    # Creating Users (patients)
    user1 = User(name="John Doe", email="john.doe@example.com", location_lat=1.290270, location_lng=36.8219)
    user1.set_password("password123")  # Set password for user1
    
    user2 = User(name="Jane Smith", email="jane.smith@example.com", location_lat=1.3020, location_lng=36.8215)
    user2.set_password("password123")  # Set password for user2

    # Creating Drivers
    driver1 = Driver(name="Driver A", contact="1234567890", is_available=True, license_number="AB123CD")
    driver2 = Driver(name="Driver B", contact="0987654321", is_available=True, license_number="EF456GH")

    # Creating Hospitals
    hospital1 = Hospital(name="City Hospital", location_lat=1.295, location_lng=36.8100, availability=True, contact_info="city@hospital.com")
    hospital2 = Hospital(name="Central Clinic", location_lat=1.300, location_lng=36.8120, availability=True, contact_info="central@clinic.com")

    # Creating Ambulances
    ambulance1 = Ambulance(vehicle_no="AMB001", is_available=True, location_lat=1.2955, location_lng=36.8105, hospital=hospital1)
    ambulance2 = Ambulance(vehicle_no="AMB002", is_available=True, location_lat=1.3010, location_lng=36.8115, hospital=hospital2)

    # Adding data to the session
    db.session.add_all([user1, user2, driver1, driver2, hospital1, hospital2, ambulance1, ambulance2])
    db.session.commit()

    # Creating AmbulanceRequest
    request1 = AmbulanceRequest(patient_id=user1.id, hospital_id=hospital1.id, ambulance_id=ambulance1.id, 
                                patient_location_lat=1.290270, patient_location_lng=36.8219, payment_method="Cash", estimated_cost=500.0)
    request2 = AmbulanceRequest(patient_id=user2.id, hospital_id=hospital2.id, ambulance_id=ambulance2.id, 
                                patient_location_lat=1.3020, patient_location_lng=36.8215, payment_method="Insurance", estimated_cost=600.0, status="COMPLETED")

    db.session.add_all([request1, request2])
    db.session.commit()

    # Creating RideHistory
    ride1 = RideHistory(request_id=request1.id, patient_id=user1.id, hospital_id=hospital1.id, ambulance_id=ambulance1.id, 
                        driver_id=driver1.id, start_time=datetime.now(), end_time=datetime.now(), total_duration="30 minutes", total_cost=500.0, payment_method="Cash", rating=5, feedback="Good service")
    
    ride2 = RideHistory(request_id=request2.id, patient_id=user2.id, hospital_id=hospital2.id, ambulance_id=ambulance2.id, 
                        driver_id=driver2.id, start_time=datetime.now(), end_time=datetime.now(), total_duration="40 minutes", total_cost=600.0, payment_method="Insurance", rating=4, feedback="Satisfactory service")

    db.session.add_all([ride1, ride2])
    db.session.commit()

    print("Data seeded successfully!")

if __name__ == "__main__":
    with app.app_context():
        seed_data()
