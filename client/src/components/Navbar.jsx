// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { FaBars, FaTimes } from 'react-icons/fa';
// import './Navbar.css';

// function Navbar() {
//   const [click, setClick] = useState(false);
//   const handleClick = () => setClick(!click);
//   const closeMobileMenu = () => setClick(false);

//   return (
//     <nav className='navbar'>
//       <div className='navbar-container'>
//         <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
//           <img src="/ambulance-logo.png" alt="Ambulance Logo" className="nav-logo"/>
//           QuickResponse
//         </Link>

//         <div className='menu-icon' onClick={handleClick}>
//           {click ? <FaTimes /> : <FaBars />}
//         </div>

//         <ul className={click ? 'nav-menu active' : 'nav-menu'}>
//           <li className='nav-item'>
//             <Link to='/' className='nav-links' onClick={closeMobileMenu}>
//               Home
//             </Link>
//           </li>
//           <li className='nav-item'>
//             <Link to='/services' className='nav-links' onClick={closeMobileMenu}>
//               Services
//             </Link>
//           </li>
//           <li className='nav-item'>
//             <Link to='/about' className='nav-links' onClick={closeMobileMenu}>
//               About
//             </Link>
//           </li>
//           <li className='nav-item'>
//             <Link to='/contact' className='nav-links' onClick={closeMobileMenu}>
//               Contact
//             </Link>
//           </li>
//           <li className='nav-item'>
//             <Link to='/login' className='nav-links-mobile' onClick={closeMobileMenu}>
//               Login
//             </Link>
//           </li>
//         </ul>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;


import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

function Navbar() {
  const [click, setClick] = useState(false);
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  return (
    <nav className='navbar'>
      <div className='navbar-container'>
        <Link to='/home' className='navbar-logo' onClick={closeMobileMenu}>
          <img src="/ambulance-logo.png" alt="Ambulance Logo" className="nav-logo"/>
          QuickResponse
        </Link>

        <div className='menu-icon' onClick={handleClick}>
          {click ? <FaTimes /> : <FaBars />}
        </div>

        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
        <li className='nav-item'>
            <Link to='/Home' className='nav-links-mobile' onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li className='nav-item'>
            <Link to='/MyRequests' className='nav-links-mobile' onClick={closeMobileMenu}>
              My Requests
            </Link>
          </li>
          <li className='nav-item'>
            <Link to='/Contact Us' className='nav-links' onClick={closeMobileMenu}>
              Contact Us
            </Link>
          </li>
          <li className='nav-item'>
            <Link to='/Auth' className='nav-links' onClick={closeMobileMenu}>
              Auth
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;