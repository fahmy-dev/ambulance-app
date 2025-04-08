import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);  // Removed navigate dependency for testing

  const fetchRequests = async () => {
    try {
      // Commenting out token checks for testing
      /*
      const token = localStorage.getItem('token');
      const response = await fetch("/api/requests/my-requests", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      */

      // For testing, using mock data
      const mockData = [
        {
          id: 1,
          pickup_location: "Hospital A",
          destination: "Hospital B",
          created_at: new Date().toISOString(),
          status: "pending"
        },
        {
          id: 2,
          pickup_location: "Clinic C",
          destination: "Hospital D",
          created_at: new Date().toISOString(),
          status: "completed"
        }
      ];

      setRequests(mockData);
      
      /* Commenting out error handling for testing
      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
        return;
      }
      
      if (!response.ok) {
        throw new Error("Unable to load your requests");
      }
      
      const data = await response.json();
      setRequests(data);
      */
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      setCancellingId(requestId);
      // Commenting out API call for testing
      /*
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
        return;
      }

      if (!response.ok) {
        throw new Error('Unable to cancel request');
      }
      */

      // For testing, just update the state
      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status: 'cancelled' } : req
      ));
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div>Loading your requests...</div>;
  }

  if (error) {
    return (
      <div>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={fetchRequests}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h2>My Ambulance Requests</h2>
        <button onClick={() => navigate('/')}>
          Request New Ambulance
        </button>
      </div>

      {requests.length === 0 ? (
        <p>No requests found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Pickup Location</th>
              <th>Destination</th>
              <th>Requested On</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>#{request.id}</td>
                <td>{request.pickup_location}</td>
                <td>{request.destination}</td>
                <td>{formatDate(request.created_at)}</td>
                <td>
                  <span>{request.status}</span>
                </td>
                <td>
                  {request.status === "pending" && (
                    <button
                      disabled={cancellingId === request.id}
                      onClick={() => handleCancelRequest(request.id)}
                    >
                      {cancellingId === request.id ? 
                        'Cancelling...' : 
                        'Cancel Request'
                      }
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyRequests;