"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { Clock, Mail } from "lucide-react"
import type { EmailThread, EmailMessage } from "@/lib/types"
import { cn } from "@/lib/utils"

interface EmailFullViewPanelProps {
  thread: EmailThread | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const tagColors: Record<string, string> = {
  "ACTION REQUIRED": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "RESPONDED WITHIN SLA": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "RESPONDED OUTSIDE SLA": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ESCALATED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  PENDING: "bg-red-500/10 text-red-500 border-red-500/20",
  "ACTION NOT REQUIRED": "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

// Timeline message item component
function TimelineMessage({ message, index, isLast }: { message: EmailMessage; index: number; isLast: boolean }) {
  const formatTimestamp = (timestamp: string) => {
    try {
      // Convert "03/10/2025 - 17:39" format to proper date
      const dateStr = timestamp.replace(' - ', ' ')
      const date = new Date(dateStr)
      return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    } catch {
      return timestamp
    }
  }

  return (
    <div className="flex gap-4 relative">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className="w-3 h-3 bg-sky-500 rounded-full border-2 border-background shadow-sm z-10" />
        {!isLast && <div className="w-px bg-border h-full mt-2" />}
      </div>
      
      {/* Message content */}
      <div className="flex-1 pb-6">
        <Card className="p-4 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-sky-500" />
                <span className="font-medium text-sm">{message.sender}</span>
                <Badge variant="outline" className="text-xs">
                  Message {index + 1}
                </Badge>
              </div>
              {message.from && (
                <div className="text-xs text-muted-foreground pl-6">
                  <span className="font-medium">From:</span> {message.from}
                </div>
              )}
              {message.to && (
                <div className="text-xs text-muted-foreground pl-6">
                  <span className="font-medium">To:</span> {message.to}
                </div>
              )}
              {message.cc && (
                <div className="text-xs text-muted-foreground pl-6">
                  <span className="font-medium">Cc:</span> {message.cc}
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground pl-6">
                <Clock className="h-3 w-3" />
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Re: {message.subject}
            </p>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm leading-relaxed break-words">
                {message.content}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export function EmailFullViewPanel({ thread, open, onOpenChange }: EmailFullViewPanelProps) {
  if (!thread) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[600px] md:w-[700px] lg:w-[800px] p-0 flex flex-col overflow-hidden">
        <SheetHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="space-y-3">
            <SheetTitle className="text-2xl pr-8 break-words">{thread.subject}</SheetTitle>
            <div className="flex flex-wrap gap-2">
              {thread.tags.map((tag) => (
                <Badge key={tag} variant="outline" className={cn("text-xs", tagColors[tag])}>
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="break-all max-w-full">
                <span className="font-medium">From:</span> {thread.customer.email}
              </div>
              {thread.customer.company && (
                <div className="break-words">
                  <span className="font-medium">Company:</span> {thread.customer.company}
                </div>
              )}
              <div className="break-words">
                <span className="font-medium">Assigned to:</span> {thread.assignedTo}
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-0">
          <div className="px-6 py-4 pb-8 min-h-full">
            {thread.reasoning && (
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4 break-words mb-6">
                <h3 className="text-base font-semibold mb-2 text-sky-700 dark:text-sky-400">Reasoning</h3>
                <p className="text-sm leading-relaxed text-foreground break-words">{thread.reasoning}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">Message Timeline</h3>
                <Badge variant="secondary" className="text-xs">
                  {thread.messages?.length || 0} messages
                </Badge>
              </div>

              {thread.messages && thread.messages.length > 0 ? (
                <div className="space-y-2">
                  {thread.messages.map((message, index) => (
                    <TimelineMessage
                      key={message.id}
                      message={message}
                      index={index}
                      isLast={index === thread.messages!.length - 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Mail className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p>No messages available for this email thread.</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
