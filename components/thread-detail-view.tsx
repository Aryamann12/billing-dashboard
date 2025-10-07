"use client"

import { Clock, User, Building2, Tag, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { EmailThread } from "@/lib/types"

interface ThreadDetailViewProps {
  thread: EmailThread
}

export function ThreadDetailView({ thread }: ThreadDetailViewProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{thread.subject}</CardTitle>
              <div className="flex flex-wrap gap-2">
                {thread.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Badge variant={thread.priority === "high" ? "destructive" : "secondary"} className="capitalize">
              {thread.priority} Priority
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Customer:</span>
                <span>{thread.customer.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Company:</span>
                <span>{thread.customer.company || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Assigned to:</span>
                <span>{thread.assignedTo}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Response Time:</span>
                <span>{thread.responseTime ? `${thread.responseTime}h` : "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Last Activity:</span>
                <span>{thread.lastActivity.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Status:</span>
                <Badge variant="outline" className="capitalize">
                  {thread.status}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button size="sm">Reply</Button>
            <Button size="sm" variant="outline">
              Forward
            </Button>
            <Button size="sm" variant="outline">
              Reassign
            </Button>
            <Button size="sm" variant="outline">
              Close Thread
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversation ({thread.messageCount} messages)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarFallback>{thread.customer.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{thread.customer.name}</span>
                  <span className="text-xs text-muted-foreground">{thread.customer.email}</span>
                </div>
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <p>
                    Hi, I noticed a discrepancy in our Q4 invoice. The amount charged doesn't match our agreed pricing.
                    Could you please review this?
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Avatar>
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{thread.assignedTo}</span>
                  <Badge variant="secondary" className="text-xs">
                    Team
                  </Badge>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-sm">
                  <p>
                    Thank you for reaching out. I'm reviewing your account and invoice details now. I'll get back to you
                    within the hour with a detailed explanation.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
