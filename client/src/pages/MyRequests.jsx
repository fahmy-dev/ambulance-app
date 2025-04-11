import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Custom AuthContext for user authentication
import api from "../utils/api"; // Import the api utility
import { format } from 'date-fns'; // Add date-fns for date formatting

function MyRequests() {
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Access the logged-in user from context

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return; // Check if user is logged in
  
      try {
        setLoading(true);
        // Fetch the requests for the current user
        const response = await api.requests.getAll();
        
        // Log the response to check its structure
        console.log(response);
  
        // Ensure the response is ok (status 200)
        if (!response || !response.data) {
          throw new Error("No data returned from the server.");
        }
  
        setMyRequests(response.data); // Assuming the response has a 'data' field containing the requests
      } catch (err) {
        console.error("Failed to fetch requests:", err);
        setError("Failed to load your requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchRequests();
  }, [user]); // Re-run effect when user changes
  

  if (loading) {
    return (
      <div className="my-requests-page">
        <h1 className="page-title">My Ambulance Requests</h1>
        <div className="loading">Loading your requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-requests-page">
        <h1 className="page-title">My Ambulance Requests</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="my-requests-page">
      <h1 className="page-title">My Ambulance Requests</h1>
      <p className="page-subtitle">
        Here you can view the status of your recent ambulance requests.
      </p>

      {myRequests.length > 0 ? (
        <table className="requests-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Hospital</th>
              <th>Distance</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {myRequests.map((req) => (
              <tr key={req.id}>
                <td>{format(new Date(req.created_at), 'PPP')}</td> {/* Using date-fns to format the date */}
                <td>{req.hospital ? req.hospital.name : "Unknown"}</td>
                <td>{calculateDistance(req)} KM</td>
                <td>{req.payment_method || "N/A"}</td>
                <td>
                  <span className={`status-${req.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {req.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-requests">You haven't made any requests yet.</p>
      )}
    </div>
  );
}

// Helper function to calculate distance
function calculateDistance(request) {
  if (!request.patient_location_lat || !request.hospital) return "N/A";
  
  const lat1 = request.patient_location_lat;
  const lon1 = request.patient_location_lng;
  const lat2 = request.hospital.location_lat;
  const lon2 = request.hospital.location_lng;
  
  // Simple distance calculation (Haversine formula)
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  
  return distance.toFixed(1);
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

export default MyRequests;
