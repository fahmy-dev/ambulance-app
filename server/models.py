from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @validates('email')
    def validate_email(self, key, email):
        if '@' not in email:
            raise ValueError('Invalid email address')
        return email

class Ambulance(db.Model):
    __tablename__ = 'ambulances'

    id = db.Column(db.Integer, primary_key=True)
    vehicle_number = db.Column(db.String(20), unique=True, nullable=False)
    status = db.Column(db.String(20), default='available')
    location = db.Column(db.String(200))
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

class Request(db.Model):
    __tablename__ = 'requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    ambulance_id = db.Column(db.Integer, db.ForeignKey('ambulances.id'))
    status = db.Column(db.String(20), default='pending')
    pickup_location = db.Column(db.String(200), nullable=False)
    destination = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('requests', lazy=True))
    ambulance = db.relationship('Ambulance', backref=db.backref('requests', lazy=True))