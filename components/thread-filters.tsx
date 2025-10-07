"use client"

import { useState } from "react"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { EmailTag } from "@/lib/types"

const availableTags: EmailTag[] = [
  "ACTION REQUIRED",
  "RESPONDED WITHIN SLA",
  "RESPONDED OUTSIDE SLA",
  "ESCALATED",
  "PENDING",
  "ACTION NOT REQUIRED",
]

export function ThreadFilters() {
  const [selectedTags, setSelectedTags] = useState<EmailTag[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])

  const toggleTag = (tag: EmailTag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleAssignee = (assignee: string) => {
    setSelectedAssignees((prev) => (prev.includes(assignee) ? prev.filter((a) => a !== assignee) : [...prev, assignee]))
  }

  const clearFilters = () => {
    setSelectedTags([])
    setSelectedAssignees([])
  }

  const hasActiveFilters = selectedTags.length > 0 || selectedAssignees.length > 0

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Tags
            {selectedTags.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {selectedTags.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableTags.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag}
              checked={selectedTags.includes(tag)}
              onCheckedChange={() => toggleTag(tag)}
            >
              {tag}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="h-4 w-4" />
            Assignee
            {selectedAssignees.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1">
                {selectedAssignees.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Filter by Assignee</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {["Alex Chen", "Jordan Lee", "Sam Patel"].map((assignee) => (
            <DropdownMenuCheckboxItem
              key={assignee}
              checked={selectedAssignees.includes(assignee)}
              onCheckedChange={() => toggleAssignee(assignee)}
            >
              {assignee}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
