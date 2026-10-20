import infoIcon from "@/assets/icons/info.svg";
import slidersIcon from "@/assets/icons/sliders-horizontal.svg";
import Icon from "@/components/ui/Icon.jsx";
import { Panel, PanelHeading } from "@/components/ui/Panel.jsx";
import SegmentedControl from "@/components/ui/SegmentedControl.jsx";
import styles from "./PlanningControls.module.css";

// Slider range for the capacity-deficit threshold, in percent.
const DEFICIT_MIN = 0;
const DEFICIT_MAX = 60;

export default function GapThresholdsPanel({
  travelTimeOptions,
  travelTime,
  onTravelTimeChange,
  capacityDeficit,
  onCapacityDeficitChange,
}) {
  const fill = ((capacityDeficit - DEFICIT_MIN) / (DEFICIT_MAX - DEFICIT_MIN)) * 100;

  return (
    <Panel aria-labelledby="gap-thresholds-title">
      <PanelHeading id="gap-thresholds-title" icon={slidersIcon} title="Gap thresholds" demo />

      <div className={styles.settingRow}>
        <span className={styles.settingLabel}>Max. emergency travel time</span>
        <span
          className={styles.info}
          title="Residents beyond this travel time to the nearest open facility count as underserved."
        >
          <Icon src={infoIcon} label="About travel-time threshold" />
        </span>
      </div>
      <SegmentedControl
        variant="tiles"
        label="Max. emergency travel time"
        options={travelTimeOptions}
        value={travelTime}
        onChange={onTravelTimeChange}
      />

      <label className={styles.settingRow} htmlFor="capacity-deficit">
        <span className={styles.settingLabel}>Capacity deficit threshold</span>
        <span className={styles.settingValue}>≥ {capacityDeficit}%</span>
      </label>
      <input
        id="capacity-deficit"
        type="range"
        className={styles.slider}
        min={DEFICIT_MIN}
        max={DEFICIT_MAX}
        step={5}
        value={capacityDeficit}
        onChange={(event) => onCapacityDeficitChange(Number(event.target.value))}
        style={{ "--fill": `${fill}%` }}
      />
    </Panel>
  );
}
