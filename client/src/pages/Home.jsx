import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AmbulanceRequestForm from "../components/AmbulanceRequestForm";

function Home() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleRequestClick = () => {
        if (!user) {
            navigate('/auth');
            return;
        }
    };

    return (
        <div className="home-container">
            <div className="hero-section">
                <h1>Emergency Medical Transport</h1>
                <p>Quick and reliable ambulance services when you need them most</p>
                {!user && (
                    <button onClick={() => navigate('/auth')} className="cta-button">
                        Sign In to Request Ambulance
                    </button>
                )}
            </div>

            {user && <AmbulanceRequestForm />}

            <div className="features-section">
                <h2>Our Services</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <h3>24/7 Availability</h3>
                        <p>Round-the-clock emergency medical transport</p>
                    </div>
                    <div className="feature-card">
                        <h3>Rapid Response</h3>
                        <p>Quick dispatch and arrival times</p>
                    </div>
                    <div className="feature-card">
                        <h3>Professional Staff</h3>
                        <p>Trained medical professionals</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;