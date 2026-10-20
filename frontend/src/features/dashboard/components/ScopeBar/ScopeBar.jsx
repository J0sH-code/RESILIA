import mapPinIcon from "@/assets/icons/map-pin-scope.svg";
import Icon from "@/components/ui/Icon.jsx";
import SegmentedControl from "@/components/ui/SegmentedControl.jsx";
import LocalityPicker from "./LocalityPicker.jsx";
import SearchBox from "./SearchBox.jsx";
import styles from "./ScopeBar.module.css";

export default function ScopeBar({
  scopes,
  scope,
  onScopeChange,
  scenarios,
  scenario,
  onScenarioChange,
  mapData,
  area,
  onSelectArea,
  onFocusFacility,
}) {
  return (
    <div className={styles.bar}>
      <div className={styles.group}>
        <Icon src={mapPinIcon} />
        <span className={styles.label}>LGU SCOPE</span>
        <SegmentedControl label="LGU scope" options={scopes} value={scope} onChange={onScopeChange} />
        <LocalityPicker mapData={mapData} area={area} onSelectArea={onSelectArea} />
      </div>

      <div className={styles.group}>
        <span className={styles.label}>SCENARIO</span>
        <SegmentedControl
          label="Hazard scenario"
          options={scenarios}
          value={scenario}
          onChange={onScenarioChange}
        />
      </div>

      <SearchBox mapData={mapData} onSelectArea={onSelectArea} onFocusFacility={onFocusFacility} />
    </div>
  );
}
