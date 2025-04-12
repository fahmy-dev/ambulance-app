from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


# Enum definition for Request Status
class RequestStatusEnum(PyEnum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


# Association table to link users and their favorite hospitals
favorites = db.Table('favorites',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('hospital_id', db.Integer, db.ForeignKey('hospital.id'), primary_key=True)
)


class User(db.Model, SerializerMixin):
    __tablename__ = 'user'

    serialize_rules = ('-requests.patient', '-ride_histories.patient',)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)  # Store hashed password
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)

    requests = db.relationship('AmbulanceRequest', back_populates='patient')
    ride_histories = db.relationship('RideHistory', back_populates='patient')

    # Many-to-many relationship for favorites
    favorite_hospitals = db.relationship('Hospital', secondary=favorites, back_populates='favorited_by')

    def set_password(self, password):
        """Hash and set password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Check hashed password."""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "location_lat": self.location_lat,
            "location_lng": self.location_lng
        }


class Hospital(db.Model, SerializerMixin):
    serialize_rules = ('-ambulances.hospital', '-requests.hospital', '-ride_histories.hospital',)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)
    availability = db.Column(db.Boolean, default=True)
    contact_info = db.Column(db.String(100))

    ambulances = db.relationship('Ambulance', back_populates='hospital')
    requests = db.relationship('AmbulanceRequest', back_populates='hospital')
    ride_histories = db.relationship('RideHistory', back_populates='hospital')

    # Many-to-many relationship for favorites
    favorited_by = db.relationship('User', secondary=favorites, back_populates='favorite_hospitals')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location_lat": self.location_lat,
            "location_lng": self.location_lng,
            "availability": self.availability,
            "contact_info": self.contact_info
        }


class Ambulance(db.Model, SerializerMixin):
    serialize_rules = ('-hospital.ambulances', '-requests.ambulance', '-ride_histories.ambulance')

    id = db.Column(db.Integer, primary_key=True)
    vehicle_no = db.Column(db.String(100), nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)

    hospital_id = db.Column(db.Integer, db.ForeignKey('hospital.id'), nullable=False)

    hospital = db.relationship('Hospital', back_populates='ambulances')
    requests = db.relationship('AmbulanceRequest', back_populates='ambulance')
    ride_histories = db.relationship('RideHistory', back_populates='ambulance')

    def to_dict(self):
        return {
            "id": self.id,
            "vehicle_no": self.vehicle_no,
            "is_available": self.is_available,
            "location_lat": self.location_lat,
            "location_lng": self.location_lng,
            "hospital_id": self.hospital_id
        }


class AmbulanceRequest(db.Model, SerializerMixin):
    serialize_rules = ('-patient.requests', '-hospital.requests', '-ambulance.requests', '-ride_history.request',)

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospital.id'), nullable=False)
    ambulance_id = db.Column(db.Integer, db.ForeignKey('ambulance.id'), nullable=True)

    patient_location_lat = db.Column(db.Float)
    patient_location_lng = db.Column(db.Float)

    payment_method = db.Column(db.String(20))
    estimated_cost = db.Column(db.Float)
    status = db.Column(db.Enum(RequestStatusEnum), default=RequestStatusEnum.PENDING)

    patient = db.relationship('User', back_populates='requests')
    hospital = db.relationship('Hospital', back_populates='requests')
    ambulance = db.relationship('Ambulance', back_populates='requests')
    ride_history = db.relationship('RideHistory', uselist=False, back_populates='request')

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "hospital_id": self.hospital_id,
            "ambulance_id": self.ambulance_id,
            "patient_location_lat": self.patient_location_lat,
            "patient_location_lng": self.patient_location_lng,
            "payment_method": self.payment_method,
            "estimated_cost": self.estimated_cost,
            "status": self.status.name
        }


class RideHistory(db.Model, SerializerMixin):
    serialize_rules = ('-patient.ride_histories', '-hospital.ride_histories', '-ambulance.ride_histories', '-request.ride_history',)

    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('ambulance_request.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospital.id'), nullable=False)
    ambulance_id = db.Column(db.Integer, db.ForeignKey('ambulance.id'), nullable=False)

    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    total_duration = db.Column(db.String(50))
    total_cost = db.Column(db.Float)
    payment_method = db.Column(db.String(20))

    rating = db.Column(db.Integer)
    feedback = db.Column(db.String(250))

    request = db.relationship('AmbulanceRequest', back_populates='ride_history')
    patient = db.relationship('User', back_populates='ride_histories')
    hospital = db.relationship('Hospital', back_populates='ride_histories')
    ambulance = db.relationship('Ambulance', back_populates='ride_histories')

    def to_dict(self):
        return {
            "id": self.id,
            "request_id": self.request_id,
            "patient_id": self.patient_id,
            "hospital_id": self.hospital_id,
            "ambulance_id": self.ambulance_id,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "total_duration": self.total_duration,
            "total_cost": self.total_cost,
            "payment_method": self.payment_method,
            "rating": self.rating,
            "feedback": self.feedback
        }


