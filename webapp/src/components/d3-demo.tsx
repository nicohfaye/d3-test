import { useState } from "react";
import { ResponsiveBarChart } from "./responsive-bar-chart";
import { ResponsiveScatterPlot } from "./responsive-scatter-plot";
import { D3IrisScatterPlot } from "./d3-iris-scatter";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

type ChartType = "bar" | "scatter" | "iris";

const initialBarData = [
  { label: "Jan", value: 30 },
  { label: "Feb", value: 45 },
  { label: "Mar", value: 28 },
  { label: "Apr", value: 65 },
  { label: "May", value: 52 },
  { label: "Jun", value: 38 },
];

const initialScatterData = Array.from({ length: 30 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
}));

function generateRandomBarData() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  return months.slice(0, Math.floor(Math.random() * 4) + 4).map((label) => ({
    label,
    value: Math.floor(Math.random() * 80) + 10,
  }));
}

function generateRandomScatterData() {
  return Array.from({ length: Math.floor(Math.random() * 20) + 15 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));
}

const chartDescriptions: Record<ChartType, string> = {
  bar: "Interactive bar chart with animated transitions",
  scatter: "Scatter plot with hover tooltips",
  iris: "Iris dataset: sepal width vs length by species (with shapes)",
};

export function D3Demo() {
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [barData, setBarData] = useState(initialBarData);
  const [scatterData, setScatterData] = useState(initialScatterData);

  return (
    <div className="flex flex-col items-center gap-6 p-4 md:p-8 w-full max-w-5xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>D3 + React + TypeScript Demo</CardTitle>
              <CardDescription>{chartDescriptions[chartType]}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={chartType === "bar" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("bar")}
              >
                Bar Chart
              </Button>
              <Button
                variant={chartType === "scatter" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("scatter")}
              >
                Scatter Plot
              </Button>
              <Button
                variant={chartType === "iris" ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType("iris")}
              >
                Iris Dataset
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {chartType === "bar" && (
            <ResponsiveBarChart
              data={barData}
              aspectRatio={16 / 9}
              minHeight={300}
            />
          )}
          {chartType === "scatter" && (
            <ResponsiveScatterPlot
              data={scatterData}
              aspectRatio={16 / 9}
              minHeight={300}
            />
          )}
          {chartType === "iris" && (
            <D3IrisScatterPlot aspectRatio={16 / 10} minHeight={400} />
          )}
        </CardContent>

        <CardFooter>
          {chartType !== "iris" && (
            <Button
              onClick={() =>
                chartType === "bar"
                  ? setBarData(generateRandomBarData())
                  : setScatterData(generateRandomScatterData())
              }
            >
              Randomize Data
            </Button>
          )}
          {chartType === "iris" && (
            <p className="text-sm text-muted-foreground">
              Showing 60 samples from Fisher's Iris dataset (20 per species)
            </p>
          )}
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>The D3 + React integration pattern</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-sm">
            <li>
              React renders an empty{" "}
              <code className="bg-muted px-1 rounded">&lt;svg&gt;</code> with a
              ref
            </li>
            <li>useEffect gives D3 control of the SVG contents</li>
            <li>When data changes, D3 clears and re-draws with animations</li>
            <li>Cleanup function removes D3 content on unmount</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
