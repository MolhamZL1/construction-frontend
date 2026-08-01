import { useCallback, useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { EXTERNAL_SERVICES } from '@/config/design-system'

const MAP_CONFIG = EXTERNAL_SERVICES.maps

const defaultIcon = L.icon({
  iconUrl: MAP_CONFIG.markerIconUrl,
  iconRetinaUrl: MAP_CONFIG.markerRetinaIconUrl,
  shadowUrl: MAP_CONFIG.markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface LocationPickerMapProps {
  value: { lat: number; lng: number }
  onChange: (lat: number, lng: number) => void
  onLocationNameChange?: (name: string) => void
  height?: string
  defaultToUserLocation?: boolean
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapViewUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, zoom)
  }, [center, map, zoom])
  return null
}

export function LocationPickerMap({
  value,
  onChange,
  onLocationNameChange,
  height = '280px',
  defaultToUserLocation = true,
}: LocationPickerMapProps) {
  const handleChange = useCallback(
    (lat: number, lng: number) => {
      onChange(
        Math.round(lat * 1000000) / 1000000,
        Math.round(lng * 1000000) / 1000000
      )
    },
    [onChange]
  )

  const [searchText, setSearchText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isLocatingUser, setIsLocatingUser] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const setLocationNameFromCoords = useCallback(
    async (lat: number, lng: number) => {
      const fallbackName = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      onLocationNameChange?.(fallbackName)

      try {
        const response = await fetch(
          `${MAP_CONFIG.reverseGeocodeUrl}?format=jsonv2&lat=${lat}&lon=${lng}`
        )

        if (!response.ok) {
          return
        }

        const result = (await response.json()) as { display_name?: string }
        if (result.display_name) {
          setSearchText(result.display_name)
          onLocationNameChange?.(result.display_name)
        }
      } catch {
        return
      }
    },
    [onLocationNameChange]
  )

  const selectLocation = useCallback(
    (lat: number, lng: number) => {
      const roundedLat = Math.round(lat * 1000000) / 1000000
      const roundedLng = Math.round(lng * 1000000) / 1000000

      handleChange(roundedLat, roundedLng)
      void setLocationNameFromCoords(roundedLat, roundedLng)
    },
    [handleChange, setLocationNameFromCoords]
  )

  useEffect(() => {
    if (!defaultToUserLocation || value.lat !== 0 || value.lng !== 0 || !navigator.geolocation) {
      return
    }

    setIsLocatingUser(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        selectLocation(position.coords.latitude, position.coords.longitude)
        setIsLocatingUser(false)
      },
      () => {
        setIsLocatingUser(false)
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 8000 }
    )
  }, [defaultToUserLocation, selectLocation, value.lat, value.lng])

  async function handleSearch() {
    const query = searchText.trim()

    if (!query) {
      setSearchError('ادخل اسم موقع للبحث')
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      const response = await fetch(
        `${MAP_CONFIG.searchUrl}?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`
      )

      if (!response.ok) {
        throw new Error('search_failed')
      }

      const results = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>
      const result = results[0]

      if (!result) {
        setSearchError('لم يتم العثور على هذا الموقع')
        return
      }

      const lat = Number(result.lat)
      const lng = Number(result.lon)
      handleChange(lat, lng)
      setSearchText(result.display_name)
      onLocationNameChange?.(result.display_name)
    } catch {
      setSearchError('تعذر البحث عن الموقع حالياً')
    } finally {
      setIsSearching(false)
    }
  }

  const center: [number, number] =
    value.lat !== 0 && value.lng !== 0 ? [value.lat, value.lng] : [MAP_CONFIG.defaultCenter[0], MAP_CONFIG.defaultCenter[1]]

  const hasMarker = value.lat !== 0 || value.lng !== 0

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[var(--color-brand-gold)] focus:ring-4 focus:ring-[rgb(var(--color-brand-gold-rgb)/0.1)]"
          placeholder="ابحث عن موقع المشروع"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void handleSearch()
            }
          }}
        />
        <button
          type="button"
          onClick={() => void handleSearch()}
          disabled={isSearching}
          className="inline-flex h-10 shrink-0 items-center rounded-xl bg-[var(--color-brand-ink)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-brand-ink)] disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isSearching ? 'جاري البحث...' : 'بحث'}
        </button>
      </div>
      {searchError ? <p className="text-xs text-rose-600">{searchError}</p> : null}
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm" style={{ height }}>
        <MapContainer
          center={center}
          zoom={hasMarker ? MAP_CONFIG.selectedZoom : MAP_CONFIG.defaultZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution={MAP_CONFIG.attributionHtml}
            url={MAP_CONFIG.tileUrl}
          />
          <MapViewUpdater center={center} zoom={hasMarker ? MAP_CONFIG.selectedZoom : MAP_CONFIG.defaultZoom} />
          <ClickHandler onChange={selectLocation} />
          {hasMarker ? <Marker position={[value.lat, value.lng]} icon={defaultIcon} /> : null}
        </MapContainer>
      </div>
      <p className="text-xs text-slate-400">
        {isLocatingUser ? 'جاري تحديد موقعك الحالي...' : 'انقر على الخريطة لتحديد موقع المشروع'}
      </p>
    </div>
  )
}
