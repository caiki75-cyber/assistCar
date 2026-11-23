'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

export interface LatLng {
  lat: number
  lng: number
}

// Ícones em emoji (evita o problema dos ícones padrão do Leaflet com bundlers)
const emojiIcon = (emoji: string) =>
  L.divIcon({
    html: `<div style="font-size:28px;line-height:28px;text-align:center">${emoji}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })

const userIcon = emojiIcon('📍')
const driverIcon = emojiIcon('🚗')

// Ajusta o zoom para mostrar usuário e motorista juntos
function FitBounds({ user, driver }: { user: LatLng; driver: LatLng }) {
  const map = useMap()
  useEffect(() => {
    map.fitBounds(
      [
        [user.lat, user.lng],
        [driver.lat, driver.lng],
      ],
      { padding: [40, 40], maxZoom: 17 }
    )
  }, [map, user.lat, user.lng, driver.lat, driver.lng])
  return null
}

export default function TrackingMap({ user, driver }: { user: LatLng; driver: LatLng }) {
  return (
    <MapContainer
      center={[user.lat, user.lng]}
      zoom={15}
      scrollWheelZoom={false}
      style={{ height: 300, width: '100%', borderRadius: 16 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[user.lat, user.lng]} icon={userIcon} />
      <Marker position={[driver.lat, driver.lng]} icon={driverIcon} />
      <Polyline positions={[[driver.lat, driver.lng], [user.lat, user.lng]]} pathOptions={{ color: '#f52238', dashArray: '6 8' }} />
      <FitBounds user={user} driver={driver} />
    </MapContainer>
  )
}
