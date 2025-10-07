"use client"

import { TrendingUp, TrendingDown, Clock, CheckCircle2, Mail } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockMetrics } from "@/lib/mock-data"

export function StatsCards() {
  const slaCompliance = Math.round((mockMetrics.withinSLA / mockMetrics.totalThreads) * 100)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Threads</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mockMetrics.totalThreads}</div>
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center text-emerald-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              12% from last week
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{slaCompliance}%</div>
          <p className="text-xs text-muted-foreground">{mockMetrics.withinSLA} within SLA</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mockMetrics.avgResponseTime}h</div>
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center text-emerald-500">
              <TrendingDown className="mr-1 h-3 w-3" />
              8% faster
            </span>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{mockMetrics.resolutionRate}%</div>
          <p className="text-xs text-muted-foreground">
            <span className="inline-flex items-center text-emerald-500">
              <TrendingUp className="mr-1 h-3 w-3" />
              3% improvement
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
