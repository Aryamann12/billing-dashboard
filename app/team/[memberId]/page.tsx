"use client"

import { useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, TrendingUp, TrendingDown, Clock, CheckCircle2, Mail, AlertCircle } from "lucide-react"
import { mockThreads, mockTeamMembers } from "@/lib/mock-data"
import { EmailThreadList } from "@/components/email-thread-list"
import { ResponseTimeChart } from "@/components/response-time-chart"
import { SLAComplianceChart } from "@/components/sla-compliance-chart"
import { useTagContext } from "@/lib/contexts/tag-context"

export default function TeamMemberPage() {
  const params = useParams()
  const router = useRouter()
  const memberName = decodeURIComponent(params.memberId as string)
  const { setTeamMemberFilter } = useTagContext()

  // Set the team member filter when the page loads
  useEffect(() => {
    console.log("Setting team member filter to:", memberName)
    setTeamMemberFilter(memberName)
    return () => {
      console.log("Clearing team member filter")
      setTeamMemberFilter(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberName])

  // Find the team member
  const teamMember = mockTeamMembers.find((m) => m.name === memberName)

  // Filter threads for this member
  const memberThreads = useMemo(() => {
    return mockThreads.filter((thread) => thread.assignedTo === memberName)
  }, [memberName])

  // Calculate member-specific metrics
  const memberMetrics = useMemo(() => {
    const totalThreads = memberThreads.length
    const withinSLA = memberThreads.filter((t) => t.slaStatus === "within").length
    const outsideSLA = memberThreads.filter((t) => t.slaStatus === "breached").length
    const closedThreads = memberThreads.filter((t) => t.status === "closed").length
    const openThreads = memberThreads.filter((t) => t.status === "open").length
    const pendingThreads = memberThreads.filter((t) => t.status === "pending").length
    
    const totalResponseTime = memberThreads.reduce((sum, t) => sum + (t.responseTime || 0), 0)
    const threadsWithResponse = memberThreads.filter((t) => t.responseTime !== undefined).length
    
    const slaCompliance = totalThreads > 0 ? Math.round((withinSLA / totalThreads) * 100) : 0
    const avgResponseTime = threadsWithResponse > 0 ? Number((totalResponseTime / threadsWithResponse).toFixed(1)) : 0
    const resolutionRate = totalThreads > 0 ? Math.round((closedThreads / totalThreads) * 100) : 0

    return {
      totalThreads,
      withinSLA,
      outsideSLA,
      closedThreads,
      openThreads,
      pendingThreads,
      slaCompliance,
      avgResponseTime,
      resolutionRate,
    }
  }, [memberThreads])

  if (!teamMember) {
    return (
      <div className="min-h-screen">
        <DashboardNav />
        <DashboardSidebar />
        <main className="ml-16 p-6 transition-all duration-300 lg:ml-64">
          <div className="flex flex-col items-center justify-center py-20">
            <h1 className="text-2xl font-bold mb-4">Team Member Not Found</h1>
            <Button onClick={() => router.push("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardNav />
      <DashboardSidebar />

      <main className="ml-16 p-6 transition-all duration-300 lg:ml-64">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-2xl">
                {teamMember.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{teamMember.name}</h1>
              <p className="text-muted-foreground">Individual Performance Metrics</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Threads</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberMetrics.totalThreads}</div>
              <p className="text-xs text-muted-foreground">
                {memberMetrics.openThreads} open, {memberMetrics.pendingThreads} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberMetrics.slaCompliance}%</div>
              <p className="text-xs text-muted-foreground">{memberMetrics.withinSLA} within SLA</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberMetrics.avgResponseTime}h</div>
              <p className="text-xs text-muted-foreground">
                {memberMetrics.avgResponseTime < 24 ? (
                  <span className="inline-flex items-center text-emerald-500">
                    <TrendingDown className="mr-1 h-3 w-3" />
                    Excellent
                  </span>
                ) : (
                  <span className="inline-flex items-center text-amber-500">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Needs improvement
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{memberMetrics.resolutionRate}%</div>
              <p className="text-xs text-muted-foreground">{memberMetrics.closedThreads} closed threads</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ResponseTimeChart />
          <SLAComplianceChart />
        </div>

        {/* Email Threads */}
        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Email Threads</h2>
            <p className="text-sm text-muted-foreground">All threads assigned to {teamMember.name}</p>
          </div>
          <EmailThreadList />
        </div>
      </main>
    </div>
  )
}

