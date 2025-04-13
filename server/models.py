from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum

db = SQLAlchemy()

# Association table for many-to-many between Driver and Ambulance
driver_ambulance = db.Table('driver_ambulance_assignments',
    db.Column('driver_id', db.Integer, db.ForeignKey('driver.id'), primary_key=True),
    db.Column('ambulance_id', db.Integer, db.ForeignKey('ambulance.id'), primary_key=True),
)

# Enum definition for Request Status
class RequestStatusEnum(PyEnum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

class User(db.Model, SerializerMixin):
    __tablename__ = 'user'
    
    serialize_rules = ('-requests.patient', '-ride_histories.patient',)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)
    password = db.Column(db.String(200), nullable=False)
    
    requests = db.relationship('AmbulanceRequest', back_populates='patient')
    ride_histories = db.relationship('RideHistory', back_populates='patient')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "location_lat": self.location_lat,
            "location_lng": self.location_lng
        }

class Driver(db.Model, SerializerMixin):
    serialize_rules = ('-ride_histories.driver', '-ambulances.drivers',)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(100), unique=True, nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    license_number = db.Column(db.String(50))

    ride_histories = db.relationship('RideHistory', back_populates='driver')
    ambulances = db.relationship('Ambulance', secondary=driver_ambulance, back_populates='drivers')

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "contact": self.contact,
            "is_available": self.is_available,
            "license_number": self.license_number
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
    serialize_rules = ('-hospital.ambulances', '-requests.ambulance', '-ride_histories.ambulance', '-drivers.ambulances',)

    id = db.Column(db.Integer, primary_key=True)
    vehicle_no = db.Column(db.String(100), nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)

    hospital_id = db.Column(db.Integer, db.ForeignKey('hospital.id'), nullable=False)

    hospital = db.relationship('Hospital', back_populates='ambulances')
    requests = db.relationship('AmbulanceRequest', back_populates='ambulance')
    ride_histories = db.relationship('RideHistory', back_populates='ambulance')
    drivers = db.relationship('Driver', secondary=driver_ambulance, back_populates='ambulances')


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
    serialize_rules = ('-patient.ride_histories', '-hospital.ride_histories', '-ambulance.ride_histories', '-driver.ride_histories', '-request.ride_history',)

    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('ambulance_request.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospital.id'), nullable=False)
    ambulance_id = db.Column(db.Integer, db.ForeignKey('ambulance.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('driver.id'), nullable=True)

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
    driver = db.relationship('Driver', back_populates='ride_histories')

    def to_dict(self):
        return {
            "id": self.id,
            "request_id": self.request_id,
            "patient_id": self.patient_id,
            "hospital_id": self.hospital_id,
            "ambulance_id": self.ambulance_id,
            "driver_id": self.driver_id,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "total_duration": self.total_duration,
            "total_cost": self.total_cost,
            "payment_method": self.payment_method,
            "rating": self.rating,
            "feedback": self.feedback
        }