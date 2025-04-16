import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMapEvents } from "react-leaflet";
import AmbulanceRequestForm from "../components/AmbulanceRequestForm";
import RequestConfirmationPanel from "../components/RequestConfirmationPanel";

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
  const defaultPosition = [-1.286389, 36.817223]; // Nairobi coordinates

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setPosition(defaultPosition);
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser");
      setPosition(defaultPosition);
      setLoading(false);
    }
  }, []);

  const handleRequestSubmit = (data) => {
    const distance = calculateDistance(position, data.hospital);
    
    setRequestData({
      ...data,
      distance: `${distance.toFixed(1)} KM`,
      eta: calculateETA(distance)
    });
    
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
