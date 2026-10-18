import mapPinIcon from "@/assets/icons/map-pin-panel.svg";
import { Panel, PanelHeading } from "@/components/ui/Panel.jsx";
import { formatNumber } from "../../format.js";
import styles from "./PlanningControls.module.css";

export default function CandidateSitesPanel({ candidates, selectedId, onSelect, className }) {
  return (
    <Panel aria-labelledby="candidate-sites-title" className={`${styles.compact} ${className}`}>
      <PanelHeading
        id="candidate-sites-title"
        icon={mapPinIcon}
        title="Ranked candidate sites"
        meta={`${candidates.length} sites`}
      />
      <p className={styles.caption}>Composite suitability · illustrative scores</p>

      <ol className={styles.candidateList}>
        {candidates.map((candidate) => (
          <li key={candidate.id}>
            <button
              type="button"
              className={styles.candidate}
              aria-pressed={candidate.id === selectedId}
              onClick={() => onSelect(candidate.id)}
            >
              <span className={styles.rank}>{candidate.rank}</span>
              <span className={styles.candidateInfo}>
                <span className={styles.candidateName}>{candidate.name}</span>
                <span className={styles.candidateMeta}>
                  +{formatNumber(candidate.residentsCovered)} residents covered
                </span>
              </span>
              <span className={styles.score}>
                <span className={styles.scoreValue}>{candidate.score}</span>
                <span className={styles.scoreMax}>/ 100</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
