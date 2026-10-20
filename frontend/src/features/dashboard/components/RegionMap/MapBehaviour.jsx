import L from "leaflet";
import { useEffect } from "react";
import { Marker, useMap, useMapEvents } from "react-leaflet";

import { draftIcon } from "./mapContent.js";
import styles from "./RegionMap.module.css";

const FACILITY_ZOOM = 16;

/**
 * The only place that moves the camera: to a focused facility if there is
 * one, otherwise to the selected area. Also keeps the map size in sync.
 */
export function FitToArea({ feature, point }) {
  const map = useMap();
  const [lng, lat] = point ?? [];

  useEffect(() => {
    if (lat != null) {
      map.flyTo([lat, lng], FACILITY_ZOOM, { duration: 0.6 });
    } else if (feature) {
      map.flyToBounds(L.geoJSON(feature).getBounds(), { padding: [24, 24], duration: 0.6 });
    }
  }, [map, feature, lat, lng]);

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  return null;
}

/**
 * Data credits that must stay visible even when the basemap is hidden
 * (OSM facilities and PSA/NAMRIA boundaries are always drawn).
 */
export function DataAttribution({ text }) {
  const map = useMap();

  useEffect(() => {
    map.attributionControl?.addAttribution(text);
    return () => map.attributionControl?.removeAttribution(text);
  }, [map, text]);

  return null;
}

/** Drops draft facility pins while "Place facility" is active. */
export function DraftPlacement({ placing, drafts, onPlace }) {
  useMapEvents({
    click(event) {
      if (placing) onPlace(event.latlng);
    },
  });

  return drafts.map((draft, index) => (
    <Marker
      key={draft.id}
      position={draft.latlng}
      icon={draftIcon(styles.draftPin, `P${index + 1}`)}
      title="Draft facility placement (not analysed)"
    />
  ));
}
