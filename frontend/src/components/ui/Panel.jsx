import Badge from "./Badge.jsx";
import Icon from "./Icon.jsx";
import styles from "./Panel.module.css";

export function Panel({ as: Tag = "section", className = "", children, ...rest }) {
  return (
    <Tag className={`${styles.panel} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * `demo` marks a panel whose numbers are synthetic placeholders, so they are
 * never mistaken for analysis results.
 */
export function PanelHeading({ icon, title, meta, id, demo = false, children }) {
  return (
    <div className={styles.heading}>
      {icon && <Icon src={icon} />}
      <h2 className={styles.title} id={id}>
        {title}
      </h2>
      {meta && <p className={styles.meta}>{meta}</p>}
      {children}
      {demo && (
        <Badge tone="warning" title="Synthetic demo values until the backend analysis exists">
          DEMO
        </Badge>
      )}
    </div>
  );
}

export function Divider({ vertical = false, className = "" }) {
  return (
    <div
      role="separator"
      aria-orientation={vertical ? "vertical" : "horizontal"}
      className={`${vertical ? styles.dividerVertical : styles.divider} ${className}`}
    />
  );
}
