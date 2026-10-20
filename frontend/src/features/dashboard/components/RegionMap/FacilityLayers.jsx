import L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

import { facilityPopup, hospitalIcon, token } from "./mapContent.js";
import styles from "./RegionMap.module.css";

const DETAIL_ZOOM = 11;

const toLatLng =(feature) => [feature.geometry.coordinates[1], feature.geometry.coordinates[0]];

/**
 * Hospitals as icon pins, schools as canvas dots (there are thousands).
 * Built imperatively: one Leaflet layer group per kind is much faster than
 * one React component per marker.
 */
export default function FacilityLayers({ facilities, visible, focusedId }) {
  const map = useMap();
  const markers = useRef(new Map());

  useEffect(() => {
    const group = L.layerGroup().addTo(map);
    const renderer = L.canvas({ padding: 0.5 });
    const schoolStyle = {
      renderer,
      radius: 4,
      weight: 1,
      color: "#ffffff",
      fillColor: token("--color-brand-700"),
      fillOpacity: 0.9,
    };
    const icon = hospitalIcon(styles.hospitalPin, styles.markerBox);
    const registry = new Map();

    if (visible.school) {
      for (const feature of facilities.school) {
        const marker = L.circleMarker(toLatLng(feature), schoolStyle)
          .bindPopup(() => facilityPopup(feature.properties))
          .addTo(group);
        registry.set(feature.properties.osm_id, marker);
      }
    }
    if (visible.hospital) {
      for (const feature of facilities.hospital) {
        const marker = L.marker(toLatLng(feature), { icon, riseOnHover: true })
          .bindPopup(() => facilityPopup(feature.properties))
          .addTo(group);
        registry.set(feature.properties.osm_id, marker);
      }
    }
    markers.current = registry;
    return () => {
      group.remove();
    };
  }, [map, facilities, visible.hospital, visible.school]);

  // Below DETAIL_ZOOM, hospital pins shrink to small squares (CSS) so the
  // whole region stays readable.
  useEffect(() => {
    const container = map.getContainer();
    const update = () => container.classList.toggle(styles.zoomedOut, map.getZoom() < DETAIL_ZOOM);
    update();
    map.on("zoomend", update);
    return () => {
      map.off("zoomend", update);
      container.classList.remove(styles.zoomedOut);
    };
  }, [map]);

  // Opens the focused facility's popup. FitToArea does the camera move;
  // opening right away would be closed again by that move, so wait for it.
  useEffect(() => {
    const marker = focusedId && markers.current.get(focusedId);
    if (!marker) return undefined;
    const open = () => marker.openPopup();
    const timer = setTimeout(() => map.once("moveend", open), 0);
    return () => {
      clearTimeout(timer);
      map.off("moveend", open);
    };
  }, [map, focusedId, facilities]);

  return null;
}
