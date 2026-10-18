import landmarkIcon from "@/assets/icons/landmark.svg";
import Badge from "@/components/ui/Badge.jsx";
import { Divider, Panel, PanelHeading } from "@/components/ui/Panel.jsx";
import { formatPeso } from "../../format.js";
import styles from "./ScenarioInsights.module.css";

const SUPERSCRIPTS = ["", "¹", "²", "³"];

export default function InvestmentPanel({ investment }) {
  const total = investment.items.reduce((sum, item) => sum + item.amount, 0);
  const costPerBeneficiary = total / investment.beneficiaries;

  return (
    <Panel aria-labelledby="investment-title" className={styles.investmentPanel}>
      <PanelHeading
        id="investment-title"
        icon={landmarkIcon}
        title="Indicative investment"
        meta={`${investment.currency} · demo`}
      />
      <div className={styles.totalRow}>
        <p className={styles.total}>{formatPeso(total)}</p>
        <Badge tone="warning">±{investment.uncertaintyPercent}% estimate</Badge>
      </div>
      <dl className={styles.breakdown}>
        {investment.items.map((item) => (
          <div key={item.label}>
            <dt>
              {item.label}
              {item.footnote && SUPERSCRIPTS[item.footnote]}
            </dt>
            <dd>{formatPeso(item.amount)}</dd>
          </div>
        ))}
      </dl>
      <Divider />
      <p className={styles.benefitRow}>
        <span>Cost per added beneficiary</span>
        <strong>{formatPeso(costPerBeneficiary)}</strong>
      </p>
      <p className={styles.footnote}>¹{investment.footnote}</p>
    </Panel>
  );
}
