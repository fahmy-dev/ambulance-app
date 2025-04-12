import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMapEvents } from "react-leaflet";
import AmbulanceRequestForm from "../components/AmbulanceRequestForm";
import RequestConfirmationPanel from "../components/RequestConfirmationPanel";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext"; // Add this import

// Component to handle location updates
function LocationMarker({ position, setPosition, selectedHospital }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  
  // Add effect to handle selected hospital position changes
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
        <Marker position={selectedHospital.position}>
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
  const defaultPosition = [-1.286389, 36.817223]; // Nairobi coordinates
  const { user } = useAuth(); // Add this to check if user is logged in

  useEffect(() => {
    // Immediately set default position to ensure map always loads
    setPosition(defaultPosition);
    
    // Reduce initial loading time
    setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 2000);
    
    if (navigator.geolocation) {
      try {
        // Try to get precise location with a timeout
        const locationTimeout = setTimeout(() => {
          if (loading) {
            console.log("Location request timed out, using default position");
            setLoading(false);
            setLocationError("Location request timed out. Using default location.");
          }
        }, 5000);
        
        // Use watchPosition instead of getCurrentPosition for better reliability
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            clearTimeout(locationTimeout);
            setPosition([position.coords.latitude, position.coords.longitude]);
            setLoading(false);
            setLocationError(null);
            
            // Once we get a good position, stop watching
            navigator.geolocation.clearWatch(watchId);
          },
          (error) => {
            clearTimeout(locationTimeout);
            console.error("Error getting location:", error);
            setLocationError("Could not access your location. Using default location instead.");
            setLoading(false);
          },
          { 
            enableHighAccuracy: false, // Set to false for better compatibility
            timeout: 10000,
            maximumAge: 300000 // Allow cached positions up to 5 minutes old
          }
        );
        
        // Clean up the watch when component unmounts
        return () => {
          navigator.geolocation.clearWatch(watchId);
          clearTimeout(locationTimeout);
        };
      } catch (e) {
        // Handle any unexpected errors in the geolocation API
        console.error("Unexpected geolocation error:", e);
        setLocationError("An unexpected error occurred. Using default location.");
        setLoading(false);
      }
    } else {
      setLocationError("Geolocation is not supported by your browser. Using default location.");
      console.error("Geolocation is not supported by this browser");
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
