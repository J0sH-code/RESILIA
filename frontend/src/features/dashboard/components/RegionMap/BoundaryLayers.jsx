import { useRef } from "react";
import { GeoJSON } from "react-leaflet";

import { boundaryTooltip } from "./mapContent.js";
import styles from "./RegionMap.module.css";

const collection = (features) => ({ type: "FeatureCollection", features });
const keyOf = (features) => features.map((f) => f.properties.pcode).join(",");

/**
 * Draws the region outline, the clickable child areas of the current
 * selection, and faint sibling areas that let the planner jump sideways.
 *
 * Drill-down: region → provinces → municipalities → barangays.
 */
export default function BoundaryLayers({ mapData, area, onSelectArea, placingRef }) {
  const { region, provinces, areaMunicipalities, barangays, province, municipality } = mapData;

  // Keep the latest callback for Leaflet handlers bound once per layer.
  const selectRef = useRef(onSelectArea);
  selectRef.current = onSelectArea;

  let children;
  let siblings = [];
  if (municipality) {
    children = { level: "barangay", features: barangays, hint: "Click to select barangay" };
    siblings = { level: "municipal", features: areaMunicipalities.filter((f) => f !== municipality) };
  } else if (province) {
    children = { level: "municipal", features: areaMunicipalities, hint: "Click to open" };
    siblings = { level: "provincial", features: provinces.filter((f) => f !== province) };
  } else {
    children = { level: "provincial", features: provinces, hint: "Click to open" };
  }

  const toArea = (properties, level) => {
    if (level === "provincial") return { provincePcode: properties.pcode };
    if (level === "municipal") {
      return { provincePcode: properties.province_pcode, municipalityPcode: properties.pcode };
    }
    return {
      provincePcode: properties.province_pcode,
      municipalityPcode: properties.municipality_pcode,
      barangayPcode: properties.pcode,
    };
  };

  const bind = (level, hint) => (feature, layer) => {
    layer.bindTooltip(boundaryTooltip(feature.properties, hint), { sticky: true, direction: "top" });
    layer.on("click", (event) => {
      if (placingRef.current) return; // let the map place a draft facility instead
      event.originalEvent?.stopPropagation();
      selectRef.current(toArea(feature.properties, level), level);
    });
  };

  const selectedOutline = municipality ?? province;

  return (
    <>
      {siblings.features?.length > 0 && (
        <GeoJSON
          key={`siblings-${keyOf(siblings.features)}`}
          data={collection(siblings.features)}
          style={{ className: styles.sibling }}
          onEachFeature={bind(siblings.level, "Click to switch")}
        />
      )}
      <GeoJSON
        key={`children-${children.level}-${keyOf(children.features)}-${area.barangayPcode}`}
        data={collection(children.features)}
        style={(feature) => ({
          className:
            feature.properties.pcode === area.barangayPcode ? styles.childSelected : styles.child,
        })}
        onEachFeature={bind(children.level, children.hint)}
      />
      {selectedOutline && (
        <GeoJSON
          key={`outline-${selectedOutline.properties.pcode}`}
          data={selectedOutline}
          style={{ className: styles.selectedOutline }}
          interactive={false}
        />
      )}
      <GeoJSON key="region" data={region} style={{ className: styles.regionOutline }} interactive={false} />
    </>
  );
}
