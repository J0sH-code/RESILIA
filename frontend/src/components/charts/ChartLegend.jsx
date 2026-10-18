import styles from "./Charts.module.css";

export default function ChartLegend({ unit, items }) {
  return (
    <div className={styles.legend}>
      <span>{unit}</span>
      {items.map((item) => (
        <span key={item.label} className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}
