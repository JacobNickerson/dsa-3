import Leaflet from "leaflet";
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
  const pinReference = useRef<L.Marker | null>(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      if (pinReference.current) {
        pinReference.current.openPopup();
      }
      map.locate();
    },
  });
  return (
    <>
      {position && (
        <Marker position={position} ref={pinReference}>
          .
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

function LocationDisplay({
  selectedA,
  selectedB,
}: {
  selectedA: LatLng;
  selectedB: LatLng;
}) {
  return (
    <>
      <label>
        Location A:
        <textarea value={selectedA.lat}></textarea>
        <textarea value={selectedA.lng}></textarea>
      </label>
      <label>
        Location A:
        <textarea value={selectedB.lat}></textarea>
        <textarea value={selectedB.lng}></textarea>
      </label>
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
