/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useCallback } from "react";

interface Address {
  address: string;
  latitude: number;
  longitude: number;
}

interface AddressSelectorProps {
  currentAddress: Address;
  onAddressChange: (address: Address) => void;
}

declare const google: any;

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const AddressSelector: React.FC<AddressSelectorProps> = ({
  currentAddress,
  onAddressChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAddress, setEditedAddress] = useState(currentAddress.address);
  const [editedLat, setEditedLat] = useState(currentAddress.latitude);
  const [editedLng, setEditedLng] = useState(currentAddress.longitude);
  const [error, setError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Load Google Maps script once ─────────────────────────────────────────
  useEffect(() => {
    if ((window as any).google?.maps) {
      setMapLoaded(true);
      return;
    }

    if (document.getElementById("google-maps-script")) return;

    (window as any).initGoogleMaps = () => setMapLoaded(true);

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // ── Update marker + reverse geocode ──────────────────────────────────────
  const updateMarkerAndAddress = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    const pos = { lat, lng };
    markerRef.current.setPosition(pos);
    mapInstanceRef.current.panTo(pos);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: pos }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        setEditedAddress(results[0].formatted_address);
      }
    });

    setEditedLat(lat);
    setEditedLng(lng);
  }, []);

  // ── Init map after script loads and panel opens ───────────────────────────
  useEffect(() => {
    if (!mapLoaded || !isEditing || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    const center = {
      lat: editedLat || 6.9271,  // default: Colombo
      lng: editedLng || 79.8612,
    };

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom: 15,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1a2035" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1a2035" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#2d3f5a" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#0f172a" }],
        },
        {
          featureType: "poi",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    const marker = new google.maps.Marker({
      position: center,
      map,
      draggable: true,
      title: "Drag to set delivery location",
      animation: google.maps.Animation.DROP,
    });

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      updateMarkerAndAddress(pos.lat(), pos.lng());
    });

    map.addListener("click", (e: any) => {
      updateMarkerAndAddress(e.latLng.lat(), e.latLng.lng());
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    if (inputRef.current) {
      const ac = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode"],
      });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (!place.geometry) return;
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setEditedAddress(place.formatted_address || place.name);
        updateMarkerAndAddress(lat, lng);
      });
      autocompleteRef.current = ac;
    }
  }, [mapLoaded, isEditing, editedLat, editedLng, updateMarkerAndAddress]);

  // ── Cleanup on close ─────────────────────────────────────────────────────
  const closeEditing = () => {
    mapInstanceRef.current = null;
    markerRef.current = null;
    autocompleteRef.current = null;
    setIsEditing(false);
    setError(null);
  };

  // ── GPS location ─────────────────────────────────────────────────────────
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateMarkerAndAddress(pos.coords.latitude, pos.coords.longitude);
        setLoadingLocation(false);
      },
      () => {
        setError("Could not get your location. Please allow location access.");
        setLoadingLocation(false);
      }
    );
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!editedAddress.trim()) {
      setError("Address cannot be empty");
      return;
    }
    if (editedLat === 0 && editedLng === 0) {
      setError("Please select a location on the map");
      return;
    }
    onAddressChange({
      address: editedAddress.trim(),
      latitude: editedLat,
      longitude: editedLng,
    });
    closeEditing();
  };

  // ── Cancel ───────────────────────────────────────────────────────────────
  const handleCancel = () => {
    setEditedAddress(currentAddress.address);
    setEditedLat(currentAddress.latitude);
    setEditedLng(currentAddress.longitude);
    closeEditing();
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-300">Delivery Address</h3>

      {/* Display mode */}
      {!isEditing ? (
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-2">
          <p className="text-sm text-slate-100">{currentAddress.address}</p>
          <p className="text-xs text-slate-500">
            📍 {currentAddress.latitude?.toFixed(4)},{" "}
            {currentAddress.longitude?.toFixed(4)}
          </p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs text-supply-teal hover:text-supply-teal/80 font-medium"
          >
            ✏️ Edit Address
          </button>
        </div>
      ) : (
        /* Edit mode */
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3">

          {/* Search + GPS */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Search address
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={editedAddress}
                onChange={(e) => setEditedAddress(e.target.value)}
                placeholder="Type to search address..."
                className="flex-1 rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-supply-teal"
              />
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={loadingLocation}
                title="Use my current location"
                className="rounded-lg bg-slate-800 border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-50 whitespace-nowrap"
              >
                {loadingLocation ? "Locating…" : "📍 My Location"}
              </button>
            </div>
          </div>

          {/* Map container */}
          <div className="relative">
            {!mapLoaded && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-slate-900 text-xs text-slate-400">
                Loading map…
              </div>
            )}
            <div
              ref={mapRef}
              className="w-full h-56 rounded-xl overflow-hidden border border-white/10"
            />
            <p className="mt-1.5 text-[11px] text-slate-500 text-center">
              Click on the map or drag the pin to set your exact delivery location
            </p>
          </div>

          {/* Coordinates (read only) */}
          {editedLat !== 0 && editedLng !== 0 && (
            <div className="rounded-lg bg-slate-900/60 border border-white/5 px-3 py-2 text-[11px] text-slate-400">
              📍 {editedLat.toFixed(6)}, {editedLng.toFixed(6)}
            </div>
          )}

          {/* Error */}
          {error && <p className="text-xs text-red-400">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-lg bg-supply-teal px-3 py-2 text-xs font-medium text-slate-950 hover:bg-supply-teal/90"
            >
              Confirm Location
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;