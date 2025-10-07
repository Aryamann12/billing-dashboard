"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle2, User, Building2, MessageSquare, Pencil, CheckCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { EmailThread, EmailTag } from "@/lib/types"
import { useTagContext } from "@/lib/contexts/tag-context"
import { TagEditDialog } from "@/components/tag-edit-dialog"
import { EmailFullViewPanel } from "@/components/email-full-view-panel"
import { useToast } from "@/hooks/use-toast"

const tagColors: Record<EmailTag, string> = {
  "ACTION REQUIRED": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "RESPONDED WITHIN SLA": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "RESPONDED OUTSIDE SLA": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ESCALATED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  PENDING: "bg-red-500/10 text-red-500 border-red-500/20",
  "ACTION NOT REQUIRED": "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

const slaStatusConfig = {
  within: { icon: CheckCircle2, color: "text-emerald-500", label: "Within SLA" },
  approaching: { icon: AlertCircle, color: "text-amber-500", label: "Approaching SLA" },
  breached: { icon: AlertCircle, color: "text-red-500", label: "SLA Breached" },
}

interface EmailThreadItemProps {
  thread: EmailThread
  onClick: () => void
  isSelected: boolean
  isModified: boolean
  onEditTags: (e: React.MouseEvent) => void
  onTagClick: (e: React.MouseEvent, tag: EmailTag) => void
}

function EmailThreadItem({ thread, onClick, isSelected, isModified, onEditTags, onTagClick }: EmailThreadItemProps) {
  const [isMounted, setIsMounted] = useState(false)
  const SLAIcon = slaStatusConfig[thread.slaStatus].icon

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <Card
      className={cn(
        "cursor-pointer border-l-4 p-4 transition-all hover:bg-sky-500/5",
        isSelected && "bg-sky-500/5 ring-1 ring-sky-500/20",
        isModified && "ring-2 ring-sky-500/50 bg-sky-500/5",
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold leading-tight">{thread.subject}</h3>
            {thread.priority === "high" && (
              <Badge variant="destructive" className="h-5 text-xs">
                High
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {thread.customer.name}
            </div>
            {thread.customer.company && (
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {thread.customer.company}
              </div>
            )}
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span className="font-medium">{thread.messageCount}</span>
              <span className="text-xs">messages</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-2">
              {thread.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className={cn("text-xs cursor-pointer hover:opacity-80 transition-opacity", tagColors[tag])}
                  onClick={(e) => onTagClick(e, tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={onEditTags}
              title="Edit tags"
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {thread.status === "closed" ? (
            <div className="flex items-center gap-1 text-xs text-emerald-500">
              <CheckCheck className="h-4 w-4" />
              <span>Closed</span>
            </div>
          ) : (
            <div className={cn("flex items-center gap-1 text-xs", slaStatusConfig[thread.slaStatus].color)}>
              <SLAIcon className="h-3 w-3" />
              {thread.responseTime && `${thread.responseTime}h`}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {isMounted
              ? thread.lastActivity.toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
              : "..."}
          </div>
          <Badge variant="secondary" className="text-xs">
            {thread.assignedTo}
          </Badge>
        </div>
      </div>
    </Card>
  )
}

type FilterType = "all" | "open" | "pending" | "closed" | "modified" | EmailTag

export function EmailThreadList() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [fullViewThread, setFullViewThread] = useState<EmailThread | null>(null)
  const [filter, setFilter] = useState<FilterType>("all")
  const [editingThread, setEditingThread] = useState<EmailThread | null>(null)
  const { state, updateTags, getThread } = useTagContext()
  const { toast } = useToast()

  // Debug: Log team member filter changes
  useEffect(() => {
    console.log("Team Member Filter:", state.teamMemberFilter)
  }, [state.teamMemberFilter])

  const allThreads = Object.values(state.emailThreads).filter((thread) => {
    // Apply team member filter if set
    if (state.teamMemberFilter) {
      return thread.assignedTo === state.teamMemberFilter
    }
    return true
  })

  console.log("Filtered threads count:", allThreads.length, "Filter:", state.teamMemberFilter)

  const filteredThreads = allThreads.filter((thread) => {
    if (filter === "modified") return state.modifiedThreadIds.has(thread.id)
    if (filter === "all") return true

    // Check if filter is a tag
    const emailTags: EmailTag[] = [
      "ACTION REQUIRED", "ACTION NOT REQUIRED", "RESPONDED WITHIN SLA",
      "RESPONDED OUTSIDE SLA", "ESCALATED", "PENDING"
    ]
    if (emailTags.includes(filter as EmailTag)) {
      return thread.tags.includes(filter as EmailTag)
    }

    // Status filter
    return thread.status === filter
  })

  const handleThreadClick = (thread: EmailThread) => {
    setSelectedThread(thread.id)
    setFullViewThread(thread)
  }

  const handleEditTags = (e: React.MouseEvent, thread: EmailThread) => {
    e.stopPropagation()
    setEditingThread(thread)
  }

  const handleTagClick = (e: React.MouseEvent, tag: EmailTag) => {
    e.stopPropagation()
    setFilter(tag)
  }

  const handleSaveTags = async (newTags: EmailTag[], explanation?: string) => {
    if (!editingThread) return

    try {
      await updateTags(editingThread.id, newTags, explanation)
      toast({
        title: "Tags updated",
        description: explanation
          ? "Tags updated with your explanation. Thank you for helping improve our AI!"
          : "Email thread tags have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update tags. Please try again.",
        variant: "destructive",
      })
    }
  }


  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {/* Status Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All ({allThreads.length})
          </Button>
          <Button variant={filter === "open" ? "default" : "outline"} size="sm" onClick={() => setFilter("open")}>
            Open ({allThreads.filter((t) => t.status === "open").length})
          </Button>
          <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")}>
            Pending ({allThreads.filter((t) => t.status === "pending").length})
          </Button>
          <Button variant={filter === "closed" ? "default" : "outline"} size="sm" onClick={() => setFilter("closed")}>
            Closed ({allThreads.filter((t) => t.status === "closed").length})
          </Button>
          <Button
            variant={filter === "modified" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("modified")}
            className={filter === "modified" ? "" : "border-sky-500/50 text-sky-500 hover:bg-sky-500/10"}
          >
            Modified ({state.modifiedThreadIds.size})
          </Button>
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Tags:</span>
          <Button
            variant={filter === "ACTION REQUIRED" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ACTION REQUIRED")}
          >
            Action Required ({allThreads.filter((t) => t.tags.includes("ACTION REQUIRED")).length})
          </Button>
          <Button
            variant={filter === "ACTION NOT REQUIRED" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ACTION NOT REQUIRED")}
          >
            Action Not Required ({allThreads.filter((t) => t.tags.includes("ACTION NOT REQUIRED")).length})
          </Button>
          <Button
            variant={filter === "RESPONDED WITHIN SLA" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("RESPONDED WITHIN SLA")}
          >
            Within SLA ({allThreads.filter((t) => t.tags.includes("RESPONDED WITHIN SLA")).length})
          </Button>
          <Button
            variant={filter === "RESPONDED OUTSIDE SLA" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("RESPONDED OUTSIDE SLA")}
          >
            Outside SLA ({allThreads.filter((t) => t.tags.includes("RESPONDED OUTSIDE SLA")).length})
          </Button>
          <Button
            variant={filter === "ESCALATED" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("ESCALATED")}
          >
            Escalated ({allThreads.filter((t) => t.tags.includes("ESCALATED")).length})
          </Button>
          <Button
            variant={filter === "PENDING" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("PENDING")}
          >
            Pending Tag ({allThreads.filter((t) => t.tags.includes("PENDING")).length})
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredThreads.map((thread) => (
          <EmailThreadItem
            key={thread.id}
            thread={thread}
            onClick={() => handleThreadClick(thread)}
            isSelected={selectedThread === thread.id}
            isModified={state.modifiedThreadIds.has(thread.id)}
            onEditTags={(e) => handleEditTags(e, thread)}
            onTagClick={handleTagClick}
          />
        ))}
      </div>


      <TagEditDialog
        open={!!editingThread}
        onOpenChange={(open) => !open && setEditingThread(null)}
        currentTags={editingThread?.tags || []}
        onSave={handleSaveTags}
        emailSubject={editingThread?.subject || ""}
        threadId={editingThread?.id}
      />

      <EmailFullViewPanel
        thread={fullViewThread}
        open={!!fullViewThread}
        onOpenChange={(open) => !open && setFullViewThread(null)}
      />
    </div>
  )
}
