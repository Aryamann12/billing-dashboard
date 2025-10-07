"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { TrendingDown, TrendingUp } from "lucide-react"

const chartData = [
  { time: "00:00", responseTime: 2.1 },
  { time: "02:00", responseTime: 1.8 },
  { time: "04:00", responseTime: 2.3 },
  { time: "06:00", responseTime: 1.5 },
  { time: "08:00", responseTime: 2.8 },
  { time: "10:00", responseTime: 3.2 },
  { time: "12:00", responseTime: 2.5 },
  { time: "14:00", responseTime: 2.1 },
  { time: "16:00", responseTime: 1.9 },
  { time: "18:00", responseTime: 2.4 },
  { time: "20:00", responseTime: 1.7 },
  { time: "22:00", responseTime: 1.6 },
]

const chartConfig = {
  responseTime: {
    label: "Response Time",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const avgResponseTime = (chartData.reduce((sum, d) => sum + d.responseTime, 0) / chartData.length).toFixed(1)
const peakTime = chartData.reduce((max, d) => (d.responseTime > max.responseTime ? d : max))
const bestTime = chartData.reduce((min, d) => (d.responseTime < min.responseTime ? d : min))
const trend = chartData[chartData.length - 1].responseTime < chartData[0].responseTime ? "down" : "up"

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const value = data.responseTime
    const isAboveAvg = value > Number.parseFloat(avgResponseTime)

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{data.time}</p>
          <p className="text-lg font-bold text-chart-1">{value}h response time</p>
          <div className="mt-1 space-y-1 border-t pt-2 text-xs text-muted-foreground">
            <p className="flex items-center gap-1">
              {isAboveAvg ? (
                <>
                  <TrendingUp className="h-3 w-3 text-orange-500" />
                  <span>{((value / Number.parseFloat(avgResponseTime) - 1) * 100).toFixed(0)}% above average</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-green-500" />
                  <span>{((1 - value / Number.parseFloat(avgResponseTime)) * 100).toFixed(0)}% below average</span>
                </>
              )}
            </p>
            <p>
              Avg: {avgResponseTime}h | Peak: {peakTime.responseTime}h at {peakTime.time}
            </p>
            {value === bestTime.responseTime && <p className="font-medium text-green-500">✓ Best performance!</p>}
            {value === peakTime.responseTime && <p className="font-medium text-orange-500">⚠ Peak response time</p>}
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function ResponseTimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Response Time</CardTitle>
        <CardDescription>
          Last 24 hours • Avg: {avgResponseTime}h • Trend: {trend === "down" ? "↓ Improving" : "↑ Increasing"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              bottom: 10,
              left: 20,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} stroke="hsl(var(--border))" />
            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value} tick={{ fill: "hsl(var(--foreground))" }} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${value}h`} tick={{ fill: "hsl(var(--foreground))" }} />
            <ChartTooltip content={<CustomTooltip />} />
            <Area
              dataKey="responseTime"
              type="monotone"
              fill="var(--color-responseTime)"
              fillOpacity={0.2}
              stroke="var(--color-responseTime)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
