import Icon from "./Icon.jsx";
import styles from "./Panel.module.css";

export function Panel({ as: Tag = "section", className = "", children, ...rest }) {
  return (
    <Tag className={`${styles.panel} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function PanelHeading({ icon, title, meta, id, children }) {
  return (
    <div className={styles.heading}>
      {icon && <Icon src={icon} />}
      <h2 className={styles.title} id={id}>
        {title}
      </h2>
      {meta && <p className={styles.meta}>{meta}</p>}
      {children}
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
