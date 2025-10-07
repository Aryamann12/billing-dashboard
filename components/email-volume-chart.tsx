"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { day: "Mon", received: 45, resolved: 38 },
  { day: "Tue", received: 52, resolved: 48 },
  { day: "Wed", received: 38, resolved: 35 },
  { day: "Thu", received: 61, resolved: 52 },
  { day: "Fri", received: 48, resolved: 45 },
  { day: "Sat", received: 23, resolved: 21 },
  { day: "Sun", received: 18, resolved: 16 },
]

const chartConfig = {
  received: {
    label: "Received",
    color: "var(--chart-1)",
  },
  resolved: {
    label: "Resolved",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

export function EmailVolumeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Volume</CardTitle>
        <CardDescription>Received vs Resolved - Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "hsl(var(--foreground))" }} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "hsl(var(--foreground))" }} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="received" fill="var(--color-received)" radius={4} />
            <Bar dataKey="resolved" fill="var(--color-resolved)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
