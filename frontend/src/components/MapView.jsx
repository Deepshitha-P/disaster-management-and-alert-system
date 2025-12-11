import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import { useState } from 'react'

const containerStyle = { width: '100%', height: '400px' }
const center = { lat: 28.6139, lng: 77.2090 } // Default: Delhi

export default function MapView({ disasters = [], sosRequests = [] }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  })

  const [map, setMap] = useState(null)

  if (!isLoaded) return <p>Loading map...</p>

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={10}
      onLoad={setMap}
    >
      {disasters.map((d, i) => (
        <Marker key={`d-${i}`} position={d.location} icon={{ url: d.colorIcon }} />
      ))}
      {sosRequests.map((s, i) => (
        <Marker key={`s-${i}`} position={s.location} icon={{ url: '/icons/icon-192.png' }} />
      ))}
    </GoogleMap>
  )
}
