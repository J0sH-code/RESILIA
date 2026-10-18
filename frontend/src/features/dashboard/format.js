const numberFormat = new Intl.NumberFormat("en-PH");

export const formatNumber = (value) => numberFormat.format(value);

/** 48_600_000 → "₱48.6M"; 5400 → "₱5,400". */
export function formatPeso(value) {
  if (value >= 1_000_000) return `₱${(value / 1_000_000).toFixed(1)}M`;
  return `₱${numberFormat.format(Math.round(value))}`;
}

/** 7500 → "7.5k"; 40000 → "40k". */
export function formatThousands(value) {
  const thousands = value / 1000;
  return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}k`;
}
