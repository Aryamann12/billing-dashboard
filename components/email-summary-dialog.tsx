"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Maximize2 } from "lucide-react"
import type { EmailThread } from "@/lib/types"
import { cn } from "@/lib/utils"

interface EmailSummaryDialogProps {
  thread: EmailThread | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewFullDetails?: () => void
}

const tagColors: Record<string, string> = {
  "ACTION REQUIRED": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "RESPONDED WITHIN SLA": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "RESPONDED OUTSIDE SLA": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ESCALATED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  PENDING: "bg-red-500/10 text-red-500 border-red-500/20",
  "ACTION NOT REQUIRED": "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

export function EmailSummaryDialog({ thread, open, onOpenChange, onViewFullDetails }: EmailSummaryDialogProps) {
  if (!thread) return null

  // Format markdown-like content for display
  const formatContent = (content: string) => {
    if (!content) return null
    
    // Split by double newlines for paragraphs
    const sections = content.split('\n\n')
    
    return sections.map((section, idx) => {
      const trimmedSection = section.trim()
      if (!trimmedSection) return null

      // Check if it's a heading (starts with #)
      if (trimmedSection.startsWith('#')) {
        const level = trimmedSection.match(/^#+/)?.[0].length || 1
        const text = trimmedSection.replace(/^#+\s*/, '')
        const HeadingTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements
        const headingClasses = {
          1: "text-2xl font-bold mt-6 mb-4",
          2: "text-xl font-semibold mt-5 mb-3",
          3: "text-lg font-semibold mt-4 mb-2",
          4: "text-base font-semibold mt-3 mb-2",
          5: "text-sm font-semibold mt-2 mb-1",
          6: "text-sm font-semibold mt-2 mb-1"
        }
        return (
          <HeadingTag key={idx} className={headingClasses[level as keyof typeof headingClasses] || headingClasses[6]}>
            {text}
          </HeadingTag>
        )
      }

      // Check if it's a list item
      if (trimmedSection.match(/^[\-\*\+]\s/)) {
        const items = trimmedSection.split('\n').filter(line => line.trim())
        return (
          <ul key={idx} className="list-disc list-inside space-y-1 my-3 ml-2">
            {items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {item.replace(/^[\-\*\+]\s/, '')}
              </li>
            ))}
          </ul>
        )
      }

      // Check if it's a numbered list
      if (trimmedSection.match(/^\d+\.\s/)) {
        const items = trimmedSection.split('\n').filter(line => line.trim())
        return (
          <ol key={idx} className="list-decimal list-inside space-y-1 my-3 ml-2">
            {items.map((item, i) => (
              <li key={i} className="text-sm leading-relaxed">
                {item.replace(/^\d+\.\s/, '')}
              </li>
            ))}
          </ol>
        )
      }

      // Check if it's bold text (surrounded by **)
      const boldText = trimmedSection.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      
      // Regular paragraph
      return (
        <p 
          key={idx} 
          className="text-sm leading-relaxed my-3"
          dangerouslySetInnerHTML={{ __html: boldText }}
        />
      )
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="space-y-3">
            <DialogTitle className="text-2xl pr-8 break-words">{thread.subject}</DialogTitle>
            <div className="flex flex-wrap gap-2">
              {thread.tags.map((tag) => (
                <Badge key={tag} variant="outline" className={cn("text-xs", tagColors[tag])}>
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="break-all max-w-full">
                <span className="font-medium">From:</span> {thread.customer.name} ({thread.customer.email})
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
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-4 space-y-4 w-full max-w-full">
            {thread.reasoning && (
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4 mb-4 break-words">
                <h3 className="text-base font-semibold mb-2 text-sky-700 dark:text-sky-400">Reasoning</h3>
                <p className="text-sm leading-relaxed text-foreground break-words">{thread.reasoning}</p>
              </div>
            )}

            {thread.summary && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                <div className="prose prose-sm max-w-none break-words">
                  {formatContent(thread.summary)}
                </div>
              </div>
            )}

            {!thread.summary && !thread.reasoning && (
              <div className="text-center text-muted-foreground py-8">
                No summary available for this email thread.
              </div>
            )}
          </div>
        </ScrollArea>

        {onViewFullDetails && (
          <div className="px-6 py-3 border-t shrink-0 flex justify-end bg-background">
            <Button onClick={onViewFullDetails} variant="default" className="gap-2">
              <Maximize2 className="h-4 w-4" />
              View Full Details
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

