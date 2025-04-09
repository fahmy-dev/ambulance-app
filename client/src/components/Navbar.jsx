import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav>
      <div className="container">
        <Link to="/" className="logo">
          Ambulance Services
        </Link>

        <div className="nav-links">
          <Link to="/home">Home</Link>
          <Link to="/contact">Contact</Link>
          {user && <Link to="/my-requests">My Requests</Link>}
        </div>

        <div className="auth-buttons">
          {user ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <Link to="/auth">
              <button>Sign In</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;