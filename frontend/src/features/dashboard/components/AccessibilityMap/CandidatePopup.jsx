import playIcon from "@/assets/icons/play-inverse.svg";
import xIcon from "@/assets/icons/x.svg";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Icon from "@/components/ui/Icon.jsx";
import { formatNumber } from "../../format.js";
import styles from "./AccessibilityMap.module.css";

export default function CandidatePopup({ candidate, style, docked = false, onClose, onSimulate }) {
  const label = `CANDIDATE ${String(candidate.rank).padStart(2, "0")}`;

  return (
    <div
      className={`${styles.popup} ${docked ? styles.popupDocked : ""}`}
      style={style}
      role="dialog"
      aria-labelledby="candidate-popup-title"
    >
      <div className={styles.popupHeading}>
        <Badge>{label}</Badge>
        <button type="button" className={styles.popupClose} onClick={onClose}>
          <Icon src={xIcon} label="Close candidate details" />
        </button>
      </div>
      <h3 className={styles.popupTitle} id="candidate-popup-title">
        {candidate.name}
      </h3>
      <p className={styles.popupBody}>
        {candidate.facility} · {formatNumber(candidate.capacity)} places
        <br />
        {candidate.areaHa} ha · {candidate.hazardNote}
      </p>
      <p className={styles.popupImpact}>
        <strong>+{formatNumber(candidate.residentsCovered)} covered</strong>
        <span>{candidate.score} / 100 score</span>
      </p>
      <Button
        variant="strong"
        size="sm"
        fullWidth
        icon={playIcon}
        onClick={onSimulate}
        disabled={!candidate.simulated}
        title={candidate.simulated ? undefined : "Not modeled in this demo"}
      >
        Simulate this facility
      </Button>
    </div>
  );
}
