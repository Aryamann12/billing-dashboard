import { NextRequest, NextResponse } from "next/server"
import { tagChangesStore } from "../update/route"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const emailThreadId = searchParams.get("emailThreadId")

    // Filter by emailThreadId if provided
    const changes = emailThreadId
      ? tagChangesStore.filter((change) => change.emailThreadId === emailThreadId)
      : tagChangesStore

    return NextResponse.json(
      {
        success: true,
        data: changes,
        count: changes.length,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error fetching tag changes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}