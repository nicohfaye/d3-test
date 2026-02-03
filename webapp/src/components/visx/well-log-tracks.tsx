import * as React from "react";
import { AxisLeft, AxisTop } from "@visx/axis";
import { Group } from "@visx/group";
import { useParentSize } from "@visx/responsive";
import { scaleLinear, scaleLog } from "@visx/scale";
import * as d3 from "d3";

import { Example } from "@/components/example";
import wellLogLas from "@/data/well-a10.las?raw";
import { parseLas, type WellLogPoint } from "@/data/well-log";

type TrackConfig = {
  key: "gamma" | "porosity" | "resistivity";
  label: string;
  color: string;
  scale: "linear" | "log";
  accessor: (point: WellLogPoint) => number | null;
  fallbackDomain: [number, number];
};

const tracks: TrackConfig[] = [
  {
    key: "gamma",
    label: "Gamma Ray (gAPI)",
    color: "#f59e0b",
    scale: "linear",
    accessor: (point) => point.gamma,
    fallbackDomain: [0, 150],
  },
  {
    key: "porosity",
    label: "Porosity (fraction)",
    color: "#0ea5e9",
    scale: "linear",
    accessor: (point) => point.porosity,
    fallbackDomain: [0, 0.3],
  },
  {
    key: "resistivity",
    label: "Resistivity (Ohm.m)",
    color: "#22c55e",
    scale: "log",
    accessor: (point) => point.resistivity,
    fallbackDomain: [0.1, 100],
  },
];

function domainFrom<T>(
  values: T[],
  accessor: (value: T) => number | null,
  fallback: [number, number],
): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    const current = accessor(value);
    if (current === null || !Number.isFinite(current)) continue;
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
  accessor: (value: T) => number | null,
  fallback: [number, number],
): [number, number] {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    const current = accessor(value);
    if (current === null || !Number.isFinite(current) || current <= 0) continue;
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

function WellLogTracks({
  data,
  width,
  height,
}: {
  data: WellLogPoint[];
  width: number;
  height: number;
}) {
  const isCompact = width < 640;
  const margin = isCompact
    ? ({ top: 40, right: 16, bottom: 28, left: 64 } as const)
    : ({ top: 48, right: 20, bottom: 32, left: 72 } as const);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  if (innerWidth <= 0 || innerHeight <= 0) {
    return null;
  }

  const depthDomain = domainFrom(data, (point) => point.depth, [0, 1]);
  const yScale = scaleLinear({
    domain: depthDomain,
    range: [0, innerHeight],
    nice: true,
  });

  const gap = isCompact ? 12 : 16;
  const trackWidth =
    (innerWidth - gap * (tracks.length - 1)) / tracks.length;

  return (
    <svg
      width={width}
      height={height}
      className="text-muted-foreground font-sans"
    >
      <rect width={width} height={height} fill="transparent" />
      <Group left={margin.left} top={margin.top}>
        <AxisLeft
          scale={yScale}
          tickLabelProps={() => ({
            fill: "currentColor",
            fontSize: isCompact ? 10 : 11,
            textAnchor: "end",
            dx: -6,
            dy: 4,
          })}
          tickFormat={(value) => formatValue(value as number)}
          stroke="currentColor"
          tickStroke="currentColor"
        />
        <text
          transform={`translate(${-(isCompact ? 44 : 56)}, ${
            innerHeight / 2
          }) rotate(-90)`}
          fill="var(--foreground)"
          fontSize={isCompact ? 11 : 12}
          fontWeight={500}
          textAnchor="middle"
        >
          Depth (m)
        </text>
        {tracks.map((track, index) => {
          const xOffset = index * (trackWidth + gap);
          const domain =
            track.scale === "log"
              ? positiveDomain(data, track.accessor, track.fallbackDomain)
              : domainFrom(data, track.accessor, track.fallbackDomain);

          const xScale =
            track.scale === "log"
              ? scaleLog({ domain, range: [0, trackWidth], nice: true })
              : scaleLinear({ domain, range: [0, trackWidth], nice: true });

          const xTicks = xScale.ticks(isCompact ? 3 : 5);

          const line = d3
            .line<WellLogPoint>()
            .defined((point) => {
              const value = track.accessor(point);
              if (value === null || !Number.isFinite(value)) return false;
              return track.scale === "log" ? value > 0 : true;
            })
            .x((point) => xScale(track.accessor(point) ?? 0))
            .y((point) => yScale(point.depth));

          const path = line(data) ?? undefined;

          return (
            <Group key={track.key} left={xOffset} top={0}>
              <rect
                width={trackWidth}
                height={innerHeight}
                fill="transparent"
                stroke="var(--border)"
                strokeOpacity={0.6}
                rx={6}
              />
              {xTicks.map((tick) => (
                <line
                  key={`${track.key}-grid-${tick}`}
                  x1={xScale(tick)}
                  x2={xScale(tick)}
                  y1={0}
                  y2={innerHeight}
                  stroke="currentColor"
                  strokeOpacity={0.12}
                  strokeWidth={1}
                />
              ))}
              {path ? (
                <path
                  d={path}
                  fill="none"
                  stroke={track.color}
                  strokeWidth={1.6}
                />
              ) : null}
              <AxisTop
                top={0}
                scale={xScale}
                tickValues={xTicks}
                stroke="currentColor"
                tickStroke="currentColor"
                tickLabelProps={() => ({
                  fill: "currentColor",
                  fontSize: isCompact ? 9 : 10,
                  textAnchor: "middle",
                  dy: -4,
                })}
              />
              <text
                x={trackWidth / 2}
                y={-22}
                fill="var(--foreground)"
                fontSize={isCompact ? 10 : 12}
                fontWeight={500}
                textAnchor="middle"
              >
                {track.label}
              </text>
            </Group>
          );
        })}
      </Group>
    </svg>
  );
}

export function VisxWellLogTracksExample() {
  const data = React.useMemo(() => parseLas(wellLogLas), []);
  const { parentRef, width, height } = useParentSize({
    debounceTime: 100,
  });

  return (
    <Example title="Well Log Tracks" containerClassName="md:col-span-2" className="min-h-[660px]">
      <TracksContent
        data={data}
        parentRef={parentRef}
        width={width}
        height={height}
      />
    </Example>
  );
}

export function VisxWellLogTracksFullExample() {
  const data = React.useMemo(() => parseLas(wellLogLas), []);
  const { parentRef, width, height } = useParentSize({
    debounceTime: 100,
  });

  return (
    <Example
      title="Well Log Tracks"
      containerClassName="md:col-span-2 max-w-none"
      className="min-h-[660px]"
    >
      <TracksContent
        data={data}
        parentRef={parentRef}
        width={width}
        height={height}
      />
    </Example>
  );
}

export function VisxWellLogTracksPanel() {
  const data = React.useMemo(() => parseLas(wellLogLas), []);
  const { parentRef, width, height } = useParentSize({
    debounceTime: 100,
  });

  return (
    <TracksContent
      data={data}
      parentRef={parentRef}
      width={width}
      height={height}
    />
  );
}

function TracksContent({
  data,
  parentRef,
  width,
  height,
}: {
  data: WellLogPoint[];
  parentRef: React.RefObject<HTMLDivElement>;
  width: number;
  height: number;
}) {
  return (
    <div className="w-full">
      <div
        ref={parentRef}
        className="h-[560px] w-full rounded-lg border bg-muted/20 p-2"
      >
        {width > 0 && height > 0 ? (
          <WellLogTracks data={data} width={width} height={height} />
        ) : null}
      </div>
      <div className="mt-3 min-h-[24px] flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {tracks.map((track) => (
          <div key={track.key} className="flex items-center gap-2">
            <span
              className="h-0.5 w-6 rounded-full"
              style={{ backgroundColor: track.color }}
            />
            <span>{track.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
