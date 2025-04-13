
// Use environment variable for API URL, fallback to empty string for production
const API_URL = import.meta.env.VITE_API_URL || "";

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
    mode: 'cors',  // Replace credentials with mode
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

// Combine all API endpoints into a single object
const api = {
  rideHistory: {
    getAll: () => fetchApi("/ride_history"),
    create: (historyData) => fetchApi("/ride_history", {
      method: "POST",
      body: JSON.stringify(historyData)
    }),
    getById: (id) => fetchApi(`/ride_history/${id}`),
    update: (id, data) => fetchApi(`/ride_history/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),
    delete: (id) => fetchApi(`/ride_history/${id}`, { method: "DELETE" }),
    search: (query) => fetchApi(`/ride_history/search?search=${query}`)
  },

  contactUs: {
    create: (contactData) => fetchApi("/contact_us", {
      method: "POST",
      body: JSON.stringify(contactData)
    }),
    getAll: () => fetchApi("/contact_us")
  },

  favorites: {
    getAll: () => fetchApi("/favorites"),
    add: (data) => fetchApi("/favorites", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    remove: (data) => fetchApi("/favorites", {
      method: "DELETE",
      body: JSON.stringify(data)
    })
  },

  requests: {
    getAll: () => fetchApi("/ride_history"),
    getById: (id) => fetchApi(`/ride_history/${id}`),
    create: (requestData) => {
      const transformedData = {
        hospital_name: requestData.hospital_name,
        payment_method: requestData.payment_method || requestData.payment,
        date: new Date().toLocaleString()
      };
      return fetchApi("/request-ambulance", {
        method: "POST",
        body: JSON.stringify(transformedData)
      });
    },
    update: (id, data) => fetchApi(`/ride_history/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data)
    }),
    delete: (id) => fetchApi(`/ride_history/${id}`, { method: "DELETE" })
  },

  auth: {
    login: (credentials) => fetchApi("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(credentials)
    }),
    register: (userData) => fetchApi("/signup", {
      method: "POST",
      body: JSON.stringify(userData)
    }),
    getCurrentUser: () => fetchApi("/me"),
    logout: () => {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
  }
};

// Single default export
export default api;
