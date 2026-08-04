import { cn } from "@/lib/utils";

/* ============================================================
 * BarChart — simple grouped/single bar chart via divs
 * ============================================================ */
export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  /** [primaryColor, secondaryColor] when rendering two series per bar */
  seriesColors?: [string, string];
  /** optional two series: data[i].value pairs */
  secondary?: number[];
  className?: string;
}

export function BarChart({
  data,
  height = 220,
  seriesColors = ["#00236F", "#FFC641"],
  secondary,
  className,
}: BarChartProps) {
  const max = Math.max(
    100,
    ...data.map((d) => d.value),
    ...(secondary ?? [])
  );

  return (
    <div className={cn("flex items-end gap-2", className)} style={{ height }}>
      {data.map((d, i) => {
        const h1 = Math.max(2, (d.value / max) * 100);
        const h2 =
          secondary && secondary[i] !== undefined
            ? Math.max(2, (secondary[i] / max) * 100)
            : undefined;
        return (
          <div
            key={d.label}
            className="group relative flex h-full flex-1 flex-col justify-end gap-0.5"
            title={`${d.label}: ${d.value}%`}
          >
            {h2 !== undefined && (
              <div
                className="w-full rounded-t-sm transition-all group-hover:opacity-90"
                style={{ height: `${h2}%`, backgroundColor: seriesColors[1] }}
              />
            )}
            <div
              className="w-full rounded-t-sm transition-all group-hover:opacity-90"
              style={{
                height: `${h1}%`,
                backgroundColor: d.color ?? seriesColors[0],
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * LineChart — SVG area/line chart
 * ============================================================ */
export interface LineSeries {
  name: string;
  color: string;
  values: number[];
}

interface LineChartProps {
  labels: string[];
  series: LineSeries[];
  height?: number;
  yMax?: number;
  className?: string;
}

export function LineChart({
  labels,
  series,
  height = 240,
  yMax = 100,
  className,
}: LineChartProps) {
  const width = 640;
  const pad = { top: 12, right: 12, bottom: 24, left: 8 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const xStep = innerW / (labels.length - 1);
  const xFor = (i: number) => pad.left + i * xStep;
  const yFor = (v: number) => pad.top + innerH - (v / yMax) * innerH;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={`Line chart: ${series.map((s) => s.name).join(", ")}`}
        preserveAspectRatio="none"
      >
        {/* gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + innerH * f}
            y2={pad.top + innerH * f}
            stroke="#E3E2E8"
            strokeWidth={1}
            strokeDasharray={f === 0 ? undefined : "4 4"}
          />
        ))}
        {/* y labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <text
            key={f}
            x={width - pad.right - 4}
            y={pad.top + innerH * f + 3}
            textAnchor="end"
            className="fill-admin-text-muted"
            fontSize={10}
          >
            {Math.round(yMax * f)}
          </text>
        ))}
        {/* x labels */}
        {labels.map((l, i) => (
          <text
            key={l}
            x={xFor(i)}
            y={height - 6}
            textAnchor="middle"
            className="fill-admin-text-muted"
            fontSize={10}
          >
            {l}
          </text>
        ))}
        {/* series */}
        {series.map((s) => {
          const pts = s.values.map((v, i) => `${xFor(i)},${yFor(v)}`).join(" ");
          const areaPts = `${pad.left},${pad.top + innerH} ${pts} ${
            pad.left + innerW
          },${pad.top + innerH}`;
          return (
            <g key={s.name}>
              <polygon
                points={areaPts}
                fill={s.color}
                opacity={0.08}
              />
              <polyline
                points={pts}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {s.values.map((v, i) => (
                <circle
                  key={i}
                  cx={xFor(i)}
                  cy={yFor(v)}
                  r={3}
                  fill="#FFFFFF"
                  stroke={s.color}
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ============================================================
 * DonutChart — SVG ring with center label
 * ============================================================ */
interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
  className?: string;
}

export function DonutChart({
  data,
  size = 180,
  thickness = 22,
  centerLabel,
  centerSub,
  className,
}: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const segments = data.reduce<number[]>((acc, _d, i) => {
    const prev = i === 0 ? 0 : acc[i - 1] + data[i - 1].value / total;
    acc.push(prev);
    return acc;
  }, []);

  return (
    <div className={cn("relative inline-flex", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E8E7EE"
          strokeWidth={thickness}
        />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const dashOffset = -segments[i] * c;
          return (
            <circle
              key={d.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
        })}
      </svg>
      {(centerLabel || centerSub) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerLabel && (
            <span className="text-2xl font-bold leading-none text-text-primary">
              {centerLabel}
            </span>
          )}
          {centerSub && (
            <span className="mt-1 text-xs font-medium uppercase tracking-wide text-admin-text-muted">
              {centerSub}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * ProgressBar — thin linear progress
 * ============================================================ */
interface ProgressBarProps {
  value: number;
  color?: string;
  track?: string;
  className?: string;
}

export function ProgressBar({
  value,
  color = "#FFC641",
  track = "#E8E7EE",
  className,
}: ProgressBarProps) {
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full", className)}
      style={{ backgroundColor: track }}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}
