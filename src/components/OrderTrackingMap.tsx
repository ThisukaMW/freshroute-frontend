// components/OrderTrackingMap.tsx
// Live delivery tracking map for an order that's currently IN_TRANSIT.
// Polls the backend for the assigned driver's current GPS position and
// re-renders the marker on the map, without needing a full page reload.
import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getOrderTracking, type OrderTracking } from '../api/endpoints/orders'

interface OrderTrackingMapProps {
  orderId: string
  pollIntervalMs?: number
}

const driverIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'order-tracking-driver-marker',
})

const destinationIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({
  orderId,
  pollIntervalMs = 8000,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const driverMarkerRef = useRef<L.Marker | null>(null)
  const destinationMarkerRef = useRef<L.Marker | null>(null)

  const [tracking, setTracking] = useState<OrderTracking | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Poll the backend for the driver's latest position.
  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const data = await getOrderTracking(orderId)
        if (!cancelled) {
          setTracking(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError('Could not load live tracking right now.')
      }
    }

    poll()
    const interval = setInterval(poll, pollIntervalMs)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [orderId, pollIntervalMs])

  // Initialize the map once we have a first position to center on.
  useEffect(() => {
    if (!tracking?.available || !tracking.driverLocation || !mapContainerRef.current) return

    const { latitude, longitude } = tracking.driverLocation

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, { zoomControl: true }).setView(
        [latitude, longitude],
        14
      )
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      driverMarkerRef.current = L.marker([latitude, longitude], { icon: driverIcon })
        .addTo(map)
        .bindPopup('Driver')

      if (tracking.destination) {
        destinationMarkerRef.current = L.marker(
          [tracking.destination.latitude, tracking.destination.longitude],
          { icon: destinationIcon }
        )
          .addTo(map)
          .bindPopup('Delivery address')

        map.fitBounds(
          L.latLngBounds(
            [latitude, longitude],
            [tracking.destination.latitude, tracking.destination.longitude]
          ),
          { padding: [40, 40] }
        )
      }
    } else {
      // Map already exists — just move the driver marker, don't recreate it
      // (recreating on every poll would reset zoom/pan and flicker).
      driverMarkerRef.current?.setLatLng([latitude, longitude])
    }
  }, [tracking])

  // Clean up the map instance when the component unmounts.
  useEffect(() => {
    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
        {error}
      </div>
    )
  }

  if (!tracking) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-sm text-slate-400">
        Loading live tracking...
      </div>
    )
  }

  if (!tracking.available) {
    return (
      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-400">
        Live tracking isn't available yet — it opens up once this order is out for delivery.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div
        ref={mapContainerRef}
        className="h-64 w-full overflow-hidden rounded-2xl border border-white/10"
      />
      {tracking.driver && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-xs text-slate-300">
          <div>
            <p className="font-semibold text-slate-100">{tracking.driver.name}</p>
            <p className="text-slate-400">
              {tracking.driver.vehicleType ?? 'Vehicle'}
              {tracking.driver.vehicleNumber ? ` · ${tracking.driver.vehicleNumber}` : ''}
            </p>
          </div>
          {tracking.driver.phone && (
            <a
              href={`tel:${tracking.driver.phone}`}
              className="rounded-xl border border-white/10 px-3 py-1.5 text-slate-200 hover:bg-white/10"
            >
              {tracking.driver.phone}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default OrderTrackingMap
