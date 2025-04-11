import React, { useState, useEffect, useRef } from "react";

function AmbulanceRequestForm({ position, onRequestSubmit, onHospitalSelect }) {
  const [hospitals, setHospitals] = useState([
    { id: 1, name: "Hospital A", favorite: true },
    { id: 2, name: "Hospital B", favorite: true },
  ]);
  
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // Error state
  const searchInputRef = useRef(null);
  
  useEffect(() => {
    const isUserTyping = document.activeElement === searchInputRef.current;
    if (position && searchTerm.length > 0 && isUserTyping) {
      fetchNearbyHospitals(position);
    }
  }, [position, searchTerm]);
  
  useEffect(() => {
    if (selectedHospital && onHospitalSelect) {
      onHospitalSelect(selectedHospital);
    }
  }, [selectedHospital, onHospitalSelect]);
  
  const fetchNearbyHospitals = async (position) => {
    setIsLoading(true);
    setError(null); // Reset error before making the request
    try {
      const [lat, lng] = position;
      const radius = 5000; // 5km radius
      
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lng});
          way["amenity"="hospital"](around:${radius},${lat},${lng});
          relation["amenity"="hospital"](around:${radius},${lat},${lng});
          node["amenity"="clinic"](around:${radius},${lat},${lng});
          way["amenity"="clinic"](around:${radius},${lat},${lng});
          relation["amenity"="clinic"](around:${radius},${lat},${lng});
        );
        out center;
      `;
      
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
      });
      
      if (response.ok) {
        const data = await response.json();
        
        const hospitals = data.elements.map((item, index) => {
          const [itemLat, itemLng] = getCoordinates(item);
          
          return {
            id: `osm-${item.id}`,
            name: item.tags.name || `Hospital ${index + 1}`,
            address: getAddress(item),
            position: [itemLat, itemLng],
            distance: calculateDistance(position, [itemLat, itemLng]),
            favorite: false
          };
        });
        
        const sortedHospitals = hospitals
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
          .slice(0, 5);
        
        setNearbyHospitals(sortedHospitals);
      } else {
        throw new Error("Failed to fetch nearby hospitals");
      }
    } catch (error) {
      setError("Failed to load hospitals. Please try again later.");
      console.error("Error fetching nearby hospitals:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getCoordinates = (item) => {
    if (item.type === "node") {
      return [item.lat, item.lon];
    } else {
      return [item.center.lat, item.center.lon];
    }
  };
  
  const getAddress = (item) => {
    return item.tags["addr:street"] ? 
      `${item.tags["addr:street"]} ${item.tags["addr:housenumber"] || ""}` : 
      "Address unavailable";
  };
  
  const calculateDistance = (point1, point2) => {
    const [lat1, lon1] = point1;
    const [lat2, lon2] = point2;
    
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c;
    return distance.toFixed(1);
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  const calculateETA = (distance) => {
    const timeInMinutes = Math.round((parseFloat(distance) / 60) * 60);
    return timeInMinutes < 1 ? 1 : timeInMinutes;
  };
  
  const addToFavorites = (hospital, e) => {
    e.stopPropagation();
    
    const existingIndex = hospitals.findIndex(h => h.id === hospital.id);
    if (existingIndex >= 0) return;
    
    const favoriteHospital = { ...hospital, favorite: true };
    
    if (hospitals.filter(h => h.favorite).length >= 2) {
      const favHospitals = hospitals.filter(h => h.favorite);
      const nonFavHospitals = hospitals.filter(h => !h.favorite);
      const updatedFavorites = [...favHospitals.slice(1), favoriteHospital];
      setHospitals([...nonFavHospitals, ...updatedFavorites]);
    } else {
      setHospitals([...hospitals, favoriteHospital]);
    }
  };
  
  const filteredHospitals = searchTerm ? 
    nearbyHospitals.filter(hospital => 
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    if (selectedHospital && e.target.value !== selectedHospital.name) {
      setSelectedHospital(null);
    }
  };
  
  const handleHospitalSelect = (hospital) => {
    setSelectedHospital(hospital);
    setSearchTerm(hospital.name);
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!position || !selectedHospital) {
      setError("Please select a hospital and make sure your location is set.");
      return;
    }
    
    const hospital = selectedHospital;
    const distance = selectedHospital.distance;
    const eta = calculateETA(distance);
    
    const requestData = {
      position,
      hospital,
      paymentMethod,
      timestamp: new Date().toISOString(),
      distance,
      eta
    };
    
    if (onRequestSubmit) {
      onRequestSubmit(requestData);
    }
  };
  
  const isFavorite = (hospitalId) => {
    return hospitals.some(h => h.id === hospitalId && h.favorite);
  };
  
  const renderHospitalItem = (hospital, isInSearchResults = false) => (
    <div 
      key={hospital.id} 
      className={`hospital-item ${selectedHospital && selectedHospital.id === hospital.id ? 'selected' : ''}`}
      onClick={() => handleHospitalSelect(hospital)}
    >
      <div className="hospital-info">
        <span 
          className={`star-icon ${isFavorite(hospital.id) ? 'favorite' : ''}`}
          onClick={(e) => addToFavorites(hospital, e)}
        >
          ★
        </span>
        <span>{hospital.name}</span>
      </div>
      {isInSearchResults && <span className="hospital-distance">{hospital.distance} km</span>}
    </div>
  );
  
  const favoriteHospitals = hospitals.filter(h => h.favorite);
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={searchInputRef}
        type="text"
        placeholder="Search Nearby Hospitals"
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />
      
      <div className="hospitals-container">
        {error && <div className="error-message">{error}</div>}
        
        {isLoading ? (
          <div className="loading-hospitals">Searching for nearby hospitals...</div>
        ) : (
          searchTerm && filteredHospitals.length > 0 && (
            <div className="search-results">
              <h3>Search Results</h3>
              {filteredHospitals.map(hospital => renderHospitalItem(hospital, true))}
            </div>
          )
        )}
        
        <div className="favourite-hospitals" style={{ marginTop: '20px' }}>
          <h3>Favourite Hospitals</h3>
          {favoriteHospitals.length > 0 ? (
            favoriteHospitals.map(hospital => renderHospitalItem(hospital))
          ) : (
            <div className="no-favorites">No favorite hospitals yet</div>
          )}
        </div>
      </div>
      
      <div className="form-group">
        <label>Payment Method</label>
        <select 
          value={paymentMethod} 
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="Cash">Cash</option>
          <option value="Mpesa">Mpesa</option>
          <option value="Insurance">Insurance</option>
        </select>
      </div>
      
      <button 
        type="submit"
        className="request-btn" 
        disabled={!position || !selectedHospital || !paymentMethod}
      >
        Request
      </button>
    </form>
  );
}

export default AmbulanceRequestForm;
