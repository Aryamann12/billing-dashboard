"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GripVertical, Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface TagChange {
  id: string
  emailId: string
  emailSubject: string
  customer: string
  oldTags: string[]
  newTags: string[]
  timestamp: Date
}

const mockTagChanges: TagChange[] = [
  {
    id: "1",
    emailId: "1",
    emailSubject: "Billing discrepancy for Q4 invoice",
    customer: "Sarah Johnson - Acme Corp",
    oldTags: ["ACTION REQUIRED", "ESCALATED"],
    newTags: ["URGENT", "BILLING ISSUE"],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: "2",
    emailId: "3",
    emailSubject: "Subscription cancellation inquiry",
    customer: "Emily Davis - Design Studio",
    oldTags: ["RESPONDED OUTSIDE SLA"],
    newTags: ["CANCELLATION", "FOLLOW UP"],
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
]

const availableTags = [
  "ACTION REQUIRED",
  "ESCALATED",
  "RESPONDED WITHIN SLA",
  "RESPONDED OUTSIDE SLA",
  "PENDING",
  "ACTION NOT REQUIRED",
  "URGENT",
  "BILLING ISSUE",
  "CANCELLATION",
  "FOLLOW UP",
  "PAYMENT",
  "TECHNICAL",
]

export function TagLearningPanel() {
  const [tags, setTags] = useState(availableTags)
  const [draggedTag, setDraggedTag] = useState<string | null>(null)

  const handleDragStart = (tag: string) => {
    setDraggedTag(tag)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetTag: string) => {
    if (!draggedTag || draggedTag === targetTag) return

    const draggedIndex = tags.indexOf(draggedTag)
    const targetIndex = tags.indexOf(targetTag)

    const newTags = [...tags]
    newTags.splice(draggedIndex, 1)
    newTags.splice(targetIndex, 0, draggedTag)

    setTags(newTags)
    setDraggedTag(null)
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tag Management</CardTitle>
          <CardDescription>Customize and reorder your email tags. Drag to reorder, click X to remove.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tags.map((tag) => (
              <div
                key={tag}
                draggable
                onDragStart={() => handleDragStart(tag)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(tag)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border border-border bg-card p-3 transition-all",
                  "cursor-move hover:border-sky-500/50 hover:bg-accent",
                  draggedTag === tag && "opacity-50",
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary" className="flex-1">
                  {tag}
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTag(tag)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <Button variant="outline" className="mt-4 w-full bg-transparent" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add New Tag
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Learning History</CardTitle>
          <CardDescription>Recent tag changes you've made - the app learns from these patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTagChanges.map((change) => (
              <div key={change.id} className="space-y-2 rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{change.emailSubject}</p>
                    <p className="text-xs text-muted-foreground">{change.customer}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {change.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Old:</span>
                    <div className="flex flex-wrap gap-1">
                      {change.oldTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-sky-400">New:</span>
                    <div className="flex flex-wrap gap-1">
                      {change.newTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-sky-500/10 text-sky-400 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
