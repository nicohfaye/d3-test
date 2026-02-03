import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DataPoint {
  label: string;
  value: number;
}

interface D3BarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  hoverColor?: string;
}

/**
 * D3 + React Integration Pattern:
 *
 * 1. React owns the container element (svg) via ref
 * 2. D3 owns everything inside the container
 * 3. useEffect runs D3 code after mount and cleans up on unmount
 * 4. When data/dimensions change, D3 re-renders the chart
 */
export function D3BarChart({
  data,
  width = 500,
  height = 300,
  className,
  color = "#10b981",
  hoverColor = "#059669",
}: D3BarChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear any existing content (important for re-renders)
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Define margins and dimensions
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create a group element for the chart content
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value) ?? 0])
      .nice()
      .range([innerHeight, 0]);

    // Create and add X axis
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "currentColor");

    // Create and add Y axis
    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("fill", "currentColor");

    // Style axis lines
    g.selectAll(".domain, .tick line").attr("stroke", "currentColor");

    // Create bars with animation
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.label) ?? 0)
      .attr("width", xScale.bandwidth())
      .attr("y", innerHeight) // Start from bottom for animation
      .attr("height", 0)
      .attr("fill", color)
      .attr("rx", 4) // Rounded corners
      .transition()
      .duration(750)
      .attr("y", (d) => yScale(d.value))
      .attr("height", (d) => innerHeight - yScale(d.value));

    // Add hover effect
    g.selectAll(".bar")
      .on("mouseenter", function () {
        d3.select(this).attr("fill", hoverColor);
      })
      .on("mouseleave", function () {
        d3.select(this).attr("fill", color);
      });

    // Cleanup function - runs when component unmounts or before re-render
    return () => {
      svg.selectAll("*").remove();
    };
  }, [data, width, height, color, hoverColor]); // Re-run when these dependencies change

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
