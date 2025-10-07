"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { CheckCircle2, AlertCircle } from "lucide-react"

const chartData = [
  { day: "Mon", withinSLA: 45, outsideSLA: 8 },
  { day: "Tue", withinSLA: 52, outsideSLA: 6 },
  { day: "Wed", withinSLA: 48, outsideSLA: 10 },
  { day: "Thu", withinSLA: 55, outsideSLA: 5 },
  { day: "Fri", withinSLA: 50, outsideSLA: 7 },
  { day: "Sat", withinSLA: 32, outsideSLA: 4 },
  { day: "Sun", withinSLA: 30, outsideSLA: 3 },
]

const chartConfig = {
  withinSLA: {
    label: "Within SLA",
    color: "hsl(173, 58%, 39%)", // Muted emerald/teal - sophisticated positive
  },
  outsideSLA: {
    label: "Outside SLA",
    color: "hsl(25, 95%, 53%)", // Muted orange - sophisticated warning
  },
} satisfies ChartConfig

const totalWithinSLA = chartData.reduce((sum, d) => sum + d.withinSLA, 0)
const totalOutsideSLA = chartData.reduce((sum, d) => sum + d.outsideSLA, 0)
const complianceRate = ((totalWithinSLA / (totalWithinSLA + totalOutsideSLA)) * 100).toFixed(1)
const bestDay = chartData.reduce((best, d) => {
  const rate = d.withinSLA / (d.withinSLA + d.outsideSLA)
  const bestRate = best.withinSLA / (best.withinSLA + best.outsideSLA)
  return rate > bestRate ? d : best
})

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const total = data.withinSLA + data.outsideSLA
    const rate = ((data.withinSLA / total) * 100).toFixed(1)
    const isBestDay = data.day === bestDay.day

    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-xl z-50">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-foreground">{data.day}</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm text-foreground">
              <span className="font-bold text-cyan-400">{data.withinSLA}</span> within SLA
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-foreground">
              <span className="font-bold text-orange-400">{data.outsideSLA}</span> outside SLA
            </span>
          </div>
          <div className="mt-1 space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Compliance Rate: {rate}%</p>
            <p>Total Threads: {total}</p>
            {isBestDay && <p className="font-medium text-green-500">✓ Best day this week!</p>}
            {Number.parseFloat(rate) < Number.parseFloat(complianceRate) && (
              <p className="text-orange-500">⚠ Below weekly average ({complianceRate}%)</p>
            )}
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function SLAComplianceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SLA Compliance</CardTitle>
        <CardDescription>Last 7 days • Overall: {complianceRate}% compliance</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tickLine={false} tickMargin={10} axisLine={false} tick={{ fill: "hsl(var(--foreground))" }} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tick={{ fill: "hsl(var(--foreground))" }} />
            <ChartTooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.1)" }} />
            <Bar dataKey="withinSLA" fill="var(--color-withinSLA)" radius={4} />
            <Bar dataKey="outsideSLA" fill="var(--color-outsideSLA)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
