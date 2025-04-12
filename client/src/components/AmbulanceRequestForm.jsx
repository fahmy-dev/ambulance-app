import React, { useState, useEffect, useRef } from "react";
import api from "../utils/api"; // Add this import

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
      const radius = 10000; // Increased to 10km radius for better coverage
      
      const query = `
        [out:json];
        (
          node["amenity"="hospital"](around:${radius},${lat},${lng});
          way["amenity"="hospital"](around:${radius},${lat},${lng});
          relation["amenity"="hospital"](around:${radius},${lat},${lng});
          node["amenity"="clinic"](around:${radius},${lat},${lng});
          way["amenity"="clinic"](around:${radius},${lat},${lng});
          relation["amenity"="clinic"](around:${radius},${lat},${lng});
          node["healthcare"="hospital"](around:${radius},${lat},${lng});
          way["healthcare"="hospital"](around:${radius},${lat},${lng});
          relation["healthcare"="hospital"](around:${radius},${lat},${lng});
          node["healthcare"="centre"](around:${radius},${lat},${lng});
          way["healthcare"="centre"](around:${radius},${lat},${lng});
          relation["healthcare"="centre"](around:${radius},${lat},${lng});
          node["healthcare"="clinic"](around:${radius},${lat},${lng});
          way["healthcare"="clinic"](around:${radius},${lat},${lng});
          relation["healthcare"="clinic"](around:${radius},${lat},${lng});
        );
        out center;
      `;
      
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
      });
      
      if (response.ok) {
        const data = await response.json();
        
        const hospitals = data.elements
          .filter(item => item.tags && (item.tags.name || item.tags['name:en']))
          .map((item, index) => {
            const [itemLat, itemLng] = getCoordinates(item);
            const name = item.tags.name || item.tags['name:en'] || `Medical Facility ${index + 1}`;
            const type = item.tags.amenity || item.tags.healthcare || 'medical';
            
            return {
              id: `osm-${item.id}`,
              name: name,
              type: type,
              address: getAddress(item),
              position: [itemLat, itemLng],
              distance: calculateDistance(position, [itemLat, itemLng]),
              favorite: false
            };
          });
        
        // Remove duplicates by name
        const uniqueHospitals = removeDuplicates(hospitals, 'name');
        
        // Sort by distance
        const sortedHospitals = uniqueHospitals.sort((a, b) => 
          parseFloat(a.distance) - parseFloat(b.distance)
        );
        
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
  
  const removeDuplicates = (array, key) => {
    return array.filter((item, index, self) => 
      index === self.findIndex((t) => t[key] === item[key])
    );
  };
  
  const getCoordinates = (item) => {
    if (item.type === "node") {
      return [item.lat, item.lon];
    } else if (item.center) {
      return [item.center.lat, item.center.lon];
    } else {
      return [0, 0]; // Fallback
    }
  };
  
  const getAddress = (item) => {
    if (!item.tags) return "Address unavailable";
    
    const street = item.tags["addr:street"] || "";
    const housenumber = item.tags["addr:housenumber"] || "";
    const city = item.tags["addr:city"] || "";
    
    if (street || housenumber || city) {
      return `${street} ${housenumber}, ${city}`.trim();
    }
    
    return "Address unavailable";
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
  
  const calculateRelevanceScore = (hospital, searchTerm) => {
    const name = hospital.name.toLowerCase();
    const search = searchTerm.toLowerCase();
    
    // Exact match gets highest score
    if (name === search) return 100;
    
    // Contains full search term
    if (name.includes(search)) return 80;
    
    // Check if it's a hospital or medical center
    const isHospitalOrMedical = 
      name.includes('hospital') || 
      name.includes('medical') || 
      name.includes('clinic') || 
      name.includes('centre') || 
      name.includes('center');
    
    if (isHospitalOrMedical) {
      // Check if any word in the search term is in the name
      const searchWords = search.split(' ');
      for (const word of searchWords) {
        if (word.length > 2 && name.includes(word)) {
          return 60;
        }
      }
      
      // Check if any part of the search term matches
      for (let i = 0; i < search.length - 2; i++) {
        const part = search.substring(i, i + 3);
        if (name.includes(part)) {
          return 40;
        }
      }
      
      // It's a hospital/medical center but doesn't match the search term
      return 20;
    }
    
    // Not a hospital/medical center and doesn't match
    return 0;
  };
  
  const filteredHospitals = searchTerm ? 
    nearbyHospitals
      .map(hospital => ({
        ...hospital,
        relevance: calculateRelevanceScore(hospital, searchTerm)
      }))
      .filter(hospital => hospital.relevance > 0)
      .sort((a, b) => {
        // First sort by relevance
        if (b.relevance !== a.relevance) {
          return b.relevance - a.relevance;
        }
        // Then by distance if relevance is the same
        return parseFloat(a.distance) - parseFloat(b.distance);
      })
      .slice(0, 5) : [];
  
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
      hospital_name: hospital.name,
      payment: paymentMethod,  // Changed from payment_method to payment
      distance: distance,
      eta: eta
    };
    
    // Send the request to the server
    api.requests.create(requestData)
      .then(response => {
        console.log("Ambulance request created:", response);
        
        // Pass the full data including the response from server to the parent component
        if (onRequestSubmit) {
          onRequestSubmit({
            ...requestData,
            id: response.id,
            hospital,
            position,
            timestamp: new Date().toISOString()
          });
        }
      })
      .catch(err => {
        console.error("Failed to create ambulance request:", err);
        setError("Failed to send request. Please try again.");
      });
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
        <div className="hospital-details">
          <span className="hospital-name">{hospital.name}</span>
          <span className="hospital-type">{hospital.type}</span>
        </div>
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
