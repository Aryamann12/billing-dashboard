import type { EmailThread, TeamMember, PerformanceMetrics, EmailTag, EmailMessage } from "./types"
import actualMockData from "./new-data.json"

interface ActualDataItem {
  name: string
  month: string
  convID: string
  subject: string
  summary: string
  summary_full: string
  client_name: string
  message_threads: string
  message_threads_len: number
  classification_tags: string
  sla_status: string
  time_delta: string
  reasoning: string
}

function parseClassificationTags(tagString: string): EmailTag[] {
  if (!tagString || tagString === "PENDING") {
    return ["PENDING"]
  }
  const tags = tagString.split(",").map(t => t.trim().toUpperCase())
  const validTags: EmailTag[] = []

  tags.forEach(tag => {
    if (tag === "ACTION REQUIRED" || tag === "RESPONDED WITHIN SLA" ||
        tag === "RESPONDED OUTSIDE SLA" || tag === "ESCALATED" ||
        tag === "PENDING" || tag === "ACTION NOT REQUIRED") {
      validTags.push(tag as EmailTag)
    }
  })

  return validTags.length > 0 ? validTags : ["PENDING"]
}

function extractParticipantInfo(summary: string, timestamp: string): { from?: string; to?: string; cc?: string } {
  try {
    // Find the participant block for this timestamp
    const participantBlockRegex = /\*\*Participants\*\*\s*\*\*Date:\*\*\s*([^\n]+)\s*-\s*From\s*→\s*([^\s]+)\s*-\s*To\s*→\s*([^\s]+)\s*-\s*Cc\s*→\s*([^\n]+)/g
    let match
    while ((match = participantBlockRegex.exec(summary)) !== null) {
      const blockTimestamp = match[1].trim()
      if (blockTimestamp === timestamp) {
        return {
          from: match[2].trim(),
          to: match[3].trim(),
          cc: match[4].trim() === 'N/A' ? undefined : match[4].trim()
        }
      }
    }
  } catch (error) {
    console.error("Failed to extract participant info:", error)
  }
  return {}
}

function parseMessageThreads(messageThreadsString: string, summary: string): EmailMessage[] {
  try {
    if (!messageThreadsString || messageThreadsString.trim() === "") return []
    const messages = JSON.parse(messageThreadsString) as EmailMessage[]
    // Attach participant info to each message
    const enrichedMessages = messages.map(msg => {
      const participantInfo = extractParticipantInfo(summary, msg.timestamp)
      return { ...msg, ...participantInfo }
    })
    // Sort messages by timestamp (newest first)
    return enrichedMessages.sort((a, b) => {
      const timeA = new Date(a.timestamp.replace(' - ', ' '))
      const timeB = new Date(b.timestamp.replace(' - ', ' '))
      return timeB.getTime() - timeA.getTime()
    })
  } catch (error) {
    console.error("Failed to parse message threads:", error)
    return []
  }
}

function extractEmail(summary: string): string {
  const emailMatch = summary.match(/From → ([^\s]+@[^\s]+)/)
  return emailMatch ? emailMatch[1] : "unknown@email.com"
}

function extractMessageCount(summary: string): number {
  const match = summary.match(/\((\d+) messages\)/)
  return match ? parseInt(match[1]) : 1
}

function extractResponseTime(timeDelta: string, slaStatus: string): number | undefined {
  if (timeDelta === "No response yet") return undefined

  const hoursMatch = timeDelta.match(/(\d+\.?\d*)\s*hours?/)
  if (hoursMatch) return parseFloat(hoursMatch[1])

  const daysMatch = timeDelta.match(/(\d+\.?\d*)\s*days?/)
  if (daysMatch) return parseFloat(daysMatch[1]) * 24

  return slaStatus === "breached" ? 25 : 2
}

function determinePriority(slaStatus: string, tags: EmailTag[]): "low" | "medium" | "high" {
  if (slaStatus === "breached" || tags.includes("ESCALATED")) return "high"
  if (tags.includes("ACTION REQUIRED")) return "medium"
  return "low"
}

function determineStatus(tags: EmailTag[], slaStatus: string): "open" | "pending" | "closed" {
  if (tags.includes("PENDING")) return "pending"
  if (tags.includes("RESPONDED WITHIN SLA") || tags.includes("RESPONDED OUTSIDE SLA")) {
    return slaStatus === "breached" ? "open" : "closed"
  }
  if (tags.includes("ACTION REQUIRED") || tags.includes("ESCALATED")) return "open"
  if (tags.includes("ACTION NOT REQUIRED")) return "closed"
  return "pending"
}

function mapActualDataToEmailThread(item: ActualDataItem, index: number): EmailThread {
  const tags = parseClassificationTags(item.classification_tags)
  const slaStatus = item.sla_status === "within" ? "within" :
                    item.sla_status === "breached" ? "breached" : "approaching"
  const messages = parseMessageThreads(item.message_threads, item.summary)

  return {
    id: item.convID || `thread-${index}`,
    subject: item.subject,
    customer: {
      name: item.name || "Unknown",
      email: extractEmail(item.summary),
      company: item.client_name || undefined,
    },
    assignedTo: item.name || "Unassigned",
    tags,
    slaStatus,
    responseTime: extractResponseTime(item.time_delta, item.sla_status),
    lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last 7 days
    messageCount: item.message_threads_len || extractMessageCount(item.summary),
    priority: determinePriority(item.sla_status, tags),
    status: determineStatus(tags, item.sla_status),
    summary: item.summary,
    summaryFull: item.summary_full,
    reasoning: item.reasoning,
    messages,
  }
}

export const mockThreads: EmailThread[] = (actualMockData as ActualDataItem[]).map((item, index) =>
  mapActualDataToEmailThread(item, index)
)

// Generate team members from actual data
function generateTeamMembers(threads: EmailThread[]): TeamMember[] {
  const teamStats = new Map<string, { threads: EmailThread[]; totalResponseTime: number; respondedCount: number }>()

  threads.forEach(thread => {
    const assignee = thread.assignedTo
    if (!teamStats.has(assignee)) {
      teamStats.set(assignee, { threads: [], totalResponseTime: 0, respondedCount: 0 })
    }
    const stats = teamStats.get(assignee)!
    stats.threads.push(thread)
    if (thread.responseTime !== undefined) {
      stats.totalResponseTime += thread.responseTime
      stats.respondedCount++
    }
  })

  return Array.from(teamStats.entries()).map(([name, stats], index) => ({
    id: `${index + 1}`,
    name,
    responseRate: stats.respondedCount > 0 ? Math.round((stats.respondedCount / stats.threads.length) * 100) : 0,
    avgResponseTime: stats.respondedCount > 0 ? Number((stats.totalResponseTime / stats.respondedCount).toFixed(1)) : 0,
    threadsHandled: stats.threads.length,
  }))
}

// Generate performance metrics from actual data
function generateMetrics(threads: EmailThread[]): PerformanceMetrics {
  const withinSLA = threads.filter(t => t.slaStatus === "within").length
  const outsideSLA = threads.filter(t => t.slaStatus === "breached").length
  const totalResponseTime = threads.reduce((sum, t) => sum + (t.responseTime || 0), 0)
  const threadsWithResponse = threads.filter(t => t.responseTime !== undefined).length
  const closedThreads = threads.filter(t => t.status === "closed").length

  return {
    totalThreads: threads.length,
    withinSLA,
    outsideSLA,
    avgResponseTime: threadsWithResponse > 0 ? Number((totalResponseTime / threadsWithResponse).toFixed(1)) : 0,
    resolutionRate: threads.length > 0 ? Math.round((closedThreads / threads.length) * 100) : 0,
  }
}

export const mockTeamMembers: TeamMember[] = generateTeamMembers(mockThreads)
export const mockMetrics: PerformanceMetrics = generateMetrics(mockThreads)
