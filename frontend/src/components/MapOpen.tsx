import Leaflet from "leaflet";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
} from "react-leaflet";
import { LatLng } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { BorderColor } from "@mui/icons-material";
import { DrawSearch } from "./PathAnimation";
import icon from "leaflet/dist/images/marker-icon.png";
import type { FLNode } from "../Graph"
//import "bootstrap/dist/css/bootstrap.css";

function PinMarker({
  onSelectA,
  onSelectB,
}: {
  onSelectA: any;
  onSelectB: any;
}) {
  const [position, setPosition] = useState<LatLng>();
  const pinReference = useRef<L.Marker | null>(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      pinReference.current?.openPopup();
    },
  });

  // do NOT pass the onSelect functions directly to each button's onClick prop, it will trigger each on render vs on click
  function handleClickA() {
    onSelectA(position);
  }

  function handleClickB() {
    onSelectB(position);
  }

  return (
    <>
      {position && (
        <Marker iconUrl={icon} position={position} ref={pinReference}>
          <Popup>
            <div>
              Position is at: {position.lat.toFixed(2)}{" "}
              {position.lng.toFixed(2)}{" "}
            </div>
            <button onClick={handleClickA}>Location A</button>
            <button onClick={handleClickB}>Location B</button>
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
  searchOrder,
  playAnim,
  playSearchAnim,
  setStartCoords,
  setEndCoords,
}: {
  pathData: Array<[FLNode, FLNode]>;
  searchOrder: Array<[FLNode,FLNode]>;
  playAnim: boolean;
  playSearchAnim: boolean;
  setStartCoords: [number,number];
  setEndCoords: [number,number];
}) {
  // Florida bounding box
  const corner1 = Leaflet.latLng(24, -88);
  const corner2 = Leaflet.latLng(31, -77);
  const bounds = Leaflet.latLngBounds(corner1, corner2);

  // Coordinate selections
  const [selectedA, setSelectedA] = useState<LatLng>();
  const [selectedB, setSelectedB] = useState<LatLng>();

  useEffect(() => {
    if (selectedA && selectedB) {
      const startCoords = [selectedA.lat, selectedA.lng];
      const endCoords = [selectedB.lat, selectedB.lng];
      setStartCoords(startCoords);
      setEndCoords(endCoords);
    }
  }, [selectedA, selectedB]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <MapContainer
        center={[29.63, -82.33]}
        zoom={8}
        minZoom={8}
        maxBounds={bounds}
        maxBoundsViscosity={1}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PinMarker onSelectA={setSelectedA} onSelectB={setSelectedB} />
        <DrawSearch playPathAnim={playAnim} pathEdges={pathData} playSearchAnim={playSearchAnim} searchOrder={searchOrder}/>
      </MapContainer>
    </div>
  );
}
export default MapOpen;
