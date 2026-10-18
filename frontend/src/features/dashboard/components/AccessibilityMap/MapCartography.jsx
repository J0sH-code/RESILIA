import agriculturalLand from "@/assets/map/agricultural-land.svg";
import barangayBoundaries from "@/assets/map/barangay-boundaries.png";
import emergencySupplyRoute from "@/assets/map/emergency-supply-route.png";
import fifteenMinuteIsochrone from "@/assets/map/fifteen-minute-isochrone.svg";
import floodExtentContours from "@/assets/map/flood-extent-contours.png";
import floodInundationArea from "@/assets/map/flood-inundation-area.svg";
import floodedRoadSegments from "@/assets/map/flooded-road-segments.svg";
import passableArterialRoads from "@/assets/map/passable-arterial-roads.svg";
import riverNetwork from "@/assets/map/river-network.svg";
import streetOutlines from "@/assets/map/street-outlines.svg";
import streetSurfaces from "@/assets/map/street-surfaces.svg";
import thirtyMinuteIsochrone from "@/assets/map/thirty-minute-isochrone.png";
import uplandTerrain from "@/assets/map/upland-terrain.svg";
import { BUILDING_FOOTPRINTS } from "./buildingFootprints.js";
import { MAP_HEIGHT, MAP_WIDTH } from "./useMapViewport.js";
import styles from "./AccessibilityMap.module.css";

/**
 * Layer artwork exported from Figma, in paint order. SVG layers render at their
 * intrinsic size; raster layers (exported @2x) declare their design size.
 * `left`/`top` are the layer's offset on the 944 × 530 canvas.
 */
const LAYERS = [
  { id: "flood-contours", src: floodExtentContours, left: 507.106, top: -0.844, width: 436.894, height: 530.844, group: "flood" },
  { id: "flood-inundation", src: floodInundationArea, left: 417, top: 0, group: "flood" },
  { id: "agricultural-land", src: agriculturalLand, left: 0, top: 0 },
  { id: "upland-terrain", src: uplandTerrain, left: 0, top: 0 },
  { id: "barangay-boundaries", src: barangayBoundaries, left: 0, top: 0, width: 944.109, height: 530.464 },
  { id: "buildings" },
  { id: "street-outlines", src: streetOutlines, left: 0, top: 0, group: "roads" },
  { id: "street-surfaces", src: streetSurfaces, left: 0, top: 0, group: "roads" },
  { id: "isochrone-15", src: fifteenMinuteIsochrone, left: 270, top: 121, group: "catchments" },
  { id: "isochrone-30", src: thirtyMinuteIsochrone, left: 175, top: 67, width: 769, height: 463, group: "catchments" },
  { id: "river-network", src: riverNetwork, left: 0, top: 0 },
  { id: "supply-route", src: emergencySupplyRoute, left: 132.022, top: 141.641, width: 811.978, height: 388.359, group: "supplyRoute" },
  { id: "flooded-roads", src: floodedRoadSegments, left: 368.763, top: 226.77, group: "flood" },
  { id: "passable-roads", src: passableArterialRoads, left: 17.882, top: -0.684, group: "roads" },
];

function BuildingFootprints() {
  return (
    <svg
      className={styles.layer}
      width={MAP_WIDTH}
      height={MAP_HEIGHT}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      aria-hidden="true"
    >
      {BUILDING_FOOTPRINTS.map(([cx, cy, w, h, rotation, agricultural], index) => (
        <rect
          key={index}
          x={cx - w / 2}
          y={cy - h / 2}
          width={w}
          height={h}
          rx={1}
          transform={`rotate(${rotation} ${cx} ${cy})`}
          className={agricultural ? styles.buildingAgri : styles.building}
        />
      ))}
    </svg>
  );
}

/** Static cartographic base. `visible` maps layer groups to on/off. */
export default function MapCartography({ visible, transform }) {
  return (
    <div className={styles.canvas} style={{ transform }} aria-hidden="true">
      {LAYERS.map((layer) => {
        if (layer.id === "buildings") return <BuildingFootprints key={layer.id} />;
        const hidden = layer.group && !visible[layer.group];
        return (
          <img
            key={layer.id}
            src={layer.src}
            alt=""
            width={layer.width}
            height={layer.height}
            draggable={false}
            className={`${styles.layer} ${hidden ? styles.layerHidden : ""}`}
            style={{ left: layer.left, top: layer.top }}
          />
        );
      })}
    </div>
  );
}
