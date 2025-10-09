export type EmailTag =
  | "ACTION REQUIRED"
  | "RESPONDED WITHIN SLA"
  | "RESPONDED OUTSIDE SLA"
  | "ESCALATED"
  | "PENDING"
  | "ACTION NOT REQUIRED"

export type SLAStatus = "within" | "approaching" | "breached"

export interface EmailMessage {
  id: number
  sender: string
  from?: string
  to?: string
  cc?: string
  subject: string
  content: string
  timestamp: string
  isOriginal: boolean
  sourceIndexInGroup: number
}

export interface EmailThread {
  id: string
  subject: string
  customer: {
    name: string
    email: string
    company?: string
  }
  assignedTo: string
  tags: EmailTag[]
  slaStatus: SLAStatus
  responseTime?: number // in hours
  lastActivity: Date
  messageCount: number
  priority: "low" | "medium" | "high"
  status: "open" | "pending" | "closed"
  summary?: string
  summaryFull?: string
  reasoning?: string
  messages?: EmailMessage[]
}

export interface TagChange {
  id: string
  threadId: string
  emailSubject: string
  customer: string
  oldTags: EmailTag[]
  newTags: EmailTag[]
  explanation?: string
  timestamp: Date
}

export interface TagUpdatePayload {
  threadId: string
  emailSubject: string
  oldTags: EmailTag[]
  newTags: EmailTag[]
  explanation?: string
  timestamp: string
}

export interface TeamMember {
  id: string
  name: string
  avatar?: string
  responseRate: number
  avgResponseTime: number
  threadsHandled: number
}

export interface PerformanceMetrics {
  totalThreads: number
  withinSLA: number
  outsideSLA: number
  avgResponseTime: number
  resolutionRate: number
}

// Authentication types
export interface User {
  id: string
  email: string
  name: string
  role: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>
  logout: () => Promise<void>
  changePassword: (email: string, currentPassword: string, newPassword: string) => Promise<{success: boolean; message: string}>
  clearError: () => void
}