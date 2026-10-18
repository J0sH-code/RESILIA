import styles from "./Badge.module.css";

/** Small uppercase-friendly status label. Tones mirror the Figma "Status badge". */
export default function Badge({ tone = "brand", className = "", children }) {
  return <span className={`${styles.badge} ${styles[tone]} ${className}`}>{children}</span>;
}
