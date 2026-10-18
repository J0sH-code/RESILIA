/** SVG path for a bar with rounded top corners. */
export function topRoundedBar(x, y, width, height, radius = 2) {
  const r = Math.min(radius, width / 2, height);
  return [
    `M${x},${y + height}`,
    `V${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    `H${x + width - r}`,
    `Q${x + width},${y} ${x + width},${y + r}`,
    `V${y + height}`,
    "Z",
  ].join(" ");
}

/** Rounds `value` up to the next multiple of `step` (minimum one step). */
export function niceMax(value, step) {
  return Math.max(step, Math.ceil(value / step) * step);
}
