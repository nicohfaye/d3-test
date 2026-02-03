import * as React from "react";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleLinear, scaleLog } from "@visx/scale";
import * as d3 from "d3";

import { Example } from "@/components/example";
import wellLogLas from "@/data/well-a10.las?raw";
import { parseLas, type WellLogPoint } from "@/data/well-log";

type LegendItem = {
  min: number;
  max: number;
};

function domainFrom<T>(
  values: T[],
  accessor: (value: T) => number,
  fallback: [number, number] = [0, 1],
): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    const current = accessor(value);
    if (!Number.isFinite(current)) continue;
    if (current < min) min = current;
    if (current > max) max = current;
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return fallback;
  }

  if (min === max) {
    return [min - 1, max + 1];
  }

  return [min, max];
}

function positiveDomain<T>(
  values: T[],
  accessor: (value: T) => number,
  fallback: [number, number] = [0.1, 10],
): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    const current = accessor(value);
    if (!Number.isFinite(current) || current <= 0) continue;
    if (current < min) min = current;
    if (current > max) max = current;
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return fallback;
  }

  if (min === max) {
    return [min * 0.9, max * 1.1];
  }

  return [min, max];
}

function formatValue(value: number) {
  const absValue = Math.abs(value);
  if (absValue >= 1000) return value.toFixed(0);
  if (absValue >= 100) return value.toFixed(1);
  if (absValue >= 1) return value.toFixed(2);
  return value.toPrecision(2);
}

function buildDepthLegend(data: WellLogPoint[]): LegendItem {
  const [min, max] = domainFrom(data, (point) => point.depth, [0, 1]);
  return { min, max };
}

function WellLogScatterplot({
  data,
  width,
  height,
  depthScale,
}: {
  data: WellLogPoint[];
  width: number;
  height: number;
  depthScale: (value: number) => string;
}) {
  const [hovered, setHovered] = React.useState<WellLogPoint | null>(null);
  const isCompact = width < 520;
  const margin = isCompact
    ? ({ top: 12, right: 12, bottom: 48, left: 56 } as const)
    : ({ top: 16, right: 20, bottom: 56, left: 70 } as const);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  if (innerWidth <= 0 || innerHeight <= 0) {
    return null;
  }

  const xDomain = domainFrom(data, (point) => point.porosity, [0, 0.35]);
  const yDomain = positiveDomain(
    data,
    (point) => point.resistivity,
    [0.1, 100],
  );

  const xScale = scaleLinear({
    domain: xDomain,
    range: [0, innerWidth],
    nice: true,
  });

  const yScale = scaleLog({
    domain: yDomain,
    range: [innerHeight, 0],
    nice: true,
  });

  const xTickCount = Math.max(2, Math.floor(innerWidth / 120));
  const yTickCount = Math.max(2, Math.floor(innerHeight / 90));
  const xTicks = xScale.ticks(xTickCount);
  const yTicks = yScale.ticks(yTickCount);

  const tooltipLines = hovered
    ? [
        `Depth: ${formatValue(hovered.depth)} m`,
        `Porosity: ${formatValue(hovered.porosity)}`,
        `Resistivity: ${formatValue(hovered.resistivity)} Ohm.m`,
        `Gamma: ${hovered.gamma === null ? "N/A" : formatValue(hovered.gamma)} gAPI`,
        `Perm: ${hovered.permeability === null ? "N/A" : formatValue(hovered.permeability)} mD`,
        `Lithology: ${hovered.lithology === null ? "N/A" : hovered.lithology}`,
      ]
    : [];

  const tooltipWidth = isCompact ? 200 : 220;
  const tooltipLineHeight = isCompact ? 14 : 16;
  const tooltipPaddingX = 12;
  const tooltipPaddingY = 10;
  const tooltipHeight =
    tooltipPaddingY * 2 + tooltipLines.length * tooltipLineHeight;

  const tooltip = hovered
    ? {
        x: Math.min(
          Math.max(xScale(hovered.porosity) + 10, 0),
          Math.max(0, innerWidth - tooltipWidth),
        ),
        y: Math.min(
          Math.max(yScale(hovered.resistivity) - tooltipHeight - 8, 0),
          Math.max(0, innerHeight - tooltipHeight),
        ),
      }
    : null;

  return (
    <svg
      width={width}
      height={height}
      className="text-muted-foreground font-sans"
    >
      <rect width={width} height={height} fill="transparent" />
      <Group left={margin.left} top={margin.top}>
        {xTicks.map((tick) => (
          <line
            key={`grid-x-${tick}`}
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1={0}
            y2={innerHeight}
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeWidth={1}
          />
        ))}
        {yTicks.map((tick) => (
          <line
            key={`grid-y-${tick}`}
            x1={0}
            x2={innerWidth}
            y1={yScale(tick)}
            y2={yScale(tick)}
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeWidth={1}
          />
        ))}
        {data.map((point, index) => (
          <circle
            key={`${point.depth}-${point.resistivity}-${index}`}
            cx={xScale(point.porosity)}
            cy={yScale(point.resistivity)}
            r={isCompact ? 2.5 : 3}
            fill={depthScale(point.depth)}
            opacity={0.85}
            onMouseEnter={() => setHovered(point)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {tooltip && hovered ? (
          <g
            transform={`translate(${tooltip.x}, ${tooltip.y})`}
            pointerEvents="none"
          >
            <rect
              width={tooltipWidth}
              height={tooltipHeight}
              rx={10}
              fill="var(--card)"
              stroke="var(--border)"
              opacity={0.98}
            />
            {tooltipLines.map((line, index) => (
              <text
                key={line}
                x={tooltipPaddingX}
                y={tooltipPaddingY + tooltipLineHeight * (index + 1) - 2}
                fill="var(--foreground)"
                fontSize={isCompact ? 10 : 12}
              >
                {line}
              </text>
            ))}
          </g>
        ) : null}
        <AxisBottom
          top={innerHeight}
          scale={xScale}
          stroke="currentColor"
          tickStroke="currentColor"
          tickValues={xTicks}
          tickLabelProps={() => ({
            fill: "currentColor",
            fontSize: isCompact ? 10 : 11,
            textAnchor: isCompact ? "end" : "middle",
            dy: isCompact ? 12 : 6,
            transform: isCompact ? "rotate(-30)" : undefined,
          })}
        />
        <AxisLeft
          scale={yScale}
          stroke="currentColor"
          tickStroke="currentColor"
          tickValues={yTicks}
          tickLabelProps={() => ({
            fill: "currentColor",
            fontSize: isCompact ? 10 : 11,
            textAnchor: "end",
            dx: -6,
            dy: 4,
          })}
        />
        <text
          x={innerWidth / 2}
          y={innerHeight + (isCompact ? 40 : 48)}
          fill="var(--foreground)"
          fontSize={isCompact ? 11 : 12}
          fontWeight={500}
          textAnchor="middle"
        >
          Porosity (fraction)
        </text>
        <text
          transform={`translate(${-(isCompact ? 44 : 56)}, ${
            innerHeight / 2
          }) rotate(-90)`}
          fill="var(--foreground)"
          fontSize={isCompact ? 11 : 12}
          fontWeight={500}
          textAnchor="middle"
        >
          Resistivity (Ohm.m)
        </text>
      </Group>
    </svg>
  );
}

export function VisxScatterplotExample() {
  const { data, depthLegend, depthScale, depthGradient } =
    useScatterplotData();
  const { parentRef, width, height } = useParentSize({
    debounceTime: 100,
  });

  return (
    <Example
      title="Well Log Crossplot (Porosity vs Resistivity)"
      containerClassName="md:col-span-2"
      className="min-h-[660px]"
    >
      <ScatterplotContent
        data={data}
        parentRef={parentRef}
        width={width}
        height={height}
        depthLegend={depthLegend}
        depthScale={depthScale}
        depthGradient={depthGradient}
      />
    </Example>
  );
}

export function VisxScatterplotFullExample() {
  const { data, depthLegend, depthScale, depthGradient } =
    useScatterplotData();
  const { parentRef, width, height } = useParentSize({
    debounceTime: 100,
  });

  return (
    <Example
      title="Well Log Crossplot (Porosity vs Resistivity)"
      containerClassName="md:col-span-2 max-w-none"
      className="min-h-[660px]"
    >
      <ScatterplotContent
        data={data}
        parentRef={parentRef}
        width={width}
        height={height}
        depthLegend={depthLegend}
        depthScale={depthScale}
        depthGradient={depthGradient}
      />
    </Example>
  );
}

export function VisxScatterplotPanel() {
  const { data, depthLegend, depthScale, depthGradient } =
    useScatterplotData();
  const { parentRef, width, height } = useParentSize({
    debounceTime: 100,
  });

  return (
    <ScatterplotContent
      data={data}
      parentRef={parentRef}
      width={width}
      height={height}
      depthLegend={depthLegend}
      depthScale={depthScale}
      depthGradient={depthGradient}
    />
  );
}

function ScatterplotContent({
  data,
  parentRef,
  width,
  height,
  depthLegend,
  depthScale,
  depthGradient,
}: {
  data: WellLogPoint[];
  parentRef: React.RefObject<HTMLDivElement>;
  width: number;
  height: number;
  depthLegend: LegendItem;
  depthScale: (value: number) => string;
  depthGradient: string;
}) {
  return (
    <div className="w-full">
      <div
        ref={parentRef}
        className="h-[560px] w-full rounded-lg border bg-muted/20 p-2"
      >
        {width > 0 && height > 0 ? (
          <WellLogScatterplot
            data={data}
            width={width}
            height={height}
            depthScale={depthScale}
          />
        ) : null}
      </div>
      <div className="mt-3 min-h-[24px] flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Depth (m)</span>
        <span>{formatValue(depthLegend.min)}</span>
        <span
          className="h-2 w-40 rounded-full border"
          style={{ background: depthGradient }}
        />
        <span>{formatValue(depthLegend.max)}</span>
      </div>
    </div>
  );
}

function useScatterplotData() {
  const data = React.useMemo(() => parseLas(wellLogLas), []);
  const depthLegend = React.useMemo(() => buildDepthLegend(data), [data]);
  const depthScale = React.useMemo(
    () =>
      d3
        .scaleSequential(d3.interpolateViridis)
        .domain([depthLegend.min, depthLegend.max]),
    [depthLegend],
  );
  const depthGradient = React.useMemo(
    () =>
      `linear-gradient(90deg, ${d3.interpolateViridis(0)}, ${d3.interpolateViridis(
        0.5,
      )}, ${d3.interpolateViridis(1)})`,
    [],
  );

  return { data, depthLegend, depthScale, depthGradient };
}
