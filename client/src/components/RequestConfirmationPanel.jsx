import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RequestConfirmationPanel({ requestData, visible }) {
  const navigate = useNavigate();
  const { user, saveTempRequest } = useAuth();
  
  if (!visible || !requestData) return null;
  
  const formatTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true 
    });
  };
  
  const detailRows = [
    { label: "Hospital", value: requestData.hospital.name },
    { label: "Distance", value: requestData.distance },
    { label: "ETA", value: `~ ${requestData.eta} Minutes` },
    { label: "Payment Method", value: requestData.paymentMethod },
    { label: "Time", value: formatTime() }
  ];
  
  const handleViewRequests = () => {
    if (!user) {
      // Save request data to localStorage as fallback
      const tempRequestData = {
        hospital: requestData.hospital,
        paymentMethod: requestData.paymentMethod,
        timestamp: new Date().toISOString()
      };

      // Try to use context function, fallback to localStorage
      if (typeof saveTempRequest === 'function') {
        saveTempRequest(tempRequestData);
      } else {
        localStorage.setItem('tempRequest', JSON.stringify(tempRequestData));
      }
      
      // Store return URL
      sessionStorage.setItem('returnAfterAuth', '/my-requests');
      
      // Redirect to auth
      navigate("/auth", { 
        state: { 
          returnUrl: "/my-requests",
          mode: "login"
        } 
      });
    } else {
      navigate("/my-requests");
    }
  };
  
  return (
    <div className="request-confirmation">
      <div className="confirmation-header">
        <span className="confirmation-icon">✓</span>
        <h2>Ambulance Requested!</h2>
        <p>Your request has been sent.</p>
      </div>
      
      <div className="confirmation-details">
        {detailRows.map((row, index) => (
          <div className="detail-row" key={index}>
            <span className="detail-label">{row.label}:</span>
            <span className="detail-value">{row.value}</span>
          </div>
        ))}
      </div>
      
      <button 
        className="view-requests-btn" 
        onClick={handleViewRequests}
      >
        View My Requests
      </button>
    </div>
  );
}

export default RequestConfirmationPanel;