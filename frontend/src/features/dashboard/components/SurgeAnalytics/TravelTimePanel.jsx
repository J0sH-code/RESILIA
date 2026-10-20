import timerIcon from "@/assets/icons/timer.svg";
import ChartLegend from "@/components/charts/ChartLegend.jsx";
import chartStyles from "@/components/charts/Charts.module.css";
import { niceMax, topRoundedBar } from "@/components/charts/chartUtils.js";
import { Panel, PanelHeading } from "@/components/ui/Panel.jsx";
import { formatNumber, formatThousands } from "../../format.js";
import styles from "./SurgeAnalytics.module.css";

// Chart geometry in SVG units (matches the Figma frame at 1680 px).
const WIDTH = 412;
const HEIGHT = 134;
const BASELINE = 110;
const TOP = 22;
const PLOT_LEFT = 24;
const PLOT_RIGHT = 404;
const BIN_START = 44;
const BIN_STEP = 123;
const BAR_WIDTH = 25;
const TICK_STEP = 20000;

const SERIES = [
  { key: "before", label: "Before", color: "var(--color-chart-existing)", offset: 9 },
  { key: "after", label: "After", color: "var(--color-chart-proposed)", offset: 40 },
];

export default function TravelTimePanel({ bins, totalResidents }) {
  const max = niceMax(Math.max(...bins.flatMap((bin) => [bin.before, bin.after])), TICK_STEP);
  const y = (value) => BASELINE - (value / max) * (BASELINE - TOP);
  const ticks = Array.from({ length: max / TICK_STEP + 1 }, (_, index) => index * TICK_STEP);
  const beyond = bins[bins.length - 1];

  return (
    <Panel aria-labelledby="travel-time-title" className={styles.panel}>
      <PanelHeading
        id="travel-time-title"
        demo
        icon={timerIcon}
        title="Travel-time histogram"
        meta={`${formatNumber(totalResidents)} residents`}
      />
      <ChartLegend unit="Residents · thousands" items={SERIES} />

      <svg
        className={chartStyles.chart}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Residents by emergency travel time, before and after candidate 01"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line className={chartStyles.gridline} x1={PLOT_LEFT} x2={PLOT_RIGHT} y1={y(tick)} y2={y(tick)} />
            <text className={chartStyles.axisLabel} x={0} y={y(tick)} dominantBaseline="middle">
              {tick / 1000}
            </text>
          </g>
        ))}

        {/* Adequate-access threshold sits between the first and second bins. */}
        <line
          x1={BIN_START + BIN_STEP - 3.5}
          x2={BIN_START + BIN_STEP - 3.5}
          y1={10}
          y2={BASELINE}
          stroke="var(--color-brand-700)"
          strokeOpacity={0.35}
        />

        {bins.map((bin, index) => {
          const left = BIN_START + index * BIN_STEP;
          return (
            <g key={bin.label} className={chartStyles.group}>
              <title>{`${bin.label}: ${formatNumber(bin.before)} → ${formatNumber(bin.after)} residents`}</title>
              {SERIES.map((series) => (
                <path
                  key={series.key}
                  className={chartStyles.bar}
                  d={topRoundedBar(left + series.offset, y(bin[series.key]), BAR_WIDTH, BASELINE - y(bin[series.key]))}
                  fill={series.color}
                />
              ))}
              <text className={styles.afterLabel} x={left + 43} y={y(bin.after) - 5}>
                {formatThousands(bin.after)}
              </text>
              <text className={chartStyles.categoryLabel} x={left + 47.5} y={131} textAnchor="middle">
                {bin.label}
              </text>
            </g>
          );
        })}
      </svg>

      <p className={`${styles.summary} ${styles.summaryBrand}`}>
        <strong>
          Beyond 30 min: {formatNumber(beyond.before)} → {formatNumber(beyond.after)} residents
        </strong>
      </p>
    </Panel>
  );
}
