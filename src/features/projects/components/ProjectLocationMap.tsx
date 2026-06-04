import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix default marker icon issue with bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface ProjectLocationMapProps {
  latitude: number
  longitude: number
  projectName?: string
  height?: string
}

function ResizeMap() {
  const map = useMap()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      map.invalidateSize()
    }, 100)

    return () => window.clearTimeout(timeout)
  }, [map])

  return null
}

export function ProjectLocationMap({
  latitude,
  longitude,
  projectName,
  height = '320px',
}: ProjectLocationMapProps) {
  const isValidCoords =
    !isNaN(latitude) && !isNaN(longitude) && latitude !== 0 && longitude !== 0

  if (!isValidCoords) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400"
        style={{ height }}
      >
        <div className="text-center">
          <svg className="mx-auto mb-2 h-8 w-8 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <p>لا توجد إحداثيات للعرض</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm" style={{ height }}>
      <MapContainer
        key={`${latitude}-${longitude}`}
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ResizeMap />
        <Marker position={[latitude, longitude]} icon={defaultIcon}>
          {projectName ? (
            <Popup>
              <strong>{projectName}</strong>
            </Popup>
          ) : null}
        </Marker>
      </MapContainer>
    </div>
  )
}
