import Icon from "./Icon.jsx";
import styles from "./Button.module.css";

/**
 * Variants follow the Figma "Action" component:
 * - secondary: white with border (default)
 * - primary: teal fill
 * - strong: deep teal fill
 */
export default function Button({
  variant = "secondary",
  size = "md",
  icon,
  fullWidth = false,
  className = "",
  children,
  ...rest
}) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : "",
    className,
  ].join(" ");

  return (
    <button type="button" className={classes} {...rest}>
      {icon && <Icon src={icon} />}
      <span>{children}</span>
    </button>
  );
}
