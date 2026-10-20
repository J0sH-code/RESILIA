import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, ScaleControl, TileLayer } from "react-leaflet";

import hospitalLegendIcon from "@/assets/icons/hospital-legend.svg";
import locateIcon from "@/assets/icons/locate-fixed.svg";
import mapIcon from "@/assets/icons/map.svg";
import mapPinPlusIcon from "@/assets/icons/map-pin-plus.svg";
import minusIcon from "@/assets/icons/minus.svg";
import navigationIcon from "@/assets/icons/navigation.svg";
import plusIcon from "@/assets/icons/plus.svg";
import triangleAlertIcon from "@/assets/icons/triangle-alert.svg";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Icon from "@/components/ui/Icon.jsx";
import { Panel } from "@/components/ui/Panel.jsx";
import { formatNumber } from "../../format.js";
import BoundaryLayers from "./BoundaryLayers.jsx";
import FacilityLayers from "./FacilityLayers.jsx";
import { DataAttribution, DraftPlacement, FitToArea } from "./MapBehaviour.jsx";
import styles from "./RegionMap.module.css";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · ' +
  'Boundaries: PSA/NAMRIA via <a href="https://data.humdata.org/dataset/cod-ab-phl">OCHA HDX</a>';

const REGION_CENTER = [15.45, 120.75];

/** Hazard layers named by each scenario; none are loaded yet. */
const SCENARIO_HAZARD = { "flood-100": "Flood", earthquake: "Earthquake" };

const PROMPTS = {
  provincial: "Click a province on the map, or pick one above",
  municipal: "Click a city or municipality to open it",
  barangay: "Click a barangay to select it",
};

function areaSummary(mapData, scope, area) {
  const { region, province, municipality, barangay } = mapData;
  if (scope === "provincial" && !area.provincePcode) return { prompt: PROMPTS.provincial };
  if (scope === "municipal" && !area.municipalityPcode) return { prompt: PROMPTS.municipal };
  if (scope === "barangay" && !area.barangayPcode) return { prompt: PROMPTS.barangay };
  if (barangay) {
    return { title: barangay.properties.name, detail: `${barangay.properties.municipality}, ${barangay.properties.province}` };
  }
  if (municipality) {
    const p = municipality.properties;
    return { title: p.name, detail: `${p.province} · ${formatNumber(p.barangay_count)} barangays` };
  }
  if (province) {
    const p = province.properties;
    return {
      title: p.name,
      detail: `${p.municipality_count} cities & municipalities · ${formatNumber(p.barangay_count)} barangays`,
    };
  }
  return {
    title: "Region III (Central Luzon)",
    detail: `${mapData.provinces.length} provinces · ${formatNumber(region.properties.barangay_count)} barangays`,
  };
}

export default function RegionMap({
  mapData,
  scope,
  area,
  onSelectArea,
  layers,
  scenario,
  focusedFacilityId,
}) {
  const [map, setMap] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const placingRef = useRef(placing);
  placingRef.current = placing;

  useEffect(() => {
    if (!placing) return undefined;
    const onKey = (event) => event.key === "Escape" && setPlacing(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [placing]);

  const ready = mapData.status === "ready";
  const focusFeature = ready
    ? (mapData.barangay ?? mapData.municipality ?? mapData.province ?? mapData.region)
    : null;
  const focusPoint = useMemo(
    () =>
      ready && focusedFacilityId
        ? mapData.allFacilities.find((f) => f.properties.osm_id === focusedFacilityId)?.geometry
            .coordinates
        : undefined,
    [ready, focusedFacilityId, mapData.allFacilities],
  );
  const summary = ready ? areaSummary(mapData, scope, area) : null;
  const hazard = SCENARIO_HAZARD[scenario.value];

  const placeDraft = (latlng) => {
    setDrafts((current) => [...current, { id: crypto.randomUUID(), latlng }]);
    setPlacing(false);
  };

  return (
    <Panel className={styles.panel} aria-labelledby="map-title">
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <h2 id="map-title">Accessibility &amp; hazard map</h2>
          <Badge tone="warning">{scenario.mapBadge}</Badge>
        </div>
        <div className={styles.toolbarActions}>
          {drafts.length > 0 && (
            <Button size="sm" onClick={() => setDrafts([])}>
              Clear drafts ({drafts.length})
            </Button>
          )}
          <Button
            size="sm"
            variant="primary"
            icon={mapPinPlusIcon}
            aria-pressed={placing}
            onClick={() => setPlacing((value) => !value)}
          >
            Place facility
          </Button>
        </div>
      </div>

      <div className={`${styles.viewport} ${placing ? styles.placing : ""}`}>
        <MapContainer
          ref={setMap}
          className={styles.map}
          center={REGION_CENTER}
          zoom={8}
          minZoom={7}
          maxZoom={18}
          zoomControl={false}
          attributionControl
        >
          {/* The basemap carries the road network; switching "Road network" off hides it. */}
          {layers.roads && <TileLayer url={TILE_URL} maxZoom={19} />}
          <DataAttribution text={ATTRIBUTION} />
          <ScaleControl position="bottomright" imperial={false} />
          {ready && (
            <>
              <FitToArea feature={focusFeature} point={focusPoint} />
              <BoundaryLayers
                mapData={mapData}
                area={area}
                onSelectArea={onSelectArea}
                placingRef={placingRef}
              />
              <FacilityLayers
                facilities={mapData.facilities}
                visible={{ hospital: layers.hospitals, school: layers.schools }}
                focusedId={focusedFacilityId}
              />
              <DraftPlacement placing={placing} drafts={drafts} onPlace={placeDraft} />
            </>
          )}
        </MapContainer>

        <div className={styles.statusStack}>
          <p className={styles.mapStatus}>
            <Icon src={mapIcon} />
            {mapData.status === "loading" && "Loading Region III map data…"}
            {mapData.status === "error" && "Could not load map data"}
            {ready &&
              (placing
                ? "Click the map to drop a draft facility (Esc to cancel)"
                : mapData.barangaysLoading
                  ? "Loading barangays…"
                  : "Real boundaries and OSM facilities")}
          </p>
          {hazard && (
            <p className={styles.hazardStatus}>
              <Icon src={triangleAlertIcon} />
              {hazard} hazard layer not loaded yet · needs team data
            </p>
          )}
        </div>

        <div className={styles.mapTools}>
          <button
            type="button"
            className={styles.mapTool}
            onClick={() => onSelectArea({}, "regional")}
          >
            <Icon src={navigationIcon} label="Show all of Region III" />
          </button>
          <button type="button" className={styles.mapTool} onClick={() => map?.zoomIn()}>
            <Icon src={plusIcon} label="Zoom in" />
          </button>
          <button type="button" className={styles.mapTool} onClick={() => map?.zoomOut()}>
            <Icon src={minusIcon} label="Zoom out" />
          </button>
          <button
            type="button"
            className={styles.mapTool}
            onClick={() =>
              focusFeature && map?.flyToBounds(L.geoJSON(focusFeature).getBounds(), { padding: [24, 24] })
            }
          >
            <Icon src={locateIcon} label="Zoom to selected area" />
          </button>
        </div>

        {summary && (
          <div className={styles.areaChip} aria-live="polite">
            {summary.prompt ? (
              <p>
                <strong>{summary.prompt}</strong>
              </p>
            ) : (
              <p>
                <strong>{summary.title}</strong>
                <span>{summary.detail}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className={styles.legend}>
        <span className={styles.legendTitle}>LEGEND</span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendLine} ${styles.legendRegion}`} />
          Region III
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.legendLine} ${styles.legendSelected}`} />
          Selected area
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendArea} />
          Clickable area
        </span>
        <span className={styles.legendItem}>
          <Icon src={hospitalLegendIcon} />
          Hospital
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} />
          School
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendDraft}>P</span>
          Draft facility
        </span>
        <span className={styles.legendMuted}>Hazards, population, evacuation centers: data pending</span>
      </div>
    </Panel>
  );
}
