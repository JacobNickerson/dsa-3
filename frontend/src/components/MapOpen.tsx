import Leaflet from 'leaflet'
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
} from "react-leaflet";

function MapOpen() {
  // Map bounds
  const corner1 = Leaflet.latLng(-90, -200);
  const corner2 = Leaflet.latLng(90, 200);
  const bounds = Leaflet.latLngBounds(corner1, corner2);

  return (
    <div style={{width: '100vw', height: '100vh'}}>
      <MapContainer center={[51.505, -0.09]} zoom={10} minZoom={2} maxBounds={bounds} maxBoundsViscosity={1} scrollWheelZoom={true} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
  );
}

export default MapOpen;
