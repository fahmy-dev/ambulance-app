from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import ForeignKey, Enum, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum

db = SQLAlchemy()

# Association table for many-to-many between Driver and Ambulance
driver_ambulance = db.Table('driver_ambulance_assignments',
    db.Column('driver_id', db.Integer, db.ForeignKey('driver.id'), primary_key=True),
    db.Column('ambulance_id', db.Integer, db.ForeignKey('ambulance.id'), primary_key=True),
)

# Enum for status of AmbulanceRequest

class User(db.Model, SerializerMixin):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)

    requests = db.relationship('AmbulanceRequest', back_populates='patient')
    ride_histories = db.relationship('RideHistory', back_populates='patient')


    def __repr__(self):
        return f"<User {self.name}>"


class Driver(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    contact = db.Column(db.String(100), unique=True, nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    license_number = db.Column(db.String(50))

    ride_histories = db.relationship('RideHistory', back_populates='driver')
    ambulances = db.relationship('Ambulance', secondary=driver_ambulance, back_populates='drivers')

    def __repr__(self):
        return f"<Driver {self.name}>"


class Hospital(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    location_lat = db.Column(db.Float)
    location_lng = db.Column(db.Float)
    availability = db.Column(db.Boolean, default=True)
    contact_info = db.Column(db.String(100))

    ambulances = db.relationship('Ambulance', back_populates='hospital')
    requests = db.relationship('AmbulanceRequest', back_populates='hospital')
    ride_histories = db.relationship('RideHistory', back_populates='hospital')

    def __repr__(self):
        return f"<Hospital {self.name}>"


class Ambulance(db.Model, SerializerMixin):
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

    def __repr__(self):
        return f"<Ambulance {self.vehicle_no}>"

class AmbulanceRequest(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    hospital_id = db.Column(db.Integer, db.ForeignKey('hospital.id'), nullable=False)
    ambulance_id = db.Column(db.Integer, db.ForeignKey('ambulance.id'), nullable=True)

    patient_location_lat = db.Column(db.Float)
    patient_location_lng = db.Column(db.Float)

    payment_method = db.Column(db.String(20))
    estimated_cost = db.Column(db.Float)
    status = db.Column(db.String(100))

    patient = db.relationship('User', back_populates='requests')
    hospital = db.relationship('Hospital', back_populates='requests')
    ambulance = db.relationship('Ambulance', back_populates='requests')
    ride_history = db.relationship('RideHistory', uselist=False, back_populates='request')

    def __repr__(self):
        return f"<Request {self.id} - Status: {self.status}>"


class RideHistory(db.Model, SerializerMixin):
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('ambulance_request.id'), nullable=False, unique=True)
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

    def __repr__(self):
        return f"<RideHistory RequestID {self.request_id}>"
