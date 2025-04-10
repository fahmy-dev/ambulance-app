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

  // Request configuration
  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    
    // Handle non-2xx responses
    if (!response.ok) {
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

// API functions for different endpoints
const api = {
  // Auth endpoints
  auth: {
    login: (credentials) => fetchApi("/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    }),
    register: (userData) => fetchApi("/signup", {
      method: "POST",
      body: JSON.stringify(userData)
    }),
    getCurrentUser: () => fetchApi("/me")
  },
  
  // Rest of your API functions remain the same
  // Hospitals
  hospitals: {
    getAll: () => fetchApi("/hospitals"),
    getById: (id) => fetchApi(`/hospitals/${id}`)
  },
  
  // Ambulance requests
  requests: {
    getAll: () => fetchApi("/ambulance-requests"),
    getById: (id) => fetchApi(`/ambulance-requests/${id}`),
    create: (requestData) => fetchApi("/ambulance-requests", {
      method: "POST",
      body: JSON.stringify(requestData)
    }),
    update: (id, data) => fetchApi(`/ambulance-requests/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    })
  },
  
  // Ride history
  rideHistory: {
    getAll: () => fetchApi("/ride-history"),
    create: (historyData) => fetchApi("/ride-history", {
      method: "POST",
      body: JSON.stringify(historyData)
    })
  }
};

export default api;