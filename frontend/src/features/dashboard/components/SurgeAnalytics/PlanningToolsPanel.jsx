import { useState } from "react";

import chevronDownIcon from "@/assets/icons/chevron-down-small.svg";
import historyIcon from "@/assets/icons/history.svg";
import playIcon from "@/assets/icons/play-outline.svg";
import smartphoneIcon from "@/assets/icons/smartphone.svg";
import Badge from "@/components/ui/Badge.jsx";
import Button from "@/components/ui/Button.jsx";
import Icon from "@/components/ui/Icon.jsx";
import { Divider, Panel, PanelHeading } from "@/components/ui/Panel.jsx";
import SegmentedControl from "@/components/ui/SegmentedControl.jsx";
import styles from "./SurgeAnalytics.module.css";

export default function PlanningToolsPanel({ tools, horizon, onHorizonChange }) {
  const [replaying, setReplaying] = useState(false);
  const { citizenView } = tools;

  return (
    <Panel aria-labelledby="planning-tools-title" className={styles.toolsPanel}>
      <PanelHeading id="planning-tools-title" icon={historyIcon} title="Event replay & climate horizons">
        <a href="#scenario-tools" className={styles.metaLink}>
          Scenario tools ↗
        </a>
      </PanelHeading>

      <div className={styles.replay}>
        <Button
          size="sm"
          icon={playIcon}
          aria-pressed={replaying}
          onClick={() => setReplaying((value) => !value)}
        >
          {replaying ? "Replaying event…" : "Historical event replay"}
        </Button>
        <button type="button" className={styles.eventPicker} aria-haspopup="listbox">
          {tools.replayEvent}
          <Icon src={chevronDownIcon} />
        </button>
      </div>

      <div className={styles.projection}>
        <span>Flood projection</span>
        <SegmentedControl
          variant="chips"
          label="Flood projection horizon"
          options={tools.horizons}
          value={horizon}
          onChange={onHorizonChange}
        />
      </div>

      <Divider />

      <div className={styles.citizen}>
        <span className={styles.citizenEmblem}>
          <Icon src={smartphoneIcon} />
        </span>
        <div className={styles.citizenContent}>
          <p className={styles.citizenHeading}>
            <span>{citizenView.title}</span>
            <Badge>OFFLINE CACHED</Badge>
          </p>
          <p className={styles.citizenDescription}>{citizenView.description}</p>
          <p className={styles.citizenSample}>{citizenView.sample}</p>
        </div>
      </div>

      <div className={styles.citizenFooter}>
        <span>{citizenView.note}</span>
        <a href="#citizen-view">Preview view ↗</a>
      </div>
    </Panel>
  );
}
