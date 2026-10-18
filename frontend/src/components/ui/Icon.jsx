/**
 * Renders a static SVG icon exported from Figma at its intrinsic size.
 * Decorative by default; pass `label` when the icon carries meaning on its own.
 */
export default function Icon({ src, label, className }) {
  return (
    <img
      src={src}
      alt={label ?? ""}
      aria-hidden={label ? undefined : true}
      className={className}
      draggable={false}
    />
  );
}
