import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import ContactUs from "./pages/ContactUs";
import Auth from "./pages/Auth";
import MyRequests from "./pages/MyRequests";
import Navbar from "./components/Navbar";

// Layout component with Navbar
const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />
      },
      {
        path: "home",
        element: <Home />
      },
      {
        path: "contact",
        element: <ContactUs />
      },
      {
        path: "auth",
        element: <Auth />
      },
      {
        path: "my-requests",
        element: <MyRequests />
      }
    ]
  }
];

export default routes;