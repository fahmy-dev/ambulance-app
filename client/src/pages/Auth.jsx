import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, user, processTempRequest } = useAuth();
  const [isLogin, setIsLogin] = useState(location.state?.mode !== "register");
  const [formError, setFormError] = useState("");

  // Get return URL from location state or sessionStorage
  const returnUrl = location.state?.returnUrl || sessionStorage.getItem('returnAfterAuth') || "/home";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Process any temporary request data
      processTempRequest().then(() => {
        // Clear the stored return URL
        sessionStorage.removeItem('returnAfterAuth');
        // Navigate to the return URL
        navigate(returnUrl);
      });
    }
  }, [user, navigate, processTempRequest, returnUrl]);

  const handleLoginSubmit = async (values, { setSubmitting }) => {
    setFormError("");
    try {
      console.log("Attempting login with:", values.email);
      const user = await login({
        email: values.email,
        password: values.password
      });
      
      if (user) {
        // The useEffect will handle the redirect
      } else {
        setFormError("Invalid email or password.");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setFormError(error.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (values, { setSubmitting }) => {
    setFormError("");
    try {
      console.log("Attempting registration with:", values.email);
      const user = await register({
        name: values.name,
        email: values.email,
        password: values.password
      });
      
      if (user) {
        // The useEffect will handle the redirect
      } else {
        setFormError("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Auth error:", error);
      setFormError(error.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-tabs">
        <button
          onClick={() => setIsLogin(true)}
          className={`auth-tab ${isLogin ? 'active' : ''}`}
        >
          Login
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`auth-tab ${!isLogin ? 'active' : ''}`}
        >
          Register
        </button>
      </div>

      {isLogin ? (
        <LoginForm 
          onSubmit={handleLoginSubmit} 
          formError={formError} 
        />
      ) : (
        <SignupForm 
          onSubmit={handleRegisterSubmit} 
          formError={formError} 
        />
      )}
    </div>
  );
}

export default Auth;
