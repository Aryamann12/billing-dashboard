"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { mockTeamMembers } from "@/lib/mock-data"

export function TeamStatsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team Member</TableHead>
              <TableHead className="text-right">Threads Handled</TableHead>
              <TableHead className="text-right">Avg Response Time</TableHead>
              <TableHead className="text-right">Response Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTeamMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">{member.threadsHandled}</TableCell>
                <TableCell className="text-right">{member.avgResponseTime}h</TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant={member.responseRate >= 95 ? "default" : "secondary"}
                    className={
                      member.responseRate >= 95 ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : ""
                    }
                  >
                    {member.responseRate}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
