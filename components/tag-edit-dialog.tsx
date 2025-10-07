"use client"

import { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { EmailTag } from "@/lib/types"

const AVAILABLE_TAGS: EmailTag[] = [
  "ACTION REQUIRED",
  "RESPONDED WITHIN SLA",
  "RESPONDED OUTSIDE SLA",
  "ESCALATED",
  "PENDING",
  "ACTION NOT REQUIRED",
]

const tagColors: Record<EmailTag, string> = {
  "ACTION REQUIRED": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "RESPONDED WITHIN SLA": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "RESPONDED OUTSIDE SLA": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  ESCALATED: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  PENDING: "bg-red-500/10 text-red-500 border-red-500/20",
  "ACTION NOT REQUIRED": "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

interface TagEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentTags: EmailTag[]
  onSave: (newTags: EmailTag[], explanation?: string) => Promise<void>
  emailSubject: string
  threadId?: string
}

export function TagEditDialog({ open, onOpenChange, currentTags, onSave, emailSubject, threadId }: TagEditDialogProps) {
  const [selectedTags, setSelectedTags] = useState<EmailTag[]>(currentTags)
  const [explanation, setExplanation] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedTags(currentTags)
      setExplanation("")
      setIsSubmitting(false)
    }
  }, [open, currentTags])

  const toggleTag = (tag: EmailTag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await onSave(selectedTags, explanation.trim() || undefined)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save tags:", error)
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setSelectedTags(currentTags)
    setExplanation("")
    onOpenChange(false)
  }

  // Check if tags have changed
  const tagsChanged = JSON.stringify([...selectedTags].sort()) !== JSON.stringify([...currentTags].sort())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Tags</DialogTitle>
          <DialogDescription className="line-clamp-1">{emailSubject}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Select tags for this email thread:</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag)
                const colorClasses = isSelected ? tagColors[tag] : "bg-muted text-muted-foreground border-muted"
                return (
                  <Badge
                    key={tag}
                    variant="outline"
                    className={cn(
                      "cursor-pointer text-xs transition-all hover:opacity-80",
                      colorClasses
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Explanation field - only show if tags changed */}
          {tagsChanged && (
            <div className="space-y-2 pt-2 border-t">
              <label htmlFor="explanation" className="text-sm font-medium">
                Explanation (Optional)
                <span className="text-muted-foreground ml-1 font-normal">
                  - Help improve AI predictions
                </span>
              </label>
              <Textarea
                id="explanation"
                placeholder="Why are you changing these tags? This helps improve the AI model..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {explanation.length}/500 characters
              </p>
            </div>
          )}

          {selectedTags.length === 0 && (
            <p className="text-sm text-muted-foreground">Select at least one tag for this email thread.</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={selectedTags.length === 0 || isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}