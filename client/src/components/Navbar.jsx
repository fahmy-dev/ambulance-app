// import React from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// function Navbar() {
//   const navigate = useNavigate();
//   const { user, logout } = useAuth();

//   const handleLogout = () => {
//     logout();
//     navigate('/auth');
//   };

//   return (
//     <nav>
//       <div className="container">
//         <Link to="/" className="logo">
//           Ambulance Services
//         </Link>

//         <div className="nav-links">
//           <Link to="/home">Home</Link>
//           <Link to="/contact">Contact</Link>
//           {user && <Link to="/my-requests">My Requests</Link>}
//         </div>

//         <div className="auth-buttons">
//           {user ? (
//             <button onClick={handleLogout}>Logout</button>
//           ) : (
//             <Link to="/auth">
//               <button>Sign In</button>
//             </Link>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;



import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/auth', { state: { mode: 'login' } }); // go back to login page on logout
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Logo + Links */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="text-xl font-bold text-blue-600">
          Ambulance Services
        </Link>
        <div className="flex space-x-4 text-gray-700">
          <Link to="/home">Home</Link>
          <Link to="/contact">Contact</Link>
          {user && <Link to="/my-requests">My Requests</Link>}
        </div>
      </div>

      {/* Auth Buttons */}
      <div className="flex space-x-4">
        {user ? (
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/auth" state={{ mode: 'login' }}>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Login
              </button>
            </Link>
            <Link to="/auth" state={{ mode: 'register' }}>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Register
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
