import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tempRequest, setTempRequest] = useState(null);
  const [error, setError] = useState(null);

  // Check for existing token and load user on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Fetch current user data
          const userData = await api.auth.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error("Failed to authenticate with stored token:", err);
          localStorage.removeItem("token"); // Clear invalid token
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.auth.login(credentials);
      console.log("Login response:", response);
      
      // Store the token
      localStorage.setItem("token", response.access_token);
      
      // Set the user
      setUser(response.user);
      
      return response.user;
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.auth.register(userData);
      console.log("Register response:", response);
      
      // Store the token
      localStorage.setItem("token", response.access_token);
      
      // Set the user
      setUser(response.user);
      
      return response.user;
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const saveTempRequest = (requestData) => {
    // Save to state
    setTempRequest(requestData);
    // Also save to localStorage as backup
    localStorage.setItem('tempRequest', JSON.stringify(requestData));
  };

  const processTempRequest = async () => {
    const savedRequest = tempRequest || JSON.parse(localStorage.getItem('tempRequest'));
    
    if (savedRequest && user) {
      try {
        // Make the API call to save the request
        await api.requests.create({
          hospital_name: savedRequest.hospital.name,
          payment_method: savedRequest.paymentMethod,
          date: savedRequest.timestamp
        });
        
        // Clear the temporary request data
        setTempRequest(null);
        localStorage.removeItem('tempRequest');
      } catch (error) {
        console.error('Failed to process temporary request:', error);
      }
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    saveTempRequest,    // Add this
    processTempRequest  // Add this
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);