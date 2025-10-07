"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTagContext } from "@/lib/contexts/tag-context"
import { Sparkles } from "lucide-react"

export function ModifiedEmailsPanel() {
  const { state } = useTagContext()

  if (state.tagChanges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-500" />
            Tag Learning History
          </CardTitle>
          <CardDescription>Your tag changes will appear here as you customize email tags</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No tag changes yet. Start editing tags to see them here!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sky-500" />
          Tag Learning History
        </CardTitle>
        <CardDescription>
          Recent tag changes you've made - showing {state.tagChanges.length} modification
          {state.tagChanges.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {state.tagChanges.slice(0, 10).map((change) => (
            <div
              key={change.id}
              className="space-y-2 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-tight">{change.emailSubject}</p>
                    {change.explanation && (
                      <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                        Explained
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{change.customer}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {change.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="shrink-0 text-xs text-muted-foreground">Old:</span>
                  <div className="flex flex-wrap gap-1">
                    {change.oldTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="shrink-0 text-xs text-sky-500">New:</span>
                  <div className="flex flex-wrap gap-1">
                    {change.newTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-sky-500/10 text-sky-500 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Display explanation if provided */}
                {change.explanation && (
                  <div className="mt-2 pt-2 border-t border-border">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 text-xs text-muted-foreground">Note:</span>
                      <p className="text-xs text-foreground italic flex-1 leading-relaxed">
                        "{change.explanation}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {state.tagChanges.length > 10 && (
            <p className="text-center text-xs text-muted-foreground">Showing 10 most recent changes</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}