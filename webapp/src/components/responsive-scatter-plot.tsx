import { D3ScatterPlot } from "./d3-scatter-plot";
import { useContainerSize } from "@/hooks/use-container-size";

interface ScatterDataPoint {
  x: number;
  y: number;
  label?: string;
}

interface ResponsiveScatterPlotProps {
  data: ScatterDataPoint[];
  aspectRatio?: number;
  minHeight?: number;
  className?: string;
  color?: string;
  hoverColor?: string;
}

export function ResponsiveScatterPlot({
  data,
  aspectRatio = 16 / 9,
  minHeight = 300,
  className,
  color,
  hoverColor,
}: ResponsiveScatterPlotProps) {
  const [containerRef, size] = useContainerSize<HTMLDivElement>();

  const width = size.width || 400;
  const height = Math.max(width / aspectRatio, minHeight);

  return (
    <div ref={containerRef} className={`w-full ${className ?? ""}`}>
      {size.width > 0 && (
        <D3ScatterPlot
          data={data}
          width={width}
          height={height}
          color={color}
          hoverColor={hoverColor}
        />
      )}
    </div>
  );
}
