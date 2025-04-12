import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  return (
    <nav>
      <div className="container">
        <Link to="/" className="logo">Ambulance App</Link>
        
        <div className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/my-requests">My Requests</Link>
          <Link to="/contact">Contact</Link>
        </div>
        
        <div className="auth-buttons">
          {user ? (
            <>
              {/* Change this line to display user.name instead of the entire user object */}
              <p>Welcome, {user.name}</p>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate("/auth")} className="login-btn">Login/Register</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;