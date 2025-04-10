import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import ContactUs from "./pages/ContactUs";
import Auth from "./pages/Auth";
import MyRequests from "./pages/MyRequests";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// Layout component with Navbar
const Layout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

// Simple 404 page component
const NotFound = () => (
  <div className="page-container">
    <h1 className="page-title">Page Not Found</h1>
    <p className="page-subtitle">The page you're looking for doesn't exist or has been moved.</p>
  </div>
);

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
        element: <ProtectedRoute><MyRequests /></ProtectedRoute>
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
];

export default routes;