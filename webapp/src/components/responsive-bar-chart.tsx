import { D3BarChart } from "./d3-bar-chart";
import { useContainerSize } from "@/hooks/use-container-size";

interface DataPoint {
  label: string;
  value: number;
}

interface ResponsiveBarChartProps {
  data: DataPoint[];
  aspectRatio?: number;
  minHeight?: number;
  className?: string;
  color?: string;
  hoverColor?: string;
}

export function ResponsiveBarChart({
  data,
  aspectRatio = 16 / 9,
  minHeight = 300,
  className,
  color,
  hoverColor,
}: ResponsiveBarChartProps) {
  const [containerRef, size] = useContainerSize<HTMLDivElement>();

  const width = size.width || 400;
  const height = Math.max(width / aspectRatio, minHeight);

  return (
    <div ref={containerRef} className={`w-full ${className ?? ""}`}>
      {size.width > 0 && (
        <D3BarChart
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
