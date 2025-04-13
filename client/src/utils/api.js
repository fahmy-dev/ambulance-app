
// Change this line to always use the local URL
const API_URL = "http://localhost:5000";

async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const config = {
    ...options,
    headers,
    mode: 'cors',
    body: options.body
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401 && endpoint === "/login") {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Invalid email or password");
      } else if (response.status === 401) {
        window.location.href = "/auth";
        return;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
}

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

export default api;
