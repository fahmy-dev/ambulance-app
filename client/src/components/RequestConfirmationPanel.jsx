import React from 'react';
import { useNavigate } from 'react-router-dom';

function RequestConfirmationPanel({ request, onClose }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate('/my-requests');
  };

  return (
    <div className="confirmation-panel">
      <h3>Request Confirmed!</h3>
      <div className="confirmation-details">
        <p>Your ambulance request has been successfully submitted.</p>
        <div className="detail-item">
          <span>Request ID:</span>
          <strong>#{request.id}</strong>
        </div>
        <div className="detail-item">
          <span>Pickup Location:</span>
          <strong>{request.pickup_location}</strong>
        </div>
        <div className="detail-item">
          <span>Destination:</span>
          <strong>{request.destination}</strong>
        </div>
      </div>
      <div className="confirmation-actions">
        <button onClick={handleViewDetails} className="primary-btn">
          View Request Details
        </button>
        <button onClick={onClose} className="secondary-btn">
          Close
        </button>
      </div>
    </div>
  );
}

export default RequestConfirmationPanel;