import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // Leaflet CSS for proper styling
import { useMapEvents } from "react-leaflet"; // To handle user interactions

// Component to handle location updates
function LocationMarker({ position, setPosition }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);
  
  // Use map events inside this component since it's a child of MapContainer
  const mapEvents = useMapEvents({
    click: (e) => {
      setPosition([e.latlng.lat, e.latlng.lng]);
    }
  });
  
  return position ? (
    <Marker position={position}>
      <Popup>Your location</Popup>
    </Marker>
  ) : null;
}

function Home({ AmbulanceRequestForm, RequestConfirmationPanel }) {
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user's current location when component mounts
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setPosition([position.coords.latitude, position.coords.longitude]);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Fallback to default location if geolocation fails
                    setPosition([-1.286389, 36.817223]); // Nairobi coordinates as fallback
                    setLoading(false);
                },
                { enableHighAccuracy: true }
            );
        } else {
            console.error("Geolocation is not supported by this browser");
            setPosition([51.505, -0.09]); // Default fallback
            setLoading(false);
        }
    }, []);

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
                                center={position || [-1.286389, 36.817223]} // Default to Nairobi if position not yet available
                                zoom={13}
                                scrollWheelZoom={true}
                                style={{ width: "100%", height: "500px" }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker position={position} setPosition={setPosition} />
                            </MapContainer>
                        )}
                    </div>
                </div>
                
                <div className="request-panel">
                    <h2>Request an Ambulance</h2>
                    <div className="ambulance-request-form-container">
                        {AmbulanceRequestForm && <AmbulanceRequestForm position={position} />}
                    </div>
                    
                    <div className="request-confirmation-container">
                        {RequestConfirmationPanel && <RequestConfirmationPanel />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
