// import React from "react";
// import { Navigate } from "react-router-dom";
// import Home from "./pages/Home";
// import ContactUs from "./pages/ContactUs";
// import Auth from "./pages/Auth";
// import MyRequests from "./pages/MyRequests";


// const routes = [
//   {
//     path: "/",
//     element: <Navigate to="/home" replace />
//   },
//   {
//     path: "/home",
//     element: <Home />
//   },
//   {
//     path: "/contact",
//     element: <ContactUs />
//   },
//   {
//     path: "/auth",
//     element: <Auth />
//   },
//   {
//     path: "/my-requests",
//     element: <MyRequests />
//   }
// ]

// export default routes
import React from "react";
import { Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ContactUs from "./pages/ContactUs";
import Auth from "./pages/Auth";
import MyRequests from "./pages/MyRequests";
import Navbar from "./components/Navbar";

const routes = [
  {
    path: "/",
    element: <Navigate to="/home" replace />
  },
  {
    path: "/Home",
    element: <Home />
  },
  {
    path: "/MyRequests",
    element: <MyRequests />
  },
  {
    path: "/Contact Us",
    element: <ContactUs />
  },
  {
    path: "/Auth",
    element: <Auth />
  },
  {
    path: "/Navbar",
    element: <Navbar />
  }
];

export default routes;