import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

function MyRequests() {
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
  
      try {
        setLoading(true);
        const response = await api.requests.getAll();
        setMyRequests(response);
      } catch (err) {
        console.error("Failed to fetch requests:", err);
        setError("Failed to load your requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchRequests();
  }, [user]);
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
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
        Here you can view your recent ambulance requests.
      </p>

      {myRequests.length > 0 ? (
        <table className="requests-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hospital</th>
              <th>Payment</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {myRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.hospital_name}</td>
                <td>{req.payment_method}</td>
                <td>{req.formatted_date || formatDate(req.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-requests">
          You haven't made any ambulance requests yet.
        </div>
      )}
    </div>
  );
}

export default MyRequests;
