"use client"

import { Clock, CheckCircle2, AlertCircle, UserPlus, MessageSquare } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

interface Activity {
  id: string
  type: "response" | "escalation" | "assignment" | "resolution"
  user: string
  description: string
  time: string
  lastUpdated: Date
  status?: "success" | "warning" | "info"
}

const activities: Activity[] = [
  {
    id: "1",
    type: "response",
    user: "Alex Chen",
    description: "Responded to billing inquiry from Acme Corp",
    time: "5 minutes ago",
    lastUpdated: new Date(Date.now() - 5 * 60 * 1000),
    status: "success",
  },
  {
    id: "2",
    type: "escalation",
    user: "Sam Patel",
    description: "Escalated subscription issue to senior team",
    time: "12 minutes ago",
    lastUpdated: new Date(Date.now() - 12 * 60 * 1000),
    status: "warning",
  },
  {
    id: "3",
    type: "assignment",
    user: "Jordan Lee",
    description: "Assigned new thread from TechStart",
    time: "23 minutes ago",
    lastUpdated: new Date(Date.now() - 23 * 60 * 1000),
    status: "info",
  },
  {
    id: "4",
    type: "resolution",
    user: "Alex Chen",
    description: "Resolved invoice download issue",
    time: "1 hour ago",
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: "success",
  },
  {
    id: "5",
    type: "response",
    user: "Jordan Lee",
    description: "Responded to payment method update",
    time: "2 hours ago",
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "success",
  },
]

const activityIcons = {
  response: MessageSquare,
  escalation: AlertCircle,
  assignment: UserPlus,
  resolution: CheckCircle2,
}

const statusColors = {
  success: "text-emerald-500",
  warning: "text-amber-500",
  info: "text-blue-500",
}

export function ActivityFeed() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activityIcons[activity.type]
            return (
              <div key={activity.id} className="flex gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted",
                    activity.status && statusColors[activity.status],
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{activity.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </span>
                    <span>•</span>
                    <span className="text-xs">
                      Updated:{" "}
                      {isMounted
                        ? activity.lastUpdated.toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "..."}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
