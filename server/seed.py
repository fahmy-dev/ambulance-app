from app import app, db
from models import User, RideHistory, ContactUs, Favorite, RideStatusEnum
from werkzeug.security import generate_password_hash
from datetime import datetime

# Clear existing data from the tables
def clear_data():
    # Delete all entries from each table
    db.session.query(Favorite).delete()
    db.session.query(RideHistory).delete()
    db.session.query(ContactUs).delete()
    db.session.query(User).delete()
    db.session.commit()

def seed_data():
    # This is necessary to run the seed script
    with app.app_context():  # Ensures the app context is available for DB interactions
        clear_data()

        # ----------------- SEED DATA -----------------
        # Create sample users
        user1 = User(
            name="Joy Mutanu",
            email="joy.mutanu@example.com",
            password_hash=generate_password_hash('password123')
        )

        user2 = User(
            name="Brian Lunga",
            email="brian.lunga@example.com",
            password_hash=generate_password_hash('password123')
        )

        # Add users to the session
        db.session.add(user1)
        db.session.add(user2)

        # Commit to save users to the database
        db.session.commit()

        # ----------------- SEED RIDE HISTORY -----------------
        
        ride1 = RideHistory(
            user_id=user1.id,
            hospital_name="City Hospital",
            payment_method="Credit Card",
            status=RideStatusEnum.COMPLETED,
        )

        ride2 = RideHistory(
            user_id=user2.id,
            hospital_name="Greenwood Hospital",
            payment_method="Cash",
            status=RideStatusEnum.PENDING,
        )

        # Add ride histories to the session
        db.session.add(ride1)
        db.session.add(ride2)

        # Commit to save ride histories to the database
        db.session.commit()

        # ----------------- SEED CONTACT MESSAGES -----------------

        contact1 = ContactUs(
            name="Alice Wambui",
            email="alice.wambui@example.com",
            phone_number="0712345678",
            message="I have a suggestion to improve the ambulance service."
        )

        contact2 = ContactUs(
            name="Tom Muriithi",
            email="tom.muriithi@example.com",
            phone_number="0723456789",
            message="I had a great experience using the ambulance service, thank you!"
        )

        # Add contact messages to the session
        db.session.add(contact1)
        db.session.add(contact2)

        # Commit to save contact messages to the database
        db.session.commit()

        # ----------------- SEED FAVORITES -----------------

        favorite1 = Favorite(
            user_id=user1.id,
            hospital_name="City Hospital"
        )

        favorite2 = Favorite(
            user_id=user2.id,
            hospital_name="Greenwood Hospital"
        )

        # Add favorites to the session
        db.session.add(favorite1)
        db.session.add(favorite2)

        # Commit to save favorites to the database
        db.session.commit()

        print("Database seeded successfully!")

# Call seed_data() to run the script
if __name__ == '__main__':
    seed_data()
