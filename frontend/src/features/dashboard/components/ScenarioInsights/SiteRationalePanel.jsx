import clipboardCheckIcon from "@/assets/icons/clipboard-check.svg";
import sparklesIcon from "@/assets/icons/sparkles.svg";
import Badge from "@/components/ui/Badge.jsx";
import Icon from "@/components/ui/Icon.jsx";
import { Panel, PanelHeading } from "@/components/ui/Panel.jsx";
import styles from "./ScenarioInsights.module.css";

export default function SiteRationalePanel({ rationale }) {
  return (
    <Panel aria-labelledby="site-rationale-title" className={styles.rationalePanel}>
      <PanelHeading id="site-rationale-title" icon={sparklesIcon} title="Why this site?">
        <Badge>AI · DEMO</Badge>
      </PanelHeading>
      <p className={styles.rationaleText}>{rationale.summary}</p>
      <ul className={styles.factors} aria-label="Scoring weights">
        {rationale.factors.map((factor) => (
          <li key={factor.label}>
            <Badge tone="neutral">
              {factor.label} {factor.weight}%
            </Badge>
          </li>
        ))}
      </ul>
      <p className={styles.reviewNote}>
        <Icon src={clipboardCheckIcon} />
        {rationale.reviewNote}
      </p>
    </Panel>
  );
}
