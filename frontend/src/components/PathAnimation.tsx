import Leaflet from "leaflet";
import { useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import type { FLNode } from "../Graph"
import "leaflet.polyline.snakeanim/L.Polyline.SnakeAnim.js";

// GIANT ACCURSED FUNCTION
export function DrawSearch({
  playSearchAnim,
  searchOrder,
  playPathAnim,
  pathEdges,
}: {
  playSearchAnim: boolean
  searchOrder: Array<[FLNode,FLNode]>;
  playPathAnim: boolean;
  pathEdges: Array<[FLNode,FLNode]>;
}) {
  const [firstDone, setFirstDone] = useState(false);
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let cancelled = false;

    // First, draw the search order (or abort if too large)
    async function drawEdgesAsync() {
      if (!searchOrder || searchOrder.length === 0) return;

      if (searchOrder.length > 250000) {
        console.log("WARNING: Search order has", searchOrder.length, "edges, not drawing above 250000");
        setFirstDone(true);
        return;
      }

      // draw in batches to not blow up my pc
      const batchSize = 200;
      const delayMs = 30;

      for (let i = 0; i < searchOrder.length; i += batchSize) {
        if (cancelled) break;

        const batch = searchOrder.slice(i, i + batchSize);

        batch.forEach(([from, to]) => {
          if (!from || !to) return;
          Leaflet.polyline(
            [
              [from.lat, from.lon],
              [to.lat, to.lon],
            ],
            { color: "red" }
          ).addTo(map);
        });

        // wait a bit before drawing the next batch to allow rendering
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      setFirstDone(true);
    }

    if (playSearchAnim) {
      drawEdgesAsync();
    } else {
      // Remove all polylines on the map
      map.eachLayer((layer) => {
        if (layer instanceof Leaflet.Polyline) {
          map.removeLayer(layer);
        }
      });
    }

    return () => {
      cancelled = true;
    };
  }, [map, playSearchAnim, searchOrder]);

  useEffect(() => {
    if (!firstDone) { return; }
    if (playPathAnim) {
      if (!pathEdges || pathEdges.length === 0) {
        return;
      }
      const pathNodes = pathEdges.map(([_,to]) => Leaflet.latLng(to.lat, to.lon));
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
  }, [firstDone, map, pathEdges, playPathAnim]);

  return null;
}