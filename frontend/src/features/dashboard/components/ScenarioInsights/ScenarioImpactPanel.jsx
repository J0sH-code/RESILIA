import arrowCoverageIcon from "@/assets/icons/arrow-right-coverage.svg";
import arrowMetricIcon from "@/assets/icons/arrow-right-metric.svg";
import chartIcon from "@/assets/icons/chart-no-axes-combined.svg";
import Badge from "@/components/ui/Badge.jsx";
import Icon from "@/components/ui/Icon.jsx";
import { Panel, PanelHeading } from "@/components/ui/Panel.jsx";
import { formatNumber } from "../../format.js";
import styles from "./ScenarioInsights.module.css";

export default function ScenarioImpactPanel({ impact, candidate }) {
  const { coverage } = impact;

  return (
    <Panel aria-labelledby="scenario-impact-title" className={styles.impactPanel}>
      <PanelHeading
        id="scenario-impact-title"
        icon={chartIcon}
        title="Scenario impact"
        meta={`Candidate ${String(candidate.rank).padStart(2, "0")}`}
      />
      <p className={styles.caption}>Before → after · modeled preview, not validated findings</p>

      <div className={styles.coverage}>
        <div className={styles.coverageHeading}>
          <h3>Population within {coverage.thresholdMinutes} min</h3>
          <Badge>+{coverage.after - coverage.before} pp</Badge>
        </div>
        <p className={styles.coverageValues}>
          <span className={styles.coverageBefore}>{coverage.before}%</span>
          <Icon src={arrowCoverageIcon} label="to" />
          <span className={styles.coverageAfter}>{coverage.after}%</span>
          <span className={styles.coveragePeople}>
            {formatNumber(coverage.peopleBefore)} → {formatNumber(coverage.peopleAfter)} people
          </span>
        </p>
        <div
          className={styles.coverageBar}
          role="img"
          aria-label={`Coverage rises from ${coverage.before}% to ${coverage.after}%`}
        >
          <span className={styles.coverageFill} style={{ width: `${coverage.after}%` }} />
          <span className={styles.coverageMarker} style={{ left: `${coverage.before}%` }} />
        </div>
      </div>

      <dl className={styles.metrics}>
        {impact.metrics.map((metric) => (
          <div key={metric.label} className={styles.metric}>
            <dt>{metric.label}</dt>
            <dd className={styles.metricBefore}>{formatNumber(metric.before)}</dd>
            <dd aria-hidden="true">
              <Icon src={arrowMetricIcon} />
            </dd>
            <dd className={styles.metricAfter}>{formatNumber(metric.after)}</dd>
            <dd className={styles.metricChange}>{metric.change}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
