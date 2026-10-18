import styles from "./BrandLogo.module.css";

/** RESiLiA wordmark with its three-block mark, rebuilt from the Figma brand identity. */
export default function BrandLogo() {
  return (
    <span className={styles.logo} role="img" aria-label="RESILIA">
      <span className={styles.markVertical} aria-hidden="true" />
      <span className={styles.markHorizontal} aria-hidden="true" />
      <span className={styles.markCorner} aria-hidden="true" />
      <span className={styles.wordmark} aria-hidden="true">
        RESiLiA
      </span>
    </span>
  );
}
