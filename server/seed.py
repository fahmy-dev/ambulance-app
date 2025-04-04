from app import app
from models import db, User, Ambulance, Request
from werkzeug.security import generate_password_hash

def seed_data():
    with app.app_context():
        print('Clearing existing data...')
        Request.query.delete()
        Ambulance.query.delete()
        User.query.delete()
        
        print('Creating users...')
        admin = User(
            username='admin',
            email='admin@example.com',
            password_hash=generate_password_hash('adminpass'),
            role='admin'
        )
        
        user1 = User(
            username='john_doe',
            email='john@example.com',
            password_hash=generate_password_hash('userpass'),
            role='user'
        )
        
        db.session.add_all([admin, user1])
        
        print('Creating ambulances...')
        ambulances = [
            Ambulance(vehicle_number='AMB-001', status='available', location='Hospital A'),
            Ambulance(vehicle_number='AMB-002', status='available', location='Hospital B'),
            Ambulance(vehicle_number='AMB-003', status='available', location='Hospital C')
        ]
        
        db.session.add_all(ambulances)
        
        print('Creating sample requests...')
        request1 = Request(
            user_id=2,
            ambulance_id=1,
            status='completed',
            pickup_location='123 Main St',
            destination='City Hospital'
        )
        
        db.session.add(request1)
        
        print('Committing to database...')
        db.session.commit()
        print('Seeding completed!')

if __name__ == '__main__':
    seed_data()