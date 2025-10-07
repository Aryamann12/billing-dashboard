import { NextRequest, NextResponse } from "next/server"
import type { EmailTag, TagUpdatePayload } from "@/lib/types"

interface UpdateTagsRequest {
  threadId: string
  oldTags: EmailTag[]
  newTags: EmailTag[]
  emailSubject: string
  explanation?: string
  timestamp: string
}

// In-memory storage for tag changes (would be a database in production)
const tagChangesStore: Array<{
  id: string
  threadId: string
  emailSubject: string
  oldTags: EmailTag[]
  newTags: EmailTag[]
  explanation?: string
  timestamp: string
}> = []

export async function POST(request: NextRequest) {
  try {
    const body: UpdateTagsRequest = await request.json()

    // Validate request body
    if (!body.threadId || !body.newTags || !Array.isArray(body.newTags)) {
      return NextResponse.json({ error: "Invalid request body. Missing threadId or newTags." }, { status: 400 })
    }

    // Log the tag change for debugging/ML training
    console.log("Tag Update Received:", {
      threadId: body.threadId,
      emailSubject: body.emailSubject,
      oldTags: body.oldTags,
      newTags: body.newTags,
      explanation: body.explanation,
      timestamp: body.timestamp,
    })

    // Create tag change record
    const tagChange = {
      id: `${body.threadId}-${Date.now()}`,
      threadId: body.threadId,
      emailSubject: body.emailSubject,
      oldTags: body.oldTags,
      newTags: body.newTags,
      explanation: body.explanation,
      timestamp: body.timestamp || new Date().toISOString(),
    }

    // Store the change (in production, this would save to database)
    tagChangesStore.unshift(tagChange)

    // Keep only last 100 changes
    if (tagChangesStore.length > 100) {
      tagChangesStore.length = 100
    }

    // In production, this would also:
    // 1. Save to database
    // 2. Queue for ML model training if explanation provided
    // 3. Send to analytics

    return NextResponse.json(
      {
        success: true,
        message: "Tag update recorded successfully",
        data: tagChange,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error updating tags:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Export the store for use in other API routes
export { tagChangesStore }