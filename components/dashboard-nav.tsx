"use client"

import { useState, useEffect } from "react"
import { Bell, Search, Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DashboardNav() {
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [selectedMember, setSelectedMember] = useState<string>("all")

  // Update selected member based on current path
  useEffect(() => {
    if (pathname === "/") {
      setSelectedMember("all")
    } else if (pathname.startsWith("/team/")) {
      const memberName = decodeURIComponent(pathname.replace("/team/", ""))
      setSelectedMember(memberName)
    }
  }, [pathname])

  const handleTeamMemberChange = (value: string) => {
    if (value === "all") {
      router.push("/")
    } else {
      router.push(`/team/${encodeURIComponent(value)}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-[4.5rem] items-center gap-4 px-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-12 w-48">
            <Image
              src="/GEP-white.png"
              alt="GEP Logo"
              width={192}
              height={48}
              className="object-contain dark:hidden"
              priority
              style={{ maxHeight: '48px', maxWidth: '192px' }}
            />
            <Image
              src="/GEP-dark.png"
              alt="GEP Logo"
              width={192}
              height={48}
              className="object-contain hidden dark:block"
              priority
              style={{ maxHeight: '48px', maxWidth: '192px' }}
            />
          </div>
        </div>

        <div className="flex flex-1 items-center gap-4 md:ml-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search threads, customers..." className="pl-9" />
          </div>

          <Select value={selectedMember} onValueChange={handleTeamMemberChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select team member" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Team Members</SelectItem>
              <SelectItem value="Aditya">Aditya</SelectItem>
              <SelectItem value="Sherly">Sherly</SelectItem>
              <SelectItem value="Priti">Priti</SelectItem>
              <SelectItem value="Pinky">Pinky</SelectItem>
              <SelectItem value="Nikhil">Nikhil</SelectItem>
              <SelectItem value="Jackline">Jackline</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuItem>Team Settings</DropdownMenuItem>
              <DropdownMenuItem>Integrations</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
