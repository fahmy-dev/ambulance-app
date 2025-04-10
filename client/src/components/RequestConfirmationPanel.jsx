import React from "react";
import { useNavigate } from "react-router-dom";

function RequestConfirmationPanel({ requestData, visible }) {
  const navigate = useNavigate();
  
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
        onClick={() => navigate("/my-requests")}
      >
        View My Requests
      </button>
    </div>
  );
}

export default RequestConfirmationPanel;