import { useState } from "react";

import circleCheckIcon from "@/assets/icons/circle-check.svg";
import columnsIcon from "@/assets/icons/columns-2.svg";
import hospitalLegendIcon from "@/assets/icons/hospital-legend.svg";
import hospitalPinIcon from "@/assets/icons/hospital-pin.svg";
import houseLegendIcon from "@/assets/icons/house-legend.svg";
import housePinIcon from "@/assets/icons/house-pin.svg";
import locateIcon from "@/assets/icons/locate-fixed.svg";
import mapIcon from "@/assets/icons/map.svg";
import mapPinPlusIcon from "@/assets/icons/map-pin-plus.svg";
import minusIcon from "@/assets/icons/minus.svg";
import navigationIcon from "@/assets/icons/navigation.svg";
import plusIcon from "@/assets/icons/plus.svg";
import schoolLegendIcon from "@/assets/icons/school-legend.svg";
import schoolPinIcon from "@/assets/icons/school-pin.svg";
import triangleAlertIcon from "@/assets/icons/triangle-alert.svg";
import candidateHalo from "@/assets/map/selected-candidate-halo.svg";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Icon from "@/components/ui/Icon.jsx";
import { Panel } from "@/components/ui/Panel.jsx";
import CandidatePopup from "./CandidatePopup.jsx";
import MapCartography from "./MapCartography.jsx";
import { useMapViewport } from "./useMapViewport.js";
import styles from "./AccessibilityMap.module.css";

const FACILITY_PINS = {
  hospital: { icon: hospitalPinIcon, layer: "hospitals", label: "Hospital" },
  evacuation: { icon: housePinIcon, layer: "evacuation", label: "Evacuation center" },
  school: { icon: schoolPinIcon, layer: "schools", label: "School" },
};

const LEGEND = [
  { label: "< 15 min", swatch: "var(--color-map-catchment-15)" },
  { label: "15–30 min", swatch: "var(--color-map-catchment-30)" },
  { label: "Passable road", swatch: "var(--color-map-road-passable)" },
  { label: "Flooded road", swatch: "var(--color-map-road-flooded)" },
  { label: "Flood extent", swatch: "var(--color-map-flood-extent)" },
];

const CATCHMENT_LABELS = [
  { text: "15 min", x: 305, y: 306 },
  { text: "30 min", x: 196, y: 186 },
];

// Canvas position of the flooded B-02 bridge callout.
const BRIDGE_WARNING = { x: 554, y: 364 };

const POPUP = { width: 267, offsetX: 67, offsetY: -80, height: 214, edge: 56, dockBelow: 600 };

export default function AccessibilityMap({
  data,
  layers,
  scenario,
  selectedCandidate,
  onSelectCandidate,
  popupOpen,
  onPopupOpenChange,
}) {
  const viewport = useMapViewport();
  const [comparing, setComparing] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placedSites, setPlacedSites] = useState([]);

  const simulatedCandidate = data.candidates.find((candidate) => candidate.simulated);
  const showSimulation = !comparing;
  const showFlood = scenario.flooding && layers.flood;

  const visibleGroups = {
    flood: showFlood,
    roads: layers.roads,
    catchments: showSimulation,
    supplyRoute: showSimulation && layers.roads,
  };

  const handlePointerUp = (event) => {
    const wasDrag = viewport.panHandlers.onPointerUp(event);
    if (!placing || wasDrag || event.target.closest("button")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const point = viewport.unproject(event.clientX - bounds.left, event.clientY - bounds.top);
    setPlacedSites((sites) => [...sites, { id: Date.now(), ...point }]);
    setPlacing(false);
  };

  const popupStyle = () => {
    const pin = viewport.project(selectedCandidate.pin.x, selectedCandidate.pin.y);
    const { width, height } = viewport.viewportSize;
    let left = pin.left + POPUP.offsetX;
    if (left + POPUP.width > width - POPUP.edge) left = pin.left - POPUP.offsetX - POPUP.width;
    const top = Math.min(Math.max(pin.top + POPUP.offsetY, 8), height - POPUP.height - 8);
    return { left: Math.max(left, 8), top };
  };

  // On narrow maps the popup would hide most of the canvas, so dock it below.
  const dockPopup = viewport.viewportSize.width < POPUP.dockBelow;
  const popup = popupOpen && (
    <CandidatePopup
      candidate={selectedCandidate}
      docked={dockPopup}
      style={dockPopup ? undefined : popupStyle()}
      onClose={() => onPopupOpenChange(false)}
      onSimulate={() => setComparing(false)}
    />
  );

  const bridge = viewport.project(BRIDGE_WARNING.x, BRIDGE_WARNING.y);
  const kmPerScaleBar = 1 / viewport.scale;

  return (
    <Panel className={styles.panel} aria-labelledby="map-title">
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <h2 id="map-title">Accessibility &amp; hazard map</h2>
          <Badge tone="warning">{scenario.mapBadge}</Badge>
        </div>
        <div className={styles.toolbarActions}>
          <Button
            size="sm"
            icon={columnsIcon}
            aria-pressed={comparing}
            onClick={() => setComparing((value) => !value)}
          >
            Compare
          </Button>
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

      <div
        ref={viewport.viewportRef}
        className={`${styles.viewport} ${placing ? styles.placing : ""} ${
          viewport.zoom > 1 ? styles.pannable : ""
        }`}
        onPointerDown={viewport.panHandlers.onPointerDown}
        onPointerMove={viewport.panHandlers.onPointerMove}
        onPointerUp={handlePointerUp}
      >
        <MapCartography visible={visibleGroups} transform={viewport.canvasTransform} />

        <div className={styles.overlay}>
          {data.mapLabels.map((label) => (
            <span
              key={label.text}
              className={`${styles.mapLabel} ${styles[`label-${label.kind}`]}`}
              style={viewport.project(label.x, label.y)}
            >
              {label.text}
            </span>
          ))}
          {showSimulation &&
            CATCHMENT_LABELS.map((label) => (
              <span
                key={label.text}
                className={`${styles.mapLabel} ${styles["label-catchment"]}`}
                style={viewport.project(label.x, label.y)}
              >
                {label.text}
              </span>
            ))}

          {data.existingFacilities
            .filter((facility) => layers[FACILITY_PINS[facility.type].layer])
            .map((facility) => {
              const pin = FACILITY_PINS[facility.type];
              return (
                <span
                  key={facility.id}
                  className={styles.facilityPin}
                  style={viewport.project(facility.x, facility.y)}
                  title={pin.label}
                >
                  <Icon src={pin.icon} label={pin.label} />
                </span>
              );
            })}

          {placedSites.map((site, index) => (
            <span
              key={site.id}
              className={styles.placedPin}
              style={viewport.project(site.x, site.y)}
              title="Draft facility placement (not analysed)"
            >
              P{index + 1}
            </span>
          ))}

          <img
            src={candidateHalo}
            alt=""
            className={styles.halo}
            style={viewport.project(selectedCandidate.pin.x, selectedCandidate.pin.y)}
          />
          {data.candidates.map((candidate) => {
            const selected = candidate.id === selectedCandidate.id;
            return (
              <button
                key={candidate.id}
                type="button"
                className={`${styles.candidatePin} ${selected ? styles.candidatePinSelected : ""}`}
                style={viewport.project(candidate.pin.x, candidate.pin.y)}
                aria-pressed={selected}
                aria-label={`Candidate ${candidate.rank}: ${candidate.name}`}
                onClick={() => onSelectCandidate(candidate.id)}
              >
                {candidate.rank}
              </button>
            );
          })}

          {showFlood && (
            <p className={styles.bridgeWarning} style={bridge}>
              <Icon src={triangleAlertIcon} />
              B-02 flooded · excluded
            </p>
          )}

          {!dockPopup && popup}
        </div>

        <p className={styles.mapStatus}>
          <Icon src={mapIcon} />
          {placing
            ? "Click the map to drop a draft facility"
            : "Illustrative geography · not a navigation map"}
        </p>

        <div className={styles.mapTools}>
          <button type="button" className={styles.mapTool} onClick={viewport.reset}>
            <Icon src={navigationIcon} label="Reset view" />
          </button>
          <button
            type="button"
            className={styles.mapTool}
            onClick={viewport.zoomIn}
            disabled={!viewport.canZoomIn}
          >
            <Icon src={plusIcon} label="Zoom in" />
          </button>
          <button
            type="button"
            className={styles.mapTool}
            onClick={viewport.zoomOut}
            disabled={!viewport.canZoomOut}
          >
            <Icon src={minusIcon} label="Zoom out" />
          </button>
          <button
            type="button"
            className={styles.mapTool}
            onClick={() => viewport.centerOn(selectedCandidate.pin)}
          >
            <Icon src={locateIcon} label="Center on selected candidate" />
          </button>
        </div>

        <div className={styles.simulation} aria-live="polite">
          <Icon src={circleCheckIcon} />
          <p>
            <strong>
              {showSimulation
                ? `Preview: candidate ${String(simulatedCandidate.rank).padStart(2, "0")} added to network`
                : "Baseline: existing facility network"}
            </strong>
            <span>
              {showSimulation
                ? `${simulatedCandidate.capacity} places · comparison assumes full operation`
                : "Catchments and supply route hidden for comparison"}
            </span>
          </p>
        </div>

        <div className={styles.scale} aria-label="Map scale">
          <span className={styles.scaleBar} />
          <span className={styles.scaleText}>
            <span>0</span>
            <span>{kmPerScaleBar >= 1 ? kmPerScaleBar.toFixed(1).replace(".0", "") : kmPerScaleBar.toFixed(2)} km</span>
          </span>
        </div>
      </div>

      {dockPopup && popup}

      <div className={styles.legend}>
        <span className={styles.legendTitle}>LEGEND</span>
        {LEGEND.map((item) => (
          <span key={item.label} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: item.swatch }} />
            {item.label}
          </span>
        ))}
        <span className={styles.legendItem}>
          <Icon src={hospitalLegendIcon} />
          Hospital
          <Icon src={houseLegendIcon} />
          Evac.
          <Icon src={schoolLegendIcon} />
          School
        </span>
      </div>
    </Panel>
  );
}
