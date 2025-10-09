'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { DashboardNav } from "@/components/dashboard-nav"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { StatsCards } from "@/components/stats-cards"
import { EmailThreadList } from "@/components/email-thread-list"
import { ThreadFilters } from "@/components/thread-filters"
import { ResponseTimeChart } from "@/components/response-time-chart"
import { SLAComplianceChart } from "@/components/sla-compliance-chart"
import { TeamPerformanceChart } from "@/components/team-performance-chart"
import { ActivityFeed } from "@/components/activity-feed"
import { TeamStatsTable } from "@/components/team-stats-table"
import { AIChatbotButton } from "@/components/ai-chatbot-button"
import { TagLearningPanel } from "@/components/tag-learning-panel"
import { ModifiedEmailsPanel } from "@/components/modified-emails-panel"

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const activeView = "Overview" // or "Tag Learning"

  // Additional safety check at the component level
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('Dashboard: User not authenticated, redirecting to login');
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DashboardNav />
      <DashboardSidebar />

      <main className="ml-16 p-6 transition-all duration-300 lg:ml-64">
        {activeView === "Tag Learning" ? (
          <div>
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Tag Learning</h1>
              <p className="text-muted-foreground">Customize tags and view learning patterns</p>
            </div>
            <TagLearningPanel />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
              <p className="text-muted-foreground">Monitor your billing team performance and SLA compliance</p>
            </div>

            <StatsCards />

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <ResponseTimeChart />
              <SLAComplianceChart />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TeamPerformanceChart />
              </div>
              <ActivityFeed />
            </div>

            <div className="mt-6">
              <TeamStatsTable />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Email Threads</h2>
                  <ThreadFilters />
                </div>
                <EmailThreadList />
              </div>
              <div>
                <ModifiedEmailsPanel />
              </div>
            </div>
          </>
        )}
      </main>

      <AIChatbotButton />
    </div>
  )
}
