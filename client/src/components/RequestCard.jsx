import React from 'react';

function RequestCard({ request }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'completed':
        return 'status-done';
      default:
        return '';
    }
  };

  return (
    <div className="request-card">
      <div className="request-header">
        <span className="request-id">#{request.id}</span>
        <span className={`request-status ${getStatusClass(request.status)}`}>
          {request.status}
        </span>
      </div>

      <div className="request-details">
        <div className="detail-row">
          <span className="label">From:</span>
          <span className="value">{request.pickup_location}</span>
        </div>
        <div className="detail-row">
          <span className="label">To:</span>
          <span className="value">{request.destination}</span>
        </div>
        <div className="detail-row">
          <span className="label">Requested:</span>
          <span className="value">{formatDate(request.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

export default RequestCard;