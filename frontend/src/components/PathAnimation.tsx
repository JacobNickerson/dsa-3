import Leaflet from 'leaflet';
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet.polyline.snakeanim/L.Polyline.SnakeAnim.js';

function PathAnimation( { playAnim, nodes } : { playAnim : boolean, nodes : number[][] } ) {
    const map = useMap();
    const pathNodes = nodes.map((coords) => Leaflet.latLng(coords[0], coords[1]));

    useEffect(() => {
        if (playAnim) {
            const path = Leaflet.polyline([pathNodes]);
            map.fitBounds(path.getBounds());
            map.addLayer(path);
            path.snakeIn();
        }
        else {
            map.eachLayer(layer => {
            if (layer instanceof Leaflet.Polyline) {
                map.removeLayer(layer);
            }});
        }
    }, [playAnim])
    return null;
}

export default PathAnimation;