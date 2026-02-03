import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface IrisDataPoint {
  sepalLength: number;
  sepalWidth: number;
  species: string;
}

interface D3IrisScatterPlotProps {
  data?: IrisDataPoint[];
  aspectRatio?: number;
  minHeight?: number;
  className?: string;
}

// Mock Iris dataset - based on the famous Fisher's Iris dataset
export const mockIrisData: IrisDataPoint[] = [
  // Setosa (typically smaller sepals)
  { sepalLength: 5.1, sepalWidth: 3.5, species: "setosa" },
  { sepalLength: 4.9, sepalWidth: 3.0, species: "setosa" },
  { sepalLength: 4.7, sepalWidth: 3.2, species: "setosa" },
  { sepalLength: 4.6, sepalWidth: 3.1, species: "setosa" },
  { sepalLength: 5.0, sepalWidth: 3.6, species: "setosa" },
  { sepalLength: 5.4, sepalWidth: 3.9, species: "setosa" },
  { sepalLength: 4.6, sepalWidth: 3.4, species: "setosa" },
  { sepalLength: 5.0, sepalWidth: 3.4, species: "setosa" },
  { sepalLength: 4.4, sepalWidth: 2.9, species: "setosa" },
  { sepalLength: 4.9, sepalWidth: 3.1, species: "setosa" },
  { sepalLength: 5.4, sepalWidth: 3.7, species: "setosa" },
  { sepalLength: 4.8, sepalWidth: 3.4, species: "setosa" },
  { sepalLength: 4.8, sepalWidth: 3.0, species: "setosa" },
  { sepalLength: 4.3, sepalWidth: 3.0, species: "setosa" },
  { sepalLength: 5.8, sepalWidth: 4.0, species: "setosa" },
  { sepalLength: 5.7, sepalWidth: 4.4, species: "setosa" },
  { sepalLength: 5.4, sepalWidth: 3.9, species: "setosa" },
  { sepalLength: 5.1, sepalWidth: 3.5, species: "setosa" },
  { sepalLength: 5.7, sepalWidth: 3.8, species: "setosa" },
  { sepalLength: 5.1, sepalWidth: 3.8, species: "setosa" },
  // Versicolor (medium sepals)
  { sepalLength: 7.0, sepalWidth: 3.2, species: "versicolor" },
  { sepalLength: 6.4, sepalWidth: 3.2, species: "versicolor" },
  { sepalLength: 6.9, sepalWidth: 3.1, species: "versicolor" },
  { sepalLength: 5.5, sepalWidth: 2.3, species: "versicolor" },
  { sepalLength: 6.5, sepalWidth: 2.8, species: "versicolor" },
  { sepalLength: 5.7, sepalWidth: 2.8, species: "versicolor" },
  { sepalLength: 6.3, sepalWidth: 3.3, species: "versicolor" },
  { sepalLength: 4.9, sepalWidth: 2.4, species: "versicolor" },
  { sepalLength: 6.6, sepalWidth: 2.9, species: "versicolor" },
  { sepalLength: 5.2, sepalWidth: 2.7, species: "versicolor" },
  { sepalLength: 5.0, sepalWidth: 2.0, species: "versicolor" },
  { sepalLength: 5.9, sepalWidth: 3.0, species: "versicolor" },
  { sepalLength: 6.0, sepalWidth: 2.2, species: "versicolor" },
  { sepalLength: 6.1, sepalWidth: 2.9, species: "versicolor" },
  { sepalLength: 5.6, sepalWidth: 2.9, species: "versicolor" },
  { sepalLength: 6.7, sepalWidth: 3.1, species: "versicolor" },
  { sepalLength: 5.6, sepalWidth: 3.0, species: "versicolor" },
  { sepalLength: 5.8, sepalWidth: 2.7, species: "versicolor" },
  { sepalLength: 6.2, sepalWidth: 2.2, species: "versicolor" },
  { sepalLength: 5.6, sepalWidth: 2.5, species: "versicolor" },
  // Virginica (larger sepals)
  { sepalLength: 6.3, sepalWidth: 3.3, species: "virginica" },
  { sepalLength: 5.8, sepalWidth: 2.7, species: "virginica" },
  { sepalLength: 7.1, sepalWidth: 3.0, species: "virginica" },
  { sepalLength: 6.3, sepalWidth: 2.9, species: "virginica" },
  { sepalLength: 6.5, sepalWidth: 3.0, species: "virginica" },
  { sepalLength: 7.6, sepalWidth: 3.0, species: "virginica" },
  { sepalLength: 4.9, sepalWidth: 2.5, species: "virginica" },
  { sepalLength: 7.3, sepalWidth: 2.9, species: "virginica" },
  { sepalLength: 6.7, sepalWidth: 2.5, species: "virginica" },
  { sepalLength: 7.2, sepalWidth: 3.6, species: "virginica" },
  { sepalLength: 6.5, sepalWidth: 3.2, species: "virginica" },
  { sepalLength: 6.4, sepalWidth: 2.7, species: "virginica" },
  { sepalLength: 6.8, sepalWidth: 3.0, species: "virginica" },
  { sepalLength: 5.7, sepalWidth: 2.5, species: "virginica" },
  { sepalLength: 5.8, sepalWidth: 2.8, species: "virginica" },
  { sepalLength: 6.4, sepalWidth: 3.2, species: "virginica" },
  { sepalLength: 6.5, sepalWidth: 3.0, species: "virginica" },
  { sepalLength: 7.7, sepalWidth: 3.8, species: "virginica" },
  { sepalLength: 7.7, sepalWidth: 2.6, species: "virginica" },
  { sepalLength: 6.0, sepalWidth: 2.2, species: "virginica" },
];

export function D3IrisScatterPlot({
  data = mockIrisData,
  aspectRatio = 16 / 10,
  minHeight = 400,
  className,
}: D3IrisScatterPlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Handle resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.floor(entry.contentRect.width);
        const height = Math.max(Math.floor(width / aspectRatio), minHeight);
        setSize({ width, height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [aspectRatio, minHeight]);

  // Render chart
  useEffect(() => {
    if (!svgRef.current || data.length === 0 || size.width === 0) return;

    const { width, height } = size;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Margins - extra top margin for legend
    const marginTop = 50;
    const marginRight = 20;
    const marginBottom = 45;
    const marginLeft = 50;

    // Get unique species for scales
    const species = [...new Set(data.map((d) => d.species))];

    // Create positional scales
    const x = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.sepalLength) as [number, number])
      .nice()
      .range([marginLeft, width - marginRight]);

    const y = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d.sepalWidth) as [number, number])
      .nice()
      .range([height - marginBottom, marginTop]);

    // Color scale matching the reference image
    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(species)
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); // blue, orange, green

    // Symbol types matching the reference: circle, cross, diamond
    const symbolTypes = [d3.symbolCircle, d3.symbolCross, d3.symbolDiamond];
    const symbolScale = d3.scaleOrdinal(species, symbolTypes);

    // Add horizontal legend at the top
    const legend = svg
      .append("g")
      .attr("transform", `translate(${marginLeft}, 15)`);

    let legendX = 0;
    species.forEach((s) => {
      const legendItem = legend
        .append("g")
        .attr("transform", `translate(${legendX}, 0)`);

      legendItem
        .append("path")
        .attr("d", d3.symbol().type(symbolScale(s)).size(80)())
        .attr("fill", colorScale(s))
        .attr("stroke", colorScale(s))
        .attr("stroke-width", 1.5);

      legendItem
        .append("text")
        .attr("x", 12)
        .attr("y", 4)
        .attr("fill", "currentColor")
        .attr("font-size", "12px")
        .text(s);

      // Move x position for next item
      legendX += s.length * 8 + 50;
    });

    // Add grid
    const gridGroup = svg
      .append("g")
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1);

    // Vertical grid lines
    gridGroup
      .append("g")
      .selectAll("line")
      .data(x.ticks())
      .join("line")
      .attr("x1", (d) => 0.5 + x(d))
      .attr("x2", (d) => 0.5 + x(d))
      .attr("y1", marginTop)
      .attr("y2", height - marginBottom);

    // Horizontal grid lines
    gridGroup
      .append("g")
      .selectAll("line")
      .data(y.ticks())
      .join("line")
      .attr("y1", (d) => 0.5 + y(d))
      .attr("y2", (d) => 0.5 + y(d))
      .attr("x1", marginLeft)
      .attr("x2", width - marginRight);

    // Add X axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x).ticks(Math.max(2, Math.floor(width / 100))))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.3),
      )
      .call((g) => g.selectAll(".tick text").attr("fill", "currentColor"))
      .call((g) =>
        g
          .append("text")
          .attr("x", width - marginRight)
          .attr("y", 35)
          .attr("fill", "currentColor")
          .attr("text-anchor", "end")
          .attr("font-size", "12px")
          .text("Sepal length (cm) →"),
      );

    // Add Y axis
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y))
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick line")
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.3),
      )
      .call((g) => g.selectAll(".tick text").attr("fill", "currentColor"))
      .call((g) =>
        g
          .append("text")
          .attr("x", -marginLeft + 5)
          .attr("y", marginTop - 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .attr("font-size", "12px")
          .text("↑ Sepal width (cm)"),
      );

    // Add scatterplot symbols
    const symbolSize = 80;
    svg
      .append("g")
      .selectAll("path")
      .data(data)
      .join("path")
      .attr(
        "transform",
        (d) => `translate(${x(d.sepalLength)},${y(d.sepalWidth)})`,
      )
      .attr("fill", (d) => colorScale(d.species))
      .attr("stroke", (d) => colorScale(d.species))
      .attr("stroke-width", 1.5)
      .attr("opacity", 0)
      .attr("d", (d) =>
        d3.symbol().type(symbolScale(d.species)).size(symbolSize)(),
      )
      .transition()
      .duration(500)
      .delay((_, i) => i * 8)
      .attr("opacity", 0.85);

    // Add hover effects
    svg
      .selectAll("g:last-child path")
      .on("mouseenter", function (_, d) {
        const point = d as IrisDataPoint;
        d3.select(this)
          .attr("opacity", 1)
          .attr(
            "d",
            d3
              .symbol()
              .type(symbolScale(point.species))
              .size(symbolSize * 2)(),
          );

        // Show tooltip
        svg
          .append("g")
          .attr("class", "tooltip")
          .attr(
            "transform",
            `translate(${x(point.sepalLength)},${y(point.sepalWidth) - 18})`,
          )
          .call((g) =>
            g
              .append("rect")
              .attr("x", -55)
              .attr("y", -18)
              .attr("width", 110)
              .attr("height", 22)
              .attr("rx", 4)
              .attr("fill", "white")
              .attr("stroke", "#ccc")
              .attr("stroke-width", 1),
          )
          .call((g) =>
            g
              .append("text")
              .attr("text-anchor", "middle")
              .attr("y", -3)
              .attr("fill", "#333")
              .attr("font-size", "11px")
              .text(
                `${point.species}: (${point.sepalLength}, ${point.sepalWidth})`,
              ),
          );
      })
      .on("mouseleave", function (_, d) {
        const point = d as IrisDataPoint;
        d3.select(this)
          .attr("opacity", 0.85)
          .attr(
            "d",
            d3.symbol().type(symbolScale(point.species)).size(symbolSize)(),
          );
        svg.selectAll(".tooltip").remove();
      });

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, size]);

  return (
    <div ref={containerRef} className={`w-full ${className ?? ""}`}>
      {size.width > 0 && (
        <svg
          ref={svgRef}
          width={size.width}
          height={size.height}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      )}
    </div>
  );
}
