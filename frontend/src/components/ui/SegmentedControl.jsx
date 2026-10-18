import styles from "./SegmentedControl.module.css";

/**
 * Single-choice option group.
 * - group: options inside one bordered track (scope / scenario switchers)
 * - tiles: equal-width filled tiles (travel-time thresholds)
 * - chips: bordered chips (flood projection horizons)
 */
export default function SegmentedControl({
  options,
  value,
  onChange,
  label,
  variant = "group",
  className = "",
}) {
  return (
    <div role="radiogroup" aria-label={label} className={`${styles[variant]} ${className}`}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={styles.option}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
