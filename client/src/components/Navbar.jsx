import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    const isConfirmed = window.confirm("Are you sure you want to logout?");
    if (isConfirmed) {
      logout();
      navigate("/home");
      alert("You have successfully logged out.");
    }
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
