import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface ScatterDataPoint {
  x: number;
  y: number;
  label?: string;
}

interface D3ScatterPlotProps {
  data: ScatterDataPoint[];
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  hoverColor?: string;
}

export function D3ScatterPlot({
  data,
  width = 600,
  height = 400,
  className,
  color = "#10b981",
  hoverColor = "#059669",
}: D3ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.x) ?? 100])
      .nice()
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y) ?? 100])
      .nice()
      .range([innerHeight, 0]);

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "currentColor");

    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "currentColor");

    // Style axis lines
    g.selectAll(".domain, .tick line").attr("stroke", "currentColor");

    // Add X axis label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("X Value");

    // Add Y axis label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -45)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Y Value");

    // Add dots with animation
    g.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 0)
      .attr("fill", color)
      .attr("opacity", 0.7)
      .attr("stroke", color)
      .attr("stroke-width", 0.5)
      .transition()
      .duration(750)
      .delay((_, i) => i * 30)
      .attr("r", 8);

    // Add hover effects
    g.selectAll(".dot")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .attr("fill", hoverColor)
          .attr("stroke", hoverColor)
          .attr("r", 12)
          .attr("opacity", 1);

        // Show tooltip
        const point = d as ScatterDataPoint;
        g.append("text")
          .attr("class", "tooltip")
          .attr("x", xScale(point.x))
          .attr("y", yScale(point.y) - 15)
          .attr("text-anchor", "middle")
          .attr("fill", "currentColor")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(`(${point.x.toFixed(1)}, ${point.y.toFixed(1)})`);
      })
      .on("mouseleave", function () {
        d3.select(this)
          .attr("fill", color)
          .attr("stroke", color)
          .attr("r", 8)
          .attr("opacity", 0.7);

        g.selectAll(".tooltip").remove();
      });

    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, width, height, color, hoverColor]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className={className}
      style={{ overflow: "visible" }}
    />
  );
}
