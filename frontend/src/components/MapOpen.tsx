import Leaflet, { latLng } from "leaflet";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { LatLng } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { BorderColor } from "@mui/icons-material";
import PathAnimation from "./PathAnimation";
//import "bootstrap/dist/css/bootstrap.css";

function PinMarker() {
  const [position, setPosition] = useState<LatLng>();
  const [selectedA, setSelectedA] = useState<LatLng>();
  const [selectedB, setSelectedB] = useState<LatLng>();

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.locate();
    },
  });

  //Positon here! {position.lat.toFixed(2)} {position.lng.toFixed(2)}
  return (
    <>
      {position && (
        <Marker position={position}>
          <Popup>
            <div>
              Position is at: {position.lat.toFixed(2)}{" "}
              {position.lng.toFixed(2)}{" "}
            </div>
            <button onClick={() => setSelectedA(position)}>Location A</button>
            <button onClick={() => setSelectedB(position)}>Location B</button>
          </Popup>
        </Marker>
      )}
    </>
  );
}

function MapOpen({
  pathData,
  playAnim,
}: {
  pathData: number[][];
  playAnim: boolean;
}) {
  //florida attempt
  const corner1 = Leaflet.latLng(24, -88);
  const corner2 = Leaflet.latLng(31, -77);
  const bounds = Leaflet.latLngBounds(corner1, corner2);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <MapContainer
        center={[29.63, -82.33]}
        zoom={10}
        minZoom={2}
        maxBounds={bounds}
        maxBoundsViscosity={1}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PinMarker />
        <PathAnimation playAnim={playAnim} nodes={pathData} />
      </MapContainer>
    </div>
  );
}

export default MapOpen;
