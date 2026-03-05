"use client";

/**
 * Radar chart comparing player's votes to community average.
 * Displays a polygon SVG with N axes (one per category).
 */

interface RadarAxis {
  label: string;
  /** Player's "cut" percentage (0-100) for this axis */
  playerValue: number;
  /** Community average "cut" percentage (0-100) for this axis */
  communityValue: number;
}

interface RadarChartProps {
  axes: RadarAxis[];
  /** Size in px (square) */
  size?: number;
}

/** Convert polar coordinates to SVG cartesian */
function polarToXY(
  cx: number,
  cy: number,
  radius: number,
  angleRad: number
): { x: number; y: number } {
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

function buildPolygon(
  values: number[],
  cx: number,
  cy: number,
  maxRadius: number
): string {
  const n = values.length;
  return values
    .map((v, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      const r = (v / 100) * maxRadius;
      const { x, y } = polarToXY(cx, cy, r, angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function RadarChart({ axes, size = 220 }: RadarChartProps) {
  if (axes.length < 3) return null;

  const cx = 50;
  const cy = 50;
  const maxR = 38;
  const n = axes.length;
  const rings = [1, 0.75, 0.5, 0.25];

  const communityPoints = buildPolygon(
    axes.map((a) => a.communityValue),
    cx,
    cy,
    maxR
  );
  const playerPoints = buildPolygon(
    axes.map((a) => a.playerValue),
    cx,
    cy,
    maxR
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Axis labels positioned absolutely around the chart */}
        {axes.map((axis, i) => {
          const angle = (2 * Math.PI * i) / n - Math.PI / 2;
          const labelR = maxR + 11;
          const { x, y } = polarToXY(cx, cy, labelR, angle);
          // Convert 0-100 viewBox coords to percentage for positioning
          const left = `${x}%`;
          const top = `${y}%`;

          return (
            <span
              key={axis.label}
              className="absolute text-[9px] font-bold text-muted-foreground uppercase leading-none whitespace-nowrap pointer-events-none"
              style={{
                left,
                top,
                transform: "translate(-50%, -50%)",
              }}
            >
              {axis.label}
            </span>
          );
        })}

        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Background rings */}
          {rings.map((scale) => (
            <circle
              key={scale}
              cx={cx}
              cy={cy}
              r={maxR * scale}
              fill="none"
              stroke="currentColor"
              className="text-border"
              strokeWidth="0.3"
              opacity={0.4}
            />
          ))}

          {/* Axis lines */}
          {axes.map((_, i) => {
            const angle = (2 * Math.PI * i) / n - Math.PI / 2;
            const { x, y } = polarToXY(cx, cy, maxR, angle);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="currentColor"
                className="text-border"
                strokeWidth="0.3"
                opacity={0.3}
              />
            );
          })}

          {/* Community polygon (grey, behind) */}
          <polygon
            points={communityPoints}
            fill="rgba(148, 163, 184, 0.15)"
            stroke="#94a3b8"
            strokeWidth="0.8"
          />

          {/* Player polygon (primary, on top) */}
          <polygon
            points={playerPoints}
            fill="rgba(16, 185, 129, 0.2)"
            stroke="#10B981"
            strokeWidth="1.5"
          />

          {/* Player data points */}
          {axes.map((axis, i) => {
            const angle = (2 * Math.PI * i) / n - Math.PI / 2;
            const r = (axis.playerValue / 100) * maxR;
            const { x, y } = polarToXY(cx, cy, r, angle);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill="#10B981"
                stroke="white"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-xs text-muted-foreground">Toi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-500" />
          <span className="text-xs text-muted-foreground">Communauté</span>
        </div>
      </div>
    </div>
  );
}
