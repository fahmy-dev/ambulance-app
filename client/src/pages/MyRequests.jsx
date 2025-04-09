import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load mock data immediately without authentication check
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // Mock data that matches your screenshot
      const mockData = [
        {
          id: "A123",
          pickup_location: "Nairobi West Hospital",
          created_at: "2024-04-01T00:00:00.000Z",
          status: "pending"
        },
        {
          id: "A243",
          pickup_location: "Nairobi Hospital",
          created_at: "2024-04-01T00:00:00.000Z",
          status: "completed"
        },
        {
          id: "A351",
          pickup_location: "Aga Khan Hospital",
          created_at: "2024-04-01T00:00:00.000Z",
          status: "completed"
        }
      ];
      
      setRequests(mockData);
      
      // Simulating network delay
      setTimeout(() => {
        setLoading(false);
      }, 500);
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading your requests...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchRequests} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="my-requests-page">
      <h1 className="page-title">My Requests</h1>

      {requests.length === 0 ? (
        <div className="no-requests">
          <p>No requests found</p>
          <button 
            onClick={() => navigate('/home')} 
            className="request-btn"
          >
            Make Your First Request
          </button>
        </div>
      ) : (
        <div className="requests-table">
          <table>
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Hospital</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>#{request.id}</td>
                  <td>{request.pickup_location}</td>
                  <td>
                    {new Date(request.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                  <td>
                    {request.status === "pending" ? (
                      <span className="status-pending">⊙ Pending</span>
                    ) : (
                      <span className="status-done">✓ Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyRequests;