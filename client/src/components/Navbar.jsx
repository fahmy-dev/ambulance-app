import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
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
          {token && <Link to="/my-requests">My Requests</Link>}
        </div>

        <div className="auth-buttons">
          {token ? (
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