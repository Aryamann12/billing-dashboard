"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from "react"
import type { EmailThread, EmailTag, TagChange as TagChangeType } from "@/lib/types"
import { mockThreads } from "@/lib/mock-data"

// Use the TagChange interface from types.ts
export type TagChange = TagChangeType & {
  emailThreadId: string  // Kept for backward compatibility, same as threadId
}

interface TagState {
  emailThreads: Record<string, EmailThread>
  tagChanges: TagChange[]
  modifiedThreadIds: Set<string>
  teamMemberFilter: string | null
}

type TagAction =
  | { type: "UPDATE_TAGS"; payload: { threadId: string; newTags: EmailTag[]; explanation?: string } }
  | { type: "LOAD_STATE"; payload: TagState }
  | { type: "RESET_STATE" }
  | { type: "SET_TEAM_MEMBER_FILTER"; payload: string | null }

interface TagContextType {
  state: TagState
  updateTags: (threadId: string, newTags: EmailTag[], explanation?: string) => Promise<void>
  getThread: (threadId: string) => EmailThread | undefined
  getModifiedThreads: () => EmailThread[]
  resetState: () => void
  setTeamMemberFilter: (memberName: string | null) => void
}

const TagContext = createContext<TagContextType | undefined>(undefined)

const initialState: TagState = {
  emailThreads: mockThreads.reduce(
    (acc, thread) => {
      acc[thread.id] = thread
      return acc
    },
    {} as Record<string, EmailThread>,
  ),
  tagChanges: [],
  modifiedThreadIds: new Set(),
  teamMemberFilter: null,
}

function tagReducer(state: TagState, action: TagAction): TagState {
  switch (action.type) {
    case "UPDATE_TAGS": {
      const { threadId, newTags, explanation } = action.payload
      const thread = state.emailThreads[threadId]
      if (!thread) return state

      const oldTags = thread.tags
      const tagChange: TagChange = {
        id: `${threadId}-${Date.now()}`,
        threadId,
        emailThreadId: threadId,  // Kept for backward compatibility
        emailSubject: thread.subject,
        customer: `${thread.customer.name}${thread.customer.company ? ` - ${thread.customer.company}` : ""}`,
        oldTags,
        newTags,
        explanation,
        timestamp: new Date(),
      }

      const newModifiedIds = new Set(state.modifiedThreadIds)
      newModifiedIds.add(threadId)

      // Filter out previous changes for the same email thread
      const filteredTagChanges = state.tagChanges.filter(
        (change) => change.emailThreadId !== threadId
      )

      return {
        ...state,
        emailThreads: {
          ...state.emailThreads,
          [threadId]: { ...thread, tags: newTags },
        },
        tagChanges: [tagChange, ...filteredTagChanges],
        modifiedThreadIds: newModifiedIds,
      }
    }

    case "LOAD_STATE": {
      return {
        ...action.payload,
        modifiedThreadIds: new Set(action.payload.modifiedThreadIds),
      }
    }

    case "RESET_STATE": {
      return initialState
    }

    case "SET_TEAM_MEMBER_FILTER": {
      return {
        ...state,
        teamMemberFilter: action.payload,
      }
    }

    default:
      return state
  }
}

export function TagProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tagReducer, initialState)

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("tag-state")
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        // Convert date strings back to Date objects
        parsed.tagChanges = parsed.tagChanges.map((change: TagChange) => ({
          ...change,
          timestamp: new Date(change.timestamp),
        }))
        // Convert lastActivity dates in email threads
        Object.keys(parsed.emailThreads).forEach((key) => {
          parsed.emailThreads[key].lastActivity = new Date(parsed.emailThreads[key].lastActivity)
        })
        // Always start with no team member filter
        parsed.teamMemberFilter = null
        dispatch({ type: "LOAD_STATE", payload: parsed })
      } catch (error) {
        console.error("Failed to load tag state from localStorage:", error)
      }
    }
  }, [])

  // Save state to localStorage whenever it changes (excluding teamMemberFilter)
  useEffect(() => {
    const stateToSave = {
      emailThreads: state.emailThreads,
      tagChanges: state.tagChanges,
      modifiedThreadIds: Array.from(state.modifiedThreadIds),
      teamMemberFilter: null, // Don't persist this
    }
    localStorage.setItem("tag-state", JSON.stringify(stateToSave))
  }, [state])

  const updateTags = useCallback(async (threadId: string, newTags: EmailTag[], explanation?: string) => {
    const thread = state.emailThreads[threadId]
    if (!thread) return

    // Update local state first (optimistic update)
    dispatch({ type: "UPDATE_TAGS", payload: { threadId, newTags, explanation } })

    // Sync with backend
    try {
      const response = await fetch("/api/tags/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
          emailSubject: thread.subject,
          oldTags: thread.tags,
          newTags,
          explanation,
          timestamp: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        console.error("Failed to sync tag changes with backend")
        throw new Error("Failed to update tags")
      }
    } catch (error) {
      console.error("Error syncing tag changes:", error)
      // Keep local changes even if API fails (offline support)
      throw error
    }
  }, [state.emailThreads])

  const getThread = useCallback((threadId: string) => {
    return state.emailThreads[threadId]
  }, [state.emailThreads])

  const getModifiedThreads = useCallback(() => {
    return Array.from(state.modifiedThreadIds)
      .map((id) => state.emailThreads[id])
      .filter(Boolean)
  }, [state.modifiedThreadIds, state.emailThreads])

  const resetState = useCallback(() => {
    dispatch({ type: "RESET_STATE" })
    localStorage.removeItem("tag-state")
  }, [])

  const setTeamMemberFilter = useCallback((memberName: string | null) => {
    dispatch({ type: "SET_TEAM_MEMBER_FILTER", payload: memberName })
  }, [])

  const value: TagContextType = {
    state,
    updateTags,
    getThread,
    getModifiedThreads,
    resetState,
    setTeamMemberFilter,
  }

  return <TagContext.Provider value={value}>{children}</TagContext.Provider>
}

export function useTagContext() {
  const context = useContext(TagContext)
  if (!context) {
    throw new Error("useTagContext must be used within a TagProvider")
  }
  return context
}