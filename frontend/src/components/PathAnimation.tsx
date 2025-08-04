import Leaflet from "leaflet";
import { useMap } from "react-leaflet";
import { useEffect } from "react";
import type { FLNode } from "../Graph"
import "leaflet.polyline.snakeanim/L.Polyline.SnakeAnim.js";

export function DrawFinalPath({
  playAnim,
  edges,
}: {
  playAnim: boolean;
  edges: Array<[FLNode,FLNode]>;
}) {
  const map = useMap();

  useEffect(() => {
    if (playAnim) {
      if (!edges || edges.length === 0) {
        return;
      }
      const pathNodes = edges.map(([_,to]) => Leaflet.latLng(to.lat, to.lon));
      const path = Leaflet.polyline([pathNodes]);
      // map.fitBounds(path.getBounds());     <- turn ON to enable screen moving to the path animation
      map.addLayer(path);
      path.snakeIn();
    } 
    else {
      map.eachLayer((layer) => {
        if (layer instanceof Leaflet.Polyline) {
          map.removeLayer(layer);
        }
      });
    }
  }, [playAnim]);
  return null;
}

export function DrawSearchOrder({
  playAnim,
  edges,
}: {
  playAnim: boolean;
  edges: Array<[FLNode,FLNode]>;
}) {
  const map = useMap();

  useEffect(() => {
    if (playAnim) {
      if (!edges || edges.length === 0) {
        return;
      } 
      if (edges.length > 50000) {
        console.log("Not displaying search order, too many edges");
        return;
      }
      for (const [from, to] of edges) {
        if (!from || !to) continue; 
        const segment = Leaflet.polyline([[from.lat,from.lon], [to.lat,to.lon]], { color: 'red' }).addTo(map);
        // segment.snakeIn();
      }
    } else {
      map.eachLayer((layer) => {
        if (layer instanceof Leaflet.Polyline) {
          map.removeLayer(layer);
        }
      });
    }
  }, [playAnim]);
  return null;
}