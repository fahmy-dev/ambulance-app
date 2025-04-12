from flask_sqlalchemy import SQLAlchemy
from flask import Flask
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import ForeignKey, Enum, Table, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Enum for Ride Status
class RideStatusEnum(PyEnum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"

# User Model
class User(db.Model, SerializerMixin):
    __tablename__ = 'user'

    serialize_rules = ('-ride_histories.user', '-favorites.user',)

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    ride_histories = db.relationship('RideHistory', back_populates='user')
    favorites = db.relationship('Favorite', back_populates='user')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email
        }

# Ride History Model (Updated)
class RideHistory(db.Model, SerializerMixin):
    serialize_rules = ('-user.ride_histories',)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    hospital_name = db.Column(db.String(100), nullable=False)
    payment_method = db.Column(db.String(20))
    status = db.Column(db.Enum(RideStatusEnum), default=RideStatusEnum.PENDING)


    user = db.relationship('User', back_populates='ride_histories')

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "hospital_name": self.hospital_name,
            "payment_method": self.payment_method,
            "status": self.status.name,
        }

# Contact Us Model
class ContactUs(db.Model, SerializerMixin):
    __tablename__ = 'contact_us'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    phone_number = db.Column(db.String(20))
    message = db.Column(db.Text, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone_number": self.phone_number,
            "message": self.message
        }

# Favorites Model (Separate Table)
class Favorite(db.Model, SerializerMixin):
    __tablename__ = 'favorites'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    hospital_name = db.Column(db.String(100), nullable=False)

    __table_args__ = (UniqueConstraint('user_id', 'hospital_name', name='_user_hospital_uc'),)  # Prevent duplicate favorites

    user = db.relationship('User', back_populates='favorites')

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "hospital_name": self.hospital_name
        }
