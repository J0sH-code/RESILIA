import accessibilityIcon from "@/assets/icons/accessibility.svg";
import activityIcon from "@/assets/icons/activity.svg";
import checkIcon from "@/assets/icons/check.svg";
import hospitalIcon from "@/assets/icons/hospital-layer.svg";
import houseIcon from "@/assets/icons/house-layer.svg";
import layersIcon from "@/assets/icons/layers.svg";
import mountainIcon from "@/assets/icons/mountain.svg";
import routeIcon from "@/assets/icons/route.svg";
import schoolIcon from "@/assets/icons/school-layer.svg";
import usersIcon from "@/assets/icons/users.svg";
import wavesIcon from "@/assets/icons/waves.svg";
import Icon from "@/components/ui/Icon.jsx";
import { Divider, Panel, PanelHeading } from "@/components/ui/Panel.jsx";
import { formatNumber } from "../../format.js";
import styles from "./PlanningControls.module.css";

const LAYER_ICONS = {
  hospitals: hospitalIcon,
  evacuation: houseIcon,
  schools: schoolIcon,
  flood: wavesIcon,
  landslide: mountainIcon,
  earthquake: activityIcon,
  population: usersIcon,
  roads: routeIcon,
};

export default function SpatialLayersPanel({
  layers,
  layerState,
  onToggleLayer,
  vulnerability,
  vulnerableGroups,
  onToggleGroup,
}) {
  const activeCount = layers.filter((layer) => layerState[layer.id]).length;

  return (
    <Panel aria-labelledby="spatial-layers-title">
      <PanelHeading
        id="spatial-layers-title"
        icon={layersIcon}
        title="Spatial layers"
        meta={`${activeCount} active`}
      />
      <Divider />

      <ul className={styles.layerList}>
        {layers.map((layer) => (
          <li key={layer.id}>
            <label className={styles.layerRow}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={layerState[layer.id]}
                onChange={() => onToggleLayer(layer.id)}
              />
              <span className={styles.checkbox} aria-hidden="true">
                {layerState[layer.id] && <Icon src={checkIcon} />}
              </span>
              <Icon src={LAYER_ICONS[layer.id]} />
              <span className={styles.layerLabel}>{layer.label}</span>
              <span className={styles.layerMeta}>{layer.meta}</span>
            </label>
          </li>
        ))}
      </ul>

      <Divider />
      <PanelHeading icon={accessibilityIcon} title="Vulnerability overlay" />
      <div className={styles.chips} role="group" aria-label="Priority groups">
        {vulnerability.groups.map((group) => {
          const on = vulnerableGroups[group.id];
          return (
            <button
              key={group.id}
              type="button"
              className={styles.chip}
              aria-pressed={on}
              onClick={() => onToggleGroup(group.id)}
            >
              {on ? `✓ ${group.label}` : group.label}
            </button>
          );
        })}
      </div>
      <p className={styles.caption}>
        Priority groups · {formatNumber(vulnerability.priorityResidents)} demo residents
      </p>
    </Panel>
  );
}
