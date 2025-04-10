import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AmbulanceRequestForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pickup_location: '',
    destination: '',
    patient_name: '',
    contact_number: '',
    emergency_type: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/auth');
        return;
      }

      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/auth');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      navigate('/my-requests');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-panel">
      <h2>Request an Ambulance</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="pickup_location">Pickup Location</label>
          <input
            type="text"
            id="pickup_location"
            name="pickup_location"
            value={formData.pickup_location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="destination">Destination</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="patient_name">Patient Name</label>
          <input
            type="text"
            id="patient_name"
            name="patient_name"
            value={formData.patient_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="contact_number">Contact Number</label>
          <input
            type="tel"
            id="contact_number"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="emergency_type">Emergency Type</label>
          <select
            id="emergency_type"
            name="emergency_type"
            value={formData.emergency_type}
            onChange={handleChange}
            required
          >
            <option value="general">General</option>
            <option value="critical">Critical</option>
            <option value="non-emergency">Non-Emergency</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="request-btn"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Request Ambulance'}
        </button>
      </form>
    </div>
  );
}

export default AmbulanceRequestForm;
