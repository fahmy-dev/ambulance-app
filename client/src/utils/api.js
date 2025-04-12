
// API utility for making requests to the server
const API_URL = "http://localhost:5555"; // Your Flask server URL

// Helper function for making API requests
async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  // Include auth token if available
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Check if the body is FormData (used for file uploads or non-JSON data)
  if (options.body instanceof FormData) {
    delete headers["Content-Type"]; // Let the browser set the Content-Type for FormData
  }

  const config = {
    ...options,
    headers,
    body: options.body
  };

  try {
    const response = await fetch(url, config);
    
    // Handle non-2xx responses
    if (!response.ok) {
      if (response.status === 401 && endpoint === "/login") {
        // For login endpoint, don't redirect, just throw an error to be handled by the login form
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Invalid email or password");
      } else if (response.status === 401) {
        // For other endpoints, redirect to auth when unauthorized
        window.location.href = "/auth";
        return; // Stop execution after redirect
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

// Ambulance requests API
export const ambulanceRequests = {
  getAll: () => fetchApi("/ambulance-requests"),
  getById: (id) => fetchApi(`/ambulance-requests/${id}`),
  create: (requestData) => fetchApi("/ambulance-requests", {
    method: "POST",
    body: JSON.stringify(requestData)
  }),
  update: (id, data) => fetchApi(`/ambulance-requests/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  }),
  delete: (id) => fetchApi(`/ambulance-requests/${id}`, { method: "DELETE" })
};

// Hospitals API
export const hospitals = {
  getAll: () => fetchApi("/hospitals"),
  getById: (id) => fetchApi(`/hospitals/${id}`),
  create: (hospitalData) => fetchApi("/hospitals", {
    method: "POST",
    body: JSON.stringify(hospitalData)
  }),
  update: (id, data) => fetchApi(`/hospitals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  }),
  delete: (id) => fetchApi(`/hospitals/${id}`, { method: "DELETE" })
};

// Ride history API
export const rideHistory = {
  getAll: () => fetchApi("/ride-history"),
  create: (historyData) => fetchApi("/ride-history", {
    method: "POST",
    body: JSON.stringify(historyData)
  }),
  getById: (id) => fetchApi(`/ride-history/${id}`),
  update: (id, data) => fetchApi(`/ride-history/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data)
  }),
  delete: (id) => fetchApi(`/ride-history/${id}`, { method: "DELETE" })
};

// Auth API
export const auth = {
  login: (credentials) => fetchApi("/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  }),
  register: (userData) => fetchApi("/signup", {
    method: "POST",
    body: JSON.stringify(userData)
  }),
  getCurrentUser: () => fetchApi("/me"),
  logout: () => {
    localStorage.removeItem("token"); // Logout logic to clear token
    window.location.href = "/auth";  // Redirect to auth instead of login
  }
};

export default {
  ambulanceRequests,
  hospitals,
  rideHistory,
  auth
};
