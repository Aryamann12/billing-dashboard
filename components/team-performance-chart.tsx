"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { mockTeamMembers } from "@/lib/mock-data"
import { Trophy, TrendingUp } from "lucide-react"

const chartData = mockTeamMembers.map((member) => ({
  name: member.name.split(" ")[0],
  fullName: member.name,
  threadsHandled: member.threadsHandled,
  responseRate: member.responseRate,
  avgResponseTime: member.avgResponseTime,
}))

const chartConfig = {
  threadsHandled: {
    label: "Threads Handled",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const topPerformer = chartData.reduce((top, member) => (member.threadsHandled > top.threadsHandled ? member : top))
const avgThreads = (chartData.reduce((sum, m) => sum + m.threadsHandled, 0) / chartData.length).toFixed(0)

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const isTopPerformer = data.name === topPerformer.name
    const vsAvg = ((data.threadsHandled / Number.parseFloat(avgThreads) - 1) * 100).toFixed(0)

    return (
      <div className="rounded-lg border bg-background p-3 shadow-lg">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">{data.fullName}</p>
          <p className="text-lg font-bold text-chart-1">{data.threadsHandled} threads</p>
          <div className="mt-1 space-y-1 border-t pt-2 text-xs text-muted-foreground">
            <p>Response Rate: {data.responseRate}%</p>
            <p>Avg Response: {data.avgResponseTime}</p>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>
                {Number.parseFloat(vsAvg) >= 0 ? "+" : ""}
                {vsAvg}% vs team avg ({avgThreads})
              </span>
            </div>
            {isTopPerformer && (
              <p className="flex items-center gap-1 font-medium text-yellow-500">
                <Trophy className="h-3 w-3" />
                Top performer this month!
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function TeamPerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
        <CardDescription>Threads handled this month • Avg: {avgThreads} per member</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="h-[280px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 0,
              right: 24,
              top: 5,
              bottom: 5,
            }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" opacity={0.3} stroke="hsl(var(--border))" />
            <YAxis dataKey="name" type="category" tickLine={false} tickMargin={10} axisLine={false} tick={{ fill: "hsl(var(--foreground))" }} />
            <XAxis type="number" hide />
            <ChartTooltip content={<CustomTooltip />} />
            <Bar dataKey="threadsHandled" fill="var(--color-threadsHandled)" radius={5}>
              <LabelList
                dataKey="threadsHandled"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
