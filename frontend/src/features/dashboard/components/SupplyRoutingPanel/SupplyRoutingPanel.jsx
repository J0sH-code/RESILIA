import arrowRightIcon from "@/assets/icons/arrow-right-route.svg";
import truckIcon from "@/assets/icons/truck.svg";
import warehouseIcon from "@/assets/icons/warehouse.svg";
import Badge from "@/components/ui/Badge.jsx";
import Icon from "@/components/ui/Icon.jsx";
import { Divider, Panel, PanelHeading } from "@/components/ui/Panel.jsx";
import styles from "./SupplyRoutingPanel.module.css";

export default function SupplyRoutingPanel({ route, className = "" }) {
  return (
    <Panel aria-labelledby="supply-routing-title" className={`${styles.panel} ${className}`}>
      <PanelHeading
        id="supply-routing-title"
        icon={truckIcon}
        title="Emergency supply routing & readiness"
      >
        <Badge>DEMO ROUTE PREVIEW</Badge>
      </PanelHeading>

      <div className={styles.columns}>
        <div className={styles.route}>
          <p className={styles.endpoints}>
            <Icon src={warehouseIcon} />
            <span>{route.from}</span>
            <Icon src={arrowRightIcon} label="to" />
            <span>{route.to}</span>
            <Badge>
              {route.minutes} min · {route.distanceKm} km
            </Badge>
          </p>
          <ul className={styles.restrictions} aria-label="Route restrictions">
            {route.restrictions.map((restriction) => (
              <li key={restriction.label}>
                <Badge tone={restriction.tone}>{restriction.label}</Badge>
              </li>
            ))}
          </ul>
          <p className={styles.note}>{route.note}</p>
        </div>

        <Divider vertical />

        <div className={styles.shortages}>
          <div className={styles.shortagesHeading}>
            <h3>Unfilled at proposed site</h3>
            <a href="#readiness" className={styles.reviewLink}>
              Review readiness ↗
            </a>
          </div>
          {route.shortages.map((group, index) => (
            <p key={index} className={styles.shortageLine}>
              {group.map((item, itemIndex) => (
                <span key={item.label}>
                  {itemIndex > 0 && <span className={styles.separator}>·</span>}
                  {item.label} <span className={styles.count}>{item.count}</span>
                </span>
              ))}
            </p>
          ))}
          <p className={styles.warning}>
            All counts are illustrative shortages, not deployed resources.
          </p>
        </div>
      </div>
    </Panel>
  );
}
