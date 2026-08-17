// components/MapAddressPicker.tsx
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MapAddressPickerProps {
  address: string
  onChange: (data: { address: string; city: string; lat: number; lng: number }) => void
  initialLat?: number
  initialLng?: number
}

const DEFAULT_CENTER: [number, number] = [6.9271, 79.8612] // Colombo

// Fix default marker icons (Leaflet's default icon paths break with bundlers)
const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const MapAddressPicker = ({ address, onChange, initialLat, initialLng }: MapAddressPickerProps) => {
  const mapRef    = useRef<HTMLDivElement>(null)
  const mapObj    = useRef<L.Map | null>(null)
  const marker    = useRef<L.Marker | null>(null)
  const [resolvedAddress, setResolvedAddress] = useState(address)
  const [loadingAddr, setLoadingAddr] = useState(false)

  const reverseGeocode = async (lat: number, lng: number) => {
    setLoadingAddr(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      const formatted = data?.display_name ?? ''
      const city =
        data?.address?.city ?? data?.address?.town ?? data?.address?.village ??
        data?.address?.suburb ?? data?.address?.county ?? ''
      setResolvedAddress(formatted)
      onChange({ address: formatted, city, lat, lng })
    } catch {
      onChange({ address: resolvedAddress, city: '', lat, lng })
    } finally {
      setLoadingAddr(false)
    }
  }

  useEffect(() => {
    if (!mapRef.current || mapObj.current) return

    const center: [number, number] =
      initialLat && initialLng ? [initialLat, initialLng] : DEFAULT_CENTER

    const map = L.map(mapRef.current, { zoomControl: true }).setView(center, 15)
    mapObj.current = map

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const m = L.marker(center, { icon: markerIcon, draggable: true }).addTo(map)
    marker.current = m

    m.on('dragend', () => {
      const pos = m.getLatLng()
      reverseGeocode(pos.lat, pos.lng)
    })

    map.on('click', (e: L.LeafletMouseEvent) => {
      m.setLatLng(e.latlng)
      reverseGeocode(e.latlng.lat, e.latlng.lng)
    })

    if (initialLat && initialLng && !address) {
      reverseGeocode(initialLat, initialLng)
    }

    return () => {
      map.remove()
      mapObj.current = null
    }
  }, [])

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        mapObj.current?.setView([lat, lng], 16)
        marker.current?.setLatLng([lat, lng])
        reverseGeocode(lat, lng)
      },
      undefined,
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={useMyLocation}
          className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 hover:bg-white/10"
        >
          📍 Use my location
        </button>
      </div>
      <div ref={mapRef} className="h-56 w-full rounded-xl border border-white/10 overflow-hidden" />
      {loadingAddr && (
        <p className="text-xs text-slate-400">Looking up address…</p>
      )}
      {!loadingAddr && resolvedAddress && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300">
          📍 {resolvedAddress}
        </p>
      )}
      <p className="text-[10px] text-slate-400">Drag the pin or tap the map to fine-tune your exact location.</p>
    </div>
  )
}

export default MapAddressPicker