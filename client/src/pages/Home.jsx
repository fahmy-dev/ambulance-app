import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { useMapEvents } from "react-leaflet";
import AmbulanceRequestForm from "../components/AmbulanceRequestForm";
import RequestConfirmationPanel from "../components/RequestConfirmationPanel";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker({ position, setPosition, selectedHospital }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  
  useEffect(() => {
    if (selectedHospital && selectedHospital.position) {
      map.flyTo(selectedHospital.position, 15);
    }
  }, [selectedHospital, map]);
  
  const mapEvents = useMapEvents({
    click: (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });
  
  return (
    <>
      {position && (
        <Marker position={position}>
          <Popup>Your location</Popup>
        </Marker>
      )}
      {selectedHospital && selectedHospital.position && (
        <Marker position={selectedHospital.position} icon={hospitalIcon}>
          <Popup>{selectedHospital.name}</Popup>
        </Marker>
      )}
    </>
  );
}

function Home() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [requestData, setRequestData] = useState(null);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const defaultPosition = [-1.286389, 36.817223];
  const { user } = useAuth();

  useEffect(() => {
    setPosition(defaultPosition);
    
    setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 2000);
    
    if (navigator.geolocation) {
      try {
        const locationTimeout = setTimeout(() => {
          if (loading) {
            setLoading(false);
            setLocationError("Location request timed out. Using default location.");
          }
        }, 5000);
        
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            clearTimeout(locationTimeout);
            setPosition([position.coords.latitude, position.coords.longitude]);
            setLoading(false);
            setLocationError(null);
            
            navigator.geolocation.clearWatch(watchId);
          },
          (error) => {
            clearTimeout(locationTimeout);
            setLocationError("Could not access your location. Using default location instead.");
            setLoading(false);
          },
          { 
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
          }
        );
        
        return () => {
          navigator.geolocation.clearWatch(watchId);
          clearTimeout(locationTimeout);
        };
      } catch (e) {
        setLocationError("An unexpected error occurred. Using default location.");
        setLoading(false);
      }
    } else {
      setLocationError("Geolocation is not supported by your browser. Using default location.");
      setLoading(false);
    }
  }, []);

  const handleRequestSubmit = (data) => {
    const distance = calculateDistance(position, data.hospital);
    
    const formattedData = {
      ...data,
      distance: `${distance.toFixed(1)} KM`,
      eta: calculateETA(distance)
    };
    
    setRequestData(formattedData);
    
    // Only make the API call if the user is logged in
    if (user) {
      const apiData = {
        hospital_name: data.hospital.name,
        payment_method: data.paymentMethod,
        date: new Date().toLocaleString()
      };
      
      api.requests.create(apiData)
        .then(response => {
          console.log("Ambulance request created:", response);
        })
        .catch(err => {
          console.error("Failed to create ambulance request:", err);
        });
    } else {
      // For non-logged in users, store the request in localStorage
      localStorage.setItem("pendingRequest", JSON.stringify({
        hospital_name: data.hospital.name,
        payment_method: data.paymentMethod,
        date: new Date().toLocaleString()
      }));
      
      console.log("Request saved locally. User will need to log in to complete.");
    }
    
    // Show confirmation regardless of login status
    setShowConfirmation(true);
  };
  
  const calculateDistance = (userPosition, hospital) => {
    // Placeholder that returns a random distance between 1-5 km
    return Math.random() * 4 + 1;
  };
  
  const calculateETA = (distance) => {
    return Math.round((distance / 60) * 60);
  };

  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
  };

  return (
    <div className="home">
      <h1>Ambulance App</h1>
      {locationError && (
        <div className="error-message location-error">
          {locationError}
        </div>
      )}
      <div className="main-content">
        <div className="map-area">
          <div className="map-placeholder">
            {loading ? (
              <div className="loading-map">Loading map...</div>
            ) : (
              <MapContainer
                center={position || defaultPosition}
                zoom={13}
                scrollWheelZoom={true}
                style={{ width: "100%", height: "500px" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker 
                  position={position} 
                  setPosition={setPosition}
                  selectedHospital={selectedHospital}
                />
              </MapContainer>
            )}
          </div>
        </div>
        
        <div className="request-panel">
          {!showConfirmation ? (
            <>
              <h2>Request an Ambulance</h2>
              <AmbulanceRequestForm 
                position={position} 
                onRequestSubmit={handleRequestSubmit}
                onHospitalSelect={handleHospitalSelect}
              />
            </>
          ) : (
            <RequestConfirmationPanel 
              requestData={requestData}
              visible={showConfirmation}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
