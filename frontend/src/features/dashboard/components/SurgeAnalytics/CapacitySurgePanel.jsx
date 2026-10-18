import chartColumnIcon from "@/assets/icons/chart-column.svg";
import ChartLegend from "@/components/charts/ChartLegend.jsx";
import chartStyles from "@/components/charts/Charts.module.css";
import { niceMax, topRoundedBar } from "@/components/charts/chartUtils.js";
import { Panel, PanelHeading } from "@/components/ui/Panel.jsx";
import { formatNumber } from "../../format.js";
import styles from "./SurgeAnalytics.module.css";

// Chart geometry in SVG units (matches the Figma frame at 1680 px).
const WIDTH = 632;
const HEIGHT = 134;
const BASELINE = 112;
const TOP = 21;
const PLOT_LEFT = 38;
const PLOT_RIGHT = 626;
const GROUP_START = 62;
const GROUP_END = 592;
const GROUP_WIDTH = 104;
const BAR_WIDTH = 18;
const TICK_STEP = 500;

const SERIES = [
  { key: "demand", label: "Projected demand", color: "var(--color-chart-demand)", offset: 7 },
  { key: "existing", label: "Existing capacity", color: "var(--color-chart-existing)", offset: 29 },
  { key: "withCandidate", label: "With candidate 01", color: "var(--color-chart-proposed)", offset: 51 },
];

export default function CapacitySurgePanel({ rows }) {
  const max = niceMax(Math.max(...rows.flatMap((row) => SERIES.map((s) => row[s.key]))), TICK_STEP * 2);
  const y = (value) => BASELINE - (value / max) * (BASELINE - TOP);
  const ticks = Array.from({ length: max / TICK_STEP + 1 }, (_, index) => index * TICK_STEP);
  const step = rows.length > 1 ? (GROUP_END - GROUP_START - GROUP_WIDTH) / (rows.length - 1) : 0;

  const totals = rows.reduce(
    (sum, row) => ({
      demand: sum.demand + row.demand,
      existing: sum.existing + row.existing,
      withCandidate: sum.withCandidate + row.withCandidate,
    }),
    { demand: 0, existing: 0, withCandidate: 0 },
  );
  const deficit = totals.withCandidate - totals.demand;

  return (
    <Panel aria-labelledby="capacity-surge-title" className={styles.panel}>
      <PanelHeading
        id="capacity-surge-title"
        icon={chartColumnIcon}
        title="Evacuation capacity under surge"
        meta={`${rows.length} surrounding barangays`}
      />
      <ChartLegend unit="Places" items={SERIES} />

      <svg
        className={chartStyles.chart}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Projected demand, existing capacity and capacity with candidate 01 per barangay"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line className={chartStyles.gridline} x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={y(tick)} y2={y(tick)} />
            <text className={chartStyles.axisLabel} x={31} y={y(tick)} textAnchor="end" dominantBaseline="middle">
              {formatNumber(tick)}
            </text>
          </g>
        ))}

        {rows.map((row, index) => {
          const left = GROUP_START + index * step;
          return (
            <g key={row.barangay} className={chartStyles.group}>
              <title>
                {`${row.barangay}: demand ${formatNumber(row.demand)}, existing ${formatNumber(row.existing)}, with candidate ${formatNumber(row.withCandidate)}`}
              </title>
              {SERIES.map((series) => (
                <path
                  key={series.key}
                  className={chartStyles.bar}
                  d={topRoundedBar(left + series.offset, y(row[series.key]), BAR_WIDTH, BASELINE - y(row[series.key]))}
                  fill={series.color}
                />
              ))}
              <text className={styles.demandLabel} x={left + 4} y={y(row.demand) - 5}>
                {formatNumber(row.demand)}
              </text>
              <text className={chartStyles.categoryLabel} x={left + 47.5} y={131} textAnchor="middle">
                {row.barangay}
              </text>
            </g>
          );
        })}
      </svg>

      <p className={styles.summary}>
        <span>
          Demo demand {formatNumber(totals.demand)} · usable capacity {formatNumber(totals.existing)} →{" "}
          {formatNumber(totals.withCandidate)}
        </span>
        <strong>
          Deficit {deficit < 0 ? "−" : "+"}
          {formatNumber(Math.abs(deficit))} places
        </strong>
      </p>
    </Panel>
  );
}
