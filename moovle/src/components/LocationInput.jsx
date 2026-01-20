import { useState, useRef, useEffect } from "react";
import { MapPin, X, Loader2, AlertTriangle } from "lucide-react";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance for display
function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  } else if (km < 10) {
    return `${km.toFixed(1)} km`;
  } else {
    return `${Math.round(km)} km`;
  }
}

export default function LocationInput({
  value,
  onChange,
  placeholder = "Search for a location...",
  type = "all", // 'all' or 'city'
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lng: position.coords.longitude,
            lat: position.coords.latitude,
          });
        },
        (error) => {
          console.log("Geolocation not available:", error.message);
        },
      );
    }
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync external value changes
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const searchLocations = async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Use Mapbox Search Box API for better POI results (restaurants, shops, etc.)
      let url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
        searchQuery,
      )}&access_token=${MAPBOX_TOKEN}&session_token=moovle-session&limit=5&language=en`;

      // Add proximity parameter to bias results towards user's location
      if (userLocation) {
        url += `&proximity=${userLocation.lng},${userLocation.lat}`;
      }

      // If type is 'city', add types=place to Mapbox API (place = city/town/village)
      if (type === "city") {
        url += `&types=place,locality`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.suggestions) {
        // For each suggestion, we need to retrieve full details
        let filteredSuggestions = data.suggestions;
        // If type is 'city', filter suggestions to only those with type 'place' (city/town/village)
        if (type === "city") {
          filteredSuggestions = filteredSuggestions.filter(
            (s) =>
              (s.types &&
                (s.types.includes("place") || s.types.includes("locality"))) ||
              s.feature_type === "place" ||
              s.feature_type === "locality",
          );
        }
        const suggestionsWithDetails = await Promise.all(
          filteredSuggestions.map(async (suggestion) => {
            // Get full place details to get coordinates
            const retrieveUrl = `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?access_token=${MAPBOX_TOKEN}&session_token=moovle-session`;
            const detailResponse = await fetch(retrieveUrl);
            const detailData = await detailResponse.json();

            const feature = detailData.features?.[0];
            const coords = feature?.geometry?.coordinates
              ? {
                  lng: feature.geometry.coordinates[0],
                  lat: feature.geometry.coordinates[1],
                }
              : null;
            // Calculate distance if user location and coords are available
            const distance =
              userLocation && coords
                ? calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    coords.lat,
                    coords.lng,
                  )
                : null;

            return {
              id: suggestion.mapbox_id,
              name: suggestion.name,
              fullAddress:
                suggestion.full_address ||
                suggestion.place_formatted ||
                suggestion.name,
              coordinates: coords,
              distance,
              category: suggestion.poi_category_ids?.[0] || null,
              country: suggestion.context?.country?.name || null,
            };
          }),
        );

        setSuggestions(suggestionsWithDetails);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Always update parent with current text (allows free text input)
    onChange(newQuery, null);

    // Debounce the API call
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      searchLocations(newQuery);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    onChange(suggestion.name, suggestion.coordinates, suggestion.country || "");
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    onChange("", null);
  };

  // Handle pressing Enter to use free text
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setShowSuggestions(false);
      onChange(query, null);
    }
    if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
        />
        {isLoading && (
          <Loader2
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
            size={18}
          />
        )}
        {!isLoading && query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-gray-100"
            >
              <MapPin className="text-coral-500 mt-0.5 shrink-0" size={16} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-800 truncate">
                    {suggestion.name}
                  </span>
                  {suggestion.distance !== null && (
                    <span className="text-xs text-coral-500 font-medium whitespace-nowrap">
                      {formatDistance(suggestion.distance)}
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500 truncate">
                  {suggestion.fullAddress}
                </div>
              </div>
            </button>
          ))}
          {/* Option to use custom text */}
          <button
            type="button"
            onClick={() => {
              setShowSuggestions(false);
              onChange(query, null);
            }}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-slate-600 bg-gray-50"
          >
            <span className="text-slate-400">↵</span>
            <span>
              Use "<span className="font-medium">{query}</span>" as location
            </span>
          </button>
        </div>
      )}

      {/* No token warning */}
      {!MAPBOX_TOKEN && (
        <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
          <AlertTriangle size={12} />
          Add VITE_MAPBOX_TOKEN to your .env file for location search
        </div>
      )}
    </div>
  );
}
