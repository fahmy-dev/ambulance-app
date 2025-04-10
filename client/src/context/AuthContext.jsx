import React, { createContext, useState, useContext, useEffect } from "react";
import api from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);