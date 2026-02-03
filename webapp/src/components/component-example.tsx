import * as React from "react"

import { ExampleWrapper } from "@/components/example"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { VisxScatterplotPanel } from "@/components/visx/geo-scatterplot"
import { VisxWellLogTracksPanel } from "@/components/visx/well-log-tracks"

export function ComponentExample() {
  const [view, setView] = React.useState<"scatter" | "tracks">("scatter")
  const title =
    view === "scatter"
      ? "Well Log Crossplot (Porosity vs Resistivity)"
      : "Well Log Tracks"

  return (
    <ExampleWrapper>
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={view === "scatter" ? "secondary" : "outline"}
              onClick={() => setView("scatter")}
              aria-pressed={view === "scatter"}
            >
              Crossplot
            </Button>
            <Button
              variant={view === "tracks" ? "secondary" : "outline"}
              onClick={() => setView("tracks")}
              aria-pressed={view === "tracks"}
            >
              Well Logs
            </Button>
          </div>
        </CardHeader>
        <CardContent className="min-h-[660px]">
          {view === "scatter" ? (
            <VisxScatterplotPanel />
          ) : (
            <VisxWellLogTracksPanel />
          )}
        </CardContent>
      </Card>
    </ExampleWrapper>
  )
}
