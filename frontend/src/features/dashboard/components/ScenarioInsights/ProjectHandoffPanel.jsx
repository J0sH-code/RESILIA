import arrowUpRightIcon from "@/assets/icons/arrow-up-right.svg";
import workflowIcon from "@/assets/icons/workflow.svg";
import Button from "@/components/ui/Button.jsx";
import Icon from "@/components/ui/Icon.jsx";
import { Panel } from "@/components/ui/Panel.jsx";
import styles from "./ScenarioInsights.module.css";

export default function ProjectHandoffPanel({ className = "" }) {
  return (
    <Panel aria-labelledby="handoff-title" className={`${styles.handoffPanel} ${className}`}>
      <div className={styles.handoffHeading}>
        <h2 id="handoff-title">Turn the gap into a project</h2>
        <Icon src={workflowIcon} />
      </div>
      <p className={styles.handoffText}>
        Package site rationale, capacity need and the indicative budget for LGU review.
      </p>
      <Button icon={arrowUpRightIcon} fullWidth>
        Push gap to DEPMIS
      </Button>
      <p className={styles.handoffNote}>Draft handoff only · DEPMIS is not connected</p>
    </Panel>
  );
}
