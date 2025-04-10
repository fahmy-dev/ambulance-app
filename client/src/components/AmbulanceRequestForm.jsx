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
  const searchInputRef = useRef(null);
  
  useEffect(() => {
    const isUserTyping = document.activeElement === searchInputRef.current;
    if (position && searchTerm.length > 0 && isUserTyping) {
      fetchNearbyHospitals(position);
    }
  }, [position, searchTerm]);
  
  // Pass selected hospital to parent component
  useEffect(() => {
    if (selectedHospital && onHospitalSelect) {
      onHospitalSelect(selectedHospital);
    }
  }, [selectedHospital, onHospitalSelect]);
  
  const fetchNearbyHospitals = async (position) => {
    setIsLoading(true);
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
          // Get coordinates (different format for nodes vs ways/relations)
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
        
        // Sort by distance and limit to 5 nearest hospitals
        const sortedHospitals = hospitals
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
          .slice(0, 5);
        
        setNearbyHospitals(sortedHospitals);
      } else {
        console.error("Failed to fetch nearby hospitals");
      }
    } catch (error) {
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
    
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance.toFixed(1);
  };
  
  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };
  
  const calculateETA = (distance) => {
    // Assuming average ambulance speed of 60 km/h in urban areas
    const timeInMinutes = Math.round((parseFloat(distance) / 60) * 60);
    return timeInMinutes < 1 ? 1 : timeInMinutes; // Minimum 1 minute
  };
  
  const addToFavorites = (hospital, e) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    
    // Check if hospital is already in favorites
    const existingIndex = hospitals.findIndex(h => h.id === hospital.id);
    if (existingIndex >= 0) return;
    
    // Create a copy of the hospital with favorite set to true
    const favoriteHospital = { ...hospital, favorite: true };
    
    // If we already have 2 favorites, remove the oldest one
    if (hospitals.filter(h => h.favorite).length >= 2) {
      // Get only the favorite hospitals
      const favHospitals = hospitals.filter(h => h.favorite);
      // Get non-favorite hospitals
      const nonFavHospitals = hospitals.filter(h => !h.favorite);
      
      // Remove the first (oldest) favorite and add the new one
      const updatedFavorites = [...favHospitals.slice(1), favoriteHospital];
      
      // Combine non-favorites with updated favorites
      setHospitals([...nonFavHospitals, ...updatedFavorites]);
    } else {
      // Otherwise just add the new favorite
      setHospitals([...hospitals, favoriteHospital]);
    }
  };
  
  const filteredHospitals = searchTerm ? 
    nearbyHospitals.filter(hospital => 
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Clear selected hospital when user types in search
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
    
    // Use the selected hospital or default to first favorite
    const hospital = selectedHospital || hospitals[0];
    const distance = selectedHospital ? selectedHospital.distance : "3.2";
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
        {/* Search results section */}
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
        
        {/* Favorites section - always visible */}
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
        disabled={!position || !paymentMethod}
      >
        Request
      </button>
    </form>
  );
}

export default AmbulanceRequestForm;