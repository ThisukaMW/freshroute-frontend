import React, { useState } from "react";

interface Address {
  address: string;
  latitude: number;
  longitude: number;
}

interface AddressSelectorProps {
  currentAddress: Address;
  onAddressChange: (address: Address) => void;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({
  currentAddress,
  onAddressChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAddress, setEditedAddress] = useState(currentAddress.address);
  const [editedLat, setEditedLat] = useState(String(currentAddress.latitude));
  const [editedLng, setEditedLng] = useState(String(currentAddress.longitude));
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    // Validate inputs
    if (!editedAddress.trim()) {
      setError("Address cannot be empty");
      return;
    }

    const lat = parseFloat(editedLat);
    const lng = parseFloat(editedLng);

    if (isNaN(lat) || isNaN(lng)) {
      setError("Latitude and Longitude must be valid numbers");
      return;
    }

    if (lat < -90 || lat > 90) {
      setError("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      setError("Longitude must be between -180 and 180");
      return;
    }

    onAddressChange({
      address: editedAddress.trim(),
      latitude: lat,
      longitude: lng,
    });

    setError(null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedAddress(currentAddress.address);
    setEditedLat(String(currentAddress.latitude));
    setEditedLng(String(currentAddress.longitude));
    setError(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-300">Delivery Address</h3>

      {!isEditing ? (
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-2">
          <p className="text-sm text-slate-100">{currentAddress.address}</p>
          <p className="text-xs text-slate-500">
            📍 {currentAddress.latitude.toFixed(4)},{" "}
            {currentAddress.longitude.toFixed(4)}
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
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Delivery Address
            </label>
            <input
              type="text"
              value={editedAddress}
              onChange={(e) => setEditedAddress(e.target.value)}
              placeholder="Enter delivery address"
              className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-supply-teal"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={editedLat}
                onChange={(e) => setEditedLat(e.target.value)}
                placeholder="0.0000"
                className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-supply-teal"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="0.0001"
                value={editedLng}
                onChange={(e) => setEditedLng(e.target.value)}
                placeholder="0.0000"
                className="w-full rounded-lg bg-slate-900 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-supply-teal"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-lg bg-supply-teal px-3 py-2 text-xs font-medium text-slate-950 hover:bg-supply-teal/90"
            >
              Save Address
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
