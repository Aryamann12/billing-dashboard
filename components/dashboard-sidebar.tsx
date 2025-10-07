"use client"

import { useState } from "react"
import { LayoutDashboard, Mail, BarChart3, Users, Settings, Tags, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: Mail, label: "Email Threads", href: "/threads" },
  { icon: Tags, label: "Tag Learning", href: "/learning" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Users, label: "Team", href: "/team" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

export function DashboardSidebar() {
  const [activeItem, setActiveItem] = useState("Overview")
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "fixed left-0 top-[4.5rem] z-40 h-[calc(100vh-4.5rem)] border-r border-border bg-card transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
      )}
    >
      <nav className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-foreground">Billing Dashboard</h2>
          )}
          <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <div className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant={activeItem === item.label ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 transition-colors",
                activeItem === item.label && "bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 hover:text-sky-300",
                isCollapsed && "justify-center",
              )}
              onClick={() => setActiveItem(item.label)}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && item.label}
            </Button>
          ))}
        </div>
      </nav>
    </aside>
  )
}
